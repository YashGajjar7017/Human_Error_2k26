Web Editor (frontend + backend watcher)
=====================================

This README documents the lightweight web-based editor and watcher we added to the project. It complements the existing app and allows you to open a local directory in the browser, edit files and save them back to disk, and continuously sync local changes from your machine into the running server.

Files added
-----------
- `Backend/controller/editor.controller.js` - API to list directories, read files, write files and receive sync updates.
- `Backend/Routes/editor.routes.js` - Routes mounted at `/api/editor`.
- `Frontend/views/editor.html` - Simple VSCode-like web UI (file tree, editor, save, download).
- `tools/sync-watcher.js` - Node watcher script that watches a local directory and POSTs changes to the backend (`/api/editor/sync`).
- `tools/start-watcher.bat` - Convenience batch to run the watcher on Windows.
- `Backend/Routes/publicUpload.routes.js` - Public upload route at `POST /upload/public`.

Server changes
--------------
- `Backend/server.js` now mounts `/api/editor` and serves the `uploads/` directory at `/uploads` so previews can work.

Quick usage
-----------
1) Start backend server (from repo root):

```powershell
# from repo root (Windows cmd/powershell)
cd "a:\Coding\NodeJS\Node-Complier - 1\Backend"
node server.js
# or if you have npm script
# npm run start
```

2) Open the web editor in your browser:

- Visit: `http://localhost:8000/Frontend/views/editor.html`
- Enter the absolute local directory you want to open (example: `C:\Projects\myrepo`) in the "Base directory" field.
- Click `Open Directory`. Click files to open them, edit and click `Save` to write back to disk.

3) Run the continuous watcher to push local changes to the running server:

```powershell
# Example (Windows)
cd "a:\Coding\NodeJS\Node-Complier - 1\tools"
start-watcher.bat "C:\path\to\your\dir" http://localhost:8000
```

The watcher performs an initial sync of all files under `<baseDir>` and then POSTs subsequent changes to `POST /api/editor/sync` so the backend writes updates into its copy of the files.

Security notes
--------------
- The editor API currently accepts a `base` parameter which determines the root directory to operate on. The controller includes a path-sanitization helper to avoid path traversal, but you should still only use trusted directories.
- The endpoints are not protected by authentication by default (to keep the demo lightweight). Add the existing auth middleware (see `Backend/middleware/auth.middleware.js`) to the editor routes to require login before read/write.

Possible next steps (recommended)
---------------------------------
- Add authentication middleware to `/api/editor` so only authenticated users can read/write.
- Replace the textarea editor with Monaco Editor (CDN) for full VSCode-like experience (syntax, intellisense, themes).
- Add server-side notifications (WebSocket) so a browser-based editor updates when the watcher pushes changes.
- Add per-user isolation or project config for multi-user environments.

Troubleshooting
---------------
- If `editor.html` cannot list a directory, make sure the backend server is reachable and the `base` path is absolute and accessible by the user running the watcher/server.
- If file preview does not show, check the server console for sync/write errors and make sure `/uploads` is being served (server.js adds that).

Contact
-------
If you want, I can add authentication and integrate Monaco next. Tell me which feature you prefer first and I will implement it.
