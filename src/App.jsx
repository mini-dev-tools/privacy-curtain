import { useEffect, useState } from "react";
import "./popup.css";

const toggleLabels = {
    universalBlur: "Universal Blur (Any Site)",
    blurImage: "Blur Profile Images",
    blurName: "Blur Names",
    blurMessage: "Blur Messages",
    blurAll: "Blur Everything",
    blurChatLastImage: "Blur Last Image",
    blurChatAllMessages: "Blur All Messages",
    blurChatName: "Blur Name",
    blurChatImage: "Blur Profile Picture",
    // Gmail-specific
    gmailBlurSender: "Blur Sender",
    gmailBlurSender2: "Blur Sender 2",
    gmailBlurSubject: "Blur Subject",
    gmailBlurSnippet: "Blur Snippet",
    gmailBlurAll: "Blur Everything in Gmail",
    // Outlook-specific
    outlookBlurAll: "Blur Everything in Outlook",
    // Teams-specific
    teams_blurImage: "Blur Profile Images",
    teams_blurName: "Blur Names",
    teams_blurMessage: "Blur Messages",
    teams_blurAll: "Blur Everything",
    teams_blurChatLastImage: "Blur Last Image",
    teams_blurChatAllMessages: "Blur All Messages",
    teams_blurChatName: "Blur Name",
    teams_blurChatImage: "Blur Profile Picture"
};

const whatsappToggles = [
    "blurImage",
    "blurName",
    "blurMessage",
    "blurAll",
    "blurChatLastImage",
    "blurChatAllMessages",
    "blurChatName",
    "blurChatImage"
];

const gmailToggles = [
    "gmailBlurAll",
    "outlookBlurAll"
];

const teamsToggles = [
    "teams_blurImage",
    "teams_blurName",
    "teams_blurMessage",
    "teams_blurAll",
    "teams_blurChatLastImage",
    "teams_blurChatAllMessages",
    "teams_blurChatName",
    "teams_blurChatImage"
];

// Platform detection helper
const detectCurrentPlatform = async () => {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (!activeTab?.url) return null;

        const hostname = new URL(activeTab.url).hostname.toLowerCase();

        if (hostname.includes('web.whatsapp.com') || hostname.includes('whatsapp.com')) {
            return 'whatsapp';
        } else if (hostname.includes('mail.google.com') || hostname.includes('gmail.com')) {
            return 'gmail';
        } else if (hostname.includes('outlook.live.com') || hostname.includes('outlook.office.com') || hostname.includes('outlook.office365.com')) {
            return 'outlook';
        } else if (hostname.includes('teams.microsoft.com') || hostname.includes('teams.live.com')) {
            return 'teams';
        }

        return null;
    } catch (error) {
        console.error('Error detecting platform:', error);
        return null;
    }
};

