import { useCallback, useEffect, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export function useFFmpegLoader() {
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    if (loadedRef.current || ffmpeg) return;
    loadedRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const inst = new FFmpeg();
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await inst.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setFFmpeg(inst);
    } catch (e: any) {
      setError(e.message || 'Failed to load FFmpeg');
      loadedRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [ffmpeg]);

  return { ffmpeg, loading, error, load };
}