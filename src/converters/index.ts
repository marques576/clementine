import type { FormatOption } from '../types';
import { getExtension } from '../types';
import { outputNameFor, type ConvertResult } from './shared';

export type { ConvertResult } from './shared';
export { convertDocument } from './documents';

/**
 * Run an ffmpeg command while reporting real progress (0-100).
 * ffmpeg.wasm emits a `progress` event with a 0-1 ratio for the current job.
 */
async function runFFmpeg(
  ffmpeg: any,
  args: string[],
  onProgress: (p: number) => void,
): Promise<void> {
  const handler = ({ progress }: { progress: number }) => {
    if (Number.isFinite(progress)) {
      onProgress(Math.max(0, Math.min(99, progress * 100)));
    }
  };
  ffmpeg.on?.('progress', handler);
  try {
    const code = await ffmpeg.exec(args);
    if (typeof code === 'number' && code !== 0) {
      throw new Error(`Conversion failed (ffmpeg exit code ${code})`);
    }
  } finally {
    ffmpeg.off?.('progress', handler);
  }
}

async function readOutput(ffmpeg: any, outputName: string, mimeType: string) {
  const data = await ffmpeg.readFile(outputName);
  await ffmpeg.deleteFile?.(outputName);
  return new Blob([data], { type: mimeType });
}

export async function convertImage(
  file: File,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<ConvertResult> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('This image could not be opened by your browser'));
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported in this browser');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const mimeType = format.extension === 'jpg' ? 'image/jpeg' : format.mimeType;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error(`This browser cannot encode ${format.label}`))),
        mimeType,
        0.92,
      );
    });

    onProgress(100);
    return { blob, name: outputNameFor(file, format) };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function convertAudio(
  file: File,
  ffmpeg: any,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<ConvertResult> {
  if (!ffmpeg) throw new Error('Conversion engine is not ready');

  const inputName = `input${getExtension(file.name)}`;
  const outputName = `output.${format.extension}`;

  await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
  await runFFmpeg(ffmpeg, ['-i', inputName, '-y', outputName], onProgress);

  const blob = await readOutput(ffmpeg, outputName, format.mimeType);
  onProgress(100);
  return { blob, name: outputNameFor(file, format) };
}

export async function convertVideo(
  file: File,
  ffmpeg: any,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<ConvertResult> {
  if (!ffmpeg) throw new Error('Conversion engine is not ready');

  const inputName = `input${getExtension(file.name)}`;
  const outputName = `output.${format.extension}`;

  await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));

  let args: string[];
  if (format.extension === 'mp3') {
    args = ['-i', inputName, '-y', '-vn', '-q:a', '2', outputName];
  } else if (format.extension === 'gif') {
    args = ['-i', inputName, '-y', '-vf', 'fps=10,scale=480:-1', '-loop', '0', outputName];
  } else if (format.extension === 'webm') {
    args = ['-i', inputName, '-y', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '32', '-c:a', 'libopus', outputName];
  } else if (format.extension === 'mkv') {
    args = ['-i', inputName, '-y', '-c', 'copy', outputName];
  } else {
    args = ['-i', inputName, '-y', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac', outputName];
  }

  await runFFmpeg(ffmpeg, args, onProgress);

  const blob = await readOutput(ffmpeg, outputName, format.mimeType);
  onProgress(100);
  return { blob, name: outputNameFor(file, format) };
}

export async function convertSubtitle(
  file: File,
  format: FormatOption,
  onProgress: (p: number) => void,
): Promise<ConvertResult> {
  // Subtitles are plain text work — no engine required.
  const text = await file.text();
  const converted = format.extension === 'vtt'
    ? srtToVtt(text)
    : format.extension === 'srt'
      ? vttToSrt(text)
      : text;

  onProgress(100);
  return {
    blob: new Blob([converted], { type: 'text/plain' }),
    name: outputNameFor(file, format),
  };
}

function srtToVtt(input: string): string {
  const body = input
    .replace(/\r+/g, '')
    .replace(/^\uFEFF/, '')
    .replace(/(\d+):(\d+):(\d+),(\d+)/g, '$1:$2:$3.$4');
  return `WEBVTT\n\n${body}`;
}

function vttToSrt(input: string): string {
  return input
    .replace(/\r+/g, '')
    .replace(/^\uFEFF/, '')
    .replace(/^WEBVTT.*\n+/, '')
    .replace(/(\d+):(\d+):(\d+)\.(\d+)/g, '$1:$2:$3,$4');
}
