import { useCallback, useEffect, useState } from 'react';

const INSTRUCTIONS_URL = `${import.meta.env.BASE_URL}instructions.md`;

const FALLBACK = `# Clementine — Agent Instructions

Clementine is a 100% client-side file converter. Nothing is ever uploaded.`;

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

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
    <div className="mt-5 text-left">
      <p className="mb-2 text-xs text-neutral-500">For AI agents</p>

      <div className="relative">
        <textarea
          readOnly
          value={text}
          spellCheck={false}
          onFocus={(e) => e.currentTarget.select()}
          className="h-40 w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 pr-11 font-mono text-[11px] leading-relaxed text-neutral-700 outline-none focus:border-neutral-300"
        />
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy instructions.md'}
          title={copied ? 'Copied' : 'Copy instructions.md'}
          className={`absolute right-2 top-2 rounded-lg border bg-white p-1.5 shadow-sm transition-colors ${
            copied
              ? 'border-brand-300 text-brand-600'
              : 'border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-800'
          }`}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </div>
  );
}
