# API Routes Overview

This document lists the main API routes in the Backend and their purpose. Use the admin debug route `GET /api/debug/routes` to programmatically fetch mounted routes.

## Signup
- POST `/api/signup` — Start signup (creates a temporary Signup entry and sends OTP unless `DISABLE_SIGNUP_OTP=true`).
- POST `/api/signup/otp` — Send OTP to the email in the signup entry.
- POST `/api/signup/verify-otp` — Verify OTP and create a user account.
- POST `/api/signup/admin/force-verify` — (Admin only) Force-create a User from a Signup entry for troubleshooting.

## Auth & Login
- POST `/api/auth/*` — Authentication related endpoints (login/register triggers etc.)
- POST `/api/login` — Raw login handler.

## Membership / Users
- GET `/api/members/me` — Get current user profile (requires auth).
- GET `/api/members` — List users (with filters, pagination).
- POST `/api/members` — Admin: create a new member.
- ... (see server debug route for all mounted member endpoints)

## Compiler
- POST `/api/compiler/compile` — Upload and compile a C/C++ file.
- POST `/api/compiler/compile-content` — Compile & run code content (multi-language), logs activity to user if authenticated.
- POST `/api/compiler/python` — Run Python content.
- POST `/api/compiler/javascript` — Run JavaScript content.
- POST `/api/compiler/java` — Compile & run Java.
- POST `/api/compiler/typescript` — Run/compile TypeScript.
- POST `/api/compiler/go` — Compile & run Go.
- POST `/api/compiler/rust` — Compile & run Rust.
- GET `/api/compiler/languages` — Get supported languages.

## Compiler (Native)
- POST `/api/compiler/compile/native` — Compile and run native C/C++ code using a local native runner (`tools/code_runner`); supported languages: `c`, `cpp`.

## Payments
- POST `/api/payments/create-intent` — Create a Stripe test PaymentIntent (auth required).
- POST `/api/payments/webhook` — Webhook endpoint stub for payment provider events.

## Mode / Electron
- GET `/api/mode` — Get current app mode (web | electron).
- POST `/api/mode/set` — (Auth) Set mode (web or electron).
- POST `/api/mode/launch` — (Auth) Attempt to launch Electron on server host (for local development).

## Debug
- GET `/api/debug/routes` — (Admin only) List all mounted routes and methods.

## HTML legacy renderer & conversion

- Dynamic route: `GET /html/:name` (React route) — renders the exact HTML from `Frontend/views/:name.html` using a dynamic loader (`React-Complier-Frontend/src/pages/HtmlLegacy.jsx`). Use this to preview the original pages exactly.
- Conversion tool: `tools/html_to_react.js` — converts `Frontend/views/*.html` into React components under `React-Complier-Frontend/src/pages/converted/`. Run `cd React-Complier-Frontend && npm run convert:html` to generate components.

Notes:
- Generated components use `dangerouslySetInnerHTML` to preserve exact appearance and require manual migration for inline scripts and interactivity.
- After verification, you can swap routes in the React app to use converted components directly.

---

Notes:
- Many endpoints support optional authentication. When authenticated, compilation activity is recorded in the user's `activityLog` with timestamps.
- For troubleshooting signup issues, the admin-only force-verify endpoint helps create users directly from signup entries.
- All models use `timestamps: true` so createdAt and updatedAt are present on most documents.
