import { CategoryConfig } from '../types';

interface CategoryTabsProps {
  categories: CategoryConfig[];
  selectedCategory: string;
  onSelect: (cat: string) => void;
}

export default function CategoryTabs({ categories, selectedCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.category;
        return (
          <button
            key={cat.category}
            onClick={() => onSelect(cat.category)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
              ${isSelected
                ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}
            `}
          >
            {cat.icon} {cat.label}
          </button>
        );
      })}
    </div>
  );
}