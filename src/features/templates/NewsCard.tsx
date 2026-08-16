import React from 'react';
import { Post, DesignSettings } from '../../types';
import { FacebookLogo, VerifiedBadge } from './FacebookIcon';
import { PostImagesGrid } from '../image-layouts/PostImagesGrid';
import { formatEngagementNumber, formatDisplayUrl } from '../../lib/formatter';

interface TemplateProps {
  post: Post;
  settings: DesignSettings;
}

export const NewsCard: React.FC<TemplateProps> = ({ post, settings }) => {
  const isDark = settings.cardTheme === 'dark';

  // Extract first sentence or paragraph as headline if multiple paragraphs exist
  const paragraphs = (post.text || '').split(/\n\n+/);
  const headline = paragraphs[0] || '';
  const body = paragraphs.slice(1).join('\n\n');

  return (
    <div
      className={`w-full flex flex-col justify-between ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
      style={{
        fontFamily: settings.fontFamily,
      }}
    >
      {/* 1. News Category / Publisher Masthead */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-slate-900 dark:border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-extrabold uppercase tracking-widest text-xs px-2 py-0.5 bg-blue-600 text-white rounded">
            NEWSWIRE
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {post.author}
          </span>
          {settings.showVerification && post.verified && (
            <VerifiedBadge className="w-3.5 h-3.5 text-blue-600" />
          )}
        </div>

        {settings.showDate && (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {post.publishedAt}
          </span>
        )}
      </div>

      {/* 2. Headline */}
      <h2
        className="font-bold text-2xl sm:text-3xl tracking-tight leading-tight mb-4 text-slate-950 dark:text-white"
        style={{ textAlign: settings.textAlignment }}
      >
        {headline}
      </h2>

      {/* 3. Hero Feature Image */}
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

      {/* 4. Sub-body or extended text */}
      {body && (
        <div
          className="mb-4 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line"
          style={{ textAlign: settings.textAlignment }}
        >
          {body}
        </div>
      )}

      {/* 5. Editorial Stats Byline */}
      <div className="pt-3 mt-auto border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          {settings.showFacebookLogo && (
            <div className="flex items-center gap-1 text-blue-600 font-bold">
              <FacebookLogo className="w-4 h-4" />
              <span>Facebook Dispatch</span>
            </div>
          )}
        </div>

        {settings.showEngagement && settings.engagementFormat !== 'hidden' && (
          <div className="flex items-center gap-3">
            <span>
              <strong>{formatEngagementNumber(post.reactions, settings.engagementFormat)}</strong> interactions
            </span>
            <span>·</span>
            <span>
              <strong>{formatEngagementNumber(post.comments, settings.engagementFormat)}</strong> comments
            </span>
          </div>
        )}
      </div>

      {settings.showOriginalUrl && post.sourceUrl && (
        <div className="mt-2 text-[11px] font-mono text-slate-400 truncate">
          {formatDisplayUrl(post.sourceUrl)}
        </div>
      )}
    </div>
  );
};
