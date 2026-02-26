# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DecoyVerse is a cybersecurity deception platform (decoys, honeytokens, threat visualization) with a monorepo structure:
- `/` — Frontend: React 19 + TypeScript + Vite + Tailwind CSS v4
- `/server` — Backend: Express + MongoDB + TypeScript

Reference documents:
- [ARCHITECTURE.md](ARCHITECTURE.md) — full system design, all API endpoints, MongoDB schema
- [TESTING.md](TESTING.md) — attack simulation scenarios, test commands, troubleshooting

## Commands

### Frontend (root)
```bash
npm run dev       # Dev server on http://localhost:5173
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Backend (`/server`)
```bash
cd server
npm run dev       # ts-node-dev with hot reload on :5000
npm run build     # Compile TypeScript to dist/
npm start         # Run production (dist/index.js)
```

### Full-stack local development
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2 (project root)
npm run dev
```

## Environment Setup

**Frontend** (`.env` at root):
```
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`server/.env`):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/decay
JWT_SECRET=your_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173

# Email — SendGrid API (free tier: 100/day, no domain needed)
# Verify a single sender at sendgrid.com → Settings → Sender Authentication
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM=DecoyVerse Security <your-verified@gmail.com>

# Internal service-to-service secret (Python FastAPI → Express email relay)
# Must match INTERNAL_SECRET in the ML-modle v0 backend .env
INTERNAL_SECRET=change_this_to_a_random_string
```

## Architecture

### Dual-Backend Design
The frontend uses **two separate API clients** in [src/api/client.ts](src/api/client.ts):
- `authClient` → Express backend (`:5000`) — authentication + email
- `apiClient` → FastAPI backend (`:8000`) — all data operations (nodes, decoys, alerts, logs)

Both auto-inject `Authorization: Bearer <token>` from `localStorage`. 401 responses globally clear storage and redirect to `/auth/login`.

### Authentication
- JWT stored in `localStorage` as `token`; user object stored as `user` (JSON)
- `AuthContext` ([src/context/AuthContext.tsx](src/context/AuthContext.tsx)) validates token on mount via `GET /api/auth/me`
- **Demo mode**: `admin@gmail.com` bypasses the real backend with hardcoded credentials and mock data intercepts

### Route Protection
Routes are defined in [src/App.tsx](src/App.tsx):
- `<PublicRoute>` — redirects to `/dashboard` if already authenticated
- `<ProtectedRoute>` + `<DashboardLayout>` — all dashboard pages
- Onboarding flow: `/onboarding`, `/onboarding/subscription`, `/onboarding/agent`

### State Management
- **Global auth state**: `AuthContext` only — no Redux/Zustand
- **Local UI state**: `useState` for forms, modals, loading
- **Theme**: `ThemeContext` ([src/context/ThemeContext.tsx](src/context/ThemeContext.tsx)) — modes: `gold`, `orange`, `light`, persisted in `localStorage` as `decoyverse-theme`, applied as CSS class on `document.documentElement`

### Email System
All email goes through **[server/src/utils/mailer.ts](server/src/utils/mailer.ts)** using the **SendGrid API** (HTTPS, not SMTP — cloud providers block outbound SMTP ports).

**Why not SMTP/nodemailer:** Render blocks outbound TCP ports 25/465/587. Any direct SMTP attempt results in `ENETUNREACH` (IPv6) or `Connection timeout` (IPv4). SendGrid uses HTTPS (port 443), which always works.

**Exported functions:**
- `sendEmail(to, subject, html, replyTo?)` — core sender, silently skips if `SENDGRID_API_KEY` not set
- `alertEmailHtml(data)` — full dark-theme alert email matching ThreatModal design
- `testAlertEmailHtml(recipientEmail)` — dummy alert with realistic test data
- `welcomeEmailHtml(name, email)` — branded welcome email sent on signup

**Email endpoints in [server/src/routes/auth.ts](server/src/routes/auth.ts):**
- `POST /api/auth/test-alert-email` — JWT-protected, reads `user.notifications.emailAlertTo`, sends test alert
- `POST /api/auth/internal/send-alert-email` — **no JWT**, validated by `x-internal-secret` header; called by Python FastAPI to relay real alert emails through Express/SendGrid

**Frontend trigger:** Settings → Alert Channels → "Send Test Alert" button ([src/pages/Settings.tsx](src/pages/Settings.tsx)) → `authApi.sendTestAlertEmail()` ([src/api/endpoints/auth.ts](src/api/endpoints/auth.ts))

### Adding Features
**New protected page:**
1. Create `src/pages/MyPage.tsx` with default export
2. Add route in [src/App.tsx](src/App.tsx) inside `<ProtectedRoute>`
3. Add nav link in [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx)

**New API endpoint (backend):**
1. Create handler in `server/src/routes/`
2. Mount in [server/src/index.ts](server/src/index.ts): `app.use('/api/resource', routes)`
3. Add corresponding method in `src/api/endpoints/` using `apiClient`

## Key Conventions

### Design System
- Use `cn()` from [src/utils/cn.ts](src/utils/cn.ts) for all conditional Tailwind classes
- Primary accent: `gold-400/500/600` — CTAs, active states, highlights
- Card pattern: `bg-gray-800 border-gray-700 rounded-xl`
- Status colors: `status-success`, `status-info`, `status-warning`, `status-danger`
- Headings: `font-heading` (Poppins) + `text-gold-500`
- Email templates mirror the ThreatModal dark theme (`#0f1117` bg, `#ef4444` red, `#f59e0b` gold) — use inline CSS tables for email-client compatibility, no flexbox

### TypeScript
- Use `interface` for object shapes (e.g., `IUser`, `AuthRequest`)
- Backend: extend Express types via `AuthRequest extends Request`
- Avoid `any` — use `unknown` or proper types
- Pages: default exports; components: named exports
- Known exception: `sgMail.send()` options use `as any` cast where `@sendgrid/mail` types are overly strict

### Backend Validation
- Use `express-validator` — always call `validationResult(req)` at route start
- Password field has `select: false` on User model — must use `.select('+password')` explicitly

### Alert Status Values
The `IAlert` type only accepts: `'open' | 'acknowledged' | 'investigating' | 'resolved'`
**Do not use `'new'`** — it is not in the union. Mock data in [src/api/mockData.ts](src/api/mockData.ts) must use `'open'` as the initial status.

## Common Issues
- **CORS errors**: Add origin to `allowedOrigins` in [server/src/index.ts](server/src/index.ts)
- **401 on protected routes**: Check `JWT_SECRET` matches between token generation and verification
- **MongoDB connection fails**: Verify `MONGO_URI` format and Atlas IP whitelist (`0.0.0.0/0` for dev)
- **FastAPI data not loading**: Ensure the FastAPI backend is running on `:8000` separately (not part of this repo)
- **Email not sending**: Check `SENDGRID_API_KEY` is set and the `SENDGRID_FROM` address exactly matches the verified sender in SendGrid dashboard
- **Email going to spam**: Add sender to Gmail contacts or create a Gmail filter (From: your-verified-email → Never send to spam). For production, verify a custom domain in SendGrid.
- **Internal email endpoint 401**: `INTERNAL_SECRET` env var must match between Express and the Python FastAPI backend

## Deployment
- **Frontend**: Vercel — set `VITE_API_URL` to backend URL; `vercel.json` handles SPA rewrites
- **Backend**: Render — root directory `server`, build `npm install && npm run build`, start `npm start`
- **Database**: MongoDB Atlas
- **Required Render env vars**: `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `SENDGRID_API_KEY`, `SENDGRID_FROM`, `INTERNAL_SECRET`
