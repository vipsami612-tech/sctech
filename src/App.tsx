import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CategoryChips } from './components/CategoryChips';
import { VideoCard } from './components/VideoCard';
import { WatchPage } from './components/WatchPage';
import { ShortsView } from './components/ShortsView';
import { ChannelPage } from './components/ChannelPage';
import { SearchPage } from './components/SearchPage';
import { LibraryViews } from './components/LibraryViews';
import { AdminDashboard } from './components/AdminDashboard';
import { CreatorDashboard } from './components/CreatorDashboard';
import { ModeratorDashboard } from './components/ModeratorDashboard';
import { AuthPages } from './components/AuthPages';
import { UploadModal } from './components/UploadModal';
import { ShareModal } from './components/ShareModal';
import { PlaylistModal } from './components/PlaylistModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { AuthModal } from './components/AuthModal';
import { MiniPlayer } from './components/MiniPlayer';
import { TrendingView } from './components/TrendingView';
import {
  PlaySquare,
  Tv,
  History,
  Megaphone,
  MailCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  X
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    viewMode,
    currentVideoId,
    currentChannelId,
    sidebarOpen,
    activeCategory,
    setActiveCategory,
    accessFilter,
    setAccessFilter,
    videos,
    shorts,
    channels,
    subscribedChannelIds,
    watchHistory,
    platformSettings,
    isAuthenticated,
    emailVerified,
    currentUser,
    toast,
    clearToast,
    navigate,
    t
  } = useApp();

  // Filter home feed videos based on selected category, access tier, and published status
  const visibleVideos = videos.filter(v => v.status !== 'draft' && v.visibility !== 'private');
  const filteredVideos = visibleVideos.filter(v => {
    const matchesCategory =
      activeCategory === 'All' ||
      v.category.toLowerCase() === activeCategory.toLowerCase();
    const isPro = v.accessType === 'pro' || Boolean(v.isPremium);
    const matchesAccess =
      accessFilter === 'all'
        ? true
        : accessFilter === 'pro'
        ? isPro
        : !isPro;
    return matchesCategory && matchesAccess;
  });

  // Continue watching items (partially watched)
  const continueWatchingVideos = watchHistory
    .filter(h => h.progressPercent >= 2 && h.progressPercent < 95)
    .map(h => {
      const vid = videos.find(v => v.id === h.videoId);
      return vid ? { video: vid, history: h } : null;
    })
    .filter(Boolean)
    .slice(0, 6) as { video: (typeof videos)[number]; history: (typeof watchHistory)[number] }[];

  // Subscriptions feed videos
  const subscribedVideos = videos.filter(v =>
    subscribedChannelIds.includes(v.channel.id)
  );

  const isAuthPage = [
    'signin',
    'signup',
    'forgot-password',
    'verify-email',
    'unauthorized'
  ].includes(viewMode);
  const isFullWidthPage = viewMode === 'watch' || viewMode === 'admin' || isAuthPage;

  const isPasswordUser = currentUser?.providerData?.[0]?.providerId === 'password';
  const showEmailVerifyBanner =
    isAuthenticated && !emailVerified && isPasswordUser && viewMode !== 'verify-email';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors selection:bg-rose-600 selection:text-white">
      {/* Top Bar Header */}
      <Header />

      {/* Email Verification Reminder Banner */}
      {showEmailVerifyBanner && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-300/60 dark:border-amber-800/60 px-4 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <MailCheck className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{t.auth.verifyDesc}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('verify-email')}
            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold shrink-0"
          >
            {t.auth.verifyTitle}
          </button>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Navigation Sidebar (hidden on Watch Page, Admin, & Auth pages for focused layout) */}
        {!isFullWidthPage && <Sidebar />}

        {/* Main Content Pane */}
        <main
          className={`flex-1 transition-all duration-300 ${
            !isFullWidthPage
              ? sidebarOpen
                ? 'lg:ml-60'
                : 'lg:ml-[72px]'
              : 'w-full'
          }`}
        >
          {/* 1. HOME VIEW */}
          {viewMode === 'home' && (
            <div>
              <CategoryChips />

              <div className="p-4 sm:p-6 max-w-[2000px] mx-auto space-y-10">
                {/* Optional Featured Platform Announcement Banner */}
                {platformSettings.featuredBannerEnabled &&
                  (platformSettings.featuredBannerTitle || platformSettings.featuredBannerText) && (
                    <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-700 to-zinc-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-base sm:text-lg">
                            {platformSettings.featuredBannerTitle}
                          </h2>
                          <p className="text-xs sm:text-sm text-white/85 mt-0.5">
                            {platformSettings.featuredBannerText}
                          </p>
                        </div>
                      </div>
                      {platformSettings.featuredBannerVideoId && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate('watch', { videoId: platformSettings.featuredBannerVideoId })
                          }
                          className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-100 shrink-0"
                        >
                          {t.trendingView.watchNow}
                        </button>
                      )}
                    </div>
                  )}

                {/* Continue Watching Shelf */}
                {continueWatchingVideos.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-rose-600" />
                        <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-white">
                          {t.home.continueWatching}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('history')}
                        className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                      >
                        {t.common.viewAll}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                      {continueWatchingVideos.map(({ video, history }) => (
                        <div
                          key={`cw_${video.id}`}
                          onClick={() => navigate('watch', { videoId: video.id })}
                          className="cursor-pointer group rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-rose-500/40 transition-all"
                        >
                          <div className="relative aspect-video bg-zinc-900">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                              <div
                                className="h-full bg-rose-600"
                                style={{ width: `${history.progressPercent}%` }}
                              />
                            </div>
                          </div>
                          <div className="p-2.5">
                            <p className="text-xs font-semibold text-zinc-900 dark:text-white line-clamp-1">
                              {video.title}
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                              {history.progressPercent}% watched
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* First Batch of Videos or Filtered Empty State */}
                {filteredVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
                    {filteredVideos.slice(0, 8).map(video => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 px-6 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {t.filters.noFilteredVideos}
                    </p>
                    <button
                      onClick={() => {
                        setActiveCategory('All');
                        setAccessFilter('all');
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                    >
                      {t.filters.resetFilters}
                    </button>
                  </div>
                )}

                {/* Shorts Shelf Carousel */}
                <div className="pt-4 pb-2 border-y border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <PlaySquare className="w-5 h-5 text-rose-600" />
                      <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-white">
                        SVTech Shorts
                      </h2>
                    </div>
                    <button
                      onClick={() => navigate('shorts')}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      View all shorts
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {shorts.slice(0, 6).map(short => (
                      <div
                        key={short.id}
                        onClick={() => navigate('shorts')}
                        className="group cursor-pointer aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 relative shadow-sm border border-zinc-200/40 dark:border-zinc-800/60"
                      >
                        <img
                          src={short.thumbnailUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent p-3 flex flex-col justify-end">
                          <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">
                            {short.title}
                          </p>
                          <span className="text-[10px] text-white/70 font-mono mt-1">
                            {short.likes.toLocaleString()} views
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Second Batch of Videos */}
                {filteredVideos.length > 8 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
                    {filteredVideos.slice(8).map(video => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. WATCH VIEW */}
          {viewMode === 'watch' && currentVideoId && (
            <WatchPage videoId={currentVideoId} />
          )}

          {/* 3. SHORTS VIEW */}
          {viewMode === 'shorts' && <ShortsView />}

          {/* 3b. TRENDING 24H ANALYTICS VIEW */}
          {viewMode === 'trending' && <TrendingView />}

          {/* 4. SUBSCRIPTIONS VIEW */}
          {viewMode === 'subscriptions' && (
            <div className="p-4 sm:p-6 max-w-[2000px] mx-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
                    {t.nav.subscriptions}
                  </h1>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Latest uploads from creators you follow on SVTech Media
                  </p>
                </div>
              </div>

              {/* Channel Avatars Strip */}
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
                {channels
                  .filter(c => subscribedChannelIds.includes(c.id))
                  .map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => navigate('channel', { channelId: channel.id })}
                      className="flex flex-col items-center gap-1.5 shrink-0 group"
                    >
                      <div className="w-14 h-14 rounded-full p-0.5 ring-2 ring-rose-600 group-hover:scale-105 transition-transform">
                        <img
                          src={channel.avatarUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 max-w-[70px] truncate">
                        {channel.name}
                      </span>
                    </button>
                  ))}
              </div>

              {/* Subscribed Videos Grid */}
              {subscribedVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
                  {subscribedVideos.map(video => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-zinc-400 space-y-3">
                  <Tv className="w-12 h-12 mx-auto stroke-1 opacity-40 mb-2" />
                  <p className="text-sm font-semibold">No uploads from your subscriptions yet</p>
                  <p className="text-xs text-zinc-500">
                    Subscribe to verified creators to see their streams here in real-time.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 5. CHANNEL VIEW */}
          {viewMode === 'channel' && currentChannelId && (
            <ChannelPage channelId={currentChannelId} />
          )}

          {/* 6. SEARCH VIEW */}
          {viewMode === 'search' && <SearchPage />}

          {/* 7. LIBRARY / HISTORY / LIKED / WATCH LATER / PLAYLISTS / DOWNLOADS / PURCHASES */}
          {[
            'history',
            'liked',
            'watchlater',
            'playlists',
            'playlist-detail',
            'your-videos',
            'downloads',
            'purchases'
          ].includes(viewMode) && <LibraryViews />}

          {/* 8. ROLE DASHBOARDS */}
          {viewMode === 'creator-dashboard' && <CreatorDashboard />}
          {viewMode === 'moderator-dashboard' && <ModeratorDashboard />}
          {viewMode === 'admin' && <AdminDashboard />}

          {/* 9. AUTHENTICATION & ACCESS ROUTES */}
          {isAuthPage && <AuthPages />}
        </main>
      </div>

      {/* Floating Background Miniplayer */}
      <MiniPlayer />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-500/60'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-500/60'
                : 'bg-zinc-900 text-zinc-100 border-zinc-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={clearToast}
              className="p-1 rounded-full hover:bg-white/10"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Global Modals */}
      <UploadModal />
      <ShareModal />
      <PlaylistModal />
      <VoiceSearchModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
