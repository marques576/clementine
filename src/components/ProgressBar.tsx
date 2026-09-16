interface ProgressBarProps {
  progress: number; // 0-100
  status?: string;
}

export default function ProgressBar({ progress, status }: ProgressBarProps) {
  const value = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <div className="w-full">
      <div className="mb-1.5 flex justify-between text-xs text-neutral-500">
        <span>{status || 'Converting…'}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
