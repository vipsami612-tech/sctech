export const ALLOWED_THUMBNAIL_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
] as const;

export const ALLOWED_THUMBNAIL_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;

export function isPlaceholderSvgUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const normalized = url.trim().toLowerCase();
  return (
    normalized.startsWith('data:image/svg+xml') ||
    normalized.includes('svtech media original')
  );
}

export function validateThumbnailFile(
  file: File,
  maxSizeMB = 10
): { valid: boolean; error?: string } {
  if (!file || file.size === 0) {
    return { valid: false, error: 'Selected image file is empty.' };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Thumbnail size exceeds maximum limit of ${maxSizeMB} MB.`
    };
  }

  const lowerName = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_THUMBNAIL_EXTENSIONS.some(ext => lowerName.endsWith(ext));
  const mime = (file.type || '').toLowerCase();
  const hasAllowedMime = (ALLOWED_THUMBNAIL_MIME_TYPES as readonly string[]).includes(mime);

  if (!hasAllowedMime && !hasAllowedExt) {
    return {
      valid: false,
      error: 'Unsupported image format. Please choose a JPG, JPEG, PNG, or WebP image.'
    };
  }

  if (mime === 'image/svg+xml' || lowerName.endsWith('.svg')) {
    return {
      valid: false,
      error: 'SVG files are not allowed as video thumbnails. Use JPG, JPEG, PNG, or WebP.'
    };
  }

  return { valid: true };
}

export function validateThumbnailUrlFormat(url: string): { valid: boolean; error?: string } {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter an image URL.' };
  }
  if (isPlaceholderSvgUrl(trimmed)) {
    return { valid: false, error: 'SVG placeholder data URIs cannot be used as video thumbnails.' };
  }
  if (trimmed.startsWith('blob:')) {
    return {
      valid: false,
      error: 'Temporary blob URLs cannot be saved directly. Upload the image file or paste an HTTPS URL.'
    };
  }
  if (trimmed.startsWith('data:image/')) {
    const isRaster = /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(trimmed);
    return isRaster
      ? { valid: true }
      : { valid: false, error: 'Only JPG, JPEG, PNG, or WebP image URLs are supported.' };
  }
  if (trimmed.startsWith('/thumbnails/') || trimmed.startsWith('/assets/')) {
    return { valid: true };
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, error: 'Image URL must start with https:// or http://.' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid image URL format.' };
  }
}

export function verifyImageUrlLoads(
  url: string,
  timeoutMs = 7000
): Promise<{ ok: boolean; width?: number; height?: number; error?: string }> {
  const formatCheck = validateThumbnailUrlFormat(url);
  if (!formatCheck.valid) {
    return Promise.resolve({ ok: false, error: formatCheck.error });
  }

  return new Promise(resolve => {
    const img = new window.Image();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve({ ok: false, error: 'Timed out while trying to load the thumbnail image URL.' });
      }
    }, timeoutMs);

    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        resolve({ ok: false, error: 'Image loaded with invalid dimensions (0x0).' });
      } else {
        resolve({ ok: true, width: img.naturalWidth, height: img.naturalHeight });
      }
    };
    img.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        ok: false,
        error: 'Unable to load image from this URL. Check that the link is public and points directly to an image.'
      });
    };
    img.src = url.trim();
  });
}

export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const rounded = Math.floor(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function probeVideoSource(
  sourceUrl: string,
  timeoutMs = 10000
): Promise<{ duration: number; durationFormatted: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    let settled = false;

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        reject(new Error('Timed out reading video metadata.'));
      }
    }, timeoutMs);

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    if (/^https?:\/\//i.test(sourceUrl)) {
      video.crossOrigin = 'anonymous';
    }

    video.onloadedmetadata = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? Math.round(video.duration) : 0;
      const result = {
        duration,
        durationFormatted: formatDuration(duration),
        width: video.videoWidth || 1280,
        height: video.videoHeight || 720
      };
      cleanup();
      resolve(result);
    };

    video.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      reject(new Error('Could not read video metadata from this source.'));
    };

    video.src = sourceUrl;
  });
}

export interface ExtractedFrameResult {
  file: File;
  previewDataUrl: string;
  duration: number;
  durationFormatted: string;
  width: number;
  height: number;
}

export function extractVideoFrame(params: {
  sourceUrl: string;
  timestampSec?: number;
  targetWidth?: number;
  targetHeight?: number;
  quality?: number;
  timeoutMs?: number;
}): Promise<ExtractedFrameResult> {
  const {
    sourceUrl,
    timestampSec = 1,
    targetWidth = 1280,
    targetHeight = 720,
    quality = 0.9,
    timeoutMs = 15000
  } = params;

  return new Promise((resolve, reject) => {
    if (!sourceUrl) {
      reject(new Error('Select a local video file or enter a video URL first.'));
      return;
    }

    const video = document.createElement('video');
    let settled = false;

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      reject(new Error(message));
    };

    const timer = setTimeout(() => {
      fail('Frame extraction timed out. Verify the video format (MP4/WebM) or upload a cover image instead.');
    }, timeoutMs);

    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    if (/^https?:\/\//i.test(sourceUrl)) {
      video.crossOrigin = 'anonymous';
    }

    video.onloadedmetadata = () => {
      if (settled) return;
      const rawDur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      const safeTarget =
        rawDur > 0
          ? Math.max(0, Math.min(Math.max(0, rawDur - 0.1), timestampSec))
          : 0;
      try {
        video.currentTime = safeTarget;
      } catch {
        fail('Browser could not seek to the requested timestamp.');
      }
    };

    video.onseeked = () => {
      if (settled) return;
      try {
        const vw = video.videoWidth || targetWidth;
        const vh = video.videoHeight || targetHeight;
        if (vw === 0 || vh === 0) {
          fail('No decodable video frame found for this file.');
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          fail('Canvas 2D context is unavailable in this browser.');
          return;
        }

        // Cover-crop onto clean 16:9 canvas so output is consistently 16:9
        const sourceAspect = vw / vh;
        const targetAspect = targetWidth / targetHeight;
        let sx = 0;
        let sy = 0;
        let sWidth = vw;
        let sHeight = vh;

        if (sourceAspect > targetAspect) {
          sWidth = vh * targetAspect;
          sx = (vw - sWidth) / 2;
        } else if (sourceAspect < targetAspect) {
          sHeight = vw / targetAspect;
          sy = (vh - sHeight) / 2;
        }

        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

        let previewDataUrl = '';
        try {
          previewDataUrl = canvas.toDataURL('image/jpeg', quality);
        } catch {
          fail(
            'This remote video server blocks CORS pixel extraction. Upload a local MP4/WebM file or upload/paste a cover image instead.'
          );
          return;
        }

        canvas.toBlob(
          blob => {
            if (settled) return;
            if (!blob) {
              fail('Failed to encode captured video frame as JPEG.');
              return;
            }
            settled = true;
            clearTimeout(timer);
            const rawDur = Number.isFinite(video.duration) && video.duration > 0 ? Math.round(video.duration) : 0;
            const file = new File([blob], `frame_${Math.round(video.currentTime)}s_${Date.now()}.jpg`, {
              type: 'image/jpeg'
            });
            cleanup();
            resolve({
              file,
              previewDataUrl,
              duration: rawDur,
              durationFormatted: formatDuration(rawDur),
              width: targetWidth,
              height: targetHeight
            });
          },
          'image/jpeg',
          quality
        );
      } catch {
        fail(
          'Could not extract frame from this video due to browser security or codec restrictions. Please upload or paste a real cover image.'
        );
      }
    };

    video.onerror = () => {
      fail('Failed to load video stream for frame extraction. Ensure MP4 or WebM format.');
    };

    video.src = sourceUrl;
  });
}
