import React from 'react';
import { ReactionType } from '../../types';

export function FacebookLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-label="Facebook">
      <path
        fill="#1877F2"
        d="M36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.989 6.588 16.438 15.188 17.788V23.21H10.59V18h4.598v-3.973c0-4.538 2.704-7.045 6.839-7.045 1.98 0 4.053.354 4.053.354v4.457h-2.284c-2.25 0-2.951 1.396-2.951 2.831V18h5.023l-.803 5.21h-4.22v12.578C29.412 34.438 36 26.989 36 18z"
      />
      <path
        fill="#FFFFFF"
        d="M25.075 23.21l.803-5.21h-5.023v-3.377c0-1.435.701-2.831 2.951-2.831h2.284V7.335s-2.073-.354-4.053-.354c-4.135 0-6.839 2.507-6.839 7.045V18h-4.598v5.21h4.598v12.578a18.258 18.258 0 005.625 0V23.21h4.22z"
      />
    </svg>
  );
}

export function VerifiedBadge({ className = 'w-4 h-4 text-blue-500' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Verified">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.8l-4.2-4.2 1.4-1.4 2.8 2.8 6.8-6.8 1.4 1.4-8.2 8.2z" />
    </svg>
  );
}

export function PrivacyIcon({ type = 'public', className = 'w-3.5 h-3.5' }: { type?: 'public' | 'friends' | 'custom'; className?: string }) {
  if (type === 'friends') {
    return (
      <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 100-6 3 3 0 000 6zM5.216 14A2.238 2.238 0 015 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 005 9c-4 0-5 3-5 4s1 1 1 1h4.216zM4.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 0110.87-4.832l-2.03 2.031A4 4 0 007 5v1a1 1 0 01-1 1H4.5a.5.5 0 00-.5.5v1.75a.5.5 0 00.5.5H6v2a1 1 0 01-1 1H3.6a6.51 6.51 0 01-2.1-4.25zm6.5 6.5c-.39 0-.77-.04-1.14-.11l.64-.64V12a1 1 0 011-1h2a1 1 0 011 1v.54A6.47 6.47 0 018 14.5zm5.37-2.31A6.47 6.47 0 0112 13.5v-1.5a2 2 0 00-2-2h-1V9a2 2 0 00-2-2H5.5V6a2 2 0 002-2h1a2 2 0 001.41-.59l1.7-1.7A6.47 6.47 0 0114.5 8c0 1.55-.54 2.97-1.43 4.19z" />
    </svg>
  );
}

export const ReactionIcon: React.FC<{ type: ReactionType; className?: string }> = ({ type, className = 'w-4 h-4' }) => {
  switch (type) {
    case 'like':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-blue-600 text-white shadow-sm ring-1 ring-white ${className}`}>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3/4 h-3/4">
            <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.885 7.24 2.5 7.733 2.5 8.27v6.23c0 .828.672 1.5 1.5 1.5h7.135c.813 0 1.527-.542 1.745-1.326l1.523-5.485A1.5 1.5 0 0012.96 7.5H10.5v-4.5c0-.986-.71-1.848-1.636-2.954z" />
          </svg>
        </span>
      );
    case 'love':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-rose-500 text-white shadow-sm ring-1 ring-white ${className}`}>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3/4 h-3/4">
            <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
          </svg>
        </span>
      );
    case 'care':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-amber-400 text-amber-950 font-bold shadow-sm ring-1 ring-white ${className}`}>
          <span className="text-[10px] leading-none">🥰</span>
        </span>
      );
    case 'haha':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-amber-400 text-amber-950 font-bold shadow-sm ring-1 ring-white ${className}`}>
          <span className="text-[10px] leading-none">😆</span>
        </span>
      );
    case 'wow':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-amber-400 text-amber-950 font-bold shadow-sm ring-1 ring-white ${className}`}>
          <span className="text-[10px] leading-none">😮</span>
        </span>
      );
    case 'sad':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-amber-400 text-amber-950 font-bold shadow-sm ring-1 ring-white ${className}`}>
          <span className="text-[10px] leading-none">😢</span>
        </span>
      );
    case 'angry':
      return (
        <span className={`inline-flex items-center justify-center rounded-full bg-orange-600 text-white font-bold shadow-sm ring-1 ring-white ${className}`}>
          <span className="text-[10px] leading-none">😡</span>
        </span>
      );
    default:
      return null;
  }
};
