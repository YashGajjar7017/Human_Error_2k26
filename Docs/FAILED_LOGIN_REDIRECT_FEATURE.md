# Failed Login → Signup & OTP Verification Flow

## Overview
When a user attempts to login and fails, they are automatically redirected to the signup page where they can:
1. Sign up with a new account using their email
2. Receive an OTP verification code
3. Verify their email and complete registration

## User Flow

```
┌─────────────────┐
│  Login Page     │
│  (port 3000)    │
└────────┬────────┘
         │
    Enter credentials
         │
         ▼
┌─────────────────────────┐
│ Backend Authentication  │
│ (port 8000)            │
│ ✓ User found?          │
│ ✓ Password valid?      │
│ ✓ Email verified?      │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │          │
   YES        NO
    │          │
    ▼          ▼
┌────────┐  ┌──────────────────────────┐
│ Home   │  │ Signup Page              │
│        │  │ ✓ Email pre-filled       │
│        │  │ ✓ Warning alert shown    │
│        │  │ ✓ Create new account     │
└────────┘  └────────┬─────────────────┘
                     │
              Sign up with email
                     │
                     ▼
            ┌──────────────────┐
            │ OTP Email Sent   │
            │ to registered    │
            │ email address    │
            └────────┬─────────┘
                     │
              Enter OTP (6 digits)
                     │
                     ▼
            ┌──────────────────┐
            │ Email Verified   │
            │ Account Created  │
            │ User Logged In   │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Dashboard Access │
            └──────────────────┘
```

## Modified Files

### 1. Frontend/Services/login/index.html
**What Changed:** Modified the login form's response handling

**Before:**
```javascript
if (data.success) {
    // Success handling
} else {
    alert(data.message || 'Login failed');
}
```

**After:**
```javascript
if (data.success) {
    // Success handling
} else {
    // Redirect to signup with pre-filled email
    const signupUrl = `/Account/Signup?email=${encodeURIComponent(username)}&failedLogin=true`;
    window.location.href = signupUrl;
}
```

**Features:**
- Passes the entered username/email as a query parameter
- Passes `failedLogin=true` flag to signal this came from a failed login
- Automatic redirect (no alert dialog)

---

### 2. Frontend/controller/signup.controller.js
**What Changed:** Enhanced signup page serving with query parameters

**Features Added:**
- Extracts `email` and `failedLogin` parameters from query string
- Logs these parameters for debugging
- Handles token generation if no token exists in path
- Preserves query parameters during redirects

**Key Code:**
```javascript
const { email, failedLogin } = req.query;
// If no token in path, generate one and redirect with params preserved
return res.redirect(`/Account/Signup/${token}?email=${encodeURIComponent(email || '')}&failedLogin=${failedLogin || false}`);
```

---

### 3. Frontend/views/Signup.html
**What Changed:** Added UI enhancements and intelligent form handling

**New Features:**
1. **Failed Login Alert:** Warning message displayed when user comes from failed login
   ```html
   <div id="failedLoginAlert" style="display:none;">
       <!-- Alert message -->
   </div>
   ```

2. **Auto-fill Email:** Email field pre-filled from failed login
   ```javascript
   if (emailParam) {
       document.getElementById('email').value = decodeURIComponent(emailParam);
   }
   ```

3. **Show Alert on Failed Login:**
   ```javascript
   if (failedLogin === 'true') {
       document.getElementById('failedLoginAlert').style.display = 'block';
       document.getElementById('username').focus();
   }
   ```

4. **Fixed Fetch Endpoint:** Changed from `/api/signup/Account/Signup` to `/Account/Signup`
   - Now goes through frontend routes instead of direct proxy
   - Proper error handling with controller logging

5. **Redirect to OTP Page:** After signup, redirects to OTP verification page
   ```javascript
   window.location.href = data.redirectUrl || '/Account/sendOTP';
   ```

---

## Technical Details

### Query Parameters Passed
```
/Account/Signup?email=user@example.com&failedLogin=true
```

