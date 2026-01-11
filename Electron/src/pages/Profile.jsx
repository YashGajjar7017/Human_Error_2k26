import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Profile({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await window.electronAPI.callAPI(
        "PUT",
        "/api/users/profile",
        formData
      );

      if (response.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setEditing(false);
      } else {
        setMessage({ type: "error", text: response.data?.message || "Failed to update profile" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>My Profile</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {formData.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <h3>{formData.username || "User"}</h3>
              <p>{formData.email || "user@email.com"}</p>
            </div>

            <nav className="profile-nav">
              <button
                className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                👤 Profile
              </button>
              <button
                className={`nav-item ${activeTab === "activity" ? "active" : ""}`}
                onClick={() => setActiveTab("activity")}
              >
                📊 Activity
              </button>
              <button
                className={`nav-item ${activeTab === "security" ? "active" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                🔐 Security
              </button>
              <button
                className={`nav-item ${activeTab === "preferences" ? "active" : ""}`}
                onClick={() => setActiveTab("preferences")}
              >
                ⚙️ Preferences
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="profile-content">
            {activeTab === "profile" && (
              <div className="profile-section">
                <div className="section-header">
                  <h2>Profile Information</h2>
                  {!editing && (
                    <button
                      className="edit-btn"
                      onClick={() => setEditing(true)}
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>

                {message.text && (
                  <div className={`message ${message.type}`}>
                    {message.text}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={!editing || loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editing || loading}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!editing || loading}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={!editing || loading}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      disabled={!editing || loading}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {editing && (
                  <div className="form-actions">
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          username: user?.username || "",
                          email: user?.email || "",
                          bio: user?.bio || "",
                          location: user?.location || "",
                          website: user?.website || "",
                        });
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      className="save-btn"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="profile-section">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">📝</span>
                    <div className="activity-details">
                      <p>Completed "Introduction to JavaScript" course</p>
                      <span className="activity-time">2 hours ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">🎯</span>
                    <div className="activity-details">
                      <p>Solved 5 coding challenges</p>
                      <span className="activity-time">Yesterday</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">🏆</span>
                    <div className="activity-details">
                      <p>Earned "Fast Learner" badge</p>
                      <span className="activity-time">3 days ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">👥</span>
                    <div className="activity-details">
                      <p>Joined collaboration session</p>
                      <span className="activity-time">1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="profile-section">
                <h2>Security Settings</h2>
                <div className="security-options">
                  <div className="security-item">
                    <div className="security-info">
                      <h3>Two-Factor Authentication</h3>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <button className="enable-btn">Enable</button>
                  </div>
                  <div className="security-item">
                    <div className="security-info">
                      <h3>Change Password</h3>
                      <p>Update your password regularly for security</p>
                    </div>
                    <button className="change-btn">Change</button>
                  </div>
                  <div className="security-item">
                    <div className="security-info">
                      <h3>Active Sessions</h3>
                      <p>Manage devices where you're logged in</p>
                    </div>
                    <button className="view-btn">View All</button>
                  </div>
                  <div className="security-item">
                    <div className="security-info">
                      <h3>Login History</h3>
                      <p>See your recent login activity</p>
                    </div>
                    <button className="view-btn">View History</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="profile-section">
                <h2>Preferences</h2>
                <div className="preferences-list">
                  <div className="preference-item">
                    <label className="toggle-label">
                      <span>Email Notifications</span>
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="preference-item">
                    <label className="toggle-label">
                      <span>Push Notifications</span>
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="preference-item">
                    <label className="toggle-label">
                      <span>Dark Mode</span>
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="preference-item">
                    <label className="toggle-label">
                      <span>Auto-save Code</span>
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

