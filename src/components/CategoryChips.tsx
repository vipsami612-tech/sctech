import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CategoryChips: React.FC = () => {
  const { activeCategory, setActiveCategory, categories, language, t } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const categoryTranslations: Record<string, string> = {
    All: t.explore.all,
    Animation: t.explore.animation,
    'Sci-Fi': t.explore.science,
    Gaming: t.explore.gaming,
    Tech: t.explore.technology,
    Automotive: t.explore.automotive,
    Travel: t.explore.travel,
    Coding: t.explore.coding,
    Education: t.explore.education,
    Entertainment: t.explore.entertainment,
    Music: t.explore.music
  };

  return (
    <div className="relative sticky top-14 z-30 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm py-3 px-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="flex items-center">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="hidden md:flex p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 mr-1 shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {categories.map(cat => {
            const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase();
            const label = language === 'am' ? (categoryTranslations[cat.name] || cat.name) : cat.name;
            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="hidden md:flex p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 ml-1 shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
