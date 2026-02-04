# DecoyVerse User Flow - Complete Verification Guide

## Current User Flow Architecture

### Frontend Routes (React Router - `src/App.tsx`)
```
├── Public Routes (Accessible to all)
│   ├── / (Landing Page)
│   ├── /auth/login (PublicRoute - redirects to /dashboard if authenticated)
│   └── /auth/signup (PublicRoute - redirects to /dashboard if authenticated)
│
├── Onboarding Routes (Protected - requires authentication)
│   ├── /onboarding/subscription (Subscription page)
│   └── /onboarding/agent (Agent setup page)
│
├── Dashboard Routes (Protected - requires authentication)
│   ├── /dashboard (Main dashboard)
│   ├── /nodes (Nodes management)
│   ├── /decoys (Decoys management)
│   ├── /honeytokens (Honeytokens management)
│   ├── /logs (Logs viewer)
│   ├── /alerts (Alerts viewer)
│   ├── /ai-insights (AI Insights)
│   ├── /grafana (Grafana integration)
│   ├── /settings (User settings)
│   └── /configuration (System configuration)
│
└── Catch-all: * → / (Homepage)
```

### Backend Auth Endpoints (Express - `server/src/routes/auth.ts`)
```
POST   /api/auth/signup     - Register new user
POST   /api/auth/login      - Login user & get JWT token
GET    /api/auth/me         - Get current authenticated user (requires JWT)
POST   /api/auth/logout     - Logout user (optional)
```

---

## 🎯 EXPECTED USER FLOW (Ideal Journey)

### Step 1: Landing Page (Unauthenticated)
**URL**: `https://decoy-verse-v2.vercel.app/`
- User sees marketing page
- Can click "Get Started" → Redirects to `/auth/signup`

### Step 2: Signup (Unauthenticated)
**URL**: `https://decoy-verse-v2.vercel.app/auth/signup`
- User fills: Name, Email, Password
- **Backend Call**: `POST /api/auth/signup`
  - Request: `{ name, email, password }`
  - Response: `{ success: true, data: { user, token }, message }`
- Token & user stored in `localStorage`
- **Frontend Action**: Automatically redirects to → `/onboarding/subscription`

### Step 3: Subscription Selection (Authenticated)
**URL**: `https://decoy-verse-v2.vercel.app/onboarding/subscription`
- User selects pricing plan (Starter, Pro, Business)
- Mock payment processing (client-side delay)
- **Click Subscribe** → Redirects to `/onboarding/agent`

### Step 4: Agent Setup (Authenticated)
**URL**: `https://decoy-verse-v2.vercel.app/onboarding/agent`
- **On Load**:
  - Fetches nodes from FastAPI: `GET /nodes`
  - If no nodes exist: Creates a node `POST /nodes`
  - **Backend Calls**:
    - `GET /nodes` → Returns array of nodes
    - `POST /nodes` → Creates new node, returns `{ node_id, node_api_key, ... }`
- Displays API token for copying
- **Download Agent Config**:
  - `GET /nodes/{node_id}/agent-download`
  - Downloads `agent_config_{node_id}.json` file
- **Click Next/Continue** → Redirects to `/dashboard`

### Step 5: Dashboard (Authenticated)
**URL**: `https://decoy-verse-v2.vercel.app/dashboard`
- User sees main dashboard with:
  - Node statistics
  - Recent alerts
  - Activity charts
  - Sidebar navigation to all features

---

## 🔴 POTENTIAL MISMATCHES TO CHECK

### Issue 1: After Signup - Automatic Redirect Missing
**Problem**: After signup, user doesn't auto-redirect to `/onboarding/subscription`
**Root Cause**: Login/Signup success doesn't include redirect logic
**Fix Location**: `src/pages/Signup.tsx` → `handleSignup` function
```tsx
// After successful signup:
navigate('/onboarding/subscription');  // ← Should be here
```

### Issue 2: Login - Should Redirect to Dashboard or Onboarding?
**Current**: Login redirects to `/dashboard`
**Question**: Should returning users skip onboarding?
- ✅ YES (Current): User's first login → `/dashboard` directly
- ❌ NO: User's first login → `/onboarding/subscription` → `/onboarding/agent`

