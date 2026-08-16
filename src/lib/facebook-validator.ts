export interface ParsedFacebookUrl {
  isValid: boolean;
  type: 'post' | 'photo' | 'permalink' | 'watch' | 'reel' | 'story' | 'group_post' | 'unknown';
  pageOrUser?: string;
  postId?: string;
  cleanUrl: string;
  error?: string;
}

const FACEBOOK_HOSTS = [
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'web.facebook.com',
  'touch.facebook.com',
  'fb.com',
  'fb.watch',
  'fb.me',
];

/**
 * Validates and extracts identifiers from a Facebook post URL
 */
export function parseFacebookUrl(rawUrl: string): ParsedFacebookUrl {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      type: 'unknown',
      cleanUrl: '',
      error: 'Please enter a URL.',
    };
  }

  let normalized = rawUrl.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }

  let urlObj: URL;
  try {
    urlObj = new URL(normalized);
  } catch {
    return {
      isValid: false,
      type: 'unknown',
      cleanUrl: rawUrl,
      error: 'Invalid URL format.',
    };
  }

  const hostname = urlObj.hostname.toLowerCase();
  const isFbHost = FACEBOOK_HOSTS.some(
    (h) => hostname === h || hostname.endsWith('.' + h)
  );

  if (!isFbHost) {
    return {
      isValid: false,
      type: 'unknown',
      cleanUrl: normalized,
      error: 'Not a recognized Facebook domain (expected facebook.com or fb.watch).',
    };
  }

  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // 1. permalink.php?story_fbid=... or id=...
  if (pathname.includes('permalink.php')) {
    const fbid = searchParams.get('story_fbid') || searchParams.get('fbid') || searchParams.get('id');
    return {
      isValid: true,
      type: 'permalink',
      postId: fbid || undefined,
      cleanUrl: normalized,
    };
  }

  // 2. /{page}/posts/{id} or /{page}/posts/pfbid...
  const postsMatch = pathname.match(/^\/([^/]+)\/posts\/([^/?]+)/i);
  if (postsMatch) {
    return {
      isValid: true,
      type: 'post',
      pageOrUser: postsMatch[1],
      postId: postsMatch[2],
      cleanUrl: `https://www.facebook.com/${postsMatch[1]}/posts/${postsMatch[2]}`,
    };
  }

  // 3. /{page}/photos/.../{id} or photo.php?fbid=...
  if (pathname.includes('/photos/') || pathname.includes('photo.php')) {
    const photoMatch = pathname.match(/\/photos\/(?:[^/]+\/)?(\d+|pfbid[^/?]+)/i);
    const fbid = searchParams.get('fbid') || (photoMatch ? photoMatch[1] : undefined);
    return {
      isValid: true,
      type: 'photo',
      postId: fbid,
      cleanUrl: normalized,
    };
  }

  // 4. /groups/{group_id}/posts/{post_id} or /groups/{group_id}/permalink/{post_id}
  const groupMatch = pathname.match(/^\/groups\/([^/]+)\/(?:posts|permalink)\/([^/?]+)/i);
  if (groupMatch) {
    return {
      isValid: true,
      type: 'group_post',
      pageOrUser: groupMatch[1],
      postId: groupMatch[2],
      cleanUrl: normalized,
    };
  }

  // 5. /watch/?v={id} or fb.watch/{id}
  if (hostname === 'fb.watch' || pathname.startsWith('/watch')) {
    const videoId = searchParams.get('v') || pathname.replace(/^\//, '');
    return {
      isValid: true,
      type: 'watch',
      postId: videoId,
      cleanUrl: normalized,
    };
  }

  // 6. /reel/{id}
  const reelMatch = pathname.match(/^\/reel\/([^/?]+)/i);
  if (reelMatch) {
    return {
      isValid: true,
      type: 'reel',
      postId: reelMatch[1],
      cleanUrl: normalized,
    };
  }

  // 7. General fallback for facebook links with path
  if (pathname.length > 3) {
    return {
      isValid: true,
      type: 'post',
      cleanUrl: normalized,
    };
  }

  return {
    isValid: false,
    type: 'unknown',
    cleanUrl: normalized,
    error: 'Please provide a specific Facebook post, photo, or permalink URL.',
  };
}
