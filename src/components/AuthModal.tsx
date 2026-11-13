import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Film,
  Sparkles,
  AlertCircle,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    authError,
    clearAuthError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
    isAuthenticated,
    emailVerified,
    userProfile,
    navigate,
    t
  } = useApp();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requestCreator, setRequestCreator] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const isSignUp = authModalMode === 'signup';

  const handleModeSwitch = (mode: 'signin' | 'signup') => {
    clearAuthError();
    setAuthModalMode(mode);
  };

  const handleGoogleClick = async () => {
    setSubmitting(true);
    await signInWithGoogle(
      isSignUp && requestCreator && channelName.trim()
        ? { channelName: channelName.trim(), bio: bio.trim() }
        : undefined
    );
    setSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    if (isSignUp) {
      await signUpWithEmail({
        email,
        password,
        displayName: displayName.trim() || email.split('@')[0],
        requestCreator,
        channelName: channelName.trim() || undefined,
        bio: bio.trim() || undefined
      });
    } else {
      await signInWithEmail(email, password);
    }
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-3xl bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 my-auto"
      >
        {/* Left Brand & Role Overview Column */}
        <div className="md:col-span-5 bg-zinc-950 text-white p-6 sm:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-7 bg-gradient-to-br from-rose-600 to-rose-700 rounded-lg flex items-center justify-center">
                  <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[8px] border-l-white ml-0.5" />
                </div>
                <span className="font-display font-bold text-lg tracking-tight">
                  SV<span className="text-rose-500">Tech</span> Media
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="md:hidden p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl leading-snug">
                {isSignUp
                  ? t.auth?.joinPlatform || 'Join SVTech Media'
                  : t.auth?.welcomeBack || 'Welcome back to SVTech Media'}
              </h2>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {isSignUp
                  ? t.auth?.subtitleSignUp || 'Choose your role and start watching, unlocking PRO streams, or publishing content.'
                  : t.auth?.subtitleSignIn || 'Real-time authenticated access to your streams, purchases, and studio.'}
              </p>
            </div>

            <div className="pt-2 space-y-3 border-t border-zinc-800/80 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-100">Role-Based Firestore Security</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Permissions sync in real time for Viewers, Pro Members, Creators, and Admins.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Film className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-100">Custom Cover, Title & ETB Pricing</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Publish posts with custom 16:9 covers and Free or Telebirr PRO pricing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-zinc-800/80 text-[11px] text-zinc-500">
            Watch · Create · Share · Connect
          </div>
        </div>

        {/* Right Interactive Auth Form Column */}
        <div className="md:col-span-7 p-6 sm:p-7 space-y-5 relative">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="hidden md:flex absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {isAuthenticated ? (
            <div className="space-y-5 py-4">
              <div className="flex items-center gap-3.5">
                {userProfile.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-rose-600 text-white font-display font-bold text-lg flex items-center justify-center">
                    {(userProfile.displayName || 'U').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-zinc-950 dark:text-white truncate">
                      {userProfile.displayName}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{userProfile.email}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                      {userProfile.role.replace('_', ' ')}
                    </span>
                    <span className="text-zinc-400" aria-hidden="true">·</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {t.auth?.authenticatedStatus || 'Real-time Firebase Auth active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Account UID</span>
                  <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-200 truncate max-w-[200px]">
                    {userProfile.uid}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Role</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-200">
                    {userProfile.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      navigate('verify-email');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  >
                    {t.auth.verifyTitle}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {t.common.close}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await signOutUser();
                    setIsAuthModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white inline-flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.header.signOut}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Segmented Sign In / Sign Up Switcher */}
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    !isSignUp
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {t.auth?.signIn || 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signup')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isSignUp
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {t.auth?.createAccount || 'Create Account'}
                </button>
              </div>

              {/* Optional Creator Studio Request when Creating Account */}
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

              {/* Primary 1-Click Google Auth Button */}
              <button
                type="button"
                disabled={submitting}
                onClick={handleGoogleClick}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50"
              >
                <span className="w-5 h-5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center">
                  G
                </span>
                <span>{t.auth?.continueWithGoogle || 'Continue with Google'}</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                <span className="text-[11px] text-zinc-400">
                  {t.auth?.orWithEmail || 'Or continue with email'}
                </span>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              </div>

              {/* Error Alert */}
              {authError && (
                <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {t.auth?.fullName || 'Display Name'}
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
                    {t.auth?.emailLabel || 'Email Address'}
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
                      {t.auth?.passwordLabel || 'Password'}
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAuthModalOpen(false);
                          navigate('forgot-password');
                        }}
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <span>
                    {submitting
                      ? t.common.loading
                      : isSignUp
                      ? t.auth?.signUpBtn || 'Create Authenticated Account'
                      : t.auth?.signInBtn || 'Sign In to Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => handleModeSwitch(isSignUp ? 'signin' : 'signup')}
                  className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  {isSignUp
                    ? t.auth?.switchToSignIn || 'Already have an account? Sign In'
                    : t.auth?.switchToSignUp || "Don't have an account? Sign Up"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
