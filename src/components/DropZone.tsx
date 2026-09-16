import { useCallback, useRef, useState } from 'react';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  disabled?: boolean;
}

export default function DropZone({ onFilesDropped, disabled }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFilesDropped(files);
  }, [disabled, onFilesDropped]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFilesDropped(files);
  }, [onFilesDropped]);

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer
        transition-all duration-300 min-h-[300px] flex flex-col items-center justify-center
        ${dragOver
          ? 'border-brand-400 bg-brand-400/10 scale-[1.02]'
          : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
      <div className="text-6xl mb-6">📂</div>
      <h3 className="text-xl font-semibold text-gray-200 mb-2">
        Drag & drop files here
      </h3>
      <p className="text-gray-400 max-w-md">
        or click to browse. Everything is processed locally in your browser — nothing leaves your device.
      </p>
      {disabled && (
        <p className="text-brand-400 mt-4 text-sm">Processing...</p>
      )}
    </div>
  );
}
