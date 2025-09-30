// Content script - runs in the context of web pages
import browser from 'webextension-polyfill';

console.log('Content script loaded');

// Listen for messages from popup or background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);

  if (message.type === 'FROM_POPUP') {
    // Handle message from popup
    console.log('Received from popup:', message.data);

    // Display the message on the page
    displayMessageOnPage(message.data);

    // Send response back
    sendResponse({ success: true, echo: message.data });
  }

  if (message.type === 'GET_PAGE_INFO') {
    // Send page information back to popup
    sendResponse({
      url: window.location.href,
      title: document.title,
      elementCount: document.querySelectorAll('*').length,
    });
  }

  // Return true to indicate we'll send a response asynchronously
  return true;
});

// Display message on the page
function displayMessageOnPage(message) {
  const div = document.createElement('div');
  div.textContent = `Message from addon: ${message}`;
  div.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #0060df;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-family: sans-serif;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease-out;
  `;

  // Add animation keyframes
  if (!document.querySelector('#addon-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'addon-animation-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(div);

  // Remove after 3 seconds
  setTimeout(() => {
    div.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => div.remove(), 300);
  }, 3000);
}

// Send data to popup
function sendDataToPopup(data) {
  browser.runtime
    .sendMessage({
      type: 'FROM_CONTENT',
      data: data,
    })
    .catch((err) => {
      // Popup might not be open, that's ok
      console.log('Could not send to popup:', err.message);
    });
}

// Listen for clicks on the page and send to popup
document.addEventListener('click', (e) => {
  const tagName = e.target.tagName;
  const className = e.target.className ? `.${e.target.className}` : '';
  sendDataToPopup(`Clicked: ${tagName}${className}`);
});
