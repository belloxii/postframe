import React from 'react';
import { Post, DesignSettings } from '../../types';
import { FacebookLogo, VerifiedBadge, ReactionIcon } from './FacebookIcon';
import { PostImagesGrid } from '../image-layouts/PostImagesGrid';
import { formatEngagementNumber } from '../../lib/formatter';

interface TemplateProps {
  post: Post;
  settings: DesignSettings;
}

export const StoryCard: React.FC<TemplateProps> = ({ post, settings }) => {
  const getAvatarUrl = (url?: string) => {
    if (!url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || 'User')}&background=1877F2&color=fff&size=128&bold=true`;
    }
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
      return url;
    }
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  const isDark = settings.cardTheme === 'dark';

  return (
    <div
      className={`w-full flex flex-col justify-between h-full p-2 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}
      style={{ fontFamily: settings.fontFamily }}
    >
      {/* 1. Story Top Status Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-blue-600 shadow-md">
            <img
              src={getAvatarUrl(post.authorAvatarUrl)}
              alt={post.author}
              crossOrigin="anonymous"
              className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-900"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight">
              <span>{post.author}</span>
              {settings.showVerification && post.verified && (
                <VerifiedBadge className="w-3.5 h-3.5 text-blue-500" />
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {post.publishedAt}
            </div>
          </div>
        </div>

        {settings.showFacebookLogo && (
          <div className="p-2 bg-white/10 backdrop-blur-md rounded-full shadow">
            <FacebookLogo className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* 2. Media or Central Card */}
      <div className="my-auto space-y-4">
        {post.images && post.images.length > 0 && (
          <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/10">
            <PostImagesGrid
              images={post.images}
              layout={settings.imageLayout}
              borderRadius={settings.imageBorderRadius}
              spacing={settings.imageSpacing}
              maxVisible={settings.maxVisibleImages}
            />
          </div>
        )}

        {post.text && (
          <div
            className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border border-white/20 dark:border-slate-800 text-base leading-relaxed"
            style={{ textAlign: settings.textAlignment }}
          >
            {post.text}
          </div>
        )}
      </div>

      {/* 3. Bottom Engagement Pill */}
      {settings.showEngagement && settings.engagementFormat !== 'hidden' && (
        <div className="mt-4 pt-3 flex items-center justify-between px-4 py-2.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-1">
              {(post.topReactions && post.topReactions.length > 0
                ? post.topReactions
                : settings.selectedReactions
              ).map((type, idx) => (
                <ReactionIcon key={idx} type={type} className="w-4 h-4" />
              ))}
            </div>
            <span>{formatEngagementNumber(post.reactions, settings.engagementFormat)}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            {post.comments > 0 && <span>{formatEngagementNumber(post.comments, settings.engagementFormat)} comments</span>}
            {post.shares > 0 && <span>{formatEngagementNumber(post.shares, settings.engagementFormat)} shares</span>}
          </div>
        </div>
      )}
    </div>
  );
};
