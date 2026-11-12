import React, { useState } from 'react';
import { X, ListPlus, Plus, Check, Lock, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PlaylistModal: React.FC = () => {
  const {
    playlistModalVideo,
    setPlaylistModalVideo,
    playlists,
    toggleVideoInPlaylist,
    createPlaylist
  } = useApp();

  const [newTitle, setNewTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!playlistModalVideo) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      createPlaylist(newTitle.trim(), '', isPrivate, playlistModalVideo.id);
      setNewTitle('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ListPlus className="w-4 h-4 text-zinc-700 dark:text-zinc-200" />
            <h2 className="font-display font-bold text-sm text-zinc-950 dark:text-white">
              Save video to...
            </h2>
          </div>
          <button
            onClick={() => setPlaylistModalVideo(null)}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Playlists Checklist */}
        <div className="p-5 space-y-3 max-h-60 overflow-y-auto">
          {playlists.map(pl => {
            const isChecked = pl.videoIds.includes(playlistModalVideo.id);
            return (
              <label
                key={pl.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleVideoInPlaylist(pl.id, playlistModalVideo.id)}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    {pl.title}
                  </span>
                </div>
                <div className="text-zinc-400">
                  {pl.isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                </div>
              </label>
            );
          })}
        </div>

        {/* Create New Playlist option */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-red-600"
            >
              <Plus className="w-4 h-4 text-red-600" />
              <span>Create new playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Enter playlist title..."
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={e => setIsPrivate(e.target.checked)}
                    className="rounded text-red-600"
                  />
                  <span>Private</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-2.5 py-1 text-xs text-zinc-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-md text-xs font-semibold bg-red-600 text-white"
                  >
                    Create
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
