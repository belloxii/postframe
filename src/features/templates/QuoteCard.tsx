import React from 'react';
import { Post, DesignSettings } from '../../types';
import { FacebookLogo, VerifiedBadge } from './FacebookIcon';
import { formatEngagementNumber } from '../../lib/formatter';

interface TemplateProps {
  post: Post;
  settings: DesignSettings;
}

export const QuoteCard: React.FC<TemplateProps> = ({ post, settings }) => {
  const isDark = settings.cardTheme === 'dark';

  const getAvatarUrl = (url?: string) => {
    if (!url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || 'User')}&background=3b82f6&color=fff&size=128&bold=true`;
    }
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
      return url;
    }
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  return (
    <div
      className={`w-full flex flex-col justify-between h-full p-2 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}
      style={{ fontFamily: settings.fontFamily }}
    >
      {/* 1. Large Serif Quotation Mark */}
      <div className="text-6xl sm:text-7xl font-serif text-blue-500/30 leading-none select-none -mb-4">
        “
      </div>

      {/* 2. Central Focus Quote */}
      <div className="my-auto py-4">
        <p
          className="text-xl sm:text-2xl md:text-3xl font-medium leading-snug tracking-tight text-slate-900 dark:text-slate-100"
          style={{ textAlign: settings.textAlignment }}
        >
          {post.text}
        </p>
      </div>

      {/* 3. Author Byline Footer */}
      <div className="pt-6 mt-auto border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {settings.showAvatar && (
            <img
              src={getAvatarUrl(post.authorAvatarUrl)}
              alt={post.author}
              crossOrigin="anonymous"
              className="w-12 h-12 rounded-full object-cover shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
            />
          )}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-base">
              <span>{post.author}</span>
              {settings.showVerification && post.verified && (
                <VerifiedBadge className="w-4 h-4 text-blue-500" />
              )}
            </div>
            {settings.showDate && (
              <div className="text-xs text-slate-400 font-mono">
                {post.publishedAt}
              </div>
            )}
          </div>
        </div>

        {settings.showFacebookLogo && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <FacebookLogo className="w-4 h-4" />
            <span>Facebook</span>
          </div>
        )}
      </div>
    </div>
  );
};
