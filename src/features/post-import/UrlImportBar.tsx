import React, { useState } from 'react';
import { Sparkles, Link as LinkIcon, Edit3, Image as ImageIcon, Loader2, AlertCircle, Chrome } from 'lucide-react';
import { parseFacebookUrl } from '../../lib/facebook-validator';
import { SAMPLE_POSTS } from '../../lib/sample-data';
import { Post } from '../../types';

interface UrlImportBarProps {
  onPostLoaded: (post: Post) => void;
  onOpenManualModal: () => void;
  onOpenScannerModal: () => void;
  onOpenExtensionModal: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const UrlImportBar: React.FC<UrlImportBarProps> = ({
  onPostLoaded,
  onOpenManualModal,
  onOpenScannerModal,
  onOpenExtensionModal,
  isLoading,
  setIsLoading,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setWarningMessage(null);

    const validation = parseFacebookUrl(inputUrl);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Please enter a valid Facebook post URL');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/fetch-facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: validation.cleanUrl }),
      });

      const data = await res.json();

      if (data.success && data.post) {
        onPostLoaded(data.post);
      } else if (data.isRestricted || data.requiresManualImport) {
        // Facebook access control restriction encountered
        setWarningMessage(
          data.warning ||
            'Facebook login protection detected. You can use the PostFrame Chrome Extension to capture directly from your active tab or use our manual editor.'
        );
        // Create baseline draft and allow immediate manual editing
        const draftPost: Post = {
          id: `manual-${Date.now()}`,
          source: 'manual',
          sourceUrl: validation.cleanUrl,
          author: data.prefilled?.author || 'Facebook Page',
          authorAvatarUrl: '',
          verified: true,
          text: 'Paste or customize your Facebook post text here to generate high-resolution cards...',
          images: [],
          publishedAt: 'Recently on Facebook',
          reactions: 1450,
          comments: 64,
          shares: 28,
          privacy: 'public',
        };
        onPostLoaded(draftPost);
      } else {
        setErrorMessage(data.error || 'Unable to load post data. Try manual import.');
      }
    } catch (err: any) {
      setErrorMessage('Network error while connecting to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: Post) => {
    setInputUrl(sample.sourceUrl);
    setErrorMessage(null);
    setWarningMessage(null);
    onPostLoaded(sample);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full bg-[#0a0a0a]/95 border-b border-white/10 backdrop-blur-xl sticky top-0 z-30 px-4 py-3 sm:py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Brand & Top Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xl italic text-white shadow-md shadow-blue-600/30">
              P
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-base tracking-tight text-white uppercase">
                  PostFrame
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60 tracking-widest uppercase font-mono font-medium">
                  HD STUDIO
                </span>
              </div>
              <p className="text-[11px] text-white/50 hidden sm:block">
                Turn any Facebook post you're viewing into a beautiful HD image.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Chrome Extension Action Button */}
            <button
              id="btn-open-extension-modal"
              type="button"
              onClick={onOpenExtensionModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Chrome className="w-4 h-4 text-blue-400" />
              <span>Chrome Extension</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <div className="hidden lg:flex items-center gap-2 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Manifest V3 Ready</span>
            </div>
          </div>
        </div>

        {/* Main URL Bar Form */}
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
              <LinkIcon className="w-4 h-4 text-blue-400" />
            </div>
            <input
              id="fb-url-input"
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Paste Facebook post URL or capture via Chrome Extension..."
              className="w-full pl-10 pr-24 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
            />
            {navigator.clipboard && !inputUrl && (
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors font-sans"
              >
                Paste
              </button>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-generate-url"
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-medium text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer font-sans"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Generate HD</span>
                </>
              )}
            </button>

            {/* Quick Manual Importers */}
            <button
              id="btn-scanner-modal"
              type="button"
              onClick={onOpenScannerModal}
              title="Upload a Facebook screenshot for automated AI parsing"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium transition-all"
            >
              <ImageIcon className="w-4 h-4 text-blue-400" />
              <span className="hidden md:inline">Screenshot AI</span>
            </button>

            <button
              id="btn-manual-modal"
              type="button"
              onClick={onOpenManualModal}
              title="Manually customize or craft your post"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium transition-all"
            >
              <Edit3 className="w-4 h-4 text-white/50" />
              <span className="hidden md:inline">Edit Content</span>
            </button>
          </div>
        </form>

        {/* Validation or Warning Feedback */}
        {errorMessage && (
          <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/50 border border-rose-800/60 px-3 py-2 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {warningMessage && (
          <div className="flex items-center justify-between gap-2 text-xs text-amber-300 bg-amber-950/50 border border-amber-800/60 px-3 py-2 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span className="truncate">{warningMessage}</span>
            </div>
            <button
              type="button"
              onClick={onOpenExtensionModal}
              className="underline font-semibold flex-shrink-0 hover:text-white"
            >
              Extension Guide
            </button>
          </div>
        )}

        {/* Quick Sample Posts Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-white/50">
          <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider text-white/40 font-mono">
            Presets:
          </span>
          {SAMPLE_POSTS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectSample(s)}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs transition-colors hover:text-white"
            >
              {idx === 0 && '🌌 NASA Deep Field'}
              {idx === 1 && '⚡ TechCrunch AI'}
              {idx === 2 && '💬 Zuck Quote'}
              {idx === 3 && '🌿 NatGeo Forest'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

