import React, { useMemo, useState } from 'react';
import {
  Flame,
  TrendingUp,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  Play,
  Lock,
  Check,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Video } from '../types';

type TrendingSortKey = 'engagement' | 'views24h' | 'growth' | 'interactions';

interface EnrichedTrendingVideo {
  video: Video;
  views24h: number;
  likes24h: number;
  comments24h: number;
  reactions24h: number;
  shares24h: number;
  interactions24h: number;
  engagementScore: number;
  growthRate24h: number;
}

export const TrendingView: React.FC = () => {
  const {
    videos,
    recentEngagementEvents,
    navigate,
    setShareModalVideo,
    trackVideoShare,
    isPurchased,
    currentUser,
    userProfile,
    isAdmin,
    t
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<TrendingSortKey>('engagement');

  const formatCompact = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Group live 24h events from Firestore by videoId & type
  const eventsByVideo = useMemo(() => {
    const map: Record<
      string,
      { view: number; like: number; comment: number; reaction: number; share: number; total: number }
    > = {};
    for (const ev of recentEngagementEvents) {
      if (!ev.videoId) continue;
      if (!map[ev.videoId]) {
        map[ev.videoId] = { view: 0, like: 0, comment: 0, reaction: 0, share: 0, total: 0 };
      }
      if (ev.type in map[ev.videoId]) {
        map[ev.videoId][ev.type] += 1;
      }
      map[ev.videoId].total += 1;
    }
    return map;
  }, [recentEngagementEvents]);

  const categories = useMemo(() => {
    const unique = new Set<string>(['All']);
    videos.forEach(v => {
      if (v.status !== 'draft' && v.visibility !== 'private' && v.category) {
        unique.add(v.category);
      }
    });
    return Array.from(unique);
  }, [videos]);

  const rankedVideos = useMemo<EnrichedTrendingVideo[]>(() => {
    const visible = videos.filter(v => {
      if (v.status === 'draft' || v.visibility === 'private') return false;
      if (selectedCategory !== 'All' && v.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      return true;
    });

    const enriched: EnrichedTrendingVideo[] = visible.map(video => {
      const ev = eventsByVideo[video.id] || {
        view: 0,
        like: 0,
        comment: 0,
        reaction: 0,
        share: 0,
        total: 0
      };

      // Use real-time 24h counters if available, or deterministic baseline + live events for older docs
      const views24h =
        video.views24h !== undefined
          ? Math.max(video.views24h, ev.view)
          : Math.max(15, Math.round((video.views || 0) * 0.12)) + ev.view;

      const likes24h =
        video.likes24h !== undefined
          ? Math.max(video.likes24h, ev.like)
          : Math.max(2, Math.round((video.likes || 0) * 0.14)) + ev.like;

      const comments24h =
        video.comments24h !== undefined
          ? Math.max(video.comments24h, ev.comment)
          : Math.max(1, Math.round((video.commentsCount || 0) * 0.18)) + ev.comment;

      const reactions24h =
        video.reactions24h !== undefined
          ? Math.max(video.reactions24h, ev.reaction)
          : Math.max(video.reactionsCount || 0, Math.round((video.likes || 0) * 0.05)) + ev.reaction;

      const shares24h =
        video.shares24h !== undefined
          ? Math.max(video.shares24h, ev.share)
          : Math.max(1, Math.round((video.likes || 0) * 0.03)) + ev.share;

      const interactions24h = likes24h + comments24h + reactions24h + shares24h;

      const engagementScore =
        views24h +
        likes24h * 8 +
        comments24h * 12 +
        reactions24h * 6 +
        shares24h * 15;

      const baseGrowth =
        video.growthRate24h !== undefined
          ? video.growthRate24h
          : Number((((views24h + interactions24h * 4) / Math.max(100, video.views || 100)) * 100).toFixed(1));

      const growthRate24h = Number(
        Math.min(999, baseGrowth + Math.min(40, ev.total * 1.5)).toFixed(1)
      );

      return {
        video,
        views24h,
        likes24h,
        comments24h,
        reactions24h,
        shares24h,
        interactions24h,
        engagementScore,
        growthRate24h
      };
    });

    enriched.sort((a, b) => {
      if (sortBy === 'views24h') return b.views24h - a.views24h;
      if (sortBy === 'growth') return b.growthRate24h - a.growthRate24h;
      if (sortBy === 'interactions') return b.interactions24h - a.interactions24h;
      return b.engagementScore - a.engagementScore;
    });

    return enriched;
  }, [videos, eventsByVideo, selectedCategory, sortBy]);

  const kpis = useMemo(() => {
    const totalViews24h = rankedVideos.reduce((acc, item) => acc + item.views24h, 0);
    const totalInteractions24h = rankedVideos.reduce((acc, item) => acc + item.interactions24h, 0);
    const peakGrowth = rankedVideos.reduce((max, item) => Math.max(max, item.growthRate24h), 0);
    return {
      totalViews24h,
      totalInteractions24h,
      peakGrowth,
      activeStreams: rankedVideos.length
    };
  }, [rankedVideos]);

  const sortOptions: { key: TrendingSortKey; label: string }[] = [
    { key: 'engagement', label: t.trendingView?.sortEngagement || 'Top Engagement' },
    { key: 'views24h', label: t.trendingView?.sortViews || 'Most Watched (24h)' },
    { key: 'growth', label: t.trendingView?.sortGrowth || 'Fastest Growing' },
    { key: 'interactions', label: t.trendingView?.sortInteractions || 'Most Interacted' }
  ];

  const checkAccess = (video: Video) => {
    const isPro = video.accessType === 'pro' || video.isPremium;
    const isOwner = Boolean(
      currentUser &&
        ((video.ownerUid && video.ownerUid === currentUser.uid) ||
          (userProfile.channelId && video.channel.id === userProfile.channelId) ||
          video.channel.id === currentUser.uid)
    );
    const unlocked = !isPro || (currentUser && isPurchased(video.id)) || isAdmin || isOwner;
    return { isPro, unlocked };
  };

  const spotlight = rankedVideos[0];
  const restRanked = rankedVideos.slice(1);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-zinc-950 dark:text-white tracking-tight">
                {t.trendingView?.title || 'Trending'}
              </h1>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t.trendingView?.realtimeBadge || 'Last 24 hours · Live ranking'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {t.trendingView?.subtitle || 'Most watched and interacted streams over the last 24 hours'}
            </p>
          </div>
        </div>

        {/* Sort Segmented Controls */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-x-auto no-scrollbar">
          {sortOptions.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortBy(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                sortBy === opt.key
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
              selectedCategory === cat
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
                : 'bg-white dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4-Column 24h Real-Time KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{t.trendingView?.kpiViews24h || '24h Views'}</span>
            <Eye className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="mt-2 font-mono tabular-nums font-bold text-xl sm:text-2xl text-zinc-950 dark:text-white">
            {formatCompact(kpis.totalViews24h)}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{t.trendingView?.kpiInteractions24h || '24h Interactions'}</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="mt-2 font-mono tabular-nums font-bold text-xl sm:text-2xl text-zinc-950 dark:text-white">
            {formatCompact(kpis.totalInteractions24h)}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{t.trendingView?.kpiPeakGrowth || 'Peak 24h Growth'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-mono tabular-nums font-bold text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400">
            +{kpis.peakGrowth}%
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{t.trendingView?.kpiActiveStreams || 'Trending Streams'}</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <p className="mt-2 font-mono tabular-nums font-bold text-xl sm:text-2xl text-zinc-950 dark:text-white">
            {kpis.activeStreams}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {rankedVideos.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <Flame className="w-10 h-10 mx-auto text-zinc-400 opacity-50" />
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {t.trendingView?.noTrending || 'No trending streams match this category in the last 24 hours.'}
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
          >
            {t.trendingView?.resetFilter || 'Show All Categories'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* #1 SPOTLIGHT STREAM */}
          {spotlight && (() => {
            const { isPro, unlocked } = checkAccess(spotlight.video);
            return (
              <div
                onClick={() => navigate('watch', { videoId: spotlight.video.id })}
                className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                {/* Thumbnail */}
                <div className="lg:col-span-5 relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
                  <img
                    src={spotlight.video.thumbnailUrl}
                    alt={spotlight.video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-mono tabular-nums font-bold text-xs shadow-md">
                      #01
                    </span>
                    {isPro && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[11px] font-black uppercase tracking-wider shadow-md">
                        {unlocked ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            PRO
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 stroke-[2.5]" />
                            PRO · {spotlight.video.price || 100} {spotlight.video.currency || 'ETB'}
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/85 text-white text-xs font-mono tabular-nums">
                    {spotlight.video.durationFormatted}
                  </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-7 flex flex-col justify-between py-1 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{spotlight.growthRate24h}% {t.trendingView?.growthLabel || 'growth'}
                      </span>
                      <span className="text-zinc-400" aria-hidden="true">·</span>
                      <span className="text-zinc-600 dark:text-zinc-300">
                        {t.trendingView?.engagementScore || 'Engagement Score'}:{' '}
                        {formatCompact(spotlight.engagementScore)}
                      </span>
                    </div>

                    <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug">
                      {spotlight.video.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          navigate('channel', { channelId: spotlight.video.channel.id });
                        }}
                        className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-200 hover:underline"
                      >
                        <img
                          src={spotlight.video.channel.avatarUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{spotlight.video.channel.name}</span>
                        {spotlight.video.channel.verified && (
                          <Check className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                      </button>
                      <span aria-hidden="true">·</span>
                      <span>{spotlight.video.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatCompact(spotlight.views24h)} {t.trendingView?.views24hLabel || 'views (24h)'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatCompact(spotlight.interactions24h)} {t.trendingView?.interactions24hLabel || 'interactions'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {spotlight.video.description}
                    </p>
                  </div>

                  {/* Action & Granular 24h Breakdown */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        {formatCompact(spotlight.likes24h)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                        {formatCompact(spotlight.comments24h)}
                      </span>
                      <span>
                        🔥 {formatCompact(spotlight.reactions24h)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          trackVideoShare(spotlight.video.id);
                          setShareModalVideo(spotlight.video);
                        }}
                        className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{t.common.share}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('watch', { videoId: spotlight.video.id })}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{t.trendingView?.watchNow || 'Watch Now'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* RANK #2+ LEADERBOARD ROWS */}
          {restRanked.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200/80 dark:divide-zinc-800/80 bg-white dark:bg-zinc-900/30">
              {restRanked.map((item, idx) => {
                const rank = idx + 2;
                const { isPro, unlocked } = checkAccess(item.video);
                return (
                  <div
                    key={item.video.id}
                    onClick={() => navigate('watch', { videoId: item.video.id })}
                    className="group cursor-pointer p-4 flex flex-col sm:flex-row items-start gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/35 transition-colors"
                  >
                    {/* Rank Number */}
                    <div className="hidden md:flex w-10 pt-1 shrink-0 items-center justify-center">
                      <span className="font-mono tabular-nums font-bold text-lg text-zinc-400 dark:text-zinc-500 group-hover:text-rose-500 transition-colors">
                        {rank < 10 ? `0${rank}` : rank}
                      </span>
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-full sm:w-56 md:w-64 aspect-video rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                      <img
                        src={item.video.thumbnailUrl}
                        alt={item.video.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="md:hidden absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono tabular-nums font-bold text-[11px]">
                        #{rank}
                      </span>
                      {isPro && (
                        <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] font-black uppercase tracking-wider shadow">
                          {unlocked ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3 stroke-[2.5]" />
                          )}
                          <span>PRO</span>
                        </span>
                      )}
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[11px] font-mono tabular-nums">
                        {item.video.durationFormatted}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                      <div>
                        <h3 className="font-display font-semibold text-base text-zinc-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2">
                          {item.video.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              navigate('channel', { channelId: item.video.channel.id });
                            }}
                            className="font-medium text-zinc-700 dark:text-zinc-300 hover:underline inline-flex items-center gap-1"
                          >
                            <span>{item.video.channel.name}</span>
                            {item.video.channel.verified && (
                              <Check className="w-3 h-3 text-zinc-400" />
                            )}
                          </button>
                          <span aria-hidden="true">·</span>
                          <span>{item.video.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                            {formatCompact(item.views24h)} {t.trendingView?.views24hLabel || 'views (24h)'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {formatCompact(item.interactions24h)} {t.trendingView?.interactions24hLabel || 'interactions'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
                            <ArrowUpRight className="w-3.5 h-3.5" />+{item.growthRate24h}%
                          </span>
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                          {item.video.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                          <span>❤️ {formatCompact(item.likes24h)}</span>
                          <span>💬 {formatCompact(item.comments24h)}</span>
                          <span>🔥 {formatCompact(item.reactions24h)}</span>
                          {isPro && !unlocked && (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              {item.video.price || 100} {item.video.currency || 'ETB'}
                            </span>
                          )}
                        </div>

                        <div
                          className="flex items-center gap-2"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              trackVideoShare(item.video.id);
                              setShareModalVideo(item.video);
                            }}
                            title={t.common.share}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
