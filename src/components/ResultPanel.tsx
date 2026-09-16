import { useEffect, useMemo } from 'react';

interface ResultPanelProps {
  blob: Blob;
  fileName: string;
}

export default function ResultPanel({ blob, fileName }: ResultPanelProps) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-brand-300 bg-brand-50 p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-brand-700">Done</p>
        <p className="truncate text-xs text-neutral-500">{fileName}</p>
      </div>
      <a
        href={url}
        download={fileName}
        className="flex-shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
      >
        Download
      </a>
    </div>
  );
}
