/**
 * FacebookPostParser
 * Resilient multi-strategy DOM parser for Facebook posts.
 * Extracts only visibly rendered content. Does not read cookies or credentials.
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
  confidence: number;
  source?: string;
}

export interface SocialPostExtraction {
  confidence: number;
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

export class FacebookPostParser {
  /**
   * Parse compact formatted numbers (e.g., "1.2K" -> 1200, "10M" -> 1000000, "1,450" -> 1450)
   */
  public static parseCompactNumber(input: string | null | undefined): { value: number; displayValue: string } | null {
    if (!input) return null;
    const clean = input.trim().replace(/[,\s]/g, '');
    if (!clean) return null;

    // Match numbers with optional suffix (K, M, B)
    const match = clean.match(/^([\d.]+)\s*([KMBkmb])?/);
    if (!match) {
      const numOnly = clean.replace(/[^0-9.]/g, '');
      const val = parseFloat(numOnly);
      return !isNaN(val) ? { value: Math.round(val), displayValue: input.trim() } : null;
    }

    const num = parseFloat(match[1]);
    if (isNaN(num)) return null;

    const unit = (match[2] || '').toUpperCase();
    let multiplier = 1;
    if (unit === 'K') multiplier = 1_000;
    else if (unit === 'M') multiplier = 1_000_000;
    else if (unit === 'B') multiplier = 1_000_000_000;

    return {
      value: Math.round(num * multiplier),
      displayValue: input.trim(),
    };
  }

  /**
   * Determine if the given URL is a supported Facebook page
   */
  public static isFacebookPage(url: string): boolean {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      return (
        host === 'facebook.com' ||
        host.endsWith('.facebook.com') ||
        host === 'fb.com' ||
        host === 'fb.watch' ||
        host === 'fb.me'
      );
    } catch {
      return false;
    }
  }

  /**
   * Find candidate post containers in the document or container element
   */
  public static findPostContainers(root: Document | Element = document): HTMLElement[] {
    const containers: HTMLElement[] = [];

    // Strategy A: Standard feed role="article" or role="region"
    const articles = root.querySelectorAll<HTMLElement>('div[role="article"], [role="feed"] > div, div[data-pagelet*="FeedUnit"]');
    articles.forEach((el) => {
      // Must contain some text or image and be reasonably sized
      if (el.offsetHeight > 80 || el.innerText?.trim().length > 10) {
        containers.push(el);
      }
    });

    // Strategy B: Permalink view single post container
    if (containers.length === 0) {
      const mainContent = root.querySelector<HTMLElement>('div[role="main"], [data-pagelet="root"], #content');
      if (mainContent) {
        containers.push(mainContent);
      }
    }

    // Strategy C: Mobile Facebook post containers
    if (containers.length === 0) {
      const mobilePosts = root.querySelectorAll<HTMLElement>('#m_newsfeed_stream article, article, .story_body_container');
      mobilePosts.forEach((el) => containers.push(el));
    }

    // Strategy D: Fallback to entire body if looking like a single post page
    if (containers.length === 0 && root instanceof Document && root.body) {
      containers.push(root.body);
    }

    return containers;
  }

  /**
   * Primary single-post detection: Finds the most relevant visible post
   */
  public static detectPost(root: Document | Element = document, pageUrl: string = window.location?.href || ''): SocialPost | null {
    const containers = this.findPostContainers(root);
    if (containers.length === 0) return null;

    // Evaluate the first or most prominent post
    return this.parsePostElement(containers[0], pageUrl);
  }

  /**
   * Parse all detected posts in the feed (for multiple post disambiguation)
   */
  public static detectAllPosts(root: Document | Element = document, pageUrl: string = window.location?.href || ''): SocialPost[] {
    const containers = this.findPostContainers(root);
    const results: SocialPost[] = [];

    containers.forEach((container) => {
      const parsed = this.parsePostElement(container, pageUrl);
      if (parsed && (parsed.text.length > 5 || parsed.images.length > 0 || parsed.author.name)) {
        // Ensure uniqueness by author and snippet
        const isDuplicate = results.some(
          (r) => r.author.name === parsed.author.name && r.text.slice(0, 40) === parsed.text.slice(0, 40)
        );
        if (!isDuplicate) {
          results.push(parsed);
        }
      }
    });

    return results;
  }

  /**
   * Parse a single post container DOM element into a normalized SocialPost
   */
  public static parsePostElement(el: HTMLElement, pageUrl: string): SocialPost {
    const fields: FieldConfidence[] = [];

    // 1. Author
    const authorRes = this.extractAuthor(el);
    fields.push({ field: 'author', confidence: authorRes.confidence, source: authorRes.strategy });

    // 2. Avatar
    const avatarRes = this.extractAuthorAvatar(el);
    fields.push({ field: 'authorAvatarUrl', confidence: avatarRes.confidence, source: avatarRes.strategy });

    // 3. Post Text
    const textRes = this.extractText(el);
    fields.push({ field: 'text', confidence: textRes.confidence, source: textRes.strategy });

    // 4. Images
    const imageRes = this.extractImages(el);
    fields.push({ field: 'images', confidence: imageRes.confidence, source: imageRes.strategy });

    // 5. Published Date / Timestamp
    const dateRes = this.extractTimestamp(el);
    fields.push({ field: 'publishedAt', confidence: dateRes.confidence, source: dateRes.strategy });

    // 6. Engagements (Reactions, Comments, Shares)
    const engagementRes = this.extractEngagement(el);
    fields.push({ field: 'engagement', confidence: engagementRes.confidence, source: engagementRes.strategy });

    // 7. Canonical Post URL
    const postUrlRes = this.extractPostUrl(el, pageUrl);
    fields.push({ field: 'sourceUrl', confidence: postUrlRes.confidence, source: postUrlRes.strategy });

    // Calculate aggregate confidence
    const overallConfidence = this.calculateConfidence(fields);

    return {
      source: 'facebook',
      sourceUrl: postUrlRes.url || pageUrl,
      author: {
        name: authorRes.name || 'Facebook User',
        profileUrl: authorRes.profileUrl,
        avatarUrl: avatarRes.url,
        verified: authorRes.verified,
        handle: authorRes.handle,
      },
      text: textRes.text || '',
      images: imageRes.images,
      publishedAt: dateRes.publishedAt || 'Recently on Facebook',
      engagement: engagementRes.engagement,
      extraction: {
        confidence: overallConfidence,
        fields,
        strategyUsed: 'multi-strategy-dom-v3',
        timestamp: Date.now(),
      },
      privacy: 'public',
    };
  }

  /**
   * Extract Author Name, Profile URL, and Verification badge
   */
  public static extractAuthor(el: HTMLElement): { name: string; profileUrl?: string; verified: boolean; handle?: string; confidence: number; strategy: string } {
    let name = '';
    let profileUrl: string | undefined = undefined;
    let verified = false;
    let confidence = 0;
    let strategy = 'none';

    // Strategy 1: Look for strong / h2 / h3 / h4 or anchor tags near top header
    const headerAnchors = el.querySelectorAll<HTMLAnchorElement>(
      'h2 a, h3 a, h4 a, strong a, a[role="link"][tabindex="0"], a[attributionsrc], a.actor__title, .actorName'
    );

    for (let i = 0; i < headerAnchors.length; i++) {
      const a = headerAnchors[i];
      const text = a.innerText?.trim() || a.textContent?.trim() || '';
      // Exclude generic action links
      if (text && text.length < 60 && !['Comment', 'Share', 'Like', 'Follow', 'Join'].includes(text)) {
        name = text;
        profileUrl = a.href;
        confidence = 0.9;
        strategy = 'header-anchor';
        break;
      }
    }

    // Strategy 2: Look for heading tags with text
    if (!name) {
      const headings = el.querySelectorAll<HTMLElement>('h2, h3, h4, [role="heading"]');
      for (let i = 0; i < headings.length; i++) {
        const text = headings[i].innerText?.trim();
        if (text && text.length < 60) {
          name = text;
          confidence = 0.75;
          strategy = 'heading-role';
          break;
        }
      }
    }

    // Strategy 3: Accessible label inspection
    if (!name) {
      const ariaElements = el.querySelectorAll<HTMLElement>('[aria-label]');
      for (let i = 0; i < ariaElements.length; i++) {
        const label = ariaElements[i].getAttribute('aria-label') || '';
        if (label.includes("'s post") || label.includes('profile')) {
          name = label.replace("'s post", '').replace('profile', '').trim();
          confidence = 0.7;
          strategy = 'aria-label';
          break;
        }
      }
    }

    // Check verification badge
    const badge = el.querySelector(
      'svg[aria-label*="Verified"], [aria-label*="Verified account"], [aria-label*="verified"], svg[aria-label="Verified Page"]'
    );
    if (badge) {
      verified = true;
    }

    return { name, profileUrl, verified, confidence, strategy };
  }

  /**
   * Extract Author Avatar Image URL
   */
  public static extractAuthorAvatar(el: HTMLElement): { url?: string; confidence: number; strategy: string } {
    // Strategy 1: SVG image or img with aria-label containing author or profile
    const avatarImages = el.querySelectorAll<HTMLImageElement>(
      'image[role="img"], img[aria-label*="profile"], img[alt*="profile"], a[role="link"] img, img.actor__avatar, .avatar img'
    );

    for (let i = 0; i < avatarImages.length; i++) {
      const img = avatarImages[i];
      const src = img.src || img.getAttribute('xlink:href') || '';
      // Avatars are usually square & smaller than 120px
      const rect = img.getBoundingClientRect();
      if (src && !src.includes('data:image/svg') && !src.includes('/rsrc.php/')) {
        return {
          url: src,
          confidence: 0.85,
          strategy: 'avatar-selector',
        };
      }
    }

    // Strategy 2: First small image inside container
    const allImages = el.querySelectorAll<HTMLImageElement>('img');
    for (let i = 0; i < allImages.length; i++) {
      const img = allImages[i];
      if (img.width > 24 && img.width <= 80 && img.src && !img.src.includes('/rsrc.php/')) {
        return {
          url: img.src,
          confidence: 0.6,
          strategy: 'small-image-fallback',
        };
      }
    }

    return { confidence: 0, strategy: 'none' };
  }

  /**
   * Extract Full Post Body Text (preserving formatting, paragraphs, emojis)
   */
  public static extractText(el: HTMLElement): { text: string; confidence: number; strategy: string } {
    let text = '';
    let confidence = 0;
    let strategy = 'none';

    // Strategy 1: Facebook specific message containers
    const messageContainers = el.querySelectorAll<HTMLElement>(
      'div[data-ad-preview="message"], div[dir="auto"], [data-ad-comet-preview="message"], .userContent, .story_body_container p'
    );

    const extractedTexts: string[] = [];
    messageContainers.forEach((mc) => {
      // Exclude headers or buttons
      if (!mc.closest('h2, h3, h4, button, [role="button"]')) {
        const content = mc.innerText?.trim();
        if (content && content.length > 5 && !extractedTexts.includes(content)) {
          extractedTexts.push(content);
        }
      }
    });

    if (extractedTexts.length > 0) {
      text = extractedTexts.join('\n\n');
      confidence = 0.95;
      strategy = 'message-container';
    }

    // Strategy 2: Look for elements with dir="auto"
    if (!text) {
      const autoDirElements = el.querySelectorAll<HTMLElement>('[dir="auto"]');
      const candidates: string[] = [];
      autoDirElements.forEach((ade) => {
        const str = ade.innerText?.trim();
        if (str && str.length > 15 && !ade.closest('button, nav, header, footer')) {
          candidates.push(str);
        }
      });
      if (candidates.length > 0) {
        // Pick the longest coherent paragraph
        candidates.sort((a, b) => b.length - a.length);
        text = candidates[0];
        confidence = 0.8;
        strategy = 'dir-auto-longest';
      }
    }

    // Clean up unwanted Facebook UI strings like "See more" or "Like Comment Share"
    text = text
      .replace(/\n\s*See more\s*$/i, '')
      .replace(/\n\s*See translation\s*$/i, '')
      .trim();

    return { text, confidence, strategy };
  }

  /**
   * Extract Visible Post Images (Excludes avatars, UI badges, logos)
   */
  public static extractImages(el: HTMLElement): { images: SocialPostImage[]; confidence: number; strategy: string } {
    const images: SocialPostImage[] = [];
    const seenUrls = new Set<string>();

    // Strategy 1: Post media containers & large images
    const imgTags = el.querySelectorAll<HTMLImageElement>(
      'div[data-pagelet*="Media"] img, div[data-visualcompletion="media-vc-image"] img, img.scaledImageFitWidth, img.scaledImageFitHeight, a[href*="photo"] img, a[href*="photos"] img, a[role="link"] > div > img'
    );

    imgTags.forEach((img) => {
      const src = img.currentSrc || img.src;
      if (src && !seenUrls.has(src)) {
        // Exclude icons, avatars, emoji sprites, tracking pixels
        if (!src.includes('/rsrc.php/') && !src.includes('emoji.php') && !src.includes('static.xx.fbcdn.net/rsrc')) {
          const width = img.naturalWidth || img.width || undefined;
          const height = img.naturalHeight || img.height || undefined;
          const alt = img.alt || undefined;

          // Post images are generally >= 150px wide or tall
          if (!width || width > 120) {
            seenUrls.add(src);
            images.push({ url: src, width, height, alt });
          }
        }
      }
    });

    // Strategy 2: Fallback query on all images inside element if none matched
    if (images.length === 0) {
      const allImgs = el.querySelectorAll<HTMLImageElement>('img');
      allImgs.forEach((img) => {
        const src = img.src;
        if (src && !seenUrls.has(src) && (img.width > 200 || img.naturalWidth > 200)) {
          seenUrls.add(src);
          images.push({ url: src, width: img.naturalWidth, height: img.naturalHeight, alt: img.alt });
        }
      });
    }

    const confidence = images.length > 0 ? 0.9 : 0.5;
    return { images, confidence, strategy: images.length > 0 ? 'post-media-finder' : 'none' };
  }

  /**
   * Extract Published Date / Timestamp
   */
  public static extractTimestamp(el: HTMLElement): { publishedAt?: string; confidence: number; strategy: string } {
    // Strategy 1: Timestamp links (with aria-label or abbr/time elements)
    const timeElements = el.querySelectorAll<HTMLElement>(
      'abbr[data-utime], time, a[href*="/posts/"], a[href*="/videos/"], a[href*="/permalink/"], a[aria-label*="ago"], a[aria-label*="Yesterday"], a[aria-label*="at"]'
    );

    for (let i = 0; i < timeElements.length; i++) {
      const tel = timeElements[i];
      const aria = tel.getAttribute('aria-label');
      const text = tel.innerText?.trim() || tel.textContent?.trim();

      if (aria && (aria.includes('ago') || aria.includes('at') || aria.includes('202') || aria.includes('Yesterday'))) {
        return { publishedAt: aria, confidence: 0.9, strategy: 'time-aria' };
      }
      if (text && (text.includes('h') || text.includes('m') || text.includes('d') || text.includes('ago') || text.includes('Yesterday') || /\b\w{3,9}\s+\d{1,2}\b/.test(text))) {
        return { publishedAt: text, confidence: 0.85, strategy: 'time-text' };
      }
    }

    return { publishedAt: 'Recently on Facebook', confidence: 0.4, strategy: 'default' };
  }

  /**
   * Extract Visible Engagement Counts (Reactions, Comments, Shares)
   */
  public static extractEngagement(el: HTMLElement): { engagement: SocialPostEngagement; confidence: number; strategy: string } {
    const engagement: SocialPostEngagement = {};
    let confidence = 0.5;
    const strategy = 'engagement-detector';

    // Strategy 1: Aria labels on reaction bars (e.g. "12K reactions", "450 comments", "1.2K shares")
    const fullText = el.innerText || '';

    // Search reactions (e.g., "1.2K", "45 likes", "142 reactions")
    const reactionBadge = el.querySelector(
      '[aria-label*="reaction"], [aria-label*="Like"], [role="toolbar"] ~ div, [data-testid*="reaction"]'
    );
    if (reactionBadge) {
      const label = reactionBadge.getAttribute('aria-label') || reactionBadge.textContent || '';
      const parsed = this.parseCompactNumber(label);
      if (parsed) {
        engagement.reactions = parsed.value;
        engagement.reactionsDisplay = parsed.displayValue;
        confidence = Math.max(confidence, 0.85);
      }
    }

    // Fallback: Regex on full container text for reaction counts
    if (!engagement.reactions) {
      const matchReactions = fullText.match(/([\d.]+[KMBkmb]?)\s*(?:reactions?|others|people)/i);
      if (matchReactions) {
        const parsed = this.parseCompactNumber(matchReactions[1]);
        if (parsed) {
          engagement.reactions = parsed.value;
          engagement.reactionsDisplay = parsed.displayValue;
        }
      }
    }

    // Search comments (e.g., "245 comments", "1.1K Comments")
    const matchComments = fullText.match(/([\d.]+[KMBkmb]?)\s*comments?/i);
    if (matchComments) {
      const parsed = this.parseCompactNumber(matchComments[1]);
      if (parsed) {
        engagement.comments = parsed.value;
        engagement.commentsDisplay = parsed.displayValue;
        confidence = Math.max(confidence, 0.85);
      }
    }

    // Search shares (e.g., "43 shares", "12K Shares")
    const matchShares = fullText.match(/([\d.]+[KMBkmb]?)\s*shares?/i);
    if (matchShares) {
      const parsed = this.parseCompactNumber(matchShares[1]);
      if (parsed) {
        engagement.shares = parsed.value;
        engagement.sharesDisplay = parsed.displayValue;
        confidence = Math.max(confidence, 0.85);
      }
    }

    // Reaction types visible (Like, Love, Haha, Wow, Sad, Angry)
    const topReactions: ('like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry')[] = [];
    if (el.querySelector('img[src*="like"], [aria-label*="Like"]')) topReactions.push('like');
    if (el.querySelector('img[src*="love"], [aria-label*="Love"]')) topReactions.push('love');
    if (el.querySelector('img[src*="care"], [aria-label*="Care"]')) topReactions.push('care');
    if (el.querySelector('img[src*="haha"], [aria-label*="Haha"]')) topReactions.push('haha');
    if (el.querySelector('img[src*="wow"], [aria-label*="Wow"]')) topReactions.push('wow');
    if (el.querySelector('img[src*="sad"], [aria-label*="Sad"]')) topReactions.push('sad');
    if (el.querySelector('img[src*="angry"], [aria-label*="Angry"]')) topReactions.push('angry');

    if (topReactions.length > 0) {
      engagement.topReactions = topReactions;
    }

    return { engagement, confidence, strategy };
  }

  /**
   * Extract Post Permalink or URL
   */
  public static extractPostUrl(el: HTMLElement, fallbackUrl: string): { url: string; confidence: number; strategy: string } {
    // Strategy 1: Find permalink in timestamp links
    const links = el.querySelectorAll<HTMLAnchorElement>(
      'a[href*="/posts/"], a[href*="/permalink/"], a[href*="/story.php"], a[href*="/videos/"], a[href*="/photo.php"]'
    );

    for (let i = 0; i < links.length; i++) {
      const href = links[i].href;
      if (href && href.startsWith('http') && !href.includes('/user/')) {
        // Strip tracking params (?__cft__, ?__tn__, etc.)
        try {
          const u = new URL(href);
          const cleanParams = new URLSearchParams();
          if (u.searchParams.has('story_fbid')) cleanParams.set('story_fbid', u.searchParams.get('story_fbid')!);
          if (u.searchParams.has('id')) cleanParams.set('id', u.searchParams.get('id')!);
          const cleanUrl = `${u.origin}${u.pathname}${cleanParams.toString() ? '?' + cleanParams.toString() : ''}`;
          return { url: cleanUrl, confidence: 0.95, strategy: 'permalink-anchor' };
        } catch {
          return { url: href, confidence: 0.9, strategy: 'permalink-raw' };
        }
      }
    }

    return { url: fallbackUrl, confidence: 0.6, strategy: 'page-url' };
  }

  /**
   * Calculate overall extraction confidence score (0.0 to 1.0)
   */
  public static calculateConfidence(fields: FieldConfidence[]): number {
    if (fields.length === 0) return 0;
    const weights: Record<string, number> = {
      author: 0.25,
      text: 0.35,
      images: 0.15,
      publishedAt: 0.1,
      engagement: 0.15,
    };

    let totalWeight = 0;
    let weightedSum = 0;

    fields.forEach((f) => {
      const w = weights[f.field] || 0.1;
      weightedSum += f.confidence * w;
      totalWeight += w;
    });

    const aggregate = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
    return Math.round(aggregate * 100) / 100;
  }
}
