import { FFmpegState } from '../hooks/useFFmpeg';

interface StatusBadgeProps {
  ffmpegLoading: boolean;
  ffmpegError: string | null;
}

export default function StatusBadge({ ffmpegLoading, ffmpegError }: StatusBadgeProps) {
  if (ffmpegError) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
        ⚠️ {ffmpegError}
      </div>
    );
  }
  if (ffmpegLoading) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-400">
        ⏳ Loading converter engine... first conversion takes longer
      </div>
    );
  }
  return (
    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400">
      🟢 All processing happens locally in your browser — no files uploaded, no cloud dependencies
    </div>
  );
}
