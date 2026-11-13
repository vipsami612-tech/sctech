import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  increment,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { toMillis } from './domainHelpers';
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
  VideoPurchase,
  VideoAccessType,
  ReactionType,
  LiveReaction,
  EngagementEvent
} from '../types';

export { toMillis };

/**
 * Real-time listener for Videos collection
 */
export function subscribeToVideos(callback: (videos: Video[]) => void) {
  return onSnapshot(
    collection(db, 'videos'),
    snapshot => {
      const vids = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Video[];
      vids.sort((a, b) => {
        const timeA = toMillis(a.createdAt) || toMillis(a.uploadDate);
        const timeB = toMillis(b.createdAt) || toMillis(b.uploadDate);
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
      shs.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
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

export async function savePlaylistToFirestore(playlist: Playlist): Promise<void> {
  try {
    await setDoc(doc(db, 'playlists', playlist.id), playlist, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `playlists/${playlist.id}`);
  }
}

export async function deletePlaylistFromFirestore(playlistId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'playlists', playlistId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `playlists/${playlistId}`);
  }
}

/**
 * Real-time listener for Comments on a specific video
 */
export function subscribeToVideoComments(
  videoId: string,
  callback: (comments: Comment[]) => void
) {
  const q = query(collection(db, 'comments'), where('videoId', '==', videoId));
  return onSnapshot(
    q,
    snapshot => {
      const cmts = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Comment[];
      cmts.sort((a, b) => toMillis(b.timestamp) - toMillis(a.timestamp));
      callback(cmts);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, `comments/${videoId}`);
    }
  );
}

export function subscribeToAllComments(callback: (comments: Comment[]) => void) {
  return onSnapshot(
    collection(db, 'comments'),
    snapshot => {
      const cmts = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Comment[];
      cmts.sort((a, b) => toMillis(b.timestamp) - toMillis(a.timestamp));
      callback(cmts);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'comments');
    }
  );
}

export function subscribeToNotifications(callback: (notifs: NotificationItem[]) => void) {
  return onSnapshot(
    collection(db, 'notifications'),
    snapshot => {
      const notifs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as NotificationItem[];
      notifs.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      callback(notifs);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    }
  );
}

export function subscribeToReports(callback: (reports: ReportItem[]) => void) {
  return onSnapshot(
    collection(db, 'reports'),
    snapshot => {
      const reps = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as ReportItem[];
      reps.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      callback(reps);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
    }
  );
}

export function subscribeToActivityLogs(callback: (logs: ActivityLog[]) => void) {
  return onSnapshot(
    collection(db, 'activityLogs'),
    snapshot => {
      const lgs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as ActivityLog[];
      lgs.sort((a, b) => toMillis(b.timestamp) - toMillis(a.timestamp));
      callback(lgs);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'activityLogs');
    }
  );
}

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

export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
) {
  return onSnapshot(
    doc(db, 'users', uid),
    snapshot => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      callback({
        uid: snapshot.id,
        ...snapshot.data()
      } as UserProfile);
    },
    error => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  );
}

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

export function subscribeToTransactions(callback: (transactions: PaymentTransaction[]) => void) {
  return onSnapshot(
    collection(db, 'transactions'),
    snapshot => {
      const txs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as PaymentTransaction[];
      txs.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      callback(txs);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    }
  );
}

export function subscribeToUserTransactions(
  uid: string,
  callback: (transactions: PaymentTransaction[]) => void
) {
  const q = query(collection(db, 'transactions'), where('userId', '==', uid));
  return onSnapshot(
    q,
    snapshot => {
      const txs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as PaymentTransaction[];
      txs.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      callback(txs);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, `transactions/${uid}`);
    }
  );
}

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
        const timeB = toMillis(b.createdAt) || toMillis(b.purchasedAt);
        const timeA = toMillis(a.createdAt) || toMillis(a.purchasedAt);
        return timeB - timeA;
      });
      callback(purches);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'videoPurchases');
    }
  );
}

