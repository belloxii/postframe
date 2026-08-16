import React from 'react';
import { Post, DesignSettings } from '../../types';
import { VerifiedBadge } from './FacebookIcon';
import { PostImagesGrid } from '../image-layouts/PostImagesGrid';
import { formatEngagementNumber, formatDisplayUrl } from '../../lib/formatter';

interface TemplateProps {
  post: Post;
  settings: DesignSettings;
}

export const MinimalCard: React.FC<TemplateProps> = ({ post, settings }) => {
  const getAvatarUrl = (url?: string) => {
    if (!url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || 'User')}&background=0f172a&color=fff&size=128&bold=true`;
    }
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
      return url;
    }
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm': return 'text-base leading-relaxed';
      case 'lg': return 'text-2xl font-medium leading-snug tracking-tight';
      case 'xl': return 'text-3xl font-semibold leading-tight tracking-tight';
      case '2xl': return 'text-4xl font-bold leading-tight tracking-tight';
      default: return 'text-xl font-medium leading-relaxed tracking-tight';
    }
  };

  const isDark = settings.cardTheme === 'dark';

  return (
    <div
      className={`w-full flex flex-col justify-between transition-all ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
      style={{
        fontFamily: settings.fontFamily,
      }}
    >
      {/* 1. Subtle Minimal Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {settings.showAvatar && (
            <img
              src={getAvatarUrl(post.authorAvatarUrl)}
              alt={post.author}
              crossOrigin="anonymous"
              className="w-10 h-10 rounded-full object-cover grayscale-[20%]"
            />
          )}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight">
              <span>{post.author || 'Anonymous'}</span>
              {settings.showVerification && post.verified && (
                <VerifiedBadge className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />
              )}
            </div>
            {settings.showDate && (
              <span className="text-xs text-slate-400 font-mono tracking-tight">
                {post.publishedAt}
              </span>
            )}
          </div>
        </div>

        {settings.showFacebookLogo && (
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            Facebook Post
          </span>
        )}
      </div>

      {/* 2. Primary Large Typography Text */}
      {post.text && (
        <div
          className={`mb-6 whitespace-pre-line break-words text-slate-900 dark:text-slate-50 font-normal ${getFontSizeClass()}`}
          style={{
            textAlign: settings.textAlignment,
            lineHeight: settings.lineHeight,
          }}
        >
          {post.text}
        </div>
      )}

      {/* 3. Media: High Definition Full Width Image */}
      {post.images && post.images.length > 0 && (
        <div className="mb-6">
          <PostImagesGrid
            images={post.images}
            layout={settings.imageLayout}
            borderRadius={Math.max(4, settings.imageBorderRadius - 4)}
            spacing={settings.imageSpacing}
            maxVisible={settings.maxVisibleImages}
          />
        </div>
      )}

      {/* 4. Elegant Minimal Footer */}
      <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
        {settings.showEngagement && settings.engagementFormat !== 'hidden' ? (
          <div className="flex items-center gap-4">
            <span>
              <strong className="text-slate-700 dark:text-slate-300 font-sans">
                {formatEngagementNumber(post.reactions, settings.engagementFormat)}
              </strong>{' '}
              reactions
            </span>
            {post.comments > 0 && (
              <span>
                <strong className="text-slate-700 dark:text-slate-300 font-sans">
                  {formatEngagementNumber(post.comments, settings.engagementFormat)}
                </strong>{' '}
                comments
              </span>
            )}
          </div>
        ) : (
          <div />
        )}

        {settings.showOriginalUrl && post.sourceUrl && (
          <span className="truncate max-w-[200px]">
            {formatDisplayUrl(post.sourceUrl)}
          </span>
        )}
      </div>
    </div>
  );
};
