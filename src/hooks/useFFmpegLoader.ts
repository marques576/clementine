import { useCallback, useRef, useState } from 'react';
import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { getFFmpeg, loadFFmpeg } from '../lib/ffmpegEngine';

/**
 * React wrapper around the shared FFmpeg singleton (see lib/ffmpegEngine.ts).
 * The same engine instance is used by the UI and by the `window.clementine` API.
 */
export function useFFmpegLoader() {
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(() => getFFmpeg());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflightRef = useRef<Promise<FFmpeg | null> | null>(null);

  const load = useCallback(async (): Promise<FFmpeg | null> => {
    const existing = getFFmpeg();
    if (existing) {
      setFFmpeg(existing);
      return existing;
    }
    if (inflightRef.current) return inflightRef.current;

    setLoading(true);
    setError(null);

    const task = (async () => {
      try {
        const inst = await loadFFmpeg();
        setFFmpeg(inst);
        return inst;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load the conversion engine');
        return null;
      } finally {
        inflightRef.current = null;
        setLoading(false);
      }
    })();

    inflightRef.current = task;
    return task;
  }, []);

  return { ffmpeg, loading, error, load };
}
