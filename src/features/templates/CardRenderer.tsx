import React, { forwardRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Post, DesignSettings } from '../../types';
import { ClassicFacebookCard } from './ClassicFacebookCard';
import { MinimalCard } from './MinimalCard';
import { DarkCard } from './DarkCard';
import { NewsCard } from './NewsCard';
import { StoryCard } from './StoryCard';
import { QuoteCard } from './QuoteCard';

interface CardRendererProps {
  post: Post;
  settings: DesignSettings;
  previewScale?: number;
}

export const CardRenderer = forwardRef<HTMLDivElement, CardRendererProps>(
  ({ post, settings, previewScale = 1 }, ref) => {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    // Generate QR code if enabled
    useEffect(() => {
      if (settings.showQrCode && post.sourceUrl) {
        QRCode.toDataURL(post.sourceUrl, {
          width: 256,
          margin: 1,
          color: {
            dark: settings.cardTheme === 'dark' ? '#ffffff' : '#0f172a',
            light: '#00000000', // transparent
          },
        })
          .then(setQrDataUrl)
          .catch(() => setQrDataUrl(''));
      } else {
        setQrDataUrl('');
      }
    }, [settings.showQrCode, post.sourceUrl, settings.cardTheme]);

    // Aspect Ratio calculations
    const getAspectRatioStyle = (): React.CSSProperties => {
      switch (settings.aspectRatio) {
        case '1:1':
          return { aspectRatio: '1 / 1', minHeight: '600px' };
        case '4:5':
          return { aspectRatio: '4 / 5', minHeight: '750px' };
        case '9:16':
          return { aspectRatio: '9 / 16', minHeight: '960px' };
        case '16:9':
          return { aspectRatio: '16 / 9', minHeight: '540px' };
        case 'auto':
        default:
          return { minHeight: 'auto' };
      }
    };

    // Background style
    const getBackgroundStyle = (): React.CSSProperties => {
      if (settings.backgroundType === 'solid') {
        return { backgroundColor: settings.backgroundColor };
      }
      if (settings.backgroundType === 'transparent') {
        return {
          background: 'transparent',
          backgroundImage:
            'radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        };
      }
      // Gradient / Mesh
      return {
        background: `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientStart} 0%, ${settings.gradientEnd} 100%)`,
      };
    };

    // Card Container Styling
    const getCardStyle = (): React.CSSProperties => {
      let bg = settings.cardBackground;
      if (settings.cardTheme === 'dark') bg = '#090d16';
      if (settings.cardTheme === 'glass') bg = 'rgba(255, 255, 255, 0.75)';

      const shadowMap = {
        none: 'none',
        subtle: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        soft: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        dramatic: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        glow: '0 0 40px rgba(59, 130, 246, 0.35)',
      };

      return {
        backgroundColor: bg,
        borderRadius: `${settings.cardRadius}px`,
        padding: `${settings.cardPadding}px`,
        boxShadow: shadowMap[settings.cardShadow] || shadowMap.soft,
        border: settings.cardBorder ? `1px solid ${settings.cardBorderColor}` : 'none',
      };
    };

    // Render template
    const renderTemplateContent = () => {
      switch (settings.template) {
        case 'minimal':
          return <MinimalCard post={post} settings={settings} />;
        case 'dark':
          return <DarkCard post={post} settings={settings} />;
        case 'news':
          return <NewsCard post={post} settings={settings} />;
        case 'story':
          return <StoryCard post={post} settings={settings} />;
        case 'quote':
          return <QuoteCard post={post} settings={settings} />;
        case 'classic':
        default:
          return <ClassicFacebookCard post={post} settings={settings} />;
      }
    };

    return (
      <div
        id="postframe-canvas-wrapper"
        ref={ref}
        className="w-full max-w-[850px] mx-auto flex items-center justify-center p-6 sm:p-10 relative overflow-hidden transition-all select-none"
        style={{
          ...getBackgroundStyle(),
          ...getAspectRatioStyle(),
        }}
      >
        {/* Subtle Background Pattern */}
        {settings.patternType === 'dots' && (
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          />
        )}
        {settings.patternType === 'grid' && (
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        )}

        {/* Ambient Glow Aura */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Inner Card Container */}
        <div
          id="postframe-inner-card"
          className="relative w-full max-w-[650px] z-10 overflow-hidden flex flex-col backdrop-blur-sm"
          style={getCardStyle()}
        >
          {renderTemplateContent()}

          {/* QR Code Stamp */}
          {settings.showQrCode && qrDataUrl && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 font-mono">
                Scan to open original Facebook post
              </div>
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-14 h-14 object-contain rounded p-1 bg-white dark:bg-slate-800 shadow-sm"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

CardRenderer.displayName = 'CardRenderer';
