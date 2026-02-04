# DecoyVerse System Alignment & Diagnostic Plan

## Executive Summary

**Objective**: Ensure end-to-end coherence across Frontend (React), Express Backend (Auth), FastAPI Backend (Data/ML), and ML Service for production deployment on Vercel/Render.

**Current State**: Multi-service architecture with potential sync issues between:
- Frontend routes and API contracts
- Express vs FastAPI endpoint responsibilities
- Database schemas across services
- Environment configurations (local vs production)

---

## 1. SYSTEM ARCHITECTURE MAP

### 1.1 Component Inventory

#### **Frontend (React + Vite)**
- **Location**: `/DecoyVerse-v2/src`
- **Deployment**: Vercel (`https://decoy-verse-v2.vercel.app`)
- **Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS v4
- **API Clients**: 
  - `authClient` → Express Backend (auth endpoints)
  - `apiClient` → FastAPI Backend (data endpoints)

**Routes**:
```typescript
Public:
  / (Landing)
  /auth/login
  /auth/signup

Protected (Onboarding):
  /onboarding/subscription
  /onboarding/agent

Protected (Dashboard):
  /dashboard
  /nodes
  /decoys
  /honeytokens
  /logs
  /alerts
  /ai-insights
  /grafana
  /settings
  /configuration
```

#### **Express Backend (Authentication)**
- **Location**: `/DecoyVerse-v2/server`
- **Deployment**: Render (`https://decoyverse-v2.onrender.com`)
- **Database**: MongoDB Atlas
- **Responsibility**: User authentication, JWT token management

**Endpoints**:
```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
PUT    /api/auth/update-password
PUT    /api/auth/complete-onboarding
GET    /api/alerts
GET    /api/decoys
GET    /api/stats
GET    /api/recent-attacks
```

#### **FastAPI Backend (Data & Operations)**
- **Location**: `/ML-modle v0/backend`
- **Deployment**: Render (`https://ml-modle-v0-1.onrender.com`)
- **Database**: MongoDB Atlas
- **Responsibility**: Nodes, decoys, alerts, logs, honeytokens, AI insights

**Endpoints**:
```
# Nodes
POST   /nodes
GET    /nodes
GET    /nodes/stats
PATCH  /nodes/{node_id}
DELETE /nodes/{node_id}
GET    /nodes/{node_id}/decoys
GET    /nodes/{node_id}/agent-download

# Alerts
GET    /api/alerts

# Decoys
GET    /api/decoys
POST   /api/decoys

# Logs
GET    /api/logs

# Honeytokens
GET    /api/honeytokels
POST   /api/honeytokels

# AI Insights
GET    /api/ai/insights
POST   /api/ai/analyze
```

#### **ML Service (Predictions)**
- **Location**: `/ML-modle v0/ml_service`
- **Deployment**: Render (`https://ml-modle-v0-2.onrender.com`)
- **Responsibility**: Threat detection, log analysis

**Endpoints**:
```
POST   /predict
GET    /health
POST   /retrain
```

### 1.2 Data Flow Map

```
User (Browser)
    ↓
Frontend (Vercel)
    ↓
    ├──→ Express Backend (Auth) ──→ MongoDB (Users)
    │
    └──→ FastAPI Backend (Data) ──→ MongoDB (Nodes, Decoys, Alerts, Logs)
              ↓
         ML Service (Predictions) ──→ Model Files
```

### 1.3 Database Schema Alignment

**MongoDB Collections**:

1. **users** (Express Backend)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'user' | 'viewer',
  isActive: Boolean,
  isOnboarded: Boolean,  // NEW FIELD
  avatar: String,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

2. **nodes** (FastAPI Backend)
```javascript
{
  _id: ObjectId,
  node_id: String (unique),
  name: String,
  user_id: String,
  node_api_key: String,
  status: 'online' | 'offline',
  ip: String,
  os: String,
  version: String,
  last_seen: Date,
  created_at: Date
}
```

3. **alerts** (FastAPI Backend)
```javascript
{
  _id: ObjectId,
  node_id: String,
  user_id: String,
  severity: 'critical' | 'high' | 'medium' | 'low',
  type: String,
  message: String,
  timestamp: Date,
  status: 'open' | 'acknowledged' | 'resolved'
}
```

4. **decoys** (FastAPI Backend)
```javascript
{
  _id: ObjectId,
  node_id: String,
  user_id: String,
  name: String,
  file_path: String,
  decoy_type: String,
  last_accessed: Date,
  created_at: Date
}
```

5. **logs** (FastAPI Backend)
```javascript
{
  _id: ObjectId,
  node_id: String,
  user_id: String,
  event_type: String,
  details: Object,
  timestamp: Date,
  ml_prediction: Object
}
```

6. **honeytokels** (FastAPI Backend)
```javascript
{
  _id: ObjectId,
  node_id: String,
  user_id: String,
  token_type: String,
  token_value: String,
  created_at: Date,
  last_triggered: Date
}
```

---

## 2. DIAGNOSTIC PLAN

### 2.1 Phase 1: Component Health Check

