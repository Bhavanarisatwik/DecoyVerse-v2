# CLAUDE.md

**Recommendations:** See `../docs/recommendation.md` (from this sub-project) or `docs/recommendation.md` (from repo root) for known issues and improvement areas (security, reliability, code quality, testing, DX).

**Working directory note:** The root may shift between `Major-project/` and this sub-project directory during a session. Always maintain full context of all system components (React frontend, Express backend, FastAPI backend, ML service, endpoint agent). See `Major-project/CLAUDE.md` for the monorepo overview.

DecoyVerse: cybersecurity deception platform (honeytokens, threat visualization). Monorepo:
- `/` — Frontend: React 19 + TypeScript + Vite + Tailwind CSS v4
- `/server` — Backend: Express + MongoDB + TypeScript

## Commands

**Frontend:** `npm run dev` (:5173) | `npm run build` | `npm run lint`
**Backend (`/server`):** `npm run dev` (:5000) | `npm run build` | `npm start`

## Environment

**`.env` (root):** `VITE_API_URL=http://localhost:5000/api`

**`server/.env`:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/decay
JWT_SECRET=your_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
SENDGRID_API_KEY=SG.xxxx
SENDGRID_FROM=DecoyVerse Security <your-verified@gmail.com>
INTERNAL_SECRET=change_this
```

## Architecture

**Two API clients** in [src/api/client.ts](src/api/client.ts):
- `authClient` → Express (`:5000`) — auth + email
- `apiClient` → FastAPI (`:8001`) — all data (nodes, decoys, alerts, logs)

Both auto-inject `Authorization: Bearer <token>`. 401 → clear storage + redirect `/auth/login`.

**Auth:** JWT in `localStorage` as `token`. [AuthContext](src/context/AuthContext.tsx) validates on mount via `GET /api/auth/me`. Demo mode: `admin@gmail.com` bypasses backend with mock data.

**Routes** ([src/App.tsx](src/App.tsx)): `<PublicRoute>` (→ `/dashboard` if authed), `<ProtectedRoute>` + `<DashboardLayout>`. Onboarding: `/onboarding`, `/onboarding/subscription`, `/onboarding/agent`.

**Theme:** [ThemeContext](src/context/ThemeContext.tsx) — `gold`/`orange`/`light`, stored as `decoyverse-theme` in localStorage, applied as CSS class on `document.documentElement`.

**Email:** [server/src/utils/mailer.ts](server/src/utils/mailer.ts) via SendGrid HTTPS (not SMTP — Render blocks ports 25/465/587).
- `sendEmail(to, subject, html, replyTo?)` | `alertEmailHtml(data)` | `testAlertEmailHtml(email)` | `welcomeEmailHtml(name, email)`
- `POST /api/auth/test-alert-email` — JWT, sends to `user.notifications.emailAlertTo`
- `POST /api/auth/internal/send-alert-email` — `x-internal-secret` only, Python→Express relay

**New page:** `src/pages/MyPage.tsx` → route in [App.tsx](src/App.tsx) → nav in [Sidebar.tsx](src/components/layout/Sidebar.tsx)

## Efficient Editing

**New page:** `src/pages/X.tsx` → route in `App.tsx` → nav entry in `src/components/layout/Sidebar.tsx`

**New Express endpoint:** `server/src/routes/x.ts` → mount in `server/src/index.ts` → `src/api/endpoints/x.ts` → re-export from `src/api/index.ts`

**New FastAPI endpoint:** add in `ML-modle v0/backend/routes/` → register in `ML-modle v0/backend/main.py` → `src/api/endpoints/x.ts` → re-export from `src/api/index.ts`

**When changing API response shape:** update `src/api/types.ts` AND `src/api/mockData.ts` together — demo mode breaks silently if mockData is out of sync.

**Styling:** always use `cn()` from `src/utils/cn.ts`. Never string-concatenate classNames.

## Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| `new-page` | `/new-page` | Scaffold a new page (component + route + sidebar nav) |
| `ui-audit` | `/ui-audit [path]` or "audit UI consistency" | Scan for font/color/inline-style violations across React, Angular, Vue files. Config: `.claude/skills/ui-audit/ui-conventions.md` |
**New endpoint:** `server/src/routes/` → mount in [server/src/index.ts](server/src/index.ts) → add to `src/api/endpoints/`

## Conventions

**Design:** `cn()` from [src/utils/cn.ts](src/utils/cn.ts). Accent: `gold-400/500/600`. Cards: `bg-gray-800 border-gray-700 rounded-xl`. Status: `status-success/info/warning/danger`. Headings: `font-heading text-gold-500`. Email: inline CSS tables, no flexbox.

**TypeScript:** `interface` for shapes. `AuthRequest extends Request`. Avoid `any`. Pages: default exports; components: named exports.

**Backend:** `express-validator` + `validationResult(req)`. Password field: `select: false` → use `.select('+password')`.

**Alert status:** `'open' | 'acknowledged' | 'investigating' | 'resolved'` — never `'new'`. Mock data in [src/api/mockData.ts](src/api/mockData.ts): use `'open'`.

## Common Issues
- **CORS:** Add to `allowedOrigins` in [server/src/index.ts](server/src/index.ts)
- **401:** Check `JWT_SECRET` matches between Express and FastAPI
- **MongoDB:** Verify `MONGO_URI` + Atlas IP whitelist (`0.0.0.0/0`)
- **FastAPI not loading:** Backend API runs on `:8001`; ML API on `:8000` (internal only)
- **`/api/honeytokels` typo:** Production endpoint is misspelled ("honeytokels" not "honeytokens") — do not rename it in code, just be aware when referencing it
- **Email not sending:** `SENDGRID_API_KEY` set + `SENDGRID_FROM` exactly matches verified sender
- **Internal 401:** `INTERNAL_SECRET` must match between Express and FastAPI

## Deployment
- **Frontend:** Vercel — set `VITE_API_URL`; `vercel.json` handles SPA rewrites
- **Backend:** Render — root: `server`, build: `npm install && npm run build`, start: `npm start`
- **DB:** MongoDB Atlas
- **Render env vars:** `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `SENDGRID_API_KEY`, `SENDGRID_FROM`, `INTERNAL_SECRET`

