# React-Complier-Frontend (React + Vite)

This folder is the main SPA for the project (Vite + React). It supersedes the legacy `Frontend/views` HTML files which are being progressively migrated and redirected to this SPA.

## Quick start

1. cd into this folder:
   ```bash
   cd React-Complier-Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run dev server (set backend base if running the dev server separately):
   ```bash
   # set backend URL for dev (Windows PowerShell example)
   $env:VITE_API_BASE = "http://localhost:8000"
   npm run dev
   ```
4. Open the app in browser: http://localhost:5173

## Electron (dev)

To run the Electron app using the dev server:

```bash
# Ensure backend is running and set VITE_API_BASE when required
$env:VITE_API_BASE = "http://localhost:8000"
npm run electron:dev
```

This runs the Vite dev server and launches Electron pointed at `http://localhost:5173`.

## Build & production

1. Build the app:
   ```bash
   npm run build
   ```
2. Serve the build locally for testing:
   ```bash
   npm run preview
   ```

**Notes:**
- Use `.env` or system environment to set `VITE_API_BASE` when your backend is on a different port or host (for Electron or cross-origin dev).
- The backend `Backend/server.js` is already configured to serve the React `dist` build when present.

Note: The main backend (`Backend/server.js`) contains logic to serve the build files from `Frontend/react-app/dist` (if present).

## Next migration steps
- Migrate legacy templates into React pages under `src/pages`
- Integrate API calls and auth flows
- Add CI/CD and packaging for web and Electron
