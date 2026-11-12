import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Film,
  Check,
  AlertCircle,
  FileVideo,
  Image,
  Clock,
  Eye,
  Trash2,
  Lock,
  Globe,
  Radio,
  Play,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateThumbnailSvg } from '../data/mockData';
import { PaymentProvider } from '../types';

export const UploadModal: React.FC = () => {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadVideo,
    removeVideo,
    editingVideo,
    setEditingVideo,
    navigate,
    isAdmin,
    isModerator,
    initiatePublishingPayment,
    verifyPayment,
    platformSettings,
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

  // Upload Progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const isStaffExempt = isAdmin || isModerator;
  const publishingFee = isStaffExempt ? 0 : (platformSettings.publishingFeeETB || 100);

  // Sync if editing an existing video
  useEffect(() => {
    if (editingVideo) {
      setTitle(editingVideo.title);
      setDescription(editingVideo.description);
      setCategory(editingVideo.category);
      setVideoUrl(editingVideo.videoUrl);
      setThumbnailUrl(editingVideo.thumbnailUrl);
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
      setThumbnailUrl('');
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

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setVideoUrl(localUrl);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleThumbnailFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setThumbnailUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 -> Step 2: Form submit or trigger payment
  const handleProceedOrPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

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

    setTimeout(async () => {
      await verifyPayment(activeTransactionId);
      setPaymentStep('paid');
      setProcessingStatus(t.upload.paymentConfirmed);
      // Auto-trigger video publishing after payment verified
      setTimeout(() => {
        executePublish(activeTransactionId);
      }, 500);
    }, 1200);
  };

  const executePublish = async (txId?: string) => {
    setIsUploading(true);
    setUploadProgress(20);
    setProcessingStatus('Uploading video bitstream to authorized storage...');

    setTimeout(() => {
      setUploadProgress(65);
      setProcessingStatus('Transcoding 1080p 60fps & verifying DRM permissions...');
    }, 400);

    setTimeout(async () => {
      setUploadProgress(90);
      setProcessingStatus('Committing metadata and publishing rights to Firestore...');

      const finalThumb =
        thumbnailUrl ||
        generateThumbnailSvg(
          title.trim(),
          category,
          '#1e1b4b',
          '#0f172a',
          '#e11d48',
          'play'
        );

      const publishedId = await uploadVideo(
        {
          id: editingVideo ? editingVideo.id : undefined,
          title: title.trim(),
          description: description.trim() || 'Uploaded to SVTech Media.',
          category,
          videoUrl,
          thumbnailUrl: finalThumb,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          status,
          visibility,
          scheduledAt,
          allowDownloads,
          accessType,
          price: accessType === 'pro' ? Number(videoPrice) || 100 : 0,
          currency: 'ETB',
          isPremium: accessType === 'pro',
          duration: editingVideo ? editingVideo.duration : 60,
          durationFormatted: editingVideo ? editingVideo.durationFormatted : '1:00'
        },
        txId
      );

      setUploadProgress(100);
      setProcessingStatus(t.common.published);

      setTimeout(() => {
        setIsUploading(false);
        setIsUploadModalOpen(false);
        setEditingVideo(null);
        navigate('watch', { videoId: publishedId });
      }, 600);
    }, 900);
  };

  const handleDelete = async () => {
    if (editingVideo && confirm(`Delete "${editingVideo.title}" permanently?`)) {
      await removeVideo(editingVideo.id);
      setIsUploadModalOpen(false);
      setEditingVideo(null);
    }
  };

  const samplePresets = [
    { label: '4K CGI Masterpiece', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { label: 'Sci-Fi Cyberpunk VFX', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    { label: 'Tech Overdrive Stream', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { label: 'Untamed Wilderness', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
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
                onChange={e => setVideoUrl(e.target.value)}
                placeholder={t.upload.urlPlaceholder}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-zinc-400 self-center">{t.upload.samplePresets}:</span>
                {samplePresets.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setVideoUrl(preset.url)}
                    className="px-2 py-0.5 rounded text-[10px] bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thumbnail Chooser */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt=""
                    className="w-16 aspect-video rounded-lg object-cover ring-1 ring-zinc-300 dark:ring-zinc-700"
                  />
                ) : (
                  <div className="w-16 aspect-video rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Image className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <span className="text-xs font-semibold block text-zinc-800 dark:text-zinc-200">
                    {t.upload.thumbnail}
                  </span>
                  <span className="text-[11px] text-zinc-400">Upload JPG/PNG or auto-generate</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300"
              >
                {t.upload.uploadImage}
              </button>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailFileSelect}
                className="hidden"
              />
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

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              {editingVideo ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.upload.deleteVideo}</span>
                </button>
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
                  disabled={isUploading}
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