const App = () => {
    const [platform, setPlatform] = useState("whatsapp");
    const [toggles, setToggles] = useState({});
    const [showSettings, setShowSettings] = useState(false);
    const [currentPagePlatform, setCurrentPagePlatform] = useState(null);

    useEffect(() => {
        chrome.storage.sync.get(null, (prefs) => setToggles(prefs || {}));
        detectCurrentPlatform().then(detectedPlatform => {
            setCurrentPagePlatform(detectedPlatform);
            if (detectedPlatform) setPlatform(detectedPlatform);
        });
    }, []);

    const sendMessageToContentScript = (prefs, targetPlatform = null) => {
        const hostMatch = (url, platform) => {
            if (!url) return false;
            const hostname = new URL(url).hostname.toLowerCase();
            if (platform === 'whatsapp') return hostname.includes('whatsapp.com');
            if (platform === 'gmail') return hostname.includes('gmail.com') || hostname.includes('mail.google.com');
            if (platform === 'outlook') return hostname.includes('outlook.');
            if (platform === 'teams') return hostname.includes('teams.');
            return false;
        };

        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.id && tab.url && hostMatch(tab.url, targetPlatform)) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: "updateBlur",
                        prefs,
                        platform: targetPlatform
                    }, () => {
                        if (chrome.runtime.lastError) {
                            chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                files: ["content.js"]
                            }).then(() => {
                                setTimeout(() => {
                                    chrome.tabs.sendMessage(tab.id, {
                                        action: "updateBlur",
                                        prefs,
                                        platform: targetPlatform
                                    });
                                }, 100);
                            });
                        }
                    });
                }
            });
        });
    };

    const handleToggle = (name) => {
        const updated = { ...toggles, [name]: !toggles[name] };
        setToggles(updated);
        chrome.storage.sync.set(updated, () => {
            sendMessageToContentScript(updated, currentPagePlatform || platform);
        });
    };

    const toggleAllForPlatform = (platformKey, value) => {
        let keys = [];
        let affectedPlatforms = [platformKey];

        if (platformKey === "whatsapp") keys = whatsappToggles;
        else if (platformKey === "gmail") {
            keys = gmailToggles;
            affectedPlatforms = ["gmail", "outlook"]; // 👈 Send to both
        }
        else if (platformKey === "outlook") keys = outlookToggles;
        else if (platformKey === "teams") keys = teamsToggles;

        const updated = { ...toggles };
        keys.forEach(key => {
            updated[key] = value;
        });

        setToggles(updated);
        chrome.storage.sync.set(updated, () => {
            // 👇 Send blur updates to all affected platforms
            affectedPlatforms.forEach(p => sendMessageToContentScript(updated, p));
        });
    };


    const isAllEnabled = (platformKey) => {
        let keys = [];
        if (platformKey === "whatsapp") keys = whatsappToggles;
        else if (platformKey === "gmail") keys = gmailToggles;
        else if (platformKey === "outlook") keys = outlookToggles;
        else if (platformKey === "teams") keys = teamsToggles;
        return keys.every(key => toggles[key]);
    };

    const renderButton = (name) => (
        <div className="option-row" key={name}>
            <span className="option-label">{toggleLabels[name] || name}</span>
            <button
                type="button"
                className={`toggle-button ${toggles[name] ? "enabled" : ""}`}
                onClick={() => handleToggle(name)}
            >
                <div className="toggle-slider"></div>
            </button>
        </div>
    );

    const renderMasterToggle = (platformKey, label) => {
        const enabled = isAllEnabled(platformKey);
        return (
            <div className="option-row" key={platformKey}>
                <span className="option-label">{label}</span>
                <button
                    type="button"
                    className={`toggle-button ${enabled ? "enabled" : ""}`}
                    onClick={() => toggleAllForPlatform(platformKey, !enabled)}
                >
                    <div className="toggle-slider"></div>
                </button>
            </div>
        );
    };

    const renderSettingsPanel = () => (
        <div>
            <h3>Master Blur Settings</h3>
            {currentPagePlatform && (
                <div style={{
                    padding: "8px",
                    marginBottom: "10px",
                    backgroundColor: "#e3f2fd",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#1976d2"
                }}>
                    Current page: {currentPagePlatform.charAt(0).toUpperCase() + currentPagePlatform.slice(1)}
                </div>
            )}
            {renderMasterToggle("whatsapp", "WhatsApp Blur")}
            {renderMasterToggle("gmail", "All Gmail & Outlook Blur")}
            {renderMasterToggle("teams", "Teams Blur")}
        </div>
    );

    const getPlatformButtonClass = (buttonPlatform) => {
        // Only show active if not in settings mode and this is the selected platform
        const isActive = platform === buttonPlatform && !showSettings;
        const isCurrentPage = currentPagePlatform === buttonPlatform ||
            (buttonPlatform === 'gmail' && currentPagePlatform === 'outlook');

        if (isActive) {
            return "active-tab";
        } else if (isCurrentPage) {
            return "current-page";
        }

        return "";
    };

    return (
        <div>
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                gap: "8px", 
                marginBottom: "20px",
                borderBottom: "1px solid #e0e0e0",
                paddingBottom: "10px"
            }}>
                <button
                    className={`tab-button ${showSettings ? "active-tab" : ""}`}
                    onClick={() => setShowSettings(true)}
                >
                    <span className="tab-label">Settings</span>
                    <i className="bi bi-gear tab-icon"></i>
                </button>
                <button
                    className={`tab-button ${getPlatformButtonClass("whatsapp")}`}
                    onClick={() => { setPlatform("whatsapp"); setShowSettings(false); }}
                >
                    <span className="tab-label">WhatsApp</span>
                    <i className="bi bi-whatsapp tab-icon"></i>
                </button>
                <button
                    className={`tab-button ${getPlatformButtonClass("gmail")}`}
                    onClick={() => { setPlatform("gmail"); setShowSettings(false); }}
                >
                    <span className="tab-label">Mail</span>
                    <i className="bi bi-envelope-fill tab-icon"></i>
                </button>
                <button
                    className={`tab-button ${getPlatformButtonClass("teams")}`}
                    onClick={() => { setPlatform("teams"); setShowSettings(false); }}
                >
                    <span className="tab-label">Teams</span>
                    <i className="bi bi-microsoft-teams tab-icon"></i>
                </button>
            </div>

            {!showSettings ? (
                platform === "gmail" ? (
                    <>
                        <h3>Gmail & Outlook Blur Settings</h3>
                        <form id="blurForm">
                            <div className="fieldset-container">
                                <fieldset>
                                    {gmailToggles.map(renderButton)}
                                </fieldset>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <h3>{platform === "teams" ? "Microsoft Teams Blur Settings" : "WhatsApp Blur Settings"}</h3>
                        <form id="blurForm">
                            <div className="fieldset-container">
                                <fieldset>
                                    <legend>Outside Chat Options</legend>
                                    {(platform === "teams" ? teamsToggles.slice(0, 4) : whatsappToggles.slice(0, 4)).map(renderButton)}
                                </fieldset>
                                <fieldset>
                                    <legend>Inside Chat Options</legend>
                                    {(platform === "teams" ? teamsToggles.slice(4) : whatsappToggles.slice(4)).map(renderButton)}
                                </fieldset>
                            </div>
                        </form>
                    </>
                )
            ) : (
                renderSettingsPanel()
            )}
        </div>
    )};
export default App;