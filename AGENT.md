# DecoyVerse Agent Context

## Project Overview

**DecoyVerse** is a cybersecurity deception platform that uses honeytokens, ML threat analysis, and real-time alerting to detect intruders in enterprise networks.

## Repository Structure

### 1. DecoyVerse-v2
**Location:** `C:\Users\satwi\Downloads\Major-project\DecoyVerse-v2`

Full-stack deception platform with React frontend and Express backend.

#### Frontend (`:5173`)
| Path | Purpose |
|------|---------|
| `src/App.tsx` | Route tree with ProtectedRoute/PublicRoute guards |
| `src/api/client.ts` | Axios instances: `authClient` (Express), `apiClient` (FastAPI) |
| `src/api/endpoints/` | API functions: auth, vault, dashboard, nodes, alerts, decoys, analytics, ai-insights, logs, install |
| `src/api/mockData.ts` | Demo mode mock data (admin@gmail.com / Admin@0265) |
| `src/context/AuthContext.tsx` | Auth state, login/logout/signup, demo bypass |
| `src/context/ThemeContext.tsx` | Theme switching: gold (cyan), orange, light |
| `src/pages/` | Route components: Dashboard, Nodes, Decoys, Honeytokens, Alerts, AIInsights, Logs, Vault, Settings, etc. |
| `src/components/` | Reusable UI: common/, layout/, auth/ |
| `src/index.css` | Tailwind v4 `@theme` tokens |

#### Backend (`server/src/`)
| Path | Purpose |
|------|---------|
| `server/src/index.ts` | Express entry, CORS, route mounting |
| `server/src/middleware/auth.ts` | `protect()` JWT verification, `generateToken()` |
| `server/src/routes/auth.ts` | Auth: signup, login, logout, me, profile, password, onboarding, email |
| `server/src/models/User.ts` | User Mongoose schema (bcrypt hook) |
| `server/src/models/VaultItem.ts` | Encrypted vault items |
| `server/src/utils/mailer.ts` | SendGrid email helpers |

**Dead routes (not mounted):** `alerts.ts`, `decoys.ts`, `stats.ts`, `attacks.ts`, `attacker-profiles.ts`

### 2. ML-modle v0
**Location:** `C:\Users\satwi\Downloads\Major-project\ML-modle v0`

ML backend and endpoint deception system.

| Path | Purpose |
|------|---------|
| `ml_api.py` | FastAPI ML service on port 8000 |
| `backend/main.py` | FastAPI backend on port 8001 |
| `backend/routes/` | Agent, alerts, nodes, decoys, network-event, stats |
| `backend/services/ml_service.py` | ML API integration |
| `agent.py` | Endpoint deception agent |
| `file_monitor.py` | File access monitoring (watchdog) |
| `network_monitor.py` | Network connection monitoring (psutil) |
| `predict.py` | `AttackPredictor`, `NetworkPredictor` classes |
| `train_model.py` | ML training pipeline |

#### ML Models
- **RandomForest Classifier**: 100 estimators, 5 attack classes (Normal, BruteForce, Injection, DataExfil, Recon), 94% accuracy
- **IsolationForest**: Anomaly detection, 10% contamination

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUD DEPLOYMENTS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐      ┌──────────────────────────────┐  │
│  │ decoy-verse-v2     │      │    ml-modle-v0-1              │  │
│  │ .vercel.app        │─────►│  .onrender.com               │  │
│  │                     │      │                              │  │
│  │ React UI            │      │ FastAPI Backend              │  │
│  │ :5173               │      │ • Agent management           │  │
│  └─────────────────────┘      │ • Alerts, Nodes, Decoys     │  │
│          │                    └──────────────┬───────────────┘  │
│          │ authClient                 apiClient                  │
│          ▼                             ▼                         │
│  ┌─────────────────────┐      ┌──────────────────────────────┐  │
│  │ decoyverse-v2      │      │    ml-modle-v0-2              │  │
│  │ .onrender.com      │──────│  .onrender.com               │  │
│  │                     │      │                              │  │
│  │ Express             │      │ ML API                       │  │
│  │ • Auth (JWT)        │      │ • RandomForest Classifier    │  │
│  │ • Vault (AES-256)   │      │ • IsolationForest            │  │
│  └─────────────────────┘      └──────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Deployed URLs

