export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'moderator'
  | 'creator'
  | 'pro_user'
  | 'free_user';

export type Language = 'en' | 'am';

export type VideoAccessType = 'free' | 'pro' | 'private' | 'unlisted';

export type AccessFilter = 'all' | 'free' | 'pro';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  channelId?: string;
  createdAt?: string;
  isBanned?: boolean;
  phoneNumber?: string;
  preferredLanguage?: Language;
  emailVerified?: boolean;
  creatorStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface VideoChannel {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  verified?: boolean;
  subscribers: string;
}

export interface VideoChapter {
  title: string;
  time: number; // in seconds
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoStoragePath?: string;
  thumbnailUrl: string;
  thumbnailStoragePath?: string;
  duration: number; // seconds
  durationFormatted: string;
  views: number;
  uploadDate: string;
  category: string;
  channel: VideoChannel;
  likes: number;
  dislikes: number;
  tags: string[];
  chapters: VideoChapter[];
  commentsCount: number;
  // Advanced SVTech Media attributes
  status?: 'published' | 'draft' | 'scheduled' | 'unlisted';
  visibility?: 'public' | 'private' | 'unlisted';
  isFeatured?: boolean;
  scheduledAt?: string;
  ownerUid?: string;
  createdAt?: string;
  updatedAt?: string;
  // PRO / Paid Video Monetization attributes
  accessType?: VideoAccessType;
  price?: number; // In ETB (e.g. 50, 100, 150, 200 ETB)
  currency?: 'ETB';
  isPremium?: boolean;
  protectedPlaybackReference?: string;
  creatorId?: string;
  publishedAt?: string;
  // Monetization & Download attributes
  allowDownloads?: boolean;
  downloadQualityOptions?: ('360p' | '480p' | '720p' | '1080p')[];
  publishingFeePaid?: boolean;
  publishingFeeETB?: number;
  transactionId?: string;
  isLive?: boolean;
  // Real-time 24h Analytics & Live Reactions
  views24h?: number;
  likes24h?: number;
  comments24h?: number;
  reactionsCount?: number;
  reactions24h?: number;
  shares24h?: number;
  growthRate24h?: number;
  lastEngagedAt?: string;
}

export type ReactionType = 'heart' | 'fire' | 'clap' | 'laugh' | 'wow' | 'rocket';

export interface LiveReaction {
  id: string;
  videoId: string;
  emoji: string;
  type: ReactionType;
  userId: string;
  userName: string;
  videoTime: number;
  createdAt: string;
}

export interface EngagementEvent {
  id: string;
  videoId: string;
  type: 'view' | 'like' | 'comment' | 'reaction' | 'share';
  userId: string;
  createdAt: string;
}

export interface VideoPurchase {
  id: string;
  purchaseId?: string;
  userId: string;
  userEmail: string;
  videoId: string;
  videoTitle: string;
  videoThumbnail?: string;
  amount: number; // In ETB
  currency: 'ETB';
  provider: 'telebirr' | 'cbe_birr' | 'chapa';
  paymentProvider?: 'telebirr' | 'cbe_birr' | 'chapa';
  transactionReference: string;
  status: 'pending' | 'verified' | 'failed' | 'refunded';
  paymentStatus?: 'pending' | 'successful' | 'failed' | 'refunded';
  purchasedAt: string;
  createdAt?: string;
  verifiedAt?: string;
  accessExpiresAt?: string;
  merchantNumber?: string;
  telebirrMerchantNumber?: string;
  userContactPhone?: string;
  notes?: string;
}

