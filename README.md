# Clementine — Local File Converter

Clementine is an open-source alternative to Tangerine for Mac. It's a browser-based file converter that runs entirely in the user's browser — no server-side processing, no file uploads, no cloud dependencies.

## Features

- **Drag & drop** file conversion
- **Images**: Convert between PNG, JPEG, WebP, AVIF, BMP, TIFF, SVG, GIF
- **Audio**: Convert between MP3, M4A, WAV, FLAC, OGG, Opus (via FFmpeg.wasm)
- **Video**: Convert between MP4, MOV, MKV, WebM, AVI, WMV, GIF; extract audio to MP3
- **Documents**: PDF/DOCX/TXT conversion and PDF to images
- **Subtitles**: SRT, VTT, TXT conversion
- **Archives**: ZIP, TAR, GZIP conversion
- **Privacy**: All processing happens locally in the browser using WebAssembly
- **No install**: Runs as a web app, no downloads required
- **Open source**: MIT licensed

## Screenshots

### Landing Page — Drag & Drop

![Landing page with drag and drop zone](screenshot-dropzone.png)

Drop any file onto the page to begin converting. No accounts, no uploads — everything runs in your browser.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS
- FFmpeg.wasm (for audio/video/document conversions)
- Canvas API (for image conversions)
- All processing runs via WebAssembly in the browser

## Setup & Run

```bash
cd clementine
npm install
npm run dev
```

The app serves on `http://localhost:3001`.

## Building for Production

```bash
npm run build
```

Output is in `dist/` — deploy anywhere (static host, CDN, etc.). To preview the production build locally:

```bash
cd dist && python3 -m http.server 3001
```

## Agent API

See `/llm.txt` for programmatic access instructions for AI agents. Agents can automate file drops, format selection, and downloads via Playwright/Puppeteer DOM interaction.
