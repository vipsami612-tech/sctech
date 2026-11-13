import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AccessFilter } from '../types';

export const CategoryChips: React.FC = () => {
  const {
    activeCategory,
    setActiveCategory,
    accessFilter,
    setAccessFilter,
    categories,
    language,
    t
  } = useApp();
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

  const accessOptions: { id: AccessFilter; label: string; pro?: boolean }[] = [
    { id: 'all', label: t.filters.allContent },
    { id: 'free', label: t.filters.freeOnly },
    { id: 'pro', label: t.filters.premiumOnly, pro: true }
  ];

  return (
    <div className="relative sticky top-14 z-30 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm py-3 px-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center flex-1 min-w-0">
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

        {/* Access Filter Toggle (All / Free Only / Premium Only) */}
        <div
          role="group"
          aria-label={t.filters.premiumOnly}
          className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg shrink-0 self-start sm:self-auto border border-zinc-200/70 dark:border-zinc-700/60"
        >
          {accessOptions.map(opt => {
            const active = accessFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAccessFilter(opt.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? opt.pro
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : opt.id === 'free'
                      ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {opt.pro && <Lock className="w-3 h-3 stroke-[2.5]" />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
