document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("blurForm");
  const toggleButtons = form.querySelectorAll('.toggle-button');

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
  }, prefs => {
    // Set toggle button states based on saved preferences
    Object.keys(prefs).forEach(key => {
      const button = form.querySelector(`[data-name="${key}"]`);
      if (button) {
        button.classList.toggle('enabled', prefs[key]);
      }
    });
  });

  // Toggle buttons now automatically save and apply changes
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const isEnabled = button.classList.contains('enabled');
      button.classList.toggle('enabled', !isEnabled);

      // Gather updated preferences
      const prefs = {};
      toggleButtons.forEach(btn => {
        const name = btn.getAttribute('data-name');
        prefs[name] = btn.classList.contains('enabled');
      });

      // Save updated preferences
      chrome.storage.sync.set(prefs, () => {
        // Send update to the WhatsApp Web tab
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          const tab = tabs[0];
          if (!tab?.id || !tab.url?.includes("web.whatsapp.com")) {
            console.warn("Please open WhatsApp Web to apply changes.");
            return;
          }

          chrome.tabs.sendMessage(tab.id, { action: "updateBlur", prefs }, response => {
            if (chrome.runtime.lastError) {
              // Content script not yet injected
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
              }).then(() => {
                // Try sending the message again after a short delay
                setTimeout(() => {
                  chrome.tabs.sendMessage(tab.id, { action: "updateBlur", prefs });
                }, 100);
              }).catch(err => {
                console.error("Failed to inject content script:", err);
              });
            }
          });
        });
      });
    });
  });
});
