import React, { useState, useEffect } from 'react';
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
  Trash2,
  Edit,
  Eye,
  Lock,
  ExternalLink,
  Star,
  Copy,
  Check,
  Ban,
  CheckCircle2,
  Plus,
  Flag,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { formatLogTimestamp, toMillis } from '../services/domainHelpers';

export const AdminDashboard: React.FC = () => {
  const {
    videos,
    channels,
    shorts,
    comments,
    playlists,
    categories,
    reports,
    activityLogs,
    allUsers,
    creatorApplications,
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
    toggleUserBan,
    reviewCreatorApplication,
    saveCategory,
    removeCategory,
    removePlaylist,
    verifyPayment,
    updateSettings,
    sendAnnouncement,
    saveChannelProfile,
    setEditingVideo,
    setIsUploadModalOpen,
    userProfile,
    isAdmin,
    isModerator,
    language,
    setLanguage,
    t,
    videoPurchases,
    approvePurchase,
    refundPurchase,
    setVideoAccessType,
    showToast
  } = useApp();

  // Search & Filters within Admin
  const [videoFilter, setVideoFilter] = useState<'all' | 'published' | 'draft' | 'scheduled' | 'unlisted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7days' | '30days'>('30days');

  // Notifications Broadcast state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementVideoId, setAnnouncementVideoId] = useState('');

  // New short form state
  const [newShortTitle, setNewShortTitle] = useState('');
  const [newShortUrl, setNewShortUrl] = useState(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  const [newShortSound, setNewShortSound] = useState('SVTech Studio Audio');

  // Live Stream state
  const [liveStreamTitle, setLiveStreamTitle] = useState('');
  const [liveStreamKey] = useState(
    `rtmp://live.svtechmedia.com/live/${Math.random().toString(36).substring(2, 10)}`
  );
  const [liveIngressActive, setLiveIngressActive] = useState(false);

  // Pricing configuration state
  const [pricePerVideo, setPricePerVideo] = useState(platformSettings.publishingFeeETB || 100);
  const [priceProMonthly, setPriceProMonthly] = useState(platformSettings.proPlanMonthlyETB || 500);

  // Categories form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameAm, setNewCatNameAm] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Ads / Featured Banner state
  const [bannerEnabled, setBannerEnabled] = useState(Boolean(platformSettings.featuredBannerEnabled));
  const [bannerTitle, setBannerTitle] = useState(platformSettings.featuredBannerTitle || '');
  const [bannerText, setBannerText] = useState(platformSettings.featuredBannerText || '');
  const [bannerVideoId, setBannerVideoId] = useState(platformSettings.featuredBannerVideoId || '');

  // Platform Settings state
  const [siteName, setSiteName] = useState(platformSettings.siteName || 'SVTech Media');
  const [tagline, setTagline] = useState(platformSettings.tagline || 'Watch • Create • Share • Connect');
  const [telebirrMerchantId, setTelebirrMerchantId] = useState(platformSettings.telebirrMerchantId || '0913767842');
  const [maintenanceMode, setMaintenanceMode] = useState(Boolean(platformSettings.maintenanceMode));
  const [allowPublicUploads, setAllowPublicUploads] = useState(Boolean(platformSettings.allowPublicUploads));
  const [requireApproval, setRequireApproval] = useState(Boolean(platformSettings.requireApproval));
  const [allowFreeCreatorUploads, setAllowFreeCreatorUploads] = useState(
    Boolean(platformSettings.allowFreeCreatorUploads)
  );

  // Sync local form controls when Firestore platformSettings updates
  useEffect(() => {
    setPricePerVideo(platformSettings.publishingFeeETB || 100);
    setPriceProMonthly(platformSettings.proPlanMonthlyETB || 500);
    setBannerEnabled(Boolean(platformSettings.featuredBannerEnabled));
    setBannerTitle(platformSettings.featuredBannerTitle || '');
    setBannerText(platformSettings.featuredBannerText || '');
    setBannerVideoId(platformSettings.featuredBannerVideoId || '');
    setSiteName(platformSettings.siteName || 'SVTech Media');
    setTagline(platformSettings.tagline || 'Watch • Create • Share • Connect');
    setTelebirrMerchantId(platformSettings.telebirrMerchantId || '0913767842');
    setMaintenanceMode(Boolean(platformSettings.maintenanceMode));
    setAllowPublicUploads(Boolean(platformSettings.allowPublicUploads));
    setRequireApproval(Boolean(platformSettings.requireApproval));
    setAllowFreeCreatorUploads(Boolean(platformSettings.allowFreeCreatorUploads));
  }, [platformSettings]);

  // Strict RBAC Role Guard
  if (!isAdmin && !isModerator) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-zinc-50 dark:bg-[#0c0c0c]">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-display font-bold text-zinc-950 dark:text-white">
            {t.auth.unauthorizedTitle}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t.auth.unauthorizedDesc}
          </p>
          <button
            type="button"
            onClick={() => navigate('home')}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors"
          >
            {t.auth.backHome}
          </button>
        </div>
      </div>
    );
  }

  // Time-range helper for logs & transactions
  const rangeCutoffMs = (() => {
    const now = Date.now();
    if (dateRange === 'today') return now - 24 * 60 * 60 * 1000;
    if (dateRange === '7days') return now - 7 * 24 * 60 * 60 * 1000;
    if (dateRange === '30days') return now - 30 * 24 * 60 * 60 * 1000;
    return 0;
  })();

  const isWithinDateRange = (timestamp: unknown) => {
    if (rangeCutoffMs === 0) return true;
    const ms = toMillis(timestamp);
    return ms === 0 || ms >= rangeCutoffMs;
  };

  // Real Computed Platform Metrics (Zero fabricated/inflated values)
  const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (v.likes || 0), 0);
  const flatComments = Object.entries(comments).flatMap(([videoId, list]) =>
    list.map(c => ({ ...c, videoId: c.videoId || videoId }))
  );
  const pendingReports = reports.filter(r => r.status === 'pending');
  const pendingCreators = creatorApplications.filter(a => a.status === 'pending');
  const publishedVideos = videos.filter(v => (v.status || 'published') === 'published');
  const draftVideos = videos.filter(v => v.status === 'draft');

  const publishingFeeRevenue = transactions
    .filter(tx => tx.status === 'successful' && isWithinDateRange(tx.createdAt))
    .reduce((acc, tx) => acc + (tx.amount || 0), 0);

  const verifiedProPurchases = videoPurchases.filter(
    p =>
      (p.paymentStatus === 'successful' || p.status === 'verified') &&
      isWithinDateRange(p.createdAt || p.purchasedAt)
  );
  const proPurchaseRevenue = verifiedProPurchases.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalETBRevenue = publishingFeeRevenue + proPurchaseRevenue;

  const filteredVideos = videos.filter(v => {
    const matchesFilter = videoFilter === 'all' || (v.status || 'published') === videoFilter;
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Top 8 videos by views for real SVG chart
  const topChartVideos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8);
  const maxChartViews = Math.max(1, ...topChartVideos.map(v => v.views || 0));

  // Analytics breakdowns
  const freeVideosList = videos.filter(v => (v.accessType || (v.isPremium ? 'pro' : 'free')) === 'free');
  const proVideosList = videos.filter(v => v.accessType === 'pro' || Boolean(v.isPremium));
  const freeViewsSum = freeVideosList.reduce((acc, v) => acc + (v.views || 0), 0);
  const proViewsSum = proVideosList.reduce((acc, v) => acc + (v.views || 0), 0);

  const categoryStats = Object.entries(
    videos.reduce<Record<string, { count: number; views: number }>>((acc, v) => {
      const cat = v.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = { count: 0, views: 0 };
      acc[cat].count += 1;
      acc[cat].views += v.views || 0;
      return acc;
    }, {})
  ).sort((a, b) => b[1].views - a[1].views);

  // Role distribution from real allUsers
  const roleDistribution = (['super_admin', 'admin', 'moderator', 'creator', 'pro_user', 'free_user'] as UserRole[]).map(
    role => ({
      role,
      count: allUsers.filter(u => u.role === role).length
    })
  );

  // Action Handlers
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (announcementTitle.trim() && announcementMsg.trim()) {
      await sendAnnouncement(
        announcementTitle.trim(),
        announcementMsg.trim(),
        announcementVideoId.trim() || undefined
      );
      setAnnouncementTitle('');
      setAnnouncementMsg('');
      setAnnouncementVideoId('');
      showToast('Broadcast announcement dispatched to all users!', 'success');
    }
  };

  const handleCreateShort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newShortTitle.trim()) {
      await publishShort({
        title: newShortTitle.trim(),
        videoUrl: newShortUrl.trim(),
        soundTitle: newShortSound.trim()
      });
      setNewShortTitle('');
      showToast('Short reel published to SVTech Shorts!', 'success');
    }
  };

  const handleCopyLiveKey = async () => {
    try {
      await navigator.clipboard.writeText(liveStreamKey);
      showToast(t.common.copied, 'success');
    } catch {
      showToast('Copy the RTMP URL manually from the input field.', 'info');
    }
  };

  const handleActivateLiveIngress = () => {
    setLiveIngressActive(prev => {
      const next = !prev;
      showToast(
        next
          ? `RTMP Live Ingress activated${liveStreamTitle ? ` for "${liveStreamTitle}"` : ''}.`
          : 'RTMP Live Ingress stopped.',
        next ? 'success' : 'info'
      );
      return next;
    });
  };

  const handleSavePricing = async () => {
    await updateSettings({
      publishingFeeETB: Math.max(0, Number(pricePerVideo)),
      proPlanMonthlyETB: Math.max(0, Number(priceProMonthly))
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = (newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    await saveCategory({
      id: `cat_${slug}_${Date.now().toString(36)}`,
      name: newCatName.trim(),
      nameAm: newCatNameAm.trim() || newCatName.trim(),
      slug,
      videoCount: videos.filter(v => v.category.toLowerCase() === newCatName.trim().toLowerCase()).length
    });
    setNewCatName('');
    setNewCatNameAm('');
    setNewCatSlug('');
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      featuredBannerEnabled: bannerEnabled,
      featuredBannerTitle: bannerTitle.trim(),
      featuredBannerText: bannerText.trim(),
      featuredBannerVideoId: bannerVideoId.trim()
    });
  };

  const handleSavePlatformSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      siteName: siteName.trim() || 'SVTech Media',
      tagline: tagline.trim() || 'Watch • Create • Share • Connect',
      telebirrMerchantId: telebirrMerchantId.trim() || '0913767842',
      maintenanceMode,
      allowPublicUploads,
      requireApproval,
      allowFreeCreatorUploads
    });
  };

  // 22 Navigation Sections Configuration
  const navTabs = [
    { id: 'overview', label: t.admin.tabs.overview, icon: LayoutDashboard },
    { id: 'videos', label: t.admin.tabs.videos, icon: VideoIcon },
    { id: 'publishing', label: t.admin.tabs.publishing, icon: Upload, badge: draftVideos.length },
    { id: 'shorts', label: t.admin.tabs.shorts, icon: PlaySquare },
    { id: 'live', label: t.admin.tabs.live, icon: Radio },
    { id: 'channels', label: t.admin.tabs.channels, icon: Tv },
    { id: 'users', label: t.admin.tabs.users, icon: Users },
    { id: 'creators', label: t.admin.tabs.creators, icon: UserCheck, badge: pendingCreators.length },
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
          <p className="text-xs text-zinc-500 mt-1">{t.admin.subtitle}</p>
        </div>

        {/* Action Controls & Authenticated Role Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span className="text-zinc-500">Authenticated Role:</span>
            <span className="font-bold text-rose-600 uppercase">
              {userProfile.role.replace('_', ' ')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Stream</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('home')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700"
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
                type="button"
                onClick={() => setAdminActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shrink-0">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content View Pane */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* 1. OVERVIEW */}
          {adminActiveTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-white">
                  Real-time Platform Metrics & KPI Overview
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Revenue Filter:</span>
                  <select
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value as typeof dateRange)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-semibold"
                  >
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-xs text-zinc-500 block">{t.admin.stats.totalVideos}</span>
                  <span className="text-2xl font-bold font-mono text-zinc-950 dark:text-white mt-1 block">
                    {videos.length}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                    {publishedVideos.length} published · {draftVideos.length} drafts
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-xs text-zinc-500 block">{t.admin.stats.totalViews}</span>
                  <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">
                    {totalViews.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-1 inline-block">
                    {totalLikes.toLocaleString()} likes · {flatComments.length} comments
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-xs text-zinc-500 block">{t.admin.stats.uploadRevenue}</span>
                  <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">
                    {totalETBRevenue.toLocaleString()} ETB
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-1 inline-block">
                    {publishingFeeRevenue.toLocaleString()} fees + {proPurchaseRevenue.toLocaleString()} PRO
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <span className="text-xs text-zinc-500 block">{t.admin.stats.registeredUsers}</span>
                  <span className="text-2xl font-bold font-mono text-zinc-950 dark:text-white mt-1 block">
                    {allUsers.length}
                  </span>
                  <span className="text-[11px] text-indigo-500 font-semibold mt-1 inline-block">
                    {channels.length} channels · {pendingReports.length} pending reports
                  </span>
                </div>
              </div>

              {/* Data-Driven SVG Views Distribution Chart */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm text-zinc-950 dark:text-white">
                      Top Catalog Streams by Real View Count
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Live bar comparison computed directly from Firestore video metrics
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-bold text-xs">
                    {topChartVideos.length} Streams
                  </span>
                </div>

                {topChartVideos.length > 0 ? (
                  <div className="h-44 w-full pt-2">
                    <svg className="w-full h-full" viewBox="0 0 640 150" preserveAspectRatio="none">
                      {topChartVideos.map((vid, idx) => {
                        const barWidth = 54;
                        const gap = 24;
                        const x = idx * (barWidth + gap) + 12;
                        const ratio = (vid.views || 0) / maxChartViews;
                        const height = Math.max(8, Math.round(ratio * 115));
                        const y = 125 - height;
                        return (
                          <g key={vid.id}>
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={height}
                              rx={6}
                              fill="#e11d48"
                              opacity={0.85}
                            />
                            <text
                              x={x + barWidth / 2}
                              y={142}
                              textAnchor="middle"
                              fontSize="10"
                              fill="#71717a"
                            >
                              #{idx + 1}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">No video metrics available yet.</p>
                )}
              </div>

              {/* Recent Activity Mini-Feed */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <h3 className="font-display font-bold text-sm text-zinc-950 dark:text-white">
                  Recent Platform Operations
                </h3>
                <div className="space-y-2 text-xs">
                  {activityLogs.slice(0, 6).map(log => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
                    >
                      <div>
                        <span className="font-semibold text-zinc-900 dark:text-white block">{log.action}</span>
                        <span className="text-zinc-500">{log.details}</span>
                      </div>
                      <span className="font-mono text-zinc-400 text-[10px]">
                        {formatLogTimestamp(log.timestamp)}
                      </span>
                    </div>
                  ))}
                  {activityLogs.length === 0 && (
                    <p className="text-zinc-400 italic">No activity recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. VIDEO MANAGEMENT */}
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
                    onChange={e => setVideoFilter(e.target.value as typeof videoFilter)}
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

              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3">Video</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Views</th>
                      <th className="p-3">Access Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Featured</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredVideos.map(vid => {
                      const currentStatus = vid.status || 'published';
                      return (
                        <tr key={vid.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="p-3 flex items-center gap-3">
                            <img
                              src={vid.thumbnailUrl}
                              alt={vid.title}
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
                          <td className="p-3 font-mono">{(vid.views || 0).toLocaleString()}</td>
                          <td className="p-3">
                            <select
                              value={vid.accessType || (vid.isPremium ? 'pro' : 'free')}
                              onChange={e =>
                                setVideoAccessType(vid.id, e.target.value as any, vid.price || 100)
                              }
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                                vid.accessType === 'pro' || vid.isPremium
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              <option value="free">FREE</option>
                              <option value="pro">PRO ({vid.price || 100} ETB)</option>
                              <option value="unlisted">UNLISTED</option>
                              <option value="private">PRIVATE</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() =>
                                modifyVideoStatus(
                                  vid.id,
                                  currentStatus === 'published' ? 'draft' : 'published',
                                  currentStatus === 'published' ? 'private' : 'public'
                                )
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                currentStatus === 'published'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {currentStatus}
                            </button>
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => toggleFeatureVideo(vid.id, !vid.isFeatured)}
                              className={`p-1.5 rounded-lg ${
                                vid.isFeatured ? 'text-amber-500' : 'text-zinc-400 hover:text-amber-500'
                              }`}
                              title="Toggle Featured"
                            >
                              <Star className={`w-4 h-4 ${vid.isFeatured ? 'fill-amber-500' : ''}`} />
                            </button>
                          </td>
                          <td className="p-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => navigate('watch', { videoId: vid.id })}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                              title="Watch"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingVideo(vid);
                                setIsUploadModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVideo(vid.id)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. VIDEO PUBLISHING */}
          {adminActiveTab === 'publishing' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                  Admin Direct Stream Publisher
                </h2>
                <p className="text-xs text-zinc-500">
                  Authorized staff can publish directly to public SVTech feeds with fee exemption (0 ETB).
                </p>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Open Studio Publishing Modal</span>
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <h3 className="font-display font-bold text-sm text-zinc-950 dark:text-white">
                  Pending / Draft Publishing Queue ({draftVideos.length})
                </h3>
                {draftVideos.map(v => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{v.title}</p>
                      <p className="text-zinc-500">{v.channel?.name} · {v.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => modifyVideoStatus(v.id, 'published', 'public')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0"
                    >
                      Approve & Publish
                    </button>
                  </div>
                ))}
                {draftVideos.length === 0 && (
                  <p className="text-xs text-zinc-400">No pending drafts waiting for approval.</p>
                )}
              </div>
            </div>
          )}

          {/* 4. SHORTS MANAGEMENT */}
          {adminActiveTab === 'shorts' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                <h3 className="font-display font-bold text-sm text-zinc-950 dark:text-white">
                  Publish New SVTech Short Reel
                </h3>
                <form onSubmit={handleCreateShort} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    value={newShortTitle}
                    onChange={e => setNewShortTitle(e.target.value)}
                    placeholder="Short Title..."
                    className="px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  />
                  <input
                    type="url"
                    required
                    value={newShortUrl}
                    onChange={e => setNewShortUrl(e.target.value)}
                    placeholder="Video URL..."
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

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {shorts.map(sh => (
                  <div
                    key={sh.id}
                    className="p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2"
                  >
                    <div className="aspect-[9/16] rounded-xl overflow-hidden bg-zinc-800 relative">
                      <img src={sh.thumbnailUrl} alt={sh.title} className="w-full h-full object-cover" />
                      <button
                        type="button"
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

          {/* 5. LIVE STREAMING */}
          {adminActiveTab === 'live' && (
            <div className="max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className={`w-5 h-5 text-rose-600 ${liveIngressActive ? 'animate-pulse' : ''}`} />
                  <h3 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                    Live Streaming Command
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    liveIngressActive
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {liveIngressActive ? 'INGRESS READY' : 'STANDBY'}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Configure RTMP broadcast ingress and copy stream credentials into OBS Studio or vMix.
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
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={liveStreamKey}
                      className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 font-mono text-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLiveKey}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleActivateLiveIngress}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white ${
                    liveIngressActive ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {liveIngressActive ? 'Stop Live Ingress' : 'Start Live Ingress'}
                </button>
              </div>
            </div>
          )}

          {/* 6. CHANNEL MANAGEMENT */}
          {adminActiveTab === 'channels' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Active Creator Channels ({channels.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {channels.map(ch => (
                  <div
                    key={ch.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img src={ch.avatarUrl} alt={ch.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-sm block truncate">{ch.name}</span>
                        <span className="text-xs text-zinc-500 font-mono">{ch.handle}</span>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          {ch.subscribers} Subscribers
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                      <button
                        type="button"
                        onClick={() => saveChannelProfile({ id: ch.id, verified: !ch.verified })}
                        className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                          ch.verified
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{ch.verified ? t.common.verified : 'Verify'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('channel', { channelId: ch.id })}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. USER MANAGEMENT & RBAC */}
          {adminActiveTab === 'users' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Platform User Directory & Role Governance ({allUsers.length})
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Assigned Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Governance</th>
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
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              usr.isBanned
                                ? 'bg-rose-500/15 text-rose-500'
                                : 'bg-emerald-500/15 text-emerald-500'
                            }`}
                          >
                            {usr.isBanned ? 'Suspended' : t.common.active}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2 whitespace-nowrap">
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
                          <button
                            type="button"
                            onClick={() => toggleUserBan(usr.uid, !usr.isBanned)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${
                              usr.isBanned
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-rose-500 hover:bg-rose-500/10'
                            }`}
                          >
                            <Ban className="w-3 h-3" />
                            <span>{usr.isBanned ? 'Restore' : 'Suspend'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. CREATOR MANAGEMENT */}
          {adminActiveTab === 'creators' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Creator Studio Applications ({creatorApplications.length})
              </h2>
              <div className="space-y-3">
                {creatorApplications.map(app => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{app.channelName}</span>
                        <span className="text-xs font-mono text-zinc-500">{app.channelHandle}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            app.status === 'approved'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : app.status === 'rejected'
                              ? 'bg-rose-500/15 text-rose-500'
                              : 'bg-amber-500/15 text-amber-500'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Applicant: {app.displayName} ({app.email}) · Focus: {app.category}
                      </p>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300">{app.bio}</p>
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => reviewCreatorApplication(app, 'approved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          Approve Creator
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewCreatorApplication(app, 'rejected')}
                          className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-rose-600 hover:text-white text-xs font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {creatorApplications.length === 0 && (
                  <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
                    No creator studio applications submitted yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 9. COMMENTS MODERATION */}
          {adminActiveTab === 'comments' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Platform Comments Moderation ({flatComments.length})
              </h2>
              <div className="space-y-2.5">
                {flatComments.map(c => {
                  const vid = videos.find(v => v.id === c.videoId);
                  return (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">{c.author?.name || 'Viewer'}</span>
                          <span className="text-zinc-400">on {vid?.title || c.videoId}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              c.status === 'flagged'
                                ? 'bg-amber-500/15 text-amber-500'
                                : c.status === 'removed'
                                ? 'bg-rose-500/15 text-rose-500'
                                : 'bg-emerald-500/15 text-emerald-500'
                            }`}
                          >
                            {c.status || 'active'}
                          </span>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300">{c.text}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {c.status !== 'flagged' ? (
                          <button
                            type="button"
                            onClick={() => modifyCommentStatus(c.id, 'flagged')}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1"
                          >
                            <Flag className="w-3 h-3" />
                            <span>Flag</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => modifyCommentStatus(c.id, 'active')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeComment(c.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-600 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
                {flatComments.length === 0 && (
                  <p className="text-xs text-zinc-400">No comments posted yet.</p>
                )}
              </div>
            </div>
          )}

          {/* 10. REPORTS & SAFETY */}
          {adminActiveTab === 'reports' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Content Safety & Moderation Reports ({reports.length})
              </h2>
              <div className="space-y-3">
                {reports.map(r => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 uppercase font-bold text-[10px]">
                          {r.targetType}
                        </span>
                        <span className="font-bold">{r.targetTitle || r.targetId}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.status === 'resolved'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : r.status === 'dismissed'
                              ? 'bg-zinc-500/15 text-zinc-500'
                              : 'bg-amber-500/15 text-amber-500'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300">Reason: {r.reason}</p>
                      <p className="text-zinc-400">Reported by: {r.reporterEmail || 'Authenticated Viewer'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.targetType === 'video' && (
                        <button
                          type="button"
                          onClick={() => navigate('watch', { videoId: r.targetId })}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-semibold"
                        >
                          Inspect
                        </button>
                      )}
                      {r.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => resolveModerationReport(r.id, 'resolved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold"
                          >
                            Resolve
                          </button>
                          <button
                            type="button"
                            onClick={() => resolveModerationReport(r.id, 'dismissed')}
                            className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 font-semibold"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-xs text-zinc-400">No safety reports in queue.</p>
                )}
              </div>
            </div>
          )}

          {/* 11. CATEGORIES */}
          {adminActiveTab === 'categories' && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                  Manage Platform Categories ({categories.length})
                </h2>
                <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="English Name (e.g. Tech)"
                    className="px-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  />
                  <input
                    type="text"
                    value={newCatNameAm}
                    onChange={e => setNewCatNameAm(e.target.value)}
                    placeholder="Amharic Name (አማርኛ)"
                    className="px-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  />
                  <input
                    type="text"
                    value={newCatSlug}
                    onChange={e => setNewCatSlug(e.target.value)}
                    placeholder="slug (optional)"
                    className="px-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white inline-flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Category</span>
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-sm block">{cat.name}</span>
                      <span className="text-zinc-500">
                        {cat.nameAm || cat.name} · <code className="font-mono">{cat.slug}</code>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCategory(cat.id)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. PLAYLISTS */}
          {adminActiveTab === 'playlists' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Platform Playlists ({playlists.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map(pl => (
                  <div
                    key={pl.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm truncate">{pl.title}</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold">
                          {pl.isPrivate ? 'Private' : 'Public'}
                        </span>
                      </div>
                      <p className="text-zinc-500 line-clamp-2 mt-1">{pl.description}</p>
                      <p className="text-zinc-400 mt-1">{pl.videoIds.length} videos</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => navigate('playlist-detail', { playlistId: pl.id })}
                        className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-semibold"
                      >
                        Open Playlist
                      </button>
                      <button
                        type="button"
                        onClick={() => removePlaylist(pl.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 13. PAYMENTS & TRANSACTIONS */}
          {adminActiveTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                    Ethiopian Birr (ETB) Publishing Transactions
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Audit log of Telebirr, CBE Birr, and Chapa publishing fee settlements
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Total Verified: {totalETBRevenue.toLocaleString()} ETB
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
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3 font-mono font-semibold text-zinc-900 dark:text-white">
                          {tx.referenceNumber}
                        </td>
                        <td className="p-3 text-zinc-500">{tx.userEmail}</td>
                        <td className="p-3 line-clamp-1">{tx.videoTitle || 'Stream Publication'}</td>
                        <td className="p-3 uppercase font-semibold text-zinc-600 dark:text-zinc-400">
                          {tx.provider}
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-600">{tx.amount} ETB</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tx.status === 'successful'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {tx.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => verifyPayment(tx.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                            >
                              Verify Fee
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-zinc-400">
                          No external transactions recorded yet. Standard {platformSettings.publishingFeeETB} ETB rate active.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Real-time Telebirr Video Purchases Verification */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-display font-bold text-base text-zinc-950 dark:text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      PRO Video Telebirr Purchases ({videoPurchases.length})
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Verify Telebirr SMS transfers to merchant {platformSettings.telebirrMerchantId || '0913767842'}, approve access, or issue refunds
                    </p>
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                    Merchant: {platformSettings.telebirrMerchantId || '0913767842'}
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
                              {targetVideo?.title || p.videoTitle || p.videoId}
                            </td>
                            <td className="p-3 font-mono font-bold text-amber-500">
                              {p.amount} {p.currency}
                            </td>
                            <td className="p-3 text-zinc-400 font-mono text-[11px]">
                              {formatLogTimestamp(dateVal)}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  statusVal === 'successful' || statusVal === 'verified'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : statusVal === 'refunded'
                                    ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                }`}
                              >
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
                            No PRO video purchases recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 14. PRICING & SUBSCRIPTIONS */}
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
                    min={0}
                    value={pricePerVideo}
                    onChange={e => setPricePerVideo(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono font-bold"
                  />
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    Public FREE streams remain free to watch; creators pay the publishing verification fee.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Pro Creator Plan (ETB / Month)
                  </label>
                  <input
                    type="number"
                    min={0}
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

          {/* 15. ADVERTISEMENTS / FEATURED BANNER */}
          {adminActiveTab === 'ads' && (
            <div className="max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Featured Announcement & Promo Banner
              </h2>
              <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
                <label className="flex items-center gap-2 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bannerEnabled}
                    onChange={e => setBannerEnabled(e.target.checked)}
                    className="rounded border-zinc-400 text-rose-600"
                  />
                  <span>Enable Featured Banner on Home Feed</span>
                </label>

                <div>
                  <label className="block font-semibold mb-1">Banner Title</label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={e => setBannerTitle(e.target.value)}
                    placeholder="e.g. Featured Masterclass on SVTech Media"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Banner Description</label>
                  <textarea
                    rows={2}
                    value={bannerText}
                    onChange={e => setBannerText(e.target.value)}
                    placeholder="Highlight promoted stream or platform campaign..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Linked Video (Optional)</label>
                  <select
                    value={bannerVideoId}
                    onChange={e => setBannerVideoId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  >
                    <option value="">None</option>
                    {videos.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Save Featured Banner
                </button>
              </form>
            </div>
          )}

          {/* 16. NOTIFICATIONS BROADCAST */}
          {adminActiveTab === 'notifications' && (
            <div className="max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Platform-Wide Broadcast Announcements
              </h2>
              <form onSubmit={handleSendAnnouncement} className="space-y-3 text-xs">
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={e => setAnnouncementTitle(e.target.value)}
                  placeholder="Announcement Title..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
                <textarea
                  required
                  rows={3}
                  value={announcementMsg}
                  onChange={e => setAnnouncementMsg(e.target.value)}
                  placeholder="Message for all SVTech Media viewers and creators..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
                <div>
                  <label className="block font-semibold mb-1">Attach Video Link (Optional)</label>
                  <select
                    value={announcementVideoId}
                    onChange={e => setAnnouncementVideoId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  >
                    <option value="">No video attached</option>
                    {videos.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow"
                >
                  Dispatch Announcement
                </button>
              </form>
            </div>
          )}

          {/* 17. ANALYTICS & KPIs */}
          {adminActiveTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Catalog & Monetization Analytics
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 block">FREE Streams</span>
                  <span className="text-xl font-bold font-mono mt-1 block">{freeVideosList.length}</span>
                  <span className="text-[11px] text-emerald-500 font-semibold">
                    {freeViewsSum.toLocaleString()} views
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 block">PRO Monetized Streams</span>
                  <span className="text-xl font-bold font-mono mt-1 block">{proVideosList.length}</span>
                  <span className="text-[11px] text-amber-500 font-semibold">
                    {proViewsSum.toLocaleString()} views
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 block">Verified PRO Unlocks</span>
                  <span className="text-xl font-bold font-mono mt-1 block">{verifiedProPurchases.length}</span>
                  <span className="text-[11px] text-zinc-400">
                    {proPurchaseRevenue.toLocaleString()} ETB collected
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 block">Total Shorts & Channels</span>
                  <span className="text-xl font-bold font-mono mt-1 block">
                    {shorts.length} / {channels.length}
                  </span>
                  <span className="text-[11px] text-zinc-400">Shorts reels / Channels</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="font-bold text-sm">Top 5 Videos by Views</h3>
                  {[...videos]
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 5)
                    .map((v, idx) => (
                      <div key={v.id} className="space-y-1 text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="truncate font-medium">
                            {idx + 1}. {v.title}
                          </span>
                          <span className="font-mono font-bold shrink-0">
                            {(v.views || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-rose-600 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.round(((v.views || 0) / maxChartViews) * 100))}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="font-bold text-sm">Category Performance</h3>
                  {categoryStats.map(([cat, stats]) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40"
                    >
                      <span className="font-semibold">{cat}</span>
                      <span className="text-zinc-500 font-mono">
                        {stats.count} videos · {stats.views.toLocaleString()} views
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 18. DOWNLOADS MANAGEMENT */}
          {adminActiveTab === 'downloads' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                    Global Offline Download Policy
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Active session downloads: {downloads.length} · Control whether viewers may cache streams offline.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ allowPublicDownloads: !platformSettings.allowPublicDownloads })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    platformSettings.allowPublicDownloads
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {platformSettings.allowPublicDownloads ? 'Public Downloads: ENABLED' : 'Public Downloads: DISABLED'}
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3">Video</th>
                      <th className="p-3">Access</th>
                      <th className="p-3">Per-Video Download</th>
                      <th className="p-3 text-right">Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {videos.map(v => {
                      const enabled = v.allowDownloads !== false;
                      return (
                        <tr key={v.id}>
                          <td className="p-3 font-medium">{v.title}</td>
                          <td className="p-3 uppercase font-mono text-[11px]">
                            {v.accessType || 'free'}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                enabled ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
                              }`}
                            >
                              {enabled ? 'Allowed' : 'Blocked'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => uploadVideo({ ...v, allowDownloads: !enabled }, v.transactionId)}
                              className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold"
                            >
                              {enabled ? 'Disable' : 'Enable'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 19. LANGUAGE MANAGEMENT */}
          {adminActiveTab === 'languages' && (
            <div className="max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Bilingual Language System & Localization
              </h2>
              <p className="text-xs text-zinc-500">
                SVTech Media supports full 1:1 English (EN) and Amharic (አማርኛ) translation parity across every page.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    language === 'en'
                      ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/30 ring-2 ring-rose-600'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <span className="font-bold text-sm block">English (EN)</span>
                  <span className="text-xs text-zinc-400">Default International Language</span>
                  {language === 'en' && (
                    <span className="text-[10px] text-rose-600 font-bold block mt-2">Active</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('am')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    language === 'am'
                      ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/30 ring-2 ring-rose-600'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <span className="font-bold text-sm block">አማርኛ (Amharic)</span>
                  <span className="text-xs text-zinc-400">Ethiopian Unicode Typography</span>
                  {language === 'am' && (
                    <span className="text-[10px] text-rose-600 font-bold block mt-2">Active</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 20. PLATFORM SETTINGS */}
          {adminActiveTab === 'settings' && (
            <div className="max-w-2xl bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Platform Configuration & Policies
              </h2>
              <form onSubmit={handleSavePlatformSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Site Name</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={e => setSiteName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Telebirr Merchant Number</label>
                    <input
                      type="text"
                      value={telebirrMerchantId}
                      onChange={e => setTelebirrMerchantId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Platform Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowPublicUploads}
                      onChange={e => setAllowPublicUploads(e.target.checked)}
                    />
                    <span>Allow signed-in members to upload videos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireApproval}
                      onChange={e => setRequireApproval(e.target.checked)}
                    />
                    <span>Require staff moderation approval before publishing</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowFreeCreatorUploads}
                      onChange={e => setAllowFreeCreatorUploads(e.target.checked)}
                    />
                    <span>Waive 100 ETB creator publishing fee for approved creators</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-rose-500 font-semibold">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={e => setMaintenanceMode(e.target.checked)}
                    />
                    <span>Enable Maintenance Mode</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Save Platform Settings
                </button>
              </form>
            </div>
          )}

          {/* 21. SECURITY & PERMISSIONS */}
          {adminActiveTab === 'security' && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                    Firebase Security & RBAC Posture
                  </h2>
                </div>
                <p className="text-xs text-zinc-500">
                  Target Firebase Project: <code className="font-mono font-bold">svtech-meddia</code> · Super Admin:{' '}
                  <code className="font-mono font-bold">vipsami612@gmail.com</code>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Self-promotion demo role switcher removed</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Telebirr purchases default to pending until staff approval</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Firestore & Storage rules prepared for svtech-meddia deployment</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Banned users & private videos gated in security rules</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <h3 className="font-bold text-sm">Live Role Distribution ({allUsers.length} users)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {roleDistribution.map(item => (
                    <div
                      key={item.role}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between"
                    >
                      <span className="font-semibold uppercase">{item.role.replace('_', ' ')}</span>
                      <span className="font-mono font-bold text-rose-600">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 22. ACTIVITY LOGS */}
          {adminActiveTab === 'logs' && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                Security & Platform Audit Logs ({activityLogs.length})
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
                        <td className="p-3 text-zinc-400">{formatLogTimestamp(log.timestamp)}</td>
                        <td className="p-3 text-rose-600">{log.adminEmail}</td>
                        <td className="p-3 font-bold">{log.action}</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">{log.details}</td>
                      </tr>
                    ))}
                    {activityLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-zinc-400 font-sans">
                          No audit logs recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
