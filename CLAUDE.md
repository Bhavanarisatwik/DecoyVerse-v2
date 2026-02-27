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

---

---

# ═══════════════════════════════════════════════════════════
# DECOYVERSE — COMPLETE PROJECT DOCUMENTATION
# (College review, presentations, and technical reference)
# ═══════════════════════════════════════════════════════════

---

## What Is This Project?

### Problem Statement

Every organisation — a company, a college lab, a small startup, a freelancer — faces a fundamental gap in their security posture. They install antivirus. They set up a firewall. They think they're protected. But both of these tools share the same critical flaw: **they can only catch threats they already know about, or threats trying to enter from outside.**

The moment an attacker gets past the perimeter — through a phishing email, a stolen VPN credential, a compromised contractor laptop, or a disgruntled insider — **antivirus and firewalls become blind.** The attacker is now moving through the network using legitimate tools (Windows PowerShell, standard file browsers, built-in Windows commands). No malware signature to scan. No blocked port to flag.

This is called a **post-breach detection gap**, and it is responsible for the most damaging real-world attacks. The average attacker dwell time inside a network before detection is **197 days** (IBM Cost of a Data Breach Report, 2023). That is 197 days of silent reconnaissance, data exfiltration, and lateral movement — all invisible to antivirus and firewall.

DecoyVerse closes this gap using **deception technology.**

### What is Deception Technology?

Deception technology works on a simple but powerful principle: **plant traps that real users have no reason to touch.** These traps are called honeytokens — fake credential files, fake SSH keys, fake AWS secrets, fake database configs — that look entirely real to an attacker doing reconnaissance.

- A legitimate employee has no reason to open `~/.aws/credentials_old_backup.pem` — that file is not in their workflow
- An attacker doing reconnaissance absolutely will open it — it looks like a real credential file
- The instant they open it: we know. Username. Process name. PID. Command line. Timestamp. IP address.

This produces **zero false positives**. Antivirus flags thousands of events per day, most harmless. A honeytoken alert is definitionally suspicious — there is no legitimate reason for it.

DecoyVerse is an **accessible, full-stack implementation of this concept** targeted at individuals, small businesses, and IT administrators who cannot afford enterprise solutions like Attivo Networks (acquired by SentinelOne for $616 million) or Illusive Networks — but face the same threats.

### What DecoyVerse Does — User Perspective

**For an IT administrator or small business owner:**

1. Sign up and create an account
2. Add machines as "nodes" through a wizard
3. Download a pre-configured Python agent for each machine (one download, already configured for that node)
4. Run the agent — it silently deploys fake credential files in realistic locations (Documents, Desktop, AWS config folder, SSH folder) and begins monitoring
5. From that moment, if anyone — an outsider who breached the perimeter, a malicious contractor, a curious employee, a piece of malware doing reconnaissance — opens any of these fake files, the admin gets:
   - An email alert (rich HTML, mobile-friendly)
   - A Slack notification (if configured)
   - A WhatsApp message (if configured)
   - A live alert on the dashboard with full forensic detail
6. From the dashboard:
   - See the exact process that accessed the file, the username, IP, and geolocation
   - Mark the alert as investigated or resolved
   - Block the attacker's IP with one click (pushed to the machine's firewall within 60 seconds)
   - View an AI-generated security health report
   - Chat with an AI advisor about the specific threats detected in their environment

**Total setup time:** Under 10 minutes per machine.
**Skill required:** No security expertise. If you can run a Python script, you can deploy DecoyVerse.

### Complete Use Cases

**Use Case 1 — The Insider Threat**
A company has 50 employees. No one questions the IT intern browsing files on the file server. He opens `server_backup_passwords.csv` — a file no real employee ever uses, because it's a honeytoken. The platform fires an alert with his username and process in under a second. IT investigates before any real data is touched.

**Use Case 2 — Post-Phishing Breach (Most Common Attack Vector)**
An employee is phished. The attacker gets their credentials and remotely logs in. The firewall allows this (valid credentials). The antivirus sees nothing (no malware, just remote desktop). The attacker does reconnaissance and opens `aws_keys_prod.txt`. DecoyVerse fires a CRITICAL alert. The attacker is caught within seconds of starting reconnaissance — not after 197 days.

**Use Case 3 — Zero-Day Fileless Malware**
A piece of malware exploits a browser vulnerability. It runs entirely in memory (fileless) using PowerShell. No binary dropped — antivirus sees nothing. But the malware does reconnaissance and reads honeytoken files. DecoyVerse catches the malware by its *behaviour*, not its signature.

**Use Case 4 — External Network Scan / Brute Force**
An attacker is port-scanning the network and trying SSH brute force. The network monitor (psutil) detects the unusual pattern — high failed login rate from an external IP on port 22. The ML model scores it as BruteForce with high confidence. An alert fires even before any honeytoken is accessed.

**Use Case 5 — Freelancer / Remote Worker**
A developer works from coffee shops and public networks. They install DecoyVerse on their laptop. If anyone on the network does lateral movement and touches their machine's fake credential files, they know immediately — even on an untrusted network where a firewall provides no protection.

**Use Case 6 — Lab / Academic Environment**
A university computer lab has 50 machines. The lab admin deploys DecoyVerse and immediately knows when any student tries to access `root_credentials.txt` or `exam_answers_backup.txt` — both honeytokens placed in accessible locations.

### How DecoyVerse Differs From Antivirus and Firewalls

| Tool | Guards Against | Blind Spots |
|------|---------------|-------------|
| **Antivirus** | Known malware signatures, some heuristic detection | Zero-days, fileless attacks (PowerShell/WMI), legitimate tools used maliciously, insider threats |
| **Firewall** | Inbound connections from bad IPs/ports | Insiders (already inside), breached VPN users, HTTPS C2 traffic (port 443 — looks normal), lateral movement |
| **DecoyVerse** | Post-breach reconnaissance, insider threats, fileless attackers, zero-days | Cannot prevent the initial breach; network monitor adds a second layer for attackers who skip honeytokens |

**The key insight:** DecoyVerse does not replace antivirus or firewalls. It fills the gap they leave — the post-breach window. Together they form defense-in-depth, which every major security standard (NIST, ISO 27001, MITRE ATT&CK) mandates.

### Academic / Technical Contribution

1. **Deception Technology implementation** — practical application of a concept used only in enterprise tools costing hundreds of thousands of dollars
2. **ML-based threat classification** — Random Forest + Isolation Forest on engineered security features with dual-mode detection
3. **Privilege separation design** — user-level agent and SYSTEM-level firewall task are separate processes, minimising attack surface
4. **Zero-knowledge cryptography** — vault demonstrates PBKDF2 + AES-256-GCM without any server-side knowledge of keys or plaintext
5. **Multi-backend microservices** — deliberate separation of auth (Node.js/Express) and ML/data (Python/FastAPI) services
6. **Heartbeat-based command delivery** — agent receives block commands via existing polling, eliminating inbound firewall port requirements

---

## Elevator Pitch (30 seconds)

