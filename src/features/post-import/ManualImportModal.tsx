import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, CheckCircle2, User, Globe, Users, Smile } from 'lucide-react';
import { Post, PostImage, ReactionType } from '../../types';
import { ALL_REACTIONS } from '../../lib/constants';

interface ManualImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onSave: (updatedPost: Post) => void;
}

const COMMON_EMOJIS = ['✨', '🚀', '⚡', '🔥', '💡', '❤️', '🌿', '👏', '🌍', '📈', '🎯', '💫'];

export const ManualImportModal: React.FC<ManualImportModalProps> = ({
  isOpen,
  onClose,
  post,
  onSave,
}) => {
  const [author, setAuthor] = useState(post.author);
  const [authorHandle, setAuthorHandle] = useState(post.authorHandle || '');
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState(post.authorAvatarUrl || '');
  const [verified, setVerified] = useState(post.verified);
  const [publishedAt, setPublishedAt] = useState(post.publishedAt);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'custom'>(post.privacy || 'public');
  const [text, setText] = useState(post.text);
  const [location, setLocation] = useState(post.location || '');
  const [images, setImages] = useState<PostImage[]>(post.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  
  // Engagement
  const [reactions, setReactions] = useState(post.reactions || 0);
  const [comments, setComments] = useState(post.comments || 0);
  const [shares, setShares] = useState(post.shares || 0);
  const [selectedReactions, setSelectedReactions] = useState<ReactionType[]>(
    post.topReactions && post.topReactions.length > 0
      ? post.topReactions
      : ['like', 'love', 'care']
  );

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          const newImg: PostImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            url: loadEvt.target.result as string,
            alt: file.name,
          };
          setImages((prev) => [...prev, newImg]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      if (loadEvt.target?.result) {
        setAuthorAvatarUrl(loadEvt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const newImg: PostImage = {
      id: `img-${Date.now()}`,
      url: newImageUrl.trim(),
      alt: 'Post image',
    };
    setImages((prev) => [...prev, newImg]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const toggleReaction = (type: ReactionType) => {
    if (selectedReactions.includes(type)) {
      if (selectedReactions.length > 1) {
        setSelectedReactions(selectedReactions.filter((r) => r !== type));
      }
    } else {
      setSelectedReactions([...selectedReactions, type]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Post = {
      ...post,
      source: 'manual',
      author: author.trim() || 'Facebook User',
      authorHandle: authorHandle.trim() || undefined,
      authorAvatarUrl: authorAvatarUrl.trim() || undefined,
      verified,
      publishedAt: publishedAt.trim() || 'Just now',
      privacy,
      location: location.trim() || undefined,
      text,
      images,
      reactions: Number(reactions) || 0,
      comments: Number(comments) || 0,
      shares: Number(shares) || 0,
      topReactions: selectedReactions,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050505]">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Edit Post Details & Content
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Customize text, author info, images, and engagement stats for your HD card
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-white/90 text-sm">
          {/* 1. Author Section */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5 font-mono">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Author & Header
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Page / Profile Name</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. NASA, BBC News, Jane Doe"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Handle (Optional)</label>
                <input
                  type="text"
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value)}
                  placeholder="e.g. @NASA"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Avatar & Verification Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Profile Avatar</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={authorAvatarUrl}
                    onChange={(e) => setAuthorAvatarUrl(e.target.value)}
                    placeholder="Image URL or upload..."
                    className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none font-mono"
                  />
                  <label className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-medium text-white cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>File</span>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-xs font-medium text-white/80">Verified Blue Badge</span>
                <button
                  type="button"
                  onClick={() => setVerified(!verified)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    verified ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/50'
                  }`}
                >
                  {verified ? '✓ Verified' : 'Standard'}
                </button>
              </div>
            </div>

            {/* Date & Privacy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Published Timestamp</label>
                <input
                  type="text"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  placeholder="e.g. 2 hrs ago, October 14, 2025"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Privacy Level</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrivacy('public')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border ${
                      privacy === 'public'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-white/5 border-white/10 text-white/50'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivacy('friends')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border ${
                      privacy === 'friends'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-white/5 border-white/10 text-white/50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Friends</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Post Content Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                Post Text & Captions
              </label>
              <div className="flex items-center gap-1 text-xs">
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                <div className="flex items-center gap-1">
                  {COMMON_EMOJIS.slice(0, 6).map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setText((prev) => prev + emo)}
                      className="hover:scale-125 transition-transform"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind? Paste or type the complete post copy here..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none resize-y leading-relaxed font-sans"
            />
          </div>

          {/* 3. Media / Images Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                Attached Images ({images.length})
              </label>
              <label className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer font-medium">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick URL Adder */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste an image URL..."
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white/80 rounded-lg text-xs font-medium"
              >
                Add URL
              </button>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                {images.map((img, idx) => (
                  <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-[#050505]">
                    <img src={img.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full opacity-90 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-[10px] text-white rounded font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Engagement Statistics */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
              Engagement Metrics
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Reactions</label>
                <input
                  type="number"
                  value={reactions}
                  onChange={(e) => setReactions(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Comments</label>
                <input
                  type="number"
                  value={comments}
                  onChange={(e) => setComments(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Shares</label>
                <input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Reaction Types Multi-selector */}
            <div>
              <span className="block text-xs text-white/50 mb-1.5">Highlighted Reaction Icons:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {ALL_REACTIONS.map((r) => {
                  const isSelected = selectedReactions.includes(r.type);
                  return (
                    <button
                      key={r.type}
                      type="button"
                      onClick={() => toggleReaction(r.type)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-white/15 border border-blue-500 text-white ring-1 ring-blue-500/40'
                          : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'
                      }`}
                    >
                      <span>{r.emoji}</span>
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 sticky bottom-0 bg-[#0a0a0a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
