import React, { useRef, useState } from 'react';
import {
  Download,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Loader2,
  Check,
  Share2,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { CardRenderer } from '../templates/CardRenderer';
import { Post, DesignSettings } from '../../types';
import { downloadCardImage, copyCardToClipboard } from '../export/export-utils';

interface PreviewStageProps {
  post: Post;
  settings: DesignSettings;
  onOpenManualModal: () => void;
  onResetToSample: () => void;
}

export const PreviewStage: React.FC<PreviewStageProps> = ({
  post,
  settings,
  onOpenManualModal,
  onResetToSample,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setExportError(null);

    const filename = `postframe-${post.author.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'facebook-post'}`;
    const res = await downloadCardImage(cardRef.current, {
      resolutionMultiplier: settings.exportResolution,
      filename,
    });

    setIsExporting(false);
    if (!res.success) {
      setExportError(res.error || 'Failed to download image.');
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;
    setIsCopying(true);
    setExportError(null);

    const res = await copyCardToClipboard(cardRef.current, {
      resolutionMultiplier: 2,
    });

    setIsCopying(false);
    if (res.success) {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    } else {
      setExportError(res.error || 'Failed to copy image to clipboard.');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] relative overflow-hidden">
      {/* Top Floating Stage Action Bar */}
      <div className="border-b border-white/10 bg-[#0a0a0a]/60 backdrop-blur-xl px-4 py-2.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 font-mono">
            Live Preview
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">
            {settings.aspectRatio.toUpperCase()} · {settings.exportResolution}x HD
          </span>
        </div>

        {/* Quick Stage Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 15))}
              className="p-1 text-white/60 hover:text-white rounded hover:bg-white/10"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-white/80">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(150, z + 15))}
              className="p-1 text-white/60 hover:text-white rounded hover:bg-white/10"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenManualModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-white/50" />
            <span>Edit Text</span>
          </button>

          {/* Copy Image Button */}
          <button
            id="btn-copy-image"
            type="button"
            onClick={handleCopy}
            disabled={isCopying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/10 transition-colors disabled:opacity-50"
          >
            {isCopying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : copiedSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-white/50" />
            )}
            <span>{copiedSuccess ? 'Copied PNG!' : 'Copy Image'}</span>
          </button>

          {/* Master Download Button */}
          <button
            id="btn-download-hd"
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Rendering {settings.exportResolution}x HD...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative pattern-dots">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,119,242,0.06),transparent_65%)] pointer-events-none" />

        {/* Error notification banner */}
        {exportError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-rose-950/90 border border-rose-800 text-rose-100 rounded-xl text-xs shadow-xl flex items-center gap-2">
            <span>{exportError}</span>
            <button onClick={() => setExportError(null)} className="underline ml-2">
              Dismiss
            </button>
          </div>
        )}

        {/* Scaled Render Container */}
        <div
          className="transition-transform duration-150 origin-center flex items-center justify-center max-w-full"
          style={{
            transform: `scale(${zoom / 100})`,
          }}
        >
          <CardRenderer ref={cardRef} post={post} settings={settings} />
        </div>
      </div>
    </div>
  );
};