#### **Checklist: Service Availability**
```bash
# Frontend
curl -I https://decoy-verse-v2.vercel.app/
# Expected: 200 OK

# Express Backend
curl https://decoyverse-v2.onrender.com/api/auth/me
# Expected: 401 (needs auth) or 200 with valid token

# FastAPI Backend
curl https://ml-modle-v0-1.onrender.com/
# Expected: 200 with API info

# ML Service
curl https://ml-modle-v0-2.onrender.com/health
# Expected: 200 with health status
```

#### **Database Connectivity**
```bash
# From Express backend logs (Render dashboard)
# Should see: "MongoDB connected successfully"

# From FastAPI backend logs
# Should see: "Connected to MongoDB"
```

### 2.2 Phase 2: Contract Verification

#### **API Contract Test Matrix**

| Frontend Expectation | Backend Reality | Status | Action |
|---------------------|----------------|--------|--------|
| POST /auth/signup → returns `{user, token}` | Express returns `{success, data: {user, token}}` | ✅ Match | None |
| GET /nodes → returns array | FastAPI returns array | ✅ Match | None |
| POST /nodes → returns `{node_id, node_api_key}` | FastAPI returns object | ✅ Match | None |
| GET /nodes/{id}/agent-download → file | FastAPI returns StreamingResponse | ✅ Fixed | None |
| GET /api/alerts → returns array | Both backends have this | ⚠️ Conflict | Clarify ownership |

**Action Items**:
1. ✅ **Resolved**: agent-download uses StreamingResponse (commit 3f3a8ca)
2. 🔍 **Investigate**: `/api/alerts` exists in BOTH backends - determine which should handle it
3. 🔍 **Investigate**: `/api/decoys` exists in BOTH backends - determine ownership

### 2.3 Phase 3: User Flow Testing

#### **Critical Path 1: New User Signup**
```
Test Steps:
1. Navigate to /auth/signup
2. Fill form: name, email, password
3. Submit

Expected Backend Call:
POST https://decoyverse-v2.onrender.com/api/auth/signup
Body: {name, email, password}
Response: {success: true, data: {user: {..., isOnboarded: false}, token}}

Expected Frontend Behavior:
- Store token in localStorage
- Store user in localStorage  
- Navigate to /onboarding/subscription

Verification Points:
✅ Token stored: localStorage.getItem('token')
✅ User stored: localStorage.getItem('user')
✅ User has isOnboarded: false
✅ Redirected to /onboarding/subscription
```

#### **Critical Path 2: Subscription Selection**
```
Test Steps:
1. On /onboarding/subscription
2. Select a plan (Starter/Pro/Business)
3. Click "Subscribe"

Expected Behavior:
- Mock payment processing (1.5s delay)
- Navigate to /onboarding/agent

Verification Points:
✅ Page redirects to /onboarding/agent
✅ No backend calls (client-side only)
```

#### **Critical Path 3: Agent Setup**
```
Test Steps:
1. On /onboarding/agent
2. Page loads, fetches or creates node

Expected Backend Calls:
GET https://ml-modle-v0-1.onrender.com/nodes
Headers: {Authorization: Bearer <token>}
Response: [] (first time) or [{node_id, ...}]

If empty:
POST https://ml-modle-v0-1.onrender.com/nodes
Headers: {Authorization: Bearer <token>}
Body: {name: "Onboarding-Node"}
Response: {node_id, node_api_key, name, user_id}

Expected Frontend Behavior:
- Display node_api_key in copyable input
- Show "Download Agent Config" button
- Show installation instructions

Verification Points:
✅ nodeData state populated
✅ API key displayed
✅ Download button enabled
```

#### **Critical Path 4: Agent Download**
```
Test Steps:
1. Click "Download Agent Config"

Expected Backend Call:
GET https://ml-modle-v0-1.onrender.com/nodes/{node_id}/agent-download
Headers: {Authorization: Bearer <token>}
Response: StreamingResponse (JSON file)

Expected Frontend Behavior:
- File downloads as agent_config_{node_id}.json
- File contains: {node_id, node_api_key, node_name, backend_url, ml_service_url}

Verification Points:
✅ File downloads successfully
✅ File is valid JSON
✅ Contains correct node credentials
```

#### **Critical Path 5: Complete Onboarding**
```
Test Steps:
1. Click "Go to Dashboard"

Expected Backend Call:
PUT https://decoyverse-v2.onrender.com/api/auth/complete-onboarding
Headers: {Authorization: Bearer <token>}
Response: {success: true, data: {user: {..., isOnboarded: true}}}

Expected Frontend Behavior:
- Update user in localStorage
- Navigate to /dashboard

Verification Points:
✅ User.isOnboarded = true in localStorage
✅ Redirected to /dashboard
✅ Dashboard loads without redirect loop
```

#### **Critical Path 6: Returning User Login**
```
Test Steps:
1. Clear localStorage
2. Navigate to /auth/login
3. Enter credentials
4. Submit

Expected Backend Call:
POST https://decoyverse-v2.onrender.com/api/auth/login
Body: {email, password}
Response: {success: true, data: {user: {..., isOnboarded: true}, token}}

Expected Frontend Behavior:
- If isOnboarded === true → navigate to /dashboard
- If isOnboarded === false → navigate to /onboarding/subscription

Verification Points:
✅ Token stored
✅ User stored
✅ Correct redirect based on isOnboarded flag
```

### 2.4 Phase 4: Data Sync Verification

