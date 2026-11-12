import React, { useState } from 'react';
import {
  History,
  Trash2,
  Search,
  Play,
  Shuffle,
  Clock,
  ThumbsUp,
  FileVideo,
  Plus,
  Lock,
  Globe,
  MoreVertical,
  X,
  Download,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VideoCard } from './VideoCard';
import { Video } from '../types';

export const LibraryViews: React.FC = () => {
  const {
    viewMode,
    watchHistory,
    removeFromHistory,
    clearHistory,
    videos,
    likedVideoIds,
    watchLaterVideoIds,
    playlists,
    currentPlaylistId,
    downloads,
    removeDownload,
    startDownload,
    navigate,
    setIsUploadModalOpen,
    createPlaylist,
    t,
    videoPurchases
  } = useApp();

  const [historySearch, setHistorySearch] = useState('');
  const [downloadSearch, setDownloadSearch] = useState('');
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  // 1. WATCH HISTORY VIEW
  if (viewMode === 'history') {
    const historyVideos = watchHistory
      .map(item => {
        const vid = videos.find(v => v.id === item.videoId);
        return vid ? { ...vid, historyInfo: item } : null;
      })
      .filter(Boolean) as (Video & { historyInfo: { watchedAt: string; progressPercent: number } })[];

    const filteredHistory = historySearch
      ? historyVideos.filter(v => v.title.toLowerCase().includes(historySearch.toLowerCase()))
      : historyVideos;

    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-rose-600" />
              <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
                {t.nav.history}
              </h1>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage your recently watched videos and playback progress
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder="Search watch history..."
                className="pl-9 pr-3 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-transparent focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none"
              />
            </div>

            {watchHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.common.clearAll}</span>
              </button>
            )}
          </div>
        </div>

        {/* History Video Items */}
        <div className="mt-6 space-y-4">
          {filteredHistory.map(item => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 p-3 rounded-2xl hover:bg-zinc-100/70 dark:hover:bg-zinc-900/50 transition-colors group relative"
            >
              <div
                onClick={() => navigate('watch', { videoId: item.id })}
                className="cursor-pointer relative aspect-video sm:w-64 rounded-xl overflow-hidden bg-zinc-900 shrink-0"
              >
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-black/85 text-white">
                  {item.durationFormatted}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                  <div
                    className="h-full bg-rose-600"
                    style={{ width: `${item.historyInfo.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      onClick={() => navigate('watch', { videoId: item.id })}
                      className="font-semibold text-sm sm:text-base text-zinc-950 dark:text-white line-clamp-2 hover:text-rose-600 cursor-pointer"
                    >
                      {item.title}
                    </h3>
                    <button
                      onClick={() => removeFromHistory(item.id)}
                      className="p-1.5 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                    <span>{item.channel.name}</span>
                    <span>•</span>
                    <span>{item.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>Watched {item.historyInfo.watchedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredHistory.length === 0 && (
            <div className="text-center py-16 text-zinc-400 space-y-3">
              <History className="w-12 h-12 mx-auto stroke-1 opacity-40 mb-2" />
              <p className="text-sm font-semibold">No watch history found</p>
              <p className="text-xs text-zinc-500">
                Videos you watch on SVTech Media will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. MY DOWNLOADS LIBRARY VIEW
  if (viewMode === 'downloads') {
    const filteredDownloads = downloadSearch
      ? downloads.filter(d => d.videoTitle.toLowerCase().includes(downloadSearch.toLowerCase()))
      : downloads;

    const totalStorage = downloads.reduce((acc, d) => {
      const num = parseInt(d.fileSizeFormatted) || 50;
      return acc + num;
    }, 0);

    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
                {t.downloadsView.title}
              </h1>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t.downloadsView.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <HardDrive className="w-4 h-4" />
              <span>{t.downloadsView.storageUsed}: {totalStorage} MB</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={downloadSearch}
                onChange={e => setDownloadSearch(e.target.value)}
                placeholder="Search downloads..."
                className="pl-9 pr-3 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-transparent focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Downloads List */}
        <div className="space-y-3">
          {filteredDownloads.map(dl => (
            <div
              key={dl.id}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                <img
                  src={dl.thumbnailUrl}
                  alt=""
                  className="w-24 sm:w-28 aspect-video rounded-xl object-cover shrink-0 ring-1 ring-zinc-300 dark:ring-zinc-700"
                />
                <div className="min-w-0">
                  <h3
                    onClick={() => navigate('watch', { videoId: dl.videoId })}
                    className="font-semibold text-sm text-zinc-950 dark:text-white truncate cursor-pointer hover:underline"
                  >
                    {dl.videoTitle}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {dl.quality}
                    </span>
                    <span>•</span>
                    <span>{dl.fileSizeFormatted}</span>
                    <span>•</span>
                    <span>Downloaded {dl.downloadedAt}</span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => navigate('watch', { videoId: dl.videoId })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Offline</span>
                </button>

                <button
                  onClick={() => removeDownload(dl.id)}
                  title={t.downloadsView.deleteFile}
                  className="p-2 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredDownloads.length === 0 && (
            <div className="text-center py-16 text-zinc-400 space-y-3">
              <Download className="w-12 h-12 mx-auto stroke-1 opacity-40 mb-2" />
              <p className="text-sm font-semibold">{t.downloadsView.noDownloads}</p>
              <p className="text-xs text-zinc-500">
                {t.downloadsView.noDownloadsSub}
              </p>
              <button
                onClick={() => navigate('home')}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700"
              >
                {t.downloadsView.exploreVideos}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. LIKED VIDEOS VIEW
  if (viewMode === 'liked') {
    const likedVideos = videos.filter(v => likedVideoIds.includes(v.id));

    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
              {t.nav.likedVideos}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {likedVideos.length} streams you have liked on SVTech Media
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {likedVideos.map(vid => (
            <VideoCard key={vid.id} video={vid} />
          ))}
        </div>
      </div>
    );
  }

  // 4. WATCH LATER VIEW
  if (viewMode === 'watchlater') {
    const wlVideos = videos.filter(v => watchLaterVideoIds.includes(v.id));

    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
              {t.nav.watchLater}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {wlVideos.length} saved streams for future viewing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wlVideos.map(vid => (
            <VideoCard key={vid.id} video={vid} />
          ))}
        </div>
      </div>
    );
  }

  // 5. PLAYLISTS VIEW
  if (viewMode === 'playlists') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
              {t.nav.playlists}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Curate your custom streaming collections
            </p>
          </div>
          <button
            onClick={() => setShowCreatePlaylist(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map(pl => (
            <div
              key={pl.id}
              onClick={() => navigate('playlist-detail', { playlistId: pl.id })}
              className="group cursor-pointer rounded-2xl p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all"
            >
              <div className="aspect-video rounded-xl bg-zinc-800 overflow-hidden relative mb-2">
                <img
                  src={
                    pl.customThumbnail ||
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
                  }
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                  <Play className="w-8 h-8 fill-white opacity-80 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <h3 className="font-semibold text-sm text-zinc-950 dark:text-white line-clamp-1">
                {pl.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">{pl.videoIds.length} videos</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. YOUR VIDEOS & CREATOR HUB
  if (viewMode === 'your-videos') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
              {t.nav.creatorStudio}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage your published videos, view counts, and monetization status
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.upload.modalTitle}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.slice(0, 6).map(vid => (
            <VideoCard key={vid.id} video={vid} />
          ))}
        </div>
      </div>
    );
  }

  // 7. MY PURCHASES VIEW (PRO Monetized Videos)
  if (viewMode === 'purchases') {
    const purchasedVideos = videoPurchases
      .map(p => {
        const vid = videos.find(v => v.id === p.videoId);
        return vid ? { ...vid, purchaseInfo: p } : null;
      })
      .filter(Boolean) as (Video & { purchaseInfo: any })[];

    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Lock className="w-5 h-5 stroke-[2.5]" />
              </span>
              <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
                {t.purchasesView?.title || 'My Purchases'}
              </h1>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {t.purchasesView?.subtitle || 'Premium videos you have unlocked and purchased with Telebirr'}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>{purchasedVideos.length} Unlocked Streams</span>
          </div>
        </div>

        {purchasedVideos.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {t.purchasesView?.noPurchases || 'No purchased videos yet'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                {t.purchasesView?.noPurchasesSub || 'Unlock masterclasses, courses, and premium streams to watch anytime.'}
              </p>
            </div>
            <button
              onClick={() => navigate('home')}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md transition-all inline-block"
            >
              {t.purchasesView?.explorePro || 'Explore PRO Streams'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {purchasedVideos.map(vid => (
              <div key={vid.id} className="flex flex-col">
                <VideoCard video={vid} />
                <div className="mt-2 p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Ref: <span className="font-mono text-zinc-800 dark:text-zinc-200">{vid.purchaseInfo.transactionReference?.slice(0, 10)}</span>
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Unlocked
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};
