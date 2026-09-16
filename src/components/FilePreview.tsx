import { getExtension, isImageFile } from '../utils/file';

interface FilePreviewProps {
  file: File;
}

export default function FilePreview({ file }: FilePreviewProps) {
  const ext = getExtension(file.name);
  const isImage = isImageFile(file.name);

  return (
    <div className="flex items-center gap-4 bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="w-14 h-14 rounded-lg bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
        {isImage ? (
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>
            {ext === '.pdf' ? '📕' : ext === '.docx' ? '📝' : ext === '.mp3' || ext === '.wav' || ext === '.flac' ? '🎵' : ext === '.mp4' || ext === '.mov' ? '🎬' : ext === '.zip' || ext === '.rar' ? '📦' : ext === '.srt' || ext === '.vtt' ? '📝' : '📄'}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-gray-200 truncate">{file.name}</p>
        <p className="text-sm text-gray-500">
          {ext} · {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    </div>
  );
}
