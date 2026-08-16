import { FacebookPostParser, SocialPost } from './facebook-parser';

/**
 * PostFrame Content Script (Manifest V3)
 * Operates strictly on the visible Facebook page currently open by the user.
 * Never accesses cookies, passwords, or background tokens.
 */

// Highlight styling helper for user feedback
let activeHighlightEl: HTMLElement | null = null;

function highlightElement(el: HTMLElement) {
  if (activeHighlightEl) {
    activeHighlightEl.style.outline = '';
    activeHighlightEl.style.boxShadow = '';
  }
  activeHighlightEl = el;
  el.style.outline = '3px solid #1877F2';
  el.style.boxShadow = '0 0 20px rgba(24, 119, 242, 0.4)';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function removeHighlight() {
  if (activeHighlightEl) {
    activeHighlightEl.style.outline = '';
    activeHighlightEl.style.boxShadow = '';
    activeHighlightEl = null;
  }
}

// Runtime message listener
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  try {
    const action = message?.action;

    // 1. Check if on Facebook & count posts
    if (action === 'CHECK_PAGE') {
      const isFb = FacebookPostParser.isFacebookPage(window.location.href);
      const postContainers = FacebookPostParser.findPostContainers(document);

      sendResponse({
        success: true,
        isFacebook: isFb,
        pageUrl: window.location.href,
        postCount: postContainers.length,
        title: document.title,
      });
      return true;
    }

    // 2. Extract active/primary post
    if (action === 'EXTRACT_ACTIVE_POST') {
      const containers = FacebookPostParser.findPostContainers(document);
      if (containers.length === 0) {
        sendResponse({
          success: false,
          error: 'No recognizable post found on this Facebook page. Please navigate to a specific post.',
        });
        return true;
      }

      // Highlight the extracted post
      highlightElement(containers[0]);
      setTimeout(removeHighlight, 3000);

      const parsedPost: SocialPost = FacebookPostParser.parsePostElement(containers[0], window.location.href);
      sendResponse({
        success: true,
        post: parsedPost,
        postCount: containers.length,
      });
      return true;
    }

    // 3. Extract all posts (for multiple posts disambiguation)
    if (action === 'DETECT_ALL_POSTS') {
      const allPosts = FacebookPostParser.detectAllPosts(document, window.location.href);
      sendResponse({
        success: true,
        posts: allPosts,
        count: allPosts.length,
      });
      return true;
    }

    // 4. Highlight specific post index
    if (action === 'HIGHLIGHT_POST') {
      const index = message.index || 0;
      const containers = FacebookPostParser.findPostContainers(document);
      if (containers[index]) {
        highlightElement(containers[index]);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Container not found' });
      }
      return true;
    }

    sendResponse({ success: false, error: `Unknown action: ${action}` });
  } catch (err: any) {
    sendResponse({ success: false, error: err?.message || 'Error executing in Facebook tab' });
  }
  return true;
});

// Broadcast ready status
console.log('[PostFrame] Facebook Content Script active and listening.');
