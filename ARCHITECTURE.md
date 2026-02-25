# DecoyVerse — System Architecture

> Cybersecurity deception platform built on honeytokens, ML-powered threat analysis, and real-time alerting.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               MONITORED MACHINES                                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  DecoyVerse Agent  (Python, runs as user + SYSTEM Scheduled Task)       │   │
│  │                                                                         │   │
│  │  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────────────┐ │   │
│  │  │ FileMonitor  │  │ NetworkMonitor   │  │  agent_setup.py          │ │   │
│  │  │ (watchdog)   │  │ (psutil)         │  │  (deploy decoys &        │ │   │
│  │  │              │  │                  │  │   honeytokens)           │ │   │
│  │  └──────┬───────┘  └───────┬──────────┘  └───────────────────────────┘ │   │
│  │         │                  │                                             │   │
│  │         └──────────────────┘                                             │   │
│  │                    │ HTTP POST (every event)                             │   │
│  └────────────────────│─────────────────────────────────────────────────────┘   │
│                       │                                                         │
└───────────────────────│─────────────────────────────────────────────────────────┘
                        │
                        ▼ HTTPS
┌──────────────────────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend  (Python 3.11, port :8001)                    │
│                    Deployed on: Render                                           │
│                                                                                  │
│  /api/agent-alert   /api/network-event   /api/agent/heartbeat                   │
│  /api/stats         /api/alerts          /api/nodes                             │
│  /api/decoys        /api/recent-attacks  /api/attacker-profiles                │
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────────┐  │
│  │ ML Service   │  │ Notification │  │  DB Service (MongoDB Atlas)          │  │
│  │ (sklearn RF) │  │ Service      │  │  users / nodes / alerts / decoys /   │  │
│  │              │  │ Slack+Email  │  │  agent_events / network_events /     │  │
│  │              │  │ +WhatsApp    │  │  blocked_ips / attacker_profiles     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
                        │                          │
          ┌─────────────┘                          └────────────────────┐
          ▼ HTTPS                                                       ▼ HTTPS
┌───────────────────────────┐                    ┌────────────────────────────────┐
│ Express Backend            │                    │  React Frontend (Vite 5)       │
│ (Node.js/TS, port :5000)   │                    │  Deployed on: Vercel           │
│ Deployed on: Railway       │                    │                                │
│                            │                    │  Dashboard / Nodes / Settings  │
│ Auth only:                 │                    │  Onboarding / Alerts           │
│  POST /api/auth/signup     │◀───────────────────│                                │
│  POST /api/auth/login      │                    │  authClient → :5000            │
│  GET  /api/auth/me         │                    │  apiClient  → :8001            │
│  PUT  /api/auth/profile    │                    │                                │
│  POST /api/auth/test-alert-│                    │                                │
│       email (NodeMailer)   │                    │                                │
└───────────────────────────┘                    └────────────────────────────────┘
```

---

## 2. Component Breakdown

### 2.1 Frontend (React 19 + TypeScript + Vite)

| Component | Location | Description |
|-----------|----------|-------------|
| `AuthContext` | `src/context/AuthContext.tsx` | Global auth state, JWT from localStorage, `GET /auth/me` on mount |
| `ThemeContext` | `src/context/ThemeContext.tsx` | Gold / Orange / Light modes, persisted to localStorage |
| `apiClient` | `src/api/client.ts` | Axios to FastAPI (:8001), auto-injects Bearer token, 401 → redirect |
| `authClient` | `src/api/client.ts` | Axios to Express (:5000), same token injection |
| `Dashboard` | `src/pages/Dashboard.tsx` | Stats, chart, Recent Alerts, ThreatModal |
| `Nodes` | `src/pages/Nodes.tsx` | Node management, agent download, delete + manual uninstall |
| `Settings` | `src/pages/Settings.tsx` | Profile, alert channels, test email, appearance |
| `Onboarding` | `src/pages/Onboarding.tsx` | Node creation wizard, API token reveal, agent download |
| `ThreatModal` | `src/components/common/ThreatModal.tsx` | Alert detail, Block IP action |
| `Navbar` | `src/components/layout/Navbar.tsx` | Numeric alert badge (open + critical count) |

### 2.2 Express Backend (Node.js / TypeScript, port :5000)

**Purpose:** Authentication only — stateless JWT issuance and user profile management.

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/signup` | POST | Create user, hash password (bcrypt 12 rounds), fire welcome email (NodeMailer) |
| `/api/auth/login` | POST | Verify credentials, return JWT |
| `/api/auth/me` | GET | Return user + notification prefs |
| `/api/auth/profile` | PUT | Update name, email, `notifications` (slackWebhook, emailAlertTo, whatsappNumber) |
| `/api/auth/update-password` | PUT | bcrypt compare + re-hash |
| `/api/auth/complete-onboarding` | PUT | Set `isOnboarded: true` |
| `/api/auth/test-alert-email` | POST | Send dummy alert HTML email via NodeMailer to `notifications.emailAlertTo` |

