import { describe, it, expect } from 'vitest';
import {
  toMillis,
  formatLogTimestamp,
  normalizePurchaseStatus,
  isVideoPurchased,
  hasPendingVideoPurchase,
  canPublishVideo,
  isRoleAllowed,
  calculateEngagementScore,
  mapViewModeToPath,
  mapPathToRouteState
} from '../services/domainHelpers';
import { en, am } from '../i18n';
import { Video, VideoPurchase } from '../types';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectKeys(v as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys.sort();
}

const sampleFreeVideo: Video = {
  id: 'vid-free-1',
  title: 'Free Tutorial',
  description: 'Free stream',
  videoUrl: 'https://example.com/v.mp4',
  thumbnailUrl: 'https://example.com/t.jpg',
  duration: 120,
  durationFormatted: '2:00',
  views: 10,
  uploadDate: 'Today',
  category: 'Tech',
  channel: { id: 'ch-1', name: 'SVTech', handle: '@svtech', avatarUrl: '', subscribers: '10' },
  likes: 2,
  dislikes: 0,
  tags: ['tech'],
  chapters: [],
  commentsCount: 0,
  accessType: 'free',
  ownerUid: 'creator-1'
};

const sampleProVideo: Video = {
  ...sampleFreeVideo,
  id: 'vid-pro-1',
  title: 'PRO Masterclass',
  accessType: 'pro',
  isPremium: true,
  price: 100
};

