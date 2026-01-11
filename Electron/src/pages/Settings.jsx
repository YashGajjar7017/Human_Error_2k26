import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Settings({ user }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState({
    // General
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    
    // Editor
    fontSize: 14,
    tabSize: 2,
    autoSave: true,
    wordWrap: true,
    minimap: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    newFeatures: true,
    
    // Privacy
    showProfile: true,
    allowSearch: true,
    shareProgress: false,
    
    // Appearance
    theme: "light",
    sidebarPosition: "left",
    compactMode: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setMessage({ type: "", text: "" });
  };

  const handleSave = async () => {
    setMessage({ type: "info", text: "Saving changes..." });
    
    try {
      // Simulate API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setMessage({ type: "success", text: "Settings saved successfully!" });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save settings" });
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      setSettings({
        language: "en",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
        fontSize: 14,
        tabSize: 2,
        autoSave: true,
        wordWrap: true,
        minimap: true,
        emailNotifications: true,
        pushNotifications: true,
        weeklyDigest: true,
        newFeatures: true,
        showProfile: true,
        allowSearch: true,
        shareProgress: false,
        theme: "light",
        sidebarPosition: "left",
        compactMode: false,
      });
      setMessage({ type: "info", text: "Settings reset to default" });
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Settings</h1>
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="settings-layout">
          {/* Sidebar */}
          <aside className="settings-sidebar">
            <nav className="settings-nav">
              <button
                className={`nav-item ${activeSection === "general" ? "active" : ""}`}
                onClick={() => setActiveSection("general")}
              >
                ⚙️ General
              </button>
              <button
                className={`nav-item ${activeSection === "editor" ? "active" : ""}`}
                onClick={() => setActiveSection("editor")}
              >
                📝 Editor
              </button>
              <button
                className={`nav-item ${activeSection === "notifications" ? "active" : ""}`}
                onClick={() => setActiveSection("notifications")}
              >
                🔔 Notifications
              </button>
              <button
                className={`nav-item ${activeSection === "privacy" ? "active" : ""}`}
                onClick={() => setActiveSection("privacy")}
              >
                🔒 Privacy
              </button>
              <button
                className={`nav-item ${activeSection === "appearance" ? "active" : ""}`}
                onClick={() => setActiveSection("appearance")}
              >
                🎨 Appearance
              </button>
              <button
                className={`nav-item ${activeSection === "account" ? "active" : ""}`}
                onClick={() => setActiveSection("account")}
              >
                👤 Account
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="settings-content">
            {message.text && (
              <div className={`settings-message ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* General Settings */}
            {activeSection === "general" && (
              <div className="settings-section">
                <h2>General Settings</h2>
                
                <div className="setting-item">
                  <label>
                    <span>Language</span>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange("language", e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="zh">中文</option>
                    </select>
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <span>Timezone</span>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange("timezone", e.target.value)}
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="CET">Central European</option>
                    </select>
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <span>Date Format</span>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => handleSettingChange("dateFormat", e.target.value)}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {/* Editor Settings */}
            {activeSection === "editor" && (
              <div className="settings-section">
                <h2>Editor Settings</h2>
                
                <div className="setting-item">
                  <label>
                    <span>Font Size</span>
                    <input
                      type="number"
                      min="10"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => handleSettingChange("fontSize", parseInt(e.target.value))}
                    />
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <span>Tab Size</span>
                    <select
                      value={settings.tabSize}
                      onChange={(e) => handleSettingChange("tabSize", parseInt(e.target.value))}
                    >
                      <option value="2">2 spaces</option>
                      <option value="4">4 spaces</option>
                    </select>
                  </label>
                </div>

                <div className="setting-item toggle">
                  <label className="toggle-label">
                    <span>Auto-save</span>
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingChange("autoSave", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item toggle">
                  <label className="toggle-label">
                    <span>Word Wrap</span>
                    <input
                      type="checkbox"
                      checked={settings.wordWrap}
                      onChange={(e) => handleSettingChange("wordWrap", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item toggle">
                  <label className="toggle-label">
                    <span>Minimap</span>
                    <input
                      type="checkbox"
                      checked={settings.minimap}
                      onChange={(e) => handleSettingChange("minimap", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === "notifications" && (
              <div className="settings-section">
                <h2>Notification Preferences</h2>
                
                <div className="setting-item toggle">
                  <label className="toggle-label">
                    <span>Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange("emailNotifications", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item toggle">
                  <label className="toggle-label">
                    <span>Push Notifications</span>
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange("pushNotifications", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item toggle">
                  <label className="toggle-label">
                    <span>Weekly Digest</span>
                    <input
                      type="checkbox"
                      checked={settings.weeklyDigest}
                      onChange={(e) => handleSettingChange("weeklyDigest", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item toggle">
                  <label className="toggle-label">
                    <span>New Features Updates</span>
                    <input
                      type="checkbox"
                      checked={settings.newFeatures}
                      onChange={(e) => handleSettingChange("newFeatures", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeSection === "privacy" && (
              <div className="settings-section">
                <h2>Privacy Settings</h2>
                
                <div className="setting-item toggle">
                  <label className="toggle-label">
                    <span>Show Profile Publicly</span>
                    <input
                      type="checkbox"
                      checked={settings.showProfile}
                      onChange={(e) => handleSettingChange("showProfile", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item toggle">
                  <label className="toggle-label">
                    <span>Allow Search Engines</span>
                    <input
                      type="checkbox"
                      checked={settings.allowSearch}
                      onChange={(e) => handleSettingChange("allowSearch", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item toggle">
                  <label className="toggle-label">
                    <span>Share Progress on Leaderboards</span>
                    <input
                      type="checkbox"
                      checked={settings.shareProgress}
                      onChange={(e) => handleSettingChange("shareProgress", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <button className="delete-account-btn">
                    Delete Account
                  </button>
                  <p>This action cannot be undone.</p>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeSection === "appearance" && (
              <div className="settings-section">
                <h2>Appearance</h2>
                
                <div className="setting-item">
                  <label>
                    <span>Theme</span>
                    <div className="theme-options">
                      <button
                        className={`theme-btn ${settings.theme === "light" ? "active" : ""}`}
                        onClick={() => handleSettingChange("theme", "light")}
                      >
                        ☀️ Light
                      </button>
                      <button
                        className={`theme-btn ${settings.theme === "dark" ? "active" : ""}`}
                        onClick={() => handleSettingChange("theme", "dark")}
                      >
                        🌙 Dark
                      </button>
                      <button
                        className={`theme-btn ${settings.theme === "system" ? "active" : ""}`}
                        onClick={() => handleSettingChange("theme", "system")}
                      >
                        💻 System
                      </button>
                    </div>
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <span>Sidebar Position</span>
                    <select
                      value={settings.sidebarPosition}
                      onChange={(e) => handleSettingChange("sidebarPosition", e.target.value)}
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                </div>

                <div className="setting-item toggle">
                  <label className="toggle-label">
                    <span>Compact Mode</span>
                    <input
                      type="checkbox"
                      checked={settings.compactMode}
                      onChange={(e) => handleSettingChange("compactMode", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {/* Account Settings */}
            {activeSection === "account" && (
              <div className="settings-section">
                <h2>Account Settings</h2>
                
                <div className="account-info">
                  <div className="info-row">
                    <span className="label">Username:</span>
                    <span className="value">{user?.username || "User"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{user?.email || "user@email.com"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Member Since:</span>
                    <span className="value">January 2025</span>
                  </div>
                </div>

                <div className="account-actions">
                  <button className="action-btn">
                    📧 Change Email
                  </button>
                  <button className="action-btn">
                    🔐 Change Password
                  </button>
                  <button className="action-btn">
                    📱 Two-Factor Authentication
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="settings-actions">
              <button className="reset-btn" onClick={handleReset}>
                Reset to Default
              </button>
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

