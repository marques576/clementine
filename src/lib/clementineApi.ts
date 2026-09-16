import { CATEGORIES, getCategoryForFile, getOutputFormats } from '../types';
import { getFFmpeg, loadFFmpeg } from './ffmpegEngine';
import { convertFile, resolveFormat } from './convertFile';

/**
 * Scripting API exposed on `window.clementine`.
 *
 * The UI is unchanged; this is an additional, stable entry point so agents and
 * power users can convert files without clicking DOM elements. Everything still
 * runs client-side.
 */
const API_VERSION = '1.0.0';

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
  avif: 'image/avif',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  flac: 'audio/flac',
  ogg: 'audio/ogg',
  opus: 'audio/opus',
  aac: 'audio/aac',
  aiff: 'audio/aiff',
  wma: 'audio/x-ms-wma',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  webm: 'video/webm',
  avi: 'video/x-msvideo',
  wmv: 'video/x-ms-wmv',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  srt: 'text/plain',
  vtt: 'text/vtt',
};

export interface ConvertedFile {
  name: string;
  mimeType: string;
  size: number;
  blob: Blob;
}

export interface ConvertedBase64 {
  name: string;
  mimeType: string;
  size: number;
  base64: string;
}

function guessMimeType(fileName: string): string {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  return MIME_BY_EXTENSION[ext] ?? 'application/octet-stream';
}

function base64ToBlob(base64: string, type: string): Blob {
  const payload = base64.includes(',') ? base64.slice(base64.indexOf(',') + 1) : base64;
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the converted file'));
    reader.readAsDataURL(blob);
  });
}

async function blobToBase64(blob: Blob): Promise<string> {
  const dataUrl = await blobToDataUrl(blob);
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

function fileFromBase64(base64: string, name: string): File {
  const type = guessMimeType(name);
  return new File([base64ToBlob(base64, type)], name, { type });
}

async function run(
  file: File,
  format: string,
  onProgress?: (progress: number) => void,
): Promise<ConvertedFile> {
  const target = resolveFormat(file.name, format);
  const result = await convertFile(file, target, onProgress ?? (() => {}));
  return {
    name: result.name,
    mimeType: result.blob.type || target.mimeType,
    size: result.blob.size,
    blob: result.blob,
  };
}

const api = {
  version: API_VERSION,

  /** Every supported category and its input/output formats. */
  categories: () =>
    CATEGORIES.map((category) => ({
      category: category.category,
      label: category.label,
      input: category.inputExtensions,
      output: category.outputFormats.map((format) => format.extension),
    })),

  /** The output formats that are valid for a given file name. */
  formats: (fileName: string) =>
    getOutputFormats(fileName).map((format) => ({
      extension: format.extension,
      label: format.label,
    })),

  /** The detected category for a file name, or null if unsupported. */
  categoryOf: (fileName: string) => getCategoryForFile(fileName),

  /** Whether the audio/video engine is already loaded. */
  engineReady: () => !!getFFmpeg(),

  /** Preload the audio/video engine. Optional; conversions load it on demand. */
  warmup: async () => {
    await loadFFmpeg();
    return true;
  },

  /** Convert an in-page File and get the resulting Blob. */
  convert: (file: File, format: string, onProgress?: (progress: number) => void) =>
    run(file, format, onProgress),

  /** Convert an in-page File and return a data URL. */
  convertToDataUrl: async (file: File, format: string, onProgress?: (progress: number) => void) => {
    const result = await run(file, format, onProgress);
    return {
      name: result.name,
      mimeType: result.mimeType,
      size: result.size,
      dataUrl: await blobToDataUrl(result.blob),
    };
  },

  /**
   * Base64 in, base64 out. Designed for headless-browser automation where the
   * caller (e.g. Playwright `page.evaluate`) cannot pass a File or receive a Blob.
   */
  convertBase64: async (
    input: { base64: string; name: string; format?: string },
    onProgress?: (progress: number) => void,
  ): Promise<ConvertedBase64> => {
    const name = input.name || 'input';
    const format = input.format || getOutputFormats(name)[0]?.extension;
    if (!format) throw new Error(`No conversion is available for "${name}"`);

    const result = await run(fileFromBase64(input.base64, name), format, onProgress);
    return {
      name: result.name,
      mimeType: result.mimeType,
      size: result.size,
      base64: await blobToBase64(result.blob),
    };
  },
};

export type ClementineApi = typeof api;

declare global {
  interface Window {
    clementine: ClementineApi;
  }
}

export function installClementineApi(): ClementineApi {
  if (typeof window !== 'undefined') {
    window.clementine = api;
  }
  return api;
}
