import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/OTP.css";

export default function OTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [step, setStep] = useState(email ? "verify" : "email");
  const [fromPage, setFromPage] = useState(location.state?.from || "signup");
  const otpInputs = useRef([]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle OTP input change
  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
    setError("");
  };

  // Handle OTP input key down
  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Handle OTP input paste
  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("").concat(otp).slice(0, 6);
      setOtp(newOtp);
      otpInputs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // For signup flow, use signup endpoint
      const endpoint = fromPage === "signup" ? "/api/signup/otp" : "/api/auth/send-otp";
      
      const response = await window.electronAPI.callAPI("POST", endpoint, {
        email,
      });

      // Handle different response formats
      const isSuccess = response.success || response.success === true || response.success === "true";
      
      if (isSuccess) {
        setSuccess("OTP sent successfully! Check your email.");
        setStep("verify");
        setResendTimer(60);
        setOtp(["", "", "", "", "", ""]);
      } else {
        // Handle error response
        const errorMessage = response.data?.error || response.error || response.data?.message || "Failed to send OTP";
        setError(errorMessage);
      }
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // For signup flow, use signup endpoint
      const endpoint = fromPage === "signup" ? "/api/signup/verify-otp" : "/api/auth/verify-otp";
      
      const response = await window.electronAPI.callAPI("POST", endpoint, {
        email,
        otp: otpCode,
      });

      // Handle different response formats
      const isSuccess = response.success || response.success === true || response.success === "true";
      
      if (isSuccess) {
        setSuccess("Email verified successfully!");
        
        // Store verified email and token if provided
        if (response.data?.accessToken || response.token) {
          const token = response.data?.accessToken || response.token;
          const user = response.data?.user || { email };
          
          localStorage.setItem("verifiedEmail", email);
          localStorage.setItem("authToken", token);
          
          // Redirect to dashboard after successful verification
          setTimeout(() => {
            navigate("/dashboard", { state: { email, verified: true } });
          }, 1500);
        } else {
          // For signup flow without immediate token, go to login
          setTimeout(() => {
            navigate("/login", { state: { email, verified: true } });
          }, 1500);
        }
      } else {
        // Handle error response
        const errorMessage = response.data?.error || response.error || response.data?.message || "Invalid OTP";
        setError(errorMessage);
        
        // Clear OTP on wrong attempt
        if (response.data?.error?.includes("Invalid") || errorMessage.includes("Invalid")) {
          setOtp(["", "", "", "", "", ""]);
          otpInputs.current[0]?.focus();
        }
      }
    } catch (err) {
      setError(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setOtp(["", "", "", "", "", ""]);
    await handleSendOTP();
  };

  // Go back to email input
  const handleBackToEmail = () => {
    setStep("email");
    setError("");
    setSuccess("");
    setOtp(["", "", "", "", "", ""]);
  };

  // Navigate to signup/login
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="otp-container">
      <div className="otp-wrapper">
        {/* Gradient background */}
        <div className="otp-gradient-bg"></div>

        {/* Card */}
        <div className="otp-card">
          {/* Header */}
          <div className="otp-header">
            <div className="otp-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M24 8v16m-8-8h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1>Verify Your Email</h1>
            <p>Enter the one-time password sent to your email</p>
            {email && (
              <p className="otp-email-display">
                📧 {email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="otp-content">
            {step === "email" ? (
              <div className="otp-step email-step">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    placeholder="Enter your email address"
                    className="email-input"
                    disabled={loading}
                  />
                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}
                </div>

                <button
                  onClick={handleSendOTP}
                  disabled={loading || !email}
                  className="send-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner-mini"></span> Sending...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>

                <div className="otp-nav-links">
                  <p>
                    {fromPage === "signup" ? (
                      <>
                        Already have an account?{" "}
                        <a href="/login" onClick={(e) => { e.preventDefault(); handleNavigate("/login"); }}>
                          Login here
                        </a>
                      </>
                    ) : (
                      <>
                        Don't have an account?{" "}
                        <a href="/signup" onClick={(e) => { e.preventDefault(); handleNavigate("/signup"); }}>
                          Sign up
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="otp-step verify-step">
                <div className="otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      onPaste={handleOTPPaste}
                      className="otp-input"
                      placeholder="•"
                      disabled={loading}
                    />
                  ))}
                </div>

                {error && <div className="error-message center">{error}</div>}
                {success && (
                  <div className="success-message center">{success}</div>
                )}

                <div className="otp-info">
                  <p>Didn't receive the code?</p>
                  <button
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || loading}
                    className="resend-btn"
                  >
                    {resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : "Resend OTP"}
                  </button>
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.some((d) => !d)}
                  className="verify-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner-mini"></span> Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <button
                  onClick={handleBackToEmail}
                  className="back-btn"
                  disabled={loading}
                >
                  ← Change Email
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="otp-footer">
            <p>Your data is secure and encrypted</p>
          </div>
        </div>

        {/* Floating shapes */}
        <div className="otp-shape shape-1"></div>
        <div className="otp-shape shape-2"></div>
        <div className="otp-shape shape-3"></div>
      </div>
    </div>
  );
}
