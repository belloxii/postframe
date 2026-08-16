import React, { useState } from 'react';
import { X, Sparkles, Upload, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Post, ReactionType } from '../../types';

interface ScreenshotScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostExtracted: (post: Post) => void;
}

export const ScreenshotScannerModal: React.FC<ScreenshotScannerModalProps> = ({
  isOpen,
  onClose,
  onPostExtracted,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      if (loadEvt.target?.result) {
        setSelectedImage(loadEvt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      if (loadEvt.target?.result) {
        setSelectedImage(loadEvt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            if (loadEvt.target?.result) {
              setSelectedImage(loadEvt.target.result as string);
            }
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    }
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/extract-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: selectedImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
        }),
      });

      const data = await res.json();

      if (data.success && data.extracted) {
        const ext = data.extracted;
        const mappedReactions: ReactionType[] = (ext.topReactions || ['like', 'love', 'care']).filter(
          (r: string) => ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'].includes(r)
        );

        const newPost: Post = {
          id: `ai-extracted-${Date.now()}`,
          source: 'ai-extracted',
          sourceUrl: 'https://facebook.com',
          author: ext.author || 'Facebook Author',
          authorHandle: ext.authorHandle || undefined,
          authorAvatarUrl: '',
          verified: Boolean(ext.verified),
          text: ext.text || '',
          images: selectedImage ? [{ id: `img-scan-1`, url: selectedImage, alt: 'Extracted photo' }] : [],
          publishedAt: ext.publishedAt || 'Recently on Facebook',
          reactions: ext.reactions || 1200,
          topReactions: mappedReactions.length > 0 ? mappedReactions : ['like', 'love'],
          comments: ext.comments || 45,
          shares: ext.shares || 12,
          location: ext.location || undefined,
          privacy: 'public',
        };

        onPostExtracted(newPost);
        onClose();
      } else {
        setErrorMessage(data.error || 'Failed to parse screenshot. Please fill details manually.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error while analyzing screenshot.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onPaste={handlePaste}
    >
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050505]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                AI Screenshot Scanner
              </h3>
              <p className="text-xs text-white/50">
                Upload or paste a Facebook screenshot to auto-extract text & stats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Dropzone */}
        <div className="p-6 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
              selectedImage
                ? 'border-blue-500/50 bg-blue-950/20'
                : 'border-white/15 hover:border-white/30 bg-[#050505]'
            }`}
          >
            {selectedImage ? (
              <div className="space-y-3 w-full flex flex-col items-center">
                <img
                  src={selectedImage}
                  alt="Uploaded screenshot"
                  className="max-h-48 rounded-lg object-contain shadow-md border border-white/15"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 hover:text-white cursor-pointer transition-colors">
                    Change Screenshot
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/50">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">
                    Drag & Drop screenshot here, or{' '}
                    <label className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline">
                      browse files
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    You can also press <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/15 rounded text-white/80 font-mono">Ctrl+V</kbd> to paste from clipboard
                  </p>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/50 border border-rose-900/50 rounded-xl text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#050505] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedImage || isScanning}
            onClick={handleScan}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Post Structure...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Extract & Reconstruct</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
