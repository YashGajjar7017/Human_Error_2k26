import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState("email"); // 'email' | 'otp' | 'reset'

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await window.electronAPI.callAPI(
        "POST",
        "/api/password-reset/send-otp",
        { email }
      );

      if (response.success) {
        setSuccess("OTP sent to your email!");
        setStep("otp");
      } else {
        setError(response.data?.message || response.error || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const otp = document.getElementById("reset-otp").value;
    
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await window.electronAPI.callAPI(
        "POST",
        "/api/password-reset/verify-otp",
        { email, otp }
      );

      if (response.success) {
        setSuccess("OTP verified!");
        setStep("reset");
      } else {
        setError(response.data?.message || response.error || "Invalid OTP");
      }
    } catch (err) {
      setError(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await window.electronAPI.callAPI(
        "POST",
        "/api/password-reset/reset",
        { email, password: newPassword }
      );

      if (response.success) {
        setSuccess("Password reset successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.data?.message || response.error || "Failed to reset password");
      }
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Reset Password</h1>
        <p>
          {step === "email" && "Enter your email to receive a verification code"}
          {step === "otp" && "Enter the OTP sent to your email"}
          {step === "reset" && "Enter your new password"}
        </p>

        {step === "email" && (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label>OTP Code</label>
              <input
                type="text"
                id="reset-otp"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                required
                disabled={loading}
                className="otp-input-center"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                id="new-password"
                placeholder="Enter new password"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <button className="back-to-login" onClick={handleBackToLogin}>
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