**Email:** NodeMailer → SMTP (`SMTP_USER`, `SMTP_PASS` env vars). Welcome email on signup, test alert on demand.

### 2.3 FastAPI Backend (Python 3.11, port :8001)

**Purpose:** All data operations, ML scoring, notifications, agent coordination.

| Router | Prefix | Key Endpoints |
|--------|--------|--------------|
| `alerts.py` | `/api` | `GET /alerts`, `PATCH /alerts/{id}`, `POST /alerts/{id}/block-ip` |
| `nodes.py` | `/api` | `POST /nodes`, `GET /nodes`, `DELETE /nodes/{id}` (sets uninstall flag) |
| `decoys.py` | `/api` | `GET /decoys`, `POST /decoys/deploy` |
| `agent.py` | `/api` | `POST /agent-alert`, `POST /network-event`, `POST /agent/heartbeat`, `POST /agent/uninstall-complete` |
| `stats.py` | `/api` | `GET /stats`, `GET /recent-attacks`, `GET /attacker-profiles` |

**Auth:** All routes validate `Authorization: Bearer <JWT>` using the shared `JWT_SECRET`. Agents use `X-Node-Id` + `X-Node-Key` headers.

### 2.4 ML Service (scikit-learn Random Forest)

- **Model:** `RandomForestClassifier` trained on labeled security log data
- **Input features (6):**
  ```
  failed_logins     – number of failed auth attempts
  request_rate      – requests per minute
  commands_count    – shell commands executed
  sql_payload       – binary flag (SQL injection detected)
  honeytoken_access – binary flag (honeytoken file touched)
  session_time      – seconds of session activity
  ```
- **Output:**
  - `attack_type`: one of `Normal`, `DoS`, `Probe`, `R2L`, `U2R`, `SQL_Injection`, `HONEYTOKEN_ACCESS`
  - `risk_score`: 1–10 (derived from attack type + confidence)
  - `confidence`: 0.0–1.0 (RF probability of predicted class)
  - `is_anomaly`: boolean (`risk_score >= 7`)
- **Model file:** `ml_model.pkl` (loaded at FastAPI startup)
- **Honeytoken mapping:** Agent events are converted to feature vectors via `alert_to_log_format()` in `alert_sender.py`

### 2.5 Agent (Python, runs on monitored machine)

```
DeceptionAgent
├── agent_setup.py      — deploy decoys + honeytokens, write manifest
├── file_monitor.py     — watchdog + stat polling, detect honeytoken access
├── network_monitor.py  — psutil net_connections, rule engine + ML scoring
├── alert_sender.py     — HTTP POST to FastAPI /api/agent-alert
├── registration.py     — node registration, heartbeat, uninstall-complete
└── dv_firewall.py      — elevated SYSTEM task, reads pending_blocks.json, applies Windows Firewall rules
```

**Startup flow:**
1. Load config from `agent_config.json` (node_id, node_api_key, backend_url)
2. Deploy honeytokens + decoys via `agent_setup.py` if not already deployed
3. Register deployed decoys with FastAPI backend
4. Start `FileMonitor` (watchdog observer on all parent directories)
5. Start `NetworkMonitor` (background thread, polls every 30s)
6. Start heartbeat loop (every 30s):
   - Receives: `pending_blocks`, `deployment_config`, `uninstall` flag
   - Processes new blocks → writes `pending_blocks.json` → `dv_firewall.py` applies them
   - Processes new `deployment_config` → deploys additional honeytokens

---

## 3. Database Schema (MongoDB Atlas)

### `users`
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "password": "string (bcrypt, select:false)",
  "role": "user | admin",
  "isOnboarded": "boolean",
  "isActive": "boolean",
  "avatar": "string?",
  "notifications": {
    "slackWebhook": "string?",
    "emailAlertTo": "string?",
    "whatsappNumber": "string?"
  },
  "lastLogin": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `nodes`
```json
{
  "_id": "ObjectId",
  "node_id": "string (uuid4)",
  "user_id": "string (ref users._id)",
  "name": "string",
  "status": "active | inactive | uninstall_requested",
  "os_type": "windows | linux | macos",
  "ip_address": "string?",
  "node_api_key": "string (hashed)",
  "last_seen": "ISODate",
  "uninstall_requested": "boolean",
  "deployment_config": {
    "initial_decoys": "int",
    "initial_honeytokens": "int",
    "deploy_path": "string?"
  },
  "created_at": "ISODate"
}
```