---

## API Reference

Auth: `Authorization: Bearer <JWT>` (same secret on both backends). Agent: `X-Node-Id` + `X-Node-Key` (bcrypt-validated). Internal relay: `x-internal-secret`.

### Express — `https://decoyverse-v2.onrender.com`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | Public | Register. `{name,email,password}` → `{user,token}`. Sends welcome email. |
| POST | `/api/auth/login` | Public | Login → `{user,token}`. |
| GET | `/api/auth/me` | JWT | Current user incl. notifications, aiSettings, vaultVerifier. |
| POST | `/api/auth/logout` | JWT | Stateless (client clears token). |
| PUT | `/api/auth/update-password` | JWT | `{currentPassword,newPassword}` → new token. |
| PUT | `/api/auth/complete-onboarding` | JWT | Sets `isOnboarded: true`. |
| PUT | `/api/auth/profile` | JWT | Update `{name,email,avatar,notifications,aiSettings,vaultVerifier}`. Merges nested. |
| POST | `/api/auth/test-alert-email` | JWT | Test alert email to `notifications.emailAlertTo`. |
| POST | `/api/auth/internal/send-alert-email` | `x-internal-secret` | Python→Express relay. `{to,alertData}`. |
| GET | `/api/vault` | JWT | List vault items (user-scoped, sorted desc). |
| POST | `/api/vault` | JWT | Create. `{title,encryptedPassword,username?,url?,notes?}`. |
| PUT | `/api/vault/:id` | JWT | Update any fields. Ownership checked. |
| DELETE | `/api/vault/:id` | JWT | Delete. Ownership checked. |

### FastAPI — `https://ml-modle-v0-1.onrender.com`

