// ── Supported file types ─────────────────────────────────────────────

export type Category = 'image' | 'audio' | 'video' | 'document' | 'subtitle';

export interface FormatOption {
  extension: string;
  label: string;
  mimeType: string;
}

export interface CategoryConfig {
  category: Category;
  label: string;
  inputExtensions: string[];
  /** Formats advertised for the category (used by the support summary). */
  outputFormats: FormatOption[];
}

export const CATEGORIES: CategoryConfig[] = [
  {
    category: 'image',
    label: 'Images',
    inputExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif'],
    outputFormats: [
      { extension: 'png', label: 'PNG', mimeType: 'image/png' },
      { extension: 'jpg', label: 'JPG', mimeType: 'image/jpeg' },
      { extension: 'webp', label: 'WEBP', mimeType: 'image/webp' },
    ],
  },
  {
    category: 'audio',
    label: 'Audio',
    inputExtensions: ['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.opus', '.aac', '.aiff', '.wma'],
    outputFormats: [
      { extension: 'mp3', label: 'MP3', mimeType: 'audio/mpeg' },
      { extension: 'm4a', label: 'M4A', mimeType: 'audio/mp4' },
      { extension: 'wav', label: 'WAV', mimeType: 'audio/wav' },
      { extension: 'flac', label: 'FLAC', mimeType: 'audio/flac' },
      { extension: 'ogg', label: 'OGG', mimeType: 'audio/ogg' },
      { extension: 'opus', label: 'OPUS', mimeType: 'audio/opus' },
    ],
  },
  {
    category: 'video',
    label: 'Video',
    inputExtensions: ['.mp4', '.mov', '.mkv', '.webm', '.avi', '.wmv'],
    outputFormats: [
      { extension: 'mp4', label: 'MP4', mimeType: 'video/mp4' },
      { extension: 'mov', label: 'MOV', mimeType: 'video/quicktime' },
      { extension: 'mkv', label: 'MKV', mimeType: 'video/x-matroska' },
      { extension: 'webm', label: 'WEBM', mimeType: 'video/webm' },
      { extension: 'gif', label: 'GIF', mimeType: 'image/gif' },
      { extension: 'mp3', label: 'MP3 (audio)', mimeType: 'audio/mpeg' },
    ],
  },
  {
    category: 'document',
    label: 'Documents',
    inputExtensions: ['.pdf', '.docx', '.txt'],
    outputFormats: [
      { extension: 'txt', label: 'TXT', mimeType: 'text/plain' },
      { extension: 'pdf', label: 'PDF', mimeType: 'application/pdf' },
      { extension: 'png', label: 'PNG pages', mimeType: 'image/png' },
      { extension: 'jpg', label: 'JPG pages', mimeType: 'image/jpeg' },
    ],
  },
  {
    category: 'subtitle',
    label: 'Subtitles',
    inputExtensions: ['.srt', '.vtt'],
    outputFormats: [
      { extension: 'srt', label: 'SRT', mimeType: 'text/plain' },
      { extension: 'vtt', label: 'VTT', mimeType: 'text/vtt' },
      { extension: 'txt', label: 'TXT', mimeType: 'text/plain' },
    ],
  },
];

// ── Format definitions ───────────────────────────────────────────────

