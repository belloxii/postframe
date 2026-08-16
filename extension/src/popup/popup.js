/**
 * PostFrame Extension Popup Logic
 * State machine & communication bridge between active Facebook tab and PostFrame Web App.
 */

// State definitions
const State = {
  INITIAL: 'INITIAL',
  DETECTING: 'DETECTING',
  DETECTED: 'DETECTED',
  EXTRACTING: 'EXTRACTING',
  READY: 'READY',
  ERROR: 'ERROR',
  MULTIPLE_POSTS: 'MULTIPLE_POSTS',
};

let currentState = State.INITIAL;
let activeTab = null;
let detectedPost = null;
let multiplePostsList = [];

// DOM Elements
const statusBanner = document.getElementById('statusBanner');
const statusText = document.getElementById('statusText');

const viewNotFacebook = document.getElementById('viewNotFacebook');
const viewDetecting = document.getElementById('viewDetecting');
const viewMultiple = document.getElementById('viewMultiple');
const viewDetected = document.getElementById('viewDetected');
const viewError = document.getElementById('viewError');

const multiPostsListEl = document.getElementById('multiPostsList');
const loadingMsg = document.getElementById('loadingMsg');

const postAuthor = document.getElementById('postAuthor');
const postAvatar = document.getElementById('postAvatar');
const postVerified = document.getElementById('postVerified');
const postDate = document.getElementById('postDate');
const postText = document.getElementById('postText');
const mediaPreview = document.getElementById('mediaPreview');
const postImage = document.getElementById('postImage');
const imageCountBadge = document.getElementById('imageCountBadge');
const confidenceBadge = document.getElementById('confidenceBadge');
const metricReactions = document.getElementById('metricReactions');
const metricComments = document.getElementById('metricComments');
const metricShares = document.getElementById('metricShares');
const webAppUrlInput = document.getElementById('webAppUrlInput');

const btnCapture = document.getElementById('btnCapture');
const btnOpenPostFrame = document.getElementById('btnOpenPostFrame');
const btnRetry = document.getElementById('btnRetry');

// Load saved web app url if available
if (chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(['postFrameWebAppUrl'], (result) => {
    if (result.postFrameWebAppUrl) {
      webAppUrlInput.value = result.postFrameWebAppUrl;
    }
  });
}

webAppUrlInput.addEventListener('change', (e) => {
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ postFrameWebAppUrl: e.target.value.trim() });
  }
});

// Update UI State
function setState(newState, message = '') {
  currentState = newState;

  // Reset status classes
  statusBanner.className = 'status-banner';
  viewNotFacebook.classList.add('hidden');
  viewDetecting.classList.add('hidden');
  viewMultiple.classList.add('hidden');
  viewDetected.classList.add('hidden');
  viewError.classList.add('hidden');
  btnCapture.classList.add('hidden');
  btnOpenPostFrame.classList.add('hidden');

  switch (newState) {
    case State.INITIAL:
      statusBanner.classList.add('state-initial');
      statusText.textContent = 'Open a Facebook post first.';
      viewNotFacebook.classList.remove('hidden');
      break;

    case State.DETECTING:
      statusBanner.classList.add('state-detecting');
      statusText.textContent = message || 'Looking for a post...';
      loadingMsg.textContent = message || 'Inspecting visible Facebook page...';
      viewDetecting.classList.remove('hidden');
      break;

    case State.DETECTED:
      statusBanner.classList.add('state-detected');
      statusText.textContent = 'Facebook post detected.';
      viewDetected.classList.remove('hidden');
      btnCapture.classList.remove('hidden');
      btnCapture.textContent = 'Capture & Reconstruct Post';
      break;

    case State.EXTRACTING:
      statusBanner.classList.add('state-detecting');
      statusText.textContent = 'Extracting post information...';
      loadingMsg.textContent = 'Extracting high-resolution media & metrics...';
      viewDetecting.classList.remove('hidden');
      break;

    case State.READY:
      statusBanner.classList.add('state-ready');
      statusText.textContent = 'Post captured successfully.';
      viewDetected.classList.remove('hidden');
      btnOpenPostFrame.classList.remove('hidden');
      break;

    case State.MULTIPLE_POSTS:
      statusBanner.classList.add('state-detected');
      statusText.textContent = 'Multiple posts detected.';
      viewMultiple.classList.remove('hidden');
      break;

    case State.ERROR:
      statusBanner.classList.add('state-error');
      statusText.textContent = 'Unable to detect this post.';
      viewError.classList.remove('hidden');
      break;
  }
}

// Render Post Details in Card
function renderPostPreview(post) {
  if (!post) return;
  detectedPost = post;

  postAuthor.textContent = post.author?.name || 'Facebook User';
  postDate.textContent = post.publishedAt || 'Recently';

  if (post.author?.avatarUrl) {
    postAvatar.src = post.author.avatarUrl;
    postAvatar.style.display = 'block';
  } else {
    postAvatar.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="%23666"><rect width="40" height="40" fill="%23222"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="16">FB</text></svg>';
  }

  if (post.author?.verified) {
    postVerified.classList.remove('hidden');
  } else {
    postVerified.classList.add('hidden');
  }

  postText.textContent = post.text || '(No text content in post body)';

  if (post.images && post.images.length > 0) {
    mediaPreview.classList.remove('hidden');
    postImage.src = post.images[0].url;
    if (post.images.length > 1) {
      imageCountBadge.textContent = `+${post.images.length - 1}`;
      imageCountBadge.classList.remove('hidden');
    } else {
      imageCountBadge.classList.add('hidden');
    }
  } else {
    mediaPreview.classList.add('hidden');
  }

  // Confidence
  const conf = post.extraction?.confidence || 0.9;
  const pct = Math.round(conf * 100);
  confidenceBadge.textContent = `${pct}% Match`;

  // Engagement
  metricReactions.textContent = post.engagement?.reactionsDisplay || (post.engagement?.reactions ? post.engagement.reactions.toLocaleString() : '0');
  metricComments.textContent = post.engagement?.commentsDisplay || (post.engagement?.comments ? post.engagement.comments.toLocaleString() : '0');
  metricShares.textContent = post.engagement?.sharesDisplay || (post.engagement?.shares ? post.engagement.shares.toLocaleString() : '0');
}

