import React, { useState } from 'react';
import { X, Copy, Check, Share2, Code, MessageCircle, Twitter, Facebook } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ShareModal: React.FC = () => {
  const { shareModalVideo, setShareModalVideo } = useApp();
  const [copied, setCopied] = useState(false);
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  if (!shareModalVideo) return null;

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/?v=${shareModalVideo.id}${includeTimestamp ? '&t=0' : ''}`;
  const embedCode = `<iframe width="560" height="315" src="${shareModalVideo.videoUrl}" frameborder="0" allowfullscreen></iframe>`;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
            <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
              Share Video
            </h2>
          </div>
          <button
            onClick={() => setShareModalVideo(null)}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Video Preview Snippet */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <img
              src={shareModalVideo.thumbnailUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="w-20 aspect-video rounded-lg object-cover"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-white line-clamp-1">
                {shareModalVideo.title}
              </h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">{shareModalVideo.channel.name}</p>
            </div>
          </div>

          {/* Share Link Row */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Video URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 select-all"
              />
              <button
                onClick={() => handleCopy(shareUrl)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors shrink-0 shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Timestamp checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="timestampCheck"
              checked={includeTimestamp}
              onChange={e => setIncludeTimestamp(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-600"
            />
            <label htmlFor="timestampCheck" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
              Start at current timestamp (0:00)
            </label>
          </div>

          {/* Embed Toggle */}
          <div>
            <button
              onClick={() => setShowEmbed(!showEmbed)}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:underline"
            >
              <Code className="w-4 h-4" />
              <span>{showEmbed ? 'Hide Embed Code' : 'Show Embed Code'}</span>
            </button>
            {showEmbed && (
              <div className="mt-2">
                <textarea
                  readOnly
                  rows={2}
                  value={embedCode}
                  className="w-full p-2.5 rounded-xl text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