| Service | URL | Port | Purpose |
|---------|-----|------|---------|
| Frontend | https://decoy-verse-v2.vercel.app | - | React UI |
| Express API | https://decoyverse-v2.onrender.com | 5000 | Auth, Vault |
| FastAPI Backend | https://ml-modle-v0-1.onrender.com | 8001 | Data, Alerts, Agents |
| ML API | https://ml-modle-v0-2.onrender.com | 8000 | Attack Classification |

## Data Flow

1. **Agent Deployment** → ML-modle `agent.py` deploys honeytokens on endpoints
2. **Trigger Detection** → `file_monitor.py` / `network_monitor.py` detect unauthorized access
3. **Alert Ingestion** → Alert sent to `:8001/api/agent-alert`
4. **ML Classification** → Backend calls ML API `:8000/predict` for attack type + risk score
5. **Risk ≥ 7** → Notifications via Express backend (SendGrid, Slack, WhatsApp)
6. **Dashboard Display** → Frontend shows alerts, stats, attacker profiles

## API Endpoints

### Express Backend (`/api/auth/*`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/me` | Get current user |
| POST | `/auth/logout` | Logout |
| PUT | `/auth/profile` | Update profile |
| PUT | `/auth/update-password` | Change password |
| PUT | `/auth/complete-onboarding` | Mark onboarding done |
| POST | `/auth/test-alert-email` | Test alert email |

### Express Backend (`/api/vault/*`)
CRUD for encrypted vault items

### FastAPI Backend (`/api/*`)
| Endpoint | Description |
|----------|-------------|
| `POST /api/agent-alert` | Receive honeytoken triggers |
| `POST /api/agent/register` | Agent registration |
| `POST /api/agent/heartbeat` | Agent keep-alive |
| `GET /api/alerts` | Get alerts |
| `GET /api/decoys` | Get decoys |
| `POST /api/network-event` | Network intrusion events |
| `GET /api/stats` | Dashboard statistics |

### ML API (`:8000`)
| Endpoint | Description |
|----------|-------------|
| `POST /predict` | Single log prediction |
| `POST /predict-batch` | Batch prediction |
| `POST /predict/network` | Network flow prediction |
| `GET /health` | Health check |

## Key Technologies

### Frontend
React 19, TypeScript, Vite 7, Tailwind CSS v4, React Router v7, Axios, Framer Motion, Lucide React, Recharts, Sonner

### Backend (Express)
Express.js, MongoDB + Mongoose, JWT, bcryptjs, express-validator, SendGrid

### Backend (FastAPI)
FastAPI, uvicorn, motor (async MongoDB), JWT, bcrypt, watchdog, psutil

### ML
scikit-learn (RandomForest, IsolationForest), pandas, numpy

## Environment Variables

### Frontend (`.env`)
```
VITE_EXPRESS_API_URL=https://decoyverse-v2.onrender.com/api
VITE_FASTAPI_API_URL=https://ml-modle-v0-1.onrender.com
```

### Backend (`server/.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRE=7d
FRONTEND_URL=https://decoy-verse-v2.vercel.app
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM=DecoyVerse Security <you@example.com>
INTERNAL_SECRET=...
```

## Build Commands

### Frontend
```bash
npm run dev       # Vite dev server
npm run build     # Production build → dist/
npm run lint      # ESLint
npx tsc --noEmit  # Type-check
```

### Backend
```bash
cd server && npm run dev       # ts-node-dev on :5000
cd server && npm run build     # tsc → server/dist/
cd server && npm start         # node dist/index.js
```

## Demo Mode
- **Credentials:** `admin@gmail.com` / `Admin@0265`
- **Behavior:** `localStorage.isDemo === 'true'` monkey-patches `apiClient` to return mock data

## Attack Classes
`Normal` | `BruteForce` | `Injection` | `DataExfil` | `Recon`

## Risk Threshold
- **ALERT_RISK_THRESHOLD = 7** — Events with risk ≥ 7 create alerts and trigger notifications
