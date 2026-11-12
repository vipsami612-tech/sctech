import React, { useState, useEffect } from 'react';
import { X, Mic, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VoiceSearchModal: React.FC = () => {
  const { isVoiceSearchModalOpen, setIsVoiceSearchModalOpen, navigate } = useApp();
  const [listening, setListening] = useState(true);

  if (!isVoiceSearchModalOpen) return null;

  const handleSuggestionClick = (phrase: string) => {
    setIsVoiceSearchModalOpen(false);
    navigate('search', { searchQuery: phrase });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center animate-in fade-in zoom-in-95 relative">
        <button
          onClick={() => setIsVoiceSearchModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display font-semibold text-lg text-zinc-950 dark:text-white mt-2">
          {listening ? 'Listening...' : 'Search with voice'}
        </h3>
        <p className="text-xs text-zinc-400 mt-1">Speak now or choose a prompt below</p>

        {/* Pulsing Microphone Icon with Animated Waves */}
        <div className="my-8 relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-red-600/20 animate-ping" />
          <div className="absolute w-20 h-20 rounded-full bg-red-600/30" />
          <button
            onClick={() => setListening(!listening)}
            className="relative z-10 w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
          >
            <Mic className="w-7 h-7" />
          </button>
        </div>

        {/* Quick Voice Suggestions */}
        <div className="w-full space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 text-center">
            Or try saying:
          </div>
          {[
            'Big Buck Bunny 4K',
            'Full Stack TypeScript 2026',
            'Sintel Fantasy Open Movie',
            'Untamed Mountain Wilderness'
          ].map(phrase => (
            <button
              key={phrase}
              onClick={() => handleSuggestionClick(phrase)}
              className="w-full py-2 px-3 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-left transition-colors flex items-center justify-between"
            >
              <span>"{phrase}"</span>
              <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
