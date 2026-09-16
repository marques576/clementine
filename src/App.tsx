import { useCallback, useEffect, useMemo, useState } from 'react';
import DropZone from './components/DropZone';
import FilePreview from './components/FilePreview';
import FormatSelector from './components/FormatSelector';
import ProgressBar from './components/ProgressBar';
import ResultPanel from './components/ResultPanel';
import EngineStatus from './components/EngineStatus';
import AgentInstructions from './components/AgentInstructions';
import { CATEGORIES } from './types/index';
import { useFFmpegLoader } from './hooks/useFFmpegLoader';
import { useConversion } from './hooks/useConversion';
import { useAppState } from './hooks/useAppState';

// Only these categories need the (heavier) ffmpeg wasm engine.
const ENGINE_CATEGORIES = new Set(['audio', 'video']);

export default function App() {
  const { ffmpeg, loading: engineLoading, error: engineError, load: loadEngine } = useFFmpegLoader();
  const {
    selectedFile,
    selectedFormat,
    outputFormats,
    handleFilesDropped,
    handleFormatSelect,
    reset: resetFile,
  } = useAppState();
  const { state, convert, reset: resetConversion, isFFmpegReady } = useConversion({
    ffmpeg,
    ffmpegLoading: engineLoading,
  });
  const [converting, setConverting] = useState(false);

  const needsEngine = !!selectedFile && ENGINE_CATEGORIES.has(selectedFile.category);
  const engineReady = !needsEngine || isFFmpegReady;

  // Load the wasm engine only when a file that actually needs it is selected.
  useEffect(() => {
    if (needsEngine) void loadEngine();
  }, [needsEngine, loadEngine]);

  // Clear any previous result when the file or target format changes.
  useEffect(() => {
    resetConversion();
  }, [selectedFile?.file, selectedFormat, resetConversion]);

  const handleConvert = useCallback(async () => {
    if (!selectedFile || !selectedFormat || converting || !engineReady) return;
    setConverting(true);
    await convert(selectedFile.file, selectedFormat);
    setConverting(false);
  }, [selectedFile, selectedFormat, converting, engineReady, convert]);

  const handleAnother = useCallback(() => {
    resetConversion();
    resetFile();
  }, [resetConversion, resetFile]);

  const supportText = useMemo(() => {
    const categories = CATEGORIES.map((c) => c.label.toLowerCase()).join(', ');
    const outputs = Array.from(
      new Set(CATEGORIES.flatMap((c) => c.outputFormats.map((f) => f.extension.toUpperCase()))),
    ).join(' · ');
    return `Convert ${categories} — ${outputs}.`;
  }, []);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-neutral-50 text-neutral-900">
      <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-5 py-8">
        {!selectedFile ? (
          <div className="w-full max-w-md text-center">
            <h1 className="text-5xl font-bold tracking-tight text-neutral-900">Clementine</h1>
            <p className="mt-2 text-sm font-medium text-brand-600">100% local conversion</p>

            <div className="mt-8">
              <DropZone onFilesDropped={handleFilesDropped} />
            </div>

            <p className="mt-6 text-xs leading-relaxed text-neutral-500">{supportText}</p>

            <AgentInstructions />
          </div>
        ) : (
          <div className="w-full max-w-lg">
            <div className="mb-5 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Clementine</h1>
              <p className="text-xs font-medium text-brand-600">100% local conversion</p>
            </div>

            <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <FilePreview file={selectedFile.file} />

              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-neutral-500">Convert to</p>
                <FormatSelector
                  formats={outputFormats}
                  selected={selectedFormat}
                  onSelect={handleFormatSelect}
                />
              </div>

              {needsEngine && (
                <EngineStatus
                  loading={engineLoading}
                  error={engineError}
                  ready={isFFmpegReady}
                  onRetry={() => void loadEngine()}
                />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={!selectedFormat || converting || !engineReady || state.status === 'done'}
                  className="flex-1 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                >
                  {converting
                    ? 'Converting…'
                    : needsEngine && !engineReady
                      ? 'Loading engine…'
                      : 'Convert'}
                </button>
                <button
                  type="button"
                  onClick={handleAnother}
                  disabled={converting}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Another file
                </button>
              </div>

              {converting && <ProgressBar progress={state.progress} />}

              {state.status === 'done' && state.outputBlob && state.outputName && (
                <ResultPanel blob={state.outputBlob} fileName={state.outputName} />
              )}

              {state.status === 'error' && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {state.error}
                </div>
              )}
            </div>

            <p className="mt-5 text-center text-xs leading-relaxed text-neutral-400">
              {supportText}
            </p>
          </div>
        )}
      </main>

      <footer className="shrink-0 pb-4 text-center text-[11px] text-neutral-400">
        Your files never leave your device · No uploads · No servers · No tracking
      </footer>
    </div>
  );
}