export interface Comment {
  id: string;
  videoId?: string;
  author: {
    name: string;
    avatarUrl: string;
    isOwner?: boolean;
    userId?: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  status?: 'active' | 'flagged' | 'removed';
  replies?: Comment[];
}

export interface ShortComment {
  id: string;
  shortId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  channelId: string;
  authorUid: string;
  authorName: string;
  authorAvatarUrl: string;
  text: string;
  imageUrl?: string;
  likes: number;
  likedBy?: string[];
  createdAt: string;
}

export interface CreatorApplication {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  channelName: string;
  channelHandle: string;
  category: string;
  bio: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface Channel {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bannerUrl: string;
  subscribers: string;
  subscriberCountNumber: number;
  verified?: boolean;
  description: string;
  joinedDate: string;
  totalViews: string;
  videosCount: number;
  featuredVideoId?: string;
  ownerUid?: string;
  isFeatured?: boolean;
  links?: { title: string; url: string }[];
}

export interface ShortItem {
  id: string;
  title: string;
  videoUrl: string;
  videoStoragePath?: string;
  thumbnailUrl: string;
  thumbnailStoragePath?: string;
  channel: {
    id: string;
    name: string;
    handle: string;
    avatarUrl: string;
    verified?: boolean;
  };
  likes: number;
  commentsCount: number;
  soundTitle: string;
  tags: string[];
  isFeatured?: boolean;
  ownerUid?: string;
  createdAt?: string;
  accessType?: VideoAccessType;
  price?: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  videoIds: string[];
  updatedAt: string;
  isPrivate?: boolean;
  customThumbnail?: string;
  ownerUid?: string;
}

export interface HistoryItem {
  videoId: string;
  watchedAt: string;
  progressPercent: number; // 0 to 100
  lastPositionSec?: number;
  updatedAt?: string;
}

export interface WatchHistoryDoc {
  videoId: string;
  progressPercent: number;
  lastPositionSec: number;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatarUrl: string;
  videoId?: string;
  targetUserId?: string;
  createdAt?: string;
}

export interface ReportItem {
  id: string;
  targetType: 'video' | 'comment' | 'channel';
  targetId: string;
  targetTitle?: string;
  reason: string;
  reporterEmail?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  nameAm?: string;
  slug: string;
  videoCount?: number;
}

export type PaymentProvider = 'telebirr' | 'cbe_birr' | 'chapa';
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'successful'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  videoId?: string;
  videoTitle?: string;
  amount: number; // in ETB
  currency: 'ETB';
  provider: PaymentProvider;
  status: PaymentStatus;
  referenceNumber: string;
  paymentType: 'video_publishing_fee' | 'pro_subscription' | 'donation' | 'video_purchase';
  createdAt: string;
  verifiedAt?: string;
  notes?: string;
}

export interface DownloadRecord {
  id: string;
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  quality: '360p' | '480p' | '720p' | '1080p';
  fileSizeFormatted: string;
  downloadUrl: string;
  downloadedAt: string;
  status: 'completed' | 'in_progress' | 'failed' | 'cancelled';
  progress: number;
}

export interface PlatformSettings {
  siteName: string;
  tagline: string;
  allowPublicUploads: boolean;
  requireApproval: boolean;
  maintenanceMode: boolean;
  maxUploadSizeMB: number;
  // Ethiopian Birr publishing economics
  publishingFeeETB: number; // default 100 ETB
  allowFreeCreatorUploads: boolean;
  proPlanMonthlyETB: number; // e.g. 500 ETB
  enabledPaymentProviders: PaymentProvider[];
  telebirrMerchantId?: string; // 0913767842
  cbeBirrMerchantId?: string;
  chapaPublicKey?: string;
  allowPublicDownloads: boolean;
  defaultLanguage: Language;
  featuredBannerEnabled?: boolean;
  featuredBannerTitle?: string;
  featuredBannerText?: string;
  featuredBannerVideoId?: string;
}

export type ViewMode =
  | 'home'
  | 'watch'
  | 'shorts'
  | 'subscriptions'
  | 'history'
  | 'liked'
  | 'watchlater'
  | 'playlists'
  | 'playlist-detail'
  | 'channel'
  | 'search'
  | 'your-videos'
  | 'trending'
  | 'downloads'
  | 'purchases'
  | 'admin'
  | 'creator-dashboard'
  | 'moderator-dashboard'
  | 'signin'
  | 'signup'
  | 'forgot-password'
  | 'verify-email'
  | 'unauthorized';