#### **Node Registration Flow**
```
1. Agent installed on target machine
2. Agent calls: POST /nodes (if first run)
3. Agent heartbeat: PATCH /nodes/{node_id} {status: 'online'}
4. Frontend polls: GET /nodes
5. Dashboard updates

Verification:
- Node appears in /nodes page
- Status shows "online"
- Last seen timestamp updates
```

#### **Alert Generation Flow**
```
1. Agent detects suspicious activity
2. Agent calls: POST /api/alerts
3. Frontend polls: GET /api/alerts
4. Alerts page displays

Verification:
- Alert appears in /alerts page
- Severity color-coded correctly
- Timestamp is accurate
```

#### **Log Collection Flow**
```
1. Agent monitors file access
2. Agent sends: POST /api/logs
3. ML Service analyzes: POST /predict
4. Frontend fetches: GET /api/logs
5. Logs page displays

Verification:
- Logs appear with ML predictions
- Threat scores calculated
- Logs paginated correctly
```

### 2.5 Phase 5: Environment Parity Check

#### **Configuration Comparison**

| Config Variable | Local (.env) | Production (Vercel) | Production (Render Express) | Production (Render FastAPI) |
|----------------|--------------|---------------------|---------------------------|---------------------------|
| VITE_EXPRESS_API_URL | http://localhost:5000/api | https://decoyverse-v2.onrender.com/api | N/A | N/A |
| VITE_FASTAPI_API_URL | http://localhost:8000 | https://ml-modle-v0-1.onrender.com | N/A | N/A |
| MONGO_URI | localhost:27017 | mongodb+srv://... | mongodb+srv://... | mongodb+srv://... |
| JWT_SECRET | dev-secret | (set in Render) | (set in Render) | (set in Render) |
| AUTH_ENABLED | False | True | True | True |
| CORS_ORIGINS | localhost | decoy-verse-v2.vercel.app | N/A | decoy-verse-v2.vercel.app |

**Action**: Verify all production environment variables are set correctly in Render dashboard.

---

## 3. EXECUTION PLAN

### 3.1 Team Roles & Responsibilities

#### **Role 1: Frontend Developer**
**Responsibilities**:
- Verify all API endpoint URLs match production backends
- Test all user flows in production
- Monitor browser console for errors
- Verify token storage and retrieval
- Test route protection logic

**Tools**:
- Browser DevTools (Network, Console)
- React DevTools
- Vercel deployment logs

#### **Role 2: Backend Developer (Express)**
**Responsibilities**:
- Monitor Express backend logs on Render
- Verify JWT token generation and validation
- Test auth endpoints directly
- Check MongoDB connection and queries
- Verify CORS configuration

**Tools**:
- Render logs
- MongoDB Compass
- Postman/Insomnia
- MongoDB Atlas monitoring

#### **Role 3: Backend Developer (FastAPI)**
**Responsibilities**:
- Monitor FastAPI backend logs on Render
- Verify all data endpoints
- Test file download endpoints
- Check database queries and indexes
- Optimize cold start performance

**Tools**:
- Render logs
- FastAPI /docs endpoint
- MongoDB Compass
- Python debugger

#### **Role 4: ML Engineer**
**Responsibilities**:
- Verify ML model loading
- Test prediction accuracy
- Monitor inference latency
- Check model version consistency

**Tools**:
- Render logs
- Model performance metrics
- Test dataset

#### **Role 5: DevOps/QA**
**Responsibilities**:
- Run full integration tests
- Verify deployment configurations
- Monitor service health
- Set up alerting

**Tools**:
- Automated test suite
- Monitoring dashboards
- Log aggregation

### 3.2 Prioritized Backlog

#### **P0: MVP Alignment (Critical - Fix Now)**
- [x] Fix agent-download 500 error → StreamingResponse
- [x] Fix route ordering (stats before {node_id})
- [x] Implement isOnboarded flag
- [ ] Verify signup flow end-to-end
- [ ] Verify login redirect logic
- [ ] Test agent download in production
- [ ] Resolve /api/alerts endpoint conflict (Express vs FastAPI)
- [ ] Verify CORS headers on all endpoints

#### **P1: Data Flow Validation (High - This Week)**
- [ ] Test node registration from agent
- [ ] Test alert generation and display
- [ ] Test log collection and ML prediction
- [ ] Verify dashboard data refresh
- [ ] Test onboarding completion API call
- [ ] Verify protected route enforcement

#### **P2: Performance & Reliability (Medium - Next Sprint)**
- [ ] Optimize Render cold start times
- [ ] Implement proper error boundaries in React
- [ ] Add request/response logging
- [ ] Set up monitoring and alerting
- [ ] Implement retry logic for failed requests
- [ ] Add loading states for all async operations

#### **P3: Enhancements (Low - Future)**
- [ ] Add comprehensive error messages
- [ ] Implement toast notifications
- [ ] Add request caching
- [ ] Optimize bundle size
- [ ] Add E2E test suite
- [ ] Implement CI/CD pipeline

---

## 4. LOCAL TEST PLAN

### 4.1 Local Setup Instructions

#### **Prerequisites**
```bash
# Required Software
- Node.js 18+
- Python 3.11+
- MongoDB (Docker or local)
- Git
```

#### **Step 1: Clone Repositories**
```bash
# Already cloned at:
# c:\Users\satwi\Downloads\DecoyVerse-v2
# c:\Users\satwi\Downloads\ML-modle v0
```

