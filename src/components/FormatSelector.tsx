import { FormatOption } from '../types';

interface FormatSelectorProps {
  formats: FormatOption[];
  selected: FormatOption | null;
  onSelect: (format: FormatOption) => void;
}

export default function FormatSelector({ formats, selected, onSelect }: FormatSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {formats.map((fmt) => {
        const isSelected = selected?.extension === fmt.extension;
        return (
          <button
            key={fmt.extension}
            onClick={() => onSelect(fmt)}
            className={`
              py-3 px-3 rounded-xl text-sm font-medium transition-all duration-200 border
              ${isSelected
                ? 'bg-brand-500/20 border-brand-500 text-brand-400 ring-2 ring-brand-500/30'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'}
            `}
          >
            <div className="text-lg mb-1">{fmt.extension.toUpperCase()}</div>
            <div className="text-xs text-gray-500">{fmt.label}</div>
          </button>
        );
      })}
    </div>
  );
}
