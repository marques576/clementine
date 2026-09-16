interface EngineStatusProps {
  loading: boolean;
  error: string | null;
  ready: boolean;
  onRetry: () => void;
}

export default function EngineStatus({ loading, error, ready, onRetry }: EngineStatusProps) {
  if (error) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
        <span>Conversion engine failed to load.</span>
        <button type="button" onClick={onRetry} className="underline hover:text-red-700">
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
        Loading conversion engine…
      </div>
    );
  }

  if (ready) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
        Engine ready
      </div>
    );
  }

  return null;
}