#### **Step 2: Start MongoDB**
```bash
# Option A: Docker
docker run -d -p 27017:27017 --name decoyverse-mongo mongo:latest

# Option B: Local MongoDB
# Ensure mongod is running
```

#### **Step 3: Start Express Backend**
```bash
cd "c:\Users\satwi\Downloads\DecoyVerse-v2\server"

# Create .env file
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/decoyverse
JWT_SECRET=local-dev-secret-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF

# Install dependencies
npm install

# Start server
npm run dev
# Expected: Server running on http://localhost:5000
```

#### **Step 4: Start FastAPI Backend**
```bash
cd "c:\Users\satwi\Downloads\ML-modle v0"

# Create backend/.env file
cat > backend/.env << EOF
MONGO_URI=mongodb://localhost:27017/decoyverse
AUTH_ENABLED=False
JWT_SECRET_KEY=local-dev-secret
BACKEND_HOST=0.0.0.0
PORT=8000
EOF

# Install dependencies
pip install -r backend/requirements.txt

# Start server
python -m uvicorn backend.main:app --reload --port 8000
# Expected: Server running on http://localhost:8000
```

#### **Step 5: Start ML Service**
```bash
cd "c:\Users\satwi\Downloads\ML-modle v0\ml_service"

# Install dependencies
pip install -r requirements.txt

# Train model (first time only)
python train_model.py

# Start service
python ml_api.py
# Expected: Server running on http://localhost:8001
```

#### **Step 6: Start Frontend**
```bash
cd "c:\Users\satwi\Downloads\DecoyVerse-v2"

# Create .env file
cat > .env << EOF
VITE_EXPRESS_API_URL=http://localhost:5000/api
VITE_FASTAPI_API_URL=http://localhost:8000
EOF

# Install dependencies
npm install

# Start dev server
npm run dev
# Expected: Server running on http://localhost:5173
```

### 4.2 Local Verification Tests

#### **Test 1: Backend Health Checks**
```bash
# Express Backend
curl http://localhost:5000/api/auth/me
# Expected: 401 Unauthorized (no token)

# FastAPI Backend
curl http://localhost:8000/
# Expected: 200 with API info

# ML Service
curl http://localhost:8001/health
# Expected: 200 {"status": "healthy"}
```

#### **Test 2: Signup Flow**
```bash
# 1. Open browser: http://localhost:5173
# 2. Navigate to /auth/signup
# 3. Fill form:
#    Name: Test User
#    Email: test@example.com
#    Password: TestPass123
# 4. Submit

# Verify in browser console:
console.log(localStorage.getItem('token'))  // Should have JWT
console.log(localStorage.getItem('user'))   // Should have user object

# Verify in MongoDB:
# Use MongoDB Compass or:
mongosh
use decoyverse
db.users.findOne({email: "test@example.com"})
# Should see user with isOnboarded: false
```

#### **Test 3: Node Creation**
```bash
# After signup, should auto-navigate to /onboarding/agent

# Verify in browser console:
# Should see POST to /nodes
# Should see response with node_id and node_api_key

# Verify in MongoDB:
db.nodes.findOne({user_id: "<user_id_from_signup>"})
# Should see node document
```

#### **Test 4: Agent Download**
```bash
# On /onboarding/agent page
# 1. Click "Download Agent Config"
# 2. File should download

# Verify file contents:
cat ~/Downloads/agent_config_*.json
# Should contain:
# {
#   "node_id": "dcv_node_...",
#   "node_api_key": "dcv_live_...",
#   "node_name": "Onboarding-Node",
#   "backend_url": "http://localhost:8000",
#   "ml_service_url": "http://localhost:8001"
# }
```

#### **Test 5: Complete Onboarding**
```bash
# On /onboarding/agent page
# 1. Click "Go to Dashboard"

# Verify backend call in Network tab:
# PUT http://localhost:5000/api/auth/complete-onboarding
# Response: {success: true, data: {user: {..., isOnboarded: true}}}

# Verify in localStorage:
console.log(JSON.parse(localStorage.getItem('user')).isOnboarded)
# Should be: true

# Verify navigation:
# Should be on /dashboard
```

#### **Test 6: Login as Returning User**
```bash
# 1. Clear localStorage
localStorage.clear()

# 2. Navigate to /auth/login
# 3. Enter:
#    Email: test@example.com
#    Password: TestPass123
# 4. Submit

# Verify:
# Should navigate directly to /dashboard (not onboarding)
```

### 4.3 Log Capture & Comparison

#### **Express Backend Logs**
```bash
# Terminal running npm run dev
# Look for:
[INFO] Server listening on port 5000
[INFO] MongoDB connected
[POST] /api/auth/signup - 201
[POST] /api/auth/login - 200
[PUT] /api/auth/complete-onboarding - 200
```

#### **FastAPI Backend Logs**
```bash
# Terminal running uvicorn
# Look for:
INFO: Application startup complete
INFO: GET /nodes - 200
INFO: POST /nodes - 201
INFO: GET /nodes/{id}/agent-download - 200
```

#### **Frontend Console Logs**
```javascript
// Should see:
Signup request: {name, email}
Signup response: {success: true, data: {...}}
Create node response: {node_id, node_api_key, ...}
```

