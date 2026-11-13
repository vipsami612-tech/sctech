import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Video,
  Channel,
  ShortItem,
  Playlist,
  HistoryItem,
  NotificationItem,
  ViewMode,
  Comment,
  UserProfile,
  ReportItem,
  ActivityLog,
  PlatformSettings,
  CategoryItem,
  UserRole,
  Language,
  PaymentTransaction,
  DownloadRecord,
  VideoPurchase,
  VideoAccessType,
  ReactionType,
  LiveReaction,
  EngagementEvent,
  AccessFilter,
  CommunityPost,
  CreatorApplication
} from '../types';
import {
  INITIAL_VIDEOS,
  INITIAL_CHANNELS,
  INITIAL_SHORTS,
  INITIAL_PLAYLISTS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import {
  auth,
  googleProvider,
  testConnection,
  initializeFirestoreDatabase,
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS
} from '../services/firebase';
import {
  subscribeToVideos,
  subscribeToChannels,
  subscribeToShorts,
  subscribeToPlaylists,
  subscribeToNotifications,
  subscribeToAllComments,
  subscribeToReports,
  subscribeToActivityLogs,
  subscribeToUsers,
  subscribeToPlatformSettings,
  subscribeToTransactions,
  subscribeToUserTransactions,
  createOrUpdateVideo,
  deleteVideo,
  updateVideoStatus,
  toggleVideoFeatured,
  incrementVideoViews,
  updateVideoLikes,
  createShort,
  deleteShort,
  updateShortLikes,
  createOrUpdateChannel,
  toggleChannelSubscription,
  postComment,
  updateCommentStatus,
  deleteComment,
  logPlatformActivity,
  updateUserRole,
  updateUserBanStatus,
  savePlaylistToFirestore,
  deletePlaylistFromFirestore,
  reviewCreatorApplicationInFirestore,
  fileReport,
  resolveReport,
  sendBroadcastNotification,
  savePlatformSettings,
  createPaymentTransaction,
  verifyAndCompletePayment,
  subscribeToVideoPurchases,
  subscribeToUserVideoPurchases,
  recordVideoPurchase,
  verifyVideoPurchase,
  refundVideoPurchase,
  updateVideoAccessType,
  subscribeToEngagementEvents24h,
  sendLiveReaction,
  incrementVideoShares,
  subscribeToUserProfile,
  createOrSyncUserProfile
} from '../services/videoService';
import {
  subscribeToCommunityPosts,
  createCommunityPostInFirestore,
  toggleCommunityPostLikeInFirestore,
  deleteCommunityPostInFirestore,
  subscribeToCreatorApplications,
  submitCreatorApplicationInFirestore,
  subscribeToUserWatchHistory,
  upsertUserWatchHistory,
  removeUserWatchHistoryItem,
  subscribeToCategories,
  saveCategoryInFirestore,
  deleteCategoryInFirestore
} from '../services/postService';
import {
  hasPendingVideoPurchase,
  isVideoPurchased,
  mapPathToRouteState,
  mapViewModeToPath
} from '../services/domainHelpers';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { getTranslations, en } from '../i18n';

interface MiniPlayerState {
  active: boolean;
  video: Video | null;
  isPlaying: boolean;
  currentTime: number;
}

export interface ToastNotification {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Navigation & View
  viewMode: ViewMode;
  currentVideoId: string | null;
  currentChannelId: string | null;
  currentPlaylistId: string | null;
  searchQuery: string;
  activeCategory: string;
  accessFilter: AccessFilter;
  adminActiveTab: string;

  // Language & i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof en;

  // Data Collections
  videos: Video[];
  channels: Channel[];
  shorts: ShortItem[];
  playlists: Playlist[];
  comments: Record<string, Comment[]>;
  posts: CommunityPost[];
  categories: CategoryItem[];
  platformSettings: PlatformSettings;
  reports: ReportItem[];
  activityLogs: ActivityLog[];
  allUsers: UserProfile[];
  creatorApplications: CreatorApplication[];
  transactions: PaymentTransaction[];
  videoPurchases: VideoPurchase[];
  downloads: DownloadRecord[];
  recentEngagementEvents: EngagementEvent[];

  // Personal User State
  likedVideoIds: string[];
  dislikedVideoIds: string[];
  subscribedChannelIds: string[];
  watchLaterVideoIds: string[];
  watchHistory: HistoryItem[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;

  // Responsive UI States
  sidebarOpen: boolean;
  darkMode: boolean;
  miniPlayer: MiniPlayerState;
  isUploadModalOpen: boolean;
  isVoiceSearchModalOpen: boolean;
  shareModalVideo: Video | null;
  playlistModalVideo: Video | null;
  editingVideo: Video | null;
  downloadModalVideo: Video | null;

  // Real Auth & RBAC Roles
  currentUser: FirebaseUser | null;
  isAuthenticated: boolean;
  emailVerified: boolean;
  authLoading: boolean;
  authError: string | null;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  userProfile: UserProfile;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isCreator: boolean;
  isProUser: boolean;
  isFreeUser: boolean;

  // Navigation & UI Actions
  navigate: (
    mode: ViewMode,
    options?: {
      videoId?: string;
      channelId?: string;
      playlistId?: string;
      searchQuery?: string;
      keepMiniPlayer?: boolean;
    }
  ) => void;
  setActiveCategory: (cat: string) => void;
  setAccessFilter: (filter: AccessFilter) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setAdminActiveTab: (tab: string) => void;

  // Video & Channel Interactions
  toggleLikeVideo: (videoId: string) => void;
  toggleDislikeVideo: (videoId: string) => void;
  toggleSubscribe: (channelId: string) => void;
  toggleWatchLater: (videoId: string) => void;
  addToHistory: (videoId: string, progressPercent?: number, lastPositionSec?: number) => void;
  removeFromHistory: (videoId: string) => void;
  clearHistory: () => void;
  addComment: (videoId: string, text: string) => void;
  likeComment: (videoId: string, commentId: string) => void;
  createPlaylist: (title: string, description: string, isPrivate: boolean, initialVideoId?: string) => string;
  toggleVideoInPlaylist: (playlistId: string, videoId: string) => void;
  removePlaylist: (playlistId: string) => Promise<void>;
  sendVideoReaction: (videoId: string, type: ReactionType, emoji: string, videoTime: number) => Promise<LiveReaction>;
  trackVideoShare: (videoId: string) => void;

  // Community Posts & Creator Applications
  createCommunityPost: (channelId: string, text: string, imageUrl?: string) => Promise<CommunityPost>;
  toggleLikeCommunityPost: (postId: string) => Promise<void>;
  removeCommunityPost: (postId: string) => Promise<void>;
  applyForCreator: (payload: { channelName: string; channelHandle: string; category: string; bio: string }) => Promise<CreatorApplication>;
  reviewCreatorApplication: (app: CreatorApplication, status: 'approved' | 'rejected', notes?: string) => Promise<void>;

  // Categories Governance
  saveCategory: (cat: CategoryItem) => Promise<void>;
  removeCategory: (catId: string) => Promise<void>;

  // Video Publishing & Payment Actions (100 ETB Standard)
  uploadVideo: (videoData: Partial<Video>, transactionId?: string) => Promise<string>;
  removeVideo: (videoId: string) => Promise<void>;
  modifyVideoStatus: (videoId: string, status: Video['status'], visibility: Video['visibility']) => Promise<void>;
  toggleFeatureVideo: (videoId: string, isFeatured: boolean) => Promise<void>;
  initiatePublishingPayment: (
    videoTitle: string,
    provider: 'telebirr' | 'cbe_birr' | 'chapa'
  ) => Promise<PaymentTransaction>;
  verifyPayment: (transactionId: string) => Promise<void>;

  // PRO Video Monetization & Telebirr Watch-to-Unlock
  isPurchased: (videoId: string) => boolean;
  getPendingPurchase: (videoId: string) => VideoPurchase | undefined;
  purchaseVideo: (
    video: Video,
    provider: 'telebirr' | 'cbe_birr' | 'chapa',
    userTxnRef?: string,
    phone?: string
  ) => Promise<VideoPurchase>;
  approvePurchase: (purchaseId: string) => Promise<void>;
  refundPurchase: (purchaseId: string) => Promise<void>;
  setVideoAccessType: (videoId: string, accessType: VideoAccessType, price: number) => Promise<void>;

  // Video Downloads Management
  startDownload: (video: Video, quality: '360p' | '480p' | '720p' | '1080p') => Promise<void>;
  cancelDownload: (id: string) => void;
  removeDownload: (id: string) => void;

  // Shorts & Moderation & Staff Governance
  publishShort: (shortData: Partial<ShortItem>) => Promise<string>;
  removeShort: (shortId: string) => Promise<void>;
  likeShort: (shortId: string) => void;
  modifyCommentStatus: (commentId: string, status: 'active' | 'flagged' | 'removed') => Promise<void>;
  removeComment: (commentId: string) => Promise<void>;
  submitReport: (targetType: ReportItem['targetType'], targetId: string, reason: string, targetTitle?: string) => Promise<string>;
  resolveModerationReport: (reportId: string, status: 'resolved' | 'dismissed') => Promise<void>;
  changeUserRole: (uid: string, role: UserRole) => Promise<void>;
  toggleUserBan: (uid: string, isBanned: boolean) => Promise<void>;
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<void>;
  sendAnnouncement: (title: string, message: string, videoId?: string) => Promise<void>;
  saveChannelProfile: (channel: Partial<Channel> & { id: string }) => Promise<void>;

  // Auth Operations
  signInWithGoogle: (creatorRequest?: { channelName: string; bio: string }) => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (payload: {
    email: string;
    password: string;
    displayName: string;
    requestCreator?: boolean;
    channelName?: string;
    bio?: string;
  }) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  refreshAuthUser: () => Promise<boolean>;
  signOutUser: () => Promise<void>;
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  clearAuthError: () => void;

  // Modals & Toasts
  markNotificationsRead: () => void;
  setMiniPlayerState: (state: Partial<MiniPlayerState>) => void;
  closeMiniPlayer: () => void;
  restoreFromMiniPlayer: () => void;
  setIsUploadModalOpen: (open: boolean) => void;
  setIsVoiceSearchModalOpen: (open: boolean) => void;
  setShareModalVideo: (video: Video | null) => void;
  setPlaylistModalVideo: (video: Video | null) => void;
  setEditingVideo: (video: Video | null) => void;
  setDownloadModalVideo: (video: Video | null) => void;
  toast: ToastNotification | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const routerNavigate = useNavigate();

  const initialRoute = React.useMemo(
    () => mapPathToRouteState(location.pathname, location.search),
    []
  );

  const [viewMode, setViewMode] = useState<ViewMode>(initialRoute.viewMode);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(initialRoute.videoId || null);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(initialRoute.channelId || null);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(initialRoute.playlistId || null);
  const [searchQuery, setSearchQuery] = useState<string>(initialRoute.searchQuery || '');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const [adminActiveTab, setAdminActiveTab] = useState<string>('overview');

  // Synchronize React Router location changes (browser back/forward/direct URL)
  useEffect(() => {
    const mapped = mapPathToRouteState(location.pathname, location.search);
    setViewMode(mapped.viewMode);
    if (mapped.videoId !== undefined) setCurrentVideoId(mapped.videoId);
    if (mapped.channelId !== undefined) setCurrentChannelId(mapped.channelId);
    if (mapped.playlistId !== undefined) setCurrentPlaylistId(mapped.playlistId);
    if (mapped.searchQuery !== undefined) setSearchQuery(mapped.searchQuery);
  }, [location.pathname, location.search]);

  // Bilingual Language Support (Default English, saves in localStorage)
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('svtech_lang') as Language;
      if (saved === 'am' || saved === 'en') return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('svtech_lang', lang);
    }
  };

  const t = getTranslations(language);

  // Real-time collections populated from Firestore
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [shorts, setShorts] = useState<ShortItem[]>(INITIAL_SHORTS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [comments, setComments] = useState<Record<string, Comment[]>>(INITIAL_COMMENTS as Record<string, Comment[]>);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [creatorApplications, setCreatorApplications] = useState<CreatorApplication[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [recentEngagementEvents, setRecentEngagementEvents] = useState<EngagementEvent[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [videoPurchases, setVideoPurchases] = useState<VideoPurchase[]>([]);

  // Authenticated user & RBAC
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    uid: 'guest-uid',
    email: '',
    displayName: 'Guest Viewer',
    photoURL: '',
    role: 'free_user',
    channelId: 'my-channel',
    creatorStatus: 'none'
  });

  // Downloads library (Stored locally)
  const [downloads, setDownloads] = useState<DownloadRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('svtech_downloads');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse downloads storage');
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('svtech_downloads', JSON.stringify(downloads));
    }
  }, [downloads]);

  // User personal states
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>([]);
  const [dislikedVideoIds, setDislikedVideoIds] = useState<string[]>([]);
  const [subscribedChannelIds, setSubscribedChannelIds] = useState<string[]>([
    'blender-foundation',
    'tech-overdrive'
  ]);
  const [watchLaterVideoIds, setWatchLaterVideoIds] = useState<string[]>([]);
  const [watchHistory, setWatchHistory] = useState<HistoryItem[]>([]);

  // Responsive UI States
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('svtech_theme');
      if (saved) return saved === 'dark';
      return true;
    }
    return true;
  });

  const [miniPlayer, setMiniPlayer] = useState<MiniPlayerState>({
    active: false,
    video: null,
    isPlaying: false,
    currentTime: 0
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isVoiceSearchModalOpen, setIsVoiceSearchModalOpen] = useState<boolean>(false);
  const [shareModalVideo, setShareModalVideo] = useState<Video | null>(null);
  const [playlistModalVideo, setPlaylistModalVideo] = useState<Video | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [downloadModalVideo, setDownloadModalVideo] = useState<Video | null>(null);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHistorySyncRef = useRef<Record<string, number>>({});

  const clearToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    const id = Date.now();
    setToast({ id, type, message });
    toastTimerRef.current = setTimeout(() => {
      setToast(current => (current?.id === id ? null : current));
    }, 4000);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('svtech_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('svtech_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    testConnection();
  }, []);

  // Firebase Auth listener + Real-time Firestore user profile & role sync
  useEffect(() => {
    let unsubUserProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (unsubUserProfile) {
        unsubUserProfile();
        unsubUserProfile = null;
      }

      if (user) {
        const isSuperAdminEmail = user.email === 'vipsami612@gmail.com';
        const initialRole: UserRole = isSuperAdminEmail ? 'super_admin' : 'free_user';

        const baseProfile: UserProfile = {
          uid: user.uid,
          email: user.email || 'user@svtechmedia.com',
          displayName: user.displayName || user.email?.split('@')[0] || 'SVTech Member',
          photoURL: user.photoURL || '',
          role: initialRole,
          emailVerified: user.emailVerified,
          creatorStatus: isSuperAdminEmail ? 'approved' : 'none',
          channelId: `ch_${user.uid.slice(0, 10)}`
        };

        setUserProfile(baseProfile);

        let syncedOnce = false;
        unsubUserProfile = subscribeToUserProfile(user.uid, fsProfile => {
          if (fsProfile) {
            setUserProfile({
              ...fsProfile,
              emailVerified: user.emailVerified,
              role: isSuperAdminEmail ? 'super_admin' : (fsProfile.role || 'free_user')
            });
          } else if (!syncedOnce) {
            syncedOnce = true;
            createOrSyncUserProfile(baseProfile);
          }
        });
      } else {
        setUserProfile({
          uid: 'guest-uid',
          email: '',
          displayName: 'Guest Viewer',
          photoURL: '',
          role: 'free_user',
          channelId: 'my-channel',
          creatorStatus: 'none'
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUserProfile) unsubUserProfile();
    };
  }, []);

  // Public real-time Firestore subscriptions
  useEffect(() => {
    const unsubVideos = subscribeToVideos(firestoreVideos => {
      if (firestoreVideos && firestoreVideos.length > 0) {
        setVideos(firestoreVideos);
      }
    });

    const unsubChannels = subscribeToChannels(firestoreChannels => {
      if (firestoreChannels && firestoreChannels.length > 0) {
        setChannels(firestoreChannels);
      }
    });

    const unsubShorts = subscribeToShorts(firestoreShorts => {
      if (firestoreShorts && firestoreShorts.length > 0) {
        setShorts(firestoreShorts);
      }
    });

    const unsubPlaylists = subscribeToPlaylists(firestorePlaylists => {
      if (firestorePlaylists && firestorePlaylists.length > 0) {
        setPlaylists(firestorePlaylists);
      }
    });

    const unsubPosts = subscribeToCommunityPosts(firestorePosts => {
      setPosts(firestorePosts);
    });

    const unsubCategories = subscribeToCategories(firestoreCats => {
      if (firestoreCats && firestoreCats.length > 0) {
        setCategories(firestoreCats);
      }
    });

    const unsubNotifications = subscribeToNotifications(firestoreNotifs => {
      if (firestoreNotifs && firestoreNotifs.length > 0) {
        setNotifications(firestoreNotifs);
      }
    });

    const unsubAllComments = subscribeToAllComments(firestoreComments => {
      if (firestoreComments && firestoreComments.length > 0) {
        const grouped: Record<string, Comment[]> = {};
        for (const c of firestoreComments) {
          const vId = c.videoId || 'general';
          if (!grouped[vId]) grouped[vId] = [];
          grouped[vId].push(c);
        }
        setComments(grouped);
      }
    });

    const unsubSettings = subscribeToPlatformSettings(firestoreSettings => {
      setPlatformSettings(firestoreSettings);
    });

    const unsubEngagement24h = subscribeToEngagementEvents24h(events => {
      setRecentEngagementEvents(events);
    });

    return () => {
      unsubVideos();
      unsubChannels();
      unsubShorts();
      unsubPlaylists();
      unsubPosts();
      unsubCategories();
      unsubNotifications();
      unsubAllComments();
      unsubSettings();
      unsubEngagement24h();
    };
  }, []);

  // Auth- & Role-gated Firestore listeners
  useEffect(() => {
    if (authLoading || !currentUser) {
      setReports([]);
      setActivityLogs([]);
      setAllUsers([]);
      setTransactions([]);
      setVideoPurchases([]);
      setCreatorApplications([]);
      setWatchHistory([]);
      return;
    }

    const uid = currentUser.uid;
    const roleIsAdmin =
      userProfile.role === 'super_admin' ||
      userProfile.role === 'admin' ||
      currentUser.email === 'vipsami612@gmail.com';
    const roleIsModerator = roleIsAdmin || userProfile.role === 'moderator';

    const unsubs: (() => void)[] = [];

    if (roleIsAdmin) {
      initializeFirestoreDatabase(currentUser.email || 'vipsami612@gmail.com');
    }

    unsubs.push(
      subscribeToUsers(firestoreUsers => {
        setAllUsers(firestoreUsers);
      })
    );

    unsubs.push(
      subscribeToUserWatchHistory(uid, items => {
        setWatchHistory(items);
      })
    );

    unsubs.push(
      subscribeToCreatorApplications(
        apps => setCreatorApplications(apps),
        roleIsAdmin ? undefined : uid
      )
    );

    if (roleIsModerator) {
      unsubs.push(
        subscribeToReports(firestoreReports => {
          setReports(firestoreReports);
        })
      );
    } else {
      setReports([]);
    }

    if (roleIsAdmin) {
      unsubs.push(
        subscribeToActivityLogs(firestoreLogs => {
          setActivityLogs(firestoreLogs);
        })
      );
      unsubs.push(
        subscribeToTransactions(txs => {
          setTransactions(txs);
        })
      );
      unsubs.push(
        subscribeToVideoPurchases(firestorePurchases => {
          setVideoPurchases(firestorePurchases);
        })
      );
    } else {
      setActivityLogs([]);
      unsubs.push(
        subscribeToUserTransactions(uid, txs => {
          setTransactions(txs);
        })
      );
      unsubs.push(
        subscribeToUserVideoPurchases(uid, firestorePurchases => {
          setVideoPurchases(firestorePurchases);
        })
      );
    }

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [authLoading, currentUser?.uid, currentUser?.email, userProfile.role]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // RBAC Permission checks
  const isSuperAdmin = userProfile.role === 'super_admin';
  const isAdmin = isSuperAdmin || userProfile.role === 'admin';
  const isModerator = isAdmin || userProfile.role === 'moderator';
  const isCreator = isAdmin || isModerator || userProfile.role === 'creator';
  const isProUser = userProfile.role === 'pro_user';
  const isFreeUser = userProfile.role === 'free_user';
  const emailVerified = Boolean(currentUser?.emailVerified || currentUser?.providerData?.some(p => p.providerId === 'google.com'));

  const navigate = (
    mode: ViewMode,
    options?: {
      videoId?: string;
      channelId?: string;
      playlistId?: string;
      searchQuery?: string;
      keepMiniPlayer?: boolean;
    }
  ) => {
    if (viewMode === 'watch' && mode !== 'watch' && currentVideoId && !options?.keepMiniPlayer) {
      const activeVid = videos.find(v => v.id === currentVideoId);
      if (activeVid) {
        setMiniPlayer(prev => ({
          active: true,
          video: activeVid,
          isPlaying: true,
          currentTime: prev.currentTime || 0
        }));
      }
    }

    if (mode === 'watch' && options?.videoId) {
      const targetId = options.videoId;
      setMiniPlayer(prev => ({ ...prev, active: false }));
      setCurrentVideoId(targetId);
      addToHistory(targetId, 5, 0);
      setVideos(prev =>
        prev.map(v =>
          v.id === targetId
            ? {
                ...v,
                views: (v.views || 0) + 1,
                views24h: (v.views24h ?? Math.round((v.views || 0) * 0.12)) + 1,
                lastEngagedAt: new Date().toISOString()
              }
            : v
        )
      );
      incrementVideoViews(targetId);
    }

    if (options?.channelId) {
      setCurrentChannelId(options.channelId);
    }

    if (options?.playlistId) {
      setCurrentPlaylistId(options.playlistId);
    }

    if (options?.searchQuery !== undefined) {
      setSearchQuery(options.searchQuery);
    }

    setViewMode(mode);

    const targetPath = mapViewModeToPath(mode, {
      videoId: options?.videoId || currentVideoId,
      channelId: options?.channelId || currentChannelId,
      playlistId: options?.playlistId || currentPlaylistId,
      searchQuery: options?.searchQuery !== undefined ? options.searchQuery : searchQuery
    });
    if (`${location.pathname}${location.search}` !== targetPath) {
      routerNavigate(targetPath);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setMiniPlayerState = (state: Partial<MiniPlayerState>) => {
    setMiniPlayer(prev => ({ ...prev, ...state }));
  };

  const closeMiniPlayer = () => {
    setMiniPlayer({ active: false, video: null, isPlaying: false, currentTime: 0 });
  };

  const restoreFromMiniPlayer = () => {
    if (miniPlayer.video) {
      const vidId = miniPlayer.video.id;
      setMiniPlayer({ active: false, video: null, isPlaying: false, currentTime: 0 });
      navigate('watch', { videoId: vidId });
    }
  };

  const toggleLikeVideo = (videoId: string) => {
    const isLiked = likedVideoIds.includes(videoId);
    const delta = isLiked ? -1 : 1;

    setVideos(prev =>
      prev.map(v =>
        v.id === videoId
          ? {
              ...v,
              likes: Math.max(0, v.likes + delta),
              likes24h: Math.max(0, (v.likes24h ?? Math.round((v.likes || 0) * 0.14)) + (delta > 0 ? 1 : 0)),
              lastEngagedAt: delta > 0 ? new Date().toISOString() : v.lastEngagedAt
            }
          : v
      )
    );

    if (isLiked) {
      setLikedVideoIds(prev => prev.filter(id => id !== videoId));
    } else {
      setLikedVideoIds(prev => [...prev, videoId]);
      setDislikedVideoIds(prev => prev.filter(id => id !== videoId));
    }

    updateVideoLikes(videoId, delta);
  };

  const toggleDislikeVideo = (videoId: string) => {
    const isDisliked = dislikedVideoIds.includes(videoId);
    if (isDisliked) {
      setDislikedVideoIds(prev => prev.filter(id => id !== videoId));
    } else {
      setDislikedVideoIds(prev => [...prev, videoId]);
      setLikedVideoIds(prev => prev.filter(id => id !== videoId));
    }
  };

  const toggleSubscribe = (channelId: string) => {
    const isSubscribed = subscribedChannelIds.includes(channelId);
    const delta = isSubscribed ? -1 : 1;

    setSubscribedChannelIds(prev =>
      isSubscribed ? prev.filter(id => id !== channelId) : [...prev, channelId]
    );

    setChannels(prev =>
      prev.map(c => {
        if (c.id === channelId) {
          const newCount = Math.max(0, c.subscriberCountNumber + delta);
          const formatted =
            newCount >= 1000000
              ? `${(newCount / 1000000).toFixed(2)}M`
              : newCount >= 1000
              ? `${(newCount / 1000).toFixed(0)}K`
              : `${newCount}`;
          return {
            ...c,
            subscriberCountNumber: newCount,
            subscribers: formatted
          };
        }
        return c;
      })
    );

    toggleChannelSubscription(channelId, delta);
  };

  const toggleWatchLater = (videoId: string) => {
    setWatchLaterVideoIds(prev =>
      prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
    );
  };

  const addToHistory = (videoId: string, progressPercent = 0, lastPositionSec?: number) => {
    const nowIso = new Date().toISOString();
    const item: HistoryItem = {
      videoId,
      watchedAt: 'Just now',
      progressPercent: Math.max(0, Math.min(100, Math.round(progressPercent))),
      lastPositionSec: lastPositionSec !== undefined ? Math.max(0, Math.round(lastPositionSec)) : undefined,
      updatedAt: nowIso
    };

    setWatchHistory(prev => {
      const existing = prev.find(h => h.videoId === videoId);
      const merged: HistoryItem = {
        ...existing,
        ...item,
        lastPositionSec: item.lastPositionSec ?? existing?.lastPositionSec ?? 0
      };
      const filtered = prev.filter(h => h.videoId !== videoId);
      return [merged, ...filtered];
    });

    if (currentUser?.uid) {
      const lastSync = lastHistorySyncRef.current[videoId] || 0;
      const nowMs = Date.now();
      if (nowMs - lastSync >= 4000 || progressPercent >= 95) {
        lastHistorySyncRef.current[videoId] = nowMs;
        upsertUserWatchHistory(currentUser.uid, {
          ...item,
          lastPositionSec: item.lastPositionSec ?? 0
        });
      }
    }
  };

  const removeFromHistory = (videoId: string) => {
    setWatchHistory(prev => prev.filter(h => h.videoId !== videoId));
    if (currentUser?.uid) {
      removeUserWatchHistoryItem(currentUser.uid, videoId);
    }
  };

  const clearHistory = () => {
    const existingIds = watchHistory.map(h => h.videoId);
    setWatchHistory([]);
    if (currentUser?.uid) {
      existingIds.forEach(vidId => removeUserWatchHistoryItem(currentUser.uid, vidId));
    }
  };

  const addComment = async (videoId: string, text: string) => {
    if (!text.trim()) return;
    if (!currentUser) {
      showToast('Please sign in to post a comment.', 'info');
      openAuthModal('signin');
      return;
    }
    const authorName = userProfile.displayName || 'Viewer';
    const authorAvatar = userProfile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      videoId,
      author: {
        name: authorName,
        avatarUrl: authorAvatar,
        isOwner: false,
        userId: userProfile.uid
      },
      text: text.trim(),
      timestamp: 'Just now',
      likes: 0,
      status: 'active'
    };

    setComments(prev => ({
      ...prev,
      [videoId]: [newComment, ...(prev[videoId] || [])]
    }));

    setVideos(prev =>
      prev.map(v =>
        v.id === videoId
          ? {
              ...v,
              commentsCount: (v.commentsCount || 0) + 1,
              comments24h: (v.comments24h ?? Math.round((v.commentsCount || 0) * 0.18)) + 1,
              lastEngagedAt: new Date().toISOString()
            }
          : v
      )
    );

    await postComment(videoId, {
      text: text.trim(),
      userName: authorName,
      userAvatar: authorAvatar,
      userId: userProfile.uid,
      isOwner: false
    });
  };

  const likeComment = (videoId: string, commentId: string) => {
    setComments(prev => {
      const videoComments = prev[videoId] || [];
      return {
        ...prev,
        [videoId]: videoComments.map(c => {
          if (c.id === commentId) {
            const liked = !c.isLiked;
            return {
              ...c,
              isLiked: liked,
              likes: liked ? c.likes + 1 : c.likes - 1
            };
          }
          return c;
        })
      };
    });
  };

  const createPlaylist = (
    title: string,
    description: string,
    isPrivate: boolean,
    initialVideoId?: string
  ): string => {
    const id = `pl_${Date.now()}`;
    const newPl: Playlist = {
      id,
      title,
      description,
      videoIds: initialVideoId ? [initialVideoId] : [],
      updatedAt: new Date().toISOString(),
      isPrivate,
      ownerUid: userProfile.uid
    };
    setPlaylists(prev => [newPl, ...prev]);
    if (currentUser) {
      savePlaylistToFirestore(newPl);
    }
    return id;
  };

  const toggleVideoInPlaylist = (playlistId: string, videoId: string) => {
    let updatedTarget: Playlist | null = null;
    setPlaylists(prev =>
      prev.map(pl => {
        if (pl.id === playlistId) {
          const exists = pl.videoIds.includes(videoId);
          updatedTarget = {
            ...pl,
            videoIds: exists ? pl.videoIds.filter(id => id !== videoId) : [...pl.videoIds, videoId],
            updatedAt: new Date().toISOString()
          };
          return updatedTarget;
        }
        return pl;
      })
    );
    if (updatedTarget && currentUser) {
      savePlaylistToFirestore(updatedTarget);
    }
  };

  const removePlaylist = async (playlistId: string) => {
    setPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
    if (currentUser) {
      await deletePlaylistFromFirestore(playlistId);
    }
    showToast('Playlist deleted', 'info');
  };

  const sendVideoReaction = async (
    videoId: string,
    type: ReactionType,
    emoji: string,
    videoTime: number
  ): Promise<LiveReaction> => {
    const nowIso = new Date().toISOString();
    const optimisticReaction: LiveReaction = {
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      videoId,
      emoji,
      type,
      userId: userProfile.uid || 'guest',
      userName: userProfile.displayName || 'Viewer',
      videoTime: Math.max(0, Math.round(videoTime)),
      createdAt: nowIso
    };

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('svtech:live-reaction', { detail: optimisticReaction })
      );
      if ('BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('svtech_live_reactions');
          bc.postMessage(optimisticReaction);
          bc.close();
        } catch {
          // Ignore
        }
      }
    }

    setVideos(prev =>
      prev.map(v =>
        v.id === videoId
          ? {
              ...v,
              reactionsCount: (v.reactionsCount || 0) + 1,
              reactions24h: (v.reactions24h || 0) + 1,
              lastEngagedAt: nowIso
            }
          : v
      )
    );

    try {
      return await sendLiveReaction({
        videoId,
        emoji,
        type,
        userId: userProfile.uid || 'guest',
        userName: userProfile.displayName || 'Viewer',
        videoTime
      });
    } catch {
      return optimisticReaction;
    }
  };

  const trackVideoShare = (videoId: string) => {
    setVideos(prev =>
      prev.map(v =>
        v.id === videoId
          ? {
              ...v,
              shares24h: (v.shares24h || 0) + 1,
              lastEngagedAt: new Date().toISOString()
            }
          : v
      )
    );
    incrementVideoShares(videoId);
  };

  // Community Posts
  const createCommunityPost = async (channelId: string, text: string, imageUrl?: string) => {
    if (!currentUser) {
      throw new Error('Sign in required to publish a community post.');
    }
    const post = await createCommunityPostInFirestore({
      channelId,
      authorUid: currentUser.uid,
      authorName: userProfile.displayName,
      authorAvatarUrl:
        userProfile.photoURL ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      text: text.trim(),
      ...(imageUrl ? { imageUrl } : {})
    });
    setPosts(prev => [post, ...prev.filter(p => p.id !== post.id)]);
    showToast('Community post published!', 'success');
    return post;
  };

  const toggleLikeCommunityPost = async (postId: string) => {
    if (!currentUser) {
      showToast('Sign in to like community posts.', 'info');
      return;
    }
    const target = posts.find(p => p.id === postId);
    const alreadyLiked = Boolean(target?.likedBy?.includes(currentUser.uid));
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const likedBy = p.likedBy || [];
        return {
          ...p,
          likes: Math.max(0, p.likes + (alreadyLiked ? -1 : 1)),
          likedBy: alreadyLiked
            ? likedBy.filter(u => u !== currentUser.uid)
            : [...likedBy, currentUser.uid]
        };
      })
    );
    await toggleCommunityPostLikeInFirestore(postId, currentUser.uid, alreadyLiked);
  };

  const removeCommunityPost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    await deleteCommunityPostInFirestore(postId);
    showToast('Community post deleted.', 'info');
  };

  // Creator Applications
  const applyForCreator = async (payload: {
    channelName: string;
    channelHandle: string;
    category: string;
    bio: string;
  }) => {
    if (!currentUser) {
      throw new Error('Please sign in first to apply as a creator.');
    }
    const appDoc = await submitCreatorApplicationInFirestore({
      uid: currentUser.uid,
      email: userProfile.email,
      displayName: userProfile.displayName,
      ...payload
    });
    setCreatorApplications(prev => [appDoc, ...prev]);
    setUserProfile(prev => ({ ...prev, creatorStatus: 'pending' }));
    showToast('Creator application submitted for Admin review!', 'success');
    return appDoc;
  };

  const reviewCreatorApplication = async (
    app: CreatorApplication,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    await reviewCreatorApplicationInFirestore({
      appId: app.id,
      targetUid: app.uid,
      status,
      reviewerEmail: userProfile.email,
      notes,
      channelName: app.channelName,
      channelHandle: app.channelHandle,
      bio: app.bio
    });
    setCreatorApplications(prev =>
      prev.map(a => (a.id === app.id ? { ...a, status, reviewedBy: userProfile.email } : a))
    );
    if (status === 'approved') {
      setAllUsers(prev =>
        prev.map(u => (u.uid === app.uid ? { ...u, role: 'creator', creatorStatus: 'approved' } : u))
      );
    }
    await logPlatformActivity(
      userProfile.email,
      status === 'approved' ? 'CREATOR_APPROVED' : 'CREATOR_REJECTED',
      `${status.toUpperCase()} creator application for ${app.email} (${app.channelName})`
    );
    showToast(`Creator application ${status}!`, status === 'approved' ? 'success' : 'info');
  };

  // Categories
  const saveCategory = async (cat: CategoryItem) => {
    setCategories(prev => {
      const exists = prev.some(c => c.id === cat.id);
      return exists ? prev.map(c => (c.id === cat.id ? cat : c)) : [...prev, cat];
    });
    await saveCategoryInFirestore(cat);
    showToast(`Category "${cat.name}" saved.`, 'success');
  };

  const removeCategory = async (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
    await deleteCategoryInFirestore(catId);
    showToast('Category removed.', 'info');
  };

  // Video publishing with Ethiopian Birr rule enforcement
  const uploadVideo = async (videoData: Partial<Video>, transactionId?: string): Promise<string> => {
    const id = videoData.id || `video_${Date.now()}`;
    const existingVideo = videos.find(v => v.id === id);
    const myChannel = existingVideo?.channel || channels.find(c => c.id === userProfile.channelId) || {
      id: userProfile.channelId || 'my-channel',
      name: userProfile.displayName || 'SVTech Creator Studio',
      handle: `@${(userProfile.displayName || 'creator').replace(/\s+/g, '').toLowerCase()}`,
      avatarUrl:
        userProfile.photoURL ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '1'
    };

    const isExempt = isAdmin || isModerator;
    const isPaid = existingVideo?.publishingFeePaid || isExempt || Boolean(transactionId);

    const resolvedThumbUrl =
      videoData.thumbnailUrl !== undefined
        ? videoData.thumbnailUrl
        : existingVideo?.thumbnailUrl || '';

    const resolvedThumbStoragePath =
      videoData.thumbnailStoragePath !== undefined
        ? videoData.thumbnailStoragePath
        : existingVideo?.thumbnailStoragePath;

    const resolvedVideoStoragePath =
      videoData.videoStoragePath !== undefined
        ? videoData.videoStoragePath
        : existingVideo?.videoStoragePath;

    const newVideo: Video = {
      ...(existingVideo || {}),
      id,
      title: videoData.title || existingVideo?.title || 'Untitled Stream',
      description: videoData.description || existingVideo?.description || 'Published on SVTech Media.',
      videoUrl:
        videoData.videoUrl ||
        existingVideo?.videoUrl ||
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      ...(resolvedVideoStoragePath ? { videoStoragePath: resolvedVideoStoragePath } : {}),
      thumbnailUrl: resolvedThumbUrl,
      ...(resolvedThumbStoragePath ? { thumbnailStoragePath: resolvedThumbStoragePath } : {}),
      duration: videoData.duration ?? existingVideo?.duration ?? 60,
      durationFormatted: videoData.durationFormatted || existingVideo?.durationFormatted || '1:00',
      views: videoData.views ?? existingVideo?.views ?? 1,
      uploadDate: existingVideo?.uploadDate || 'Just now',
      category: videoData.category || existingVideo?.category || 'Tech',
      channel: myChannel,
      likes: videoData.likes ?? existingVideo?.likes ?? 1,
      dislikes: existingVideo?.dislikes ?? 0,
      tags: videoData.tags || existingVideo?.tags || ['SVTech', 'Media', 'Stream'],
      chapters: videoData.chapters || existingVideo?.chapters || [{ title: 'Overview', time: 0 }],
      commentsCount: existingVideo?.commentsCount ?? 0,
      status: isPaid ? (videoData.status || existingVideo?.status || 'published') : 'draft',
      visibility: videoData.visibility || existingVideo?.visibility || 'public',
      accessType: videoData.accessType || existingVideo?.accessType || 'free',
      price: (videoData.accessType || existingVideo?.accessType) === 'pro' ? Number(videoData.price ?? existingVideo?.price) || 100 : 0,
      currency: 'ETB',
      isPremium: (videoData.accessType || existingVideo?.accessType) === 'pro',
      isFeatured: videoData.isFeatured ?? existingVideo?.isFeatured ?? false,
      scheduledAt: videoData.scheduledAt ?? existingVideo?.scheduledAt ?? '',
      ownerUid: existingVideo?.ownerUid || currentUser?.uid || userProfile.uid,
      allowDownloads: videoData.allowDownloads ?? existingVideo?.allowDownloads ?? true,
      publishingFeePaid: isPaid,
      publishingFeeETB: existingVideo?.publishingFeeETB ?? (isExempt ? 0 : platformSettings.publishingFeeETB || 100),
      ...(transactionId || existingVideo?.transactionId || isExempt
        ? { transactionId: transactionId || existingVideo?.transactionId || 'STAFF_WAIVER' }
        : {}),
      createdAt: existingVideo?.createdAt || new Date().toISOString()
    };

    if (videoData.thumbnailStoragePath === '') {
      delete newVideo.thumbnailStoragePath;
    }

    setVideos(prev => [newVideo, ...prev.filter(v => v.id !== id)]);
    await createOrUpdateVideo(newVideo);
    await logPlatformActivity(
      userProfile.email,
      existingVideo ? 'VIDEO_UPDATED' : 'VIDEO_PUBLISHED',
      `${existingVideo ? 'Updated' : 'Published'} "${newVideo.title}" (Fee: ${newVideo.publishingFeeETB} ETB)`
    );

    return id;
  };

  const initiatePublishingPayment = async (
    videoTitle: string,
    provider: 'telebirr' | 'cbe_birr' | 'chapa'
  ): Promise<PaymentTransaction> => {
    const tx = await createPaymentTransaction({
      userId: currentUser?.uid || userProfile.uid,
      userEmail: userProfile.email,
      videoTitle,
      amount: platformSettings.publishingFeeETB || 100,
      currency: 'ETB',
      provider,
      paymentType: 'video_publishing_fee',
      referenceNumber: `ETB-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: `Standard 100 ETB Video Publishing Fee via ${provider.toUpperCase()}`
    });
    setTransactions(prev => [tx, ...prev]);
    return tx;
  };

  const verifyPayment = async (transactionId: string) => {
    await verifyAndCompletePayment(transactionId, `AUTH_${Date.now()}`);
    setTransactions(prev =>
      prev.map(t =>
        t.id === transactionId
          ? { ...t, status: 'successful', verifiedAt: new Date().toISOString() }
          : t
      )
    );
    await logPlatformActivity(
      userProfile.email,
      'PAYMENT_VERIFIED',
      `Verified 100 ETB publishing fee for transaction ${transactionId}`
    );
  };

  // PRO Video Monetization & Telebirr Watch-to-Unlock
  const isPurchased = (videoId: string): boolean => {
    const vid = videos.find(v => v.id === videoId);
    return isVideoPurchased({
      video: vid,
      userId: currentUser?.uid || userProfile.uid,
      userChannelId: userProfile.channelId,
      isAdmin,
      purchases: videoPurchases
    });
  };

  const getPendingPurchase = (videoId: string): VideoPurchase | undefined => {
    return hasPendingVideoPurchase({
      videoId,
      userId: currentUser?.uid || userProfile.uid,
      purchases: videoPurchases
    });
  };

  const purchaseVideo = async (
    video: Video,
    provider: 'telebirr' | 'cbe_birr' | 'chapa',
    userTxnRef?: string,
    phone?: string
  ): Promise<VideoPurchase> => {
    if (!currentUser) {
      openAuthModal('signin');
      throw new Error('Please sign in first to submit a Telebirr payment.');
    }
    const newPurchase = await recordVideoPurchase({
      userId: currentUser.uid,
      userEmail: userProfile.email,
      videoId: video.id,
      videoTitle: video.title,
      videoThumbnail: video.thumbnailUrl,
      amount: video.price || 100,
      currency: 'ETB',
      provider,
      transactionReference: userTxnRef || `TB-${Math.floor(10000000 + Math.random() * 90000000)}`,
      telebirrMerchantNumber: '0913767842',
      userContactPhone: phone || userProfile.phoneNumber || '0913767842',
      notes: `Submitted via ${provider.toUpperCase()} — awaiting Admin verification`
    });

    setVideoPurchases(prev => [newPurchase, ...prev.filter(p => p.purchaseId !== newPurchase.purchaseId)]);
    await logPlatformActivity(
      userProfile.email,
      'PRO_PURCHASE_PENDING',
      `Submitted ${video.price || 100} ETB Ref ${newPurchase.transactionReference} for "${video.title}"`
    );
    return newPurchase;
  };

  const approvePurchase = async (purchaseId: string) => {
    await verifyVideoPurchase(purchaseId, userProfile.email);
    setVideoPurchases(prev =>
      prev.map(p =>
        p.purchaseId === purchaseId || p.id === purchaseId
          ? { ...p, status: 'verified', paymentStatus: 'successful', verifiedAt: new Date().toISOString() }
          : p
      )
    );
    showToast('Purchase verified! Video unlocked for user.', 'success');
  };

  const refundPurchase = async (purchaseId: string) => {
    await refundVideoPurchase(purchaseId, userProfile.email);
    setVideoPurchases(prev =>
      prev.map(p =>
        p.purchaseId === purchaseId || p.id === purchaseId
          ? { ...p, status: 'refunded', paymentStatus: 'refunded' }
          : p
      )
    );
    showToast('Purchase marked as refunded.', 'info');
  };

  const setVideoAccessType = async (videoId: string, accessType: VideoAccessType, price: number) => {
    setVideos(prev =>
      prev.map(v => (v.id === videoId ? { ...v, accessType, price, isPremium: accessType === 'pro' } : v))
    );
    await updateVideoAccessType(videoId, accessType, price);
    await logPlatformActivity(
      userProfile.email,
      'VIDEO_ACCESS_MODIFIED',
      `Set video ${videoId} access to ${accessType.toUpperCase()} (${price} ETB)`
    );
  };

  const startDownload = async (
    video: Video,
    quality: '360p' | '480p' | '720p' | '1080p'
  ) => {
    if (!platformSettings.allowPublicDownloads && !isAdmin) {
      showToast('Downloads are currently disabled by platform administrators.', 'error');
      return;
    }
    if (video.allowDownloads === false && !isAdmin) {
      showToast(t.watch.downloadNotAllowed, 'error');
      return;
    }

    const sizes: Record<string, string> = {
      '360p': '24 MB',
      '480p': '52 MB',
      '720p': '89 MB',
      '1080p': '145 MB'
    };

    const dlId = `dl_${Date.now()}`;
    const newDownload: DownloadRecord = {
      id: dlId,
      videoId: video.id,
      videoTitle: video.title,
      thumbnailUrl: video.thumbnailUrl,
      quality,
      fileSizeFormatted: sizes[quality] || '75 MB',
      downloadUrl: video.videoUrl,
      downloadedAt: 'Just now',
      status: 'in_progress',
      progress: 20
    };

    setDownloads(prev => [newDownload, ...prev.filter(d => d.videoId !== video.id)]);

    setTimeout(() => {
      setDownloads(prev =>
        prev.map(d => (d.id === dlId ? { ...d, progress: 65 } : d))
      );
    }, 350);

    setTimeout(() => {
      setDownloads(prev =>
        prev.map(d => (d.id === dlId ? { ...d, progress: 100, status: 'completed' } : d))
      );

      const a = document.createElement('a');
      a.href = video.videoUrl;
      a.download = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}_${quality}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(t.watch.downloadComplete, 'success');
    }, 850);
  };

  const cancelDownload = (id: string) => {
    setDownloads(prev =>
      prev.map(d => (d.id === id ? { ...d, status: 'cancelled' } : d))
    );
  };

  const removeDownload = (id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
  };

  const removeVideo = async (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    await deleteVideo(videoId);
    await logPlatformActivity(userProfile.email, 'VIDEO_DELETED', `Deleted video ID: ${videoId}`);
  };

  const modifyVideoStatus = async (
    videoId: string,
    status: Video['status'],
    visibility: Video['visibility']
  ) => {
    setVideos(prev =>
      prev.map(v => (v.id === videoId ? { ...v, status, visibility } : v))
    );
    await updateVideoStatus(videoId, status, visibility);
    await logPlatformActivity(
      userProfile.email,
      'VIDEO_STATUS_UPDATED',
      `Set status ${status}/${visibility} for ${videoId}`
    );
  };

  const toggleFeatureVideo = async (videoId: string, isFeatured: boolean) => {
    setVideos(prev =>
      prev.map(v => (v.id === videoId ? { ...v, isFeatured } : v))
    );
    await toggleVideoFeatured(videoId, isFeatured);
  };

  const publishShort = async (shortData: Partial<ShortItem>): Promise<string> => {
    const id = shortData.id || `short_${Date.now()}`;
    const myChannel = channels.find(c => c.id === userProfile.channelId) || channels[0] || {
      id: 'svtech-studio',
      name: 'SVTech Media Studio',
      handle: '@SVTechMedia',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true
    };

    const newShort: ShortItem = {
      id,
      title: shortData.title || 'SVTech Short Reel',
      videoUrl:
        shortData.videoUrl ||
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      ...(shortData.videoStoragePath ? { videoStoragePath: shortData.videoStoragePath } : {}),
      thumbnailUrl: shortData.thumbnailUrl || '',
      ...(shortData.thumbnailStoragePath ? { thumbnailStoragePath: shortData.thumbnailStoragePath } : {}),
      channel: myChannel,
      likes: 1,
      commentsCount: 0,
      soundTitle: shortData.soundTitle || 'SVTech Original Sound HD',
      tags: shortData.tags || ['svtech', 'shorts'],
      isFeatured: true,
      ownerUid: currentUser?.uid || userProfile.uid,
      createdAt: new Date().toISOString()
    };

    setShorts(prev => [newShort, ...prev]);
    await createShort(newShort);
    await logPlatformActivity(userProfile.email, 'SHORT_PUBLISHED', `Published short "${newShort.title}"`);
    return id;
  };

  const removeShort = async (shortId: string) => {
    setShorts(prev => prev.filter(s => s.id !== shortId));
    await deleteShort(shortId);
    await logPlatformActivity(userProfile.email, 'SHORT_DELETED', `Deleted short ${shortId}`);
  };

  const likeShort = (shortId: string) => {
    setShorts(prev =>
      prev.map(s => (s.id === shortId ? { ...s, likes: s.likes + 1 } : s))
    );
    updateShortLikes(shortId, 1);
  };

  const modifyCommentStatus = async (commentId: string, status: 'active' | 'flagged' | 'removed') => {
    setComments(prev => {
      const updated: Record<string, Comment[]> = {};
      for (const [k, list] of Object.entries(prev)) {
        updated[k] = list.map(c => (c.id === commentId ? { ...c, status } : c));
      }
      return updated;
    });
    await updateCommentStatus(commentId, status);
  };

  const removeComment = async (commentId: string) => {
    setComments(prev => {
      const updated: Record<string, Comment[]> = {};
      for (const [k, list] of Object.entries(prev)) {
        updated[k] = list.filter(c => c.id !== commentId);
      }
      return updated;
    });
    await deleteComment(commentId);
  };

  const submitReport = async (
    targetType: ReportItem['targetType'],
    targetId: string,
    reason: string,
    targetTitle?: string
  ) => {
    if (!currentUser) {
      openAuthModal('signin');
      throw new Error('Sign in required to submit a report.');
    }
    const reportId = await fileReport({
      targetType,
      targetId,
      targetTitle: targetTitle || '',
      reason,
      reporterEmail: userProfile.email
    });
    showToast(t.watch.reportSubmitted, 'success');
    return reportId;
  };

  const resolveModerationReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status } : r))
    );
    await resolveReport(reportId, status);
    await logPlatformActivity(userProfile.email, 'REPORT_MODERATION', `Marked report ${reportId} as ${status}`);
  };

  const changeUserRole = async (uid: string, role: UserRole) => {
    setAllUsers(prev =>
      prev.map(u => (u.uid === uid ? { ...u, role } : u))
    );
    await updateUserRole(uid, role);
    await logPlatformActivity(userProfile.email, 'ROLE_UPDATED', `Assigned ${role} to ${uid}`);
    showToast(`Updated user role to ${role}`, 'success');
  };

  const toggleUserBan = async (uid: string, isBanned: boolean) => {
    setAllUsers(prev =>
      prev.map(u => (u.uid === uid ? { ...u, isBanned } : u))
    );
    await updateUserBanStatus(uid, isBanned);
    await logPlatformActivity(
      userProfile.email,
      isBanned ? 'USER_BANNED' : 'USER_UNBANNED',
      `${isBanned ? 'Suspended' : 'Restored'} user ${uid}`
    );
    showToast(isBanned ? 'User account suspended.' : 'User account restored.', 'info');
  };

  const updateSettings = async (newSettings: Partial<PlatformSettings>) => {
    const updated = { ...platformSettings, ...newSettings };
    setPlatformSettings(updated);
    await savePlatformSettings(updated);
    await logPlatformActivity(userProfile.email, 'SETTINGS_UPDATED', 'Updated platform configuration');
    showToast('Platform settings saved!', 'success');
  };

  const sendAnnouncement = async (title: string, message: string, videoId?: string) => {
    await sendBroadcastNotification(title, message, videoId);
    await logPlatformActivity(userProfile.email, 'BROADCAST_SENT', `Broadcast: "${title}"`);
  };

  const saveChannelProfile = async (channel: Partial<Channel> & { id: string }) => {
    setChannels(prev => {
      const exists = prev.some(c => c.id === channel.id);
      return exists
        ? prev.map(c => (c.id === channel.id ? { ...c, ...channel } : c))
        : [{
            name: channel.name || 'Creator Channel',
            handle: channel.handle || '@creator',
            avatarUrl: channel.avatarUrl || '',
            bannerUrl: channel.bannerUrl || '',
            subscribers: '1',
            subscriberCountNumber: 1,
            description: channel.description || '',
            joinedDate: new Date().toLocaleDateString(),
            totalViews: '0',
            videosCount: 0,
            ownerUid: currentUser?.uid,
            ...channel
          } as Channel, ...prev];
    });
    await createOrUpdateChannel({ ...channel, ownerUid: currentUser?.uid });
    showToast('Channel profile saved!', 'success');
  };

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/operation-not-allowed') {
      return 'Email/Password sign-in is not enabled in Firebase Console. Please enable it or use Google Sign-In.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email already exists. Try signing in instead.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (code === 'auth/weak-password') {
      return 'Password must be at least 6 characters long.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Sign-in popup was closed before completing authentication.';
    }
    return err?.message || 'Authentication failed. Please try again.';
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthError(null);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async (creatorRequest?: { channelName: string; bio: string }): Promise<boolean> => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = cred.user;
      const isSuperAdminEmail = user.email === 'vipsami612@gmail.com';
      await createOrSyncUserProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'SVTech User',
        photoURL: user.photoURL || '',
        role: isSuperAdminEmail ? 'super_admin' : 'free_user',
        emailVerified: true,
        channelId: `ch_${user.uid.slice(0, 10)}`
      });
      if (creatorRequest?.channelName?.trim() && !isSuperAdminEmail) {
        await submitCreatorApplicationInFirestore({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Creator',
          channelName: creatorRequest.channelName.trim(),
          channelHandle: `@${creatorRequest.channelName.trim().replace(/\s+/g, '').toLowerCase()}`,
          category: 'Tech',
          bio: creatorRequest.bio || 'SVTech Creator Application'
        });
      }
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const signUpWithEmail = async (payload: {
    email: string;
    password: string;
    displayName: string;
    requestCreator?: boolean;
    channelName?: string;
    bio?: string;
  }): Promise<boolean> => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        payload.email.trim(),
        payload.password
      );
      const user = cred.user;
      const cleanName = payload.displayName.trim() || payload.email.split('@')[0];
      await updateProfile(user, { displayName: cleanName });

      const isSuperAdminEmail = user.email === 'vipsami612@gmail.com';
      await createOrSyncUserProfile({
        uid: user.uid,
        email: user.email || payload.email.trim(),
        displayName: cleanName,
        photoURL: user.photoURL || '',
        role: isSuperAdminEmail ? 'super_admin' : 'free_user',
        emailVerified: user.emailVerified,
        creatorStatus: payload.requestCreator ? 'pending' : 'none',
        channelId: `ch_${user.uid.slice(0, 10)}`
      });

      if (payload.requestCreator && !isSuperAdminEmail) {
        await submitCreatorApplicationInFirestore({
          uid: user.uid,
          email: user.email || payload.email.trim(),
          displayName: cleanName,
          channelName: (payload.channelName || `${cleanName} Studio`).trim(),
          channelHandle: `@${(payload.channelName || cleanName).replace(/\s+/g, '').toLowerCase()}`,
          category: 'Tech',
          bio: payload.bio?.trim() || 'Creator application submitted during signup'
        });
      }

      try {
        await sendEmailVerification(user);
      } catch {
        // Ignore if email verification throttle triggers
      }

      setIsAuthModalOpen(false);
      showToast('Account created! Please check your email for verification link.', 'success');
      return true;
    } catch (err: any) {
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showToast(t.auth.resetSent, 'success');
      return true;
    } catch (err: any) {
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const resendVerificationEmail = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await sendEmailVerification(auth.currentUser);
      showToast(t.auth.verificationSent, 'success');
      return true;
    } catch (err: any) {
      showToast(formatAuthError(err), 'error');
      return false;
    }
  };

  const refreshAuthUser = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await auth.currentUser.reload();
      const reloaded = auth.currentUser;
      setCurrentUser({ ...reloaded } as FirebaseUser);
      setUserProfile(prev => ({ ...prev, emailVerified: reloaded.emailVerified }));
      return reloaded.emailVerified;
    } catch {
      return false;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUserProfile({
        uid: 'guest-uid',
        email: '',
        displayName: 'Guest Viewer',
        photoURL: '',
        role: 'free_user',
        channelId: 'my-channel',
        creatorStatus: 'none'
      });
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
  };

  const isAuthenticated = Boolean(currentUser);

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        viewMode,
        currentVideoId,
        currentChannelId,
        currentPlaylistId,
        searchQuery,
        activeCategory,
        adminActiveTab,
        language,
        setLanguage,
        t,
        videos,
        channels,
        shorts,
        playlists,
        comments,
        posts,
        categories,
        platformSettings,
        reports,
        activityLogs,
        allUsers,
        creatorApplications,
        transactions,
        downloads,
        likedVideoIds,
        dislikedVideoIds,
        subscribedChannelIds,
        watchLaterVideoIds,
        watchHistory,
        notifications,
        unreadNotificationsCount,
        sidebarOpen,
        darkMode,
        miniPlayer,
        isUploadModalOpen,
        isVoiceSearchModalOpen,
        shareModalVideo,
        playlistModalVideo,
        editingVideo,
        downloadModalVideo,
        currentUser,
        isAuthenticated,
        emailVerified,
        authLoading,
        authError,
        isAuthModalOpen,
        authModalMode,
        userProfile,
        isSuperAdmin,
        isAdmin,
        isModerator,
        isCreator,
        isProUser,
        isFreeUser,
        navigate,
        setActiveCategory,
        accessFilter,
        setAccessFilter,
        setSearchQuery,
        toggleSidebar,
        setSidebarOpen,
        toggleDarkMode,
        setAdminActiveTab,
        toggleLikeVideo,
        toggleDislikeVideo,
        toggleSubscribe,
        toggleWatchLater,
        addToHistory,
        removeFromHistory,
        clearHistory,
        addComment,
        likeComment,
        createPlaylist,
        toggleVideoInPlaylist,
        removePlaylist,
        createCommunityPost,
        toggleLikeCommunityPost,
        removeCommunityPost,
        applyForCreator,
        reviewCreatorApplication,
        saveCategory,
        removeCategory,
        uploadVideo,
        removeVideo,
        modifyVideoStatus,
        toggleFeatureVideo,
        initiatePublishingPayment,
        verifyPayment,
        startDownload,
        cancelDownload,
        removeDownload,
        publishShort,
        removeShort,
        likeShort,
        modifyCommentStatus,
        removeComment,
        submitReport,
        resolveModerationReport,
        changeUserRole,
        toggleUserBan,
        updateSettings,
        sendAnnouncement,
        saveChannelProfile,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        resendVerificationEmail,
        refreshAuthUser,
        signOutUser,
        setIsAuthModalOpen,
        setAuthModalMode,
        openAuthModal,
        clearAuthError,
        markNotificationsRead,
        setMiniPlayerState,
        closeMiniPlayer,
        restoreFromMiniPlayer,
        setIsUploadModalOpen,
        setIsVoiceSearchModalOpen,
        setShareModalVideo,
        setPlaylistModalVideo,
        setEditingVideo,
        setDownloadModalVideo,
        videoPurchases,
        recentEngagementEvents,
        sendVideoReaction,
        trackVideoShare,
        isPurchased,
        getPendingPurchase,
        purchaseVideo,
        approvePurchase,
        refundPurchase,
        setVideoAccessType,
        toast,
        showToast,
        clearToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
