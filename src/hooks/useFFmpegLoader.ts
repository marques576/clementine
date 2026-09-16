import { useCallback, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

// The ffmpeg-core files are vendored into /public so the engine is served from
// the same origin as the app. This means the converter works completely offline
// and never touches a CDN.
//
// They are fetched and turned into blob URLs (instead of importing the public
// path directly) because Vite refuses to `import()` files from /public during
// development.
const CORE_BASE = `${import.meta.env.BASE_URL}ffmpeg`;
const CORE_MT_BASE = `${import.meta.env.BASE_URL}ffmpeg-mt`;

/** The multithreaded core needs SharedArrayBuffer, which needs cross-origin isolation. */
function canUseMultithreaded(): boolean {
  return (
    typeof SharedArrayBuffer !== 'undefined' &&
    typeof globalThis.crossOriginIsolated === 'boolean' &&
    globalThis.crossOriginIsolated
  );
}

async function loadInstance(multithreaded: boolean): Promise<FFmpeg> {
  const base = multithreaded ? CORE_MT_BASE : CORE_BASE;
  const ffmpeg = new FFmpeg();

  await ffmpeg.load({
    // Served straight from /public so Vite never rewrites the worker's
    // internal `import(coreURL)` into a broken `blob:...?import` URL.
    classWorkerURL: `${CORE_BASE}/worker.js`,
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
    ...(multithreaded
      ? { workerURL: await toBlobURL(`${base}/ffmpeg-core.worker.js`, 'text/javascript') }
      : {}),
  });

  return ffmpeg;
}

export function useFFmpegLoader() {
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const inflightRef = useRef<Promise<FFmpeg | null> | null>(null);

  const load = useCallback(async (): Promise<FFmpeg | null> => {
    if (ffmpeg) return ffmpeg;
    if (inflightRef.current) return inflightRef.current;
    if (loadedRef.current) return null;

    loadedRef.current = true;
    setLoading(true);
    setError(null);

    const task = (async () => {
      try {
        // Prefer the multithreaded core when the page is cross-origin isolated,
        // and fall back to the single-threaded core if it fails for any reason.
        if (canUseMultithreaded()) {
          try {
            const mt = await loadInstance(true);
            setFFmpeg(mt);
            return mt;
          } catch {
            /* fall through to single-threaded */
          }
        }

        const st = await loadInstance(false);
        setFFmpeg(st);
        return st;
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load the conversion engine';
        setError(message);
        loadedRef.current = false;
        return null;
      } finally {
        inflightRef.current = null;
        setLoading(false);
      }
    })();

    inflightRef.current = task;
    return task;
  }, [ffmpeg]);

  return { ffmpeg, loading, error, load };
}
