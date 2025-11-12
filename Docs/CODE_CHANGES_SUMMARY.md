# Code Changes Summary - Failed Login Redirect Feature

## 1️⃣ Frontend/Services/login/index.html

### Change Location
Lines: ~90-105 (in the login button click handler)

### Old Code
```javascript
if (data.success) {
    // Store user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    sessionStorage.setItem('nameToken', username);
    document.cookie = `username=${username}; path=/`;

    // Redirect to home page
    console.log('Login successful, redirecting...');
    window.location.href = '/';
} else {
    alert(data.message || 'Login failed');
}
```

### New Code
```javascript
if (data.success) {
    // Store user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    sessionStorage.setItem('nameToken', username);
    document.cookie = `username=${username}; path=/`;

    // Redirect to home page
    console.log('Login successful, redirecting...');
    window.location.href = '/';
} else {
    console.log('Login failed, redirecting to signup with email:', username);
    // Redirect to signup page with the username/email as parameter
    // OTP will be sent to this email
    const signupUrl = `/Account/Signup?email=${encodeURIComponent(username)}&failedLogin=true`;
    window.location.href = signupUrl;
}
```

### Key Changes
- ✅ Removed `alert()` call
- ✅ Added console log for debugging
- ✅ Created signup URL with query parameters
- ✅ URL-encoded email for safety
- ✅ Added `failedLogin=true` flag

---

## 2️⃣ Frontend/controller/signup.controller.js

### Change Location
Lines: ~29-54 (in the signUp export function)

### Old Code
```javascript
// Serve signup page
exports.signUp = (req, res) => {
    try {
        const { SignUpToken } = req.params;
        console.log('Received signup token:', SignUpToken);
        
        if (SignUpToken && SignUpToken.length === 15) {
            const filePath = path.join(rootDir, 'views', 'Signup.html');
            console.log('Serving signup page from:', filePath);
            res.sendFile(filePath);
        } else {
            console.log('Invalid signup token length:', SignUpToken?.length);
            res.status(401).json({ error: "Invalid signup token" });
        }
    } catch (error) {
        console.error('Error serving signup page:', error);
        res.status(500).json({ error: 'Failed to serve signup page' });
    }
};
```

### New Code
```javascript
// Serve signup page
exports.signUp = (req, res) => {
    try {
        const { SignUpToken } = req.params;
        const { email, failedLogin } = req.query; // Get email and failedLogin flag from query
        
        console.log('Received signup token:', SignUpToken);
        console.log('Email from query:', email);
        console.log('Failed login redirect:', failedLogin);
        
        if (SignUpToken && SignUpToken.length === 15) {
            const filePath = path.join(rootDir, 'views', 'Signup.html');
            console.log('Serving signup page from:', filePath);
            // Pass email and failedLogin flag to the HTML page via query parameters
            return res.sendFile(filePath);
        } else {
            // If no token in path, generate one and redirect
            const token = generateToken(15);
            console.log('Generated new signup token:', token);
            return res.redirect(`/Account/Signup/${token}?email=${encodeURIComponent(email || '')}&failedLogin=${failedLogin || false}`);
        }
    } catch (error) {
        console.error('Error serving signup page:', error);
        res.status(500).json({ error: 'Failed to serve signup page' });
    }
};
```

### Key Changes
- ✅ Extract `email` and `failedLogin` from query parameters
- ✅ Added console logs for debugging
- ✅ Generate token if not in path
- ✅ Preserve query parameters in redirects
- ✅ Return statements added for clarity

---

## 3️⃣ Frontend/views/Signup.html

### Change 1: Add Alert Message HTML
Location: After the title `<span class="login100-form-title ...>`

### Old Code
```html
<span class="login100-form-title p-b-34 p-t-27">
    Sign UP
</span>
```

### New Code
```html
<span class="login100-form-title p-b-34 p-t-27">
    Sign UP
</span>

<div id="failedLoginAlert" style="display:none; margin-bottom: 20px;">
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Login Failed!</strong> We couldn't find your account. Please sign up with this email to verify your identity and proceed.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
</div>
```

---

### Change 2: Update JavaScript
Location: In the `<script>` tag at the bottom

### Old Code
```javascript
<script>
    document.getElementById('signupForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/signup/Account/Signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Registration successful! Please check your email for verification.');
                // Redirect to login page
                window.location.href = '/other/login/index.html';
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Registration failed. Please try again.');
        }
    });
</script>
```

### New Code
```javascript
<script>
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    const failedLogin = urlParams.get('failedLogin');

    // If coming from failed login, pre-fill email and show alert
    if (emailParam) {
        document.getElementById('email').value = decodeURIComponent(emailParam);
    }

    if (failedLogin === 'true') {
        document.getElementById('failedLoginAlert').style.display = 'block';
        // Optionally auto-focus on username field
        document.getElementById('username').focus();
    }

    document.getElementById('signupForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/Account/Signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Registration successful! Please check your email for OTP verification.');
                // Redirect to OTP page
                console.log('Redirecting to OTP page:', data.redirectUrl);
                window.location.href = data.redirectUrl || '/Account/sendOTP';
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Registration failed. Please try again.');
        }
    });
</script>
```

### Key Changes
- ✅ Added URL parameter extraction at top
- ✅ Pre-fill email from query parameter
- ✅ Show alert if `failedLogin === 'true'`
- ✅ Auto-focus username field
- ✅ Changed fetch URL from `/api/signup/Account/Signup` to `/Account/Signup`
- ✅ Changed redirect URL to use `data.redirectUrl`
- ✅ Updated alert message to mention OTP

---

## 🔄 Flow Summary

```
1. User enters login credentials
   ↓
2. Click "Login" button
   ↓
3. Frontend sends POST to /Account/login
   ↓
4. Backend validates credentials
   ↓
5A. ✅ Valid → Return success + token + user data
    → Frontend stores in localStorage
    → Redirects to home page /
   
5B. ❌ Invalid → Return error message
    → Frontend extracts username/email
    → Builds URL: /Account/Signup?email=X&failedLogin=true
    → Redirects to signup page
    ↓
6. Signup page loads
   ↓
7. JavaScript extracts query parameters
   ↓
8. Pre-fill email field with query parameter
   ↓
9. Show warning alert
   ↓
10. User fills username, password, confirm password
    ↓
11. Click "Sign Up"
    ↓
12. Frontend sends POST to /Account/Signup
    ↓
13. Backend creates user account
    ↓
14. OTP email is sent
    ↓
15. Redirect to OTP verification page
    ↓
16. User enters OTP from email
    ↓
17. OTP verified
    ↓
18. Account fully created
    ↓
19. User logged in
    ↓
20. Redirect to dashboard
```

---

## ✅ Verification Checklist

- [ ] Frontend/Services/login/index.html - Updated to redirect on fail
- [ ] Frontend/controller/signup.controller.js - Added query param handling
- [ ] Frontend/views/Signup.html - Added alert and auto-fill
- [ ] Both servers restarted
- [ ] Test login with non-existent user
- [ ] Verify email pre-filled on signup
- [ ] Verify alert message shown
- [ ] Complete signup to OTP verification
- [ ] Check console logs for debugging info
