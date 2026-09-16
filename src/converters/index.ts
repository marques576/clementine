import type { FormatOption } from '../types';
import type { ConversionState } from '../hooks/useFileConverter';

export async function convertImage(
  file: File,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; name: string }> {
  const img = new Image();
  const objectUrl = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = objectUrl;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  let mimeType = format.mimeType;
  if (format.extension === 'jpg' || format.extension === 'jpeg') {
    mimeType = 'image/jpeg';
  }

  const quality = 0.92;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
      mimeType,
      quality,
    );
  });

  URL.revokeObjectURL(objectUrl);
  onProgress(100);

  const base = file.name.replace(/\.[^.]+$/, '');
  return { blob, name: `${base}.${format.extension}` };
}

export async function convertAudio(
  file: File,
  ffmpeg: any,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; name: string }> {
  if (!ffmpeg) throw new Error('FFmpeg not loaded');

  const inputName = 'input' + (file.name.includes('.') ? '.' + file.name.split('.').pop() : '');
  const outputName = 'output.' + format.extension;

  await ffmpeg.writeFile(inputName, await file.arrayBuffer());

  await ffmpeg.exec([
    '-i', inputName,
    '-y',
    '-progress', 'pipe:1',
    outputName,
  ]);

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data], { type: format.mimeType });
  const base = file.name.replace(/\.[^.]+$/, '');

  onProgress(100);
  return { blob, name: `${base}.${format.extension}` };
}

export async function convertVideo(
  file: File,
  ffmpeg: any,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; name: string }> {
  if (!ffmpeg) throw new Error('FFmpeg not loaded');

  const ext = file.name.split('.').pop() || 'mp4';
  const inputName = 'input.' + ext;
  const outputName = 'output.' + format.extension;

  await ffmpeg.writeFile(inputName, await file.arrayBuffer());

  const args = ['-i', inputName, '-y'];

  if (format.extension === 'mp3') {
    args.push('-vn', '-q:a', '2', outputName);
  } else if (format.extension === 'gif') {
    args.push('-vf', 'fps=10,scale=480:-1', '-loop', '0', outputName);
  } else {
    args.push('-c:v', 'libx264', '-c:a', 'aac', outputName);
  }

  args.push(outputName);

  await ffmpeg.exec(args);

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data], { type: format.mimeType });
  const base = file.name.replace(/\.[^.]+$/, '');

  onProgress(100);
  return { blob, name: `${base}.${format.extension}` };
}

export async function convertDocument(
  file: File,
  ffmpeg: any,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; name: string }> {
  if (!ffmpeg) throw new Error('FFmpeg not loaded');

  const ext = file.name.split('.').pop() || 'pdf';
  const inputName = 'input.' + ext;
  const outputName = 'output.' + format.extension;

  await ffmpeg.writeFile(inputName, await file.arrayBuffer());

  if (format.extension === 'txt') {
    await ffmpeg.exec(['-i', inputName, '-f', 'rawvideo', outputName]);
  } else if (format.extension === 'jpg' || format.extension === 'png') {
    await ffmpeg.exec(['-i', inputName, '-f', 'image2', outputName]);
  } else {
    await ffmpeg.exec(['-i', inputName, '-y', outputName]);
  }

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data], { type: format.mimeType });
  const base = file.name.replace(/\.[^.]+$/, '');

  onProgress(100);
  return { blob, name: `${base}.${format.extension}` };
}

export async function convertSubtitle(
  file: File,
  ffmpeg: any,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; name: string }> {
  if (!ffmpeg) throw new Error('FFmpeg not loaded');

  const ext = file.name.split('.').pop() || 'srt';
  const inputName = 'input.' + ext;
  const outputName = 'output.' + format.extension;

  await ffmpeg.writeFile(inputName, await file.arrayBuffer());
  await ffmpeg.exec(['-i', inputName, '-y', outputName]);

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data], { type: 'text/plain' });
  const base = file.name.replace(/\.[^.]+$/, '');

  onProgress(100);
  return { blob, name: `${base}.${format.extension}` };
}

export async function convertArchive(
  file: File,
  ffmpeg: any,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; name: string }> {
  if (!ffmpeg) throw new Error('FFmpeg not loaded');

  const ext = file.name.split('.').pop() || 'zip';
  const inputName = 'input.' + ext;
  const outputName = 'output.' + format.extension;

  await ffmpeg.writeFile(inputName, await file.arrayBuffer());

  await ffmpeg.exec(['-i', inputName, '-y', outputName]);

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data], { type: format.mimeType });
  const base = file.name.replace(/\.[^.]+$/, '');

  onProgress(100);
  return { blob, name: `${base}.${format.extension}` };
}

export async function convertViaCanvas(
  file: File,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; name: string }> {
  // Fallback for image formats that Canvas supports natively
  return convertImage(file, format, onProgress);
}
