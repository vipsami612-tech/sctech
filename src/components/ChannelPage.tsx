import React, { useState } from 'react';
import {
  Check,
  Bell,
  Search,
  Share2,
  Calendar,
  Eye,
  Video as VideoIcon,
  Play,
  ListVideo
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VideoCard } from './VideoCard';

interface ChannelPageProps {
  channelId: string;
}

export const ChannelPage: React.FC<ChannelPageProps> = ({ channelId }) => {
  const {
    channels,
    videos,
    shorts,
    subscribedChannelIds,
    toggleSubscribe,
    navigate
  } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'videos' | 'shorts' | 'about'>('home');
  const [videoSort, setVideoSort] = useState<'latest' | 'popular'>('latest');

  const channel = channels.find(c => c.id === channelId) || channels[0];
  const isSubscribed = subscribedChannelIds.includes(channel.id);

  // Filter channel content
  const channelVideos = videos.filter(v => v.channel.id === channel.id);
  const sortedVideos = [...channelVideos].sort((a, b) => {
    if (videoSort === 'popular') return b.views - a.views;
    return 0; // Default order is latest
  });

  const channelShorts = shorts.filter(s => s.channel.id === channel.id);
  const featuredVideo = channelVideos.find(v => v.id === channel.featuredVideoId) || channelVideos[0];

  return (
    <div className="max-w-[1500px] mx-auto pb-12">
      {/* Channel Banner */}
      <div className="w-full h-36 sm:h-52 md:h-64 rounded-2xl overflow-hidden bg-zinc-800 shadow-md">
        <img
          src={channel.bannerUrl}
          alt={channel.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Channel Header Identity */}
      <div className="px-4 sm:px-8 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src={channel.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-zinc-900 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl sm:text-3xl text-zinc-950 dark:text-white">
                  {channel.name}
                </h1>
                {channel.verified && (
                  <Check className="w-5 h-5 text-zinc-400" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-1">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {channel.handle}
                </span>
                <span aria-hidden="true">·</span>
                <span>{channel.subscribers} subscribers</span>
                <span aria-hidden="true">·</span>
                <span>{channel.videosCount} videos</span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl line-clamp-2 mt-2">
                {channel.description}
              </p>
            </div>
          </div>

          {/* Subscribe Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSubscribe(channel.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                isSubscribed
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>
        </div>

        {/* Channel Navigation Tabs */}
        <div className="flex items-center gap-6 mt-8 border-b border-zinc-200 dark:border-zinc-800">
          {(['home', 'videos', 'shorts', 'about'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs sm:text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="py-6">
          {/* HOME TAB: Featured Trailer + Uploads */}
          {activeTab === 'home' && (
            <div className="space-y-8">
              {featuredVideo && (
                <div className="p-4 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-red-600 mb-3">
                    Featured Spotlight
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div
                      onClick={() => navigate('watch', { videoId: featuredVideo.id })}
                      className="relative md:w-96 aspect-video rounded-xl overflow-hidden cursor-pointer group shrink-0"
                    >
                      <img
                        src={featuredVideo.thumbnailUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3
                        onClick={() => navigate('watch', { videoId: featuredVideo.id })}
                        className="font-display font-semibold text-lg text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      >
                        {featuredVideo.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                        <span>{featuredVideo.views.toLocaleString()} views</span>
                        <span aria-hidden="true">·</span>
                        <span>{featuredVideo.uploadDate}</span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 mt-3 leading-relaxed">
                        {featuredVideo.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Uploads Grid */}
              <div>
                <h3 className="font-display font-semibold text-base text-zinc-900 dark:text-zinc-100 mb-4">
                  Latest Uploads
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {channelVideos.map(vid => (
                    <VideoCard key={vid.id} video={vid} showChannelAvatar={false} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIDEOS TAB: All Uploads with Sort */}
          {activeTab === 'videos' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setVideoSort('latest')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    videoSort === 'latest'
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setVideoSort('popular')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    videoSort === 'popular'
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  Popular
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedVideos.map(vid => (
                  <VideoCard key={vid.id} video={vid} showChannelAvatar={false} />
                ))}
              </div>
            </div>
          )}

          {/* SHORTS TAB */}
          {activeTab === 'shorts' && (
            <div>
              {channelShorts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {channelShorts.map(short => (
                    <div
                      key={short.id}
                      onClick={() => navigate('shorts')}
                      className="group cursor-pointer aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 relative shadow-sm"
                    >
                      <img
                        src={short.thumbnailUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                        <p className="text-white text-xs font-medium line-clamp-2">
                          {short.title}
                        </p>
                        <span className="text-[10px] text-white/70 font-mono mt-1">
                          {short.likes.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 italic py-8">No shorts uploaded by this creator yet.</p>
              )}
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h3 className="font-display font-semibold text-sm text-zinc-950 dark:text-white uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {channel.description}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="font-display font-semibold text-sm text-zinc-950 dark:text-white uppercase tracking-wider mb-3">
                  Channel Details & Stats
                </h3>
                <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>Joined {channel.joinedDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-zinc-400" />
                    <span>{channel.totalViews} total views</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <VideoIcon className="w-4 h-4 text-zinc-400" />
                    <span>{channel.videosCount} published uploads</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
