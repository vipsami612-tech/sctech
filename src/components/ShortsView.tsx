import React, { useState, useRef, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Disc,
  X,
  Send,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ShortsView: React.FC = () => {
  const { shorts, toggleSubscribe, subscribedChannelIds, navigate } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedShorts, setLikedShorts] = useState<string[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [shortComments, setShortComments] = useState<Record<string, { author: string; text: string; time: string }[]>>({
    'short-1': [
      { author: 'DevNinja', text: 'This flexbox trick saved my entire sprint layout!', time: '1h ago' },
      { author: 'CoderPro', text: 'Clean syntax! Keep dropping these 30s nuggets.', time: '3h ago' }
    ]
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentShort = shorts[currentIndex] || shorts[0];
  const isSubscribed = subscribedChannelIds.includes(currentShort.channel.id);
  const isLiked = likedShorts.includes(currentShort.id);

  // Restart and play whenever index changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleLike = () => {
    if (isLiked) {
      setLikedShorts(prev => prev.filter(id => id !== currentShort.id));
    } else {
      setLikedShorts(prev => [...prev, currentShort.id]);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newC = {
      author: 'You',
      text: commentInput.trim(),
      time: 'Just now'
    };
    setShortComments(prev => ({
      ...prev,
      [currentShort.id]: [newC, ...(prev[currentShort.id] || [])]
    }));
    setCommentInput('');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isPlaying]);

  return (
    <div className="flex justify-center items-center py-4 px-2 min-h-[calc(100vh-4rem)] relative">
      {/* Up / Down navigation floating buttons */}
      <div className="hidden md:flex flex-col gap-3 fixed right-8 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Previous short"
          className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 text-zinc-800 dark:text-zinc-200 shadow-lg transition-all"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === shorts.length - 1}
          aria-label="Next short"
          className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 text-zinc-800 dark:text-zinc-200 shadow-lg transition-all"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Main Shorts Container */}
      <div className="relative flex items-end justify-center w-full max-w-sm sm:max-w-md h-[78vh] sm:h-[82vh] rounded-3xl overflow-hidden shadow-2xl bg-black border border-zinc-800">
        {/* Native Vertical Video */}
        <video
          ref={videoRef}
          src={currentShort.videoUrl}
          playsInline
          loop
          muted={isMuted}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Play/Pause state badge on top right */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* OVERLAY SCRIM & BOTTOM INFO */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute bottom-4 left-4 right-16 z-10 text-white pointer-events-auto">
          {/* Channel metadata */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('channel', { channelId: currentShort.channel.id })}
              className="flex items-center gap-2"
            >
              <img
                src={currentShort.channel.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50"
              />
              <span className="font-semibold text-sm hover:underline">
                {currentShort.channel.name}
              </span>
              {currentShort.channel.verified && (
                <Check className="w-3.5 h-3.5 text-zinc-300" />
              )}
            </button>
            <button
              onClick={() => toggleSubscribe(currentShort.channel.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                isSubscribed
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Title */}
          <p className="text-xs sm:text-sm font-medium mt-2.5 line-clamp-2 leading-snug">
            {currentShort.title}
          </p>

          {/* Sound audio ticker */}
          <div className="flex items-center gap-2 mt-2 text-xs text-white/80">
            <Disc className="w-3.5 h-3.5 animate-spin" />
            <span className="truncate">{currentShort.soundTitle}</span>
          </div>
        </div>

        {/* RIGHT FLOATING ACTION COLUMN */}
        <div className="absolute bottom-4 right-3 z-10 flex flex-col items-center gap-4 text-white">
          {/* Like button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={toggleLike}
              className={`p-3 rounded-full backdrop-blur-md transition-all ${
                isLiked ? 'bg-red-600 text-white scale-110' : 'bg-black/40 hover:bg-black/70'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <span className="text-[11px] font-mono">
              {currentShort.likes + (isLiked ? 1 : 0)}
            </span>
          </div>

          {/* Dislike button */}
          <div className="flex flex-col items-center gap-1">
            <button className="p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md transition-all">
              <ThumbsDown className="w-5 h-5" />
            </button>
            <span className="text-[11px] font-mono">Dislike</span>
          </div>

          {/* Comments drawer trigger */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setCommentsOpen(true)}
              className="p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md transition-all"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <span className="text-[11px] font-mono">{currentShort.commentsCount}</span>
          </div>

          {/* Share button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
              }}
              className="p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <span className="text-[11px]">Share</span>
          </div>

          {/* Sound Spinning Disc */}
          <div className="w-9 h-9 rounded-full bg-black/60 border border-white/30 flex items-center justify-center p-1">
            <img
              src={currentShort.channel.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover animate-spin"
            />
          </div>
        </div>

        {/* COMMENTS BOTTOM/SIDE DRAWER */}
        {commentsOpen && (
          <div className="absolute inset-x-0 bottom-0 top-1/3 bg-zinc-900/98 backdrop-blur-md rounded-t-3xl p-4 z-30 flex flex-col border-t border-zinc-700 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-semibold text-white">
                Comments ({shortComments[currentShort.id]?.length || 0})
              </span>
              <button
                onClick={() => setCommentsOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-3">
              {(shortComments[currentShort.id] || []).map((c, i) => (
                <div key={i} className="text-xs">
                  <span className="font-semibold text-zinc-300">{c.author}</span>
                  <span className="text-zinc-500 text-[10px] ml-2">{c.time}</span>
                  <p className="text-zinc-200 mt-0.5">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Add input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <input
                type="text"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-zinc-800 text-white text-xs px-3 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <button
                type="submit"
                className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