// Check active tab on popup launch
async function checkActiveTab() {
  setState(State.DETECTING, 'Inspecting current browser tab...');

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      setState(State.INITIAL);
      return;
    }

    activeTab = tabs[0];
    const url = activeTab.url || '';

    // Check if on Facebook
    const isFb = url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.me');
    if (!isFb) {
      setState(State.INITIAL);
      return;
    }

    // Ping content script
    chrome.tabs.sendMessage(activeTab.id, { action: 'CHECK_PAGE' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        // If content script was not injected, attempt scripting injection
        injectAndDetect();
        return;
      }

      handlePageDetectionResponse(response);
    });
  } catch (err) {
    setState(State.ERROR);
  }
}

// Inject content script if dynamic or idle
function injectAndDetect() {
  if (!activeTab?.id) return;
  chrome.scripting.executeScript(
    {
      target: { tabId: activeTab.id },
      files: ['dist/content/facebook-content.js'],
    },
    () => {
      if (chrome.runtime.lastError) {
        setState(State.ERROR);
        return;
      }
      setTimeout(() => {
        chrome.tabs.sendMessage(activeTab.id, { action: 'CHECK_PAGE' }, handlePageDetectionResponse);
      }, 200);
    }
  );
}

function handlePageDetectionResponse(response) {
  if (!response || !response.isFacebook) {
    setState(State.INITIAL);
    return;
  }

  if (response.postCount === 0) {
    setState(State.ERROR);
    return;
  }

  if (response.postCount > 1) {
    // Check multiple posts
    chrome.tabs.sendMessage(activeTab.id, { action: 'DETECT_ALL_POSTS' }, (multiRes) => {
      if (multiRes && multiRes.posts && multiRes.posts.length > 1) {
        multiplePostsList = multiRes.posts;
        renderMultiplePosts(multiRes.posts);
        setState(State.MULTIPLE_POSTS);
      } else {
        triggerSingleExtraction();
      }
    });
    return;
  }

  triggerSingleExtraction();
}

function triggerSingleExtraction() {
  setState(State.EXTRACTING);
  chrome.tabs.sendMessage(activeTab.id, { action: 'EXTRACT_ACTIVE_POST' }, (res) => {
    if (res && res.success && res.post) {
      renderPostPreview(res.post);
      setState(State.DETECTED);
    } else {
      setState(State.ERROR);
    }
  });
}

function renderMultiplePosts(posts) {
  multiPostsListEl.innerHTML = '';
  posts.forEach((p, idx) => {
    const item = document.createElement('div');
    item.className = 'multi-item';
    item.innerHTML = `
      <h4>${p.author?.name || 'Post ' + (idx + 1)} · <span style="opacity:0.6;font-weight:normal;">${p.publishedAt || ''}</span></h4>
      <p>${p.text ? p.text.slice(0, 80) + '...' : '(Photo/Media Post)'}</p>
    `;
    item.addEventListener('mouseenter', () => {
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'HIGHLIGHT_POST', index: idx });
      }
    });
    item.addEventListener('click', () => {
      renderPostPreview(p);
      setState(State.DETECTED);
    });
    multiPostsListEl.appendChild(item);
  });
}

// Actions
btnCapture.addEventListener('click', () => {
  setState(State.READY);
});

btnOpenPostFrame.addEventListener('click', async () => {
  if (!detectedPost) return;

  const targetBaseUrl = webAppUrlInput.value.trim().replace(/\/$/, '') || 'http://localhost:3000';

  btnOpenPostFrame.textContent = 'Sending to PostFrame...';
  btnOpenPostFrame.disabled = true;

  try {
    // Send to temporary import backend
    const res = await fetch(`${targetBaseUrl}/api/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post: detectedPost }),
    });

    const data = await res.json();
    if (data && data.success && data.importId) {
      const destinationUrl = `${targetBaseUrl}/import/${data.importId}`;
      chrome.tabs.create({ url: destinationUrl });
    } else {
      // Direct transfer fallback via URL param if backend unreachable
      const payloadStr = encodeURIComponent(JSON.stringify(detectedPost));
      chrome.tabs.create({ url: `${targetBaseUrl}/?import_payload=${payloadStr}` });
    }
  } catch (err) {
    // Fallback direct open
    const payloadStr = encodeURIComponent(JSON.stringify(detectedPost));
    chrome.tabs.create({ url: `${targetBaseUrl}/?import_payload=${payloadStr}` });
  } finally {
    btnOpenPostFrame.textContent = 'Open in PostFrame HD 🚀';
    btnOpenPostFrame.disabled = false;
  }
});

btnRetry.addEventListener('click', checkActiveTab);

// Initialize
document.addEventListener('DOMContentLoaded', checkActiveTab);
