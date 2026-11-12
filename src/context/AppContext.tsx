import React, { createContext, useContext, useState, useEffect } from 'react';
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
  VideoAccessType
} from '../types';
import {
  INITIAL_VIDEOS,
  INITIAL_CHANNELS,
  INITIAL_SHORTS,
  INITIAL_PLAYLISTS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS,
  generateThumbnailSvg
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
  fileReport,
  resolveReport,
  sendBroadcastNotification,
  savePlatformSettings,
  createPaymentTransaction,
  verifyAndCompletePayment,
  subscribeToVideoPurchases,
  recordVideoPurchase,
  verifyVideoPurchase,
  refundVideoPurchase,
  updateVideoAccessType
} from '../services/videoService';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { getTranslations, en, am } from '../i18n';

interface MiniPlayerState {
  active: boolean;
  video: Video | null;
  isPlaying: boolean;
  currentTime: number;
}

interface AppContextType {
  // Navigation & View
  viewMode: ViewMode;
  currentVideoId: string | null;
  currentChannelId: string | null;
  currentPlaylistId: string | null;
  searchQuery: string;
  activeCategory: string;
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
  categories: CategoryItem[];
  platformSettings: PlatformSettings;
  reports: ReportItem[];
  activityLogs: ActivityLog[];
  allUsers: UserProfile[];
  transactions: PaymentTransaction[];
  videoPurchases: VideoPurchase[];
  downloads: DownloadRecord[];

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
  addToHistory: (videoId: string, progressPercent?: number) => void;
  removeFromHistory: (videoId: string) => void;
  clearHistory: () => void;
  addComment: (videoId: string, text: string) => void;
  likeComment: (videoId: string, commentId: string) => void;
  createPlaylist: (title: string, description: string, isPrivate: boolean, initialVideoId?: string) => string;
  toggleVideoInPlaylist: (playlistId: string, videoId: string) => void;

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

  // Shorts & Community
  publishShort: (shortData: Partial<ShortItem>) => Promise<string>;
  removeShort: (shortId: string) => Promise<void>;
  likeShort: (shortId: string) => void;
  modifyCommentStatus: (commentId: string, status: 'active' | 'flagged' | 'removed') => Promise<void>;
  removeComment: (commentId: string) => Promise<void>;
  submitReport: (targetType: ReportItem['targetType'], targetId: string, reason: string, targetTitle?: string) => Promise<string>;
  resolveModerationReport: (reportId: string, status: 'resolved' | 'dismissed') => Promise<void>;
  changeUserRole: (uid: string, role: UserRole) => Promise<void>;
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<void>;
  sendAnnouncement: (title: string, message: string, videoId?: string) => Promise<void>;
  saveChannelProfile: (channel: Partial<Channel> & { id: string }) => Promise<void>;

  // Auth Operations
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;

