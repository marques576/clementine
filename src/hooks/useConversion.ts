import { useCallback, useEffect, useState } from 'react';
import { convertAudio, convertArchive, convertDocument, convertSubtitle, convertVideo, convertViaCanvas } from '../converters';
import type { FormatOption } from '../types';
import type { ConversionState } from './useFileConverter';

interface UseConversionOptions {
  ffmpeg: any | null;
  ffmpegLoading: boolean;
}

export function useConversion({ ffmpeg, ffmpegLoading }: UseConversionOptions) {
  const [state, setState] = useState<ConversionState>({
    status: 'idle',
    progress: 0,
    error: null,
    outputBlob: null,
    outputName: null,
  });

  const isFFmpegReady = !!ffmpeg && !ffmpegLoading;

  const convert = useCallback(async (file: File, format: FormatOption) => {
    setState({ status: 'converting', progress: 0, error: null, outputBlob: null, outputName: null });

    try {
      const onProgress = (p: number) => setState((s) => ({ ...s, progress: p }));

      const ext = '.' + file.name.split('.').pop()!.toLowerCase();

      if (['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.tiff', '.tif', '.svg', '.bmp', '.avif', '.gif'].includes(ext)) {
        const result = await convertViaCanvas(file, format, onProgress);
        setState({ status: 'done', progress: 100, error: null, outputBlob: result.blob, outputName: result.name });
      } else if (['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.opus', '.aiff', '.wma'].includes(ext)) {
        if (!isFFmpegReady) throw new Error('FFmpeg not loaded');
        const result = await convertAudio(file, ffmpeg, format, onProgress);
        setState({ status: 'done', progress: 100, error: null, outputBlob: result.blob, outputName: result.name });
      } else if (['.mp4', '.mov', '.mkv', '.webm', '.avi', '.wmv', '.gif'].includes(ext)) {
        if (!isFFmpegReady) throw new Error('FFmpeg not loaded');
        const result = await convertVideo(file, ffmpeg, format, onProgress);
        setState({ status: 'done', progress: 100, error: null, outputBlob: result.blob, outputName: result.name });
      } else if (['.pdf', '.docx', '.txt'].includes(ext)) {
        if (!isFFmpegReady) throw new Error('FFmpeg not loaded');
        const result = await convertDocument(file, ffmpeg, format, onProgress);
        setState({ status: 'done', progress: 100, error: null, outputBlob: result.blob, outputName: result.name });
      } else if (['.srt', '.vtt'].includes(ext)) {
        if (!isFFmpegReady) throw new Error('FFmpeg not loaded');
        const result = await convertSubtitle(file, ffmpeg, format, onProgress);
        setState({ status: 'done', progress: 100, error: null, outputBlob: result.blob, outputName: result.name });
      } else if (['.zip', '.tar', '.gz', '.gzip', '.rar'].includes(ext)) {
        if (!isFFmpegReady) throw new Error('FFmpeg not loaded');
        const result = await convertArchive(file, ffmpeg, format, onProgress);
        setState({ status: 'done', progress: 100, error: null, outputBlob: result.blob, outputName: result.name });
      } else {
        throw new Error(`Unsupported file type: ${ext}`);
      }
    } catch (e: any) {
      setState({ status: 'error', progress: 0, error: e.message || 'Conversion failed', outputBlob: null, outputName: null });
    }
  }, [ffmpeg, isFFmpegReady]);

  const reset = useCallback(() => {
    setState({ status: 'idle', progress: 0, error: null, outputBlob: null, outputName: null });
  }, []);

  return { state, convert, reset, isFFmpegReady };
}