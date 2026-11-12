import React, { useState } from 'react';
import {
  Home,
  PlaySquare,
  Clock,
  ThumbsUp,
  ListVideo,
  Flame,
  Gamepad2,
  Cpu,
  Sparkles,
  History,
  Tv,
  ChevronRight,
  FileVideo,
  LayoutDashboard,
  ShieldCheck,
  Compass,
  Radio,
  Download,
  BookOpen,
  Film,
  Music,
  FlaskConical,
  Newspaper,
  Upload,
  BarChart2,
  UserCheck,
  CreditCard,
  Settings,
  AlertTriangle,
  X,
  ChevronDown,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    viewMode,
    navigate,
    sidebarOpen,
    setSidebarOpen,
    channels,
    subscribedChannelIds,
    watchHistory,
    watchLaterVideoIds,
    likedVideoIds,
    playlists,
    downloads,
    isAdmin,
    isModerator,
    isCreator,
    setIsUploadModalOpen,
    setAdminActiveTab,
    t,
    videoPurchases
  } = useApp();

  // Collapsible section states
  const [exploreOpen, setExploreOpen] = useState(true);
  const [creatorOpen, setCreatorOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  const subscribedChannels = channels.filter(c => subscribedChannelIds.includes(c.id));

  // Mini rail items for collapsed state on desktop (w-[72px])
  const miniRailItems = [
    { mode: 'home' as const, label: t.nav.home, icon: Home },
    { mode: 'shorts' as const, label: t.nav.shorts, icon: PlaySquare },
    { mode: 'subscriptions' as const, label: t.nav.subscriptions, icon: Tv },
    { mode: 'history' as const, label: t.nav.you, icon: History },
    { mode: 'purchases' as const, label: t.purchasesView?.title || 'Purchases', icon: Lock },
    { mode: 'downloads' as const, label: t.nav.downloads, icon: Download }
  ];

  const handleNavClick = (mode: any, adminTab?: string) => {
    if (adminTab) {
      setAdminActiveTab(adminTab);
    }
    navigate(mode);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile & Tablet Slide-in Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity animate-in fade-in"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 bg-white dark:bg-[#0f0f0f] border-r border-zinc-200/80 dark:border-zinc-800/80 transition-all duration-300 overflow-y-auto no-scrollbar ${
          sidebarOpen
            ? 'w-60 translate-x-0 shadow-2xl lg:shadow-none'
            : '-translate-x-full lg:translate-x-0 lg:w-[72px]'
        }`}
      >
        {/* Mobile Drawer Top Bar with Close Button */}
        <div className="lg:hidden flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
          <span className="font-display font-bold text-sm text-zinc-900 dark:text-white">
            {t.brandName}
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* 1. COLLAPSED MINI RAIL (Desktop Only, ~72px wide)           */}
        {/* ============================================================ */}
        {!sidebarOpen && (
          <div className="hidden lg:flex flex-col items-center py-2 gap-1">
            {miniRailItems.map(item => {
              const Icon = item.icon;
              const isActive =
                item.mode === viewMode ||
                (item.mode === 'history' &&
                  ['history', 'liked', 'watchlater', 'playlists', 'your-videos'].includes(viewMode));
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.mode)}
                  title={item.label}
                  className={`w-16 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-rose-600' : ''}`} />
                  <span className="text-[10px] tracking-tight truncate max-w-[64px]">{item.label}</span>
                </button>
              );
            })}

            {/* Admin Mini Icon for Staff */}
            {(isAdmin || isModerator) && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`w-16 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors ${
                  viewMode === 'admin'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title={t.nav.adminCenter}
              >
                <LayoutDashboard className="w-5 h-5 text-rose-600" />
                <span className="text-[10px]">Admin</span>
              </button>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. EXPANDED FULL SIDEBAR (~240px wide)                      */}
        {/* ============================================================ */}
        {sidebarOpen && (
          <div className="p-3 space-y-4">
            {/* SECTION: MAIN */}
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavClick('home')}
                className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  viewMode === 'home'
                    ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-950 dark:text-white'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Home className={`w-5 h-5 ${viewMode === 'home' ? 'text-rose-600' : ''}`} />
                <span>{t.nav.home}</span>
              </button>

              <button
                onClick={() => handleNavClick('shorts')}
                className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  viewMode === 'shorts'
                    ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-950 dark:text-white'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <PlaySquare className={`w-5 h-5 ${viewMode === 'shorts' ? 'text-rose-600' : ''}`} />
                <span>{t.nav.shorts}</span>
              </button>

              <button
                onClick={() => handleNavClick('subscriptions')}
                className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  viewMode === 'subscriptions'
                    ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-950 dark:text-white'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Tv className={`w-5 h-5 ${viewMode === 'subscriptions' ? 'text-rose-600' : ''}`} />
                <span>{t.nav.subscriptions}</span>
              </button>

              <button
                onClick={() => handleNavClick('home')}
                className="w-full flex items-center gap-5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <Flame className="w-5 h-5 text-orange-500" />
                <span>{t.nav.trending}</span>
              </button>

              <button
                onClick={() => handleNavClick('home')}
                className="w-full flex items-center gap-5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
                <span>{t.nav.live}</span>
              </button>
            </div>

            <div className="h-px bg-zinc-200/80 dark:bg-zinc-800/80 mx-1" />

            {/* SECTION: LIBRARY (YOU) */}
            <div>
              <div
                onClick={() => handleNavClick('history')}
                className="flex items-center justify-between px-3 py-1.5 cursor-pointer group"
              >
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {t.nav.you}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </div>

              <div className="mt-1 space-y-0.5">
                <button
                  onClick={() => handleNavClick('history')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    viewMode === 'history'
                      ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-950 dark:text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <History className="w-4 h-4 text-zinc-500" />
                    <span>{t.nav.history}</span>
                  </div>
                  {watchHistory.length > 0 && (
                    <span className="text-[11px] text-zinc-400 font-mono">{watchHistory.length}</span>
                  )}
                </button>

                <button
                  onClick={() => handleNavClick('playlists')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    viewMode === 'playlists' || viewMode === 'playlist-detail'
                      ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-950 dark:text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <ListVideo className="w-4 h-4 text-zinc-500" />
                    <span>{t.nav.playlists}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">{playlists.length}</span>
                </button>

                <button
                  onClick={() => handleNavClick('watchlater')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    viewMode === 'watchlater'
                      ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-950 dark:text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span>{t.nav.watchLater}</span>
                  </div>
                  {watchLaterVideoIds.length > 0 && (
                    <span className="text-[11px] text-zinc-400 font-mono">{watchLaterVideoIds.length}</span>
                  )}
                </button>

                <button
                  onClick={() => handleNavClick('liked')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    viewMode === 'liked'
                      ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-950 dark:text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <ThumbsUp className="w-4 h-4 text-zinc-500" />
                    <span>{t.nav.likedVideos}</span>
                  </div>
                  {likedVideoIds.length > 0 && (
                    <span className="text-[11px] text-zinc-400 font-mono">{likedVideoIds.length}</span>
                  )}
                </button>

                {/* Downloads Section */}
                <button
                  onClick={() => handleNavClick('downloads')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    viewMode === 'downloads'
                      ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-950 dark:text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Download className="w-4 h-4 text-emerald-500" />
                    <span>{t.nav.downloads}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">{downloads.length}</span>
                </button>

                {/* My Purchases (PRO Videos) Section */}
                <button
                  onClick={() => handleNavClick('purchases')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    viewMode === 'purchases'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Lock className="w-4 h-4 text-amber-500 stroke-[2.5]" />
                    <span className="font-semibold">{t.purchasesView?.title || 'My Purchases'}</span>
                  </div>
                  {videoPurchases.length > 0 && (
                    <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold">
                      {videoPurchases.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="h-px bg-zinc-200/80 dark:bg-zinc-800/80 mx-1" />

            {/* SECTION: CREATOR HUB */}
            <div>
              <button
                onClick={() => setCreatorOpen(!creatorOpen)}
                className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <span>{t.nav.creatorStudio}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${creatorOpen ? 'rotate-180' : ''}`} />
              </button>

              {creatorOpen && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => handleNavClick('your-videos')}
                    className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      viewMode === 'your-videos'
                        ? 'bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-950 dark:text-white'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <FileVideo className="w-4 h-4 text-zinc-500" />
                    <span>{t.nav.myVideos}</span>
                  </button>

                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t.nav.uploadVideo} (100 ETB)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="h-px bg-zinc-200/80 dark:bg-zinc-800/80 mx-1" />

            {/* SECTION: EXPLORE (With Collapsible Subcategories) */}
            <div>
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <span>{t.nav.explore}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
              </button>

              {exploreOpen && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => handleNavClick('home')}
                    className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <Cpu className="w-4 h-4 text-blue-500" />
                    <span>{t.explore.technology}</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('home')}
                    className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>{t.explore.education}</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('home')}
                    className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <Film className="w-4 h-4 text-purple-500" />
                    <span>{t.explore.entertainment}</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('home')}
                    className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <Gamepad2 className="w-4 h-4 text-indigo-500" />
                    <span>{t.explore.gaming}</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('home')}
                    className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <Music className="w-4 h-4 text-pink-500" />
                    <span>{t.explore.music}</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('home')}
                    className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <FlaskConical className="w-4 h-4 text-cyan-500" />
                    <span>{t.explore.science}</span>
                  </button>
                </div>
              )}
            </div>

            {/* SECTION: ADMINISTRATION (Authorized Roles Only) */}
            {(isAdmin || isModerator) && (
              <>
                <div className="h-px bg-zinc-200/80 dark:bg-zinc-800/80 mx-1" />
                <div>
                  <button
                    onClick={() => setAdminOpen(!adminOpen)}
                    className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t.nav.adminCenter}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${adminOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {adminOpen && (
                    <div className="mt-1 space-y-0.5">
                      <button
                        onClick={() => handleNavClick('admin', 'overview')}
                        className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          viewMode === 'admin'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Command Center</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('admin', 'videos')}
                        className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <FileVideo className="w-4 h-4 text-zinc-400" />
                        <span>{t.nav.videoManagement}</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('admin', 'users')}
                        className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <UserCheck className="w-4 h-4 text-zinc-400" />
                        <span>{t.nav.userManagement}</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('admin', 'payments')}
                        className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        <span>{t.nav.payments}</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('admin', 'reports')}
                        className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>{t.nav.reports}</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('admin', 'settings')}
                        className="w-full flex items-center gap-4 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Settings className="w-4 h-4 text-zinc-400" />
                        <span>{t.nav.platformSettings}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="h-px bg-zinc-200/80 dark:bg-zinc-800/80 mx-1" />

            {/* Subscriptions List */}
            <div>
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t.nav.subscriptions}
              </div>
              <div className="mt-1 space-y-0.5">
                {subscribedChannels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => handleNavClick('channel')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={channel.avatarUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                      <span className="truncate">{channel.name}</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                  </button>
                ))}

                {subscribedChannels.length === 0 && (
                  <p className="px-3 py-2 text-xs text-zinc-400 italic">{t.nav.noSubscriptions}</p>
                )}
              </div>
            </div>

            <div className="h-px bg-zinc-200/80 dark:bg-zinc-800/80 mx-1" />

            {/* Footer */}
            <div className="px-3 pt-2 text-[11px] text-zinc-400 space-y-1">
              <p>About Press Copyright Creator Hub</p>
              <p>Terms Privacy Policy & Safety</p>
              <p className="text-zinc-500 pt-2 font-mono">© 2026 {t.brandName} Inc.</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
