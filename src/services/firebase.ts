import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  addDoc,
  getDocs
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { PlatformSettings, CategoryItem } from '../types';
import {
  INITIAL_VIDEOS,
  INITIAL_CHANNELS,
  INITIAL_SHORTS,
  INITIAL_PLAYLISTS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as Record<string, string>);
const configuredApiKey = (env.VITE_FIREBASE_API_KEY || '').trim();

export const isFirebaseApiKeyConfigured = Boolean(configuredApiKey);

export const firebaseConfig = {
  apiKey: configuredApiKey || 'MISSING_VITE_FIREBASE_API_KEY',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'svtech-meddia.firebaseapp.com',
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || 'https://svtech-meddia-default-rtdb.firebaseio.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'svtech-meddia',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'svtech-meddia.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '73334221451',
  appId: env.VITE_FIREBASE_APP_ID || '1:73334221451:web:1bb2cbb50d5a1756b8428e',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-0R7V6C5JS8'
};

// Initialize Firebase for svtech-meddia without inventing any custom database ID
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

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

export async function testConnection() {
  if (!isFirebaseApiKeyConfigured) {
    console.warn('VITE_FIREBASE_API_KEY is not set. Configure .env for live svtech-meddia Firebase requests.');
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-all', name: 'All', nameAm: 'ሁሉም', slug: 'all' },
  { id: 'cat-animation', name: 'Animation', nameAm: 'አኒሜሽን', slug: 'animation' },
  { id: 'cat-scifi', name: 'Sci-Fi', nameAm: 'ሳይንስ', slug: 'sci-fi' },
  { id: 'cat-gaming', name: 'Gaming', nameAm: 'ጨዋታዎች', slug: 'gaming' },
  { id: 'cat-tech', name: 'Tech', nameAm: 'ቴክኖሎጂ', slug: 'tech' },
  { id: 'cat-automotive', name: 'Automotive', nameAm: 'መኪና እና ቴክኖሎጂ', slug: 'automotive' },
  { id: 'cat-travel', name: 'Travel', nameAm: 'ጉዞ እና ባህል', slug: 'travel' },
  { id: 'cat-coding', name: 'Coding', nameAm: 'ፕሮግራሚንግ', slug: 'coding' },
  { id: 'cat-music', name: 'Music', nameAm: 'ሙዚቃ', slug: 'music' }
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
  telebirrMerchantId: '0913767842',
  allowPublicDownloads: true,
  defaultLanguage: 'en',
  featuredBannerEnabled: false,
  featuredBannerTitle: '',
  featuredBannerText: '',
  featuredBannerVideoId: ''
};

export async function initializeFirestoreDatabase(adminEmail: string) {
  if (!isFirebaseApiKeyConfigured) return;
  try {
    const videoSnap = await getDocs(collection(db, 'videos'));
    if (videoSnap.empty) {
      for (const ch of INITIAL_CHANNELS) {
        await setDoc(doc(db, 'channels', ch.id), {
          ...ch,
          isFeatured: true
        });
      }

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

      for (const sh of INITIAL_SHORTS) {
        await setDoc(doc(db, 'shorts', sh.id), {
          ...sh,
          channelId: sh.channel.id,
          isFeatured: true,
          createdAt: new Date().toISOString()
        });
      }

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

      for (const pl of INITIAL_PLAYLISTS) {
        await setDoc(doc(db, 'playlists', pl.id), {
          ...pl,
          createdAt: new Date().toISOString()
        });
      }

      for (const notif of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, 'notifications', notif.id), {
          ...notif,
          createdAt: new Date().toISOString()
        });
      }

      await setDoc(doc(db, 'platformSettings', 'global'), DEFAULT_SETTINGS);

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
