if (typeof window.currentPrefs === 'undefined') {
  window.currentPrefs = {
    blurImage: false,
    blurName: false,
    blurUsername: false,
    blurMessage: false,
    blurAll: false,
    blurChatLastImage: false,
    blurChatLastMessage: false,
    blurChatAllMessages: false,
    blurChatName: false,
    blurChatImage: false
  };

  const selectors = {
    // Outside chat selectors (existing)
    blurImage: 'img[src]',
    blurName: 'span[title][dir="auto"]._ao3e',
    blurUsername: 'span._1wjpf',
    blurMessage: 'div._ak8k span.x1iyjqo2.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft.x1rg5ohu._ao3e',
    blurAll: 'span[title][dir="auto"]._ao3e, span._1wjpf, div._ak8k span._ao3e, img[src]',
    
    // Inside chat selectors (new)
    blurChatImage: 'div[class*="x1n2onr6"][class*="x14yjl9h"]',
    blurChatName: 'div.x78zum5.xdt5ytf[role="button"][data-tab="6"]',
    blurChatLastMessage: '.message-out:last-child span[dir="ltr"], .message-in:last-child span[dir="ltr"], .focusable-list-item:last-child span[dir="ltr"], ._amkz:last-child span[dir="ltr"], .message-out:last-child .selectable-text, .message-in:last-child .selectable-text',
    blurChatAllMessages: '.message-out span[dir="ltr"], .message-in span[dir="ltr"], .focusable-list-item span[dir="ltr"], ._amkz span[dir="ltr"], .copyable-area span[dir="ltr"], .selectable-text span, .x1n2onr6.x1vjfegm.x1cqoux5.x14yy4lh span[dir="ltr"]',
    blurChatLastImage: '.message-out:last-child img, .message-in:last-child img, ._amkz:last-child img, [data-testid="msg-container"]:last-child img, .focusable-list-item:last-child img'
  };

  // Track which elements already have blur applied to avoid re-processing
  const blurredElements = new WeakSet();

  function applyBlur(prefs) {
    window.currentPrefs = prefs;

    // Remove existing style if it exists
    const existingStyle = document.getElementById('whatsapp-blur-hover-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Add CSS for hover effects - this is more reliable than event listeners
    const style = document.createElement('style');
    style.id = 'whatsapp-blur-hover-style';
    
    // Build CSS rules based on active preferences
    let cssRules = [];
    
    if (prefs.blurAll) {
      cssRules.push(`${selectors.blurAll} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
      cssRules.push(`${selectors.blurAll}:hover { filter: none !important; }`);
    } else {
      // Individual blur options
      if (prefs.blurImage) {
        cssRules.push(`${selectors.blurImage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
        cssRules.push(`${selectors.blurImage}:hover { filter: none !important; }`);
      }
      if (prefs.blurName) {
        cssRules.push(`${selectors.blurName} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
        cssRules.push(`${selectors.blurName}:hover { filter: none !important; }`);
      }
      if (prefs.blurUsername) {
        cssRules.push(`${selectors.blurUsername} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
        cssRules.push(`${selectors.blurUsername}:hover { filter: none !important; }`);
      }
      if (prefs.blurMessage) {
        cssRules.push(`${selectors.blurMessage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
        cssRules.push(`${selectors.blurMessage}:hover { filter: none !important; }`);
      }
      if (prefs.blurChatImage) {
        cssRules.push(`${selectors.blurChatImage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
        cssRules.push(`${selectors.blurChatImage}:hover { filter: none !important; }`);
      }
      if (prefs.blurChatName) {
        cssRules.push(`${selectors.blurChatName} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
        cssRules.push(`${selectors.blurChatName}:hover { filter: none !important; }`);
      }
      if (prefs.blurChatLastMessage) {
        cssRules.push(`${selectors.blurChatLastMessage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
        cssRules.push(`${selectors.blurChatLastMessage}:hover { filter: none !important; }`);
      }
      if (prefs.blurChatAllMessages) {
        cssRules.push(`${selectors.blurChatAllMessages} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
        cssRules.push(`${selectors.blurChatAllMessages}:hover { filter: none !important; }`);
      }
      if (prefs.blurChatLastImage) {
        cssRules.push(`${selectors.blurChatLastImage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
        cssRules.push(`${selectors.blurChatLastImage}:hover { filter: none !important; }`);
      }
    }

    style.textContent = cssRules.join('\n');
    document.head.appendChild(style);

    // Clear any existing inline styles that might interfere
    Object.values(selectors).forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.style.filter) {
          el.style.filter = '';
        }
      });
    });
  }

  // Load preferences and apply blur
  chrome.storage.sync.get({
    blurImage: false,
    blurName: false,
    blurUsername: false,
    blurMessage: false,
    blurAll: false,
    blurChatLastImage: false,
    blurChatLastMessage: false,
    blurChatAllMessages: false,
    blurChatName: false,
    blurChatImage: false
  }, applyBlur);

  // Listen for updates from popup.js or background.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateBlur") {
      applyBlur(message.prefs);
    }
  });

  // Watch for DOM changes with debouncing to avoid excessive re-application
  let timeoutId;
  const observer = new MutationObserver(() => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      // Only reapply if CSS style is missing (indicates page navigation/reload)
      if (!document.getElementById('whatsapp-blur-hover-style')) {
        applyBlur(window.currentPrefs);
      }
    }, 500);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Remove the problematic setInterval - CSS handles everything now
  // The MutationObserver will handle dynamic content
}