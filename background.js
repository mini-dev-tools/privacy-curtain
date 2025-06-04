// When user clicks the extension icon
chrome.action.onClicked.addListener((tab) => {
  chrome.storage.sync.get("blurEnabled", (data) => {
    const enabled = !(data.blurEnabled ?? true); // toggle state
    chrome.storage.sync.set({ blurEnabled: enabled });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: toggleBlur,
      args: [enabled]
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_BLUR_STATE") {
    chrome.storage.sync.get("blurEnabled", (data) => {
      sendResponse({ enabled: data.blurEnabled ?? true });
    });
    return true; // keep the message channel open for async response
  }
});
