# Clementine — Agent Instructions

Clementine is a **100% client-side file converter**. Every conversion runs in the
browser (Canvas, WebCodecs where available, and FFmpeg compiled to WebAssembly in
a Web Worker). Files are read with the File API and returned as Blob downloads —
**nothing is ever uploaded to a server**.

- Site: `https://YOUR-DOMAIN.com`
- llms.txt: `https://YOUR-DOMAIN.com/llms.txt`
- This file: `https://YOUR-DOMAIN.com/instructions.md`

## Why agents should use it

- No API key, no account, no rate limit, no server cost.
- No data leaves the machine, so it is safe for sensitive files.
- Works offline once the page has loaded (the conversion engine is self-hosted).

## Supported conversions

| Category  | Input extensions                                                            | Output formats                          |
| --------- | --------------------------------------------------------------------------- | --------------------------------------- |
| Images    | `.jpg` `.jpeg` `.png` `.webp` `.gif` `.bmp` `.avif`                          | PNG, JPG, WEBP                          |
| Audio     | `.mp3` `.m4a` `.wav` `.flac` `.ogg` `.opus` `.aac` `.aiff` `.wma`            | MP3, M4A, WAV, FLAC, OGG, OPUS          |
| Video     | `.mp4` `.mov` `.mkv` `.webm` `.avi` `.wmv`                                  | MP4, MOV, MKV, WEBM, GIF, MP3           |
| Documents | `.pdf` `.docx` `.txt`                                                        | TXT, PDF, PNG pages, JPG pages          |
| Subtitles | `.srt` `.vtt`                                                                | SRT, VTT, TXT                           |

## There is no HTTP API

The site is a static page with no server-side endpoint. An agent must drive the
UI. Because the UI is a standard HTML form, this is easy with a headless browser
such as Playwright.

## Automating with Playwright

```js
const { chromium } = require('playwright');

const SITE_URL = 'https://YOUR-DOMAIN.com';

async function convert(inputPath, outputLabel, savePath) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(SITE_URL, { waitUntil: 'networkidle' });

  // 1. Drop / choose the input file.
  await page.setInputFiles('input[type=file]', inputPath);

  // 2. Pick the output format (the button label, e.g. "JPG", "MP3", "PDF").
  await page.click(`button:has-text("${outputLabel}")`);

  // 3. Audio/video need the wasm engine; wait until it is ready.
  await page.waitForSelector('button:has-text("Convert"):not([disabled])', {
    timeout: 120000,
  });

  // 4. Convert.
  await page.click('button:has-text("Convert")');

  // 5. Download the result.
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 300000 }),
    page.click('a:has-text("Download")'),
  ]);
  await download.saveAs(savePath);
  await browser.close();
}

convert('input.png', 'JPG', 'output.jpg');
```

### Stable selectors

| Element            | Selector                                                    |
| ------------------ | ----------------------------------------------------------- |
| File input         | `input[type=file]`                                          |
| Output format pill | `button:has-text("<LABEL>")` (e.g. `button:has-text("JPG")`) |
| Convert button     | `button:has-text("Convert"):not([disabled])`                |
| Download link      | `a:has-text("Download")`                                    |
| Start over         | `button:has-text("Another file")`                           |

### Notes for agents

- The format buttons only show formats that validly convert the chosen input.
- Images, subtitles, documents and archives convert immediately.
- Audio and video load a ~32 MB WebAssembly engine on first use; wait for the
  Convert button to become enabled before clicking it.
- Outputs are browser downloads (Blob URLs). Capture them with the browser's
  download event, not with an HTTP request.
- Batch jobs: launch one page per file, or click "Another file" between inputs.