- `email`: The username/email from failed login attempt
- `failedLogin`: Boolean flag to show UI alert

### Error Scenarios Handled

1. **User not found**
   - Shows "Invalid credentials" message
   - Redirects to signup with the entered email
   - User can create account with that email

2. **Invalid password**
   - Shows "Invalid credentials" message
   - Redirects to signup with the entered email
   - User can recover via email verification

3. **Email not verified (non-admin users)**
   - Shows "Please verify your email address" message
   - Redirects to signup
   - User can verify email via OTP

4. **Admin users without verified email**
   - Can still login (email verification skipped for admins)
   - Full access granted

---

## Request Flow

```
Client Browser                Frontend Server (3000)       Backend Server (8000)
     │                               │                            │
     │──POST /Account/login──────────>                            │
     │                               │                            │
     │                               │────POST /api/login────────>│
     │                               │                            │ Verify credentials
     │                               │<────────Response───────────│
     │                               │                            │
     │                               │ (On failure)               │
     │<──Redirect with email─────────│                            │
     │  and failedLogin flag         │                            │
     │                               │                            │
     │──GET /Account/Signup?─────────>                            │
     │   email=...&failedLogin=true  │                            │
     │                               │                            │
     │<──Signup.html (with alert)────│                            │
     │                               │                            │
     │──POST /Account/Signup─────────>                            │
     │   (signup data)               │                            │
     │                               │──POST /api/signup/────────>│
     │                               │   Account/Signup           │ Create user
     │                               │<────────Response───────────│
     │                               │                            │
     │<──Redirect to OTP page────────│                            │
     │                               │                            │
     │ [OTP verification flow]       │                            │
     │                               │                            │
```

---

## Testing Steps

1. **Start Servers**
   ```bash
   # Terminal 1: Backend
   cd Backend
   npm start
   
   # Terminal 2: Frontend
   cd Frontend
   npm start
   ```

2. **Test Failed Login Scenario**
   - Go to: `http://localhost:3000/Account/login`
   - Enter a non-existent username: `testuser@example.com`
   - Enter any password: `password123`
   - Click Login
   - **Expected:** Redirected to signup page with:
     - Email pre-filled with `testuser@example.com`
     - Warning alert displayed
     - Ready to create new account

3. **Complete Signup Flow**
   - Fill in username: `testuser`
   - Email already filled: `testuser@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
   - Click Sign Up
   - **Expected:** Redirected to OTP verification page

4. **OTP Verification**
   - Check email for OTP code
   - Enter 6-digit OTP
   - Click Verify
   - **Expected:** Account created, logged in, dashboard access

---

## Error Messages

| Scenario | Backend Message | Frontend Action |
|----------|-----------------|-----------------|
| User not found | "Invalid credentials" | Redirect to signup |
| Wrong password | "Invalid credentials" | Redirect to signup |
| Email not verified | "Please verify your email" | Redirect to signup |
| Missing fields | "Username and password required" | Show alert |
| Server error | "Login failed. Please try again." | Show alert |

---

## Console Logs for Debugging

**Frontend Console (port 3000):**
```
=== FRONTEND LOGIN REQUEST ===
Username: testuser@example.com
FetchData: Making request to http://localhost:8000/api/login
Backend response received: { success: false, message: "Invalid credentials" }
Login failed, redirecting to signup with email: testuser@example.com
```

**Backend Console (port 8000):**
```
=== LOGIN REQUEST RECEIVED ===
Request body: { username: 'testuser@example.com', password: '***' }
User found: No
Login failed: User not found for username/email: testuser@example.com
```

---

## Future Enhancements

1. **Remember Attempt:** Store failed login details for 5-10 seconds
2. **Auto-Send OTP:** Automatically send OTP on signup completion
3. **Resend OTP:** Allow users to request OTP resend
4. **Account Recovery:** Link to password reset if user has existing account
5. **Social Login:** Add Google/GitHub signup as alternative
6. **Rate Limiting:** Prevent brute force on failed login redirects
