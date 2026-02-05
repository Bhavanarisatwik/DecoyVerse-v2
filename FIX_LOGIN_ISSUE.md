# Frontend Login Fix - Environment Variables

## Problem
Login is failing because the frontend cannot find the Express backend API.

## Root Cause
The frontend needs these environment variables to be set in Vercel:
- `VITE_EXPRESS_API_URL` → Points to Express auth server
- `VITE_FASTAPI_API_URL` → Points to FastAPI backend server

## Solution

### Step 1: Verify Local .env is Updated
✅ Already done - `.env` updated to use production URLs:
```
VITE_EXPRESS_API_URL=https://decoyverse-v2.onrender.com/api
VITE_FASTAPI_API_URL=https://ml-modle-v0-1.onrender.com
```

### Step 2: Set Environment Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Find your DecoyVerse-v2 project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_EXPRESS_API_URL` | `https://decoyverse-v2.onrender.com/api` | Production |
| `VITE_FASTAPI_API_URL` | `https://ml-modle-v0-1.onrender.com` | Production |

5. Click "Save"

### Step 3: Redeploy on Vercel

After adding env vars:
1. Go back to your Vercel project
2. Click **Deployments**
3. Find the latest deployment
4. Click **...** → **Redeploy**
5. Wait for build to complete

### Step 4: Test Login

1. Go to https://decoyverse-v2.vercel.app (or your Vercel URL)
2. Click Login
3. Try with test account:
   - Email: `test@example.com`
   - Password: `Test123!`

If login still fails, check browser console (F12) for error messages.

---

## Verification

To verify the frontend is using correct URLs, open browser console and check:
```javascript
// In browser console:
fetch('https://decoyverse-v2.onrender.com/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: 'test@example.com', password: 'Test123!'})
}).then(r => r.json()).then(d => console.log(d))
```

Should return either:
- `{token: "...", user: {...}}` ✅ Success
- `{error: "Invalid credentials"}` ✅ Auth working (wrong creds)
- Network error ❌ Express server not responding

---

## Current Deployment Status

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://decoyverse-v2.vercel.app | ✅ Deployed |
| **Express Backend** | https://decoyverse-v2.onrender.com | ✅ Deployed |
| **FastAPI Backend** | https://ml-modle-v0-1.onrender.com | ✅ Deployed |
| **Database** | MongoDB Atlas | ✅ Connected |

All services are running - just need to verify frontend env vars are set correctly in Vercel.