### Issue 3: After Agent Download - Next Steps Unclear
**Problem**: After agent setup, where should user go?
**Current**: Onboarding page doesn't have explicit "Done" button
**Fix**: Add button to `src/pages/Onboarding.tsx` to navigate to `/dashboard`

### Issue 4: PublicRoute Redirect Logic
**Current Implementation**:
```tsx
if (isAuthenticated && location.pathname.startsWith('/auth')) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
}
```
**Problem**: This redirects authenticated users from `/auth/login` → `/dashboard`
**Should It**: Also redirect from `/auth/signup` → `/onboarding/subscription` (first-time users)?

---

## ✅ VERIFICATION STEPS

### Test 1: Fresh Signup Flow (New User)
1. Clear browser localStorage and cookies
2. Navigate to `https://decoy-verse-v2.vercel.app`
3. Click "Get Started" → Should go to `/auth/signup`
4. Fill form (name, email, password) and submit
5. **Check 1**: Page redirects to `/onboarding/subscription`
   - ❌ **If NOT**: Need to add redirect in Signup.tsx
6. Select a plan and click "Subscribe"
7. **Check 2**: Page redirects to `/onboarding/agent`
   - ❌ **If NOT**: Check Subscription.tsx handleSubscribe
8. Page loads and creates a node
9. **Check 3**: Node data appears with node_id and API key
   - ❌ **If NOT**: Check FastAPI POST /nodes endpoint
10. Click "Download Agent Config"
11. **Check 4**: File downloads as `agent_config_{node_id}.json`
    - ❌ **If NOT (404 error)**: Check FastAPI route ordering (NOW FIXED)
12. Click "Continue to Dashboard"
13. **Check 5**: Page redirects to `/dashboard`
    - ❌ **If NOT**: Need to add redirect button in Onboarding.tsx

### Test 2: Login Flow (Returning User)
1. Clear browser localStorage
2. Sign up with new account (complete flow)
3. Logout or clear localStorage
4. Navigate to `https://decoy-verse-v2.vercel.app/auth/login`
5. Enter credentials and submit
6. **Check 1**: Backend validates at `POST /api/auth/login`
   - Expected response: `{ success: true, data: { user, token } }`
7. **Check 2**: Token & user stored in localStorage
8. **Check 3**: Page redirects to `/dashboard`
   - ❌ **If redirects elsewhere**: Check AuthContext.tsx login() function
9. **Check 4**: Dashboard loads without errors
   - ❌ **If 401 errors**: Check auth token is being sent in headers

### Test 3: Protected Routes Access
1. Clear localStorage (unauthenticated state)
2. Navigate directly to `https://decoy-verse-v2.vercel.app/dashboard`
3. **Check 1**: Should redirect to `/auth/login`
   - ✅ Confirm ProtectedRoute is working
4. Navigate to `https://decoy-verse-v2.vercel.app/onboarding/subscription`
5. **Check 2**: Should redirect to `/auth/login`
   - ✅ Confirm ProtectedRoute is working

### Test 4: Public Routes Redirect When Authenticated
1. Complete signup flow (you're now authenticated)
2. Navigate to `https://decoy-verse-v2.vercel.app/auth/login`
3. **Check 1**: Should redirect to `/dashboard`
   - ✅ PublicRoute redirects authenticated users
4. Navigate to `https://decoy-verse-v2.vercel.app/auth/signup`
5. **Check 2**: Should redirect to `/dashboard`
   - ✅ PublicRoute redirects authenticated users

### Test 5: API Response Formats
#### Test 5a: POST /api/auth/signup Response
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123"
  }'
```
**Expected Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "Test User",
      "email": "test@example.com",
      "role": "user",
      "createdAt": "..."
    },
    "token": "eyJhbGc..."
  }
}
```

#### Test 5b: POST /api/auth/login Response
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```
**Expected Response**: Same format as signup

#### Test 5c: GET /api/auth/me Response
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer {token}"
```
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Test User",
      "email": "test@example.com",
      "role": "user",
      "avatar": null,
      "createdAt": "...",
      "lastLogin": "..."
    }
  }
}
```

### Test 6: Node Creation & Agent Download
#### Test 6a: POST /nodes (Create Node)
```bash
curl -X POST https://ml-modle-v0-1.onrender.com/nodes \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test-Node"}'
```
**Expected Response**:
```json
{
  "node_id": "dcv_node_xxx",
  "name": "Test-Node",
  "node_api_key": "dcv_live_yyy",
  "user_id": "..."
}
```

#### Test 6b: GET /nodes (List Nodes)
```bash
curl -X GET https://ml-modle-v0-1.onrender.com/nodes \
  -H "Authorization: Bearer {token}"