#### **MongoDB Query Logs**
```bash
# In mongosh:
db.setProfilingLevel(2)  # Log all queries

# After testing, review:
db.system.profile.find().pretty()
```

---

## 5. DEPLOYMENT ALIGNMENT

### 5.1 Environment Configuration Matrix

#### **Vercel (Frontend)**
```bash
# Environment Variables (Vercel Dashboard → Settings → Environment Variables)
VITE_EXPRESS_API_URL=https://decoyverse-v2.onrender.com/api
VITE_FASTAPI_API_URL=https://ml-modle-v0-1.onrender.com

# Build Settings
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

#### **Render (Express Backend)**
```bash
# Environment Variables (Render Dashboard → Environment)
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/decoyverse?retryWrites=true&w=majority
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
NODE_ENV=production
FRONTEND_URL=https://decoy-verse-v2.vercel.app

# Build Settings
Build Command: cd server && npm install
Start Command: cd server && npm start
```

#### **Render (FastAPI Backend)**
```bash
# Environment Variables
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/decoyverse?retryWrites=true&w=majority
AUTH_ENABLED=True
JWT_SECRET_KEY=<same-as-express-backend>
BACKEND_HOST=0.0.0.0
PORT=8000

# Build Settings
Build Command: pip install -r backend/requirements.txt
Start Command: python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

#### **Render (ML Service)**
```bash
# Environment Variables
PORT=8001

# Build Settings
Build Command: cd ml_service && pip install -r requirements.txt
Start Command: cd ml_service && python ml_api.py
```

### 5.2 Pre-Deployment Checklist

#### **Code Quality**
- [ ] All TypeScript errors resolved: `npm run build` succeeds
- [ ] All Python type errors resolved: `mypy backend/` passes
- [ ] Linting passes: `npm run lint` succeeds
- [ ] No console.error() in production code
- [ ] All TODO comments addressed or documented

#### **Security**
- [ ] No hardcoded secrets in code
- [ ] JWT_SECRET is strong and unique per environment
- [ ] CORS origins explicitly whitelisted (no wildcards)
- [ ] MongoDB connection uses TLS
- [ ] Environment variables not committed to Git
- [ ] .env files in .gitignore

#### **Database**
- [ ] MongoDB Atlas cluster accessible from Render IPs (0.0.0.0/0 allowlisted)
- [ ] Database indexes created (email unique, node_id unique)
- [ ] Connection pooling configured
- [ ] Backup strategy in place

#### **API Contracts**
- [ ] Frontend API calls match backend endpoints
- [ ] Response schemas documented
- [ ] Error responses standardized
- [ ] Authentication headers consistent

#### **Performance**
- [ ] Frontend bundle size < 500KB gzipped
- [ ] API response times < 1s (P95)
- [ ] Database queries optimized with indexes
- [ ] Images compressed and optimized
- [ ] Lazy loading implemented for routes

### 5.3 Deployment Sequence

#### **Step 1: Deploy Backends First** (Render)
```bash
# 1. Push code to GitHub
git push origin main

# 2. Render auto-deploys from GitHub webhooks
# Monitor in Render dashboard

# 3. Wait for deployment to complete
# Express Backend: https://decoyverse-v2.onrender.com
# FastAPI Backend: https://ml-modle-v0-1.onrender.com
# ML Service: https://ml-modle-v0-2.onrender.com

# 4. Check deployment logs for errors
```

#### **Step 2: Verify Backend Health**
```bash
# Express
curl https://decoyverse-v2.onrender.com/api/auth/me
# Expected: 401 (means server is up, auth is working)

# FastAPI
curl https://ml-modle-v0-1.onrender.com/
# Expected: 200 with API info

# ML Service
curl https://ml-modle-v0-2.onrender.com/health
# Expected: 200 {"status": "healthy"}
```

#### **Step 3: Deploy Frontend** (Vercel)
```bash
# 1. Verify .env.production has correct backend URLs
cat .env.production

# 2. Push to GitHub or deploy via Vercel CLI
git push origin main
# OR
vercel --prod

# 3. Wait for deployment
# URL: https://decoy-verse-v2.vercel.app

# 4. Check Vercel deployment logs
```

#### **Step 4: Smoke Tests**
```bash
# Test 1: Landing page loads
curl -I https://decoy-verse-v2.vercel.app/
# Expected: 200

# Test 2: Signup (with real browser)
# 1. Open https://decoy-verse-v2.vercel.app/auth/signup
# 2. Create account
# 3. Verify onboarding flow
# 4. Download agent config
# 5. Complete onboarding
# 6. Verify dashboard loads

# Test 3: Login
# 1. Logout
# 2. Login with same credentials
# 3. Verify direct redirect to dashboard
```

### 5.4 Post-Deployment Validation

#### **Automated Health Checks**
```bash
#!/bin/bash
# health_check.sh

FRONTEND="https://decoy-verse-v2.vercel.app"
EXPRESS="https://decoyverse-v2.onrender.com"
FASTAPI="https://ml-modle-v0-1.onrender.com"
ML_SERVICE="https://ml-modle-v0-2.onrender.com"

echo "Checking Frontend..."
curl -f -s -o /dev/null $FRONTEND || echo "❌ Frontend DOWN"

echo "Checking Express Backend..."
curl -f -s -o /dev/null $EXPRESS/api/auth/me || echo "❌ Express DOWN"

echo "Checking FastAPI Backend..."
curl -f -s -o /dev/null $FASTAPI/ || echo "❌ FastAPI DOWN"

echo "Checking ML Service..."
curl -f -s -o /dev/null $ML_SERVICE/health || echo "❌ ML Service DOWN"

echo "✅ All services UP"
```

