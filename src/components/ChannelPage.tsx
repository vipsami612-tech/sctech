import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Eye,
  Video as VideoIcon,
  Play,
  ThumbsUp,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Send,
  X,
  MessageSquareText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VideoCard } from './VideoCard';
import { uploadFileToStorage, validateUploadFile } from '../services/storageService';
import { isFirebaseApiKeyConfigured } from '../services/firebase';

interface ChannelPageProps {
  channelId: string;
}

export const ChannelPage: React.FC<ChannelPageProps> = ({ channelId }) => {
  const {
    channels,
    videos,
    shorts,
    posts,
    subscribedChannelIds,
    toggleSubscribe,
    navigate,
    currentUser,
    userProfile,
    isAdmin,
    createCommunityPost,
    toggleLikeCommunityPost,
    removeCommunityPost,
    saveChannelProfile,
    showToast,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'videos' | 'shorts' | 'community' | 'about'>('home');
  const [videoSort, setVideoSort] = useState<'latest' | 'popular'>('latest');

  // Community post composer state
  const [postText, setPostText] = useState('');
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImageUrl, setPostImageUrl] = useState('');
  const [isPublishingPost, setIsPublishingPost] = useState(false);

  // Edit Channel modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editBannerUrl, setEditBannerUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const channel = channels.find(c => c.id === channelId) || channels[0];
  if (!channel) return null;

  const isSubscribed = subscribedChannelIds.includes(channel.id);
  const isOwner = Boolean(
    currentUser &&
      (channel.ownerUid === currentUser.uid ||
        channel.id === currentUser.uid ||
        userProfile.channelId === channel.id)
  ) || isAdmin;

  // Filter channel content
  const channelVideos = videos.filter(v => v.channel.id === channel.id);
  const sortedVideos = [...channelVideos].sort((a, b) => {
    if (videoSort === 'popular') return b.views - a.views;
    return 0;
  });

  const channelShorts = shorts.filter(s => s.channel.id === channel.id);
  const channelPosts = posts.filter(p => p.channelId === channel.id);
  const featuredVideo = channelVideos.find(v => v.id === channel.featuredVideoId) || channelVideos[0];

  const openEditModal = () => {
    setEditName(channel.name);
    setEditHandle(channel.handle);
    setEditDesc(channel.description || '');
    setEditAvatarUrl(channel.avatarUrl || '');
    setEditBannerUrl(channel.bannerUrl || '');
    setAvatarFile(null);
    setBannerFile(null);
    setShowEditModal(true);
  };

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSavingProfile(true);
    try {
      let nextAvatar = editAvatarUrl;
      let nextBanner = editBannerUrl;

      if (isFirebaseApiKeyConfigured && currentUser) {
        if (avatarFile) {
          nextAvatar = await uploadFileToStorage({
            file: avatarFile,
            folder: 'avatars',
            uid: currentUser.uid
          });
        }
        if (bannerFile) {
          nextBanner = await uploadFileToStorage({
            file: bannerFile,
            folder: 'banners',
            uid: currentUser.uid
          });
        }
      }

      await saveChannelProfile({
        id: channel.id,
        name: editName.trim(),
        handle: editHandle.trim() || channel.handle,
        description: editDesc.trim(),
        avatarUrl: nextAvatar,
        bannerUrl: nextBanner
      });
      setShowEditModal(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save channel profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;
    setIsPublishingPost(true);
    try {
      let finalImg = postImageUrl.trim();
      if (isFirebaseApiKeyConfigured && currentUser && postImageFile) {
        finalImg = await uploadFileToStorage({
          file: postImageFile,
          folder: 'posts',
          uid: currentUser.uid
        });
      }
      await createCommunityPost(channel.id, postText.trim(), finalImg || undefined);
      setPostText('');
      setPostImageFile(null);
      setPostImageUrl('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish post.', 'error');
    } finally {
      setIsPublishingPost(false);
    }
  };

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

          {/* Subscribe & Owner Edit Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isOwner && (
              <button
                type="button"
                onClick={openEditModal}
                className="px-4 py-2.5 rounded-full text-xs font-semibold border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t.channel.editChannel}</span>
              </button>
            )}
            <button
              onClick={() => toggleSubscribe(channel.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                isSubscribed
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isSubscribed ? t.common.subscribed : t.common.subscribe}
            </button>
          </div>
        </div>

        {/* Channel Navigation Tabs */}
        <div className="flex items-center gap-6 mt-8 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
          {(['home', 'videos', 'shorts', 'community', 'about'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs sm:text-sm font-semibold capitalize transition-all border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab
                  ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {tab === 'community' ? t.channel.communityTab : tab}
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
                        <span className="font-mono tabular-nums">{featuredVideo.views.toLocaleString()} views</span>
                        <span aria-hidden="true">·</span>
                        <span>{featuredVideo.uploadDate}</span>
                        <span aria-hidden="true">·</span>
                        {featuredVideo.accessType === 'pro' || featuredVideo.isPremium ? (
                          <span className="font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">
                            PRO · {featuredVideo.price || 100} {featuredVideo.currency || 'ETB'}
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Free
                          </span>
                        )}
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

          {/* COMMUNITY TAB */}
          {activeTab === 'community' && (
            <div className="max-w-3xl space-y-6">
              {isOwner && (
                <form
                  onSubmit={handlePublishPost}
                  className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-3"
                >
                  <textarea
                    rows={3}
                    required
                    value={postText}
                    onChange={e => setPostText(e.target.value)}
                    placeholder={t.channel.postPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-600"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 inline-flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Attach Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const check = validateUploadFile(f, 'image');
                            if (!check.valid) {
                              showToast(check.error || 'Invalid image', 'error');
                              return;
                            }
                            setPostImageFile(f);
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') setPostImageUrl(reader.result);
                            };
                            reader.readAsDataURL(f);
                          }}
                        />
                      </label>
                      {postImageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setPostImageFile(null);
                            setPostImageUrl('');
                          }}
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Remove image
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isPublishingPost}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isPublishingPost ? t.common.loading : t.channel.publishPost}</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {channelPosts.map(post => {
                  const likedByMe = Boolean(currentUser && post.likedBy?.includes(currentUser.uid));
                  const canDelete = Boolean(
                    isAdmin || (currentUser && post.authorUid === currentUser.uid)
                  );
                  return (
                    <div
                      key={post.id}
                      className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.authorAvatarUrl || channel.avatarUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white">
                              {post.authorName}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => removeCommunityPost(post.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed">
                        {post.text}
                      </p>

                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full max-h-96 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800"
                        />
                      )}

                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => toggleLikeCommunityPost(post.id)}
                          className={`flex items-center gap-1.5 text-xs font-semibold ${
                            likedByMe
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${likedByMe ? 'fill-current' : ''}`} />
                          <span className="font-mono tabular-nums">{post.likes}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {channelPosts.length === 0 && (
                  <div className="p-10 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs space-y-2">
                    <MessageSquareText className="w-8 h-8 mx-auto opacity-40" />
                    <p>No community posts shared on this channel yet.</p>
                  </div>
                )}
              </div>
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

      {/* EDIT CHANNEL PROFILE MODAL */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                {t.channel.editChannel}
              </h2>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChannel} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Channel Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Handle</label>
                  <input
                    type="text"
                    required
                    value={editHandle}
                    onChange={e => setEditHandle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Channel Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Avatar Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const check = validateUploadFile(f, 'image');
                      if (!check.valid) {
                        showToast(check.error || 'Invalid avatar', 'error');
                        return;
                      }
                      setAvatarFile(f);
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') setEditAvatarUrl(reader.result);
                      };
                      reader.readAsDataURL(f);
                    }}
                    className="text-[11px] w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const check = validateUploadFile(f, 'image');
                      if (!check.valid) {
                        showToast(check.error || 'Invalid banner', 'error');
                        return;
                      }
                      setBannerFile(f);
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') setEditBannerUrl(reader.result);
                      };
                      reader.readAsDataURL(f);
                    }}
                    className="text-[11px] w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
                >
                  {savingProfile ? t.common.loading : t.channel.saveProfile}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
