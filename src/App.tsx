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
import { UploadModal } from './components/UploadModal';
import { ShareModal } from './components/ShareModal';
import { PlaylistModal } from './components/PlaylistModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { MiniPlayer } from './components/MiniPlayer';
import { PlaySquare, Tv, Flame, Radio, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    viewMode,
    currentVideoId,
    currentChannelId,
    sidebarOpen,
    activeCategory,
    videos,
    shorts,
    channels,
    subscribedChannelIds,
    navigate
  } = useApp();

  // Filter home feed videos based on selected category & published status
  const visibleVideos = videos.filter(v => v.status !== 'draft' && v.visibility !== 'private');
  const filteredVideos =
    activeCategory === 'All'
      ? visibleVideos
      : visibleVideos.filter(
          v => v.category.toLowerCase() === activeCategory.toLowerCase()
        );

  // Subscriptions feed videos
  const subscribedVideos = videos.filter(v =>
    subscribedChannelIds.includes(v.channel.id)
  );

  const isFullWidthPage = viewMode === 'watch' || viewMode === 'admin';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors selection:bg-rose-600 selection:text-white">
      {/* Top Bar Header */}
      <Header />

      <div className="flex-1 flex">
        {/* Navigation Sidebar (hidden on Watch Page & Admin Page for focused layout, with drawer support) */}
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
                {/* First Batch of Videos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
                  {filteredVideos.slice(0, 8).map(video => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>

                {/* Shorts Shelf Carousel (Classic Video Platform feature) */}
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

          {/* 4. SUBSCRIPTIONS VIEW */}
          {viewMode === 'subscriptions' && (
            <div className="p-4 sm:p-6 max-w-[2000px] mx-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
                    Subscriptions
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

          {/* 8. ADVANCED ADMIN DASHBOARD */}
          {viewMode === 'admin' && <AdminDashboard />}
        </main>
      </div>

      {/* Floating Background Miniplayer */}
      <MiniPlayer />

      {/* Interactive Global Modals */}
      <UploadModal />
      <ShareModal />
      <PlaylistModal />
      <VoiceSearchModal />
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
