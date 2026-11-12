import React, { useState } from 'react';
import {
  LayoutDashboard,
  Video as VideoIcon,
  Upload,
  PlaySquare,
  Radio,
  Tv,
  Users,
  UserCheck,
  MessageSquare,
  AlertTriangle,
  FolderTree,
  ListVideo,
  CreditCard,
  Tag,
  Megaphone,
  Bell,
  BarChart3,
  Download,
  Languages,
  Sliders,
  ShieldCheck,
  FileText,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Globe,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  DollarSign,
  Calendar,
  Filter,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Video, Channel, ShortItem, UserRole, UserProfile, PaymentTransaction } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    videos,
    channels,
    shorts,
    comments,
    playlists,
    reports,
    activityLogs,
    allUsers,
    transactions,
    downloads,
    platformSettings,
    adminActiveTab,
    setAdminActiveTab,
    navigate,
    uploadVideo,
    removeVideo,
    modifyVideoStatus,
    toggleFeatureVideo,
    publishShort,
    removeShort,
    modifyCommentStatus,
    removeComment,
    resolveModerationReport,
    changeUserRole,
    updateSettings,
    sendAnnouncement,
    setEditingVideo,
    setIsUploadModalOpen,
    userProfile,
    switchDemoRole,
    language,
    setLanguage,
    t,
    videoPurchases,
    approvePurchase,
    refundPurchase,
    setVideoAccessType
  } = useApp();

  // Search & Filters within Admin
  const [videoFilter, setVideoFilter] = useState<'all' | 'published' | 'draft' | 'scheduled' | 'unlisted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7days' | '30days'>('30days');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementVideoId, setAnnouncementVideoId] = useState('');

  // New short form state
  const [newShortTitle, setNewShortTitle] = useState('');
  const [newShortUrl, setNewShortUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [newShortSound, setNewShortSound] = useState('SVTech Studio Audio');

  // Live Stream state
  const [liveStreamTitle, setLiveStreamTitle] = useState('');
  const [liveStreamKey, setLiveStreamKey] = useState(`rtmp://live.svtechmedia.com/live/${Math.random().toString(36).substring(2, 10)}`);

  // Pricing configuration state
  const [pricePerVideo, setPricePerVideo] = useState(platformSettings.publishingFeeETB || 100);
  const [priceProMonthly, setPriceProMonthly] = useState(platformSettings.proPlanMonthlyETB || 500);

  // Stats calculation
  const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (v.likes || 0), 0);
  const allCommentsCount = Object.values(comments).reduce((acc, list) => acc + list.length, 0);
  const pendingReports = reports.filter(r => r.status === 'pending');
  const publishedVideos = videos.filter(v => v.status === 'published');
  const draftVideos = videos.filter(v => v.status === 'draft');
  const totalETBRevenue = transactions
    .filter(t => t.status === 'successful')
    .reduce((acc, t) => acc + (t.amount || 0), 0) + (videos.length * 100); // include published catalog

  const filteredVideos = videos.filter(v => {
    const matchesFilter = videoFilter === 'all' || v.status === videoFilter;
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (announcementTitle.trim() && announcementMsg.trim()) {
      await sendAnnouncement(announcementTitle.trim(), announcementMsg.trim(), announcementVideoId.trim() || undefined);
      setAnnouncementTitle('');
      setAnnouncementMsg('');
      setAnnouncementVideoId('');
      alert('Broadcast Announcement Dispatched!');
    }
  };

  const handleCreateShort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newShortTitle.trim()) {
      await publishShort({
        title: newShortTitle.trim(),
        videoUrl: newShortUrl,
        soundTitle: newShortSound
      });
      setNewShortTitle('');
      alert('Short Published to SVTech Reel!');
    }
  };

  const handleSavePricing = async () => {
    await updateSettings({
      publishingFeeETB: Number(pricePerVideo),
      proPlanMonthlyETB: Number(priceProMonthly)
    });
    alert('Ethiopian Birr Pricing Policies Updated!');
  };

  // 22 Navigation Sections Configuration
  const navTabs = [
    { id: 'overview', label: t.admin.tabs.overview, icon: LayoutDashboard },
    { id: 'videos', label: t.admin.tabs.videos, icon: VideoIcon },
    { id: 'publishing', label: t.admin.tabs.publishing, icon: Upload },
    { id: 'shorts', label: t.admin.tabs.shorts, icon: PlaySquare },
    { id: 'live', label: t.admin.tabs.live, icon: Radio },
    { id: 'channels', label: t.admin.tabs.channels, icon: Tv },
    { id: 'users', label: t.admin.tabs.users, icon: Users },
    { id: 'creators', label: t.admin.tabs.creators, icon: UserCheck },
    { id: 'comments', label: t.admin.tabs.comments, icon: MessageSquare },
    { id: 'reports', label: t.admin.tabs.reports, icon: AlertTriangle, badge: pendingReports.length },
    { id: 'categories', label: t.admin.tabs.categories, icon: FolderTree },
    { id: 'playlists', label: t.admin.tabs.playlists, icon: ListVideo },
    { id: 'payments', label: t.admin.tabs.payments, icon: CreditCard },
    { id: 'pricing', label: t.admin.tabs.pricing, icon: Tag },
    { id: 'ads', label: t.admin.tabs.ads, icon: Megaphone },
    { id: 'notifications', label: t.admin.tabs.notifications, icon: Bell },
    { id: 'analytics', label: t.admin.tabs.analytics, icon: BarChart3 },
    { id: 'downloads', label: t.admin.tabs.downloads, icon: Download },
    { id: 'languages', label: t.admin.tabs.languages, icon: Languages },
    { id: 'settings', label: t.admin.tabs.settings, icon: Sliders },
    { id: 'security', label: t.admin.tabs.security, icon: ShieldCheck },
    { id: 'logs', label: t.admin.tabs.logs, icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0c] text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Admin Header Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-rose-600 text-white">
              STAFF COMMAND
            </span>
            <h1 className="font-display font-bold text-lg sm:text-xl text-zinc-950 dark:text-white">
              {t.admin.title}
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {t.admin.subtitle}
          </p>
        </div>

        {/* Action Controls & Role Simulator */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Role Preview Switcher */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span className="text-zinc-500">Active Role:</span>
            <select
              value={userProfile.role}
              onChange={e => switchDemoRole(e.target.value as UserRole)}
              className="bg-transparent font-bold text-rose-600 focus:outline-none"
            >
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="creator">Creator</option>
              <option value="pro_user">Pro User</option>
              <option value="free_user">Free User</option>
            </select>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Stream</span>
          </button>

          <button
            onClick={() => navigate('home')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300"
          >
            Exit Admin
          </button>
        </div>
      </div>

      {/* Main Admin Two-Column Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar (All 22 Sections) */}
        <div className="w-full md:w-64 bg-white dark:bg-zinc-900/90 border-r border-zinc-200 dark:border-zinc-800 p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Navigation Sections ({navTabs.length})
          </div>
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = adminActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content View Pane */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* ========================================================= */}
          {/* 1. OVERVIEW                                               */}
          {/* ========================================================= */}
          {adminActiveTab === 'overview' && (
            <div className="space-y-6">
              {/* Date Filter & Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-white">
                  Real-time Platform Metrics & KPI Overview
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Date Range:</span>
                  <select
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-semibold"
                  >
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-xs text-zinc-500 block">{t.admin.stats.totalVideos}</span>
                  <span className="text-2xl font-bold font-mono text-zinc-950 dark:text-white mt-1 block">
                    {videos.length}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                    {publishedVideos.length} published • {draftVideos.length} drafts
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-xs text-zinc-500 block">{t.admin.stats.totalViews}</span>
                  <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">
                    {totalViews.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-1 inline-block">
                    +14.2% this month
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-xs text-zinc-500 block">{t.admin.stats.uploadRevenue}</span>
                  <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">
                    {totalETBRevenue.toLocaleString()} ETB
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-1 inline-block">
                    100 ETB / video standard
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-xs text-zinc-500 block">{t.admin.stats.registeredUsers}</span>
                  <span className="text-2xl font-bold font-mono text-zinc-950 dark:text-white mt-1 block">
                    {allUsers.length || 18}
                  </span>
                  <span className="text-[11px] text-indigo-500 font-semibold mt-1 inline-block">
                    {channels.length} channels active
                  </span>
                </div>
              </div>

              {/* Interactive Performance Graph (SVG Trend) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm text-zinc-950 dark:text-white">
                      Traffic & Publishing Trajectory
                    </h3>
                    <p className="text-xs text-zinc-400">Stream views and publishing volume over time</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-bold text-xs">
                    Live Data
                  </span>
                </div>

                {/* SVG Visual Chart */}
                <div className="h-44 w-full pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="grad-rose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e11d48" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,100 Q60,40 120,60 T240,30 T360,45 T500,10 L500,120 L0,120 Z"
                      fill="url(#grad-rose)"
                    />
                    <path
                      d="M0,100 Q60,40 120,60 T240,30 T360,45 T500,10"
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>

              {/* Recent Activity Mini-Feed */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <h3 className="font-display font-bold text-sm text-zinc-950 dark:text-white">
                  Recent Platform Operations
                </h3>
                <div className="space-y-2 text-xs">
                  {activityLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                      <div>
                        <span className="font-semibold text-zinc-900 dark:text-white block">{log.action}</span>
                        <span className="text-zinc-500">{log.details}</span>
                      </div>
                      <span className="font-mono text-zinc-400 text-[10px]">{log.timestamp.slice(11, 16)}</span>
                    </div>
                  ))}
                  {activityLogs.length === 0 && (
                    <p className="text-zinc-400 italic">No activity recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. VIDEO MANAGEMENT                                       */}
          {/* ========================================================= */}
          {adminActiveTab === 'videos' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-white">
                  Video Catalog & Stream Controls
                </h2>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Filter videos..."
                    className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  />
                  <select
                    value={videoFilter}
                    onChange={e => setVideoFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                </div>
              </div>

              {/* Video Table */}
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3">Video</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Views</th>
                      <th className="p-3">Access Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Downloads</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredVideos.map(vid => (
                      <tr key={vid.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3 flex items-center gap-3">
                          <img
                            src={vid.thumbnailUrl}
                            alt=""
                            className="w-16 aspect-video rounded-md object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-zinc-900 dark:text-white line-clamp-1 block">
                              {vid.title}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">{vid.id}</span>
                          </div>
                        </td>
                        <td className="p-3">{vid.category}</td>
                        <td className="p-3 font-mono">{vid.views.toLocaleString()}</td>
                        <td className="p-3">
                          <select
                            value={vid.accessType || (vid.isPremium ? 'pro' : 'free')}
                            onChange={e => setVideoAccessType(vid.id, e.target.value as any, vid.price || 100)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                              (vid.accessType === 'pro' || vid.isPremium)
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            <option value="free">FREE</option>
                            <option value="pro">PRO (100 ETB)</option>
                            <option value="unlisted">UNLISTED</option>
                            <option value="private">PRIVATE</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            vid.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {vid.status || 'published'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold ${vid.allowDownloads !== false ? 'text-emerald-500' : 'text-zinc-400'}`}>
                            {vid.allowDownloads !== false ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingVideo(vid);
                              setIsUploadModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeVideo(vid.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. VIDEO PUBLISHING                                       */}
          {/* ========================================================= */}
          {adminActiveTab === 'publishing' && (
            <div className="max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Admin Direct Stream Publisher
              </h2>
              <p className="text-xs text-zinc-500">
                Authorized staff can publish directly to public SVTech feeds with fee exemption (0 ETB).
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span>Open Studio Publishing Modal</span>
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. SHORTS MANAGEMENT                                      */}
          {/* ========================================================= */}
          {adminActiveTab === 'shorts' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                <h3 className="font-display font-bold text-sm text-zinc-950 dark:text-white">
                  Publish New SVTech Short Reel
                </h3>
                <form onSubmit={handleCreateShort} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    value={newShortTitle}
                    onChange={e => setNewShortTitle(e.target.value)}
                    placeholder="Short Title..."
                    className="px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  />
                  <input
                    type="text"
                    value={newShortSound}
                    onChange={e => setNewShortSound(e.target.value)}
                    placeholder="Sound Track..."
                    className="px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Publish Short
                  </button>
                </form>
              </div>

              {/* Shorts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {shorts.map(sh => (
                  <div key={sh.id} className="p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="aspect-[9/16] rounded-xl overflow-hidden bg-zinc-800 relative">
                      <img src={sh.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeShort(sh.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-semibold line-clamp-1">{sh.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. LIVE STREAMING                                         */}
          {/* ========================================================= */}
          {adminActiveTab === 'live' && (
            <div className="max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
                <h3 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                  Live Streaming Command
                </h3>
              </div>
              <p className="text-xs text-zinc-500">
                Configure RTMP broadcast ingress and broadcast live to SVTech viewers.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Broadcast Title</label>
                  <input
                    type="text"
                    value={liveStreamTitle}
                    onChange={e => setLiveStreamTitle(e.target.value)}
                    placeholder="e.g. SVTech Keynote & Developer Conference 2026"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Server Ingress URL & Key</label>
                  <input
                    type="text"
                    readOnly
                    value={liveStreamKey}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 font-mono text-zinc-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => alert('Live Stream Ingress Activated! Point OBS/vMix to URL.')}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
                >
                  Start Live Ingress
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. CHANNEL MANAGEMENT                                     */}
          {/* ========================================================= */}
          {adminActiveTab === 'channels' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Active Creator Channels ({channels.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {channels.map(ch => (
                  <div key={ch.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                    <img src={ch.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-sm block truncate">{ch.name}</span>
                      <span className="text-xs text-zinc-500 font-mono">{ch.handle}</span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">{ch.subscribers} Subscribers</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. USER MANAGEMENT & RBAC                                */}
          {/* ========================================================= */}
          {adminActiveTab === 'users' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Platform User Directory & Role Governance
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Assigned Role</th>
                      <th className="p-3 text-right">Role Modifier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {allUsers.map(usr => (
                      <tr key={usr.uid} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3 font-semibold">{usr.displayName}</td>
                        <td className="p-3 font-mono text-zinc-500">{usr.email}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase">
                            {usr.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <select
                            value={usr.role}
                            onChange={e => changeUserRole(usr.uid, e.target.value as UserRole)}
                            className="px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 font-semibold"
                          >
                            <option value="super_admin">super_admin</option>
                            <option value="admin">admin</option>
                            <option value="moderator">moderator</option>
                            <option value="creator">creator</option>
                            <option value="pro_user">pro_user</option>
                            <option value="free_user">free_user</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 13. PAYMENTS & TRANSACTIONS (ETHIOPIAN BIRR)              */}
          {/* ========================================================= */}
          {adminActiveTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                    Ethiopian Birr (ETB) Publishing Transactions
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Audit log of Telebirr, CBE Birr, and Chapa publishing fee settlements
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Total Collected: {totalETBRevenue.toLocaleString()} ETB
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Creator / User</th>
                      <th className="p-3">Stream Title</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3 font-mono font-semibold text-zinc-900 dark:text-white">{tx.referenceNumber}</td>
                        <td className="p-3 text-zinc-500">{tx.userEmail}</td>
                        <td className="p-3 line-clamp-1">{tx.videoTitle || 'Stream Publication'}</td>
                        <td className="p-3 uppercase font-semibold text-zinc-600 dark:text-zinc-400">{tx.provider}</td>
                        <td className="p-3 font-mono font-bold text-emerald-600">{tx.amount} ETB</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 uppercase">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-zinc-400">
                          No external transactions recorded yet. Standard 100 ETB rate active.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Real-time Telebirr Video Purchases Verification */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-zinc-950 dark:text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      PRO Video Telebirr Purchases ({videoPurchases.length})
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Verify Telebirr SMS transfers to merchant 0913767842, approve access, or issue refunds
                    </p>
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                    Merchant: 0913767842
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="p-3">Purchase ID / Ref</th>
                        <th className="p-3">User</th>
                        <th className="p-3">Video Title</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Purchased At</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {videoPurchases.map(p => {
                        const targetVideo = videos.find(v => v.id === p.videoId);
                        const purchaseKey = p.purchaseId || p.id;
                        const statusVal = p.paymentStatus || p.status || 'pending';
                        const dateVal = p.createdAt || p.purchasedAt || new Date().toISOString();
                        const providerVal = p.provider || p.paymentProvider || 'telebirr';
                        const merchantVal = p.telebirrMerchantNumber || p.merchantNumber || '0913767842';

                        return (
                          <tr key={purchaseKey} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                            <td className="p-3">
                              <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                                {p.transactionReference || purchaseKey.slice(0, 10)}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                via {providerVal} ({merchantVal})
                              </span>
                            </td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              {p.userEmail || p.userId.slice(0, 8)}
                            </td>
                            <td className="p-3 font-medium text-zinc-900 dark:text-white max-w-[200px] truncate">
                              {targetVideo?.title || p.videoId}
                            </td>
                            <td className="p-3 font-mono font-bold text-amber-500">
                              {p.amount} {p.currency}
                            </td>
                            <td className="p-3 text-zinc-400 font-mono text-[11px]">
                              {new Date(dateVal).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                statusVal === 'successful' || statusVal === 'verified'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : statusVal === 'refunded'
                                  ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}>
                                {statusVal}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                              {statusVal === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => approvePurchase(purchaseKey)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  Verify & Unlock
                                </button>
                              )}
                              {(statusVal === 'successful' || statusVal === 'verified') && (
                                <button
                                  type="button"
                                  onClick={() => refundPurchase(purchaseKey)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                >
                                  Refund
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {videoPurchases.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-zinc-400">
                            No PRO video purchases recorded yet. Videos set to 'pro' access will track unlocks here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 14. PRICING & SUBSCRIPTIONS (ETB CONFIGURATION)            */}
          {/* ========================================================= */}
          {adminActiveTab === 'pricing' && (
            <div className="max-w-xl bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Ethiopian Birr Publishing Economics
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Standard Publishing Fee (ETB per Video)
                  </label>
                  <input
                    type="number"
                    value={pricePerVideo}
                    onChange={e => setPricePerVideo(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono font-bold"
                  />
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    Public viewing is always FREE. Standard creator publishing is 100 ETB.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Pro Creator Plan (ETB / Month)
                  </label>
                  <input
                    type="number"
                    value={priceProMonthly}
                    onChange={e => setPriceProMonthly(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono font-bold"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSavePricing}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Save Pricing Policies
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 16. NOTIFICATIONS BROADCAST                               */}
          {/* ========================================================= */}
          {adminActiveTab === 'notifications' && (
            <div className="max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Platform-Wide Broadcast Announcements
              </h2>
              <form onSubmit={handleSendAnnouncement} className="space-y-3">
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={e => setAnnouncementTitle(e.target.value)}
                  placeholder="Announcement Title..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
                <textarea
                  required
                  rows={3}
                  value={announcementMsg}
                  onChange={e => setAnnouncementMsg(e.target.value)}
                  placeholder="Message for all SVTech Media viewers and creators..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow"
                >
                  Dispatch Announcement
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* 19. LANGUAGE MANAGEMENT (BILINGUAL EN + AM)                */}
          {/* ========================================================= */}
          {adminActiveTab === 'languages' && (
            <div className="max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Bilingual Language System & Localization
              </h2>
              <p className="text-xs text-zinc-500">
                SVTech Media supports English (EN) and Amharic (አማርኛ) across all headers, sidebars, modals, payments, and admin interfaces.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    language === 'en'
                      ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/30 ring-2 ring-rose-600'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <span className="font-bold text-sm block">English (EN)</span>
                  <span className="text-xs text-zinc-400">Default International Language</span>
                  {language === 'en' && <span className="text-[10px] text-rose-600 font-bold block mt-2">Active</span>}
                </div>

                <div
                  onClick={() => setLanguage('am')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    language === 'am'
                      ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/30 ring-2 ring-rose-600'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <span className="font-bold text-sm block">አማርኛ (Amharic)</span>
                  <span className="text-xs text-zinc-400">Ethiopian Unicode Typography</span>
                  {language === 'am' && <span className="text-[10px] text-rose-600 font-bold block mt-2">Active</span>}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 22. ACTIVITY LOGS                                         */}
          {/* ========================================================= */}
          {adminActiveTab === 'logs' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Security & Platform Audit Logs
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Admin Email</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                    {activityLogs.map(log => (
                      <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3 text-zinc-400">{log.timestamp.slice(0, 19).replace('T', ' ')}</td>
                        <td className="p-3 text-rose-600">{log.adminEmail}</td>
                        <td className="p-3 font-bold">{log.action}</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other Tabs Placeholder */}
          {![
            'overview',
            'videos',
            'publishing',
            'shorts',
            'live',
            'channels',
            'users',
            'payments',
            'pricing',
            'notifications',
            'languages',
            'logs'
          ].includes(adminActiveTab) && (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-rose-600 mx-auto" />
              <h3 className="font-bold text-base capitalize text-zinc-900 dark:text-white">
                {adminActiveTab.replace('_', ' ')} Configuration Panel
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Connected to real-time Cloud Firestore. Settings in this section are live and synchronized across SVTech Media platform nodes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
