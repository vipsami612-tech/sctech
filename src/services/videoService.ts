import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  increment,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Video,
  Channel,
  ShortItem,
  Playlist,
  Comment,
  NotificationItem,
  UserProfile,
  ReportItem,
  ActivityLog,
  PlatformSettings,
  UserRole,
  PaymentTransaction,
  DownloadRecord,
  VideoPurchase,
  VideoAccessType
} from '../types';

/**
 * Real-time listener for Videos collection
 * Avoids strict composite index requirements by sorting safely in memory
 */
export function subscribeToVideos(callback: (videos: Video[]) => void) {
  return onSnapshot(
    collection(db, 'videos'),
    snapshot => {
      const vids = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Video[];
      // Client-side sort by createdAt desc safely
      vids.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.uploadDate || 0).getTime();
        const timeB = new Date(b.createdAt || b.uploadDate || 0).getTime();
        return timeB - timeA;
      });
      callback(vids);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
    }
  );
}

/**
 * Real-time listener for Channels collection
 */
export function subscribeToChannels(callback: (channels: Channel[]) => void) {
  return onSnapshot(
    collection(db, 'channels'),
    snapshot => {
      const chs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Channel[];
      callback(chs);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'channels');
    }
  );
}

/**
 * Real-time listener for Shorts collection
 */
export function subscribeToShorts(callback: (shorts: ShortItem[]) => void) {
  return onSnapshot(
    collection(db, 'shorts'),
    snapshot => {
      const shs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as ShortItem[];
      shs.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      callback(shs);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'shorts');
    }
  );
}

/**
 * Real-time listener for Playlists collection
 */
export function subscribeToPlaylists(callback: (playlists: Playlist[]) => void) {
  return onSnapshot(
    collection(db, 'playlists'),
    snapshot => {
      const pls = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Playlist[];
      callback(pls);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'playlists');
    }
  );
}

/**
 * Real-time listener for Comments on a specific video
 * Avoids Firestore composite query index errors by querying on videoId and sorting locally
 */
export function subscribeToVideoComments(
  videoId: string,
  callback: (comments: Comment[]) => void
) {
  const q = query(
    collection(db, 'comments'),
    where('videoId', '==', videoId)
  );
  return onSnapshot(
    q,
    snapshot => {
      const cmts = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Comment[];
      cmts.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });
      callback(cmts);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, `comments/${videoId}`);
    }
  );
}

/**
 * Real-time listener for ALL comments (Admin / Moderation)
 */
export function subscribeToAllComments(callback: (comments: Comment[]) => void) {
  return onSnapshot(
    collection(db, 'comments'),
    snapshot => {
      const cmts = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Comment[];
      cmts.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });
      callback(cmts);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'comments');
    }
  );
}

/**
 * Real-time listener for Notifications
 */
export function subscribeToNotifications(callback: (notifs: NotificationItem[]) => void) {
  return onSnapshot(
    collection(db, 'notifications'),
    snapshot => {
      const notifs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as NotificationItem[];
      notifs.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      callback(notifs);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    }
  );
}

/**
 * Real-time listener for Moderation Reports (Admin)
 */
export function subscribeToReports(callback: (reports: ReportItem[]) => void) {
  return onSnapshot(
    collection(db, 'reports'),
    snapshot => {
      const reps = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as ReportItem[];
      reps.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      callback(reps);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
    }
  );
}

/**
 * Real-time listener for Platform Activity Logs (Admin)
 */
export function subscribeToActivityLogs(callback: (logs: ActivityLog[]) => void) {
  return onSnapshot(
    collection(db, 'activityLogs'),
    snapshot => {
      const lgs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as ActivityLog[];
      lgs.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });
      callback(lgs);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'activityLogs');
    }
  );
}

/**
 * Real-time listener for Users and Roles (Admin)
 */
export function subscribeToUsers(callback: (users: UserProfile[]) => void) {
  return onSnapshot(
    collection(db, 'users'),
    snapshot => {
      const usrs = snapshot.docs.map(d => ({
        uid: d.id,
        ...d.data()
      })) as UserProfile[];
      callback(usrs);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  );
}

/**
 * Real-time listener for Platform Settings
 */
export function subscribeToPlatformSettings(callback: (settings: PlatformSettings) => void) {
  return onSnapshot(
    doc(db, 'platformSettings', 'global'),
    snapshot => {
      if (snapshot.exists()) {
        callback(snapshot.data() as PlatformSettings);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.GET, 'platformSettings/global');
    }
  );
}

/**
 * Real-time listener for Ethiopian Birr Transactions
 */
export function subscribeToTransactions(callback: (transactions: PaymentTransaction[]) => void) {
  return onSnapshot(
    collection(db, 'transactions'),
    snapshot => {
      const txs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as PaymentTransaction[];
      txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(txs);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    }
  );
}

/**
 * Real-time listener for User Video Purchases (PRO watch unlock)
 */
export function subscribeToVideoPurchases(callback: (purchases: VideoPurchase[]) => void) {
  return onSnapshot(
    collection(db, 'videoPurchases'),
    snapshot => {
      const purches = snapshot.docs.map(d => ({
        id: d.id,
        purchaseId: d.id,
        ...d.data()
      })) as VideoPurchase[];
      purches.sort((a, b) => {
        const timeB = new Date(b.createdAt || b.purchasedAt || 0).getTime();
        const timeA = new Date(a.createdAt || a.purchasedAt || 0).getTime();
        return timeB - timeA;
      });
      callback(purches);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'videoPurchases');
    }
  );
}

