import React from 'react';
import { PostImage, ImageLayoutMode } from '../../types';

interface PostImagesGridProps {
  images: PostImage[];
  layout?: ImageLayoutMode;
  borderRadius?: number;
  spacing?: number;
  maxVisible?: number;
  className?: string;
}

export const PostImagesGrid: React.FC<PostImagesGridProps> = ({
  images,
  layout = 'auto',
  borderRadius = 12,
  spacing = 6,
  maxVisible = 4,
  className = '',
}) => {
  if (!images || images.length === 0) return null;

  const count = images.length;
  const visibleImages = images.slice(0, maxVisible);
  const remainingCount = count - maxVisible;

  // Helper to ensure safe proxy image URL if external
  const getProxiedUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
      return url;
    }
    // External images can be routed through safe proxy to avoid canvas taint
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  // Single Image Layout
  if (count === 1 || layout === 'hero') {
    const img = images[0];
    return (
      <div
        className={`w-full overflow-hidden relative shadow-sm ${className}`}
        style={{ borderRadius: `${borderRadius}px` }}
      >
        <img
          src={getProxiedUrl(img.url)}
          alt={img.alt || 'Facebook Post Photo'}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          className="w-full h-auto max-h-[700px] object-cover object-center block"
          loading="eager"
        />
      </div>
    );
  }

  // Two Images Layout
  if (count === 2 || layout === 'split') {
    return (
      <div
        className={`grid grid-cols-2 w-full overflow-hidden ${className}`}
        style={{ gap: `${spacing}px`, borderRadius: `${borderRadius}px` }}
      >
        {images.slice(0, 2).map((img, i) => (
          <div key={img.id || i} className="relative aspect-[4/5] overflow-hidden bg-slate-100">
            <img
              src={getProxiedUrl(img.url)}
              alt={img.alt || `Photo ${i + 1}`}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover block"
              loading="eager"
            />
          </div>
        ))}
      </div>
    );
  }

  // Three Images Layout
  if (count === 3) {
    return (
      <div
        className={`grid grid-cols-3 w-full overflow-hidden ${className}`}
        style={{ gap: `${spacing}px`, borderRadius: `${borderRadius}px` }}
      >
        {/* Main large image */}
        <div className="col-span-2 relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={getProxiedUrl(images[0].url)}
            alt={images[0].alt || 'Lead Photo'}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover block"
            loading="eager"
          />
        </div>
        {/* 2 stacked side images */}
        <div className="col-span-1 flex flex-col" style={{ gap: `${spacing}px` }}>
          {images.slice(1, 3).map((img, i) => (
            <div key={img.id || i} className="relative flex-1 aspect-[4/3] overflow-hidden bg-slate-100">
              <img
                src={getProxiedUrl(img.url)}
                alt={img.alt || `Photo ${i + 2}`}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover block"
                loading="eager"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4 or more images: 2x2 grid with possible overflow counter
  return (
    <div
      className={`grid grid-cols-2 w-full overflow-hidden ${className}`}
      style={{ gap: `${spacing}px`, borderRadius: `${borderRadius}px` }}
    >
      {visibleImages.map((img, i) => {
        const isLastVisible = i === visibleImages.length - 1 && remainingCount > 0;
        return (
          <div
            key={img.id || i}
            className="relative aspect-square overflow-hidden bg-slate-100"
          >
            <img
              src={getProxiedUrl(img.url)}
              alt={img.alt || `Photo ${i + 1}`}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover block"
              loading="eager"
            />
            {isLastVisible && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white font-bold text-2xl tracking-wide select-none">
                <span>+{remainingCount + 1}</span>
                <span className="text-xs font-normal opacity-90">photos</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