### `alerts`
```json
{
  "_id": "ObjectId",
  "alert_id": "string (uuid4)",
  "timestamp": "ISODate",
  "source_ip": "string",
  "service": "string (SSH | FTP | File System | Network)",
  "activity": "string",
  "attack_type": "string",
  "risk_score": "int (1-10)",
  "confidence": "float (0-1)",
  "payload": "string",
  "node_id": "string",
  "user_id": "string",
  "status": "open | acknowledged | investigating | resolved",
  "notified": "boolean",
  "notification_status": "sent | failed | no_channels | null",
  "extra": {
    "process_name": "string?",
    "pid": "int?",
    "cmdline": "string?",
    "geo": { "country": "string", "city": "string", "org": "string", "lat": "float", "lon": "float" }?,
    "hostname": "string?",
    "rdns": "string?",
    "abuseipdb": { "abuseConfidenceScore": "int", "totalReports": "int", "countryCode": "string" }?
  }
}
```

### `decoys`
```json
{
  "_id": "ObjectId",
  "node_id": "string",
  "user_id": "string",
  "file_name": "string",
  "file_path": "string",
  "type": "file | honeytoken | aws_creds | db_creds | api_key | ssh_key",
  "status": "active | triggered | disabled",
  "triggers_count": "int",
  "last_accessed": "ISODate?",
  "created_at": "ISODate"
}
```

### `network_events`
```json
{
  "_id": "ObjectId",
  "node_id": "string",
  "user_id": "string",
  "timestamp": "ISODate",
  "source_ip": "string",
  "dest_ip": "string",
  "dest_port": "int",
  "protocol": "TCP | UDP",
  "status": "ESTABLISHED | LISTEN | etc",
  "process_name": "string?",
  "rule_score": "int",
  "rule_triggers": ["string"],
  "ml_attack_type": "string?",
  "ml_risk_score": "int?",
  "ml_confidence": "float?"
}
```

### `blocked_ips`
```json
{
  "_id": "ObjectId",
  "node_id": "string",
  "ip_address": "string",
  "requested_at": "ISODate",
  "requested_by_user_id": "string",
  "alert_id": "string?",
  "status": "pending | active | failed",
  "confirmed_at": "ISODate?"
}
```

### `attacker_profiles`
```json
{
  "_id": "ObjectId",
  "source_ip": "string (unique)",
  "total_attacks": "int",
  "most_common_attack": "string",
  "average_risk_score": "float",
  "first_seen": "ISODate",
  "last_seen": "ISODate",
  "attack_types": { "BRUTE_FORCE": 3, "HONEYTOKEN_ACCESS": 1 },
  "services_targeted": { "SSH": 2, "File System": 1 }
}
```

---

## 4. Alert Generation Flow

```
Honeytoken accessed on disk
         │
         ▼
FileMonitor.detect_changes()          ← watchdog OR stat polling
         │
         ▼
FileMonitor.create_alert()            ← builds alert dict
  ├─ _calculate_severity()            ← CRITICAL/HIGH/MEDIUM/LOW by filename
  └─ _get_process_for_file()          ← psutil open_files() → PID, process_name, cmdline
         │
         ▼
AlertSender.send_alert()              ← POST /api/agent-alert
  └─ alert_to_log_format()            ← map file event → ML feature vector
         │
         ▼
FastAPI /api/agent-alert
  ├─ Validate X-Node-Id + X-Node-Key headers
  ├─ Call ML model                    ← predict(feature_vector) → attack_type, risk_score, confidence
  ├─ _enrich_ip(source_ip)            ← ip-api.com geolocation + rDNS + AbuseIPDB
  ├─ Build Alert document             ← save to MongoDB alerts collection
  ├─ Update decoy.triggers_count      ← increment + set last_accessed
  ├─ Update attacker_profile          ← upsert by source_ip
  └─ notification_service.broadcast_alert()
       ├─ send_slack_alert()          ← per-user slackWebhook
       ├─ send_email_alert()          ← HTML email via Python SMTP (mirrors ThreatModal)
       └─ send_whatsapp_alert()       ← Twilio API
         │
         ▼
Frontend polls GET /api/alerts every 30s
  └─ normalizeAlert()                 ← map raw MongoDB → Alert interface
         │
         ▼
Dashboard updates + Navbar badge count increments
```

---

## 5. Network Monitoring Flow

