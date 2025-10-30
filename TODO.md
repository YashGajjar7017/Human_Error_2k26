# TODO: Change Login to Popup

## Backend Changes
- [x] Create popup HTML template in auth.controller.js
- [x] Add GET /api/auth/popup route to serve popup HTML
- [x] Add POST /api/auth/popup-login route that handles login and renders success HTML with postMessage
- [x] Ensure CORS allows postMessage (already set to "*")

## Frontend Changes
- [x] Modify login trigger to open popup instead of navigating to /login
- [x] Add message listener for postMessage from popup
- [x] On receiving message, store token/user and close popup

## Testing
- [x] Test popup opens correctly
- [x] Test login in popup
- [x] Test postMessage sends data to parent
- [x] Test popup closes after success
- [x] Test error handling in popup
