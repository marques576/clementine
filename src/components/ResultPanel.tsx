import { useRef } from 'react';

interface ResultPanelProps {
  blob: Blob;
  fileName: string;
}

export default function ResultPanel({ blob, fileName }: ResultPanelProps) {
  const url = useRef(URL.createObjectURL(blob)).current;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-brand-500/30">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">✅</span>
        <div>
          <h3 className="font-semibold text-gray-200">Conversion complete</h3>
          <p className="text-sm text-gray-400">{fileName}</p>
        </div>
      </div>
      <a
        href={url}
        download={fileName}
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors"
      >
        <span>⬇️</span>
        Download file
      </a>
      <p className="text-xs text-gray-600 mt-3">
        Processed entirely in your browser. No files were uploaded.
      </p>
    </div>
  );
}
