import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DropZone from './components/DropZone';
import FilePreview from './components/FilePreview';
import FormatSelector from './components/FormatSelector';
import ProgressBar from './components/ProgressBar';
import ResultPanel from './components/ResultPanel';
import CategoryTabs from './components/CategoryTabs';
import StatusBadge from './components/StatusBadge';
import ConversionOptionsHero from './components/ConversionOptionsHero';
import { CATEGORIES, type Category, type FormatOption } from './types/index';
import { useFFmpegLoader } from './hooks/useFFmpegLoader';
import { useConversion } from './hooks/useConversion';
import { useAppState } from './hooks/useAppState';

export default function App() {
  const { ffmpeg, loading: ffmpegLoading, error: ffmpegError, load: loadFFmpeg } = useFFmpegLoader();
  const { selectedFile, selectedFormat, activeCategoryTab, setActiveCategoryTab, handleFilesDropped, handleFormatSelect } = useAppState();
  const [converting, setConverting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { state: convState, convert, reset, isFFmpegReady } = useConversion({ ffmpeg, ffmpegLoading });

  // Auto-load FFmpeg on mount
  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  const categoryConfig = useMemo(() => {
    if (!selectedFile) return null;
    return CATEGORIES.find((c) => c.category === selectedFile.category);
  }, [selectedFile]);

  const availableFormats = categoryConfig?.outputFormats || [];

  // When file changes, auto-select first available format
  useEffect(() => {
    if (selectedFile && !selectedFormat && availableFormats.length > 0) {
      handleFormatSelect(availableFormats[0]);
    }
  }, [selectedFile, availableFormats]);

  const handleConvert = useCallback(async () => {
    if (!selectedFile || !selectedFormat || converting) return;
    setConverting(true);
    setShowSuccess(false);
    await convert(selectedFile.file, selectedFormat);
    setConverting(false);
  }, [selectedFile, selectedFormat, converting, convert]);

  // Show success when conversion completes
  useEffect(() => {
    if (convState.status === 'done') {
      setShowSuccess(true);
    }
  }, [convState.status]);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Clementine
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            The zero-click, offline file converter. Everything happens <span className="text-brand-400 font-medium">locally in your browser</span>. No uploads, no cloud, no compromises.
          </p>
        </div>

        {/* Drop Zone */}
        {!selectedFile && (
          <DropZone onFilesDropped={handleFilesDropped} disabled={converting} />
        )}

        {/* File Selected */}
        {selectedFile && categoryConfig && (
          <div className="space-y-6">
            {/* Category tabs */}
            <CategoryTabs
              categories={CATEGORIES}
              selectedCategory={activeCategoryTab}
              onSelect={setActiveCategoryTab}
            />

            {/* File Preview + Format Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Input file</h3>
                <FilePreview file={selectedFile.file} />
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Convert to ({categoryConfig.label})</h3>
                <FormatSelector
                  formats={availableFormats}
                  selected={selectedFormat}
                  onSelect={handleFormatSelect}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleConvert}
                disabled={!selectedFormat || converting || !isFFmpegReady}
                className="px-8 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all duration-200 text-lg"
              >
                {converting ? '⏳ Converting...' : !isFFmpegReady ? '⏳ Loading engine...' : '🔄 Convert'}
              </button>
              <button
                onClick={() => { reset(); setShowSuccess(false); }}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors"
              >
                🗑️ Reset
              </button>
            </div>

            {/* Progress */}
            {converting && (
              <div className="pt-4">
                <ProgressBar progress={convState.progress} status="Converting..." />
              </div>
            )}

            {/* Error */}
            {convState.status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400">❌ {convState.error}</p>
                <button
                  onClick={reset}
                  className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Result */}
            {convState.status === 'done' && convState.outputBlob && convState.outputName && showSuccess && (
              <div className="pt-4">
                <ResultPanel blob={convState.outputBlob} fileName={convState.outputName} />
              </div>
            )}
          </div>
        )}

        {/* Privacy status */}
        <div className="mt-12 max-w-lg mx-auto">
          <StatusBadge ffmpegLoading={ffmpegLoading} ffmpegError={ffmpegError} />
        </div>

        {/* Supported formats grid */}
        <ConversionOptionsHero />

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-gray-900 text-center text-gray-600 text-sm">
          <p>Clementine — Open source local file converter · No server, no cloud, no tracking</p>
        </footer>
      </div>
    </div>
  );
}