// ================= VIDEO MUTATIONS =================

export async function createOrUpdateVideo(
  videoData: Partial<Video> & { id?: string }
): Promise<string> {
  try {
    const videoId = videoData.id || `video_${Date.now()}`;
    const payload: Partial<Video> = {
      ...videoData,
      status: videoData.status || 'published',
      visibility: videoData.visibility || 'public',
      views: videoData.views ?? 0,
      likes: videoData.likes ?? 0,
      dislikes: videoData.dislikes ?? 0,
      commentsCount: videoData.commentsCount ?? 0,
      allowDownloads: videoData.allowDownloads ?? true,
      updatedAt: new Date().toISOString()
    };
    if (!videoData.createdAt) {
      payload.createdAt = new Date().toISOString();
    }

    await setDoc(doc(db, 'videos', videoId), payload, { merge: true });
    return videoId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'videos');
    throw err;
  }
}

export async function deleteVideo(videoId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'videos', videoId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `videos/${videoId}`);
    throw err;
  }
}

export async function updateVideoStatus(
  videoId: string,
  status: Video['status'],
  visibility: Video['visibility']
): Promise<void> {
  try {
    await updateDoc(doc(db, 'videos', videoId), {
      status,
      visibility,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `videos/${videoId}`);
    throw err;
  }
}

export async function toggleVideoFeatured(
  videoId: string,
  isFeatured: boolean
): Promise<void> {
  try {
    await updateDoc(doc(db, 'videos', videoId), {
      isFeatured,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `videos/${videoId}`);
    throw err;
  }
}

export async function incrementVideoViews(videoId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'videos', videoId), {
      views: increment(1)
    });
  } catch (err) {
    console.debug('View increment notice:', err);
  }
}

export async function updateVideoLikes(
  videoId: string,
  delta: number
): Promise<void> {
  try {
    await updateDoc(doc(db, 'videos', videoId), {
      likes: increment(delta)
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `videos/${videoId}`);
  }
}

// ================= SHORTS MUTATIONS =================

export async function createShort(shortData: Partial<ShortItem>): Promise<string> {
  try {
    const shortId = shortData.id || `short_${Date.now()}`;
    await setDoc(doc(db, 'shorts', shortId), {
      ...shortData,
      likes: shortData.likes ?? 0,
      commentsCount: shortData.commentsCount ?? 0,
      createdAt: new Date().toISOString()
    });
    return shortId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'shorts');
    throw err;
  }
}

export async function deleteShort(shortId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'shorts', shortId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `shorts/${shortId}`);
    throw err;
  }
}

export async function updateShortLikes(shortId: string, delta: number): Promise<void> {
  try {
    await updateDoc(doc(db, 'shorts', shortId), {
      likes: increment(delta)
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `shorts/${shortId}`);
  }
}

// ================= CHANNEL MUTATIONS =================

export async function createOrUpdateChannel(channel: Partial<Channel> & { id: string }): Promise<void> {
  try {
    await setDoc(doc(db, 'channels', channel.id), channel, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `channels/${channel.id}`);
    throw err;
  }
}

export async function toggleChannelSubscription(channelId: string, delta: number): Promise<void> {
  try {
    await updateDoc(doc(db, 'channels', channelId), {
      subscriberCountNumber: increment(delta)
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `channels/${channelId}`);
  }
}

// ================= COMMENT MUTATIONS =================

export async function postComment(
  videoId: string,
  commentData: {
    text: string;
    userName: string;
    userAvatar: string;
    userId: string;
    isOwner?: boolean;
  }
): Promise<string> {
  try {
    const commentId = `c_${Date.now()}`;
    await setDoc(doc(db, 'comments', commentId), {
      id: commentId,
      videoId,
      author: {
        name: commentData.userName,
        avatarUrl: commentData.userAvatar,
        userId: commentData.userId,
        isOwner: commentData.isOwner || false
      },
      text: commentData.text,
      timestamp: new Date().toISOString(),
      likes: 0,
      status: 'active'
    });

    // Increment video comment count
    await updateDoc(doc(db, 'videos', videoId), {
      commentsCount: increment(1)
    });

    return commentId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'comments');
    throw err;
  }
}

export async function updateCommentStatus(commentId: string, status: 'active' | 'flagged' | 'removed'): Promise<void> {
  try {
    await updateDoc(doc(db, 'comments', commentId), { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `comments/${commentId}`);
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'comments', commentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `comments/${commentId}`);
  }
}

// ================= ETHIOPIAN BIRR PAYMENT INTEGRATIONS =================

export async function createPaymentTransaction(
  tx: Omit<PaymentTransaction, 'id' | 'createdAt' | 'status'>
): Promise<PaymentTransaction> {
  try {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullTx: PaymentTransaction = {
      ...tx,
      id,
      status: 'pending',
      currency: 'ETB',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'transactions', id), fullTx);
    return fullTx;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'transactions');
    throw err;
  }
}