describe('SVTech Media Domain Helpers & Security Contracts', () => {
  it('safely converts timestamps including Firestore Timestamp-like objects', () => {
    expect(toMillis(null)).toBe(0);
    expect(toMillis(1700000000000)).toBe(1700000000000);
    expect(toMillis('2026-01-15T10:30:00.000Z')).toBe(new Date('2026-01-15T10:30:00.000Z').getTime());
    expect(toMillis({ seconds: 1700000000 })).toBe(1700000000000);
    expect(toMillis({ toMillis: () => 1700000001234 })).toBe(1700000001234);
    expect(formatLogTimestamp('2026-01-15T10:30:45.000Z')).toBe('2026-01-15 10:30:45');
    expect(formatLogTimestamp(undefined)).toBe('--:--');
  });

  it('enforces Telebirr watch-to-unlock PRO access rules strictly', () => {
    const purchases: VideoPurchase[] = [
      {
        id: 'pur-pending',
        userId: 'user-pending',
        userEmail: 'pending@example.com',
        videoId: 'vid-pro-1',
        videoTitle: 'PRO Masterclass',
        amount: 100,
        currency: 'ETB',
        provider: 'telebirr',
        transactionReference: 'TB-111111',
        status: 'pending',
        paymentStatus: 'pending',
        purchasedAt: '2026-01-15T10:00:00.000Z'
      },
      {
        id: 'pur-verified',
        userId: 'user-verified',
        userEmail: 'verified@example.com',
        videoId: 'vid-pro-1',
        videoTitle: 'PRO Masterclass',
        amount: 100,
        currency: 'ETB',
        provider: 'telebirr',
        transactionReference: 'TB-222222',
        status: 'verified',
        paymentStatus: 'successful',
        purchasedAt: '2026-01-15T10:00:00.000Z'
      },
      {
        id: 'pur-refunded',
        userId: 'user-refunded',
        userEmail: 'refunded@example.com',
        videoId: 'vid-pro-1',
        videoTitle: 'PRO Masterclass',
        amount: 100,
        currency: 'ETB',
        provider: 'telebirr',
        transactionReference: 'TB-333333',
        status: 'refunded',
        paymentStatus: 'refunded',
        purchasedAt: '2026-01-15T10:00:00.000Z'
      }
    ];

    expect(normalizePurchaseStatus(purchases[0])).toBe('pending');
    expect(normalizePurchaseStatus(purchases[1])).toBe('verified');
    expect(normalizePurchaseStatus(purchases[2])).toBe('refunded');

    // Free video is accessible to guests and all users
    expect(isVideoPurchased({ video: sampleFreeVideo, userId: null, purchases })).toBe(true);

    // PRO video locked for guests, pending users, and refunded users
    expect(isVideoPurchased({ video: sampleProVideo, userId: null, purchases })).toBe(false);
    expect(isVideoPurchased({ video: sampleProVideo, userId: 'user-pending', purchases })).toBe(false);
    expect(isVideoPurchased({ video: sampleProVideo, userId: 'user-refunded', purchases })).toBe(false);

    // PRO video unlocked for verified buyer, owner, and admin
    expect(isVideoPurchased({ video: sampleProVideo, userId: 'user-verified', purchases })).toBe(true);
    expect(isVideoPurchased({ video: sampleProVideo, userId: 'creator-1', purchases })).toBe(true);
    expect(isVideoPurchased({ video: sampleProVideo, userId: 'any-admin', isAdmin: true, purchases })).toBe(true);

    // Pending lookup
    expect(hasPendingVideoPurchase({ videoId: 'vid-pro-1', userId: 'user-pending', purchases })?.id).toBe('pur-pending');
    expect(hasPendingVideoPurchase({ videoId: 'vid-pro-1', userId: 'user-verified', purchases })).toBeUndefined();
  });

  it('validates RBAC publishing and route guard permissions', () => {
    expect(canPublishVideo({ role: 'free_user', isAuthenticated: false, allowPublicUploads: true })).toBe(false);
    expect(canPublishVideo({ role: 'free_user', isAuthenticated: true, allowPublicUploads: false })).toBe(false);
    expect(canPublishVideo({ role: 'free_user', isAuthenticated: true, allowPublicUploads: true })).toBe(true);
    expect(canPublishVideo({ role: 'creator', isAuthenticated: true, allowPublicUploads: false })).toBe(true);
    expect(isRoleAllowed('moderator', ['super_admin', 'admin', 'moderator'])).toBe(true);
    expect(isRoleAllowed('free_user', ['super_admin', 'admin'])).toBe(false);
  });

  it('calculates weighted 24h engagement scores for trending ranking', () => {
    const score = calculateEngagementScore({
      views24h: 100,
      likes24h: 10,
      comments24h: 5,
      reactions24h: 20,
      shares24h: 2
    });
    // 100 + 80 + 60 + 120 + 30 = 390
    expect(score).toBe(390);
  });

  it('roundtrips all React Router view modes cleanly', () => {
    const watchPath = mapViewModeToPath('watch', { videoId: 'vid-123' });
    expect(watchPath).toBe('/watch/vid-123');
    expect(mapPathToRouteState(watchPath)).toEqual({ viewMode: 'watch', videoId: 'vid-123' });

    const channelPath = mapViewModeToPath('channel', { channelId: 'ch-abc' });
    expect(channelPath).toBe('/channel/ch-abc');
    expect(mapPathToRouteState(channelPath)).toEqual({ viewMode: 'channel', channelId: 'ch-abc' });

    const playlistPath = mapViewModeToPath('playlist-detail', { playlistId: 'pl-9' });
    expect(playlistPath).toBe('/playlist/pl-9');
    expect(mapPathToRouteState(playlistPath)).toEqual({ viewMode: 'playlist-detail', playlistId: 'pl-9' });

    const searchPath = mapViewModeToPath('search', { searchQuery: 'telebirr pro' });
    expect(searchPath).toBe('/search?q=telebirr%20pro');
    expect(mapPathToRouteState('/search', '?q=telebirr%20pro')).toEqual({
      viewMode: 'search',
      searchQuery: 'telebirr pro'
    });

    expect(mapPathToRouteState('/creator/dashboard')).toEqual({ viewMode: 'creator-dashboard' });
    expect(mapPathToRouteState('/moderator/dashboard')).toEqual({ viewMode: 'moderator-dashboard' });
    expect(mapPathToRouteState('/signin')).toEqual({ viewMode: 'signin' });
    expect(mapPathToRouteState('/forgot-password')).toEqual({ viewMode: 'forgot-password' });
    expect(mapPathToRouteState('/verify-email')).toEqual({ viewMode: 'verify-email' });
    expect(mapPathToRouteState('/unauthorized')).toEqual({ viewMode: 'unauthorized' });
  });

  it('enforces 100% EN and AM bilingual translation key parity', () => {
    const enKeys = collectKeys(en as unknown as Record<string, unknown>);
    const amKeys = collectKeys(am as unknown as Record<string, unknown>);
    expect(enKeys).toEqual(amKeys);
    expect(enKeys.length).toBeGreaterThan(100);
  });
});
