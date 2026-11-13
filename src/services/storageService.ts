import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseApiKeyConfigured } from './firebase';
import { validateThumbnailFile } from './thumbnailService';

export type StorageFolder = 'videos' | 'thumbnails' | 'avatars' | 'banners' | 'posts';

export function validateUploadFile(
  file: File,
  kind: 'video' | 'image' | 'thumbnail',
  maxSizeMB = kind === 'video' ? 500 : 10
): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${maxSizeMB} MB.`
    };
  }
  if (kind === 'video' && !file.type.startsWith('video/')) {
    return { valid: false, error: 'Please select a valid video file.' };
  }
  if (kind === 'thumbnail') {
    return validateThumbnailFile(file, maxSizeMB);
  }
  if (kind === 'image' && !file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file.' };
  }
  return { valid: true };
}

export function uploadFileWithPathToStorage(params: {
  file: File;
  folder: StorageFolder;
  uid: string;
  onProgress?: (percent: number) => void;
}): Promise<{ url: string; storagePath: string }> {
  const { file, folder, uid, onProgress } = params;

  if (!isFirebaseApiKeyConfigured) {
    return Promise.reject(
      new Error('Firebase Storage requires VITE_FIREBASE_API_KEY to be configured.')
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectPath = `${folder}/${uid}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, objectPath);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type || (folder === 'videos' ? 'video/mp4' : 'image/jpeg')
    });

    task.on(
      'state_changed',
      snapshot => {
        if (snapshot.totalBytes > 0 && onProgress) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
        }
      },
      error => {
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, storagePath: objectPath });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

export async function uploadFileToStorage(params: {
  file: File;
  folder: StorageFolder;
  uid: string;
  onProgress?: (percent: number) => void;
}): Promise<string> {
  const result = await uploadFileWithPathToStorage(params);
  return result.url;
}
