import { useEffect, useMemo } from 'react';
import { getExtension } from '../types';

interface FilePreviewProps {
  file: File;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif'];

function iconFor(ext: string): string {
  if (['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.opus', '.aac', '.aiff', '.wma'].includes(ext)) return '🎵';
  if (['.mp4', '.mov', '.mkv', '.webm', '.avi', '.wmv'].includes(ext)) return '🎬';
  if (ext === '.pdf') return '📕';
  if (ext === '.docx') return '📝';
  if (ext === '.srt' || ext === '.vtt') return '💬';
  return '📄';
}

export default function FilePreview({ file }: FilePreviewProps) {
  const ext = getExtension(file.name);
  const isImage = IMAGE_EXTENSIONS.includes(ext);
  const previewUrl = useMemo(
    () => (isImage ? URL.createObjectURL(file) : null),
    [file, isImage],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const size = file.size < 1024 * 1024
    ? `${(file.size / 1024).toFixed(0)} KB`
    : `${(file.size / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-200 text-xl">
        {previewUrl ? (
          <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
        ) : (
          <span>{iconFor(ext)}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-800">{file.name}</p>
        <p className="text-xs text-neutral-500">{ext.slice(1).toUpperCase()} · {size}</p>
      </div>
    </div>
  );
}
