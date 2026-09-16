import type { FormatOption } from '../types';

export interface ConvertResult {
  blob: Blob;
  name: string;
}

export function outputNameFor(file: File, format: FormatOption): string {
  const base = file.name.replace(/\.[^.]+$/, '');
  return `${base}.${format.extension}`;
}

export function baseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '');
}
