import { useEffect, useState } from "react";
import "./popup.css";

const toggleLabels = {
    universalBlur: "Universal Blur (Any Site)",
    blurImage: "Blur Profile Images",
    blurName: "Blur Names",
    blurMessage: "Blur Messages",
    blurAll: "Blur Everything",
    blurChatLastImage: "Blur Images & Videos",
    blurChatAllMessages: "Blur All Messages",
    blurChatName: "Blur Name",
    blurChatImage: "Blur Profile Picture",
    // Gmail-specific
    gmailBlurAll: "Blur Everything in Gmail",
    // Outlook-specific
    outlookBlurAll: "Blur Everything in Outlook",
    // Teams-specific
    teams_blurImage: "Blur Profile Images",
    teams_blurName: "Blur Names",
    teams_blurMessage: "Blur Messages",
    teams_blurAll: "Blur Everything",
    teams_blurChatLastImage: "Blur Images",
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

const platformTabs = [
    ["whatsapp", "WhatsApp", "bi-whatsapp"],
    ["gmail", "Mail", "bi-envelope-fill"],
    ["teams", "Teams", "bi-microsoft-teams"]
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

const platformToggles = { whatsapp: whatsappToggles, gmail: gmailToggles, teams: teamsToggles };

const HOSTS = {
    "web.whatsapp.com": "whatsapp",
    "mail.google.com": "gmail",
    "outlook.live.com": "outlook",
    "outlook.office.com": "outlook",
    "outlook.office365.com": "outlook",
    "outlook.cloud.microsoft": "outlook",
    "teams.microsoft.com": "teams",
    "teams.live.com": "teams",
    "teams.cloud.microsoft": "teams"
};

// Platform detection helper (callback-style: Firefox MV2 chrome.* is not promise-based)
const detectCurrentPlatform = () => new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        try {
            const hostname = new URL(tabs?.[0]?.url).hostname.toLowerCase();
            const host = Object.keys(HOSTS).find(h => hostname === h || hostname.endsWith("." + h));
            resolve(host ? HOSTS[host] : null);
        } catch {
            resolve(null);
        }
    });
});

const App = () => {
    const [platform, setPlatform] = useState("whatsapp");
    const [toggles, setToggles] = useState({});
    const [showSettings, setShowSettings] = useState(false);
    const [currentPagePlatform, setCurrentPagePlatform] = useState(null);

    useEffect(() => {
        chrome.storage.sync.get(null, (prefs) => setToggles(prefs || {}));
        detectCurrentPlatform().then(detectedPlatform => {
            setCurrentPagePlatform(detectedPlatform);
            if (detectedPlatform) setPlatform(detectedPlatform === "outlook" ? "gmail" : detectedPlatform);
        });
    }, []);

    const handleToggle = (name) => {
        const updated = { ...toggles, [name]: !toggles[name] };
        setToggles(updated);
        chrome.storage.sync.set(updated);
    };

    const toggleAllForPlatform = (platformKey, value) => {
        const updated = { ...toggles };
        platformToggles[platformKey].forEach(key => {
            updated[key] = value;
        });
        setToggles(updated);
        chrome.storage.sync.set(updated);
    };

    const isAllEnabled = (platformKey) => platformToggles[platformKey].every(key => toggles[key]);

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

    const isCurrentPage = (tabPlatform) => currentPagePlatform === tabPlatform ||
        (tabPlatform === "gmail" && currentPagePlatform === "outlook");

    return (
        <div>
            <nav className="tab-bar">
                <div className="tab-group">
                    {platformTabs.map(([key, label, icon]) => (
                        <button
                            key={key}
                            type="button"
                            className={`tab-button ${platform === key && !showSettings ? "active-tab" : ""}`}
                            onClick={() => { setPlatform(key); setShowSettings(false); }}
                        >
                            <i className={`bi ${icon}`}></i>
                            <span>{label}</span>
                            {isCurrentPage(key) && <span className="current-dot" title="Current page"></span>}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    className={`tab-button settings-button ${showSettings ? "active-tab" : ""}`}
                    onClick={() => setShowSettings(true)}
                    title="Settings"
                >
                    <i className="bi bi-gear"></i>
                </button>
            </nav>

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