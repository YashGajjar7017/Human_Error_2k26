# TODO: Fix Login POST Error

## Issue
- Frontend login form POSTs to `/api/auth/login` (relative to frontend server on port 3000)
- Backend auth route is on port 8000 at `/api/auth/login`
- No proxy configured in frontend to forward API requests to backend
- Result: "Cannot POST /api/auth/login" error

## Plan
1. **Add proxy middleware to Frontend/index.js** to forward `/api/*` requests to backend server (http://localhost:8000)
2. **Test login functionality** after proxy setup
3. **Verify backend login endpoint** is working correctly

## Files to Edit
- Frontend/index.js: Add proxy middleware for /api/* routes

## Followup Steps
- Start both frontend (port 3000) and backend (port 8000) servers
- Test login form submission
- Check browser network tab for correct API calls
- Verify successful login redirects user appropriately
