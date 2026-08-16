import React from 'react';
import { Post, DesignSettings } from '../../types';
import { FacebookLogo, VerifiedBadge, ReactionIcon } from './FacebookIcon';
import { PostImagesGrid } from '../image-layouts/PostImagesGrid';
import { formatEngagementNumber, formatDisplayUrl } from '../../lib/formatter';

interface TemplateProps {
  post: Post;
  settings: DesignSettings;
}

export const DarkCard: React.FC<TemplateProps> = ({ post, settings }) => {
  const getAvatarUrl = (url?: string) => {
    if (!url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || 'User')}&background=3b82f6&color=fff&size=128&bold=true`;
    }
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
      return url;
    }
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm': return 'text-sm leading-relaxed';
      case 'lg': return 'text-lg leading-relaxed';
      case 'xl': return 'text-xl leading-relaxed';
      case '2xl': return 'text-2xl leading-relaxed';
      default: return 'text-base leading-relaxed';
    }
  };

  return (
    <div
      className="w-full flex flex-col justify-between text-slate-100"
      style={{
        fontFamily: settings.fontFamily,
      }}
    >
      {/* 1. Header with Neon Accent Glow */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5">
          {settings.showAvatar && (
            <div className="relative">
              <img
                src={getAvatarUrl(post.authorAvatarUrl)}
                alt={post.author}
                crossOrigin="anonymous"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10"
              />
              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 shadow-md">
                <FacebookLogo className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 font-bold text-base tracking-tight text-white">
              <span>{post.author || 'Facebook User'}</span>
              {settings.showVerification && post.verified && (
                <VerifiedBadge className="w-4 h-4 text-sky-400" />
              )}
            </div>
            {settings.showDate && (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <span>{post.publishedAt}</span>
                {post.location && <span>· {post.location}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Tech Glass Pill */}
        {settings.showFacebookLogo && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-sky-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>FB·VERIFIED</span>
          </div>
        )}
      </div>

      {/* 2. Text Body with high contrast */}
      {post.text && (
        <div
          className={`mb-5 whitespace-pre-line break-words text-slate-100 font-normal ${getFontSizeClass()}`}
          style={{
            textAlign: settings.textAlignment,
            lineHeight: settings.lineHeight,
          }}
        >
          {post.text}
        </div>
      )}

      {/* 3. Media Grid */}
      {post.images && post.images.length > 0 && (
        <div className="mb-5 rounded-xl overflow-hidden ring-1 ring-slate-700/60 shadow-2xl">
          <PostImagesGrid
            images={post.images}
            layout={settings.imageLayout}
            borderRadius={settings.imageBorderRadius}
            spacing={settings.imageSpacing}
            maxVisible={settings.maxVisibleImages}
          />
        </div>
      )}

      {/* 4. Sleek Metric Counters */}
      {settings.showEngagement && settings.engagementFormat !== 'hidden' && (
        <div className="pt-4 mt-auto border-t border-slate-800/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center -space-x-1.5">
              {(post.topReactions && post.topReactions.length > 0
                ? post.topReactions
                : settings.selectedReactions
              ).map((type, idx) => (
                <ReactionIcon key={idx} type={type} className="w-5 h-5" />
              ))}
            </div>
            <span className="font-semibold text-white font-mono">
              {formatEngagementNumber(post.reactions, settings.engagementFormat)}
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-slate-400">
            {post.comments > 0 && (
              <span>{formatEngagementNumber(post.comments, settings.engagementFormat)} comments</span>
            )}
            {post.shares > 0 && (
              <span>{formatEngagementNumber(post.shares, settings.engagementFormat)} shares</span>
            )}
          </div>
        </div>
      )}

      {/* 5. URL Footer */}
      {settings.showOriginalUrl && post.sourceUrl && (
        <div className="mt-3 pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span className="truncate max-w-[80%]">{formatDisplayUrl(post.sourceUrl)}</span>
          <span className="text-slate-600">HD EXPORT</span>
        </div>
      )}
    </div>
  );
};
