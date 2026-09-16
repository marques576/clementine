import { useCallback, useState } from 'react';
import {
  convertAudio,
  convertDocument,
  convertImage,
  convertSubtitle,
  convertVideo,
  type ConvertResult,
} from '../converters';
import { getCategoryForFile, type FormatOption } from '../types';

export type ConversionStatus = 'idle' | 'converting' | 'done' | 'error';

export interface ConversionState {
  status: ConversionStatus;
  progress: number;
  error: string | null;
  outputBlob: Blob | null;
  outputName: string | null;
}

interface UseConversionOptions {
  ffmpeg: any | null;
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

  const convert = useCallback(
    async (file: File, format: FormatOption) => {
      setState({ ...IDLE, status: 'converting' });

      const onProgress = (progress: number) =>
        setState((s) => ({ ...s, progress: Math.max(0, Math.min(100, progress)) }));

      try {
        const category = getCategoryForFile(file.name);
        let result: ConvertResult;

        switch (category) {
          case 'image':
            result = await convertImage(file, format, onProgress);
            break;
          case 'audio':
            if (!isFFmpegReady) throw new Error('Conversion engine is not ready yet');
            result = await convertAudio(file, ffmpeg, format, onProgress);
            break;
          case 'video':
            if (!isFFmpegReady) throw new Error('Conversion engine is not ready yet');
            result = await convertVideo(file, ffmpeg, format, onProgress);
            break;
          case 'document':
            result = await convertDocument(file, format, onProgress);
            break;
          case 'subtitle':
            result = await convertSubtitle(file, format, onProgress);
            break;
          default:
            throw new Error('This file type is not supported');
        }

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
    },
    [ffmpeg, isFFmpegReady],
  );

  const reset = useCallback(() => setState(IDLE), []);

  return { state, convert, reset, isFFmpegReady };
}
