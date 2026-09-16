import type { FormatOption } from '../types';

interface FormatSelectorProps {
  formats: FormatOption[];
  selected: FormatOption | null;
  onSelect: (format: FormatOption) => void;
}

export default function FormatSelector({ formats, selected, onSelect }: FormatSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {formats.map((format) => {
        const isSelected = selected?.extension === format.extension;
        return (
          <button
            key={format.extension}
            type="button"
            onClick={() => onSelect(format)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              isSelected
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-800'
            }`}
          >
            {format.label}
          </button>
        );
      })}
    </div>
  );
}