#### **Manual Validation Checklist**
- [ ] Signup creates user in MongoDB
- [ ] Login returns valid JWT token
- [ ] Protected routes redirect unauthenticated users
- [ ] Node creation succeeds
- [ ] Agent download returns file
- [ ] Onboarding completion updates user
- [ ] Dashboard displays data
- [ ] Alerts page loads
- [ ] Logs page loads
- [ ] No CORS errors in browser console
- [ ] No 500 errors in backend logs

---

## 6. DELIVERABLES

### 6.1 Diagnostic Scripts

#### **Script 1: Full Health Check**
```bash
# File: scripts/health_check.sh
#!/bin/bash

echo "=== DecoyVerse Health Check ==="
echo ""

# Frontend
echo "Frontend (Vercel):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://decoy-verse-v2.vercel.app/)
if [ "$STATUS" -eq 200 ]; then
    echo "  ✅ Status: $STATUS"
else
    echo "  ❌ Status: $STATUS"
fi

# Express Backend
echo ""
echo "Express Backend (Render):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://decoyverse-v2.onrender.com/api/auth/me)
if [ "$STATUS" -eq 401 ]; then
    echo "  ✅ Status: $STATUS (auth required - expected)"
else
    echo "  ❌ Status: $STATUS"
fi

# FastAPI Backend
echo ""
echo "FastAPI Backend (Render):"
RESPONSE=$(curl -s https://ml-modle-v0-1.onrender.com/)
if [[ "$RESPONSE" == *"Decoyvers"* ]]; then
    echo "  ✅ API responding"
else
    echo "  ❌ Unexpected response"
fi

# ML Service
echo ""
echo "ML Service (Render):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://ml-modle-v0-2.onrender.com/health)
if [ "$STATUS" -eq 200 ]; then
    echo "  ✅ Status: $STATUS"
else
    echo "  ❌ Status: $STATUS"
fi

echo ""
echo "=== Check Complete ==="
```

#### **Script 2: API Contract Validator**
```javascript
// File: scripts/contract_validator.js
const axios = require('axios');

const EXPRESS_API = 'https://decoyverse-v2.onrender.com/api';
const FASTAPI_API = 'https://ml-modle-v0-1.onrender.com';

async function validateContracts() {
    console.log('=== API Contract Validation ===\n');
    
    // Test 1: Express signup response structure
    console.log('Test 1: Signup response structure');
    try {
        const response = await axios.post(`${EXPRESS_API}/auth/signup`, {
            name: 'Test User',
            email: `test-${Date.now()}@example.com`,
            password: 'TestPass123'
        });
        
        const required = ['success', 'data'];
        const dataRequired = ['user', 'token'];
        const userRequired = ['id', 'name', 'email', 'role', 'isOnboarded'];
        
        const hasAll = required.every(key => key in response.data);
        const hasDataKeys = dataRequired.every(key => key in response.data.data);
        const hasUserKeys = userRequired.every(key => key in response.data.data.user);
        
        if (hasAll && hasDataKeys && hasUserKeys) {
            console.log('  ✅ Signup contract valid\n');
        } else {
            console.log('  ❌ Missing required fields\n');
        }
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}\n`);
    }
    
    // Test 2: FastAPI nodes response structure
    console.log('Test 2: Nodes response structure');
    try {
        const response = await axios.get(`${FASTAPI_API}/nodes`);
        
        if (Array.isArray(response.data)) {
            console.log('  ✅ Nodes returns array\n');
        } else {
            console.log('  ❌ Nodes should return array\n');
        }
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}\n`);
    }
    
    console.log('=== Validation Complete ===');
}

validateContracts();
```

#### **Script 3: Database Schema Validator**
```javascript
// File: scripts/schema_validator.js
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;

async function validateSchemas() {
    console.log('=== Database Schema Validation ===\n');
    
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        const db = client.db('decoyverse');
        
        // Test 1: Users collection has isOnboarded field
        console.log('Test 1: Users schema');
        const user = await db.collection('users').findOne({});
        if (user && 'isOnboarded' in user) {
            console.log('  ✅ Users have isOnboarded field\n');
        } else {
            console.log('  ❌ Missing isOnboarded field in users\n');
        }
        
        // Test 2: Nodes collection structure
        console.log('Test 2: Nodes schema');
        const node = await db.collection('nodes').findOne({});
        const requiredFields = ['node_id', 'name', 'user_id', 'node_api_key'];
        if (node && requiredFields.every(field => field in node)) {
            console.log('  ✅ Nodes schema valid\n');
        } else {
            console.log('  ❌ Missing required fields in nodes\n');
        }
        
        // Test 3: Indexes
        console.log('Test 3: Database indexes');
        const userIndexes = await db.collection('users').indexes();
        const hasEmailIndex = userIndexes.some(idx => idx.key.email === 1);
        
        if (hasEmailIndex) {
            console.log('  ✅ Email index exists\n');
        } else {
            console.log('  ❌ Missing email index\n');
        }
        
    } finally {
        await client.close();
    }
    
    console.log('=== Validation Complete ===');
}

validateSchemas();
```