const PNG: FormatOption = { extension: 'png', label: 'PNG', mimeType: 'image/png' };
const JPG: FormatOption = { extension: 'jpg', label: 'JPG', mimeType: 'image/jpeg' };
const WEBP: FormatOption = { extension: 'webp', label: 'WEBP', mimeType: 'image/webp' };
const TXT: FormatOption = { extension: 'txt', label: 'TXT', mimeType: 'text/plain' };
const PDF: FormatOption = { extension: 'pdf', label: 'PDF', mimeType: 'application/pdf' };
const SRT: FormatOption = { extension: 'srt', label: 'SRT', mimeType: 'text/plain' };
const VTT: FormatOption = { extension: 'vtt', label: 'VTT', mimeType: 'text/vtt' };
const MP3: FormatOption = { extension: 'mp3', label: 'MP3', mimeType: 'audio/mpeg' };
const M4A: FormatOption = { extension: 'm4a', label: 'M4A', mimeType: 'audio/mp4' };
const WAV: FormatOption = { extension: 'wav', label: 'WAV', mimeType: 'audio/wav' };
const FLAC: FormatOption = { extension: 'flac', label: 'FLAC', mimeType: 'audio/flac' };
const OGG: FormatOption = { extension: 'ogg', label: 'OGG', mimeType: 'audio/ogg' };
const OPUS: FormatOption = { extension: 'opus', label: 'OPUS', mimeType: 'audio/opus' };
const MP4: FormatOption = { extension: 'mp4', label: 'MP4', mimeType: 'video/mp4' };
const MOV: FormatOption = { extension: 'mov', label: 'MOV', mimeType: 'video/quicktime' };
const MKV: FormatOption = { extension: 'mkv', label: 'MKV', mimeType: 'video/x-matroska' };
const WEBM: FormatOption = { extension: 'webm', label: 'WEBM', mimeType: 'video/webm' };
const GIF: FormatOption = { extension: 'gif', label: 'GIF', mimeType: 'image/gif' };

const FORMATS_BY_EXTENSION: Record<string, FormatOption[]> = {
  '.jpg': [PNG, JPG, WEBP],
  '.jpeg': [PNG, JPG, WEBP],
  '.png': [PNG, JPG, WEBP],
  '.webp': [PNG, JPG, WEBP],
  '.gif': [PNG, JPG, WEBP],
  '.bmp': [PNG, JPG, WEBP],
  '.avif': [PNG, JPG, WEBP],

  '.mp3': [MP3, M4A, WAV, FLAC, OGG, OPUS],
  '.m4a': [MP3, M4A, WAV, FLAC, OGG, OPUS],
  '.wav': [MP3, M4A, WAV, FLAC, OGG, OPUS],
  '.flac': [MP3, M4A, WAV, FLAC, OGG, OPUS],
  '.ogg': [MP3, M4A, WAV, FLAC, OGG, OPUS],
  '.opus': [MP3, M4A, WAV, FLAC, OGG, OPUS],
  '.aac': [MP3, M4A, WAV, FLAC, OGG, OPUS],
  '.aiff': [MP3, M4A, WAV, FLAC, OGG, OPUS],
  '.wma': [MP3, M4A, WAV, FLAC, OGG, OPUS],

  '.mp4': [MP4, MOV, MKV, WEBM, GIF, MP3],
  '.mov': [MP4, MOV, MKV, WEBM, GIF, MP3],
  '.mkv': [MP4, MOV, MKV, WEBM, GIF, MP3],
  '.webm': [MP4, MOV, MKV, WEBM, GIF, MP3],
  '.avi': [MP4, MOV, MKV, WEBM, GIF, MP3],
  '.wmv': [MP4, MOV, MKV, WEBM, GIF, MP3],

  '.pdf': [TXT, PNG, JPG],
  '.docx': [TXT],
  '.txt': [TXT, PDF],

  '.srt': [SRT, VTT, TXT],
  '.vtt': [SRT, VTT, TXT],
};

export function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts.pop()!.toLowerCase() : '';
}

export function getCategoryForFile(filename: string): Category | null {
  const ext = getExtension(filename);
  for (const cat of CATEGORIES) {
    if (cat.inputExtensions.includes(ext)) return cat.category;
  }
  return null;
}

export function getCategoryConfig(category: Category): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.category === category);
}

/** The exact set of output formats that actually work for a given file. */
export function getOutputFormats(filename: string): FormatOption[] {
  return FORMATS_BY_EXTENSION[getExtension(filename)] ?? [];
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
