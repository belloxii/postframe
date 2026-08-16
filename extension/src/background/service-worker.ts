/**
 * PostFrame Service Worker (Manifest V3)
 * Coordinates extension actions and web app bridges.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[PostFrame] Chrome Extension installed successfully.');
});

// Update badge when on Facebook tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('facebook.com') || tab.url.includes('fb.watch')) {
      chrome.action.setBadgeText({ tabId, text: 'FB' });
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#1877F2' });
    } else {
      chrome.action.setBadgeText({ tabId, text: '' });
    }
  }
});