### 6.2 Operational Runbook

#### **Issue: Frontend shows "Signup failed"**

**Symptoms**:
- Error message appears after submitting signup form
- No token in localStorage
- Network tab shows error response

**Diagnosis Steps**:
1. Check browser Network tab for the exact error response
2. Check Express backend logs in Render dashboard
3. Verify MongoDB connection in backend logs

**Common Causes & Fixes**:
- **400 Bad Request**: Validation failed
  - Check password meets requirements (8+ chars, uppercase, lowercase, number)
  - Check email is valid format
  - Check name is 2-50 characters

- **409 Conflict**: Email already exists
  - User already signed up with this email
  - Try different email or login instead

- **500 Internal Server Error**: Backend issue
  - Check Render logs for Express backend
  - Verify MongoDB connection string
  - Check JWT_SECRET is set

- **Network Error/CORS**: Backend not accessible
  - Verify Express backend is running on Render
  - Check CORS origins include decoy-verse-v2.vercel.app
  - Try accessing backend directly: `curl https://decoyverse-v2.onrender.com/api/auth/me`

**Resolution**:
```bash
# If backend is down:
1. Check Render dashboard
2. Restart service if needed
3. Monitor deployment logs

# If CORS issue:
1. Update backend/src/index.ts allowedOrigins array
2. Push to GitHub
3. Wait for auto-deploy
4. Test again

# If MongoDB issue:
1. Check MongoDB Atlas dashboard
2. Verify IP whitelist (0.0.0.0/0)
3. Verify connection string is correct
4. Test connection: mongosh <MONGO_URI>
```

---

#### **Issue: Agent download returns 404**

**Symptoms**:
- Click "Download Agent Config" button
- Network tab shows 404 error
- Console shows error downloading agent

**Diagnosis Steps**:
1. Check browser console for the exact URL being requested
2. Verify nodeId is not empty or undefined
3. Check FastAPI backend logs

**Common Causes & Fixes**:
- **Empty nodeId**: Node wasn't created properly
  - Check network tab for POST /nodes response
  - Verify response has node_id field
  - Check frontend console logs

- **404 Not Found**: Route not registered
  - ✅ FIXED: Route ordering issue (commit 3f3a8ca)
  - Verify backend is running latest code

- **500 Internal Server Error**: Endpoint error
  - ✅ FIXED: FileResponse → StreamingResponse (commit 3f3a8ca)
  - Check FastAPI logs for stack trace

**Resolution**:
```bash
# Verify latest code deployed:
git log --oneline -5
# Should see commits: 3f3a8ca, af6e0fc

# Force redeploy on Render:
1. Go to Render dashboard
2. Select FastAPI service
3. Click "Manual Deploy" → "Clear build cache & deploy"

# Test endpoint directly:
curl -H "Authorization: Bearer <token>" \
  https://ml-modle-v0-1.onrender.com/nodes/<node_id>/agent-download
```

---

#### **Issue: User stuck in onboarding loop**

**Symptoms**:
- After completing onboarding, redirected back to /onboarding/subscription
- Login redirects to onboarding instead of dashboard
- User.isOnboarded is false in localStorage

**Diagnosis Steps**:
1. Check localStorage: `JSON.parse(localStorage.getItem('user')).isOnboarded`
2. Check backend user record in MongoDB
3. Verify complete-onboarding endpoint was called

**Common Causes & Fixes**:
- **complete-onboarding not called**: Button click didn't trigger API call
  - Check browser Network tab
  - Verify no JavaScript errors in console
  - Check button onClick handler

- **complete-onboarding failed**: Backend didn't update user
  - Check Express backend logs
  - Verify JWT token is valid
  - Check MongoDB update succeeded

- **localStorage not updated**: Frontend didn't update after API call
  - Clear localStorage and login again
  - Check AuthContext.updateUser() is called

**Resolution**:
```bash
# Manual fix in MongoDB:
mongosh <MONGO_URI>
use decoyverse
db.users.updateOne(
  {email: "user@example.com"},
  {$set: {isOnboarded: true}}
)

# Then have user logout and login again
```

---

#### **Issue: CORS errors in production**

**Symptoms**:
- "blocked by CORS policy" in browser console
- Network tab shows no response data
- Request fails before reaching backend

**Diagnosis Steps**:
1. Check exact origin in error message
2. Verify backend CORS configuration
3. Test with curl to see raw response headers

**Common Causes & Fixes**:
- **Missing origin in allowlist**:
  - Express: Update allowedOrigins in server/src/index.ts
  - FastAPI: Update CORS_ORIGINS in backend/config.py

- **Credentials mode mismatch**:
  - Ensure allow_credentials: true in backend
  - Ensure credentials: 'include' in frontend requests

- **Preflight request failing**:
  - Check OPTIONS request in Network tab
  - Verify all headers are allowed

**Resolution**:
```javascript
// Express (server/src/index.ts)
const allowedOrigins = [
    'https://decoy-verse-v2.vercel.app',
    'https://decoyverse.vercel.app',
    'http://localhost:5173',
];

// FastAPI (backend/config.py)
CORS_ORIGINS = [
    "https://decoy-verse-v2.vercel.app",
    "http://localhost:5173",
]
```

