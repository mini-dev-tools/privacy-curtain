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

    // Gmail-specific preferences
    gmailBlurSender: false,
    gmailBlurSender2: false,
    gmailBlurSubject: false,
    gmailBlurSnippet: false,
    gmailBlurAll: false,
    // Outlook-specific preferences
    outlookBlurAll: false,
    // Teams preferences
    teams_blurImage: false,
    teams_blurName: false,
    teams_blurMessage: false,
    teams_blurChatImage: false,
    teams_blurChatName: false,
    teams_blurChatLastImage: false,
    teams_blurChatAllMessages: false,
    teams_blurAll: false
  };

  // Platform detection function
  function detectPlatform() {
    const hostname = window.location.hostname.toLowerCase();
    const url = window.location.href.toLowerCase();

    if (hostname.includes('web.whatsapp.com') || hostname.includes('whatsapp.com')) {
      return 'whatsapp';
    } else if (hostname.includes('mail.google.com') || hostname.includes('gmail.com')) {
      return 'gmail';
    } else if (hostname.includes('outlook.live.com') || hostname.includes('outlook.office.com') || hostname.includes('outlook.office365.com')) {
      return 'outlook';
    } else if (hostname.includes('teams.microsoft.com') || hostname.includes('teams.live.com')) {
      return 'teams';
    }

    return 'unknown';
  }

  // Platform-specific selectors
  const platformSelectors = {
    whatsapp: {
      blurImage: 'img[src]',
      blurName: 'span[title][dir="auto"]._ao3e',
      blurUsername: 'span._1wjpf',
      blurMessage: 'div._ak8k span.x1iyjqo2.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft.x1rg5ohu._ao3e',
      blurChatImage: 'div[class*="x1n2onr6"][class*="x14yjl9h"]',
      blurChatName: 'div.x78zum5.xdt5ytf[role="button"][data-tab="6"]',
      blurChatLastMessage: '.message-out:last-child span[dir="ltr"], .message-in:last-child span[dir="ltr"], .focusable-list-item:last-child span[dir="ltr"], ._amkz:last-child span[dir="ltr"], .message-out:last-child .selectable-text, .message-in:last-child .selectable-text',
      blurChatAllMessages: '.message-out span[dir="ltr"], .message-in span[dir="ltr"], .focusable-list-item span[dir="ltr"], ._amkz span[dir="ltr"], .copyable-area span[dir="ltr"], .selectable-text span, .x1n2onr6.x1vjfegm.x1cqoux5.x14yy4lh span[dir="ltr"]',
      blurChatLastImage: '.message-out:last-child img, .message-in:last-child img, ._amkz:last-child img, [data-testid="msg-container"]:last-child img, .focusable-list-item:last-child img',
      extraBlurItem: 'div.x10l6tqk.xh8yej3.x1g42fcv[role="listitem"]'
    },
    gmail: {
      gmailBlurRow: 'tr.zA',
      gmailBlurSender: 'span.bA4 span[email], .yW span[email], .bog span[title]',
      gmailBlurSender2: '.yW span[name], .bog span[name]',
      gmailBlurSubject: '.bog .y6 span[id], .yW .y6 span',
      gmailBlurSnippet: '.y2 span, .y6 .y2'
    },
    outlook: {
      outlookBlurRow: 'div.XG5Jd.TszOG',
      outlookBlurSender: 'div.XG5Jd.TszOG [role="gridcell"] span[title], div.XG5Jd.TszOG .ms-List-cell [title]',
      outlookBlurSubject: 'div.XG5Jd.TszOG [role="gridcell"] span:not([title]), div.XG5Jd.TszOG .ms-List-cell span:not([title])',
      outlookBlurPreview: 'div.XG5Jd.TszOG .ms-Button-label'
    },
    teams: {
      teams_blurImage: 'span.fui-Avatar img',
      teams_blurName: 'span[data-tid="chat-list-item-title"]',
      teams_blurMessage: 'span[data-tid="chat-list-item-preview-message"]',
      teams_blurChatImage: 'span.fui-Avatar img',
      teams_blurChatName: 'span[id^="chat-topic-person-"]',
      teams_blurChatLastImage: 'img[data-tid^="lazy-image"]',
      teams_blurChatAllMessages: '[data-tid^="message-body-content"], .fui-Text, div.fui-Primitive[dir="auto"]'
    }
  };

  // Platform-specific preference mappings
  const platformPreferences = {
    whatsapp: ['blurImage', 'blurName', 'blurUsername', 'blurMessage', 'blurAll', 'blurChatLastImage', 'blurChatLastMessage', 'blurChatAllMessages', 'blurChatName', 'blurChatImage'],
    gmail: ['gmailBlurSender', 'gmailBlurSender2', 'gmailBlurSubject', 'gmailBlurSnippet', 'gmailBlurAll'],
    outlook: ['outlookBlurAll'],
    teams: ['teams_blurImage', 'teams_blurName', 'teams_blurMessage', 'teams_blurChatImage', 'teams_blurChatName', 'teams_blurChatLastImage', 'teams_blurChatAllMessages', 'teams_blurAll']
  };

  function createBlurRules(platform, prefs) {
    const cssRules = [];
    const selectors = platformSelectors[platform];

    if (!selectors) return [];

    switch (platform) {
      case 'whatsapp':
        if (prefs.blurImage || prefs.blurAll) {
          cssRules.push(`${selectors.blurImage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.blurImage}:hover { filter: none !important; }`);
        }
        if (prefs.blurName || prefs.blurAll) {
          cssRules.push(`${selectors.blurName} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.blurName}:hover { filter: none !important; }`);
        }
        if (prefs.blurUsername || prefs.blurAll) {
          cssRules.push(`${selectors.blurUsername} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.blurUsername}:hover { filter: none !important; }`);
        }
        if (prefs.blurMessage || prefs.blurAll) {
          cssRules.push(`${selectors.blurMessage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.blurMessage}:hover { filter: none !important; }`);
        }
        if (prefs.blurChatImage || prefs.blurAll) {
          cssRules.push(`${selectors.blurChatImage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.blurChatImage}:hover { filter: none !important; }`);
        }
        if (prefs.blurChatName || prefs.blurAll) {
          cssRules.push(`${selectors.blurChatName} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.blurChatName}:hover { filter: none !important; }`);
        }
        if (prefs.blurChatLastMessage || prefs.blurAll) {
          cssRules.push(`${selectors.blurChatLastMessage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.blurChatLastMessage}:hover { filter: none !important; }`);
        }
        if (prefs.blurChatAllMessages || prefs.blurAll) {
          cssRules.push(`${selectors.blurChatAllMessages} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.blurChatAllMessages}:hover { filter: none !important; }`);
        }
        if (prefs.blurChatLastImage || prefs.blurAll) {
          cssRules.push(`${selectors.blurChatLastImage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.blurChatLastImage}:hover { filter: none !important; }`);
        }
        if (prefs.blurAll && selectors.extraBlurItem) {
          cssRules.push(`${selectors.extraBlurItem} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.extraBlurItem}:hover { filter: none !important; }`);
        }

        break;

      case 'gmail':
        if (prefs.gmailBlurSender || prefs.gmailBlurAll) {
          cssRules.push(`${selectors.gmailBlurSender} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.gmailBlurSender}:hover { filter: none !important; }`);
        }
        if (prefs.gmailBlurSender2 || prefs.gmailBlurAll) {
          cssRules.push(`${selectors.gmailBlurSender2} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.gmailBlurSender2}:hover { filter: none !important; }`);
        }
        if (prefs.gmailBlurSubject || prefs.gmailBlurAll) {
          cssRules.push(`${selectors.gmailBlurSubject} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.gmailBlurSubject}:hover { filter: none !important; }`);
        }
        if (prefs.gmailBlurSnippet || prefs.gmailBlurAll) {
          cssRules.push(`${selectors.gmailBlurSnippet} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.gmailBlurSnippet}:hover { filter: none !important; }`);
        }
        if (prefs.gmailBlurAll) {
          cssRules.push(`${selectors.gmailBlurRow} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.gmailBlurRow}:hover { filter: none !important; }`);
        }
        break;

      case 'outlook':
        if (prefs.outlookBlurAll) {
          cssRules.push(`${selectors.outlookBlurRow} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.outlookBlurRow}:hover { filter: none !important; }`);
          cssRules.push(`${selectors.outlookBlurSender} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.outlookBlurSender}:hover { filter: none !important; }`);
          cssRules.push(`${selectors.outlookBlurSubject} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.outlookBlurSubject}:hover { filter: none !important; }`);
          cssRules.push(`${selectors.outlookBlurPreview} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.outlookBlurPreview}:hover { filter: none !important; }`);
        }
        break;

      case 'teams':
        if (prefs.teams_blurImage || prefs.teams_blurAll) {
          cssRules.push(`${selectors.teams_blurImage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.teams_blurImage}:hover { filter: none !important; }`);
        }
        if (prefs.teams_blurName || prefs.teams_blurAll) {
          cssRules.push(`${selectors.teams_blurName} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.teams_blurName}:hover { filter: none !important; }`);
        }
        if (prefs.teams_blurMessage || prefs.teams_blurAll) {
          cssRules.push(`${selectors.teams_blurMessage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.teams_blurMessage}:hover { filter: none !important; }`);
        }
        if (prefs.teams_blurChatImage || prefs.teams_blurAll) {
          cssRules.push(`${selectors.teams_blurChatImage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.teams_blurChatImage}:hover { filter: none !important; }`);
        }
        if (prefs.teams_blurChatName || prefs.teams_blurAll) {
          cssRules.push(`${selectors.teams_blurChatName} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.teams_blurChatName}:hover { filter: none !important; }`);
        }
        if (prefs.teams_blurChatLastImage || prefs.teams_blurAll) {
          cssRules.push(`${selectors.teams_blurChatLastImage} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.teams_blurChatLastImage}:hover { filter: none !important; }`);
        }
        if (prefs.teams_blurChatAllMessages || prefs.teams_blurAll) {
          cssRules.push(`${selectors.teams_blurChatAllMessages} { filter: blur(5px) !important; transition: filter 0.2s ease; }`);
          cssRules.push(`${selectors.teams_blurChatAllMessages}:hover { filter: none !important; }`);
        }
        break;
    }

    return cssRules;
  }

  function applyBlur(prefs, forcedPlatform = null) {
    window.currentPrefs = prefs;
    const currentPlatform = forcedPlatform || detectPlatform();

    console.log('Applying blur for platform:', currentPlatform);

    // Remove existing style if it exists
    const existingStyle = document.getElementById('platform-blur-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Only apply blur rules for the current platform
    if (currentPlatform === 'unknown') {
      console.log('Unknown platform detected, skipping blur application');
      return;
    }

    // Create platform-specific CSS rules
    const cssRules = createBlurRules(currentPlatform, prefs);

    if (cssRules.length > 0) {
      const style = document.createElement('style');
      style.id = 'platform-blur-style';
      style.setAttribute('data-platform', currentPlatform);
      style.textContent = cssRules.join('\n');
      document.head.appendChild(style);

      // Clear any existing inline styles that might interfere
      const selectors = platformSelectors[currentPlatform];
      if (selectors) {
        Object.values(selectors).forEach(sel => {
          document.querySelectorAll(sel).forEach(el => {
            if (el.style.filter) {
              el.style.filter = '';
            }
          });
        });
      }
    }
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
    blurChatImage: false,
    // Gmail preferences
    gmailBlurSender: false,
    gmailBlurSender2: false,
    gmailBlurSubject: false,
    gmailBlurSnippet: false,
    gmailBlurAll: false,
    // Outlook preferences
    outlookBlurAll: false,
    // Teams preferences
    teams_blurImage: false,
    teams_blurName: false,
    teams_blurMessage: false,
    teams_blurChatImage: false,
    teams_blurChatName: false,
    teams_blurChatLastImage: false,
    teams_blurChatAllMessages: false,
    teams_blurAll: false
  }, applyBlur);

  // Listen for updates from popup.js or background.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateBlur") {
      // Apply blur with platform detection or forced platform from message
      applyBlur(message.prefs, message.platform);
      sendResponse({ success: true, platform: detectPlatform() });
    }
  });

  // Watch for DOM changes and URL changes
  let timeoutId;
  let lastUrl = window.location.href;

  const observer = new MutationObserver(() => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const currentUrl = window.location.href;

      // Check if URL changed (SPA navigation)
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('URL changed, reapplying blur');
        applyBlur(window.currentPrefs);
      }
      // Only reapply if CSS style is missing (indicates page navigation/reload)
      else if (!document.getElementById('platform-blur-style')) {
        console.log('Style missing, reapplying blur');
        applyBlur(window.currentPrefs);
      }
    }, 500);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Listen for URL changes in single-page applications
  window.addEventListener('popstate', () => {
    setTimeout(() => applyBlur(window.currentPrefs), 100);
  });

  // Also listen for pushstate/replacestate changes
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(history, arguments);
    setTimeout(() => applyBlur(window.currentPrefs), 100);
  };

  history.replaceState = function() {
    originalReplaceState.apply(history, arguments);
    setTimeout(() => applyBlur(window.currentPrefs), 100);
  };
}