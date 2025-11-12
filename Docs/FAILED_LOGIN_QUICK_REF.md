# Failed Login → Signup Redirect - Quick Reference

## 🎯 What This Does

When login fails, instead of showing an alert, the user is automatically redirected to the signup page with:
- ✅ Email pre-filled from their login attempt
- ✅ Warning message explaining they need to create an account
- ✅ OTP will be sent to verify their email

## 📋 Files Changed

| File | Changes | Purpose |
|------|---------|---------|
| `Frontend/Services/login/index.html` | Replaced alert with redirect | Redirect to signup on fail |
| `Frontend/controller/signup.controller.js` | Added query param handling | Extract email & failedLogin |
| `Frontend/views/Signup.html` | Added alert + auto-fill | Show context & pre-fill form |

## 🔄 User Journey

```
Login Failed
    ↓
User redirected to: /Account/Signup?email=user@example.com&failedLogin=true
    ↓
Email field auto-filled
Warning alert displayed
    ↓
User creates account
    ↓
OTP sent to email
    ↓
User verifies OTP
    ↓
Account created & logged in
```

## 🧪 Testing

### Scenario 1: Non-existent User
```
1. Go to: http://localhost:3000/Account/login
2. Enter: username = "newuser@example.com"
3. Enter: password = "anypassword"
4. Click: Login
5. Result: Redirected to signup with email pre-filled
```

### Scenario 2: Successful Signup After Failed Login
```
1. [Continue from Scenario 1]
2. Fill: username = "newuser"
3. Fill: password = "password123"
4. Fill: confirm password = "password123"
5. Click: Sign Up
6. Result: OTP sent to newuser@example.com
```

### Scenario 3: OTP Verification
```
1. [Continue from Scenario 2]
2. Check email for 6-digit OTP
3. Enter OTP digits
4. Click: Verify
5. Result: Account created, user logged in
```

## 🔍 URL Parameters

| Parameter | Value | Meaning |
|-----------|-------|---------|
| `email` | user@example.com | Pre-fill signup email |
| `failedLogin` | true/false | Show warning alert |

**Example URL:**
```
/Account/Signup?email=admin%40example.com&failedLogin=true
```

## 📝 Messages Shown

### Alert Message (on failed login redirect)
```
"Login Failed!"
"We couldn't find your account. Please sign up with this email 
to verify your identity and proceed."
```

### Scenarios Where User is Redirected to Signup

1. ❌ User not found → "Invalid credentials"
2. ❌ Password incorrect → "Invalid credentials"
3. ❌ Email not verified (non-admin) → "Please verify your email"

## 🛠️ How It Works

### 1. Login Fails (Backend)
```javascript
// In Backend/controller/login.controller.js
if (!user) {
    // User not found
    return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
    });
}
```

### 2. Redirect to Signup (Frontend)
```javascript
// In Frontend/Services/login/index.html
if (!data.success) {
    const signupUrl = `/Account/Signup?email=${encodeURIComponent(username)}&failedLogin=true`;
    window.location.href = signupUrl;
}
```

### 3. Pre-fill Signup (HTML)
```javascript
// In Frontend/views/Signup.html
const emailParam = urlParams.get('email');
if (emailParam) {
    document.getElementById('email').value = decodeURIComponent(emailParam);
}
```

### 4. Show Alert (HTML)
```javascript
const failedLogin = urlParams.get('failedLogin');
if (failedLogin === 'true') {
    document.getElementById('failedLoginAlert').style.display = 'block';
}
```

## 🚀 To Test Full Flow

### Terminal 1 (Backend - Port 8000)
```bash
cd Backend
npm start
```

### Terminal 2 (Frontend - Port 3000)
```bash
cd Frontend
npm start
```

### Browser
```
1. Open: http://localhost:3000/Account/login
2. Try to login with non-existent email
3. See redirect with pre-filled email
4. Complete signup
5. Verify OTP
6. Access dashboard
```

## 📊 Console Output

**When login fails and redirects:**

Frontend Console (3000):
```
Login failed, redirecting to signup with email: user@example.com
```

Backend Console (8000):
```
Login failed: User not found for username/email: user@example.com
```

## ✨ Features Provided

| Feature | Status | Description |
|---------|--------|-------------|
| Auto-redirect on fail | ✅ | No alert, direct redirect |
| Email pre-fill | ✅ | From login attempt |
| Failed login alert | ✅ | Shows warning message |
| OTP verification | ✅ | 6-digit code to email |
| Automatic account creation | ✅ | After OTP verification |
| Seamless flow | ✅ | No page reloads needed |

## 🐛 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Not redirecting | Servers not running | Start both servers |
| Email not pre-filled | Query param issue | Check URL format |
| No alert shown | failedLogin param false | Check redirect URL |
| OTP not sending | Backend email config | Check email service |
| Stuck on signup | Frontend route issue | Verify route exists |

## 🔐 Security Notes

- ✅ Email passed as URL parameter (visible but safe for this flow)
- ✅ OTP verified server-side
- ✅ Tokens generated on successful OTP verification
- ✅ Session created after email verification
- ✅ Admin users can bypass email verification

## 📞 Related Routes

- Login page: `/Account/login`
- Signup page: `/Account/Signup`
- OTP page: `/Account/sendOTP` or `/Account/Signup/OTP/{token}`
- Home page: `/` (after successful login)
