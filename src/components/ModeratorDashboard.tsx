import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  Flag,
  ShieldAlert,
  Home
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ModeratorDashboard: React.FC = () => {
  const {
    isModerator,
    reports,
    comments,
    resolveModerationReport,
    modifyCommentStatus,
    removeComment,
    removeVideo,
    navigate,
    t
  } = useApp();

  const [tab, setTab] = useState<'reports' | 'comments'>('reports');

  if (!isModerator) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
          <h1 className="font-display font-bold text-lg text-zinc-950 dark:text-white">
            {t.auth.unauthorizedTitle}
          </h1>
          <p className="text-xs text-zinc-500">{t.auth.unauthorizedDesc}</p>
          <button
            type="button"
            onClick={() => navigate('home')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>{t.auth.backHome}</span>
          </button>
        </div>
      </div>
    );
  }

  const allComments = Object.entries(comments).flatMap(([videoId, list]) =>
    list.map(c => ({ ...c, videoId }))
  );
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="font-display font-bold text-xl text-zinc-950 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <span>{t.moderatorStudio.title}</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">{t.moderatorStudio.subtitle}</p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setTab('reports')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              tab === 'reports'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {t.moderatorStudio.reportsQueue} ({pendingReportsCount})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab('comments')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              tab === 'comments'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
            <span>
              {t.moderatorStudio.commentsQueue} ({allComments.length})
            </span>
          </button>
        </div>
      </div>

      {tab === 'reports' && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Target</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Reporter</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold uppercase mr-2">
                      {r.targetType}
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {r.targetTitle || r.targetId}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-600 dark:text-zinc-300 max-w-xs">{r.reason}</td>
                  <td className="p-3 font-mono text-zinc-500">{r.reporterEmail}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : r.status === 'dismissed'
                          ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    {r.targetType === 'video' && (
                      <button
                        type="button"
                        onClick={() => navigate('watch', { videoId: r.targetId })}
                        className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[11px] hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => resolveModerationReport(r.id, 'resolved')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t.moderatorStudio.resolveBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => resolveModerationReport(r.id, 'dismissed')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold inline-flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>{t.moderatorStudio.dismissBtn}</span>
                    </button>
                    {r.targetType === 'video' && (
                      <button
                        type="button"
                        onClick={async () => {
                          await removeVideo(r.targetId);
                          await resolveModerationReport(r.id, 'resolved');
                        }}
                        className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Video</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-400">
                    No moderation reports queued.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'comments' && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Author</th>
                <th className="p-3">Comment</th>
                <th className="p-3">Video ID</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {allComments.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="p-3 font-semibold text-zinc-900 dark:text-white">
                    {c.author.name}
                  </td>
                  <td className="p-3 text-zinc-700 dark:text-zinc-300 max-w-md">{c.text}</td>
                  <td className="p-3 font-mono text-zinc-400">{c.videoId}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.status === 'flagged'
                          ? 'bg-amber-100 text-amber-700'
                          : c.status === 'removed'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {c.status || 'active'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    {c.status !== 'flagged' ? (
                      <button
                        type="button"
                        onClick={() => modifyCommentStatus(c.id, 'flagged')}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        <Flag className="w-3 h-3" />
                        <span>{t.moderatorStudio.flagBtn}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => modifyCommentStatus(c.id, 'active')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 text-[11px] font-semibold"
                      >
                        {t.moderatorStudio.restoreBtn}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeComment(c.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {allComments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-400">
                    No comments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