```
**Expected Response**: Array of node objects

#### Test 6c: GET /nodes/{node_id}/agent-download
```bash
curl -X GET https://ml-modle-v0-1.onrender.com/nodes/dcv_node_xxx/agent-download \
  -H "Authorization: Bearer {token}"
```
**Expected Response**: JSON file (binary stream) with:
```json
{
  "node_id": "dcv_node_xxx",
  "node_api_key": "dcv_live_yyy",
  "node_name": "Test-Node",
  "backend_url": "https://ml-modle-v0-1.onrender.com/api",
  "ml_service_url": "https://ml-modle-v0-2.onrender.com"
}
```

---

## 🐛 KNOWN ISSUES & FIXES

### ✅ FIXED: FastAPI Route Ordering
**Issue**: GET /nodes/{node_id}/agent-download returned 404
**Root Cause**: /stats route defined after /{node_id} routes
**Fix Applied**: Moved /stats to appear before /{node_id} routes
**Status**: ✅ RESOLVED (Commit: `af6e0fc`)

### ⚠️ NEEDS FIX: Signup Auto-Redirect to Onboarding
**Issue**: After successful signup, user stays on signup page
**Current**: No redirect in handleSignup() function
**Fix Needed**: In `src/pages/Signup.tsx`, add:
```tsx
if (result.success) {
    navigate('/onboarding/subscription');
}
```

### ⚠️ NEEDS FIX: Onboarding Agent Download Complete Action
**Issue**: After downloading agent, no clear "Next" button
**Fix Needed**: In `src/pages/Onboarding.tsx`, add navigate button at bottom

### ⚠️ TO VERIFY: PublicRoute Behavior for First-Time Users
**Question**: Should first-time users completing signup go to:
- Option A: `/onboarding/subscription` (forced onboarding)
- Option B: `/dashboard` (skip onboarding, go straight to app)
**Decision Needed**: Clarify business logic

---

## 📊 Summary Table

| Flow Step | Page | URL | Protected? | Next URL | Status |
|-----------|------|-----|-----------|----------|--------|
| 1 | Landing | `/` | No | `/auth/signup` | ✅ OK |
| 2 | Signup | `/auth/signup` | No | `/onboarding/subscription` | ❌ NO AUTO-REDIRECT |
| 3 | Subscription | `/onboarding/subscription` | Yes | `/onboarding/agent` | ✅ OK |
| 4 | Agent Setup | `/onboarding/agent` | Yes | `/dashboard` | ❌ NO BUTTON |
| 5 | Dashboard | `/dashboard` | Yes | - | ✅ OK |

---

## 🔧 Debugging Commands

### Check localStorage (Browser DevTools)
```javascript
console.log(localStorage.getItem('token'));
console.log(JSON.parse(localStorage.getItem('user')));
```

### Check API Responses (Browser Network Tab)
1. Open DevTools → Network tab
2. Look for these requests:
   - `POST /api/auth/signup` or `POST /api/auth/login`
   - `GET /nodes`
   - `POST /nodes`
   - `GET /nodes/{id}/agent-download`

### Check for Errors in Console
```javascript
// See all errors:
console.error();  // Check console for errors

// Check auth state:
// (Note: You can access context via React DevTools if installed)
```

### Test Backend Directly
```bash
# From ML-modle v0 directory
cd backend
python -m uvicorn backend.main:app --reload

# Test from another terminal
curl http://localhost:8000/nodes
curl -X POST http://localhost:8000/nodes \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

---

## 📝 Next Steps

1. **Verify each test case** above and document findings
2. **Fix signup auto-redirect** if it's missing
3. **Add completion button** in onboarding agent page
4. **Clarify onboarding requirements** (required or optional?)
5. **Test full flow end-to-end** on deployed version
6. **Monitor browser console** for any errors during testing
