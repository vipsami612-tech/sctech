import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
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
  CategoryItem
} from '../types';
import {
  INITIAL_VIDEOS,
  INITIAL_CHANNELS,
  INITIAL_SHORTS,
  INITIAL_PLAYLISTS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL per Firebase Skill: Pass firestoreDatabaseId explicitly
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handling conforming to Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    providerInfo?: { providerId?: string | null; email?: string | null }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
}

// Connection test per SKILL.md
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}

// Default Platform Categories
export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-all', name: 'All', slug: 'all' },
  { id: 'cat-animation', name: 'Animation', slug: 'animation' },
  { id: 'cat-scifi', name: 'Sci-Fi', slug: 'sci-fi' },
  { id: 'cat-gaming', name: 'Gaming', slug: 'gaming' },
  { id: 'cat-tech', name: 'Tech', slug: 'tech' },
  { id: 'cat-automotive', name: 'Automotive', slug: 'automotive' },
  { id: 'cat-travel', name: 'Travel', slug: 'travel' },
  { id: 'cat-coding', name: 'Coding', slug: 'coding' },
  { id: 'cat-music', name: 'Music', slug: 'music' }
];

export const DEFAULT_SETTINGS: PlatformSettings = {
  siteName: 'SVTech Media',
  tagline: 'Watch • Create • Share • Connect',
  allowPublicUploads: true,
  requireApproval: false,
  maintenanceMode: false,
  maxUploadSizeMB: 500,
  publishingFeeETB: 100,
  allowFreeCreatorUploads: false,
  proPlanMonthlyETB: 500,
  enabledPaymentProviders: ['telebirr', 'cbe_birr', 'chapa'],
  allowPublicDownloads: true,
  defaultLanguage: 'en'
};

/**
 * Initialize Firestore data if collections are empty so SVTech Media is populated immediately.
 */
export async function initializeFirestoreDatabase(adminEmail: string) {
  try {
    const videoSnap = await getDocs(collection(db, 'videos'));
    if (videoSnap.empty) {
      console.log('Seeding initial SVTech Media catalog to Firestore...');

      // Seed Channels
      for (const ch of INITIAL_CHANNELS) {
        await setDoc(doc(db, 'channels', ch.id), {
          ...ch,
          isFeatured: true
        });
      }

      // Seed Videos
      for (const vid of INITIAL_VIDEOS) {
        await setDoc(doc(db, 'videos', vid.id), {
          ...vid,
          status: 'published',
          visibility: 'public',
          isFeatured: vid.views > 800000,
          channelId: vid.channel.id,
          createdAt: new Date().toISOString()
        });
      }

      // Seed Shorts
      for (const sh of INITIAL_SHORTS) {
        await setDoc(doc(db, 'shorts', sh.id), {
          ...sh,
          channelId: sh.channel.id,
          isFeatured: true,
          createdAt: new Date().toISOString()
        });
      }

      // Seed Comments
      for (const [vId, cList] of Object.entries(INITIAL_COMMENTS)) {
        for (const c of cList) {
          await setDoc(doc(db, 'comments', c.id), {
            ...c,
            videoId: vId,
            status: 'active',
            createdAt: new Date().toISOString()
          });
        }
      }

      // Seed Playlists
      for (const pl of INITIAL_PLAYLISTS) {
        await setDoc(doc(db, 'playlists', pl.id), {
          ...pl,
          createdAt: new Date().toISOString()
        });
      }

      // Seed Notifications
      for (const notif of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, 'notifications', notif.id), {
          ...notif,
          createdAt: new Date().toISOString()
        });
      }

      // Seed Platform Settings
      await setDoc(doc(db, 'platformSettings', 'global'), DEFAULT_SETTINGS);

      // Seed First Activity Log
      await addDoc(collection(db, 'activityLogs'), {
        adminEmail,
        action: 'PLATFORM_INITIALIZED',
        details: 'SVTech Media production catalog and services initialized.',
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Database bootstrap notice:', err);
  }
}
