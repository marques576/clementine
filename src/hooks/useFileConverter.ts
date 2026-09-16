import { useCallback, useRef, useState } from 'react';

export type ConversionStatus = 'idle' | 'converting' | 'done' | 'error';

export interface ConversionState {
  status: ConversionStatus;
  progress: number; // 0-100
  error: string | null;
  outputBlob: Blob | null;
  outputName: string | null;
}

export function useFileConverter() {
  const [state, setState] = useState<ConversionState>({
    status: 'idle',
    progress: 0,
    error: null,
    outputBlob: null,
    outputName: null,
  });

  const abortRef = useRef<(() => void) | null>(null);

  const start = useCallback(() => {
    setState({ status: 'converting', progress: 0, error: null, outputBlob: null, outputName: null });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setState((s) => ({ ...s, progress: Math.min(100, Math.max(0, progress)) }));
  }, []);

  const finish = useCallback((blob: Blob, name: string) => {
    setState({ status: 'done', progress: 100, error: null, outputBlob: blob, outputName: name });
  }, []);

  const fail = useCallback((error: string) => {
    setState((s) => ({ ...s, status: 'error', error }));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.();
    setState({ status: 'idle', progress: 0, error: null, outputBlob: null, outputName: null });
  }, []);

  return { state, start, updateProgress, finish, fail, reset };
}
