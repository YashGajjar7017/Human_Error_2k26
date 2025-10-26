# TODO: Restrict Login to Specific URL

## Information Gathered
- Frontend login page located at `Frontend/other/login/index.html`, served at `http://localhost:3000/login/index.html`.
- Login API endpoint: POST `/api/auth/login`, handled by `exports.login` in `Backend/controller/auth.controller.js`.
- Frontend proxies API requests to backend via `http://localhost:8000`.
- Multiple login functions exist in `auth.controller.js` (e.g., `login`, `usrLogin`), but the frontend uses `/api/auth/login`.

## Plan
- Modify `exports.login` in `Backend/controller/auth.controller.js` to check the `Referer` header.
- If the `Referer` does not match `http://localhost:3000/login/index.html`, return a 403 Forbidden response.
- Ensure the check is added at the beginning of the function before any authentication logic.

## Dependent Files to Edit
- `Backend/controller/auth.controller.js`: Add referer check in `exports.login`.

## Followup Steps
- Test login functionality by accessing from `http://localhost:3000/login/index.html` (should work).
- Test login from other URLs or direct API calls (should fail with 403).
- Verify no other login endpoints need similar restrictions.
- If needed, apply similar checks to other login functions like `usrLogin`.