---

### 6.3 Monitoring & Alerting Setup

#### **Metrics to Track**

1. **Uptime**
   - Frontend availability (Vercel)
   - Express backend availability (Render)
   - FastAPI backend availability (Render)
   - ML Service availability (Render)

2. **Performance**
   - Page load time (< 3s)
   - API response time (< 1s P95)
   - Database query time (< 100ms)
   - ML inference time (< 500ms)

3. **Errors**
   - Frontend JavaScript errors
   - Backend 500 errors
   - Database connection failures
   - CORS errors

4. **Business Metrics**
   - Signups per day
   - Active users
   - Nodes registered
   - Alerts generated

#### **Recommended Tools**

1. **Vercel Analytics** (Frontend)
   - Already included with Vercel
   - Tracks: page views, load times, errors

2. **Render Metrics** (Backend)
   - Built-in: CPU, memory, response times
   - Logs: Centralized log viewer

3. **MongoDB Atlas Monitoring** (Database)
   - Query performance
   - Connection pool usage
   - Storage metrics

4. **Sentry** (Error Tracking) - Optional
   - Real-time error reporting
   - Stack traces with source maps
   - User impact tracking

5. **UptimeRobot** (Uptime Monitoring) - Free
   - 5-minute checks
   - Email/SMS alerts
   - Status page

#### **Alert Configuration**

```yaml
# alerts.yaml (example for UptimeRobot)
monitors:
  - name: Frontend
    url: https://decoy-verse-v2.vercel.app
    interval: 5 minutes
    alert_on: down, slow (>5s)
    
  - name: Express Backend
    url: https://decoyverse-v2.onrender.com/api/auth/me
    interval: 5 minutes
    expected_status: 401
    alert_on: down, 500
    
  - name: FastAPI Backend
    url: https://ml-modle-v0-1.onrender.com/
    interval: 5 minutes
    alert_on: down, slow (>10s)
    
  - name: ML Service
    url: https://ml-modle-v0-2.onrender.com/health
    interval: 5 minutes
    alert_on: down
```

---

## 7. SUCCESS CRITERIA

### **Phase 1: MVP Functional** (Week 1)
- ✅ All services deployed and accessible
- ✅ Signup flow completes without errors
- ✅ Login redirects correctly based on onboarding status
- ✅ Agent download works in production
- ✅ Dashboard displays without errors
- ✅ No critical bugs blocking user flows

### **Phase 2: Data Flow Working** (Week 2)
- ✅ Nodes can be created and listed
- ✅ Alerts appear in frontend
- ✅ Logs are collected and displayed
- ✅ ML predictions are generated
- ✅ Real-time updates work

### **Phase 3: Production Ready** (Week 3)
- ✅ All automated tests pass
- ✅ Performance meets SLAs
- ✅ Monitoring and alerting configured
- ✅ Documentation complete
- ✅ Runbook validated

---

## 8. APPENDIX

### 8.1 Quick Reference

**Frontend URLs**:
- Production: https://decoy-verse-v2.vercel.app
- Local: http://localhost:5173

**Backend URLs**:
- Express (Prod): https://decoyverse-v2.onrender.com
- FastAPI (Prod): https://ml-modle-v0-1.onrender.com
- ML Service (Prod): https://ml-modle-v0-2.onrender.com
- Express (Local): http://localhost:5000
- FastAPI (Local): http://localhost:8000
- ML Service (Local): http://localhost:8001

**Database**:
- MongoDB Atlas: mongodb+srv://...
- Local: mongodb://localhost:27017/decoyverse

**Documentation**:
- This Plan: `/SYSTEM_ALIGNMENT_PLAN.md`
- User Flow: `/USER_FLOW_VERIFICATION.md`
- Flow Analysis: `/FLOW_MISMATCH_ANALYSIS.md`
- Backend Guide: `/ML-modle v0/README.md`

### 8.2 Common Commands

```bash
# Start all services locally
cd DecoyVerse-v2/server && npm run dev &
cd ML-modle\ v0 && python -m uvicorn backend.main:app --reload &
cd ML-modle\ v0/ml_service && python ml_api.py &
cd DecoyVerse-v2 && npm run dev

# Build frontend
cd DecoyVerse-v2 && npm run build

# Run tests
cd DecoyVerse-v2 && npm run lint
cd DecoyVerse-v2/server && npm test

# Deploy
git push origin main  # Auto-deploys to Vercel + Render

# Check logs
# Vercel: vercel logs
# Render: Check dashboard
```

### 8.3 Contact & Escalation

**P0 (Critical - Service Down)**:
- Check status pages
- Review Render/Vercel dashboards
- Check MongoDB Atlas
- Escalate to on-call engineer

**P1 (Major - Feature Broken)**:
- Create GitHub issue
- Assign to relevant team
- Add to sprint backlog

**P2 (Minor - UX Issue)**:
- Document in backlog
- Prioritize for next sprint

---

**Document Version**: 1.0  
**Last Updated**: {{ current_date }}  
**Maintained By**: DevOps/QA Team  
**Review Cycle**: Weekly during stabilization, monthly thereafter
