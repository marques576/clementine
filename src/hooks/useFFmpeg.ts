import { useCallback, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export interface FFmpegState {
  ffmpeg: FFmpeg | null;
  loading: boolean;
  error: string | null;
}

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [state, setState] = useState<FFmpegState>({
    ffmpeg: null,
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    if (ffmpegRef.current) return ffmpegRef.current;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const ffmpeg = new FFmpeg();

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      ffmpegRef.current = ffmpeg;
      setState({ ffmpeg, loading: false, error: null });
      return ffmpeg;
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e.message || 'Failed to load FFmpeg' }));
      return null;
    }
  }, []);

  const isLoaded = !!ffmpegRef.current;

  return { ...state, load, isLoaded };
}
