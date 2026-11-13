import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  MoreVertical,
  Clock,
  ListPlus,
  Share2,
  Film,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { Video } from '../types';
import { useApp } from '../context/AppContext';

interface VideoCardProps {
  video: Video;
  layout?: 'grid' | 'horizontal';
  showChannelAvatar?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  layout = 'grid',
  showChannelAvatar = true
}) => {
  const {
    navigate,
    toggleWatchLater,
    watchLaterVideoIds,
    setShareModalVideo,
    setPlaylistModalVideo,
    isPurchased,
    currentUser,
    userProfile,
    isAdmin
  } = useApp();

  const isPro = video.accessType === 'pro' || video.isPremium;
  const isOwner = Boolean(
    currentUser &&
      ((video.ownerUid && video.ownerUid === currentUser.uid) ||
        (userProfile.channelId && video.channel.id === userProfile.channelId) ||
        video.channel.id === currentUser.uid)
  );
  const userHasAccess = !isPro || (currentUser && isPurchased(video.id)) || isAdmin || isOwner;

  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSavedWatchLater = watchLaterVideoIds.includes(video.id);

  useEffect(() => {
    setThumbError(false);
  }, [video.thumbnailUrl]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const handleCardClick = () => {
    navigate('watch', { videoId: video.id });
  };

  if (layout === 'horizontal') {
    return (
      <div
        className="flex flex-col sm:flex-row gap-4 group cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Thumbnail / Cover container */}
        <div className="relative w-full sm:w-64 md:w-80 aspect-video rounded-xl overflow-hidden bg-zinc-900 shrink-0 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
          {video.thumbnailUrl && !thumbError ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              referrerPolicy="no-referrer"
              onError={() => setThumbError(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isPro && !userHasAccess ? 'contrast-[1.08] saturate-90' : ''}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Film className="w-5 h-5 text-rose-500" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  {video.category}
                </span>
              </div>
              <p className="text-xs font-display font-semibold text-white line-clamp-2">
                {video.title}
              </p>
            </div>
          )}

          {/* PRO Overlay Badge */}
          {isPro && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[11px] font-black uppercase tracking-wider shadow-md shadow-amber-500/20">
                <Lock className="w-3 h-3 text-black stroke-[2.5]" />
                PRO
              </span>
              {video.price && video.price > 0 && !userHasAccess && (
                <span className="px-2 py-0.5 rounded-md bg-zinc-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[11px] font-mono tabular-nums font-bold">
                  {video.price} {video.currency || 'ETB'}
                </span>
              )}
              {userHasAccess && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-semibold backdrop-blur-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  UNLOCKED
                </span>
              )}
            </div>
          )}

          {/* Video Duration Badge */}
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[11px] font-mono tabular-nums font-medium tracking-tight">
            {video.durationFormatted}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start gap-2">
              <h3 className="font-display font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 transition-colors flex-1">
                {video.title}
              </h3>
            </div>
            <div className="flex items-center flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              <span className="font-mono tabular-nums">{formatViews(video.views)} views</span>
              <span aria-hidden="true">·</span>
              <span>{video.uploadDate}</span>
              <span aria-hidden="true">·</span>
              {isPro ? (
                <span className={`font-mono tabular-nums font-bold ${userHasAccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {userHasAccess ? 'Purchased / Unlocked' : `${video.price || 100} ${video.currency || 'ETB'}`}
                </span>
              ) : (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Free
                </span>
              )}
            </div>

            <div
              onClick={e => {
                e.stopPropagation();
                navigate('channel', { channelId: video.channel.id });
              }}
              className="flex items-center gap-2 mt-3 hover:text-zinc-900 dark:hover:text-white"
            >
              {video.channel.avatarUrl && !avatarError ? (
                <img
                  src={video.channel.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-white text-[10px] font-bold flex items-center justify-center">
                  {(video.channel.name || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 truncate">
                {video.channel.name}
              </span>
              {video.channel.verified && (
                <Check className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
              {video.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Card (Default YouTube Home Feed)
  return (
    <div
      className="flex flex-col group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* 16:9 Cover / Thumbnail Area */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
        {video.thumbnailUrl && !thumbError ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            referrerPolicy="no-referrer"
            onError={() => setThumbError(true)}
            className={`w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ${isPro && !userHasAccess ? 'contrast-[1.08] saturate-95' : ''}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Film className="w-5 h-5 text-rose-500" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                {video.category}
              </span>
            </div>
            <p className="text-sm font-display font-semibold text-white line-clamp-2">
              {video.title}
            </p>
          </div>
        )}

        {/* PRO Access Badge overlay */}
        {isPro && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[11px] font-black uppercase tracking-wider shadow-lg shadow-amber-500/25">
              <Lock className="w-3 h-3 text-black stroke-[2.5]" />
              PRO
            </span>
            {video.price && video.price > 0 && !userHasAccess && (
              <span className="px-2 py-0.5 rounded-lg bg-zinc-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[11px] font-mono tabular-nums font-bold shadow-md">
                {video.price} {video.currency || 'ETB'}
              </span>
            )}
            {userHasAccess && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600/90 text-white text-[10px] font-semibold shadow-md backdrop-blur-sm">
                <CheckCircle2 className="w-3 h-3" />
                UNLOCKED
              </span>
            )}
          </div>
        )}

        {/* Video Duration Badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 text-white text-[11px] font-mono tabular-nums font-medium tracking-tight">
          {video.durationFormatted}
        </div>

        {/* Quick action buttons on hover */}
        {isHovered && (
          <div
            className="absolute top-2 right-2 flex flex-col gap-1 z-10"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => toggleWatchLater(video.id)}
              title={isSavedWatchLater ? 'Remove from Watch Later' : 'Watch Later'}
              className={`p-1.5 rounded-md backdrop-blur-md transition-colors ${
                isSavedWatchLater
                  ? 'bg-red-600 text-white'
                  : 'bg-black/70 hover:bg-black text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPlaylistModalVideo(video)}
              title="Add to playlist"
              className="p-1.5 rounded-md bg-black/70 hover:bg-black text-white backdrop-blur-md transition-colors"
            >
              <ListPlus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Video Details Bar */}
      <div className="flex gap-3 mt-3 items-start">
        {showChannelAvatar && (
          <div
            onClick={e => {
              e.stopPropagation();
              navigate('channel', { channelId: video.channel.id });
            }}
            className="shrink-0 pt-0.5 hover:opacity-80 transition-opacity"
          >
            {video.channel.avatarUrl && !avatarError ? (
              <img
                src={video.channel.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-800 text-white text-xs font-bold flex items-center justify-center">
                {(video.channel.name || 'S').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-display font-medium text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {video.title}
          </h3>

          <div
            onClick={e => {
              e.stopPropagation();
              navigate('channel', { channelId: video.channel.id });
            }}
            className="flex items-center gap-1.5 mt-1 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
              {video.channel.name}
            </span>
            {video.channel.verified && (
              <Check className="w-3 h-3 text-zinc-400" />
            )}
          </div>

          <div className="flex items-center flex-wrap gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            <span className="font-mono tabular-nums">{formatViews(video.views)} views</span>
            <span aria-hidden="true">·</span>
            <span>{video.uploadDate}</span>
            <span aria-hidden="true">·</span>
            {isPro ? (
              <span className={`font-mono tabular-nums font-bold ${userHasAccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {userHasAccess ? 'Unlocked' : `${video.price || 100} ${video.currency || 'ETB'}`}
              </span>
            ) : (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Free
              </span>
            )}
          </div>
        </div>

        {/* Three dots dropdown */}
        <div ref={menuRef} className="relative shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-opacity"
            aria-label="Action menu"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-6 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 py-1.5 z-20">
              <button
                onClick={() => {
                  toggleWatchLater(video.id);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
              >
                <Clock className="w-4 h-4 text-zinc-400" />
                {isSavedWatchLater ? 'Remove from Watch Later' : 'Save to Watch Later'}
              </button>
              <button
                onClick={() => {
                  setPlaylistModalVideo(video);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
              >
                <ListPlus className="w-4 h-4 text-zinc-400" />
                Save to playlist
              </button>
              <button
                onClick={() => {
                  setShareModalVideo(video);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
              >
                <Share2 className="w-4 h-4 text-zinc-400" />
                Share video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