export function subscribeToUserVideoPurchases(
  uid: string,
  callback: (purchases: VideoPurchase[]) => void
) {
  const q = query(collection(db, 'videoPurchases'), where('userId', '==', uid));
  return onSnapshot(
    q,
    snapshot => {
      const purches = snapshot.docs.map(d => ({
        id: d.id,
        purchaseId: d.id,
        ...d.data()
      })) as VideoPurchase[];
      purches.sort((a, b) => {
        const timeB = toMillis(b.createdAt) || toMillis(b.purchasedAt);
        const timeA = toMillis(a.createdAt) || toMillis(a.purchasedAt);
        return timeB - timeA;
      });
      callback(purches);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, `videoPurchases/${uid}`);
    }
  );
}

export function subscribeToLiveReactions(
  videoId: string,
  callback: (reactions: LiveReaction[]) => void
) {
  const q = query(collection(db, 'liveReactions'), where('videoId', '==', videoId));
  return onSnapshot(
    q,
    snapshot => {
      const items = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as LiveReaction[];
      items.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      callback(items);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, `liveReactions/${videoId}`);
    }
  );
}

export function subscribeToEngagementEvents24h(
  callback: (events: EngagementEvent[]) => void
) {
  return onSnapshot(
    collection(db, 'engagementEvents'),
    snapshot => {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      const items = snapshot.docs
        .map(d => ({
          id: d.id,
          ...d.data()
        }))
        .filter((ev: any) => {
          const ts = toMillis(ev.createdAt);
          return ts > 0 && ts >= cutoff;
        }) as EngagementEvent[];
      items.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      callback(items);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'engagementEvents');
    }
  );
}

// ================= VIDEO MUTATIONS =================

export async function createOrUpdateVideo(
  videoData: Partial<Video> & { id?: string }
): Promise<string> {
  try {
    const videoId = videoData.id || `video_${Date.now()}`;
    const rawPayload: Record<string, any> = {
      ...videoData,
      id: videoId,
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
      rawPayload.createdAt = new Date().toISOString();
    }
    const payload = Object.fromEntries(
      Object.entries(rawPayload).filter(([, value]) => value !== undefined)
    );

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

async function writeEngagementEventIfSignedIn(
  videoId: string,
  type: EngagementEvent['type']
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  try {
    const eventId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const eventDoc: EngagementEvent = {
      id: eventId,
      videoId,
      type,
      userId: uid,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'engagementEvents', eventId), eventDoc);
  } catch (err) {
    console.debug('Engagement event notice:', err);
  }
}

export async function incrementVideoViews(videoId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'videos', videoId), {
      views: increment(1),
      views24h: increment(1),
      lastEngagedAt: new Date().toISOString()
    });
    await writeEngagementEventIfSignedIn(videoId, 'view');
  } catch (err) {
    console.debug('View increment notice:', err);
  }
}

export async function updateVideoLikes(
  videoId: string,
  delta: number
): Promise<void> {
  try {
    const updatePayload: Record<string, any> = {
      likes: increment(delta),
      lastEngagedAt: new Date().toISOString()
    };
    if (delta > 0) {
      updatePayload.likes24h = increment(delta);
    }
    await updateDoc(doc(db, 'videos', videoId), updatePayload);
    if (delta > 0) {
      await writeEngagementEventIfSignedIn(videoId, 'like');
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `videos/${videoId}`);
  }
}

export async function incrementVideoShares(videoId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'videos', videoId), {
      shares24h: increment(1),
      lastEngagedAt: new Date().toISOString()
    });
    await writeEngagementEventIfSignedIn(videoId, 'share');
  } catch (err) {
    console.debug('Share increment notice:', err);
  }
}

