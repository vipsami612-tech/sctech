import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Film,
  Check,
  AlertCircle,
  FileVideo,
  Image as ImageIcon,
  Eye,
  Trash2,
  Lock,
  Play,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Camera,
  Link2,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentProvider } from '../types';
import { uploadFileWithPathToStorage, validateUploadFile } from '../services/storageService';
import { isFirebaseApiKeyConfigured } from '../services/firebase';
import { VideoThumbnail } from './VideoThumbnail';
import {
  extractVideoFrame,
  formatDuration,
  isPlaceholderSvgUrl,
  probeVideoSource,
  validateThumbnailUrlFormat,
  verifyImageUrlLoads
} from '../services/thumbnailService';

export const UploadModal: React.FC = () => {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadVideo,
    removeVideo,
    editingVideo,
    setEditingVideo,
    navigate,
    isAuthenticated,
    currentUser,
    userProfile,
    openAuthModal,
    isAdmin,
    isModerator,
    initiatePublishingPayment,
    verifyPayment,
    platformSettings,
    showToast,
    t
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tech');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tags, setTags] = useState('Tech, WebDev, 2026');
  const [status, setStatus] = useState<'published' | 'draft' | 'scheduled' | 'unlisted'>('published');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>('public');
  const [scheduledAt, setScheduledAt] = useState('');
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [accessType, setAccessType] = useState<'free' | 'pro' | 'private' | 'unlisted'>('free');
  const [videoPrice, setVideoPrice] = useState<number>(100);

  // Ethiopian Birr Payment State
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('telebirr');
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment_gate' | 'verifying' | 'paid'>('details');
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  // Upload Progress, Metadata & Thumbnail Frame Extraction state
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedThumbFile, setSelectedThumbFile] = useState<File | null>(null);
  const [thumbnailStoragePath, setThumbnailStoragePath] = useState<string | undefined>(undefined);
  const [videoStoragePath, setVideoStoragePath] = useState<string | undefined>(undefined);
  const [videoDurationSec, setVideoDurationSec] = useState<number>(0);
  const [frameTimestampSec, setFrameTimestampSec] = useState<number>(1);
  const [isExtractingFrame, setIsExtractingFrame] = useState(false);
  const [frameExtractNote, setFrameExtractNote] = useState<string | null>(null);
  const [urlCheckState, setUrlCheckState] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [urlCheckMsg, setUrlCheckMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const isStaffExempt = isAdmin || isModerator;

  const revokeLocalVideoUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      revokeLocalVideoUrl();
    };
  }, []);

  // Sync if editing an existing video
  useEffect(() => {
    setConfirmDelete(false);
    setUploadError(null);
    setSelectedVideoFile(null);
    setSelectedThumbFile(null);
    setFrameExtractNote(null);
    setUrlCheckState('idle');
    setUrlCheckMsg(null);
    revokeLocalVideoUrl();

    if (editingVideo) {
      setTitle(editingVideo.title);
      setDescription(editingVideo.description);
      setCategory(editingVideo.category);
      setVideoUrl(editingVideo.videoUrl);
      setThumbnailUrl(isPlaceholderSvgUrl(editingVideo.thumbnailUrl) ? '' : editingVideo.thumbnailUrl);
      setThumbnailStoragePath(editingVideo.thumbnailStoragePath);
      setVideoStoragePath(editingVideo.videoStoragePath);
      setVideoDurationSec(editingVideo.duration || 60);
      setFrameTimestampSec(
        editingVideo.duration && editingVideo.duration > 4 ? Math.min(3, Math.floor(editingVideo.duration * 0.2)) : 1
      );
      setTags(editingVideo.tags.join(', '));
      setStatus(editingVideo.status || 'published');
      setVisibility(editingVideo.visibility || 'public');
      setScheduledAt(editingVideo.scheduledAt || '');
      setAllowDownloads(editingVideo.allowDownloads ?? true);
      setAccessType(editingVideo.accessType || (editingVideo.isPremium ? 'pro' : 'free'));
      setVideoPrice(editingVideo.price || 100);
      setPaymentStep('paid'); // already paid or published
    } else {
      setTitle('');
      setDescription('');
      setCategory('Tech');
      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
      setThumbnailUrl('/thumbnails/video-3.jpg');
      setThumbnailStoragePath(undefined);
      setVideoStoragePath(undefined);
      setVideoDurationSec(15);
      setFrameTimestampSec(2);
      setTags('SVTech, Streaming, 2026');
      setStatus('published');
      setVisibility('public');
      setScheduledAt('');
      setAllowDownloads(true);
      setAccessType('free');
      setVideoPrice(100);
      setPaymentStep(isStaffExempt ? 'paid' : 'details');
      setActiveTransactionId(null);
      setPaymentReference(null);
      setUploadProgress(0);
      setProcessingStatus(null);
    }
  }, [editingVideo, isUploadModalOpen, isStaffExempt]);

  if (!isUploadModalOpen) return null;

  const runFrameExtraction = async (source: string, timestamp: number, markAsThumbnail: boolean) => {
    setIsExtractingFrame(true);
    setFrameExtractNote(t.upload.capturingFrame);
    setUploadError(null);
    try {
      const result = await extractVideoFrame({
        sourceUrl: source,
        timestampSec: timestamp
      });
      if (result.duration > 0) {
        setVideoDurationSec(result.duration);
      }
      if (markAsThumbnail) {
        setSelectedThumbFile(result.file);
        setThumbnailUrl(result.previewDataUrl);
        setThumbnailStoragePath(undefined);
        setUrlCheckState('idle');
        setUrlCheckMsg(null);
      }
      setFrameExtractNote(
        `Captured 16:9 frame at ${formatDuration(timestamp)} (${result.width}x${result.height})`
      );
      return true;
    } catch (err: any) {
      const msg = err?.message || 'Unable to extract video frame.';
      setFrameExtractNote(msg);
      return false;
    } finally {
      setIsExtractingFrame(false);
    }
  };

  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateUploadFile(file, 'video');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid video file.');
      showToast(validation.error || 'Invalid video file.', 'error');
      return;
    }
    setUploadError(null);
    revokeLocalVideoUrl();
    setSelectedVideoFile(file);
    setVideoStoragePath(undefined);
    const localUrl = URL.createObjectURL(file);
    objectUrlRef.current = localUrl;
    setVideoUrl(localUrl);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Read real video duration and extract initial 16:9 frame from uploaded MP4/WebM
    try {
      const meta = await probeVideoSource(localUrl);
      if (meta.duration > 0) {
        setVideoDurationSec(meta.duration);
        const suggestedTs = Math.max(0, Math.min(2, Math.floor(meta.duration * 0.2)));
        setFrameTimestampSec(suggestedTs);
        await runFrameExtraction(localUrl, suggestedTs, true);
      } else {
        await runFrameExtraction(localUrl, 1, true);
      }
    } catch {
      await runFrameExtraction(localUrl, 1, true);
    }
  };

  const handleThumbnailFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateUploadFile(file, 'thumbnail');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid thumbnail image file.');
      showToast(validation.error || 'Invalid thumbnail image file.', 'error');
      return;
    }
    setUploadError(null);
    setFrameExtractNote(null);
    setUrlCheckState('idle');
    setUrlCheckMsg(null);
    setSelectedThumbFile(file);
    setThumbnailStoragePath(undefined);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setThumbnailUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyThumbnailUrl = async () => {
    if (!thumbnailUrl.trim()) return;
    setUrlCheckState('checking');
    setUrlCheckMsg(null);
    const res = await verifyImageUrlLoads(thumbnailUrl.trim());
    if (res.ok) {
      setUrlCheckState('valid');
      setUrlCheckMsg(`${t.upload.urlVerified} (${res.width}x${res.height})`);
      setSelectedThumbFile(null);
      setThumbnailStoragePath(undefined);
    } else {
      setUrlCheckState('invalid');
      setUrlCheckMsg(res.error || 'Image URL could not be loaded.');
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailUrl('');
    setSelectedThumbFile(null);
    setThumbnailStoragePath('');
    setFrameExtractNote(null);
    setUrlCheckState('idle');
    setUrlCheckMsg(null);
  };

  // Step 1 -> Step 2: Form submit or trigger payment
  const handleProceedOrPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }
    if (!title.trim()) return;
    if (!thumbnailUrl.trim() && !selectedThumbFile) {
      const msg = 'Please upload a real cover image, paste an HTTPS image URL, or extract a video frame.';
      setUploadError(msg);
      showToast(msg, 'error');
      return;
    }
    if (!selectedThumbFile && thumbnailUrl.trim() && !thumbnailUrl.startsWith('data:image/')) {
      const fmt = validateThumbnailUrlFormat(thumbnailUrl.trim());
      if (!fmt.valid) {
        setUploadError(fmt.error || 'Invalid thumbnail URL.');
        showToast(fmt.error || 'Invalid thumbnail URL.', 'error');
        return;
      }
    }

    // If staff exempt or saving as draft, proceed to direct upload
    if (isStaffExempt || status === 'draft' || paymentStep === 'paid') {
      executePublish(activeTransactionId || undefined);
      return;
    }

    // Otherwise initiate real 100 ETB transaction
    setPaymentStep('payment_gate');
    const tx = await initiatePublishingPayment(title.trim(), selectedProvider);
    setActiveTransactionId(tx.id);
    setPaymentReference(tx.referenceNumber);
  };

  // Step 2: Confirm & Verify Payment with Provider (Telebirr, CBE Birr, Chapa)
  const handleVerifyPayment = async () => {
    if (!activeTransactionId) return;
    setPaymentStep('verifying');
    setProcessingStatus(t.upload.verifyingPayment);

    await verifyPayment(activeTransactionId);
    setPaymentStep('paid');
    setProcessingStatus(t.upload.paymentConfirmed);
    executePublish(activeTransactionId);
  };

  const executePublish = async (txId?: string) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(10);
    setProcessingStatus('Preparing media upload...');

    try {
      let resolvedVideoUrl = videoUrl.trim();
      let resolvedVideoPath = videoStoragePath;
      let resolvedThumbUrl = thumbnailUrl.trim();
      let resolvedThumbPath = thumbnailStoragePath;

      if (selectedVideoFile) {
        if (!isFirebaseApiKeyConfigured || !currentUser) {
          throw new Error(
            'Local video upload to Firebase Storage requires VITE_FIREBASE_API_KEY and an authenticated account. Configure Firebase Storage or paste a direct HTTPS stream URL.'
          );
        }
        setProcessingStatus('Uploading video stream to Firebase Storage...');
        const uploadedVideo = await uploadFileWithPathToStorage({
          file: selectedVideoFile,
          folder: 'videos',
          uid: currentUser.uid,
          onProgress: pct => setUploadProgress(Math.max(10, Math.round(pct * 0.7)))
        });
        resolvedVideoUrl = uploadedVideo.url;
        resolvedVideoPath = uploadedVideo.storagePath;
      }

      if (selectedThumbFile) {
        if (!isFirebaseApiKeyConfigured || !currentUser) {
          throw new Error(
            'Uploading a local cover image or extracted video frame to Firebase Storage requires VITE_FIREBASE_API_KEY to be configured. Configure Storage or paste an HTTPS thumbnail URL.'
          );
        }
        setProcessingStatus('Uploading 16:9 cover thumbnail to Firebase Storage...');
        const uploadedThumb = await uploadFileWithPathToStorage({
          file: selectedThumbFile,
          folder: 'thumbnails',
          uid: currentUser.uid,
          onProgress: pct => setUploadProgress(70 + Math.round(pct * 0.2))
        });
        resolvedThumbUrl = uploadedThumb.url;
        resolvedThumbPath = uploadedThumb.storagePath;
      }

      if (!resolvedThumbUrl) {
        throw new Error('A real thumbnail image is required before saving or publishing.');
      }

      const urlCheck = validateThumbnailUrlFormat(resolvedThumbUrl);
      if (!urlCheck.valid) {
        throw new Error(urlCheck.error || 'Invalid thumbnail URL.');
      }

      setUploadProgress(92);
      setProcessingStatus('Committing metadata and publishing rights to Firestore...');

      const finalDuration =
        videoDurationSec > 0
          ? videoDurationSec
          : editingVideo
          ? editingVideo.duration
          : 60;
      const finalDurationFormatted =
        videoDurationSec > 0
          ? formatDuration(videoDurationSec)
          : editingVideo
          ? editingVideo.durationFormatted
          : '1:00';

      const publishedId = await uploadVideo(
        {
          id: editingVideo ? editingVideo.id : undefined,
          title: title.trim(),
          description: description.trim() || 'Uploaded to SVTech Media.',
          category,
          videoUrl: resolvedVideoUrl,
          videoStoragePath: resolvedVideoPath,
          thumbnailUrl: resolvedThumbUrl,
          thumbnailStoragePath: resolvedThumbPath,
          tags: tags.split(',').map(tg => tg.trim()).filter(Boolean),
          status,
          visibility,
          scheduledAt,
          allowDownloads,
          accessType,
          price: accessType === 'pro' ? Number(videoPrice) || 100 : 0,
          currency: 'ETB',
          isPremium: accessType === 'pro',
          duration: finalDuration,
          durationFormatted: finalDurationFormatted
        },
        txId
      );

      setUploadProgress(100);
      setProcessingStatus(t.common.published);
      showToast(editingVideo ? 'Video updated successfully!' : 'Video published successfully!', 'success');

      setIsUploading(false);
      setIsUploadModalOpen(false);
      setEditingVideo(null);
      navigate('watch', { videoId: publishedId });
    } catch (err: any) {
      const msg = err?.message || 'Failed to publish video.';
      setUploadError(msg);
      setIsUploading(false);
      showToast(msg, 'error');
    }
  };

  const handleDelete = async () => {
    if (!editingVideo) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await removeVideo(editingVideo.id);
    setConfirmDelete(false);
    setIsUploadModalOpen(false);
    setEditingVideo(null);
  };

  const samplePresets = [
    {
      label: '4K CGI Masterpiece',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumb: '/thumbnails/video-1.jpg',
      duration: 596
    },
    {
      label: 'Sci-Fi Cyberpunk VFX',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumb: '/thumbnails/video-2.jpg',
      duration: 734
    },
    {
      label: 'Tech Overdrive Stream',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumb: '/thumbnails/video-3.jpg',
      duration: 15
    },
    {
      label: 'Untamed Wilderness',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumb: '/thumbnails/video-4.jpg',
      duration: 15
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-rose-600" />
            <h2 className="font-display font-bold text-base text-zinc-950 dark:text-white">
              {editingVideo ? t.upload.editTitle : t.upload.modalTitle}
            </h2>
          </div>
          <button
            onClick={() => {
              setIsUploadModalOpen(false);
              setEditingVideo(null);
            }}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================= */}
        {/* VIEW 1: VIDEO DETAILS FORM                             */}
        {/* ======================================================= */}
        {paymentStep === 'details' || paymentStep === 'paid' ? (
          <form onSubmit={handleProceedOrPublish} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Real-Time Creator Auth Identity Strip */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-700 text-white text-xs font-bold flex items-center justify-center shrink-0 overflow-hidden">
                  {userProfile.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (userProfile.displayName || 'G').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                    Publishing as {userProfile.displayName}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {isAuthenticated
                      ? `Authenticated · ${userProfile.role.replace('_', ' ')}`
                      : 'Guest session — sign in to save posts to your real-time account'}
                  </p>
                </div>
              </div>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shrink-0"
                >
                  {t.auth.signIn}
                </button>
              )}
            </div>

            {/* Ethiopian Birr Publishing Fee Badge / Alert */}
            {!isStaffExempt && !editingVideo && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                    {t.upload.standardPrice}
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {t.upload.feeNoticeDesc}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    {t.upload.freeToWatchNotice}
                  </p>
                </div>
              </div>
            )}

            {isStaffExempt && !editingVideo && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t.upload.staffExemption}</span>
              </div>
            )}

            {/* Video Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t.upload.videoTitle} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t.upload.titlePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-600"
              />
            </div>

            {/* Video Stream Source & Local File Picker */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <FileVideo className="w-4 h-4 text-rose-600" />
                  <span>{t.upload.streamSource}</span>
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  {t.upload.chooseLocalFile}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileSelect}
                  className="hidden"
                />
              </div>
              <input
                type="text"
                value={videoUrl}
                onChange={e => {
                  setSelectedVideoFile(null);
                  setVideoStoragePath(undefined);
                  setVideoUrl(e.target.value);
                }}
                placeholder={t.upload.urlPlaceholder}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-zinc-400 self-center">{t.upload.samplePresets}:</span>
                {samplePresets.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      revokeLocalVideoUrl();
                      setSelectedVideoFile(null);
                      setVideoStoragePath(undefined);
                      setVideoUrl(preset.url);
                      setVideoDurationSec(preset.duration);
                      if (!selectedThumbFile && (!thumbnailUrl || thumbnailUrl.startsWith('/thumbnails/'))) {
                        setThumbnailUrl(preset.thumb);
                      }
                    }}
                    className="px-2 py-0.5 rounded text-[10px] bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Real Cover Image Upload + Video Frame Extractor + URL Chooser */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold block text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-rose-600" />
                    <span>{t.upload.thumbnail}</span>
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Upload JPG/PNG/WebP, capture a 16:9 frame from your video, or paste an image URL
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {thumbnailUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      {t.upload.removeThumbnail}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                  >
                    {t.upload.uploadImage}
                  </button>
                </div>
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleThumbnailFileSelect}
                  className="hidden"
                />
              </div>

              {/* Firebase Storage configuration notice when Storage is missing and local file selected */}
              {!isFirebaseApiKeyConfigured && (selectedVideoFile || selectedThumbFile) && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{t.upload.storageNotConfiguredNotice}</span>
                </div>
              )}

              {/* Extract 16:9 Frame From Video + Timestamp Scrubber */}
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-700/70 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                    <span>{t.upload.extractFrame}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: 'Start', sec: 1 },
                      { label: '25%', sec: Math.max(1, Math.round((videoDurationSec || 20) * 0.25)) },
                      { label: '50%', sec: Math.max(1, Math.round((videoDurationSec || 20) * 0.5)) },
                      { label: '75%', sec: Math.max(1, Math.round((videoDurationSec || 20) * 0.75)) }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        disabled={isExtractingFrame}
                        onClick={() => {
                          setFrameTimestampSec(preset.sec);
                          runFrameExtraction(videoUrl, preset.sec, true);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 disabled:opacity-50"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                      {formatDuration(frameTimestampSec)}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(10, videoDurationSec || 60)}
                      step={0.5}
                      value={Math.min(frameTimestampSec, Math.max(10, videoDurationSec || 60))}
                      onChange={e => setFrameTimestampSec(Number(e.target.value))}
                      aria-label={t.upload.frameTimestamp}
                      className="flex-1 accent-rose-600 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                      {formatDuration(Math.max(10, videoDurationSec || 60))}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isExtractingFrame || !videoUrl}
                    onClick={() => runFrameExtraction(videoUrl, frameTimestampSec, true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isExtractingFrame ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t.upload.capturingFrame}</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>{t.upload.captureAtTimestamp}</span>
                      </>
                    )}
                  </button>
                </div>

                {frameExtractNote && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{frameExtractNote}</p>
                )}
              </div>

              {/* Direct Image URL + Live Verification */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={thumbnailUrl.startsWith('data:') ? '' : thumbnailUrl}
                      onChange={e => {
                        setSelectedThumbFile(null);
                        setThumbnailStoragePath(undefined);
                        setUrlCheckState('idle');
                        setUrlCheckMsg(null);
                        setThumbnailUrl(e.target.value);
                      }}
                      placeholder="Paste cover image URL (https://... or /thumbnails/...)"
                      className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!thumbnailUrl.trim() || thumbnailUrl.startsWith('data:') || urlCheckState === 'checking'}
                    onClick={handleVerifyThumbnailUrl}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 disabled:opacity-50 shrink-0"
                  >
                    {urlCheckState === 'checking' ? t.common.loading : t.upload.verifyUrl}
                  </button>
                </div>

                {urlCheckMsg && (
                  <p
                    className={`text-[11px] flex items-center gap-1 ${
                      urlCheckState === 'valid'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {urlCheckState === 'valid' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{urlCheckMsg}</span>
                  </p>
                )}
              </div>

              {/* Live 16:9 Post Card Preview showing Cover, Price & Content Title */}
              <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-700/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Live 16:9 Thumbnail Preview ({selectedThumbFile ? `Local File: ${selectedThumbFile.name}` : thumbnailStoragePath ? `Storage: ${thumbnailStoragePath}` : 'Image URL'})
                </span>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="relative w-full sm:w-52 aspect-video rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-200/70 dark:border-zinc-700/70">
                    <VideoThumbnail
                      src={thumbnailUrl}
                      alt={title || 'Video cover preview'}
                      fallbackLabel="No thumbnail selected"
                    />

                    {/* Preview Price / Tier Overlay */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      {accessType === 'pro' ? (
                        <>
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black uppercase">
                            <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                            PRO
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-950/90 text-amber-400 text-[10px] font-mono tabular-nums font-bold">
                            {Number(videoPrice) || 100} ETB
                          </span>
                        </>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-600/95 text-white text-[10px] font-bold uppercase">
                          FREE
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-white text-[10px] font-mono tabular-nums">
                      {formatDuration(videoDurationSec || (editingVideo ? editingVideo.duration : 60))}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-display font-semibold text-sm text-zinc-900 dark:text-white line-clamp-2 leading-snug">
                      {title.trim() || 'Your Content Title Appears Here'}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {userProfile.displayName} · {category}
                    </p>
                    <div className="text-xs font-mono tabular-nums font-bold">
                      {accessType === 'pro' ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          Price: {Number(videoPrice) || 100} ETB
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Price: Free
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visibility & Status & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.upload.category}
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                >
                  <option value="Tech">Tech</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Coding">Coding</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Science">Science</option>
                  <option value="Music">Music</option>
                  <option value="Animation">Animation</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Travel">Travel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.upload.statusLabel}
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                >
                  <option value="published">{t.common.published}</option>
                  <option value="draft">{t.common.draft}</option>
                  <option value="scheduled">{t.common.scheduled}</option>
                  <option value="unlisted">{t.common.unlisted}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.upload.visibility}
                </label>
                <select
                  value={visibility}
                  onChange={e => setVisibility(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                >
                  <option value="public">{t.common.public}</option>
                  <option value="private">{t.common.private}</option>
                  <option value="unlisted">{t.common.unlisted}</option>
                </select>
              </div>
            </div>

            {/* Video Access Type: FREE vs PRO Monetized */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Video Access & Monetization Type
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Choose whether this video is 100% Free or requires Telebirr Watch-to-Unlock payment
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${
                  accessType === 'pro'
                    ? 'bg-amber-500 text-black'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {accessType === 'pro' ? 'PRO (Monetized)' : 'FREE TO WATCH'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccessType('free')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    accessType === 'free'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="font-bold text-xs text-zinc-900 dark:text-white block">
                    100% Free Stream
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Anyone can watch without payment
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessType('pro')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    accessType === 'pro'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-1 ring-amber-500'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="font-bold text-xs text-zinc-900 dark:text-white block">
                    PRO / Paid Video
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Pay-to-unlock via Telebirr merchant 0913767842
                  </span>
                </button>
              </div>

              {accessType === 'pro' && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Unlock Price (Ethiopian Birr - ETB)
                    </label>
                    <span className="text-[10px] text-zinc-400">
                      Amount viewers pay to unlock permanent access
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[50, 100, 150, 200].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setVideoPrice(amt)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                          videoPrice === amt
                            ? 'bg-amber-500 text-black shadow-sm'
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                        }`}
                      >
                        {amt} ETB
                      </button>
                    ))}
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="10"
                        max="5000"
                        value={videoPrice}
                        onChange={e => setVideoPrice(Number(e.target.value))}
                        className="w-20 px-2 py-1 rounded-lg text-xs font-mono font-bold bg-white dark:bg-zinc-900 border border-amber-500/50 text-right text-zinc-900 dark:text-white"
                      />
                      <span className="ml-1 text-xs font-mono text-zinc-400">ETB</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Downloads Permission Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
              <div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                  {t.upload.allowDownloads}
                </span>
                <span className="text-[11px] text-zinc-400">
                  Allow viewers to save this video for offline playback (1080p, 720p, 480p, 360p)
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowDownloads}
                onChange={e => setAllowDownloads(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
              />
            </div>

            {/* Scheduled Datetime picker */}
            {status === 'scheduled' && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  {t.upload.scheduledAt}
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700 text-zinc-900 dark:text-white"
                />
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t.upload.tags}
              </label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="SVTech, 4K, React 19"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t.upload.description}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t.upload.descPlaceholder}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            {/* Live Preview Toggle */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 hover:text-rose-600"
              >
                <Play className="w-4 h-4 text-rose-600" />
                <span>{showPreview ? t.upload.hidePreview : t.upload.previewToggle}</span>
              </button>
              {showPreview && (
                <div className="mt-3 aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                  <video src={videoUrl} controls className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            {/* Upload Progress & Processing indicator */}
            {isUploading && (
              <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-800 dark:text-zinc-200">{processingStatus}</span>
                  <span className="font-mono text-rose-600">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full bg-rose-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/40 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              {editingVideo ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                      confirmDelete
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{confirmDelete ? 'Confirm Permanent Delete' : t.upload.deleteVideo}</span>
                  </button>
                  {confirmDelete && (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {t.common.cancel}
                    </button>
                  )}
                </div>
              ) : <div />}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setEditingVideo(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !isAuthenticated}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {editingVideo
                      ? t.common.saveChanges
                      : isStaffExempt || status === 'draft'
                      ? t.upload.publishBtn
                      : `${t.upload.payNow} & Publish`}
                  </span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* ======================================================= */
          /* VIEW 2: ETHIOPIAN BIRR PAYMENT GATEWAY (100 ETB)       */
          /* ======================================================= */
          <div className="p-6 space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-zinc-950 dark:text-white">
                {t.upload.feeNoticeTitle}
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                {t.upload.feeNoticeDesc}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 font-semibold block">Total Amount</span>
                <span className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                  100.00 <span className="text-rose-600 text-base">ETB</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-zinc-400 block">Transaction Reference</span>
                <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  {paymentReference || 'GENERATING...'}
                </span>
              </div>
            </div>

            {/* Provider Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                {t.upload.selectPaymentProvider}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Telebirr */}
                <button
                  type="button"
                  onClick={() => setSelectedProvider('telebirr')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    selectedProvider === 'telebirr'
                      ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/30 ring-2 ring-rose-600'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    {selectedProvider === 'telebirr' && <Check className="w-4 h-4 text-rose-600" />}
                  </div>
                  <span className="font-bold text-xs text-zinc-900 dark:text-white block">Telebirr</span>
                  <span className="text-[10px] text-zinc-500">Ethio Telecom</span>
                </button>

                {/* CBE Birr */}
                <button
                  type="button"
                  onClick={() => setSelectedProvider('cbe_birr')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    selectedProvider === 'cbe_birr'
                      ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/30 ring-2 ring-rose-600'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    {selectedProvider === 'cbe_birr' && <Check className="w-4 h-4 text-rose-600" />}
                  </div>
                  <span className="font-bold text-xs text-zinc-900 dark:text-white block">CBE Birr</span>
                  <span className="text-[10px] text-zinc-500">Commercial Bank</span>
                </button>

                {/* Chapa */}
                <button
                  type="button"
                  onClick={() => setSelectedProvider('chapa')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    selectedProvider === 'chapa'
                      ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/30 ring-2 ring-rose-600'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    {selectedProvider === 'chapa' && <Check className="w-4 h-4 text-rose-600" />}
                  </div>
                  <span className="font-bold text-xs text-zinc-900 dark:text-white block">Chapa</span>
                  <span className="text-[10px] text-zinc-500">Cards & Wallets</span>
                </button>
              </div>
            </div>

            {/* Verification Notice */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-500 space-y-1">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                Payment Verification Workflow:
              </p>
              <p>
                1. Clicking below initiates provider settlement check.
              </p>
              <p>
                2. Transaction is signed and verified via server-side hash before video is published.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setPaymentStep('details')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Back to Details
              </button>

              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={paymentStep === 'verifying'}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all disabled:opacity-50"
              >
                {paymentStep === 'verifying' ? (
                  <span>Verifying Transaction...</span>
                ) : (
                  <>
                    <span>Confirm 100 ETB & Publish</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
