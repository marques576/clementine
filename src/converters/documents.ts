import JSZip from 'jszip';
import type { FormatOption } from '../types';
import { getExtension } from '../types';
import { baseName, outputNameFor, type ConvertResult } from './shared';

// ── PDF ───────────────────────────────────────────────────────────────

async function convertPdf(
  file: File,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<ConvertResult> {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const total = pdf.numPages;

  if (format.extension === 'txt') {
    let out = '';
    for (let i = 1; i <= total; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      out += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n\n';
      onProgress(Math.round((i / total) * 100));
    }
    return { blob: new Blob([out], { type: 'text/plain' }), name: outputNameFor(file, format) };
  }

  const images: { name: string; blob: Blob }[] = [];
  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported in this browser');

    await page.render({ canvasContext: ctx, viewport }).promise;

    const mime = format.extension === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Could not render this PDF page'))),
        mime,
        0.92,
      );
    });

    images.push({ name: `${baseName(file.name)}-${i}.${format.extension}`, blob });
    onProgress(Math.round((i / total) * 100));
  }

  if (images.length === 1) {
    return { blob: images[0].blob, name: `${baseName(file.name)}.${format.extension}` };
  }

  const zip = new JSZip();
  images.forEach((image) => zip.file(image.name, image.blob));
  const blob = await zip.generateAsync({ type: 'blob' });
  return { blob, name: `${baseName(file.name)}-${format.extension}.zip` };
}

// ── DOCX ──────────────────────────────────────────────────────────────

async function convertDocx(
  file: File,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<ConvertResult> {
  if (format.extension !== 'txt') {
    throw new Error('DOCX files can currently only be converted to TXT');
  }

  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const documentXml = zip.file('word/document.xml');
  if (!documentXml) throw new Error('This DOCX file could not be read');

  const xml = await documentXml.async('string');
  const text = xml
    .replace(/<w:tab[^>]*\/>/g, '\t')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

  onProgress(100);
  return { blob: new Blob([text], { type: 'text/plain' }), name: outputNameFor(file, format) };
}

// ── TXT ───────────────────────────────────────────────────────────────

function escapePdfText(value: string): string {
  return value
    .replace(/[\\()]/g, (match) => `\\${match}`)
    .replace(/[^\x20-\x7E]/g, '?');
}

/** Tiny dependency-free TXT → PDF writer (Helvetica, wrapped lines, page breaks). */
function textToPdf(text: string): Blob {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 54;
  const fontSize = 11;
  const leading = 16;
  const maxChars = Math.floor((pageWidth - margin * 2) / (fontSize * 0.52));

  const wrapped: string[] = [];
  for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
    const clean = raw.replace(/\t/g, '    ');
    if (clean.length <= maxChars) {
      wrapped.push(clean);
      continue;
    }
    let rest = clean;
    while (rest.length > maxChars) {
      let cut = rest.lastIndexOf(' ', maxChars);
      if (cut <= 0) cut = maxChars;
      wrapped.push(rest.slice(0, cut));
      rest = rest.slice(cut).trimStart();
    }
    wrapped.push(rest);
  }

  const linesPerPage = Math.floor((pageHeight - margin * 2) / leading);
  const pages: string[][] = [];
  for (let i = 0; i < wrapped.length; i += linesPerPage) {
    pages.push(wrapped.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) pages.push(['']);

  const pageCount = pages.length;
  const fontObjNum = 3 + pageCount * 2;
  const objects: string[] = [];

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(' ')}] /Count ${pageCount} >>`;

  pages.forEach((pageLines, i) => {
    const pageNum = 3 + i * 2;
    const contentNum = pageNum + 1;
    objects[pageNum] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentNum} 0 R >>`;

    let stream = `BT\n/F1 ${fontSize} Tf\n${leading} TL\n${margin} ${pageHeight - margin} Td\n`;
    for (const line of pageLines) {
      stream += `(${escapePdfText(line)}) Tj\nT*\n`;
    }
    stream += 'ET';
    objects[contentNum] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  objects[fontObjNum] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let n = 1; n <= fontObjNum; n++) {
    offsets[n] = pdf.length;
    pdf += `${n} 0 obj\n${objects[n]}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${fontObjNum + 1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= fontObjNum; n++) {
    pdf += `${String(offsets[n]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${fontObjNum + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

async function convertTxt(
  file: File,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<ConvertResult> {
  const text = await file.text();
  onProgress(100);
  if (format.extension === 'pdf') {
    return { blob: textToPdf(text), name: outputNameFor(file, format) };
  }
  return { blob: new Blob([text], { type: 'text/plain' }), name: outputNameFor(file, format) };
}

// ── Dispatcher ────────────────────────────────────────────────────────

export async function convertDocument(
  file: File,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<ConvertResult> {
  const ext = getExtension(file.name);
  if (ext === '.pdf') return convertPdf(file, format, onProgress);
  if (ext === '.docx') return convertDocx(file, format, onProgress);
  if (ext === '.txt') return convertTxt(file, format, onProgress);
  throw new Error(`Unsupported document type: ${ext || 'unknown'}`);
}