export async function sendLiveReaction(payload: {
  videoId: string;
  emoji: string;
  type: ReactionType;
  userId: string;
  userName: string;
  videoTime: number;
}): Promise<LiveReaction> {
  const nowIso = new Date().toISOString();
  const reactionId = `react_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const signedUid = auth.currentUser?.uid;
  const reaction: LiveReaction = {
    id: reactionId,
    videoId: payload.videoId,
    emoji: payload.emoji,
    type: payload.type,
    userId: signedUid || payload.userId || 'guest',
    userName: payload.userName || 'Viewer',
    videoTime: Number.isFinite(payload.videoTime) ? Math.max(0, Math.round(payload.videoTime)) : 0,
    createdAt: nowIso
  };

  if (signedUid) {
    try {
      await setDoc(doc(db, 'liveReactions', reactionId), reaction);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `liveReactions/${reactionId}`);
    }
  }

  try {
    await updateDoc(doc(db, 'videos', payload.videoId), {
      reactionsCount: increment(1),
      reactions24h: increment(1),
      lastEngagedAt: nowIso
    });
    await writeEngagementEventIfSignedIn(payload.videoId, 'reaction');
  } catch (err) {
    console.debug('Video reaction counter notice:', err);
  }

  return reaction;
}

// ================= SHORTS MUTATIONS =================

export async function createShort(shortData: Partial<ShortItem>): Promise<string> {
  try {
    const shortId = shortData.id || `short_${Date.now()}`;
    const rawPayload: Record<string, any> = {
      ...shortData,
      id: shortId,
      likes: shortData.likes ?? 0,
      commentsCount: shortData.commentsCount ?? 0,
      createdAt: shortData.createdAt || new Date().toISOString()
    };
    const payload = Object.fromEntries(
      Object.entries(rawPayload).filter(([, value]) => value !== undefined)
    );
    await setDoc(doc(db, 'shorts', shortId), payload, { merge: true });
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

    await updateDoc(doc(db, 'videos', videoId), {
      commentsCount: increment(1),
      comments24h: increment(1),
      lastEngagedAt: new Date().toISOString()
    });
    await writeEngagementEventIfSignedIn(videoId, 'comment');

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

export async function createOrSyncUserProfile(profile: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', profile.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        photoURL: profile.photoURL || '',
        role: profile.role,
        channelId: profile.channelId || `ch_${profile.uid.slice(0, 10)}`,
        creatorStatus: profile.creatorStatus || 'none',
        emailVerified: Boolean(profile.emailVerified),
        createdAt: profile.createdAt || new Date().toISOString()
      });
    } else {
      await updateDoc(userRef, {
        email: profile.email,
        displayName: profile.displayName,
        ...(profile.photoURL ? { photoURL: profile.photoURL } : {})
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`);
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

export async function updateUserBanStatus(uid: string, isBanned: boolean): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), { isBanned }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    throw err;
  }
}

export async function reviewCreatorApplicationInFirestore(params: {
  appId: string;
  targetUid: string;
  status: 'approved' | 'rejected';
  reviewerEmail: string;
  notes?: string;
  channelName: string;
  channelHandle: string;
  bio: string;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  try {
    await updateDoc(doc(db, 'creatorApplications', params.appId), {
      status: params.status,
      reviewedBy: params.reviewerEmail,
      reviewNotes: params.notes || '',
      reviewedAt: nowIso
    });
    if (params.status === 'approved') {
      const chId = `ch_${params.targetUid.slice(0, 10)}`;
      await setDoc(
        doc(db, 'users', params.targetUid),
        { role: 'creator', creatorStatus: 'approved', channelId: chId },
        { merge: true }
      );
      await setDoc(
        doc(db, 'channels', chId),
        {
          id: chId,
          name: params.channelName,
          handle: params.channelHandle,
          description: params.bio,
          ownerUid: params.targetUid,
          verified: true,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
          subscribers: '1',
          subscriberCountNumber: 1,
          joinedDate: new Date().toLocaleDateString(),
          totalViews: '0',
          videosCount: 0
        },
        { merge: true }
      );
    } else {
      await setDoc(
        doc(db, 'users', params.targetUid),
        { creatorStatus: 'rejected' },
        { merge: true }
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `creatorApplications/${params.appId}`);
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
      status: 'pending',
      paymentStatus: 'pending',
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
      status: 'verified',
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
      status: 'refunded',
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
