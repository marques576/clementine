import type { Category, FormatOption } from '../types';

export function getOutputFileName(inputName: string, format: FormatOption): string {
  const base = inputName.replace(/\.[^.]+$/, '');
  return `${base}.${format.extension}`;
}

export function labelForCategory(category: Category): string {
  const map: Record<Category, string> = {
    image: 'Image',
    audio: 'Audio',
    video: 'Video',
    document: 'Document',
    subtitle: 'Subtitle',
    archive: 'Archive',
  };
  return map[category];
}
