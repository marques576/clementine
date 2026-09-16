// ── Supported file types ─────────────────────────────────────────────

export type Category = 'image' | 'audio' | 'video' | 'document' | 'subtitle' | 'archive';

export interface FormatOption {
  extension: string;
  label: string;
  mimeType: string;
}

export interface CategoryConfig {
  category: Category;
  label: string;
  icon: string;
  inputExtensions: string[];
  outputFormats: FormatOption[];
}

export const CATEGORIES: CategoryConfig[] = [
  {
    category: 'image',
    label: 'Images',
    icon: '🖼️',
    inputExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.tiff', '.tif', '.svg', '.bmp', '.avif', '.gif'],
    outputFormats: [
      { extension: 'png', label: 'PNG', mimeType: 'image/png' },
      { extension: 'jpg', label: 'JPEG', mimeType: 'image/jpeg' },
      { extension: 'webp', label: 'WebP', mimeType: 'image/webp' },
      { extension: 'avif', label: 'AVIF', mimeType: 'image/avif' },
      { extension: 'bmp', label: 'BMP', mimeType: 'image/bmp' },
      { extension: 'tiff', label: 'TIFF', mimeType: 'image/tiff' },
      { extension: 'svg', label: 'SVG', mimeType: 'image/svg+xml' },
      { extension: 'gif', label: 'GIF', mimeType: 'image/gif' },
    ],
  },
  {
    category: 'audio',
    label: 'Audio',
    icon: '🎵',
    inputExtensions: ['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.opus', '.aiff', '.wma'],
    outputFormats: [
      { extension: 'mp3', label: 'MP3', mimeType: 'audio/mpeg' },
      { extension: 'm4a', label: 'M4A', mimeType: 'audio/mp4' },
      { extension: 'wav', label: 'WAV', mimeType: 'audio/wav' },
      { extension: 'flac', label: 'FLAC', mimeType: 'audio/flac' },
      { extension: 'ogg', label: 'OGG', mimeType: 'audio/ogg' },
      { extension: 'opus', label: 'Opus', mimeType: 'audio/opus' },
    ],
  },
  {
    category: 'video',
    label: 'Video',
    icon: '🎬',
    inputExtensions: ['.mp4', '.mov', '.mkv', '.webm', '.avi', '.wmv', '.gif'],
    outputFormats: [
      { extension: 'mp4', label: 'MP4', mimeType: 'video/mp4' },
      { extension: 'mov', label: 'MOV', mimeType: 'video/quicktime' },
      { extension: 'mkv', label: 'MKV', mimeType: 'video/x-matroska' },
      { extension: 'webm', label: 'WebM', mimeType: 'video/webm' },
      { extension: 'avi', label: 'AVI', mimeType: 'video/x-msvideo' },
      { extension: 'gif', label: 'GIF', mimeType: 'image/gif' },
      { extension: 'mp3', label: 'MP3 (audio)', mimeType: 'audio/mpeg' },
    ],
  },
  {
    category: 'document',
    label: 'Documents',
    icon: '📄',
    inputExtensions: ['.pdf', '.docx', '.txt'],
    outputFormats: [
      { extension: 'pdf', label: 'PDF', mimeType: 'application/pdf' },
      { extension: 'docx', label: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { extension: 'txt', label: 'TXT', mimeType: 'text/plain' },
      { extension: 'jpg', label: 'PDF→Images', mimeType: 'image/jpeg' },
      { extension: 'png', label: 'PDF→Images PNG', mimeType: 'image/png' },
    ],
  },
  {
    category: 'subtitle',
    label: 'Subtitles',
    icon: '📝',
    inputExtensions: ['.srt', '.vtt', '.txt'],
    outputFormats: [
      { extension: 'srt', label: 'SRT', mimeType: 'text/plain' },
      { extension: 'vtt', label: 'VTT', mimeType: 'text/vtt' },
      { extension: 'txt', label: 'TXT', mimeType: 'text/plain' },
    ],
  },
  {
    category: 'archive',
    label: 'Archives',
    icon: '📦',
    inputExtensions: ['.zip', '.tar', '.gz', '.gzip', '.rar'],
    outputFormats: [
      { extension: 'zip', label: 'ZIP', mimeType: 'application/zip' },
      { extension: 'tar', label: 'TAR', mimeType: 'application/x-tar' },
      { extension: 'gz', label: 'GZIP', mimeType: 'application/gzip' },
    ],
  },
];

export function getCategoryForFile(filename: string): Category | null {
  const ext = '.' + filename.split('.').pop()!.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.inputExtensions.includes(ext)) return cat.category;
  }
  return null;
}

export function getCategoryConfig(category: Category): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.category === category);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
