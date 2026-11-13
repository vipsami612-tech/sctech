import React, { useState, useRef } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  ListPlus,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  CornerDownRight,
  X,
  FileVideo,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShieldCheck,
  PhoneCall,
  Copy,
  KeyRound,
  ExternalLink,
  Flag,
  Clock
} from 'lucide-react';
import { ReactionType, Video } from '../types';
import { useApp } from '../context/AppContext';
import { LIVE_REACTION_OPTIONS, VideoPlayer } from './VideoPlayer';
import { VideoCard } from './VideoCard';

interface WatchPageProps {
  videoId: string;
}

export const WatchPage: React.FC<WatchPageProps> = ({ videoId }) => {
  const {
    videos,
    channels,
    comments,
    likedVideoIds,
    dislikedVideoIds,
    subscribedChannelIds,
    toggleLikeVideo,
    toggleDislikeVideo,
    toggleSubscribe,
    addComment,
    likeComment,
    setShareModalVideo,
    setPlaylistModalVideo,
    startDownload,
    isAdmin,
    navigate,
    t,
    currentUser,
    isPurchased,
    getPendingPurchase,
    purchaseVideo,
    sendVideoReaction,
    trackVideoShare,
    watchHistory,
    submitReport,
    showToast,
    openAuthModal
  } = useApp();

  const [isTheater, setIsTheater] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsSort, setCommentsSort] = useState<'top' | 'newest'>('top');
  const [lastReactedEmoji, setLastReactedEmoji] = useState<string | null>(null);
  const playerTimeRef = useRef<number>(0);

  // Professional Download Modal state
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState<'1080p' | '720p' | '480p' | '360p'>('1080p');
  const [isStartingDownload, setIsStartingDownload] = useState(false);

  // Report Video Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const currentVideo = videos.find(v => v.id === videoId) || videos[0];
  const currentChannel = channels.find(c => c.id === currentVideo.channel.id) || {
    id: currentVideo.channel.id,
    name: currentVideo.channel.name,
    handle: currentVideo.channel.handle,
    avatarUrl: currentVideo.channel.avatarUrl,
    subscribers: currentVideo.channel.subscribers,
    verified: currentVideo.channel.verified
  };

  const isLiked = likedVideoIds.includes(currentVideo.id);
  const isDisliked = dislikedVideoIds.includes(currentVideo.id);
  const isSubscribed = subscribedChannelIds.includes(currentChannel.id);

  const videoComments = comments[currentVideo.id] || [];
  const relatedVideos = videos.filter(v => v.id !== currentVideo.id);

  const handleNextVideo = () => {
    if (relatedVideos.length > 0) {
      navigate('watch', { videoId: relatedVideos[0].id });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentInput.trim()) {
      addComment(currentVideo.id, commentInput);
      setCommentInput('');
    }
  };

  const handleOpenDownload = () => {
    if (currentVideo.allowDownloads === false && !isAdmin) {
      showToast(t.watch.downloadNotAllowed, 'info');
      return;
    }
    setShowDownloadModal(true);
  };

  const handleConfirmDownload = async () => {
    setIsStartingDownload(true);
    await startDownload(currentVideo, downloadQuality);
    setIsStartingDownload(false);
    setShowDownloadModal(false);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setIsSubmittingReport(true);
    try {
      await submitReport('video', currentVideo.id, reportReason.trim(), currentVideo.title);
      setReportReason('');
      setShowReportModal(false);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const qualityOptions = [
    { label: '1080p Full HD', size: '145 MB', res: '1080p' as const, desc: 'Highest definition, 60fps audio' },
    { label: '720p HD', size: '89 MB', res: '720p' as const, desc: 'Crisp video, balanced storage' },
    { label: '480p Standard', size: '52 MB', res: '480p' as const, desc: 'Recommended for mobile screens' },
    { label: '360p Data Saver', size: '24 MB', res: '360p' as const, desc: 'Lightweight and low bandwidth' }
  ];

  const isPro = currentVideo.accessType === 'pro' || currentVideo.isPremium;
  const isOwner = currentUser && (currentVideo.ownerUid === currentUser.uid || currentVideo.channel.id === currentUser.uid);
  const isUnlocked = !isPro || (currentUser && isPurchased(currentVideo.id)) || isAdmin || isOwner;
  const pendingPurchase = getPendingPurchase(currentVideo.id);
  const savedHistory = watchHistory.find(h => h.videoId === currentVideo.id);

  // Paywall unlock transaction form states
  const [txnRefInput, setTxnRefInput] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmittingTxn, setIsSubmittingTxn] = useState(false);
  const [purchaseStatusMsg, setPurchaseStatusMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const priceAmount = currentVideo.price || 100;
  const currencyCode = currentVideo.currency || 'ETB';
  const telebirrMerchant = '0913767842';

  const handleCopyMerchantNumber = () => {
    navigator.clipboard.writeText(telebirrMerchant);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleTriggerLiveReaction = async (type: ReactionType, emoji: string) => {
    setLastReactedEmoji(emoji);
    await sendVideoReaction(currentVideo.id, type, emoji, playerTimeRef.current);
  };

  const handlePayAndUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('signin');
      return;
    }
    if (!txnRefInput.trim()) {
      setPurchaseStatusMsg({ type: 'error', text: 'Please enter your Telebirr transaction reference or SMS code.' });
      return;
    }
    setIsSubmittingTxn(true);
    setPurchaseStatusMsg(null);
    try {
      const res = await purchaseVideo(currentVideo, 'telebirr', txnRefInput.trim());
      if (res && res.purchaseId) {
        const isAlreadyVerified = res.paymentStatus === 'successful' || res.status === 'verified';
        setPurchaseStatusMsg({
          type: isAlreadyVerified ? 'success' : 'info',
          text: isAlreadyVerified
            ? t.watch.unlockSuccess
            : t.watch.pendingVerificationDesc
        });
        setTxnRefInput('');
      } else {
        setPurchaseStatusMsg({ type: 'error', text: 'Payment submission failed' });
      }
    } catch (err: any) {
      setPurchaseStatusMsg({ type: 'error', text: err?.message || 'Error recording purchase' });
    } finally {
      setIsSubmittingTxn(false);
    }
  };

  // Render Paywall locked player component
  const renderLockedPaywall = () => (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/30 shadow-2xl flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Background blurred poster */}
      <img
        src={currentVideo.thumbnailUrl}
        alt=""
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-md scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/25">
            <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            PRO VIDEO
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-700 text-zinc-300 text-xs font-mono font-medium">
            {t.watch.proContentLocked}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm">
          <span>{priceAmount} {currencyCode}</span>
        </div>
      </div>

      {/* Center Paywall / Telebirr Instructions */}
      <div className="relative z-10 max-w-xl mx-auto w-full my-auto text-center space-y-4 py-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-black flex items-center justify-center shadow-xl shadow-amber-500/20">
          <Lock className="w-7 h-7 stroke-[2.5]" />
        </div>

        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
            {currentVideo.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-md mx-auto">
            {t.watch.proDesc}
          </p>
        </div>

        {/* Telebirr Payment Instructions Box */}
        <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-4 text-left space-y-3 backdrop-blur-md shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500 text-black font-black text-[10px] flex items-center justify-center">
                TB
              </div>
              <span className="font-bold text-xs sm:text-sm text-white">
                Telebirr Merchant Payment
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-400">
              {priceAmount} ETB
            </span>
          </div>

          <div className="flex items-center justify-between bg-black/60 rounded-xl px-3 py-2 border border-zinc-800">
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase tracking-wide">
                Telebirr Merchant Number
              </span>
              <span className="font-mono font-bold text-sm sm:text-base text-amber-400 tracking-wider">
                {telebirrMerchant}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyMerchantNumber}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              {copiedNumber ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            1. Open Telebirr App or dial <span className="font-mono text-zinc-200 font-bold">*127#</span><br />
            2. Send <span className="font-mono text-amber-400 font-bold">{priceAmount} ETB</span> to <span className="font-mono text-white font-bold">{telebirrMerchant}</span><br />
            3. Paste the confirmation Transaction Reference or SMS code below:
          </p>

          {/* Pending Verification Notice or Submission Form */}
          {pendingPurchase ? (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{t.watch.pendingVerification}</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{t.watch.pendingVerificationDesc}</p>
              <p className="font-mono text-[11px] text-amber-300">
                Ref: {pendingPurchase.transactionReference} · Merchant: {telebirrMerchant}
              </p>
            </div>
          ) : (
            <form onSubmit={handlePayAndUnlock} className="flex flex-col sm:flex-row gap-2 pt-1">
              <div className="relative flex-1">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={txnRefInput}
                  onChange={e => setTxnRefInput(e.target.value)}
                  placeholder="e.g. 2A4B8C1D9F (from SMS)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/80 border border-zinc-700 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingTxn}
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>{isSubmittingTxn ? 'Submitting...' : 'Submit Reference'}</span>
              </button>
            </form>
          )}

          {purchaseStatusMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                purchaseStatusMsg.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                  : purchaseStatusMsg.type === 'info'
                  ? 'bg-amber-950/80 border border-amber-500 text-amber-200'
                  : 'bg-red-950/80 border border-red-500 text-red-300'
              }`}
            >
              {purchaseStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : purchaseStatusMsg.type === 'info' ? (
                <Clock className="w-4 h-4 shrink-0 text-amber-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{purchaseStatusMsg.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Security Note */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-3">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          Permanent access once unlocked · Official Telebirr Ethio Telecom
        </span>
        <span className="font-mono text-zinc-500">Merchant # 0913767842</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1700px] mx-auto px-2 sm:px-4 lg:px-6 py-4">
      {/* THEATER MODE FULL-WIDTH BANNER */}
      {isTheater && (
        <div className="w-full mb-6">
          {isUnlocked ? (
            <VideoPlayer
              video={currentVideo}
              isTheater={isTheater}
              onToggleTheater={() => setIsTheater(false)}
              onNextVideo={handleNextVideo}
              initialTimeSec={savedHistory?.lastPositionSec}
              onTimeSync={sec => {
                playerTimeRef.current = sec;
              }}
            />
          ) : (
            renderLockedPaywall()
          )}
        </div>
      )}

      {/* TWO COLUMN WATCH LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Primary Column (Player + Meta + Comments) */}
        <div className={isTheater ? 'lg:col-span-8' : 'lg:col-span-8'}>
          {/* STANDARD PLAYER (when not in theater) */}
          {!isTheater && (
            <div className="w-full mb-4">
              {isUnlocked ? (
                <VideoPlayer
                  video={currentVideo}
                  isTheater={false}
                  onToggleTheater={() => setIsTheater(true)}
                  onNextVideo={handleNextVideo}
                  initialTimeSec={savedHistory?.lastPositionSec}
                  onTimeSync={sec => {
                    playerTimeRef.current = sec;
                  }}
                />
              ) : (
                renderLockedPaywall()
              )}
            </div>
          )}

          {/* LIVE REACTIONS BAR */}
          {isUnlocked && (
            <div className="mb-4 px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                      {t.liveReactions?.title || 'Live Reactions'}
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                      · {formatNumber(currentVideo.reactionsCount || 0)}{' '}
                      {t.liveReactions?.totalReactions || 'reactions'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {lastReactedEmoji
                      ? `${lastReactedEmoji} ${t.liveReactions?.justReacted || 'reacted'}`
                      : t.liveReactions?.subtitle || 'Send real-time reactions during playback'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {LIVE_REACTION_OPTIONS.map(opt => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleTriggerLiveReaction(opt.type, opt.emoji)}
                    title={opt.label}
                    aria-label={`Send ${opt.label} reaction`}
                    className="h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/80 hover:border-rose-500/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-110 transition-all text-base flex items-center justify-center shadow-2xs cursor-pointer"
                  >
                    <span>{opt.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Video Title */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display font-bold text-lg sm:text-xl md:text-2xl text-zinc-950 dark:text-white leading-tight flex-1">
              {currentVideo.title}
            </h1>
            {isPro && (
              <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                isUnlocked
                  ? 'bg-emerald-600/90 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md'
              }`}>
                {isUnlocked ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    UNLOCKED
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                    PRO {priceAmount} {currencyCode}
                  </>
                )}
              </span>
            )}
          </div>

          {/* Action Row & Channel Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            {/* Channel Info */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('channel', { channelId: currentChannel.id })}
                className="shrink-0"
              >
                <img
                  src={currentChannel.avatarUrl}
                  alt={currentChannel.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </button>
              <div className="min-w-0">
                <button
                  onClick={() => navigate('channel', { channelId: currentChannel.id })}
                  className="flex items-center gap-1.5 font-semibold text-sm text-zinc-900 dark:text-white hover:underline text-left"
                >
                  <span className="truncate">{currentChannel.name}</span>
                  {currentChannel.verified && (
                    <Check className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </button>
                <p className="text-xs text-zinc-500">
                  {currentChannel.subscribers} {t.watch.subscribers}
                </p>
              </div>

              {/* Subscribe button */}
              <button
                onClick={() => toggleSubscribe(currentChannel.id)}
                className={`ml-3 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isSubscribed
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                }`}
              >
                {isSubscribed ? t.common.subscribed : t.common.subscribe}
              </button>
            </div>

            {/* Video Action Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {/* Like / Dislike Segmented Pill */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 shrink-0">
                <button
                  onClick={() => toggleLikeVideo(currentVideo.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-full text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ${
                    isLiked ? 'text-rose-600 dark:text-rose-500 font-bold' : 'text-zinc-700 dark:text-zinc-200'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-mono tabular-nums">{formatNumber(currentVideo.likes)}</span>
                </button>
                <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700" />
                <button
                  onClick={() => toggleDislikeVideo(currentVideo.id)}
                  aria-label="Dislike"
                  className={`px-3 py-1.5 rounded-r-full text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ${
                    isDisliked ? 'text-rose-600' : 'text-zinc-700 dark:text-zinc-200'
                  }`}
                >
                  <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Share button */}
              <button
                onClick={() => {
                  trackVideoShare(currentVideo.id);
                  setShareModalVideo(currentVideo);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors shrink-0"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.common.share}</span>
              </button>

              {/* Real Download button */}
              <button
                onClick={handleOpenDownload}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors shrink-0"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>{t.common.download}</span>
              </button>

              {/* Save to Playlist */}
              <button
                onClick={() => setPlaylistModalVideo(currentVideo)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors shrink-0"
              >
                <ListPlus className="w-4 h-4" />
                <span>{t.common.save}</span>
              </button>

              {/* Report Video */}
              <button
                onClick={() => (currentUser ? setShowReportModal(true) : openAuthModal('signin'))}
                title={t.watch.reportVideo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-rose-600 transition-colors shrink-0"
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.watch.reportVideo}</span>
              </button>
            </div>
          </div>

          {/* Expandable Video Description Box */}
          <div
            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
            className="mt-4 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-3 font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              <span>{formatNumber(currentVideo.views)} {t.watch.views}</span>
              <span>•</span>
              <span>{currentVideo.uploadDate}</span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300">
                #{currentVideo.category}
              </span>
            </div>

            <div className={descriptionExpanded ? '' : 'line-clamp-2'}>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {currentVideo.description}
              </p>

              {/* Chapters list if expanded */}
              {descriptionExpanded && currentVideo.chapters && currentVideo.chapters.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-1.5">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-2">
                    Chapters:
                  </span>
                  {currentVideo.chapters.map((ch, idx) => (
                    <div key={idx} className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        {Math.floor(ch.time / 60)}:{(ch.time % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300">{ch.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="mt-2 font-bold text-zinc-900 dark:text-white flex items-center gap-1">
              <span>{descriptionExpanded ? t.watch.showLess : t.watch.showMore}</span>
              {descriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Comments Section */}
          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                  {videoComments.length} {t.watch.comments}
                </h3>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <button
                    onClick={() => setCommentsSort(commentsSort === 'top' ? 'newest' : 'top')}
                    className="font-medium hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    {commentsSort === 'top' ? t.watch.topComments : t.watch.newestFirst}
                  </button>
                </div>
              </div>
            </div>

            {/* Post new comment box */}
            <form onSubmit={handleCommentSubmit} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                SV
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  placeholder={t.watch.addCommentPlaceholder}
                  className="w-full pb-1 text-xs sm:text-sm bg-transparent border-b border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-600 transition-colors"
                />
                {commentInput && (
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setCommentInput('')}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow"
                    >
                      {t.watch.comment}
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 pt-2">
              {videoComments.map(c => (
                <div key={c.id} className="flex gap-3 text-xs group">
                  <img
                    src={c.author.avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {c.author.name}
                      </span>
                      <span className="text-[10px] text-zinc-400">{c.timestamp}</span>
                    </div>
                    <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">{c.text}</p>
                    <div className="flex items-center gap-4 pt-1 text-zinc-500">
                      <button
                        onClick={() => likeComment(currentVideo.id, c.id)}
                        className={`flex items-center gap-1 hover:text-rose-600 ${
                          c.isLiked ? 'text-rose-600 font-bold' : ''
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{c.likes > 0 ? c.likes : ''}</span>
                      </button>
                      <button
                        onClick={() => setCommentInput(`@${c.author.name} `)}
                        className="font-medium hover:text-zinc-900 dark:hover:text-white"
                      >
                        {t.watch.reply}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Up Next / Recommended List */}
        <div className={isTheater ? 'lg:col-span-4' : 'lg:col-span-4'}>
          <div className="flex items-center justify-between pb-3 mb-2">
            <span className="font-display font-bold text-sm text-zinc-950 dark:text-white">
              {t.watch.upNext}
            </span>
          </div>

          <div className="space-y-3">
            {relatedVideos.map(video => (
              <VideoCard key={video.id} video={video} layout="horizontal" />
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PROFESSIONAL VIDEO DOWNLOAD MODAL                            */}
      {/* ============================================================ */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display font-bold text-base text-zinc-950 dark:text-white">
                  {t.watch.downloadModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Preview Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <img
                src={currentVideo.thumbnailUrl}
                alt=""
                className="w-18 aspect-video rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                  {currentVideo.title}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {currentVideo.channel.name} • {t.watch.sourceFormat}
                </p>
              </div>
            </div>

            {/* Quality Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {t.watch.selectQuality}
              </label>
              <div className="space-y-2">
                {qualityOptions.map(opt => (
                  <button
                    key={opt.res}
                    type="button"
                    onClick={() => setDownloadQuality(opt.res)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      downloadQuality === opt.res
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-600'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-zinc-900 dark:text-white block">
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-zinc-400">{opt.desc}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-600 block">
                        {opt.size}
                      </span>
                      {downloadQuality === opt.res && (
                        <Check className="w-4 h-4 text-emerald-600 ml-auto mt-0.5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDownload}
                disabled={isStartingDownload}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isStartingDownload ? t.watch.downloadStarting : t.common.download}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT VIDEO MODAL */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowReportModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-zinc-950 dark:text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                <span>{t.watch.reportVideo}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <textarea
                rows={3}
                required
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                placeholder={t.watch.reportReason}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
                >
                  {isSubmittingReport ? t.common.loading : t.common.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
