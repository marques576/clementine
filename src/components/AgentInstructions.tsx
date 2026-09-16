import { useCallback, useEffect, useState } from 'react';

const INSTRUCTIONS_URL = `${import.meta.env.BASE_URL}instructions.md`;
const LLMS_URL = `${import.meta.env.BASE_URL}llms.txt`;

const FALLBACK = `# Clementine — Agent Instructions

Clementine is a 100% client-side file converter. Nothing is ever uploaded.

See ${LLMS_URL} for the machine-readable index of supported conversions.`;

export default function AgentInstructions() {
  const [text, setText] = useState(FALLBACK);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(INSTRUCTIONS_URL)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
      .then((body) => {
        if (active && body.trim()) setText(body);
      })
      .catch(() => {
        /* keep the fallback */
      });
    return () => {
      active = false;
    };
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }, [text]);

  return (
    <details className="mt-5 text-left">
      <summary className="cursor-pointer select-none text-xs text-neutral-500 transition-colors hover:text-neutral-700">
        For AI agents — copy instructions.md
      </summary>

      <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
        <textarea
          readOnly
          value={text}
          spellCheck={false}
          onFocus={(e) => e.currentTarget.select()}
          className="h-40 w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-[11px] leading-relaxed text-neutral-700 outline-none focus:border-neutral-300"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <a
            href={LLMS_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-neutral-500 underline hover:text-neutral-700"
          >
            /llms.txt
          </a>
          <button
            type="button"
            onClick={copy}
            className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </details>
  );
}
