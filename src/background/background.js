// Background script - runs persistently in the background
import browser from 'webextension-polyfill';

console.log('Background script loaded');

// Listen for messages from content scripts or popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message, 'from:', sender);

  if (message.type === 'FROM_CONTENT') {
    // Message from content script
    console.log('Message from content script:', message.data);

    // You could store data, relay to other tabs, etc.
    // For now, just log it
  }

  return true;
});

// Listen for tab updates
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab loaded:', tab.url);
  }
});

// Initialize extension
browser.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);

  if (details.reason === 'install') {
    // First time install
    console.log('First time installation');
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('Extension updated');
  }
});