**Nodes**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/nodes` | JWT | Create node → `{node_id, node_api_key}` (key shown once). |
| GET | `/api/nodes` | JWT | List user's nodes. |
| PATCH | `/api/nodes/:node_id` | JWT | Update status. |
| DELETE | `/api/nodes/:node_id` | JWT | Request uninstall. `?force=true` = immediate cascade delete. |
| GET | `/api/nodes/:node_id/decoys` | JWT | Decoys for node. |
| GET | `/api/nodes/:node_id/agent-download` | JWT | Installer ZIP (`agent.py`, `config.json`, `setup.sh`). |
| GET | `/api/nodes/stats` | JWT | `{total, online, offline}`. |

**Alerts & Stats**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats` | JWT | Dashboard counts (nodes, decoys, alerts). |
| GET | `/api/recent-attacks` | JWT | Recent alerts. `?limit=10`. |
| GET | `/api/alerts` | JWT | All alerts. `?limit&severity&status`. |
| PATCH | `/api/alerts/:alert_id` | JWT | Status: `open\|acknowledged\|investigating\|resolved`. |
| GET | `/api/attacker-profile/:ip` | JWT | Compiled threat intel for IP. |
| POST | `/api/block-ip` | JWT | Queue block. `{ip_address,node_id,alert_id?}`. Status: `pending`. |
| GET | `/api/blocked-ips` | JWT | All blocked IPs (pending/active/failed). |
| GET | `/api/health` | Public | DB status + version. |

**Decoys**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/decoys` | JWT | All decoys (all nodes). |
| GET | `/api/decoys/node/:node_id` | JWT | Decoys for one node. |
| PATCH | `/api/decoys/:decoy_id` | JWT | `?status=active\|inactive`. |
| DELETE | `/api/decoys/:decoy_id` | JWT | Remove DB record (not the actual file). |
| POST | `/api/decoys/deploy` | JWT | `{node_id,count}` → increments `deployment_config.initial_honeytokens`. |

**Honeytokens** (`/api/honeytokels` — filtered decoys where `type=honeytoken`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/honeytokels` | JWT | All honeytokens (all nodes). |
| GET | `/api/honeytokels/node/:node_id` | JWT | Honeytokens for one node. |
| PATCH | `/api/honeytokels/:id` | JWT | Toggle active/inactive. |
| DELETE | `/api/honeytokels/:id` | JWT | Delete record. |

**Agent Inbound** (`X-Node-Id` + `X-Node-Key`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/honeypot-log` | Service honeypot event. ML scores → alert if ≥7, notifies. |
| POST | `/api/agent-alert` | Honeytoken file access. Enriches IP, ML scores, Slack/email/WhatsApp. |
| POST | `/api/agent/register` | First startup. Params: `node_id,hostname,os`. Sets `online`. |
| POST | `/api/agent/heartbeat` | 30s keepalive. Returns `{uninstall,pending_blocks,deployment_config}`. |
| POST | `/api/agent/uninstall-complete` | Deletes node + decoys from DB. |
| GET | `/api/agent/download/:node_id` | Agent ZIP (JWT). |
| POST | `/api/agent/register-decoys` | Register deployed files: `[{file_name,file_path,type}]`. |
| POST | `/api/network-event` | Suspicious outbound connection from psutil. |
| POST | `/api/agent/block-confirmed` | Firewall rule confirmed → `blocked_ips` status: `active`. |

**AI & Reports**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/ai/insights` | JWT | Attacker profiles, scanner bots, MITRE tags. |
| GET | `/api/ai/attacker-profile/:ip` | JWT | MITRE-tagged profile for one IP. |
| POST | `/api/ai/report` | JWT | Generate health report (score 0–10, recommendations). Upserts per user. |
| GET | `/api/ai/report` | JWT | Last saved report. `{exists:false}` if none. |

**Logs**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/logs` | JWT | Combined `honeypot_logs`+`agent_events`. `?limit&node_id&severity&search`. |
| GET | `/api/logs/node/:node_id` | JWT | Logs for one node. |

**Install Scripts**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/install/windows` | Public | Windows PowerShell install script. |
| GET | `/api/install/linux` | Public | Linux bash install script. |
| GET | `/api/install/macos` | Public | macOS bash install script. |
| POST | `/api/install/generate-installer/:node_id` | JWT | Node-specific installer ZIP. |

### ML Service — `https://ml-modle-v0-2.onrender.com` (internal only, no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | `{status,model_loaded,version}`. |
| POST | `/predict` | `{failed_logins,request_rate,commands_count,sql_payload,honeytoken_access,session_time}` → `{attack_type,risk_score,confidence,anomaly_score,is_anomaly}`. |
| POST | `/predict-batch` | Batch version of `/predict`. |
| POST | `/predict/network` | CIC-IDS network flow features → same response. |
| GET | `/features` | Feature names + expected ranges. |
