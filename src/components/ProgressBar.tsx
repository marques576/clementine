interface ProgressBarProps {
  progress: number; // 0-100
  status?: string;
}

export default function ProgressBar({ progress, status }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>{status || 'Converting...'}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}
