/**
 * Format numbers into compact or exact representations
 */
export function formatEngagementNumber(
  num: number,
  format: 'compact' | 'exact' | 'hidden' = 'compact'
): string {
  if (format === 'hidden' || num === undefined || num === null) {
    return '';
  }

  if (format === 'exact') {
    return new Intl.NumberFormat('en-US').format(num);
  }

  // Compact format (e.g. 1.2K, 3.4M)
  if (num >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1);
    return formatted.endsWith('.0') ? `${formatted.slice(0, -2)}M` : `${formatted}M`;
  }
  if (num >= 1_000) {
    const formatted = (num / 1_000).toFixed(1);
    return formatted.endsWith('.0') ? `${formatted.slice(0, -2)}K` : `${formatted}K`;
  }

  return num.toString();
}

/**
 * Truncate long URLs gracefully for display badges
 */
export function formatDisplayUrl(url: string, maxLength: number = 40): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    let path = parsed.pathname;
    if (path.length > 20) {
      path = path.slice(0, 18) + '...';
    }
    const clean = `${parsed.hostname}${path}`;
    return clean.length > maxLength ? clean.slice(0, maxLength - 3) + '...' : clean;
  } catch {
    return url.length > maxLength ? url.slice(0, maxLength - 3) + '...' : url;
  }
}

/**
 * Clean and normalize text paragraphs
 */
export function splitParagraphs(text: string): string[] {
  if (!text) return [];
  return text.split(/\r?\n+/).filter(Boolean);
}
