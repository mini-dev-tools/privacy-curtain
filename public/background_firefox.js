// When user clicks the extension icon
browser.browserAction.onClicked.addListener((tab) => {
  browser.storage.sync.get("blurEnabled").then((data) => {
    const enabled = !(data.blurEnabled ?? true); // toggle state
    browser.storage.sync.set({ blurEnabled: enabled });

    browser.tabs.executeScript(tab.id, {
      code: `(${toggleBlur})(${enabled})`
    });
  });
});

// This function is injected into the page to apply/remove blur
function toggleBlur(enabled) {
  const styleId = "whatsapp-blur-style";
  const existing = document.getElementById(styleId);

  if (enabled && !existing) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
     div[role="listitem"] * {
        filter: blur(6px) !important;
        transition: filter 0.3s ease;
        pointer-events: none;
      }

      div[role="listitem"]:hover * {
        filter: none !important;
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);
  } else if (!enabled && existing) {
    existing.remove();
  }
}

// Listen for messages from content.js asking for current blur state
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_BLUR_STATE") {
    browser.storage.sync.get("blurEnabled").then((data) => {
      sendResponse({ enabled: data.blurEnabled ?? true });
    });
    return true; // keep the message channel open for async response
  }
});