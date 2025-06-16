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
    blurChatImage: false,
    blurEmail: false
  };

  const selectors = {
    // Outside chat selectors (existing)
    blurImage: 'img[src]',
    blurName: 'span[title][dir="auto"]._ao3e',
    blurUsername: 'span._1wjpf',
    blurMessage: 'div._ak8k',

    blurChatImage: 'div[class*="x1n2onr6"][class*="x14yjl9h"]',
    blurChatName: 'div.x78zum5.xdt5ytf[role="button"][data-tab="6"]',
    blurChatLastMessage: '.message-out:last-child span[dir="ltr"], .message-in:last-child span[dir="ltr"], .focusable-list-item:last-child span[dir="ltr"], ._amkz:last-child span[dir="ltr"], .message-out:last-child .selectable-text, .message-in:last-child .selectable-text',
    blurChatAllMessages: '.message-out span[dir="ltr"], .message-in span[dir="ltr"], .focusable-list-item span[dir="ltr"], ._amkz span[dir="ltr"], .copyable-area span[dir="ltr"], .selectable-text span, .x1n2onr6.x1vjfegm.x1cqoux5.x14yy4lh span[dir="ltr"]',
    blurChatLastImage: '.message-out:last-child img, .message-in:last-child img, ._amkz:last-child img, [data-testid="msg-container"]:last-child img, .focusable-list-item:last-child img',
    
    // New email selector (generic)
    blurEmail: 'span:contains("@"), div:contains("@"), a[href^="mailto:"], [data-hovercard-id*="@"]'
  };

  const blurredElements = new WeakSet();

  function applyBlur(prefs) {
    window.currentPrefs = prefs;

    const existingStyle = document.getElementById('whatsapp-blur-hover-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'whatsapp-blur-hover-style';

    let cssRules = [];
    console.log(prefs);

    if (prefs.blurImage || prefs.blurAll ) {
      console.log("image");
      cssRules.push(`${selectors.blurImage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
      cssRules.push(`${selectors.blurImage}:hover { filter: none !important; }`);
    }
    if (prefs.blurName || prefs.blurAll ) {
      console.log("name");
      cssRules.push(`${selectors.blurName} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
      cssRules.push(`${selectors.blurName}:hover { filter: none !important; }`);
    }
    if (prefs.blurUsername || prefs.blurAll ) {
      console.log("username");
      cssRules.push(`${selectors.blurUsername} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
      cssRules.push(`${selectors.blurUsername}:hover { filter: none !important; }`);
    }
    if (prefs.blurMessage || prefs.blurAll ) {
      console.log("message");
      cssRules.push(`${selectors.blurMessage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
      cssRules.push(`${selectors.blurMessage}:hover { filter: none !important; }`);
    }
    if (prefs.blurChatImage || prefs.blurAll ) {
      console.log("chateimage");
      cssRules.push(`${selectors.blurChatImage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
      cssRules.push(`${selectors.blurChatImage}:hover { filter: none !important; }`);
    }
    if (prefs.blurChatName || prefs.blurAll ) {
      cssRules.push(`${selectors.blurChatName} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
      cssRules.push(`${selectors.blurChatName}:hover { filter: none !important; }`);
    }
    if (prefs.blurChatLastMessage || prefs.blurAll ) {
      cssRules.push(`${selectors.blurChatLastMessage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
      cssRules.push(`${selectors.blurChatLastMessage}:hover { filter: none !important; }`);
    }
    if (prefs.blurChatAllMessages || prefs.blurAll ) {
      cssRules.push(`${selectors.blurChatAllMessages} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
      cssRules.push(`${selectors.blurChatAllMessages}:hover { filter: none !important; }`);
    }
    if (prefs.blurChatLastImage || prefs.blurAll ) {
      cssRules.push(`${selectors.blurChatLastImage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
      cssRules.push(`${selectors.blurChatLastImage}:hover { filter: none !important; }`);
    }
    if (prefs.blurEmail || prefs.blurAll ) {
      console.log("email");
      cssRules.push(`${selectors.blurEmail} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
      cssRules.push(`${selectors.blurEmail}:hover { filter: none !important; }`);
    }

    style.textContent = cssRules.join('\n');
    document.head.appendChild(style);

    Object.values(selectors).forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.style.filter) {
          el.style.filter = '';
        }
      });
    });
  }

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
    blurChatImage: false,
    blurEmail: false
  }, applyBlur);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateBlur") {
      applyBlur(message.prefs);
    }
  });

  let timeoutId;
  const observer = new MutationObserver(() => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (!document.getElementById('whatsapp-blur-hover-style')) {
        applyBlur(window.currentPrefs);
      }
    }, 500);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
