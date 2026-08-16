import React from 'react';
import { Post, DesignSettings } from '../../types';
import { FacebookLogo, VerifiedBadge, PrivacyIcon, ReactionIcon } from './FacebookIcon';
import { PostImagesGrid } from '../image-layouts/PostImagesGrid';
import { formatEngagementNumber, formatDisplayUrl } from '../../lib/formatter';

interface TemplateProps {
  post: Post;
  settings: DesignSettings;
}

export const ClassicFacebookCard: React.FC<TemplateProps> = ({ post, settings }) => {
  const getAvatarUrl = (url?: string) => {
    if (!url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || 'User')}&background=1877F2&color=fff&size=128&bold=true`;
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
      case '2xl': return 'text-2xl leading-normal';
      default: return 'text-base leading-relaxed';
    }
  };

  const isDark = settings.cardTheme === 'dark';

  return (
    <div
      className={`w-full flex flex-col transition-all ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
      style={{
        fontFamily: settings.fontFamily,
      }}
    >
      {/* 1. Header (Author, Avatar, Verified Badge, Date, Privacy, FB Logo) */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {settings.showAvatar && (
            <div className="relative flex-shrink-0">
              <img
                src={getAvatarUrl(post.authorAvatarUrl)}
                alt={post.author}
                crossOrigin="anonymous"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20 shadow-sm"
              />
              {settings.showFacebookLogo && (
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm">
                  <FacebookLogo className="w-4 h-4" />
                </div>
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-[17px] tracking-tight hover:underline cursor-pointer truncate">
                {post.author || 'Facebook User'}
              </span>
              {settings.showVerification && post.verified && (
                <VerifiedBadge className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
              {post.authorHandle && (
                <span className="text-xs text-slate-500 font-normal truncate">
                  {post.authorHandle}
                </span>
              )}
            </div>

            {settings.showDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal mt-0.5">
                <span>{post.publishedAt || 'Just now'}</span>
                <span>·</span>
                <PrivacyIcon type={post.privacy || 'public'} className="w-3 h-3 text-slate-400" />
                {post.location && (
                  <>
                    <span>·</span>
                    <span className="truncate">{post.location}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Facebook Corner Branding Badge */}
        {settings.showFacebookLogo && !settings.showAvatar && (
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full text-xs font-semibold">
            <FacebookLogo className="w-3.5 h-3.5" />
            <span>Facebook</span>
          </div>
        )}
      </div>

      {/* 2. Middle: Post Body Text */}
      {post.text && (
        <div
          className={`mb-4 whitespace-pre-line break-words text-slate-800 dark:text-slate-150 ${getFontSizeClass()}`}
          style={{
            textAlign: settings.textAlignment,
            lineHeight: settings.lineHeight,
          }}
        >
          {post.text}
        </div>
      )}

      {/* 3. Media: Attached Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          <PostImagesGrid
            images={post.images}
            layout={settings.imageLayout}
            borderRadius={settings.imageBorderRadius}
            spacing={settings.imageSpacing}
            maxVisible={settings.maxVisibleImages}
          />
        </div>
      )}

      {/* 4. Bottom: Engagement Footer (Reactions, Comments, Shares) */}
      {settings.showEngagement && settings.engagementFormat !== 'hidden' && (
        <div className="pt-3 mt-auto border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          {/* Reaction Icons Stack & Reaction Count */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center -space-x-1.5 overflow-hidden py-0.5">
              {(post.topReactions && post.topReactions.length > 0
                ? post.topReactions
                : settings.selectedReactions
              ).map((type, idx) => (
                <ReactionIcon key={idx} type={type} className="w-5 h-5" />
              ))}
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatEngagementNumber(post.reactions, settings.engagementFormat)}
            </span>
          </div>

          {/* Comments & Shares */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {post.comments > 0 && (
              <span>
                {formatEngagementNumber(post.comments, settings.engagementFormat)} comments
              </span>
            )}
            {post.shares > 0 && (
              <span>
                {formatEngagementNumber(post.shares, settings.engagementFormat)} shares
              </span>
            )}
          </div>
        </div>
      )}

      {/* 5. Original Post Source URL or QR Badge (Optional) */}
      {(settings.showOriginalUrl || settings.showWatermark) && (
        <div className="mt-3 pt-2 border-t border-slate-100/60 dark:border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          {settings.showOriginalUrl && post.sourceUrl && (
            <span className="truncate max-w-[70%]">
              {formatDisplayUrl(post.sourceUrl)}
            </span>
          )}
          {settings.showWatermark && (
            <span className="ml-auto font-sans font-semibold tracking-wider text-slate-400/80 uppercase text-[10px]">
              {settings.watermarkText || 'PostFrame'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
