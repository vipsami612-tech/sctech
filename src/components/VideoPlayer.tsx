import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Settings as SettingsIcon,
  Subtitles,
  SkipForward,
  Pipette,
  Maximize2,
  PictureInPicture2,
  Check,
  SmilePlus
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LiveReaction, ReactionType, Video } from '../types';
import { useApp } from '../context/AppContext';
import { subscribeToLiveReactions } from '../services/videoService';

export const LIVE_REACTION_OPTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'heart', emoji: '❤️', label: 'Heart' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'clap', emoji: '👏', label: 'Clap' },
  { type: 'laugh', emoji: '😂', label: 'Laugh' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'rocket', emoji: '🚀', label: 'Rocket' }
];

interface FloatingReactionParticle {
  key: string;
  emoji: string;
  rightPct: number;
  driftX: number;
  riseY: number;
  scale: number;
  durationSec: number;
}

interface VideoPlayerProps {
  video: Video;
  isTheater: boolean;
  onToggleTheater: () => void;
  onNextVideo?: () => void;
  autoPlay?: boolean;
  initialTimeSec?: number;
  onTimeSync?: (timeSeconds: number) => void;
  onProgressSync?: (currentTime: number, duration: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isTheater,
  onToggleTheater,
  onNextVideo,
  autoPlay = true,
  initialTimeSec,
  onTimeSync,
  onProgressSync
}) => {
  const { addToHistory, setMiniPlayerState, navigate, sendVideoReaction, t } = useApp();
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(video.duration || 100);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p 60fps HD');
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [bufferedPercent, setBufferedPercent] = useState<number>(0);
  const [playRipple, setPlayRipple] = useState<'play' | 'pause' | null>(null);
  const [showFloatingReactions, setShowFloatingReactions] = useState<boolean>(true);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReactionParticle[]>([]);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const seenReactionIdsRef = useRef<Set<string>>(new Set());
  const isInitialReactionLoadRef = useRef<boolean>(true);
  const hasSeekedInitialRef = useRef<boolean>(false);

  useEffect(() => {
    hasSeekedInitialRef.current = false;
  }, [video.id]);

  const spawnFloatingEmoji = useCallback((emoji: string, sourceId?: string) => {
    if (sourceId) {
      if (seenReactionIdsRef.current.has(sourceId)) return;
      seenReactionIdsRef.current.add(sourceId);
    }

    const particle: FloatingReactionParticle = {
      key: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      emoji,
      rightPct: 5 + Math.random() * 18,
      driftX: (Math.random() - 0.5) * 68,
      riseY: 220 + Math.random() * 120,
      scale: 0.92 + Math.random() * 0.36,
      durationSec: 2.0 + Math.random() * 0.65
    };

    setFloatingReactions(prev => [...prev.slice(-40), particle]);

    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(p => p.key !== particle.key));
    }, 2800);
  }, []);

  // Listen to real-time live reactions (Firestore + local custom event + cross-tab BroadcastChannel)
  useEffect(() => {
    seenReactionIdsRef.current = new Set();
    isInitialReactionLoadRef.current = true;
    setFloatingReactions([]);

    const unsubFirestore = subscribeToLiveReactions(video.id, reactions => {
      if (isInitialReactionLoadRef.current) {
        reactions.forEach(r => seenReactionIdsRef.current.add(r.id));
        isInitialReactionLoadRef.current = false;
        return;
      }

      const cutoff = Date.now() - 12000;
      reactions.forEach(r => {
        const createdMs = new Date(r.createdAt || 0).getTime();
        if (!seenReactionIdsRef.current.has(r.id) && createdMs >= cutoff) {
          spawnFloatingEmoji(r.emoji, r.id);
        } else {
          seenReactionIdsRef.current.add(r.id);
        }
      });
    });

    const handleLocalReaction = (e: Event) => {
      const detail = (e as CustomEvent<LiveReaction>).detail;
      if (detail && detail.videoId === video.id) {
        spawnFloatingEmoji(detail.emoji, detail.id);
      }
    };

    window.addEventListener('svtech:live-reaction', handleLocalReaction);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('svtech_live_reactions');
        bc.onmessage = (msg: MessageEvent<LiveReaction>) => {
          const r = msg.data;
          if (r && r.videoId === video.id) {
            spawnFloatingEmoji(r.emoji, r.id);
          }
        };
      } catch {
        bc = null;
      }
    }

    return () => {
      unsubFirestore();
      window.removeEventListener('svtech:live-reaction', handleLocalReaction);
      if (bc) bc.close();
    };
  }, [video.id, spawnFloatingEmoji]);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const s = Math.floor(secs);
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Activity timer to hide controls
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2500);
    }
  };

  // Toggle play / pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setPlayRipple('play');
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setPlayRipple('pause');
    }
    setTimeout(() => setPlayRipple(null), 600);
  }, []);

  // Update volume
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Scrubber click / drag
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleScrubberHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Picture in Picture
  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // Fallback to floating miniplayer
      setMiniPlayerState({
        active: true,
        video,
        isPlaying,
        currentTime
      });
      navigate('home', { keepMiniPlayer: true });
    }
  };

  // Change speed
  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettingsMenu(false);
  };

  // Video time update handler
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || duration;
    setCurrentTime(cur);
    if (onTimeSync) {
      onTimeSync(cur);
    }
    if (onProgressSync && dur > 0) {
      onProgressSync(cur, dur);
    }

    // Update history progress periodically with resume timestamp
    if (Math.floor(cur) % 5 === 0 && dur > 0) {
      const pct = Math.round((cur / dur) * 100);
      addToHistory(video.id, pct, cur);
    }

    // Buffer percentage
    if (videoRef.current.buffered.length > 0 && dur > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedPercent((bufferedEnd / dur) * 100);
    }
  };

  // Video loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || video.duration;
      setDuration(dur);
      if (
        !hasSeekedInitialRef.current &&
        initialTimeSec &&
        initialTimeSec > 2 &&
        dur > 0 &&
        initialTimeSec < dur - 5
      ) {
        videoRef.current.currentTime = initialTimeSec;
        setCurrentTime(initialTimeSec);
        hasSeekedInitialRef.current = true;
      }
      if (autoPlay) {
        videoRef.current.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      }
    }
  };

  // Video ended
  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (onNextVideo) {
      onNextVideo();
    }
  };

  // Global keydown listeners for YouTube standard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs or textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 't') {
        e.preventDefault();
        onToggleTheater();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'j') {
        if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10);
      } else if (e.key === 'l') {
        if (videoRef.current) videoRef.current.currentTime = Math.min(duration, currentTime + 10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, currentTime, duration, onToggleTheater]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setControlsVisible(false)}
      className={`relative select-none bg-black overflow-hidden group shadow-2xl ${
        isTheater
          ? 'w-full max-h-[80vh] aspect-[21/9] sm:aspect-video'
          : 'w-full aspect-video rounded-2xl'
      }`}
    >
      {/* HTML5 Native Video Stream */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        playsInline
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnded}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Ripple Animation Indicator on Click */}
      {playRipple && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white scale-110 animate-ping">
            {playRipple === 'play' ? (
              <Play className="w-8 h-8 fill-white ml-1" />
            ) : (
              <Pause className="w-8 h-8 fill-white" />
            )}
          </div>
        </div>
      )}

      {/* Closed Caption / Subtitle Overlay */}
      {subtitlesEnabled && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none px-6">
          <span className="px-3 py-1 bg-black/85 text-yellow-300 font-sans text-sm sm:text-base font-semibold rounded shadow-md tracking-wide">
            [Captions active: audio narration synchronized in English]
          </span>
        </div>
      )}

      {/* Floating Live Reactions Overlay */}
      {showFloatingReactions && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-hidden z-20"
        >
          <AnimatePresence>
            {floatingReactions.map(particle => (
              <motion.div
                key={particle.key}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0, scale: 0.9 }
                    : { opacity: 0, y: 0, x: 0, scale: 0.6 }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: [0, 1, 0], scale: 1 }
                    : {
                        opacity: [0, 1, 1, 0],
                        y: -particle.riseY,
                        x: [0, particle.driftX * 0.45, particle.driftX],
                        scale: [0.65, particle.scale * 1.15, particle.scale]
                      }
                }
                exit={{ opacity: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.9 : particle.durationSec,
                  ease: 'easeOut'
                }}
                style={{ right: `${particle.rightPct}%`, bottom: '68px' }}
                className="absolute text-2xl sm:text-3xl select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] will-change-transform"
              >
                {particle.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CONTROLS OVERLAY (Auto-hiding) */}
      <div
        className={`absolute inset-0 z-30 flex flex-col justify-between pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity duration-300 ${
          controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top bar title (visible in fullscreen) */}
        <div className="p-4 pointer-events-auto">
          {isFullscreen && (
            <h2 className="text-white text-base sm:text-lg font-semibold truncate drop-shadow-md">
              {video.title}
            </h2>
          )}
        </div>

        {/* Center click area + Quick Player Reaction Dock (bottom-right above controls) */}
        <div className="flex-1 flex items-end justify-end px-4 pb-2">
          {showFloatingReactions && (
            <div
              onClick={e => e.stopPropagation()}
              className="pointer-events-auto hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/15 shadow-lg"
            >
              {LIVE_REACTION_OPTIONS.map(opt => (
                <button
                  key={opt.type}
                  type="button"
                  title={opt.label}
                  aria-label={`React ${opt.label}`}
                  onClick={() => sendVideoReaction(video.id, opt.type, opt.emoji, currentTime)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-base hover:bg-white/20 active:scale-125 transition-transform"
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Controls Bar */}
        <div className="px-4 pb-3 pt-4 pointer-events-auto flex flex-col gap-2">
          {/* Progress / Scrubber Bar */}
          <div
            ref={progressRef}
            onClick={handleScrub}
            onMouseMove={handleScrubberHover}
            onMouseLeave={() => setHoverTime(null)}
            className="relative h-1 hover:h-2 group/scrubber cursor-pointer bg-white/20 rounded-full transition-all flex items-center"
          >
            {/* Buffer progress bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-white/30 rounded-full pointer-events-none"
              style={{ width: `${bufferedPercent}%` }}
            />

            {/* Current progress bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-red-600 rounded-full pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Scrubber thumb handle */}
            <div
              className="absolute w-3.5 h-3.5 bg-red-600 rounded-full -ml-1.5 shadow-md scale-0 group-hover/scrubber:scale-100 transition-transform pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />

            {/* Hover time preview tooltip */}
            {hoverTime !== null && (
              <div
                className="absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/90 text-white text-[11px] font-mono pointer-events-none"
                style={{ left: `${hoverPosition}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* Button Controls Row */}
          <div className="flex items-center justify-between text-white">
            {/* Left buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Play / Pause button */}
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white" />
                )}
              </button>

              {/* Next video button */}
              {onNextVideo && (
                <button
                  onClick={onNextVideo}
                  aria-label="Next video"
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <SkipForward className="w-5 h-5 fill-white" />
                </button>
              )}

              {/* Volume Slider Group */}
              <div className="flex items-center group/vol">
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <div className="w-0 group-hover/vol:w-20 transition-all duration-200 overflow-hidden flex items-center ml-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-18 h-1 bg-white/40 accent-red-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Timestamp Indicator */}
              <div className="text-xs font-mono tabular-nums text-white/90">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1 text-white/40">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Floating Live Reactions Visibility Toggle */}
              <button
                type="button"
                onClick={() => setShowFloatingReactions(prev => !prev)}
                title={
                  showFloatingReactions
                    ? t.liveReactions?.toggleOn || 'Hide floating reactions'
                    : t.liveReactions?.toggleOff || 'Show floating reactions'
                }
                aria-label="Toggle live reactions"
                className={`p-1.5 rounded transition-colors ${
                  showFloatingReactions
                    ? 'border-b-2 border-rose-500 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <SmilePlus className="w-5 h-5" />
              </button>

              {/* Closed Captions toggle */}
              <button
                onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                title="Subtitles / closed captions (c)"
                className={`p-1.5 rounded transition-colors ${
                  subtitlesEnabled
                    ? 'border-b-2 border-red-600 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Subtitles className="w-5 h-5" />
              </button>

              {/* Settings Menu Gear */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  title="Playback settings"
                  className="p-1.5 rounded-full hover:bg-white/20 text-white/90 transition-colors"
                >
                  <SettingsIcon className="w-5 h-5" />
                </button>

                {showSettingsMenu && (
                  <div className="absolute right-0 bottom-12 w-56 bg-zinc-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-zinc-700/80 p-2 z-50 text-xs text-white">
                    <div className="px-2 py-1 font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                      Playback Speed
                    </div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        onClick={() => changeSpeed(speed)}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded hover:bg-white/10 transition-colors text-left"
                      >
                        <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                        {playbackSpeed === speed && <Check className="w-3.5 h-3.5 text-red-500" />}
                      </button>
                    ))}

                    <div className="my-1.5 h-px bg-zinc-700" />
                    <div className="px-2 py-1 font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                      Resolution Quality
                    </div>
                    {['1080p 60fps HD', '720p HD', '480p Auto'].map(qual => (
                      <button
                        key={qual}
                        onClick={() => {
                          setSelectedQuality(qual);
                          setShowSettingsMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded hover:bg-white/10 transition-colors text-left"
                      >
                        <span>{qual}</span>
                        {selectedQuality === qual && <Check className="w-3.5 h-3.5 text-red-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Picture in Picture */}
              <button
                onClick={togglePictureInPicture}
                title="Picture-in-picture / Miniplayer"
                className="p-1.5 rounded-full hover:bg-white/20 text-white/90 transition-colors hidden sm:block"
              >
                <PictureInPicture2 className="w-5 h-5" />
              </button>

              {/* Theater Mode Toggle */}
              <button
                onClick={onToggleTheater}
                title="Theater mode (t)"
                className="p-1.5 rounded-full hover:bg-white/20 text-white/90 transition-colors hidden md:block"
              >
                <Maximize2 className="w-5 h-5" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                title="Fullscreen (f)"
                className="p-1.5 rounded-full hover:bg-white/20 text-white/90 transition-colors"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