> DecoyVerse is a full-stack cybersecurity deception platform that deploys fake credential files, fake SSH keys, and fake configuration files — called *honeytokens* — across monitored machines. The moment an attacker touches any of these traps, the platform instantly detects the access, scores it with an ML model, and fires an alert with the attacker's username, process, IP, and geolocation. Unlike antivirus (which needs to know what malware looks like) or a firewall (which guards the perimeter), DecoyVerse catches threats that are already inside — with zero false positives.

---

## Complete Feature Inventory

| Page | Features |
|------|---------|
| **Dashboard** | Live stats (nodes online, open alerts, total decoys), bar chart of attack types (last 7 days), recent alerts list with severity badges, ThreatModal with full IP enrichment (country, org, AbuseIPDB score), one-click IP block |
| **Nodes** | Create node wizard, download pre-configured agent installer, node status badges (Online/Offline/Uninstalling), cascade delete (removes all alerts+decoys+logs), force delete, Manual Uninstall Guide modal with OS-specific copyable commands |
| **Decoys** | View all deployed deception assets per node, toggle active/inactive, delete, filter by node, copy file path |
| **Honeytokens** | Same as Decoys filtered to credential/secret file type only; per-node view |
| **Alerts** | Full alert list with status workflow (open → acknowledged → investigating → resolved), search/filter, ThreatModal detail view |
| **AI Insights** | Generate security health report (health score 0–10 ring, attack type breakdown, top attacker IPs, recommendations); AI Advisor chatbot (user's own OpenAI/OpenRouter/Gemini key, live security context injected as system prompt) |
| **Vault** | Zero-knowledge AES-256-GCM password manager; master password never leaves browser; zxcvbn strength checker; random password generator; copy with 30s auto-clear clipboard |
| **Settings** | Profile & password update, notification channels (email, Slack, WhatsApp), send test alert, AI provider/model/API key storage, appearance theme (gold/orange/light) |
| **Onboarding** | Multi-step: subscription plan → node creation wizard → agent download with API token |
| **Landing Page** | Product marketing with animated feature showcases, pricing, call to action |

---

## Full Tech Stack

### Frontend
| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React 19 + TypeScript | Component model, strict type safety |
| Build | Vite 5 | Fast HMR, ESM-native bundling |
| Styling | Tailwind CSS v4 | Utility-first, design token system |
| Animations | Framer Motion | Smooth transitions |
| Charts | Recharts | Composable SVG charts |
| Routing | React Router v7 | SPA with protected routes |
| HTTP | Axios (two instances) | Auto token injection, 401 global redirect |
| Toasts | Sonner | Top-right notification system |
| Password scoring | zxcvbn | Offline entropy-based strength estimation |
| Markdown | react-markdown | Renders LLM responses with formatting |
| Crypto | Web Crypto API (built-in browser) | AES-256-GCM vault encryption, PBKDF2 key derivation |

### Auth Backend (Express / Node.js)
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express 4 |
| Auth | JWT HS256 (7-day expiry) + bcrypt (12 rounds) |
| ORM | Mongoose 8 (MongoDB ODM) |
| Validation | express-validator |
| Email | SendGrid HTTP API (HTTPS-based, not SMTP) |
| Deployment | Railway |

### Data + ML Backend (FastAPI / Python)
| Layer | Technology |
|-------|-----------|
| Runtime | Python 3.11 |
| Framework | FastAPI + uvicorn (async ASGI) |
| ML | scikit-learn (Random Forest + Isolation Forest) |
| Feature pipeline | NumPy, pandas, StandardScaler, LabelEncoder |
| File monitoring | watchdog (inotify/FSEvents/ReadDirectoryChanges) |
| Network monitoring | psutil (no admin required) |
| IP enrichment | ip-api.com (geolocation), AbuseIPDB (reputation), rDNS |
| Notifications | Slack webhook, Twilio WhatsApp API, SendGrid relay |
| Deployment | Render |

### Database + Infrastructure
| Layer | Technology |
|-------|-----------|
| Database | MongoDB Atlas (cloud, TLS-encrypted) |
| Collections | 10 (see Database Design section) |
| Drivers | Mongoose (Express), Motor async (FastAPI) |
| Frontend hosting | Vercel (SPA + rewrites) |
| Auth backend | Railway |
| ML backend | Render |

---

## Database Design — All 10 Collections

### `users`
```
_id, name, email, password (bcrypt, select:false), role (user|admin),
isOnboarded, isActive, notifications { slackWebhook, emailAlertTo, whatsappNumber },
aiSettings { provider, model, apiKey }, vaultVerifier, lastLogin, createdAt, updatedAt
```

### `nodes`
One document per monitored machine. Stores agent credentials and deployment config.
```
_id, node_id (uuid4), user_id, name, status (active|inactive|uninstall_requested),
os_type (windows|linux|macos), ip_address, node_api_key (hashed, bcrypt),
last_seen, uninstall_requested, deployment_config { initial_decoys, initial_honeytokens, deploy_path },
created_at
```

### `decoys`
Every deployed deception asset.
```
_id, node_id, user_id, file_name, file_path,
type (file | honeytoken | aws_creds | db_creds | api_key | ssh_key),
status (active | triggered | disabled), triggers_count, last_accessed, created_at
```

### `alerts`
High-risk events after ML scoring. Primary dashboard data source.
```
_id, alert_id, timestamp, source_ip, service, activity, attack_type,
risk_score (1–10), confidence (0–1), payload, node_id, user_id,
status (open | acknowledged | investigating | resolved), notified, notification_status,
extra {
  process_name, pid, cmdline,
  geo { country, city, org, lat, lon },
  hostname, rdns,
  abuseipdb { abuseConfidenceScore, totalReports, countryCode }
}
```

### `agent_events`
Raw honeytoken access logs from the agent (pre-ML-scoring).
```
_id, timestamp, hostname, username, file_accessed, file_path,
action (ACCESSED | MODIFIED), severity (CRITICAL | HIGH | MEDIUM | LOW),
alert_type, process_name, pid, process_user, cmdline, node_id
```

### `honeypot_logs`
Service-level honeypot logs (SSH / FTP / Web fake services).
```
_id, service, source_ip, activity, payload, timestamp, extra, node_id
```

### `network_events`
Suspicious outbound connections caught by psutil network monitor.
```
_id, node_id, user_id, timestamp, source_ip, dest_ip, dest_port, protocol, status,
process_name, rule_score (0–10), rule_triggers [list of strings],
ml_attack_type, ml_risk_score, ml_confidence
```

### `attacker_profiles`
Auto-updated per-IP threat intelligence. One document per source IP.
```
_id, source_ip (unique index), total_attacks, most_common_attack, average_risk_score,
first_seen, last_seen,
attack_types { BruteForce: 3, Injection: 1, ... },
services_targeted { SSH: 2, "File System": 1 }
```

### `blocked_ips`
IP block queue. Agent polls and confirms via heartbeat.
```
_id, node_id, ip_address, requested_at, requested_by_user_id, alert_id,
status (pending | active | failed), confirmed_at
```

### `security_reports`
One health report per user (upserted on each generation).
```
_id, user_id, generated_at, health_score (0–10), total_nodes, online_nodes,
total_alerts, open_alerts, critical_alerts,
top_attack_types [{ type, count }], top_attackers [{ ip, risk_score, attack_count }],
recent_events_count, recommendations [strings]
```

---

## ML Model — Dataset, Training, Features, Scoring

### Dataset Sources
1. **Real MongoDB logs** — exported from live `honeypot_logs` and `agent_events` collections via `ml_service/export_real_logs.py` (actual events captured during testing)
2. **Synthetic data** — 10,000+ rows generated by `dataset_generator.py` with realistic distributions: 60% Normal, 15% BruteForce, 10% DataExfil, 10% Recon, 5% Injection
3. **CIC-IDS network flow data** — industry-standard network intrusion benchmark dataset for the separate network traffic classifier (`backend/train_network_model.py`)

### Feature Engineering (6 features)
| Feature | Type | What it measures |
|---------|------|-----------------|
| `failed_logins` | int 0–150 | Count of failed authentication attempts |
| `request_rate` | int 1–1200 | HTTP/network requests per minute |
| `commands_count` | int 0–35 | Shell commands executed in session |
| `sql_payload` | 0 or 1 | Binary: SQL injection pattern detected (SELECT/UNION/DROP/1=1/--) |
| `honeytoken_access` | 0 or 1 | Binary: a honeytoken file was opened |
| `session_time` | int 10–600 | Duration of activity in seconds |

File events from the agent (no network features) are mapped to this feature space via fixed heuristics in `alert_to_log_format()`.

### Models
| Model | Algorithm | Purpose |
|-------|-----------|---------|
| Primary classifier | Random Forest (100 trees, max_depth=10, 80/20 stratified split) | Predict attack type (5 classes) |
| Anomaly detector | Isolation Forest (contamination=0.1) | Binary: is this event anomalous? |
| Preprocessing | StandardScaler | Normalise features for Isolation Forest |

Attack type classes: `Normal`, `BruteForce`, `Injection`, `DataExfil`, `Recon`

Saved models: `classifier.pkl`, `anomaly_model.pkl`, `scaler.pkl`, `label_encoder.pkl`

### Risk Score Formula (0–10)
```
base     = (RF confidence × 6) + (|isolation_forest_score| × 4)
bonuses  = +2 if honeytoken_access == 1
           +1 if failed_logins > 50
raw      = (base + bonuses) × type_multiplier
final    = clamp(raw, 0, 10)

Attack type multipliers:
  DataExfil  → ×2.0   (highest — credential theft)
  Injection  → ×1.5
  BruteForce → ×1.2
  Recon      → ×0.8
  Normal     → ×0.3
```

Alerts are created only when `risk_score ≥ 7` (configurable via `ALERT_RISK_THRESHOLD`).
If ML service is unreachable: honeytoken access auto-scores at 9; others score at 0.

### Why Random Forest?
- **Interpretable**: feature importance extraction shows which features discriminate attacks
- **Handles small datasets**: ensemble averaging prevents overfitting on limited real-world data
- **Fast inference**: no GPU needed, sub-millisecond prediction — critical for real-time alert scoring
- **Tabular data strength**: structured 6-feature input is ideal for tree-based models; neural networks need far more data

---

## End-to-End Flow (Complete Scenario)

```
1. User creates a node in the dashboard
   → FastAPI: POST /api/nodes → node_id (uuid4) + node_api_key generated, stored hashed

2. User downloads the agent installer (Python script + pre-filled config)
   → Config: { node_id, node_api_key, backend_url, deploy_paths }

3. Agent runs on the target machine
   → agent_setup.py deploys honeytokens:
       ~/.aws/credentials (fake AWS keys)
       ~/Documents/passwords_backup.txt
       ~/Desktop/ssh_private_key.pem   (N files from deployment_config)
   → Writes ~/.cache/.honeytoken_manifest.json (all deployed paths)
   → Registers decoys with FastAPI (POST /api/agent/register-decoys)
   → Starts FileMonitor (watchdog) + NetworkMonitor (psutil background thread)
   → Heartbeat every 30s (GET /api/agent/heartbeat)

4. Attacker opens ~/Documents/passwords_backup.txt
   → watchdog fires on_any_event()
   → FileMonitor records: process_name=explorer.exe, pid=4521, username=jsmith
   → Maps to ML features: { failed_logins:85, request_rate:300, commands_count:5,
                             sql_payload:0, honeytoken_access:1, session_time:300 }
   → POST /api/agent-alert (X-Node-Id + X-Node-Key headers)

5. FastAPI processes the alert
   → Validates node credentials
   → ML predict → { attack_type:"DataExfil", confidence:0.93, risk_score:10 }
   → IP enrichment: country, city, org (ip-api.com) + AbuseIPDB reputation
   → Saves to MongoDB alerts (status: "open")
   → Updates decoys.triggers_count, upserts attacker_profiles
   → notification_service.broadcast_alert() → Slack + Email + WhatsApp concurrently

6. Dashboard polls GET /api/alerts every 30s
   → Red CRITICAL badge appears, navbar count increments
   → User opens ThreatModal: IP, country, process_name, risk_score, AbuseIPDB score
   → User clicks "Block IP"
   → FastAPI writes blocked_ips record (status: pending)

7. Next heartbeat delivers pending_blocks to agent
   → Agent writes pending_blocks.json
   → dv_firewall.py (SYSTEM task, runs every 60s) reads file
   → netsh advfirewall firewall add rule name="DecoyVerse_Block_1.2.3.4" action=block
   → Agent confirms: POST /api/agent/block-confirmed
   → blocked_ips status: pending → active
```

---

## Why Not Just Antivirus and a Firewall?

**The short answer:** Antivirus and firewalls are perimeter and signature defenses — they guard the gate and look for known threats. DecoyVerse is a detection layer for threats already inside — it works on zero-days, custom malware, and insider threats that bypass both.

| Defense | What it does | What it misses |
|---------|-------------|----------------|
| **Antivirus** | Scans files for known malware signatures | Zero-day malware, fileless attacks (PowerShell/WMI — no file to scan), attackers using legitimate tools |
| **Firewall** | Blocks known-bad IPs/ports at the perimeter | Threats already inside (VPN breach, phishing, physical access, insider), HTTPS C2 on port 443 |
| **DecoyVerse** | Deploys fake files that real users never touch | Nothing — any access is definitionally suspicious |

**Zero false positives:** A real employee never opens `~/.aws/credentials_backup_OLD.pem`. Only an attacker doing reconnaissance does. Antivirus generates thousands of alerts daily. DecoyVerse alerts are nearly always real.

**Defense-in-depth:** NIST SP 800-53, ISO 27001, and MITRE ATT&CK all mandate multiple layers. Deception is Layer 3:
- Layer 1: Firewall (keep attackers out)
- Layer 2: Antivirus (catch known malware)
- Layer 3: DecoyVerse (catch what slipped through layers 1 and 2)

**Industry precedent:** Attivo Networks (acquired by SentinelOne for $616M), Illusive Networks, CrowdStrike Falcon Identity all use the same deception principle. DecoyVerse is an accessible MVP of the same concept.

---

## Storytelling Use Case: The Rogue Contractor

> A mid-sized software company hires a contractor to help with a 3-month project. He gets a laptop with full antivirus and sits behind the corporate firewall. His access is legitimate — he's supposed to be on the network.
>
> In month two, he decides to look for anything valuable before leaving. He opens File Explorer and browses. He spots `aws_credentials_staging.csv` in Documents. He opens it — takes 2 seconds.
>
> **Antivirus sees:** Nothing. No malware. Just a user opening a CSV.
> **Firewall sees:** Nothing. No inbound threat. Normal internal traffic.
> **DecoyVerse sees:** Alert fires in under a second. Username: `jsmith`. Process: `explorer.exe`. File path. Timestamp. Attack type: DataExfil. Risk score: 10/10. Confidence: 93%.
>
> The IT admin gets an email and Slack message instantly. One click from the dashboard blocks his IP. The block reaches the machine's firewall within 60 seconds.
>
> The file contained fake AWS keys. He got nothing real. The company has a complete forensic record.

---

## Security Architecture — All Layers

DecoyVerse applies security at every layer of the stack:

### Layer 1 — Transport Security (HTTPS/TLS everywhere)
- Frontend ↔ Express: HTTPS (Vercel → Railway)
- Frontend ↔ FastAPI: HTTPS (Vercel → Render)
- Agent ↔ FastAPI: HTTPS — `agent_config.json` stores backend URL as `https://`
- MongoDB Atlas: TLS-encrypted connection strings only

### Layer 2 — Authentication & Authorization
| Path | Mechanism | Detail |
|------|-----------|--------|
| User → Express | JWT HS256 | 7-day expiry, signed with `JWT_SECRET`, stored in `localStorage` |
| User → FastAPI | Same JWT | Same `JWT_SECRET` — one secret validates across both backends |
| Agent → FastAPI | `X-Node-Id` + `X-Node-Key` | Per-node key generated on creation, stored **hashed** (bcrypt) in MongoDB |
| FastAPI → Express (email relay) | `x-internal-secret` | Shared secret for the single internal relay endpoint — no JWT needed |

**Authorization scoping:** Every MongoDB query is filtered by `user_id` extracted from the JWT server-side. A valid JWT from user A cannot access user B's nodes, alerts, or vault items.

### Layer 3 — Password Security
- Account passwords: bcrypt, 12 salt rounds (~250ms/hash → brute force infeasible)
- `select: false` on the password field: never returned in any query unless explicitly fetched with `.select('+password')`
- Node API keys: stored hashed (bcrypt), plaintext only in `agent_config.json` on the target machine

### Layer 4 — Vault: Zero-Knowledge Encryption
See "Vault Security Deep-Dive" below.

### Layer 5 — Agent: Persistence and Tamper Resistance
See "Agent Security" below.

### Layer 6 — AI Insights: Key Handling
See "AI Insights & Vault Technology" below.

---

## Vault Security Deep-Dive: Can Someone Hack the Vault?

**Short answer: No — not without the master password. Even if the entire database is stolen, every vault entry is mathematically unreadable.**

### Non-technical explanation
The master password never leaves the device. The browser runs it through a mathematical process (PBKDF2) 100,000 times to produce an encryption key. That key locks every saved password using AES-256-GCM — the same standard used by governments and banks. The server only ever receives the locked box. It never sees the key or the contents.

### Technical walkthrough
```
1. Key derivation (browser only — Web Crypto API):
   key = PBKDF2(password=masterPassword, salt=userId, iterations=100_000, hash=SHA-256)
   → Produces a CryptoKey object marked non-extractable — cannot be read from JS memory

2. Encryption (before saving to server):
   iv = crypto.getRandomValues(96-bit)   ← unique random IV every time → no pattern leakage
   ciphertext = AES-256-GCM.encrypt(plaintext, key, iv)
   stored = JSON.stringify({ iv: base64(iv), ciphertext: base64(ciphertext) })
   POST /api/vault sends only { encryptedPassword: stored } — server never sees plaintext

3. Vault verifier (proving correct password without sending it to the server):
   verifier = AES-256-GCM.encrypt("decoyverse-vault-v1", key)
   → Saved to user profile as vaultVerifier (one-time on vault creation)
   → On every unlock: try to decrypt vaultVerifier with newly derived key
   → Success AND result === "decoyverse-vault-v1" → correct password → unlock
   → Failure (AES-GCM auth tag mismatch) → wrong password → reject

4. Decryption (browser only, after unlock):
   for each item: AES-256-GCM.decrypt(item.encryptedPassword, key)
   → Decrypted passwords live only in React component state (browser memory)
   → Never stored back to server, never written to localStorage
```

### What an attacker gets if the database is stolen
- `{ title, username, encryptedPassword }` records — the `encryptedPassword` is a meaningless base64 blob
- To crack it: brute-force the master password, then compute PBKDF2 × 100,000 per guess
- At 1 billion guesses/second (high-end GPU cluster): a 12-character random password takes longer than the age of the universe to crack

### What the server knows
- That a vault exists and how many items it has
- Item titles (e.g., "GitHub account") — stored plaintext in the current MVP
- Encrypted blobs — useless without the key
- It does NOT know any password, and it cannot decrypt any entry

### Honest MVP limitations
- Item titles are stored in plaintext — a production version would encrypt titles too
- Unlock is 100% client-side: the server never receives the master password or the derived key, so there is no server-side brute-force surface
- If someone has physical access to an unlocked browser session, they can see passwords in React state — same limitation as any browser-based password manager (1Password, Bitwarden web)

---

## Agent Security: Can It Be Stopped or Compromised?

### Can an attacker kill the agent?

**Yes, with admin access — but by the time they find and kill the agent, multiple alerts have already fired.**

**Phase 1 — Before they find the agent:**
The moment the attacker opens any honeytoken file (during reconnaissance, which they always do), an alert fires. This happens before they know the agent exists.

**Phase 2 — While trying to kill the agent:**
The agent runs as a Windows Service managed by NSSM (Non-Sucking Service Manager) with `restart on failure`. Killing the process triggers an automatic restart within seconds. A sudden gap in the 30s heartbeat also appears on the dashboard (`last_seen` field goes stale).

**Phase 3 — To permanently stop the agent:**
Requires admin access (`sc.exe stop DecoyVerseAgent` + `sc.exe delete DecoyVerseAgent`) — if the attacker has admin, you have bigger problems. Finding the agent name also requires prior reconnaissance that would have triggered alerts.

**The point:** The agent is the first detection layer, not the last line of defense. Once an alert is fired and the admin is notified, the deception has already succeeded.

### Can an attacker inject fake alerts?

No. Every agent request is authenticated by `X-Node-Id` + `X-Node-Key` headers. The node API key is stored hashed (bcrypt) in MongoDB — the server never stores the plaintext. An attacker would need the plaintext key from `agent_config.json` on the specific target machine.

### Can someone steal the agent config?

`agent_config.json` contains `node_id`, `node_api_key` (plaintext), and `backend_url`. If stolen:
- An attacker could send fake alerts for that node — affecting only that node's data
- The real agent is still running, creating a visible discrepancy
- Production hardening: rotate API key on detected compromise

### Can someone recognise the honeytokens as fake?

This is a legitimate concern. Honeytoken files use realistic names (`aws_credentials.pem`, `passwords_backup.txt`) but contain fake values. An experienced attacker might notice implausible AWS key formats or identical file names across machines. Production hardening: per-machine randomised names and region-specific plausible-looking values.

### Privilege model (minimal attack surface)

```
agent.py — runs as normal user:
  ├─ File monitoring (watchdog) — no elevation needed
  ├─ Network monitoring (psutil) — no elevation needed
  └─ Writes pending_blocks.json (local IPC file only)

dv_firewall.py — runs as SYSTEM scheduled task:
  ├─ Reads pending_blocks.json every 60s
  ├─ Calls: netsh advfirewall firewall add rule ...
  └─ No network access from this process
```

The SYSTEM process does exactly one thing: apply firewall rules. Even if someone exploits a bug in the user-level agent, they cannot escalate to SYSTEM through it — they are separate processes with separate permission scopes.

---

## AI Insights & Vault: What Technology Powers Each Feature?

### AI Insights — Security Report Tab (no LLM involved)

The security report is powered entirely by **FastAPI + MongoDB aggregation** — no AI model, no external API call.

`POST /api/ai/report`:
1. Queries the `alerts` collection → counts by attack type and severity
2. Queries `nodes` → counts online vs offline
3. Reads `attacker_profiles` → top 5 IPs by attack count
4. Counts recent events in `agent_events` and `honeypot_logs` (last 24h)
5. Computes **health score (0–10)**:
   ```
   score = 10
   score -= (offline_nodes / total_nodes) × 3      (max –3 for node health)
   score -= (open_alerts / total_alerts) × 4        (max –4 for alert burden)
   score -= (critical_alerts / total_alerts) × 3    (max –3 for severity)
   score = clamp(score, 0, 10)
   ```
6. Generates plain-text recommendations from thresholds
7. Upserts one `security_reports` document per user

This is fully deterministic — same live data produces the same report.

### AI Insights — AI Advisor Tab (direct LLM calls from browser)

The chatbot makes API calls **directly from the browser to the LLM provider** — no chat messages pass through DecoyVerse servers.

| Provider | API Endpoint | Auth |
|----------|-------------|------|
| OpenAI | `https://api.openai.com/v1/chat/completions` | `Authorization: Bearer <key>` |
| OpenRouter | `https://openrouter.ai/api/v1/chat/completions` | `Authorization: Bearer <key>` + `HTTP-Referer` |
| Google Gemini | `https://generativelanguage.googleapis.com/.../generateContent?key=<key>` | Query param |

**System prompt injection:** Before every user message, the client prepends a system prompt built from the loaded security report:
```
You are DecoyVerse AI, a cybersecurity expert.
CURRENT SECURITY CONTEXT (as of 2025-01-15):
- Health Score: 7.4/10
- Nodes: 3 online of 4 total
- Alerts: 12 total | 4 open | 1 critical
- Top Attack Types: BruteForce (8), DataExfil (3), Recon (1)
- Top Attackers: 45.33.22.11 (6 attacks), ...
- Recommendations: Investigate 1 critical alert immediately...
```

This gives the LLM real context about the specific environment — answers are tailored, not generic.

**API key handling:** The user's LLM API key is stored in `users.aiSettings.apiKey` in MongoDB. It is retrieved on page load (via `GET /api/auth/me`), held in React state, and passed directly to the LLM provider's API from the browser. It never passes through FastAPI or Express during actual chat — only during profile save/load.

### Vault Technology Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Key derivation | PBKDF2 (Web Crypto API, 100,000 × SHA-256) | Turns master password → AES key |
| Encryption | AES-256-GCM (Web Crypto API) | Encrypts/decrypts each password entry |
| Verification | AES-GCM encrypt("decoyverse-vault-v1") | `vaultVerifier` blob proves correct password without sending it |
| Password scoring | zxcvbn (offline JS library, no API) | Entropy-based crack time estimate, score 0–4 |
| Password generation | `crypto.getRandomValues()` | Cryptographically random, charset: A-Z a-z 0-9 symbols |
| Storage | MongoDB `vault_items` via Express (`authClient`) | Stores only encrypted blobs, user-scoped |
| Transport | HTTPS → Express → MongoDB Atlas | Same JWT auth as all other API calls |

---

## Likely Reviewer Q&A

**Q: What problem does this solve?**
Traditional security is reactive (antivirus) or perimeter-based (firewall). Both miss insiders, zero-days, and post-breach reconnaissance. DecoyVerse is a proactive trap — it catches attackers already inside by planting files they should never touch.

**Q: What is a honeytoken?**
A fake, realistic-looking credential file (fake AWS key, SSH key, passwords.txt) deployed in locations an attacker would explore. It has no legitimate use, so any access is a guaranteed indicator of malicious activity.

**Q: How does the ML model work? What is it trained on?**
Random Forest classifier (100 trees) trained on real MongoDB logs from testing and a 10,000+ row synthetic dataset. 6 features: failed logins, request rate, command count, SQL payload flag, honeytoken access flag, session time. Outputs attack type (BruteForce, Injection, DataExfil, Recon, Normal) and a risk score 1–10.

**Q: Where did you get the dataset?**
Two sources: (1) real event logs exported from our own testing environment via `export_real_logs.py`, and (2) a synthetic dataset with realistic class distributions. The network monitor uses a separate model trained on CIC-IDS benchmark format data.

**Q: Why Random Forest and not a neural network?**
RF is interpretable (feature importances extractable), handles small tabular datasets without overfitting, requires no GPU, and gives sub-millisecond inference — critical for real-time alert scoring.

**Q: Antivirus and firewalls already exist — what does this add?**
Antivirus needs a known signature (misses zero-days and fileless attacks). Firewalls guard the perimeter (miss insiders and post-breach lateral movement). DecoyVerse detects threats already inside with near-zero false positives. It is a third layer, not a replacement.

**Q: How does the agent deploy without admin rights?**
File monitoring (watchdog) and network monitoring (psutil) run as a normal user. Only `dv_firewall.py` runs as SYSTEM — and only for applying firewall rules. Minimal privilege, minimal attack surface.

**Q: How is the vault secure? Can someone hack it?**
Zero-knowledge: master password never leaves the browser. PBKDF2 (100,000 SHA-256 iterations) → AES-256-GCM encryption in the browser. Server stores only ciphertext. Even with the entire database, an attacker cannot decrypt vault entries without the master password. Brute-forcing PBKDF2 at 1 billion guesses/second: a 12-character password is computationally infeasible to crack.

**Q: Can the agent be detected or killed?**
Yes, with admin access. But by the time an attacker finds and kills the agent, honeytokens have already been triggered and alerts have already fired. NSSM service restart means `taskkill` restarts it in seconds. The deception fires before the agent is found.

**Q: What if the attacker never touches a honeytoken?**
The network monitor (psutil) catches suspicious outbound connections — unusual ports, known C2 ranges (4444, 1337), suspicious processes (netcat). These trigger ML scoring independently of honeytokens.

**Q: Why two backends?**
Separation of concerns. Express/Node.js is the standard for auth (bcrypt, JWT, express-validator). FastAPI/Python is the natural choice for ML (scikit-learn, numpy) and async I/O. Each does what its ecosystem does best.

**Q: How does IP blocking work end-to-end?**
Dashboard click → FastAPI writes `pending` to `blocked_ips` → next agent heartbeat (30s) delivers pending blocks → agent writes `pending_blocks.json` → `dv_firewall.py` (SYSTEM task, 60s poll) applies `netsh advfirewall` rule → agent confirms → status updates to `active`.

**Q: How does the AI Advisor know about my environment?**
Before each message, the client builds a system prompt from the loaded security report (health score, open alerts, attack types, top attacker IPs) and prepends it to the conversation. The LLM answers with context about your specific environment — not generic advice.

**Q: Is the AI API key secure?**
The key is stored in `users.aiSettings.apiKey` in MongoDB. Chat calls go directly from the browser to the LLM provider — the key never passes through FastAPI or Express for actual chat requests. MVP limitation: the field is not encrypted at rest in MongoDB. Production hardening: server-side KMS encryption for this field.

**Q: What happens if the backend is down?**
The ML service has a fallback: honeytoken access events are auto-scored at risk_score=9 regardless of ML availability. Alerts still fire. Notifications still send. The ML score is the only thing affected by backend downtime.

---

## ═══════════════════════════════════════════════════════════
## COMPLETE API REFERENCE — ALL THREE SERVICES
## ═══════════════════════════════════════════════════════════

All API endpoints across every service. Authentication is noted for each endpoint.

---

### Service 1 — Express Auth Backend (`:5000`)

Base URL in production: `https://decoyverse-v2.onrender.com`
All endpoints under `/api/auth/` unless noted. JWT auth via `Authorization: Bearer <token>`.

---

#### Authentication & User Account

| Method | Endpoint | Auth | What It Does |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | Public | Register a new user. Body: `{ name, email, password }`. Validates email uniqueness, hashes password with bcrypt (12 rounds), generates JWT, sends welcome email via SendGrid. Returns `{ user, token }`. |
| POST | `/api/auth/login` | Public | Authenticate user. Body: `{ email, password }`. Compares bcrypt hash, updates `lastLogin`, issues new JWT. Returns `{ user, token }`. |
| GET | `/api/auth/me` | JWT | Get current logged-in user's profile. Reads from MongoDB using user ID from JWT. Returns full user object including `notifications`, `aiSettings`, `vaultVerifier`. |
| POST | `/api/auth/logout` | JWT | Log out (stateless — JWT is client-side). Server acknowledges the request. Client must delete token from localStorage. |
| PUT | `/api/auth/update-password` | JWT | Change password. Body: `{ currentPassword, newPassword }`. Verifies current password with bcrypt, sets new hash, issues a new JWT. |
| PUT | `/api/auth/complete-onboarding` | JWT | Mark user as fully onboarded after finishing the agent setup wizard. Sets `isOnboarded: true` in MongoDB. Used by the onboarding flow to enable redirect to dashboard. |
| PUT | `/api/auth/profile` | JWT | Update user profile. Body (all optional): `{ name, email, avatar, notifications, aiSettings, vaultVerifier }`. Merges `notifications` and `aiSettings` (patch, not replace). Returns updated user. |

#### Email Endpoints

| Method | Endpoint | Auth | What It Does |
|--------|----------|------|-------------|
| POST | `/api/auth/test-alert-email` | JWT | Send a dummy alert email to the user's configured `emailAlertTo` address. Reads the address from their profile. Uses the full HTML alert template with fake data so the user can preview the email format. |
| POST | `/api/auth/internal/send-alert-email` | `x-internal-secret` header | Internal-only endpoint. Called by the Python FastAPI backend to relay real alert emails through Express/SendGrid. Body: `{ to, alertData }`. Authenticated by a shared secret (`INTERNAL_SECRET` env var) — no JWT. Never called from the browser. |

---

#### Vault Endpoints (`/api/vault`)

All vault routes are JWT-protected. Every query is scoped to `req.user._id` — users can never access another user's vault items. Passwords are stored as AES-256-GCM encrypted blobs — the server stores ciphertext only.

| Method | Endpoint | Auth | What It Does |
|--------|----------|------|-------------|
| GET | `/api/vault` | JWT | List all vault items for the authenticated user. Sorted by `createdAt` descending. Returns: `{ success, data: [{ _id, title, username, encryptedPassword, url, notes, createdAt, updatedAt }] }`. |
| POST | `/api/vault` | JWT | Create a new vault entry. Body: `{ title (required), encryptedPassword (required), username?, url?, notes? }`. The `encryptedPassword` is a JSON string `{ iv, ciphertext }` (both base64) — already encrypted in the browser before this call. Returns the created item with `201`. |
| PUT | `/api/vault/:id` | JWT | Update a vault item. Verifies `userId === req.user._id` (ownership check). Body: any subset of `{ title, username, encryptedPassword, url, notes }`. Only provided fields are updated. |
| DELETE | `/api/vault/:id` | JWT | Delete a vault item. Verifies ownership by scoping `deleteOne` query to both `_id` and `userId`. Returns 404 if not found or doesn't belong to user. |

---

### Service 2 — FastAPI Data + ML Backend (`:8001`)

Base URL in production: `https://ml-modle-v0-1.onrender.com`
JWT auth via `Authorization: Bearer <token>` header (same JWT secret as Express).
Agent routes use `X-Node-Id` + `X-Node-Key` (or `X-Node-API-Key`) instead of JWT.

---

#### Node Management (`/api/nodes`)

| Method | Endpoint | Auth | What It Does |
|--------|----------|------|-------------|
| POST | `/api/nodes` | JWT | Create a new node. Body: `{ name, os_type, deployment_config? }`. Generates a UUID4 `node_id` and a random `node_api_key` (stored hashed in MongoDB). Returns both in the response — the plaintext key is shown only once for the agent config. |
| GET | `/api/nodes` | JWT | List all nodes belonging to the authenticated user. Returns: `node_id, name, status, os_type, ip_address, last_seen, created_at`. Filtered to `user_id` from JWT. |
| PATCH | `/api/nodes/:node_id` | JWT | Update a node's status. Body: `{ status }`. Validates that the node belongs to the requesting user. Used to toggle between `active` and `inactive`. |
| DELETE | `/api/nodes/:node_id` | JWT | Delete a node. By default sets `uninstall_requested: true` — the agent picks this up on next heartbeat and runs self-uninstall. Use query param `?force=true` to bypass agent uninstall and delete all node data (alerts, decoys, logs) immediately. |
| GET | `/api/nodes/:node_id/decoys` | JWT | Get all deployed decoy files for a specific node. Returns list of honeytoken/file records with `file_name, file_path, type, status, triggers_count, last_accessed`. |
| GET | `/api/nodes/:node_id/agent-download` | JWT | Download the pre-configured agent installer as a ZIP file. The ZIP contains: `agent.py` (stub), `config.json` (with `node_id`, `node_api_key`, backend URLs), `setup.sh`, `README.md`. |
| GET | `/api/nodes/stats` | JWT | Get aggregated node statistics for the user: `{ total, online, offline }`. Used by the dashboard stat cards. |

---

#### Alerts, Stats & Blocking (`/api`)

| Method | Endpoint | Auth | What It Does |
|--------|----------|------|-------------|
| GET | `/api/stats` | JWT | Get dashboard-level statistics: total nodes, online nodes, total decoys, total alerts, open alerts, critical alerts. All scoped to the authenticated user. |
| GET | `/api/recent-attacks` | JWT | Get the most recent high-risk alerts (default limit=10). Returns full alert objects sorted by timestamp descending. Used by the Dashboard recent alerts list. |
| GET | `/api/alerts` | JWT | Get all alerts for the user with optional filters. Query params: `?limit=50&severity=critical&status=open`. Returns full alert objects including `extra.geo`, `extra.abuse` enrichment data. |
| PATCH | `/api/alerts/:alert_id` | JWT | Update alert investigation status. Body: `{ "status": "open" \| "acknowledged" \| "investigating" \| "resolved" }`. Used by the status dropdown on the Alerts page. |
| GET | `/api/attacker-profile/:source_ip` | JWT | Get compiled threat intelligence for a specific IP address from the `attacker_profiles` collection. Returns: `total_attacks, most_common_attack, attack_types, services_targeted, first_seen, last_seen`. |
| POST | `/api/block-ip` | JWT | Queue an IP address for firewall blocking. Body: `{ ip_address, node_id, alert_id? }`. Creates a `blocked_ips` record with `status: "pending"`. The agent picks it up on next heartbeat and applies the Windows Firewall rule. |
| GET | `/api/blocked-ips` | JWT | Return all blocked IP records for the user's nodes. Returns `status` (pending / active / failed) so the dashboard can show which blocks have been confirmed by the agent. |
| GET | `/api/health` | Public | Health check for the FastAPI backend. Returns database connection status, app version, and `auth_enabled` flag. Used for monitoring and uptime checks. |

---

#### Decoys (`/api/decoys`)

| Method | Endpoint | Auth | What It Does |
|--------|----------|------|-------------|
| GET | `/api/decoys` | JWT | Get all decoy assets for all of the user's nodes. Returns decoys with `node_name` joined in (not stored — resolved at query time). Supports `?limit=50`. |
| GET | `/api/decoys/node/:node_id` | JWT | Get all decoys for a specific node. Verifies the node belongs to the requesting user before returning data. |
| PATCH | `/api/decoys/:decoy_id` | JWT | Toggle a decoy's monitoring status. Query param: `?status=active` or `?status=inactive`. Inactive decoys are no longer watched by the agent — useful for temporarily disabling a decoy without deleting it. |
| DELETE | `/api/decoys/:decoy_id` | JWT | Delete a decoy record from the database. Does not delete the actual file from the machine — the agent manages files independently. |
| POST | `/api/decoys/deploy` | JWT | Request additional honeytokens be deployed to a node. Body: `{ node_id, count }`. Increments `deployment_config.initial_honeytokens` in the node document. The agent picks up the new count on next heartbeat and deploys additional files. |

---

#### Honeytokens (`/api/honeytokels`)

Honeytokens are a filtered view of decoys where `type === "honeytoken"` (credential/secret files). Same operations as decoys but surfaced separately in the UI.

| Method | Endpoint | Auth | What It Does |
|--------|----------|------|-------------|
| GET | `/api/honeytokels` | JWT | Get all credential-type honeytokens for all user nodes. Returns: `file_name, file_path, type, status, trigger_count, download_count, last_triggered`. |
| GET | `/api/honeytokels/node/:node_id` | JWT | Get honeytokens for a specific node. Verifies node ownership. |
| PATCH | `/api/honeytokels/:honeytoken_id` | JWT | Toggle honeytoken active/inactive status. |
| DELETE | `/api/honeytokels/:honeytoken_id` | JWT | Delete a honeytoken record. |

---

#### Agent Inbound Routes (`/api`) — Called by the Agent, Not the Browser

These routes are authenticated with `X-Node-Id` + `X-Node-Key` headers (not JWT). They are called by the Python agent process running on the monitored machine.

| Method | Endpoint | Auth | What It Does |
|--------|----------|------|-------------|
| POST | `/api/honeypot-log` | Node key | Receive a log event from a service-level honeypot (fake SSH, FTP, web service). Validates node, calls ML service, creates alert if `risk_score ≥ 7`, fires notifications, updates attacker profile. Body: `{ service, source_ip, activity, payload, timestamp }`. |
| POST | `/api/agent-alert` | Node key | Receive a honeytoken file access event from the file monitor. Validates node, captures process forensics (`process_name, pid, cmdline, username`), enriches source IP with geolocation + AbuseIPDB, calls ML, creates alert if high-risk, fires Slack/email/WhatsApp notifications. This is the primary alert path for deception events. |
| POST | `/api/agent/register` | Node key | First-time agent startup registration. Query params: `node_id, hostname, os`. Updates node status to `online` and records `hostname` and `os`. |
| POST | `/api/agent/heartbeat` | Node key | Keep-alive ping every 30 seconds. Updates `last_seen` and `ip_address` on the node. Returns: `{ uninstall: bool, pending_blocks: [...], deployment_config }`. The agent uses these return values to: self-uninstall if requested, apply queued firewall blocks, deploy new honeytokens if the count increased. |
| POST | `/api/agent/uninstall-complete` | Node key | Agent reports it has finished the uninstall process (removed honeytokens, stopped services). FastAPI then permanently deletes the node and all its decoys from MongoDB. |
| GET | `/api/agent/download/:node_id` | JWT | Download the agent installer ZIP for a specific node. Used by the dashboard download button. Returns a ZIP with `agent.py`, `config.json` (with node credentials), `setup.sh`. |
| POST | `/api/agent/register-decoys` | Node key | Agent registers all the honeytoken files it deployed during setup. Body: list of `{ file_name, file_path, type }`. FastAPI saves each as a `decoys` document so they appear in the dashboard. |
| POST | `/api/network-event` | Node key | Receive a suspicious outbound network connection event from the agent's network monitor (psutil). Body includes: `source_ip, dest_ip, dest_port, protocol, process_name, rule_score, rule_triggers, ml_attack_type, ml_risk_score`. Creates an alert if score ≥ threshold. |
| POST | `/api/agent/block-confirmed` | Node key | Agent confirms it successfully applied a Windows Firewall rule. Query params: `node_id, ip_address`. Updates `blocked_ips` status from `pending` to `active` in MongoDB. The dashboard then shows the block as confirmed. |

---

#### AI & Security Reports (`/api/ai`)

| Method | Endpoint | Auth | What It Does |
|--------|----------|------|-------------|
| GET | `/api/ai/insights` | JWT | Get AI-powered threat summary for the user. Aggregates top attacker profiles, detects scanner bots, maps attack types to MITRE ATT&CK techniques, computes average confidence score. Returns: `{ attacker_profiles, scanner_bots_detected, confidence_score, mitre_tags }`. |
| GET | `/api/ai/attacker-profile/:source_ip` | JWT | Detailed threat intelligence for a specific attacker IP. Returns: attack history, MITRE technique tags (T1110, T1046, T1190, etc.), auto-generated description, activity count, last seen timestamp. |
| POST | `/api/ai/report` | JWT | **Generate a new security health report.** Aggregates from MongoDB: node status, alert counts by severity, attack type distribution, top attacker IPs, recent 24h event count. Computes health score (0–10). Generates text recommendations. Upserts one report per user in `security_reports` collection. Returns the full report JSON. |
| GET | `/api/ai/report` | JWT | Retrieve the last saved security report for the user. Returns `{ exists: false }` if no report has been generated. Used on page load to pre-populate the AI Insights report tab. |

---

#### Event Logs (`/api/logs`)

| Method | Endpoint | Auth | What It Does |
|--------|----------|------|-------------|
| GET | `/api/logs` | JWT | Get all security event logs for the user's nodes. Combines `honeypot_logs` and `agent_events` collections. Query params: `?limit=100&node_id=...&severity=critical&search=keyword`. The `search` param filters across `source_ip`, `event_type`, and `related_decoy`. |
| GET | `/api/logs/node/:node_id` | JWT | Get event logs for a specific node only. Supports the same `?severity` and `?search` filters. Verifies node ownership before returning data. |

---

#### Install Scripts (`/api/install`)

| Method | Endpoint | Auth | What It Does |
|--------|----------|------|-------------|
| GET | `/api/install/windows` | Public | Return the Windows PowerShell agent installation script as a download. Includes NSSM service setup and scheduled task configuration. |
| GET | `/api/install/linux` | Public | Return the Linux bash agent installation script. Includes systemd service or crontab setup. |
| GET | `/api/install/macos` | Public | Return the macOS bash agent installation script. |
| POST | `/api/install/generate-installer/:node_id` | JWT | Generate and return a node-specific installer ZIP. Embeds `node_id` and `node_api_key` in the config. Used by the Nodes page "Download Agent" button. This is the primary download path (alias of `GET /api/nodes/:id/agent-download`). |

---

### Service 3 — ML Prediction Service (separate microservice)

Hosted separately from the FastAPI data backend. Deployed at: `https://ml-modle-v0-2.onrender.com`
Not user-facing. Called internally by the FastAPI data backend only. No JWT required.

---

| Method | Endpoint | Auth | What It Does |
|--------|----------|------|-------------|
| GET | `/` | Public | API info. Returns service name, version, model status, available endpoints list. |
| GET | `/health` | Public | Health check. Returns: `{ status: "healthy"\|"unhealthy", model_loaded: bool, version }`. Called by FastAPI's ML service client on startup to verify the model is ready. |
| POST | `/predict` | Public (internal) | **Main prediction endpoint.** Body: `{ failed_logins, request_rate, commands_count, sql_payload (0\|1), honeytoken_access (0\|1), session_time }`. Runs the event through the Random Forest classifier and Isolation Forest anomaly detector. Returns: `{ attack_type, risk_score (1–10), confidence (0–1), anomaly_score, is_anomaly }`. Called synchronously from the FastAPI backend for every incoming agent event. |
| POST | `/predict-batch` | Public (internal) | Batch prediction. Body: list of event objects with the same 6 features. Returns a list of predictions in the same order. Used for bulk scoring of historical logs. |
| POST | `/predict/network` | Public (internal) | Predict from network flow features (CIC-IDS format). Uses the separately trained network traffic model. Input features are different from the honeytoken model — includes packet counts, byte counts, inter-arrival times. Returns the same `{ attack_type, risk_score, confidence }` format. |
| GET | `/features` | Public | Returns the list of feature names the model expects, with descriptions and expected ranges. Used for documentation and debugging feature mapping issues. |

---

### API Authentication Summary

| Caller | Authenticates With | Validated By |
|--------|-------------------|-------------|
| Browser → Express | `Authorization: Bearer <JWT>` | Express `protect` middleware (JWT_SECRET) |
| Browser → FastAPI | `Authorization: Bearer <JWT>` | FastAPI `get_user_id_from_header()` (same JWT_SECRET) |
| Agent → FastAPI | `X-Node-Id` + `X-Node-Key` headers | `validate_node_access()` — bcrypt compares key against stored hash |
| FastAPI → Express (email relay) | `x-internal-secret` header | Direct string comparison against `INTERNAL_SECRET` env var |
| FastAPI → ML Service | None (internal network) | No auth — ML service is not publicly exposed |
| Browser → LLM (AI chat) | Provider API key in request | Direct to OpenAI/OpenRouter/Gemini — never touches DecoyVerse servers |

---

### Key Request/Response Patterns

**Standard Express success response:**
```json
{ "success": true, "message": "...", "data": { ... } }
```

**Standard Express error response:**
```json
{ "success": false, "message": "Error description", "errors": [...] }
```

**Standard FastAPI response (data endpoints):**
```json
{ "status": "success", ... }
```
or direct model list for collection endpoints.

**Alert object (full):**
```json
{
  "alert_id": "AGENT-20250601120000-hostname",
  "timestamp": "2025-06-01T12:00:00",
  "source_ip": "192.168.1.100",
  "service": "endpoint_agent",
  "attack_type": "DataExfil",
  "risk_score": 10,
  "confidence": 0.93,
  "activity": "ACCESSED",
  "payload": "passwords_backup.txt",
  "node_id": "uuid4-string",
  "user_id": "mongo-objectid",
  "status": "open",
  "extra": {
    "process_name": "explorer.exe",
    "pid": 4521,
    "cmdline": "C:\\Windows\\explorer.exe",
    "geo": { "country": "India", "city": "Mumbai", "org": "AS9829 BSNL" },
    "abuse": { "confidence_score": 0, "total_reports": 0, "is_tor": false }
  }
}
```

**ML prediction response:**
```json
{
  "attack_type": "DataExfil",
  "risk_score": 9.2,
  "confidence": 0.93,
  "anomaly_score": -0.45,
  "is_anomaly": true
}
```
