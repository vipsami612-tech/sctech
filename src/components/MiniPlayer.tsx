import React, { useRef, useEffect } from 'react';
import { Play, Pause, X, Maximize2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MiniPlayer: React.FC = () => {
  const { miniPlayer, setMiniPlayerState, closeMiniPlayer, restoreFromMiniPlayer } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (miniPlayer.active && videoRef.current && miniPlayer.video) {
      if (miniPlayer.currentTime) {
        videoRef.current.currentTime = miniPlayer.currentTime;
      }
      if (miniPlayer.isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [miniPlayer.active, miniPlayer.video]);

  if (!miniPlayer.active || !miniPlayer.video) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setMiniPlayerState({ isPlaying: true });
    } else {
      videoRef.current.pause();
      setMiniPlayerState({ isPlaying: false });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 sm:w-80 rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 border border-zinc-800 text-white animate-in slide-in-from-bottom-5">
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black">
        <video
          ref={videoRef}
          src={miniPlayer.video.videoUrl}
          playsInline
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Hover / Overlay Bar */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <button
            onClick={restoreFromMiniPlayer}
            title="Expand to Watch Page"
            className="p-1 rounded-full bg-black/60 hover:bg-black text-white"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={closeMiniPlayer}
            title="Close miniplayer"
            className="p-1 rounded-full bg-black/60 hover:bg-black text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="p-2.5 flex items-center justify-between gap-2 bg-zinc-900">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate">
            {miniPlayer.video.title}
          </p>
          <p className="text-[10px] text-zinc-400 truncate">
            {miniPlayer.video.channel.name}
          </p>
        </div>

        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white shrink-0"
        >
          {miniPlayer.isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-white" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
