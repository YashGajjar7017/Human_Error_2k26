# Login Debugging Guide

## What Was Changed

1. **Frontend (`Frontend/views/login.html`)**
   - Added comprehensive console.log statements at every step of the form submission
   - Added an early capture-phase listener to catch ANY submit events
   - Frontend now logs `[LoginForm] ...` messages to browser console

2. **Backend (`Backend/server.js`)**
   - Enhanced API request logging with detailed headers, path, IP, content-type
   - Added aggressive logging in the `/api/login` raw-body handler
   - Shows exactly when the request arrives, raw body content, parsing results
   - Backend now logs with `[API REQUEST]`, `[RAW-LOGIN HANDLER]`, `✅`, `❌` markers

3. **Test Page (`Frontend/views/login_test.html`)**
   - Created a standalone debug page with built-in logging
   - Includes timestamp, status messages, and visual feedback
   - Can be accessed at `http://localhost:3000/login_test.html`

## How to Test

### Step 1: Start Both Servers

**Terminal 1 - Backend Server:**
```cmd
cd "a:\Coding\NodeJS\Node-Complier - 1\Backend"
node server.js
```

**Terminal 2 - Frontend Server:**
```cmd
cd "a:\Coding\NodeJS\Node-Complier - 1\Frontend"
node index.js
```

**Expected output:**
- Backend: `🚀 Server is running on port 8000`
- Frontend: `Frontend server running on port 3000`

### Step 2: Open the Test Page

**Method A: Use the Debug Test Page (Recommended)**
1. Open browser: `http://localhost:3000/login_test.html`
2. Pre-filled with username: `testuser`, password: `testpass123`
3. Click "Test Login"
4. Watch the log box fill with real-time messages showing:
   - Form submission triggered
   - Payload being sent
   - Server response received
   - Cookies set or error message

**Method B: Use the Actual Login Page**
1. Open browser: `http://localhost:3000/Account/login`
2. Open browser Developer Tools: `F12`
3. Go to Console tab
4. Enter username and password
5. Click Login
6. Watch console for messages starting with `[LoginForm]`

### Step 3: Check Server Logs

**In Backend Terminal:**
Look for messages like:
```
╔════════════════════════════════════════════════════════════╗
║  [RAW-LOGIN HANDLER] /api/login POST received             ║
╚════════════════════════════════════════════════════════════╝
Timestamp: ...
Method: POST
Path: /api/login
Raw buffer length: 45
Final parsed body: { username: 'testuser', password: 'testpass123' }
Calling loginController.login...
```

**In Frontend Terminal:**
Look for messages like:
```
[API REQUEST] POST /api/login
[API] Headers: { 'content-type': 'application/json', ... }
[API] Body: { username: 'testuser', password: 'testpass123' }
```

### Step 4: Interpret Results

**SUCCESS Scenario:**
- ✅ Form console logs show `[LoginForm] Form submit event triggered`
- ✅ Form logs show `[LoginForm] Sending fetch to /api/login`
- ✅ Backend logs show `[RAW-LOGIN HANDLER] /api/login POST received`
- ✅ Backend logs show `Final parsed body: { username: ..., password: ... }`
- ✅ Browser shows login response or error (but request DID reach server)

**FAILURE - Request Never Sent:**
- ❌ No `[LoginForm] Form submit event triggered` in browser console
- ❌ No messages in Frontend terminal
- **Likely cause:** Form submission is being blocked/prevented by jQuery validation or JavaScript error

**FAILURE - Request Sent But Backend Never Receives:**
- ✅ Browser console shows `[LoginForm] Sending fetch to /api/login`
- ❌ Backend logs show NO `[RAW-LOGIN HANDLER]` message
- ❌ Frontend terminal shows NO `[API REQUEST]` message
- **Likely cause:** Proxy misconfiguration or backend unreachable

**FAILURE - Backend Receives But Parser Fails:**
- ✅ Backend logs show `[RAW-LOGIN HANDLER] /api/login POST received`
- ❌ Backend logs show `Raw buffer length: 0` or `⚠️ Raw body is empty`
- ❌ Backend logs show `⚠️ JSON parse failed` (and URL-encoded also failed)
- **Likely cause:** Body not being read correctly by raw-body middleware

## Quick Test with curl (Advanced)

If you want to test directly without the browser:

```cmd
curl -X POST http://localhost:8000/api/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"testpass123\"}"
```

Expected response:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

(Message depends on whether that user exists in DB, but the important part is that you get a response at all)

## Common Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| Backend port 8000 in use | Backend won't start | Kill process on port 8000 or change `PORT=8001` in .env |
| Frontend port 3000 in use | Frontend won't start | Kill process on port 3000 or change port in `Frontend/index.js` |
| Proxy not working | Request sent but backend doesn't receive | Check `Frontend/index.js` line ~57 for proxy config, ensure backend is running |
| MongoDB offline | Backend logs "DB connection failed" | Start MongoDB or check connection string in `.env` |
| Form never submits | No console logs at all | Check for JavaScript errors in Console tab, might be jQuery validation blocking |

## Next Steps

After running the test:
1. **Paste the full output from BOTH terminals** when you run the test
2. **Paste the browser console output** (F12 → Console tab)
3. Tell me which scenario matches your result (SUCCESS/FAILURE-Request-Never-Sent/etc.)
4. I'll provide the specific fix based on the logs

---

Created: 2025-11-14
Purpose: Diagnose why login data isn't reaching servers
