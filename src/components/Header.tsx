import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Mic,
  Video as VideoIcon,
  Bell,
  Sun,
  Moon,
  X,
  User,
  History,
  ThumbsUp,
  FileVideo,
  Settings,
  Check,
  TrendingUp,
  Shield,
  LogIn,
  LogOut,
  LayoutDashboard,
  Languages,
  Download,
  CreditCard,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';

export const Header: React.FC = () => {
  const {
    toggleSidebar,
    searchQuery,
    setSearchQuery,
    navigate,
    darkMode,
    toggleDarkMode,
    notifications,
    unreadNotificationsCount,
    markNotificationsRead,
    setIsUploadModalOpen,
    setIsVoiceSearchModalOpen,
    videos,
    userProfile,
    isAuthenticated,
    emailVerified,
    isAdmin,
    isModerator,
    isCreator,
    openAuthModal,
    signOutUser,
    language,
    setLanguage,
    t
  } = useApp();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Sync internal search input if context changes
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setShowSuggestions(false);
      navigate('search', { searchQuery: searchInput.trim() });
    }
  };

  const handleSuggestionClick = (title: string) => {
    setSearchInput(title);
    setShowSuggestions(false);
    navigate('search', { searchQuery: title });
  };

  const suggestions = searchInput.trim()
    ? videos
        .filter(
          v =>
            v.title.toLowerCase().includes(searchInput.toLowerCase()) ||
            v.category.toLowerCase().includes(searchInput.toLowerCase())
        )
        .slice(0, 5)
        .map(v => v.title)
    : [
        'Big Buck Bunny 4K Remaster',
        'Next-Gen Full Stack TypeScript',
        'Tears of Steel Cyberpunk VFX',
        'Untamed Mountain Wilderness',
        'Next-Gen Ray-Tracing Gaming Rig'
      ];

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 md:gap-8 px-3 sm:px-4 h-14 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      {/* Zone 1: Hamburger Menu & Brand Wordmark */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="p-2 -ml-1 sm:-ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 focus-visible:outline-none group text-left"
        >
          {/* SVTech Media Brand Mark */}
          <div className="w-8 h-7 bg-gradient-to-br from-rose-600 to-rose-700 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[8px] border-l-white ml-0.5" />
          </div>
          <div className="flex flex-col tracking-tight">
            <div className="flex items-center">
              <span className="font-display text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                SV<span className="text-rose-600">Tech</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 ml-1 uppercase">Media</span>
            </div>
            <span className="text-[9px] font-medium text-zinc-400 -mt-1 hidden sm:block tracking-wide">
              {t.taglineShort}
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Centered Search Bar with Voice Button */}
      <div
        ref={searchContainerRef}
        className="relative flex-1 max-w-2xl mx-auto flex items-center gap-2 justify-center"
      >
        <form onSubmit={handleSearchSubmit} className="flex items-center w-full max-w-xl">
          <div className="relative flex items-center w-full">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t.header.searchPlaceholder}
              className="w-full h-9 sm:h-10 pl-3 sm:pl-4 pr-10 rounded-l-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-rose-500 dark:focus:border-rose-500 focus:bg-white dark:focus:bg-zinc-950 transition-colors shadow-inner"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            aria-label="Search"
            className="h-9 sm:h-10 px-4 sm:px-6 rounded-r-full border border-l-0 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors flex items-center justify-center shrink-0"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={() => setIsVoiceSearchModalOpen(true)}
          title={t.header.voiceSearch}
          className="p-2 sm:p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors shrink-0 hidden sm:flex items-center justify-center"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Auto-Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute top-11 sm:top-12 left-0 right-8 sm:right-12 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 overflow-hidden">
            <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              {searchInput ? t.header.matchingResults : t.header.trendingResults}
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={`suggestion-${idx}-${item}`}
                type="button"
                onClick={() => handleSuggestionClick(item)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {searchInput ? (
                  <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zone 3: Actions & Language & User Controls */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Language Switcher Dropdown (EN / አማ) */}
        <div ref={langMenuRef} className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
            title="Switch Language / ቋንቋ ይቀይሩ"
          >
            <Languages className="w-3.5 h-3.5 text-rose-600" />
            <span className="font-mono">{language === 'en' ? 'EN' : 'አማ'}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 top-11 w-44 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Language / ቋንቋ
              </div>
              <button
                onClick={() => handleSelectLanguage('en')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  language === 'en' ? 'font-bold text-rose-600' : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span>English (EN)</span>
                {language === 'en' && <Check className="w-3.5 h-3.5 text-rose-600" />}
              </button>
              <button
                onClick={() => handleSelectLanguage('am')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  language === 'am' ? 'font-bold text-rose-600' : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span>አማርኛ (Amharic)</span>
                {language === 'am' && <Check className="w-3.5 h-3.5 text-rose-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Moderator Center Quick Button */}
        {isModerator && !isAdmin && (
          <button
            onClick={() => navigate('moderator-dashboard')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
            title={t.nav.moderatorCenter}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.nav.moderatorCenter}</span>
          </button>
        )}

        {/* Admin Command Center Quick Button */}
        {isAdmin && (
          <button
            onClick={() => navigate('admin')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
            title="Open Admin Command Center"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.nav.adminCenter}</span>
          </button>
        )}

        {/* Create / Upload Video Button */}
        <button
          onClick={() => (isAuthenticated ? setIsUploadModalOpen(true) : navigate('signin'))}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 transition-colors whitespace-nowrap shrink-0"
        >
          <VideoIcon className="w-4 h-4 text-rose-600" />
          <span className="hidden md:inline">{t.header.upload}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
          className="p-1.5 sm:p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markNotificationsRead();
            }}
            title={t.header.notifications}
            className="relative p-1.5 sm:p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 py-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {t.header.activityStream}
                </span>
                <span className="text-xs text-zinc-400">{t.header.realTimeAlerts}</span>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => {
                      setShowNotifications(false);
                      if (notif.videoId) navigate('watch', { videoId: notif.videoId });
                    }}
                    className={`w-full flex items-start gap-3 p-3.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors ${
                      !notif.read ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    <img
                      src={notif.avatarUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {notif.title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-zinc-400 mt-1 inline-block">
                        {notif.time}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sign In / Sign Up Buttons when unauthenticated */}
        {!isAuthenticated && (
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-rose-600" />
              <span>{t.auth.signIn}</span>
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
            >
              {t.auth.signUp}
            </button>
          </div>
        )}

        {/* User Profile Avatar & Dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 rounded-full"
            aria-label="Account menu"
          >
            {userProfile.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName}
                referrerPolicy="no-referrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-transparent hover:ring-rose-600 object-cover transition-all"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-900 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-white text-xs font-bold flex items-center justify-center hover:ring-2 hover:ring-rose-600 transition-all">
                {(userProfile.displayName || 'G').charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-68 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                {userProfile.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {(userProfile.displayName || 'G').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {userProfile.displayName}
                  </p>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider inline-block">
                    {isAuthenticated ? userProfile.role.replace('_', ' ') : 'Guest Viewer'}
                  </span>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {userProfile.email || 'Not signed in'}
                  </p>
                </div>
              </div>

              <div className="py-1">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('admin');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                  >
                    <LayoutDashboard className="w-4 h-4 text-rose-600" />
                    {t.nav.adminCenter}
                  </button>
                )}

                {isModerator && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('moderator-dashboard');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left"
                  >
                    <Shield className="w-4 h-4 text-amber-500" />
                    {t.nav.moderatorCenter}
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('creator-dashboard');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                >
                  <FileVideo className="w-4 h-4 text-zinc-500" />
                  {isCreator ? t.nav.creatorStudio : t.creatorStudio.applyTitle}
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('downloads');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                >
                  <Download className="w-4 h-4 text-emerald-500" />
                  {t.nav.downloads}
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('purchases');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left"
                >
                  <Lock className="w-4 h-4 text-amber-500" />
                  {t.purchasesView?.title || 'My Purchases'}
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('history');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                >
                  <History className="w-4 h-4 text-zinc-500" />
                  {t.nav.history}
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('liked');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                >
                  <ThumbsUp className="w-4 h-4 text-zinc-500" />
                  {t.nav.likedVideos}
                </button>
              </div>

              <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openAuthModal('signin');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                    >
                      <LogIn className="w-4 h-4 text-rose-600" />
                      {t.auth.signIn}
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openAuthModal('signup');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                    >
                      <User className="w-4 h-4 text-rose-600" />
                      {t.auth.createAccount}
                    </button>
                  </>
                ) : (
                  <>
                    {!emailVerified && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('verify-email');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-left"
                      >
                        <Shield className="w-4 h-4 text-amber-500" />
                        {t.auth.verifyTitle}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openAuthModal('signin');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                    >
                      <User className="w-4 h-4 text-emerald-500" />
                      Account & Role Profile
                    </button>
                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        await signOutUser();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.header.signOut}
                    </button>
                  </>
                )}

                <div className="px-4 py-1.5 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Firebase Auth</span>
                  <span className={`flex items-center gap-1 font-semibold ${isAuthenticated ? 'text-emerald-500' : 'text-zinc-400'}`}>
                    <Check className="w-3 h-3" /> {isAuthenticated ? t.header.realtimeConnected : 'Guest Mode'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
