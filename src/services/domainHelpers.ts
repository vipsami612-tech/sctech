import { UserRole, Video, VideoPurchase, ViewMode } from '../types';

/**
 * Safely convert Firestore Timestamp, ISO string, number, or Date to epoch milliseconds.
 */
export function toMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'object') {
    const maybe = value as { toMillis?: () => number; seconds?: number };
    if (typeof maybe.toMillis === 'function') {
      return maybe.toMillis();
    }
    if (typeof maybe.seconds === 'number') {
      return maybe.seconds * 1000;
    }
  }
  return 0;
}

export function formatLogTimestamp(value: unknown): string {
  const ms = toMillis(value);
  if (!ms) return '--:--';
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
}

export function normalizePurchaseStatus(
  purchase: Pick<VideoPurchase, 'status' | 'paymentStatus'>
): 'pending' | 'verified' | 'failed' | 'refunded' {
  const raw = purchase.paymentStatus || purchase.status || 'pending';
  if (raw === 'successful' || raw === 'verified') return 'verified';
  if (raw === 'refunded') return 'refunded';
  if (raw === 'failed') return 'failed';
  return 'pending';
}

export function isVideoPurchased(params: {
  video?: Video | null;
  userId?: string | null;
  userChannelId?: string | null;
  isAdmin?: boolean;
  purchases: VideoPurchase[];
}): boolean {
  const { video, userId, userChannelId, isAdmin, purchases } = params;
  if (!video) return false;
  const isPro = video.accessType === 'pro' || Boolean(video.isPremium);
  if (!isPro) return true;
  if (isAdmin) return true;
  if (userId && (video.ownerUid === userId || video.channel?.id === userId)) return true;
  if (userChannelId && video.channel?.id === userChannelId) return true;
  if (!userId) return false;

  return purchases.some(p => {
    if (p.videoId !== video.id || p.userId !== userId) return false;
    return normalizePurchaseStatus(p) === 'verified';
  });
}

export function hasPendingVideoPurchase(params: {
  videoId: string;
  userId?: string | null;
  purchases: VideoPurchase[];
}): VideoPurchase | undefined {
  const { videoId, userId, purchases } = params;
  if (!userId) return undefined;
  return purchases.find(
    p => p.videoId === videoId && p.userId === userId && normalizePurchaseStatus(p) === 'pending'
  );
}

export function canPublishVideo(params: {
  role: UserRole;
  allowPublicUploads?: boolean;
  isAuthenticated: boolean;
}): boolean {
  if (!params.isAuthenticated) return false;
  if (['super_admin', 'admin', 'moderator', 'creator'].includes(params.role)) return true;
  return Boolean(params.allowPublicUploads);
}

export function isRoleAllowed(role: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(role);
}

export function calculateEngagementScore(metrics: {
  views24h: number;
  likes24h: number;
  comments24h: number;
  reactions24h: number;
  shares24h: number;
}): number {
  return (
    (metrics.views24h || 0) +
    (metrics.likes24h || 0) * 8 +
    (metrics.comments24h || 0) * 12 +
    (metrics.reactions24h || 0) * 6 +
    (metrics.shares24h || 0) * 15
  );
}

export function mapViewModeToPath(
  mode: ViewMode,
  options?: {
    videoId?: string | null;
    channelId?: string | null;
    playlistId?: string | null;
    searchQuery?: string;
  }
): string {
  switch (mode) {
    case 'home':
      return '/home';
    case 'watch':
      return options?.videoId ? `/watch/${encodeURIComponent(options.videoId)}` : '/home';
    case 'channel':
      return options?.channelId ? `/channel/${encodeURIComponent(options.channelId)}` : '/home';
    case 'playlist-detail':
      return options?.playlistId ? `/playlist/${encodeURIComponent(options.playlistId)}` : '/playlists';
    case 'search':
      return options?.searchQuery
        ? `/search?q=${encodeURIComponent(options.searchQuery)}`
        : '/search';
    case 'shorts':
      return '/shorts';
    case 'trending':
      return '/trending';
    case 'subscriptions':
      return '/subscriptions';
    case 'history':
      return '/history';
    case 'liked':
      return '/liked';
    case 'watchlater':
      return '/watchlater';
    case 'playlists':
      return '/playlists';
    case 'downloads':
      return '/downloads';
    case 'purchases':
      return '/purchases';
    case 'your-videos':
      return '/your-videos';
    case 'admin':
      return '/admin';
    case 'creator-dashboard':
      return '/creator/dashboard';
    case 'moderator-dashboard':
      return '/moderator/dashboard';
    case 'signin':
      return '/signin';
    case 'signup':
      return '/signup';
    case 'forgot-password':
      return '/forgot-password';
    case 'verify-email':
      return '/verify-email';
    case 'unauthorized':
      return '/unauthorized';
    default:
      return '/home';
  }
}

export function mapPathToRouteState(
  pathname: string,
  search = ''
): {
  viewMode: ViewMode;
  videoId?: string | null;
  channelId?: string | null;
  playlistId?: string | null;
  searchQuery?: string;
} {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '/home') return { viewMode: 'home' };

  if (clean.startsWith('/watch/')) {
    const videoId = decodeURIComponent(clean.slice('/watch/'.length));
    return { viewMode: 'watch', videoId };
  }
  if (clean.startsWith('/channel/')) {
    const channelId = decodeURIComponent(clean.slice('/channel/'.length));
    return { viewMode: 'channel', channelId };
  }
  if (clean.startsWith('/playlist/')) {
    const playlistId = decodeURIComponent(clean.slice('/playlist/'.length));
    return { viewMode: 'playlist-detail', playlistId };
  }
  if (clean === '/search') {
    const params = new URLSearchParams(search);
    return { viewMode: 'search', searchQuery: params.get('q') || '' };
  }

  const staticRoutes: Record<string, ViewMode> = {
    '/shorts': 'shorts',
    '/trending': 'trending',
    '/subscriptions': 'subscriptions',
    '/history': 'history',
    '/liked': 'liked',
    '/watchlater': 'watchlater',
    '/playlists': 'playlists',
    '/downloads': 'downloads',
    '/purchases': 'purchases',
    '/your-videos': 'your-videos',
    '/admin': 'admin',
    '/creator/dashboard': 'creator-dashboard',
    '/moderator/dashboard': 'moderator-dashboard',
    '/signin': 'signin',
    '/signup': 'signup',
    '/forgot-password': 'forgot-password',
    '/verify-email': 'verify-email',
    '/unauthorized': 'unauthorized'
  };

  if (staticRoutes[clean]) {
    return { viewMode: staticRoutes[clean] };
  }

  return { viewMode: 'home' };
}
