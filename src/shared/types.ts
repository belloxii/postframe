/**
 * Shared PostFrame Data Types & Normalized Schema
 * Compliant with Chrome Extension MV3 and Web App standards.
 */

export interface SocialPostImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface SocialPostAuthor {
  name: string;
  profileUrl?: string;
  avatarUrl?: string;
  verified?: boolean;
  handle?: string;
}

export interface SocialPostEngagement {
  reactions?: number;
  reactionsDisplay?: string;
  comments?: number;
  commentsDisplay?: string;
  shares?: number;
  sharesDisplay?: string;
  topReactions?: ('like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry')[];
}

export interface FieldConfidence {
  field: string;
  confidence: number; // 0.0 to 1.0
  source?: string;
}

export interface SocialPostExtraction {
  confidence: number; // Overall 0.0 to 1.0
  fields: FieldConfidence[];
  strategyUsed?: string;
  timestamp?: number;
}

export interface SocialPost {
  source: 'facebook';
  sourceUrl: string;
  author: SocialPostAuthor;
  text: string;
  images: SocialPostImage[];
  publishedAt?: string;
  engagement: SocialPostEngagement;
  extraction: SocialPostExtraction;
  privacy?: 'public' | 'friends' | 'custom';
}

/**
 * Extension Runtime Messaging Protocols
 */
export type ExtensionAction =
  | 'CHECK_PAGE'
  | 'DETECT_POSTS'
  | 'EXTRACT_ACTIVE_POST'
  | 'SELECT_POST_BY_INDEX'
  | 'EXPORT_TO_WEB';

export interface ExtensionMessage<T = any> {
  action: ExtensionAction;
  payload?: T;
}

export interface PageDetectionResult {
  isFacebook: boolean;
  pageUrl: string;
  pageType: 'post' | 'feed' | 'profile' | 'group' | 'video' | 'unknown';
  postCount: number;
}

export interface ExtractPostResponse {
  success: boolean;
  post?: SocialPost;
  multiplePosts?: SocialPost[];
  error?: string;
}

export interface TemporaryImportResponse {
  success: boolean;
  importId: string;
  webAppUrl: string;
  expiresInSeconds: number;
  error?: string;
}