export async function verifyAndCompletePayment(
  transactionId: string,
  providerReference?: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'transactions', transactionId), {
      status: 'successful',
      verifiedAt: new Date().toISOString(),
      referenceNumber: providerReference || `VERIFIED_${Date.now()}`
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `transactions/${transactionId}`);
    throw err;
  }
}

// ================= ADMIN & MODERATION =================

export async function logPlatformActivity(adminEmail: string, action: string, details: string): Promise<void> {
  try {
    await addDoc(collection(db, 'activityLogs'), {
      adminEmail,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.debug('Activity log notice:', err);
  }
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), { role }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    throw err;
  }
}

export async function fileReport(report: Omit<ReportItem, 'id' | 'createdAt' | 'status'>): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'reports'), {
      ...report,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return ref.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'reports');
    throw err;
  }
}

export async function resolveReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  try {
    await updateDoc(doc(db, 'reports', reportId), { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `reports/${reportId}`);
  }
}

export async function sendBroadcastNotification(title: string, message: string, videoId?: string): Promise<void> {
  try {
    const notifId = `notif_${Date.now()}`;
    await setDoc(doc(db, 'notifications', notifId), {
      id: notifId,
      title,
      message,
      time: 'Just now',
      read: false,
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      videoId: videoId || '',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'notifications');
  }
}

export async function savePlatformSettings(settings: PlatformSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'platformSettings', 'global'), settings);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'platformSettings/global');
    throw err;
  }
}

export async function recordVideoPurchase(
  purchaseData: Partial<VideoPurchase> & {
    userId: string;
    userEmail: string;
    videoId: string;
    videoTitle: string;
    amount: number;
    currency: 'ETB';
    provider: 'telebirr' | 'cbe_birr' | 'chapa';
    transactionReference: string;
  }
): Promise<VideoPurchase> {
  try {
    const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();
    const fullPurchase: VideoPurchase = {
      id: purchaseId,
      purchaseId,
      userId: purchaseData.userId,
      userEmail: purchaseData.userEmail,
      videoId: purchaseData.videoId,
      videoTitle: purchaseData.videoTitle,
      videoThumbnail: purchaseData.videoThumbnail,
      amount: purchaseData.amount,
      currency: 'ETB',
      provider: purchaseData.provider,
      paymentProvider: purchaseData.provider,
      transactionReference: purchaseData.transactionReference,
      status: 'verified',
      paymentStatus: 'successful',
      purchasedAt: nowIso,
      createdAt: nowIso,
      telebirrMerchantNumber: '0913767842',
      merchantNumber: '0913767842',
      userContactPhone: purchaseData.userContactPhone || '0913767842',
      notes: purchaseData.notes
    };
    await setDoc(doc(db, 'videoPurchases', purchaseId), fullPurchase);
    return fullPurchase;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'videoPurchases');
    throw err;
  }
}

export async function verifyVideoPurchase(
  purchaseId: string,
  adminEmail: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'videoPurchases', purchaseId), {
      paymentStatus: 'successful',
      verifiedAt: new Date().toISOString()
    });
    await logPlatformActivity(
      adminEmail,
      'PURCHASE_VERIFIED',
      `Verified payment for purchase ID: ${purchaseId}`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `videoPurchases/${purchaseId}`);
    throw err;
  }
}

export async function refundVideoPurchase(
  purchaseId: string,
  adminEmail: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'videoPurchases', purchaseId), {
      paymentStatus: 'refunded'
    });
    await logPlatformActivity(
      adminEmail,
      'PURCHASE_REFUNDED',
      `Issued refund for purchase ID: ${purchaseId}`
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `videoPurchases/${purchaseId}`);
    throw err;
  }
}

export async function updateVideoAccessType(
  videoId: string,
  accessType: VideoAccessType,
  price: number
): Promise<void> {
  try {
    await updateDoc(doc(db, 'videos', videoId), {
      accessType,
      price,
      isPremium: accessType === 'pro',
      currency: 'ETB',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `videos/${videoId}`);
    throw err;
  }
}