```
NetworkMonitor (background thread, 30s interval)
         │
         ▼
psutil.net_connections(kind='inet')   ← no admin required
         │
         ▼
Filter connections:
  - Skip loopback (127.x, ::1)
  - Skip known safe ports (80, 443, 53...)
  - Skip already-seen (connection_cache, 5min TTL)
         │
         ▼
Rule Engine (8 rules):
  ┌─ rare_port         dest_port not in {80,443,22,3306,5432,27017,...}
  ├─ non_local_dest    dest_ip is public (not RFC1918)
  ├─ suspicious_port   dest_port in {4444,1337,31337,9999,...}  ← common C2
  ├─ high_port_range   dest_port in 40000-65535
  ├─ db_port_exposed   dest_port in {3306,5432,27017,6379,9200}
  ├─ admin_port        dest_port in {22,23,3389,5900}
  ├─ web_alt           dest_port in {8080,8443,8888,9090}
  └─ suspicious_proc   process_name in {nc,netcat,ncat,msfconsole,...}
         │
         ▼
  rule_score = sum of matched rule weights (1-3 each)
         │
  if rule_score >= 4:
    ▼
  ML prediction (same model, different feature vector)
         │
  if ml_risk_score >= 5 AND rule_score >= 4:
    ▼
  POST /api/network-event
    └─ _enrich_ip(dest_ip)            ← geolocation + AbuseIPDB
    └─ if risk_score >= 7: create Alert in MongoDB
```

---

## 6. Privilege Separation (Windows)

```
Normal User Process: agent.py
  ├─ File monitoring (watchdog, no elevation needed)
  ├─ Network monitoring (psutil.net_connections, no elevation needed)
  ├─ Honeytoken deployment (writes to user home dirs)
  └─ Writes pending_blocks.json (IPC file)

SYSTEM Scheduled Task: dv_firewall.py
  ├─ Reads pending_blocks.json every 60s
  ├─ Applies Windows Firewall rules:
  │    netsh advfirewall firewall add rule
  │    name="DecoyVerse_Block_<IP>" dir=in action=block remoteip=<IP>
  └─ Writes confirmation back to pending_blocks.json (status: active)
```

This split avoids the agent needing admin rights for day-to-day monitoring.

---

## 7. Authentication & Security Model

| Layer | Mechanism |
|-------|-----------|
| User auth (frontend ↔ Express) | JWT HS256, secret: `JWT_SECRET`, expiry: 7 days, stored in localStorage |
| User auth (frontend ↔ FastAPI) | Same JWT validated with same `JWT_SECRET` |
| Agent auth (agent ↔ FastAPI) | `X-Node-Id` + `X-Node-Key` headers (node-specific API key, stored hashed in MongoDB) |
| CORS | Express: allow `FRONTEND_URL`; FastAPI: allow frontend origin |
| Password storage | bcrypt, 12 salt rounds |
| Demo mode | `admin@gmail.com` bypasses real backend, uses mock data interceptors |

---

## 8. Deployment Architecture

```
┌───────────────┐   ┌──────────────────┐   ┌─────────────────────────┐
│   Vercel      │   │   Railway        │   │   Render                │
│               │   │                  │   │                         │
│ React Frontend│   │ Express Backend  │   │ FastAPI Backend         │
│ (SPA + rewrites)  │ Node.js + TS     │   │ Python 3.11 + uvicorn   │
│ VITE_API_URL  │   │ PORT=5000        │   │ PORT=8001               │
│ → FastAPI URL │   │ MONGO_URI=Atlas  │   │ MONGODB_URI=Atlas       │
└───────────────┘   └──────────────────┘   │ ML_MODEL_PATH           │
                                            │ SMTP_*, TWILIO_*        │
                                            │ ABUSEIPDB_API_KEY       │
                                            └─────────────────────────┘
                                                       │
                                            ┌─────────────────────────┐
                                            │   MongoDB Atlas          │
                                            │ Cluster: decoyverseprod  │
                                            │ 8 collections            │
                                            │ Connection: TLS          │
                                            └─────────────────────────┘
```

### Environment Variables Summary

**Express (`server/.env`)**
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
FRONTEND_URL=https://your-vercel-app.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app-password
```

**FastAPI (`ML-modle v0/backend/.env`)**
```
MONGODB_URI=mongodb+srv://...
ML_API_URL=http://localhost:8000
JWT_SECRET=<same as Express>
PORT=8001
SLACK_WEBHOOK_URL=
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app-password
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=+14155238886
ABUSEIPDB_API_KEY=
FRONTEND_URL=https://your-vercel-app.vercel.app
```

---

## 9. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Two backends (Express + FastAPI) | Express is battle-tested for auth (bcrypt, JWT, validation); FastAPI is better for ML inference and async IO |
| Heartbeat-based command delivery | Avoids agent needing inbound firewall ports; commands (blocks, deployment) piggyback on existing 30s poll |
| Manifest-based honeytoken tracking | Enables precise cleanup on uninstall instead of brittle pattern matching |
| Privilege separation (agent + firewall task) | Minimal attack surface; only the narrow firewall helper runs as SYSTEM |
| ML feature mapping for honeytokens | File access events don't have network features; `alert_to_log_format()` maps file events to the model's feature space with fixed heuristics |
| `multipart/alternative` email | Plain text fallback ensures delivery on all clients; HTML version mirrors the dashboard UI |
| Fire-and-forget emails | Email delivery is non-blocking — signup/alert processing is never delayed by SMTP latency |
