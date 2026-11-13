import React, { useState } from 'react';
import {
  Film,
  Eye,
  ThumbsUp,
  Coins,
  Upload,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  Tv
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { normalizePurchaseStatus } from '../services/domainHelpers';

export const CreatorDashboard: React.FC = () => {
  const {
    isAuthenticated,
    isCreator,
    userProfile,
    currentUser,
    videos,
    videoPurchases,
    creatorApplications,
    applyForCreator,
    setIsUploadModalOpen,
    setEditingVideo,
    removeVideo,
    setVideoAccessType,
    navigate,
    openAuthModal,
    t
  } = useApp();

  const [channelName, setChannelName] = useState(`${userProfile.displayName || 'SVTech'} Studio`);
  const [channelHandle, setChannelHandle] = useState(
    `@${(userProfile.displayName || 'creator').replace(/\s+/g, '').toLowerCase()}`
  );
  const [category, setCategory] = useState('Tech');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
        <Film className="w-10 h-10 text-rose-600 mx-auto" />
        <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
          {t.creatorStudio.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          {t.creatorStudio.applyDesc}
        </p>
        <button
          type="button"
          onClick={() => openAuthModal('signin')}
          className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
        >
          {t.auth.signIn}
        </button>
      </div>
    );
  }

  // Creator Application Onboarding View for non-creator viewers
  if (!isCreator) {
    const myLatestApp = creatorApplications.find(a => a.uid === currentUser?.uid);
    const status = myLatestApp?.status || (userProfile.creatorStatus === 'pending' ? 'pending' : userProfile.creatorStatus === 'rejected' ? 'rejected' : 'none');

    const handleApply = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!channelName.trim() || !bio.trim()) return;
      setSubmitting(true);
      try {
        await applyForCreator({
          channelName: channelName.trim(),
          channelHandle: channelHandle.trim().startsWith('@')
            ? channelHandle.trim()
            : `@${channelHandle.trim()}`,
          category,
          bio: bio.trim()
        });
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
                {t.creatorStudio.applyTitle}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                {t.creatorStudio.applyDesc}
              </p>
            </div>
          </div>

          {status === 'pending' ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{t.creatorStudio.pendingReview}</p>
                {myLatestApp && (
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    Channel: <span className="font-semibold">{myLatestApp.channelName}</span> ({myLatestApp.channelHandle})
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {status === 'rejected' && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t.creatorStudio.rejectedNotice}</span>
                </div>
              )}

              <form onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {t.auth.channelNameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={channelName}
                      onChange={e => setChannelName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Channel Handle
                    </label>
                    <input
                      type="text"
                      required
                      value={channelHandle}
                      onChange={e => setChannelHandle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Primary Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Education">Education</option>
                    <option value="Coding">Coding</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Music">Music</option>
                    <option value="Science">Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {t.auth.bioLabel}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Describe the educational or media streams you plan to publish on SVTech Media..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? t.common.loading : t.creatorStudio.applyBtn}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // CREATOR STUDIO WORKSPACE
  const myVideos = videos.filter(
    v =>
      v.ownerUid === currentUser?.uid ||
      v.channel?.id === currentUser?.uid ||
      (userProfile.channelId && v.channel?.id === userProfile.channelId)
  );
  const myVideoIds = new Set(myVideos.map(v => v.id));
  const totalViews = myVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = myVideos.reduce((acc, v) => acc + (v.likes || 0), 0);
  const verifiedRevenue = videoPurchases
    .filter(p => myVideoIds.has(p.videoId) && normalizePurchaseStatus(p) === 'verified')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-rose-600" />
            <span>{t.creatorStudio.title}</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">{t.creatorStudio.subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {userProfile.channelId && (
            <button
              type="button"
              onClick={() => navigate('channel', { channelId: userProfile.channelId })}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5"
            >
              <Tv className="w-4 h-4" />
              <span>{t.creatorStudio.viewChannel}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setEditingVideo(null);
              setIsUploadModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white inline-flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>{t.nav.uploadVideo}</span>
          </button>
        </div>
      </div>

      {/* Real KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 block">{t.creatorStudio.myCatalog}</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-zinc-950 dark:text-white mt-1 block">
            {myVideos.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-rose-500" />
            {t.creatorStudio.totalViews}
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-zinc-950 dark:text-white mt-1 block">
            {totalViews.toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5 text-indigo-500" />
            {t.creatorStudio.totalLikes}
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-zinc-950 dark:text-white mt-1 block">
            {totalLikes.toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            {t.creatorStudio.verifiedRevenue}
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1 block">
            {verifiedRevenue.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Creator Catalog Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="p-3">Video</th>
              <th className="p-3">Access</th>
              <th className="p-3">Views</th>
              <th className="p-3">Likes</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {myVideos.map(vid => (
              <tr key={vid.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={vid.thumbnailUrl}
                      alt=""
                      className="w-16 aspect-video rounded-md object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => navigate('watch', { videoId: vid.id })}
                        className="font-semibold text-zinc-900 dark:text-white hover:text-rose-600 text-left line-clamp-1"
                      >
                        {vid.title}
                      </button>
                      <span className="text-[11px] text-zinc-400 block">{vid.category}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <select
                    value={vid.accessType || (vid.isPremium ? 'pro' : 'free')}
                    onChange={e =>
                      setVideoAccessType(vid.id, e.target.value as any, vid.price || 100)
                    }
                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  >
                    <option value="free">FREE</option>
                    <option value="pro">PRO ({vid.price || 100} ETB)</option>
                    <option value="unlisted">UNLISTED</option>
                    <option value="private">PRIVATE</option>
                  </select>
                </td>
                <td className="p-3 font-mono tabular-nums">{vid.views.toLocaleString()}</td>
                <td className="p-3 font-mono tabular-nums">{vid.likes.toLocaleString()}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {vid.status || 'published'}
                  </span>
                </td>
                <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => navigate('watch', { videoId: vid.id })}
                    title="Watch"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVideo(vid);
                      setIsUploadModalOpen(true);
                    }}
                    title="Edit"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeVideo(vid.id)}
                    title="Delete"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {myVideos.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-400">
                  No videos uploaded to your channel yet. Click "{t.nav.uploadVideo}" to publish your first stream.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
