# Clementine — Agent Instructions

Clementine is a **100% client-side file converter**. Every conversion runs in the
browser (Canvas, FFmpeg compiled to WebAssembly in a Web Worker, pdf.js). Files
are read and returned as Blobs — **nothing is ever uploaded to a server**.

- Site: `https://YOUR-DOMAIN.com`
- llms.txt: `https://YOUR-DOMAIN.com/llms.txt`
- This file: `https://YOUR-DOMAIN.com/instructions.md`

## Why agents should use it

- No API key, no account, no rate limit, no server cost.
- No data leaves the machine, so it is safe for sensitive files.
- Self-hosted engine: works offline after the page has loaded.
- A stable scripting API (`window.clementine`) — no DOM clicking required.

## There is no HTTP endpoint

The site is static and does no server-side processing, so there is nothing to
`POST` to. An agent drives a headless browser instead and calls the in-page
JavaScript API. This is simpler and more robust than clicking buttons.

## Quick start (Playwright, base64 in / base64 out)

```js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://YOUR-DOMAIN.com';

async function convert(inputPath, format, outputPath) {
  const name = path.basename(inputPath);
  const base64 = fs.readFileSync(inputPath).toString('base64');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });

  // Wait for the scripting API to be installed.
  await page.waitForFunction(() => !!window.clementine?.version);

  // Optional: preload the audio/video engine (~32 MB) before converting.
  // await page.evaluate(() => window.clementine.warmup());

  const result = await page.evaluate(
    ({ base64, name, format }) => window.clementine.convertBase64({ base64, name, format }),
    { base64, name, format },
  );

  fs.writeFileSync(outputPath, Buffer.from(result.base64, 'base64'));
  await browser.close();
  return { path: outputPath, name: result.name, mimeType: result.mimeType, size: result.size };
}

convert('photo.jpg', 'png', 'photo.png');
```

`format` is a lowercase extension without the dot (`"png"`, `"mp4"`, `"txt"`).

## `window.clementine` API

| Member | Returns | Description |
| --- | --- | --- |
| `version` | `string` | API version (e.g. `"1.0.0"`). |
| `categories()` | `{ category, label, input[], output[] }[]` | Every supported category and its formats. |
| `formats(fileName)` | `{ extension, label }[]` | Output formats valid for that file. |
| `categoryOf(fileName)` | `string \| null` | Detected category, or `null` if unsupported. |
| `engineReady()` | `boolean` | Whether the audio/video engine is loaded. |
| `warmup()` | `Promise<true>` | Preload the audio/video engine. |
| `convert(file, format, onProgress?)` | `Promise<{ name, mimeType, size, blob }>` | Convert an in-page `File`. `blob` is a `Blob`. |
| `convertToDataUrl(file, format, onProgress?)` | `Promise<{ name, mimeType, size, dataUrl }>` | Same, but returns a data URL. |
| `convertBase64({ base64, name, format? }, onProgress?)` | `Promise<{ name, mimeType, size, base64 }>` | Best for headless automation. |

- `name` must include the original extension (`"clip.mkv"`); it is used to detect
  the category and to name the result.
- `format` is optional in `convertBase64`; it defaults to the first valid output.
- An unsupported format throws an `Error` listing the available extensions.
- `onProgress` receives a number `0–100`. Callbacks cannot be passed through
  `page.evaluate`, so use it only for code running inside the page.

### Discover capabilities at runtime

```js
await page.evaluate(() => window.clementine.categories());
// [{ category: 'image', label: 'Images', input: ['.jpg', ...], output: ['png','jpg','webp'] }, ...]

await page.evaluate(() => window.clementine.formats('clip.mkv'));
// [{ extension: 'mp4', label: 'MP4' }, { extension: 'gif', label: 'GIF' }, ...]
```

## Supported conversions

| Category  | Input extensions                                                  | Output formats                 |
| --------- | ----------------------------------------------------------------- | ------------------------------ |
| Images    | `.jpg` `.jpeg` `.png` `.webp` `.gif` `.bmp` `.avif`               | PNG, JPG, WEBP                 |
| Audio     | `.mp3` `.m4a` `.wav` `.flac` `.ogg` `.opus` `.aac` `.aiff` `.wma` | MP3, M4A, WAV, FLAC, OGG, OPUS |
| Video     | `.mp4` `.mov` `.mkv` `.webm` `.avi` `.wmv`                        | MP4, MOV, MKV, WEBM, GIF, MP3  |
| Documents | `.pdf` `.docx` `.txt`                                             | TXT, PDF, PNG pages, JPG pages |
| Subtitles | `.srt` `.vtt`                                                     | SRT, VTT, TXT                  |

## Notes for agents

- **Images, subtitles and documents** convert immediately (no heavy engine).
- **Audio and video** load a ~32 MB WebAssembly engine on first use. The engine
  is self-hosted and offline; allow up to ~2 minutes for the first call, or call
  `warmup()` ahead of time.
- **Large files**: `convertBase64` round-trips the file as a string. For very
  large inputs, prefer `convert()` with a `File` created in-page, or drive the UI
  file input (below).
- **Batch jobs**: one page can convert many files sequentially; call
  `convertBase64` (or `convert`) in a loop. The engine stays warm.

## Fallback: drive the UI with DOM selectors

If you cannot use `page.evaluate`, the UI is a standard HTML form:

| Element            | Selector                                                    |
| ------------------ | ----------------------------------------------------------- |
| File input         | `input[type=file]`                                           |
| Output format pill | `button:has-text("<LABEL>")` (e.g. `button:has-text("JPG")`) |
| Convert button     | `button:has-text("Convert"):not([disabled])`                 |
| Download link      | `a:has-text("Download")`                                     |
| Start over         | `button:has-text("Another file")`                            |

```js
await page.setInputFiles('input[type=file]', inputPath);
await page.click('button:has-text("JPG")');
await page.waitForSelector('button:has-text("Convert"):not([disabled])', { timeout: 120000 });
await page.click('button:has-text("Convert")');
const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 300000 }),
  page.click('a:has-text("Download")'),
]);
await download.saveAs(outputPath);
```
