import { useCallback, useRef, useState } from 'react';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  disabled?: boolean;
}

export default function DropZone({ onFilesDropped, disabled }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

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
    e.target.value = '';
  }, [onFilesDropped]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Open a file"
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPicker();
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-200 ${
        dragOver
          ? 'border-brand-500 bg-brand-50'
          : 'border-neutral-300 bg-white hover:border-neutral-400'
      } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input ref={inputRef} type="file" className="hidden" onChange={handleInputChange} />
      <p className="mb-3 text-xs font-medium text-neutral-500">For humans:</p>
      <div className="mb-2 text-3xl">📂</div>
      <p className="font-medium text-neutral-800">Drop a file here</p>
      <p className="mt-1 text-sm text-neutral-500">or click to browse</p>
    </div>
  );
}
