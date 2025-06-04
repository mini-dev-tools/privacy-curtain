  document.addEventListener("DOMContentLoaded", () => {
      const form = document.getElementById("blurForm");
      const toggleButtons = form.querySelectorAll('.toggle-button');
      
      // Add click handlers to toggle buttons
      toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
          const isEnabled = button.classList.contains('enabled');
          
          if (isEnabled) {
            button.classList.remove('enabled');
          } else {
            button.classList.add('enabled');
          }
        });
      });
      
      // Load settings
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
            if (prefs[key]) {
              button.classList.add('enabled');
            } else {
              button.classList.remove('enabled');
            }
          }
        });
      });

      // When form is submitted
      form.addEventListener("submit", e => {
        e.preventDefault();
        
        // Get current state of all toggle buttons
        const prefs = {};
        toggleButtons.forEach(button => {
          const name = button.getAttribute('data-name');
          prefs[name] = button.classList.contains('enabled');
        });

        chrome.storage.sync.set(prefs, () => {
          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const tab = tabs[0];
            if (!tab?.id) {
              alert("Could not get active tab information.");
              return;
            }

            // Check if we're on WhatsApp Web
            if (!tab.url || !tab.url.includes('web.whatsapp.com')) {
              alert("Please navigate to WhatsApp Web first.");
              return;
            }

            // Function to send message with timeout
            const sendMessageWithTimeout = (tabId, message, timeoutMs = 5000) => {
              return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                  reject(new Error('Message timeout'));
                }, timeoutMs);

                chrome.tabs.sendMessage(tabId, message, response => {
                  clearTimeout(timeout);
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve(response);
                  }
                });
              });
            };

            // Try to send message first (content script might already be injected)
            sendMessageWithTimeout(tab.id, { action: "updateBlur", prefs })
              .then(() => {
                alert("Settings saved!");
                window.close();
              })
              .catch(() => {
                // If message fails, try to inject content script
                chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  files: ["content.js"]
                }).then(() => {
                  // Wait a bit for content script to initialize
                  setTimeout(() => {
                    sendMessageWithTimeout(tab.id, { action: "updateBlur", prefs })
                      .then(() => {
                        alert("Settings saved!");
                        window.close();
                      })
                      .catch(error => {
                        console.error("Failed to send message after injection:", error);
                        alert("Could not apply settings. Please refresh WhatsApp Web and try again.");
                      });
                  }, 100);
                }).catch(error => {
                  console.error("Script injection failed:", error);
                  alert("Could not inject content script. Please refresh WhatsApp Web and try again.");
                });
              });
          });
        });
      });
    });