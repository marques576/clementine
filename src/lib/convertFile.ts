import {
  convertAudio,
  convertDocument,
  convertImage,
  convertSubtitle,
  convertVideo,
  type ConvertResult,
} from '../converters';
import { getCategoryForFile, getOutputFormats, type FormatOption } from '../types';
import { loadFFmpeg } from './ffmpegEngine';

/**
 * Resolve a user-supplied output format (e.g. "png" or ".PNG") to the exact
 * FormatOption that is valid for the given file. Throws a helpful error if the
 * conversion is not supported.
 */
export function resolveFormat(fileName: string, format: string): FormatOption {
  const wanted = format.replace(/^\./, '').toLowerCase();
  const formats = getOutputFormats(fileName);
  const match = formats.find((f) => f.extension === wanted);
  if (match) return match;

  const available = formats.map((f) => f.extension).join(', ') || 'none';
  throw new Error(`Cannot convert "${fileName}" to .${wanted}. Available formats: ${available}`);
}

/**
 * Convert a file with no React / DOM-UI dependency. Used by both the UI hook and
 * the `window.clementine` scripting API.
 */
export async function convertFile(
  file: File,
  format: FormatOption,
  onProgress: (progress: number) => void = () => {},
): Promise<ConvertResult> {
  const category = getCategoryForFile(file.name);

  switch (category) {
    case 'image':
      return convertImage(file, format, onProgress);
    case 'audio':
      return convertAudio(file, await loadFFmpeg(), format, onProgress);
    case 'video':
      return convertVideo(file, await loadFFmpeg(), format, onProgress);
    case 'document':
      return convertDocument(file, format, onProgress);
    case 'subtitle':
      return convertSubtitle(file, format, onProgress);
    default:
      throw new Error(`This file type is not supported: ${file.name}`);
  }
}
