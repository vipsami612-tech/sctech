import React, { useState } from 'react';
import { SlidersHorizontal, Check, Search as SearchIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VideoCard } from './VideoCard';

export const SearchPage: React.FC = () => {
  const { searchQuery, videos, channels, navigate } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'video' | 'channel'>('all');

  const cleanQuery = searchQuery.trim().toLowerCase();

  // Filter videos
  const matchedVideos = videos.filter(
    v =>
      v.title.toLowerCase().includes(cleanQuery) ||
      v.category.toLowerCase().includes(cleanQuery) ||
      v.channel.name.toLowerCase().includes(cleanQuery) ||
      v.tags.some(t => t.toLowerCase().includes(cleanQuery))
  );

  // Filter channels
  const matchedChannels = channels.filter(
    c =>
      c.name.toLowerCase().includes(cleanQuery) ||
      c.handle.toLowerCase().includes(cleanQuery) ||
      c.description.toLowerCase().includes(cleanQuery)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Search Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-red-600" />
          <h1 className="font-display font-semibold text-lg text-zinc-900 dark:text-zinc-100">
            Results for <span className="text-red-600">"{searchQuery}"</span>
          </h1>
          <span className="text-xs text-zinc-400">
            ({matchedVideos.length} videos found)
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterType === 'video'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setFilterType('channel')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterType === 'channel'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Channels
          </button>
        </div>
      </div>

      {/* MATCHED CHANNELS */}
      {(filterType === 'all' || filterType === 'channel') && matchedChannels.length > 0 && (
        <div className="space-y-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          {matchedChannels.map(channel => (
            <div
              key={channel.id}
              onClick={() => navigate('channel', { channelId: channel.id })}
              className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <img
                  src={channel.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-base text-zinc-900 dark:text-white">
                    <span>{channel.name}</span>
                    {channel.verified && <Check className="w-4 h-4 text-zinc-400" />}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    <span>{channel.handle}</span> · <span>{channel.subscribers} subscribers</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1 mt-1 max-w-xl">
                    {channel.description}
                  </p>
                </div>
              </div>

              <button className="px-4 py-2 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shrink-0">
                View Channel
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MATCHED VIDEOS */}
      {(filterType === 'all' || filterType === 'video') && (
        <div className="space-y-4">
          {matchedVideos.map(video => (
            <VideoCard key={video.id} video={video} layout="horizontal" />
          ))}

          {matchedVideos.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                No videos found matching "{searchQuery}"
              </p>
              <p className="text-xs text-zinc-500">
                Try searching for "Blender", "TypeScript", "4K", or "Gaming"
              </p>
              <button
                onClick={() => navigate('home')}
                className="mt-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-semibold"
              >
                Back to Home Feed
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
