import { useCallback, useState } from 'react';
import type { FormatOption } from '../types';
import { convertFile } from '../lib/convertFile';

export type ConversionStatus = 'idle' | 'converting' | 'done' | 'error';

export interface ConversionState {
  status: ConversionStatus;
  progress: number;
  error: string | null;
  outputBlob: Blob | null;
  outputName: string | null;
}

interface UseConversionOptions {
  ffmpeg: unknown | null;
  ffmpegLoading: boolean;
}

const IDLE: ConversionState = {
  status: 'idle',
  progress: 0,
  error: null,
  outputBlob: null,
  outputName: null,
};

export function useConversion({ ffmpeg, ffmpegLoading }: UseConversionOptions) {
  const [state, setState] = useState<ConversionState>(IDLE);

  const isFFmpegReady = !!ffmpeg && !ffmpegLoading;

  const convert = useCallback(async (file: File, format: FormatOption) => {
    setState({ ...IDLE, status: 'converting' });

    const onProgress = (progress: number) =>
      setState((s) => ({ ...s, progress: Math.max(0, Math.min(100, progress)) }));

    try {
      const result = await convertFile(file, format, onProgress);
      setState({
        status: 'done',
        progress: 100,
        error: null,
        outputBlob: result.blob,
        outputName: result.name,
      });
    } catch (e) {
      setState({
        ...IDLE,
        status: 'error',
        error: e instanceof Error ? e.message : 'Conversion failed',
      });
    }
  }, []);

  const reset = useCallback(() => setState(IDLE), []);

  return { state, convert, reset, isFFmpegReady };
}
