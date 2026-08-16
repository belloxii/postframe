import React, { useState, useEffect } from 'react';
import { SAMPLE_POSTS } from './lib/sample-data';
import { DEFAULT_DESIGN_SETTINGS } from './lib/constants';
import { Post, DesignSettings } from './types';
import { UrlImportBar } from './features/post-import/UrlImportBar';
import { CustomizationSidebar } from './features/customization/CustomizationSidebar';
import { PreviewStage } from './features/post-preview/PreviewStage';
import { ManualImportModal } from './features/post-import/ManualImportModal';
import { ScreenshotScannerModal } from './features/post-import/ScreenshotScannerModal';
import { ChromeExtensionModal } from './features/post-import/ChromeExtensionModal';
import { Chrome, CheckCircle2, Sparkles, X } from 'lucide-react';

export default function App() {
  const [currentPost, setCurrentPost] = useState<Post>(SAMPLE_POSTS[0]);
  const [designSettings, setDesignSettings] = useState<DesignSettings>(DEFAULT_DESIGN_SETTINGS);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extensionToast, setExtensionToast] = useState<{ message: string; author?: string } | null>(null);

  // Check for incoming Chrome Extension imports on load
  useEffect(() => {
    const handleUrlImport = async () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);

      // Pattern 1: /import/:id
      const match = pathname.match(/^\/import\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const importId = match[1];
        setIsLoading(true);
        try {
          const res = await fetch(`/api/import/${importId}`);
          const data = await res.json();
          if (data.success && data.post) {
            const raw = data.post;
            const convertedPost: Post = {
              id: raw.id || `ext-${Date.now()}`,
              source: 'facebook',
              sourceUrl: raw.sourceUrl || 'https://www.facebook.com',
              author: raw.author?.name || 'Facebook User',
              authorAvatarUrl: raw.author?.avatarUrl || '',
              authorProfileUrl: raw.author?.profileUrl,
              verified: !!raw.author?.verified,
              text: raw.text || '',
              images: (raw.images || []).map((img: any, idx: number) => ({
                id: `img-${idx}`,
                url: img.url,
                width: img.width,
                height: img.height,
                alt: img.alt,
              })),
              publishedAt: raw.publishedAt || 'Recently on Facebook',
              reactions: raw.engagement?.reactions || 1250,
              comments: raw.engagement?.comments || 48,
              shares: raw.engagement?.shares || 16,
              topReactions: raw.engagement?.topReactions,
              privacy: raw.privacy || 'public',
            };

            setCurrentPost(convertedPost);
            setExtensionToast({
              message: 'Post successfully captured from Facebook tab!',
              author: convertedPost.author,
            });

            // Clean URL without reload
            window.history.replaceState({}, document.title, '/');
          }
        } catch (err) {
          console.error('Failed to load extension import:', err);
        } finally {
          setIsLoading(false);
        }
      }

      // Pattern 2: ?import_payload=... fallback
      if (searchParams.has('import_payload')) {
        try {
          const rawPayload = searchParams.get('import_payload');
          if (rawPayload) {
            const raw = JSON.parse(decodeURIComponent(rawPayload));
            const convertedPost: Post = {
              id: raw.id || `ext-${Date.now()}`,
              source: 'facebook',
              sourceUrl: raw.sourceUrl || 'https://www.facebook.com',
              author: raw.author?.name || 'Facebook User',
              authorAvatarUrl: raw.author?.avatarUrl || '',
              authorProfileUrl: raw.author?.profileUrl,
              verified: !!raw.author?.verified,
              text: raw.text || '',
              images: (raw.images || []).map((img: any, idx: number) => ({
                id: `img-${idx}`,
                url: img.url,
                width: img.width,
                height: img.height,
                alt: img.alt,
              })),
              publishedAt: raw.publishedAt || 'Recently on Facebook',
              reactions: raw.engagement?.reactions || 1250,
              comments: raw.engagement?.comments || 48,
              shares: raw.engagement?.shares || 16,
              topReactions: raw.engagement?.topReactions,
              privacy: raw.privacy || 'public',
            };
            setCurrentPost(convertedPost);
            setExtensionToast({
              message: 'Post successfully captured from Facebook tab!',
              author: convertedPost.author,
            });
            window.history.replaceState({}, document.title, '/');
          }
        } catch (err) {
          console.error('Payload parse error:', err);
        }
      }
    };

    handleUrlImport();
  }, []);

  // Global paste listener: if user pastes an image anywhere on the window, open Screenshot Scanner automatically!
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          setIsScannerModalOpen(true);
          break;
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Top URL Import & Navigation Bar */}
      <UrlImportBar
        onPostLoaded={(post) => setCurrentPost(post)}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        onOpenScannerModal={() => setIsScannerModalOpen(true)}
        onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      {/* Chrome Extension Success Notification Toast */}
      {extensionToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-emerald-300">Chrome Extension Captured:</span>{' '}
            <span>{extensionToast.author}</span>
          </div>
          <button
            onClick={() => setExtensionToast(null)}
            className="p-1 text-white/50 hover:text-white rounded ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Workspace: Canvas Stage on left, Design Studio on right */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <PreviewStage
          post={currentPost}
          settings={designSettings}
          onOpenManualModal={() => setIsManualModalOpen(true)}
          onResetToSample={() => setCurrentPost(SAMPLE_POSTS[0])}
        />

        <CustomizationSidebar
          settings={designSettings}
          onChange={(newSettings) => setDesignSettings(newSettings)}
        />
      </div>

      {/* 3. Interactive Modals */}
      <ChromeExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        onLoadExtractedPost={(post) => {
          setCurrentPost(post);
          setExtensionToast({
            message: 'Post successfully parsed from DOM!',
            author: post.author,
          });
        }}
      />

      <ManualImportModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        post={currentPost}
        onSave={(updated) => setCurrentPost(updated)}
      />

      <ScreenshotScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onPostExtracted={(extracted) => setCurrentPost(extracted)}
      />
    </div>
  );
}