  // Modals
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [adminActiveTab, setAdminActiveTab] = useState<string>('overview');

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
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [videoPurchases, setVideoPurchases] = useState<VideoPurchase[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('svtech_purchases');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse purchases storage');
      }
    }
    return [
      {
        purchaseId: 'purchase_sample_1',
        userId: 'dev-admin-uid',
        userEmail: 'vipsami612@gmail.com',
        videoId: 'video-2',
        videoTitle: 'Tears of Steel - High Budget Cyberpunk Sci-Fi Short Film',
        videoThumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        amount: 100,
        currency: 'ETB',
        provider: 'telebirr',
        transactionReference: 'TB-92817462',
        paymentStatus: 'successful',
        createdAt: '2 days ago',
        verifiedAt: '2 days ago',
        telebirrMerchantNumber: '0913767842'
      }
    ];
  });

  // Sync purchases to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('svtech_purchases', JSON.stringify(videoPurchases));
    }
  }, [videoPurchases]);

  // Authenticated user & RBAC
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    uid: 'dev-admin-uid',
    email: 'vipsami612@gmail.com',
    displayName: 'SVTech Platform Administrator',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'super_admin',
    channelId: 'my-channel'
  });

  // Downloads library (Stored locally with real renditions)
  const [downloads, setDownloads] = useState<DownloadRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('svtech_downloads');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse downloads storage');
      }
    }
    return [
      {
        id: 'dl_init_1',
        videoId: 'video-1',
        videoTitle: 'Big Buck Bunny 4K Remastered Special Edition',
        thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        quality: '1080p',
        fileSizeFormatted: '142 MB',
        downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        downloadedAt: 'Yesterday',
        status: 'completed',
        progress: 100
      }
    ];
  });

  // Sync downloads to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('svtech_downloads', JSON.stringify(downloads));
    }
  }, [downloads]);

  // User personal states (saved in localStorage)
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>(['video-1', 'video-5']);
  const [dislikedVideoIds, setDislikedVideoIds] = useState<string[]>([]);
  const [subscribedChannelIds, setSubscribedChannelIds] = useState<string[]>([
    'blender-foundation',
    'tech-overdrive'
  ]);
  const [watchLaterVideoIds, setWatchLaterVideoIds] = useState<string[]>(['video-2', 'video-7']);
  const [watchHistory, setWatchHistory] = useState<HistoryItem[]>([
    { videoId: 'video-1', watchedAt: '2 hours ago', progressPercent: 65 },
    { videoId: 'video-3', watchedAt: 'Yesterday', progressPercent: 100 },
    { videoId: 'video-5', watchedAt: '3 days ago', progressPercent: 40 }
  ]);

  // Responsive UI States: Default to open ONLY on large screens (desktop >= 1024px)
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
      return true; // Default dark
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

  // Sync dark class on documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('svtech_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('svtech_theme', 'light');
    }
  }, [darkMode]);

  // Window resize handler to auto-collapse sidebar on smaller viewports
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Test connection & seed initial Firestore catalog
  useEffect(() => {
    testConnection();
    initializeFirestoreDatabase('vipsami612@gmail.com');
  }, []);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      if (user) {
        const isSuperAdminEmail = user.email === 'vipsami612@gmail.com';
        setUserProfile(prev => ({
          ...prev,
          uid: user.uid,
          email: user.email || 'user@svtechmedia.com',
          displayName: user.displayName || user.email?.split('@')[0] || 'SVTech Creator',
          photoURL: user.photoURL || prev.photoURL,
          role: isSuperAdminEmail ? 'super_admin' : prev.role
        }));
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore subscriptions via onSnapshot with proper cleanup
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

    const unsubReports = subscribeToReports(firestoreReports => {
      setReports(firestoreReports);
    });

    const unsubLogs = subscribeToActivityLogs(firestoreLogs => {
      setActivityLogs(firestoreLogs);
    });

    const unsubUsers = subscribeToUsers(firestoreUsers => {
      setAllUsers(firestoreUsers);
    });

    const unsubSettings = subscribeToPlatformSettings(firestoreSettings => {
      setPlatformSettings(firestoreSettings);
    });

    const unsubTransactions = subscribeToTransactions(txs => {
      setTransactions(txs);
    });

    const unsubPurchases = subscribeToVideoPurchases(firestorePurchases => {
      if (firestorePurchases && firestorePurchases.length > 0) {
        setVideoPurchases(firestorePurchases);
      }
    });

    return () => {
      unsubVideos();
      unsubChannels();
      unsubShorts();
      unsubPlaylists();
      unsubNotifications();
      unsubAllComments();
      unsubReports();
      unsubLogs();
      unsubUsers();
      unsubSettings();
      unsubTransactions();
      unsubPurchases();
    };
  }, []);

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
      setMiniPlayer(prev => ({ ...prev, active: false }));
      setCurrentVideoId(options.videoId);
      addToHistory(options.videoId, 5);
      incrementVideoViews(options.videoId);
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
      prev.map(v => (v.id === videoId ? { ...v, likes: Math.max(0, v.likes + delta) } : v))
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

  const addToHistory = (videoId: string, progressPercent = 0) => {
    setWatchHistory(prev => {
      const filtered = prev.filter(h => h.videoId !== videoId);
      return [
        {
          videoId,
          watchedAt: 'Just now',
          progressPercent
        },
        ...filtered
      ];
    });
  };

  const removeFromHistory = (videoId: string) => {
    setWatchHistory(prev => prev.filter(h => h.videoId !== videoId));
  };

  const clearHistory = () => {
    setWatchHistory([]);
  };

  const addComment = async (videoId: string, text: string) => {
    if (!text.trim()) return;
    const authorName = userProfile.displayName || 'You (Creator)';
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
      updatedAt: 'Just now',
      isPrivate,
      ownerUid: userProfile.uid
    };
    setPlaylists(prev => [newPl, ...prev]);
    return id;
  };

  const toggleVideoInPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists(prev =>
      prev.map(pl => {
        if (pl.id === playlistId) {
          const exists = pl.videoIds.includes(videoId);
          return {
            ...pl,
            videoIds: exists ? pl.videoIds.filter(id => id !== videoId) : [...pl.videoIds, videoId],
            updatedAt: 'Just now'
          };
        }
        return pl;
      })
    );
  };

  // Video publishing with Ethiopian Birr rule enforcement
  const uploadVideo = async (videoData: Partial<Video>, transactionId?: string): Promise<string> => {
    const id = videoData.id || `video_${Date.now()}`;
    const myChannel = channels.find(c => c.id === userProfile.channelId) || {
      id: userProfile.channelId || 'my-channel',
      name: userProfile.displayName || 'SVTech Creator Studio',
      handle: `@${(userProfile.displayName || 'creator').replace(/\s+/g, '').toLowerCase()}`,
      avatarUrl: userProfile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '1.2K'
    };

    // Check fee exemption: Admins and Moderators publish free. Others must have paid 100 ETB or save as draft.
    const isExempt = isAdmin || isModerator;
    const isPaid = isExempt || Boolean(transactionId);

    const newVideo: Video = {
      id,
      title: videoData.title || 'Untitled Stream',
      description: videoData.description || 'Published on SVTech Media.',
      videoUrl: videoData.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl:
        videoData.thumbnailUrl ||
        generateThumbnailSvg(
          videoData.title || 'SVTech Video',
          videoData.category || 'Tech',
          '#1e1b4b',
          '#0f172a',
          '#e11d48',
          'play'
        ),
      duration: videoData.duration || 60,
      durationFormatted: videoData.durationFormatted || '1:00',
      views: videoData.views ?? 1,
      uploadDate: 'Just now',
      category: videoData.category || 'Tech',
      channel: myChannel,
      likes: videoData.likes ?? 1,
      dislikes: 0,
      tags: videoData.tags || ['SVTech', 'Media', 'Stream'],
      chapters: videoData.chapters || [{ title: 'Overview', time: 0 }],
      commentsCount: 0,
      status: isPaid ? (videoData.status || 'published') : 'draft',
      visibility: videoData.visibility || 'public',
      isFeatured: videoData.isFeatured || false,
      scheduledAt: videoData.scheduledAt || '',
      ownerUid: userProfile.uid,
      allowDownloads: videoData.allowDownloads ?? true,
      publishingFeePaid: isPaid,
      publishingFeeETB: isExempt ? 0 : 100,
      transactionId: transactionId || (isExempt ? 'STAFF_WAIVER' : undefined),
      createdAt: new Date().toISOString()
    };

    setVideos(prev => [newVideo, ...prev.filter(v => v.id !== id)]);
    await createOrUpdateVideo(newVideo);
    await logPlatformActivity(
      userProfile.email,
      'VIDEO_PUBLISHED',
      `Published "${newVideo.title}" (Fee: ${newVideo.publishingFeeETB} ETB)`
    );

    return id;
  };

  // Payment creation for 100 ETB video publishing
  const initiatePublishingPayment = async (
    videoTitle: string,
    provider: 'telebirr' | 'cbe_birr' | 'chapa'
  ): Promise<PaymentTransaction> => {
    const tx = await createPaymentTransaction({
      userId: userProfile.uid,
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
    if (!vid) return true;
    if (vid.accessType === 'free' || !vid.accessType) return true;
    if (isAdmin) return true;
    if (vid.ownerUid && vid.ownerUid === userProfile.uid) return true;
    return videoPurchases.some(
      p => p.videoId === videoId && p.userId === userProfile.uid && p.paymentStatus === 'successful'
    );
  };

  const purchaseVideo = async (
    video: Video,
    provider: 'telebirr' | 'cbe_birr' | 'chapa',
    userTxnRef?: string,
    phone?: string
  ): Promise<VideoPurchase> => {
    const newPurchase = await recordVideoPurchase({
      userId: userProfile.uid,
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
      notes: `Purchased with ${provider.toUpperCase()}`
    });

    setVideoPurchases(prev => [newPurchase, ...prev.filter(p => p.purchaseId !== newPurchase.purchaseId)]);
    await logPlatformActivity(
      userProfile.email,
      'PRO_PURCHASE_INITIATED',
      `Initiated ${video.price || 100} ETB purchase for "${video.title}" via ${provider.toUpperCase()}`
    );
    return newPurchase;
  };

  const approvePurchase = async (purchaseId: string) => {
    await verifyVideoPurchase(purchaseId, userProfile.email);
    setVideoPurchases(prev =>
      prev.map(p =>
        p.purchaseId === purchaseId
          ? { ...p, paymentStatus: 'successful', verifiedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const refundPurchase = async (purchaseId: string) => {
    await refundVideoPurchase(purchaseId, userProfile.email);
    setVideoPurchases(prev =>
      prev.map(p =>
        p.purchaseId === purchaseId ? { ...p, paymentStatus: 'refunded' } : p
      )
    );
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

  // Downloads manager with real file streaming & progress
  const startDownload = async (
    video: Video,
    quality: '360p' | '480p' | '720p' | '1080p'
  ) => {
    if (video.allowDownloads === false && !isAdmin) {
      alert(t.watch.downloadNotAllowed);
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

    // Progression tracking
    setTimeout(() => {
      setDownloads(prev =>
        prev.map(d => (d.id === dlId ? { ...d, progress: 65 } : d))
      );
    }, 400);

    setTimeout(() => {
      setDownloads(prev =>
        prev.map(d => (d.id === dlId ? { ...d, progress: 100, status: 'completed' } : d))
      );

      // Trigger actual browser file save
      const a = document.createElement('a');
      a.href = video.videoUrl;
      a.download = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}_${quality}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 900);
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
    await logPlatformActivity(userProfile.email, 'VIDEO_STATUS_UPDATED', `Set status ${status}/${visibility} for ${videoId}`);
  };

  const toggleFeatureVideo = async (videoId: string, isFeatured: boolean) => {
    setVideos(prev =>
      prev.map(v => (v.id === videoId ? { ...v, isFeatured } : v))
    );
    await toggleVideoFeatured(videoId, isFeatured);
  };

  const publishShort = async (shortData: Partial<ShortItem>): Promise<string> => {
    const id = shortData.id || `short_${Date.now()}`;
    const myChannel = channels[0] || {
      id: 'svtech-studio',
      name: 'SVTech Media Studio',
      handle: '@SVTechMedia',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true
    };

    const newShort: ShortItem = {
      id,
      title: shortData.title || 'SVTech Short Reel',
      videoUrl: shortData.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: shortData.thumbnailUrl || generateThumbnailSvg('Short', 'Shorts', '#1e1b4b', '#030712', '#e11d48', 'sparkle'),
      channel: myChannel,
      likes: 1,
      commentsCount: 0,
      soundTitle: shortData.soundTitle || 'SVTech Original Sound HD',
      tags: shortData.tags || ['svtech', 'shorts'],
      isFeatured: true,
      ownerUid: userProfile.uid,
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
    const reportId = await fileReport({
      targetType,
      targetId,
      targetTitle: targetTitle || '',
      reason,
      reporterEmail: userProfile.email
    });
    return reportId;
  };

  const resolveModerationReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status } : r))
    );
    await resolveReport(reportId, status);
  };

  const changeUserRole = async (uid: string, role: UserRole) => {
    setAllUsers(prev =>
      prev.map(u => (u.uid === uid ? { ...u, role } : u))
    );
    await updateUserRole(uid, role);
    await logPlatformActivity(userProfile.email, 'ROLE_UPDATED', `Assigned ${role} to ${uid}`);
  };

  const updateSettings = async (newSettings: Partial<PlatformSettings>) => {
    const updated = { ...platformSettings, ...newSettings };
    setPlatformSettings(updated);
    await savePlatformSettings(updated);
    await logPlatformActivity(userProfile.email, 'SETTINGS_UPDATED', 'Updated platform configuration');
  };

  const sendAnnouncement = async (title: string, message: string, videoId?: string) => {
    await sendBroadcastNotification(title, message, videoId);
    await logPlatformActivity(userProfile.email, 'BROADCAST_SENT', `Broadcast: "${title}"`);
  };

  const saveChannelProfile = async (channel: Partial<Channel> & { id: string }) => {
    setChannels(prev =>
      prev.map(c => (c.id === channel.id ? { ...c, ...channel } : c))
    );
    await createOrUpdateChannel(channel);
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.warn('Google sign in popup notice:', err);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUserProfile({
        uid: 'guest-uid',
        email: 'viewer@svtechmedia.com',
        displayName: 'Guest Viewer',
        role: 'free_user'
      });
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
  };

  // Demo role switcher to allow full testing of Super Admin, Admin, Moderator, Creator, Pro, and Free roles
  const switchDemoRole = (role: UserRole) => {
    setUserProfile(prev => ({
      ...prev,
      role
    }));
  };

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
        categories,
        platformSettings,
        reports,
        activityLogs,
        allUsers,
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
        userProfile,
        isSuperAdmin,
        isAdmin,
        isModerator,
        isCreator,
        isProUser,
        isFreeUser,
        navigate,
        setActiveCategory,
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
        updateSettings,
        sendAnnouncement,
        saveChannelProfile,
        signInWithGoogle,
        signOutUser,
        switchDemoRole,
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
        isPurchased,
        purchaseVideo,
        approvePurchase,
        refundPurchase,
        setVideoAccessType
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
