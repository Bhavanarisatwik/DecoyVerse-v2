# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DecoyVerse is a cybersecurity deception platform (decoys, honeytokens, threat visualization) with a monorepo structure:
- `/` — Frontend: React 19 + TypeScript + Vite + Tailwind CSS v4
- `/server` — Backend: Express + MongoDB + TypeScript

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
```

## Architecture

### Dual-Backend Design
The frontend uses **two separate API clients** in [src/api/client.ts](src/api/client.ts):
- `authClient` → Express backend (`:5000`) — authentication only
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

### TypeScript
- Use `interface` for object shapes (e.g., `IUser`, `AuthRequest`)
- Backend: extend Express types via `AuthRequest extends Request`
- Avoid `any` — use `unknown` or proper types
- Pages: default exports; components: named exports

### Backend Validation
- Use `express-validator` — always call `validationResult(req)` at route start
- Password field has `select: false` on User model — must use `.select('+password')` explicitly

## Common Issues
- **CORS errors**: Add origin to `allowedOrigins` in [server/src/index.ts](server/src/index.ts)
- **401 on protected routes**: Check `JWT_SECRET` matches between token generation and verification
- **MongoDB connection fails**: Verify `MONGO_URI` format and Atlas IP whitelist (`0.0.0.0/0` for dev)
- **FastAPI data not loading**: Ensure the FastAPI backend is running on `:8000` separately (not part of this repo)

## Deployment
- **Frontend**: Vercel — set `VITE_API_URL` to backend URL; `vercel.json` handles SPA rewrites
- **Backend**: Railway or Render — root directory `server`, build `npm install && npm run build`, start `npm start`
- **Database**: MongoDB Atlas
