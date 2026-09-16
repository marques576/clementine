import { CATEGORIES, type CategoryConfig } from '../types';

export default function ConversionOptionsHero() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
      {CATEGORIES.map((cat: CategoryConfig) => (
        <div key={cat.category} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="text-2xl mb-2">{cat.icon}</div>
          <h4 className="font-semibold text-gray-200 mb-2">{cat.label}</h4>
          <div className="flex flex-wrap gap-1.5">
            {cat.inputExtensions.map((ext: string) => (
              <span key={ext} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-md">
                {ext}
              </span>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-500">→ Convert to:</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {cat.outputFormats.map((fmt) => (
                <span key={fmt.extension} className="px-2 py-0.5 bg-brand-500/10 text-brand-400 text-xs rounded-md">
                  {fmt.extension.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}