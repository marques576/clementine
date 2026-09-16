export function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts.pop()!.toLowerCase() : '';
}

export function isImageFile(filename: string): boolean {
  const ext = getExtension(filename);
  return ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.tiff', '.tif', '.svg', '.bmp', '.avif', '.gif'].includes(ext);
}

export function isAudioFile(filename: string): boolean {
  const ext = getExtension(filename);
  return ['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.opus', '.aiff', '.wma'].includes(ext);
}

export function isVideoFile(filename: string): boolean {
  const ext = getExtension(filename);
  return ['.mp4', '.mov', '.mkv', '.webm', '.avi', '.wmv', '.gif'].includes(ext);
}
