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

let instance: FFmpeg | null = null;
let inflight: Promise<FFmpeg> | null = null;

/** The loaded engine, or null if it has not been loaded yet. */
export function getFFmpeg(): FFmpeg | null {
  return instance;
}

/** The multithreaded core needs SharedArrayBuffer, which needs cross-origin isolation. */
export function isCrossOriginIsolated(): boolean {
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

/**
 * Load (or return the already-loaded) FFmpeg engine. Safe to call concurrently:
 * every caller shares the same instance / in-flight load.
 *
 * Prefers the multithreaded core when the page is cross-origin isolated and
 * falls back to the single-threaded core if it fails for any reason.
 */
export async function loadFFmpeg(): Promise<FFmpeg> {
  if (instance) return instance;
  if (inflight) return inflight;

  inflight = (async () => {
    if (isCrossOriginIsolated()) {
      try {
        instance = await loadInstance(true);
        return instance;
      } catch {
        /* fall through to single-threaded */
      }
    }
    instance = await loadInstance(false);
    return instance;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}
