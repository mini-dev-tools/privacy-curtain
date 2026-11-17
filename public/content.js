const HOSTS = {
  'web.whatsapp.com': 'whatsapp',
  'mail.google.com': 'gmail',
  'outlook.live.com': 'outlook',
  'outlook.office.com': 'outlook',
  'outlook.office365.com': 'outlook',
  'outlook.cloud.microsoft': 'outlook',
  'teams.microsoft.com': 'teams',
  'teams.live.com': 'teams',
  'teams.cloud.microsoft': 'teams'
};

function detectPlatform() {
  const hostname = window.location.hostname.toLowerCase();
  const host = Object.keys(HOSTS).find(h => hostname === h || hostname.endsWith('.' + h));
  return host ? HOSTS[host] : null;
}

// Selectors use stable hooks (id, role, data-testid, data-tid) rather than the sites' hashed
// class names, which change often. Sources: open-source WhatsApp/Gmail/Outlook/Teams tools, 2026-11.
const WHATSAPP_ROW = '#pane-side [role="row"]:not([aria-hidden="true"]), #pane-side [role="listitem"]';

// RULES[platform] = [[prefKeys], selector]; a selector is blurred when any of its pref keys is on.
const RULES = {
  whatsapp: [
    [['blurImage', 'blurAll'], '#pane-side img'],
    [['blurName', 'blurAll'], '#pane-side [data-testid="cell-frame-title"]'],
    [['blurMessage', 'blurAll'], '#pane-side [data-testid="cell-frame-secondary"]'],
    [['blurChatImage', 'blurAll'], '#main header img'],
    [['blurChatName', 'blurAll'], '#main header [data-testid="conversation-info-header"], #main header span[title]'],
    [['blurChatAllMessages', 'blurAll'], '#main [data-testid="selectable-text"], #main span.selectable-text'],
    [['blurChatLastImage', 'blurAll'], '#main [data-testid="msg-container"] :is(img[src^="blob:"], video, canvas)'],
    [['blurAll'], WHATSAPP_ROW]
  ],
  gmail: [
    [['gmailBlurAll'], 'tr.zA']
  ],
  outlook: [
    [['outlookBlurAll'], '[role="option"][data-convid], [data-app-section="MessageList"] [data-item-index]']
  ],
  teams: [
    [['teams_blurImage', 'teams_blurAll'], '[role="treeitem"] .fui-Avatar'],
    [['teams_blurName', 'teams_blurAll'], '[id^="title-chat-list-item_"], [data-tid="chat-list-item-title"]'],
    [['teams_blurMessage', 'teams_blurAll'], '[id^="message-preview-chat-list-item_"], [data-tid="chat-list-item-preview-message"]'],
    [['teams_blurChatImage', 'teams_blurAll'], '[id^="chat-header-"] .fui-Avatar, [data-tid="chat-pane-item"] .fui-Avatar'],
    [['teams_blurChatName', 'teams_blurAll'], '[id^="chat-header-"] h2, [id^="chat-topic-person-"]'],
    [['teams_blurChatLastImage', 'teams_blurAll'], '[data-tid="chat-pane-message"] :is(img[itemtype$="/AMSImage"], img[data-gallery-src]), img[data-tid="rich-file-preview-image"]'],
    [['teams_blurChatAllMessages', 'teams_blurAll'], '[data-tid="chat-pane-message"] [id^="content-"]']
  ]
};

function buildCss(platform, prefs) {
  // :where() keeps :hover applied to every selector in a comma list (not just the last one)
  // with zero specificity, so the WhatsApp row-hover reveal below always wins.
  const css = (RULES[platform] || [])
    .filter(([keys]) => keys.some(key => prefs[key]))
    .map(([, sel]) => `:where(${sel}) { filter: blur(5px) !important; transition: filter 0.2s ease; }\n:where(${sel}):hover { filter: none !important; }`);
  if (platform === 'whatsapp' && prefs.blurAll) {
    css.push(`:is(${WHATSAPP_ROW}):hover * { filter: none !important; }`);
  }
  return css.join('\n');
}

function apply(prefs) {
  document.getElementById('platform-blur-style')?.remove();
  const css = buildCss(detectPlatform(), prefs || {});
  if (!css) return;
  const style = document.createElement('style');
  style.id = 'platform-blur-style';
  style.textContent = css;
  document.head.appendChild(style);
}

chrome.storage.sync.get(null, apply);

chrome.storage.onChanged.addListener((_, area) => {
  if (area === 'sync') chrome.storage.sync.get(null, apply);
});
