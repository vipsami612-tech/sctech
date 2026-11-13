import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  ShieldAlert,
  Sparkles,
  Home,
  RefreshCw,
  Film
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthPages: React.FC = () => {
  const {
    viewMode,
    navigate,
    authError,
    clearAuthError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    resendVerificationEmail,
    refreshAuthUser,
    isAuthenticated,
    emailVerified,
    userProfile,
    showToast,
    t
  } = useApp();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requestCreator, setRequestCreator] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSuccessEmail, setResetSuccessEmail] = useState<string | null>(null);

  useEffect(() => {
    clearAuthError();
    setResetSuccessEmail(null);
  }, [viewMode]);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    const ok = await signInWithEmail(email, password);
    setSubmitting(false);
    if (ok) {
      navigate('home');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    const ok = await signUpWithEmail({
      email,
      password,
      displayName: displayName.trim() || email.split('@')[0],
      requestCreator,
      channelName: channelName.trim() || undefined,
      bio: bio.trim() || undefined
    });
    setSubmitting(false);
    if (ok) {
      navigate('verify-email');
    }
  };

  const handleGoogleAuth = async () => {
    setSubmitting(true);
    const ok = await signInWithGoogle(
      viewMode === 'signup' && requestCreator && channelName.trim()
        ? { channelName: channelName.trim(), bio: bio.trim() }
        : undefined
    );
    setSubmitting(false);
    if (ok) {
      navigate('home');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    const ok = await sendPasswordReset(email);
    setSubmitting(false);
    if (ok) {
      setResetSuccessEmail(email.trim());
    }
  };

  const handleCheckVerified = async () => {
    setSubmitting(true);
    const verified = await refreshAuthUser();
    setSubmitting(false);
    if (verified) {
      showToast('Email verified successfully!', 'success');
      navigate('home');
    } else {
      showToast('Email is not marked verified yet. Please click the link sent to your inbox.', 'info');
    }
  };

  // UNAUTHORIZED VIEW
  if (viewMode === 'unauthorized') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
              {t.auth.unauthorizedTitle}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t.auth.unauthorizedDesc}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => navigate('signin')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
              >
                {t.auth.signIn}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('home')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>{t.auth.backHome}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FORGOT PASSWORD VIEW
  if (viewMode === 'forgot-password') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-7 space-y-5 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
              {t.auth.resetTitle}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {t.auth.resetDesc}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {resetSuccessEmail && (
            <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>
                {t.auth.resetSent} ({resetSuccessEmail})
              </span>
            </div>
          )}

          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? t.common.loading : t.auth.sendResetBtn}
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => navigate('signin')}
              className="font-semibold text-rose-600 hover:underline"
            >
              {t.auth.signIn}
            </button>
            <button
              type="button"
              onClick={() => navigate('signup')}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              {t.auth.createAccount}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VERIFY EMAIL VIEW
  if (viewMode === 'verify-email') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Mail className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
              {t.auth.verifyTitle}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              {t.auth.verifyDesc}
            </p>
            {userProfile.email && (
              <p className="mt-2 text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                {userProfile.email}
              </p>
            )}
          </div>

          {emailVerified ? (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/40 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Your email is verified!</span>
            </div>
          ) : null}

          <div className="space-y-2.5">
            <button
              type="button"
              disabled={submitting || !isAuthenticated}
              onClick={handleCheckVerified}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
              <span>{t.auth.checkVerifiedBtn}</span>
            </button>

            <button
              type="button"
              disabled={submitting || !isAuthenticated}
              onClick={async () => {
                setSubmitting(true);
                await resendVerificationEmail();
                setSubmitting(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              {t.auth.resendVerification}
            </button>

            <button
              type="button"
              onClick={() => navigate('home')}
              className="w-full py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              {t.auth.backHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SIGN IN / SIGN UP PAGE VIEW
  const isSignUp = viewMode === 'signup';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Feature Rail */}
        <div className="md:col-span-5 bg-zinc-950 text-white p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-7 bg-gradient-to-br from-rose-600 to-rose-700 rounded-lg flex items-center justify-center">
                <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[8px] border-l-white ml-0.5" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                SV<span className="text-rose-500">Tech</span> Media
              </span>
            </div>

            <div>
              <h1 className="font-display font-bold text-2xl leading-snug">
                {isSignUp ? t.auth.joinPlatform : t.auth.welcomeBack}
              </h1>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {isSignUp ? t.auth.subtitleSignUp : t.auth.subtitleSignIn}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-zinc-800 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-100">Firestore Security Enforced</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    New accounts start safely as Free Viewers; Creator Studio upgrades are reviewed by Admins.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Film className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-100">Telebirr PRO & Resume History</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Sync watch history, playlists, and unlocked PRO courses across sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-zinc-800 text-[11px] text-zinc-500">
            {t.tagline}
          </div>
        </div>

        {/* Right Auth Form */}
        <div className="md:col-span-7 p-6 sm:p-8 space-y-5">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => navigate('signin')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !isSignUp
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {t.auth.signIn}
            </button>
            <button
              type="button"
              onClick={() => navigate('signup')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isSignUp
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {t.auth.createAccount}
            </button>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleGoogleAuth}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50"
          >
            <span className="w-5 h-5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center">
              G
            </span>
            <span>{t.auth.continueWithGoogle}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-[11px] text-zinc-400">{t.auth.orWithEmail}</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {authError && (
            <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          <form
            onSubmit={isSignUp ? handleSignUpSubmit : handleSignInSubmit}
            className="space-y-3"
          >
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.auth.fullName}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="e.g. Samuel Tesfaye"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t.auth.passwordLabel}
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => navigate('forgot-password')}
                    className="text-[11px] font-semibold text-rose-600 hover:underline"
                  >
                    {t.auth.forgotPassword}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-600"
                />
              </div>
            </div>

            {/* Optional Creator Studio Application Request on Sign Up */}
            {isSignUp && (
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestCreator}
                    onChange={e => setRequestCreator(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      {t.auth.requestCreatorAccess}
                    </span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">
                      {t.auth.requestCreatorDesc}
                    </span>
                  </div>
                </label>

                {requestCreator && (
                  <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <input
                      type="text"
                      value={channelName}
                      onChange={e => setChannelName(e.target.value)}
                      placeholder={t.auth.channelNameLabel}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    />
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder={t.auth.bioLabel}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <span>
                {submitting
                  ? t.common.loading
                  : isSignUp
                  ? t.auth.signUpBtn
                  : t.auth.signInBtn}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
