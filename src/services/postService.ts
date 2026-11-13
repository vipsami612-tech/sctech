import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { toMillis } from './domainHelpers';
import {
  CategoryItem,
  CommunityPost,
  CreatorApplication,
  HistoryItem,
  ShortComment,
  WatchHistoryDoc
} from '../types';

// ================= COMMUNITY POSTS =================

export function subscribeToCommunityPosts(callback: (posts: CommunityPost[]) => void) {
  return onSnapshot(
    collection(db, 'posts'),
    snapshot => {
      const items = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as CommunityPost[];
      items.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      callback(items);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    }
  );
}

export async function createCommunityPostInFirestore(
  payload: Omit<CommunityPost, 'id' | 'likes' | 'likedBy' | 'createdAt'>
): Promise<CommunityPost> {
  const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const post: CommunityPost = {
    id,
    ...payload,
    likes: 0,
    likedBy: [],
    createdAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'posts', id), post);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `posts/${id}`);
  }
  return post;
}

export async function toggleCommunityPostLikeInFirestore(
  postId: string,
  userId: string,
  alreadyLiked: boolean
): Promise<void> {
  try {
    await updateDoc(doc(db, 'posts', postId), {
      likes: increment(alreadyLiked ? -1 : 1),
      likedBy: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
  }
}

export async function deleteCommunityPostInFirestore(postId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `posts/${postId}`);
  }
}

// ================= SHORT COMMENTS =================

export function subscribeToShortComments(
  shortId: string,
  callback: (comments: ShortComment[]) => void
) {
  const q = query(collection(db, 'shortComments'), where('shortId', '==', shortId));
  return onSnapshot(
    q,
    snapshot => {
      const items = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as ShortComment[];
      items.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      callback(items);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, `shortComments/${shortId}`);
    }
  );
}

export async function addShortCommentInFirestore(payload: {
  shortId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
}): Promise<ShortComment> {
  const id = `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const comment: ShortComment = {
    id,
    shortId: payload.shortId,
    userId: payload.userId,
    userName: payload.userName,
    userAvatar: payload.userAvatar || '',
    text: payload.text.trim(),
    createdAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'shortComments', id), comment);
    await updateDoc(doc(db, 'shorts', payload.shortId), {
      commentsCount: increment(1)
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `shortComments/${id}`);
  }
  return comment;
}

// ================= CREATOR APPLICATIONS =================

export function subscribeToCreatorApplications(
  callback: (apps: CreatorApplication[]) => void,
  filterUid?: string
) {
  const ref = filterUid
    ? query(collection(db, 'creatorApplications'), where('uid', '==', filterUid))
    : collection(db, 'creatorApplications');

  return onSnapshot(
    ref,
    snapshot => {
      const items = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as CreatorApplication[];
      items.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      callback(items);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'creatorApplications');
    }
  );
}

export async function submitCreatorApplicationInFirestore(payload: {
  uid: string;
  email: string;
  displayName: string;
  channelName: string;
  channelHandle: string;
  category: string;
  bio: string;
}): Promise<CreatorApplication> {
  const id = `app_${payload.uid}_${Date.now()}`;
  const docData: CreatorApplication = {
    id,
    ...payload,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'creatorApplications', id), docData);
    await updateDoc(doc(db, 'users', payload.uid), {
      creatorStatus: 'pending'
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `creatorApplications/${id}`);
  }
  return docData;
}

// ================= USER WATCH HISTORY =================

export function subscribeToUserWatchHistory(
  uid: string,
  callback: (items: HistoryItem[]) => void
) {
  return onSnapshot(
    collection(db, 'users', uid, 'watchHistory'),
    snapshot => {
      const items = snapshot.docs.map(d => {
        const data = d.data() as WatchHistoryDoc;
        const ms = toMillis(data.updatedAt);
        return {
          videoId: data.videoId || d.id,
          progressPercent: data.progressPercent || 0,
          lastPositionSec: data.lastPositionSec || 0,
          updatedAt: data.updatedAt,
          watchedAt: ms ? new Date(ms).toLocaleDateString() : 'Recently'
        } as HistoryItem;
      });
      items.sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt));
      callback(items);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, `users/${uid}/watchHistory`);
    }
  );
}

export async function upsertUserWatchHistory(
  uid: string,
  item: { videoId: string; progressPercent: number; lastPositionSec: number }
): Promise<void> {
  try {
    const payload: WatchHistoryDoc = {
      videoId: item.videoId,
      progressPercent: Math.max(0, Math.min(100, Math.round(item.progressPercent))),
      lastPositionSec: Math.max(0, Math.round(item.lastPositionSec)),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', uid, 'watchHistory', item.videoId), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${uid}/watchHistory/${item.videoId}`);
  }
}

export async function removeUserWatchHistoryItem(uid: string, videoId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid, 'watchHistory', videoId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${uid}/watchHistory/${videoId}`);
  }
}

// ================= CATEGORIES =================

export function subscribeToCategories(callback: (categories: CategoryItem[]) => void) {
  return onSnapshot(
    collection(db, 'categories'),
    snapshot => {
      const cats = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as CategoryItem[];
      callback(cats);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    }
  );
}

export async function saveCategoryInFirestore(cat: CategoryItem): Promise<void> {
  try {
    await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `categories/${cat.id}`);
    throw err;
  }
}

export async function deleteCategoryInFirestore(catId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', catId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `categories/${catId}`);
    throw err;
  }
}
