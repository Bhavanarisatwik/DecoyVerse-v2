# DecoyVerse Deployment Guide

## Overview
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Railway/Render/Vercel Serverless
- **Database**: MongoDB Atlas (cloud)

---

## Prerequisites

1. **Vercel Account**: [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **GitHub Repository**: Push your code to GitHub

---

## Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user (username + password)
4. Add IP whitelist: `0.0.0.0/0` (allow all) for development
5. Get connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/decoyverse`

---

## Step 2: Deploy Backend (Option A - Railway)

### Using Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

5. Add Environment Variables in Railway:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/decoyverse
   JWT_SECRET=your_super_secret_jwt_key_here_change_this
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   NODE_ENV=production
   ```

6. Copy the Railway deployment URL (e.g., `https://your-app.railway.app`)

---

## Step 2: Deploy Backend (Option B - Render)

### Using Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: decoyverse-backend
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

5. Add Environment Variables (same as Railway)

6. Copy the Render URL (e.g., `https://your-app.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

### Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Update `.env` with production backend URL:
   ```bash
   # Create .env.production file
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

4. Deploy:
   ```bash
   vercel --prod
   ```

### Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

6. Click "Deploy"

---

## Step 4: Update vercel.json

Update the `vercel.json` file with your actual backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-actual-backend-url.railway.app/api/:path*"
    }
  ]
}
```

---

## Step 5: Configure CORS on Backend

Update `server/src/index.ts` to allow your Vercel domain:

```typescript
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://your-app.vercel.app',
        'https://your-custom-domain.com'
    ],
    credentials: true
}));
```

---

## Post-Deployment Checklist

- [ ] MongoDB Atlas database is accessible
- [ ] Backend is deployed and running
- [ ] Backend environment variables are set
- [ ] Frontend is deployed on Vercel
- [ ] Frontend environment variable `VITE_API_URL` points to backend
- [ ] CORS is configured on backend for Vercel domain
- [ ] Test signup/login flow
- [ ] Test all API endpoints

---

## Useful Commands

### Local Development
```bash
# Frontend
npm run dev

# Backend
cd server
npm run dev
```

### Production Build
```bash
# Frontend
npm run build
npm run preview

# Backend
cd server
npm run build
npm start
```

### Vercel Deployment
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Environment Variables Summary

### Frontend (.env or Vercel)
```
VITE_API_URL=https://your-backend-url.railway.app/api
```

### Backend (Railway/Render)
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/decoyverse
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
NODE_ENV=production
```

---

## Troubleshooting

### Issue: TypeScript build errors on Render/Railway
**Error**: `Cannot find name 'process'`, `Cannot find name 'console'`, type declaration errors

**Solution**: 
1. Ensure `@types/node`, `@types/express`, `@types/cors`, `@types/bcryptjs`, `@types/jsonwebtoken` are in `devDependencies`
2. Update `tsconfig.json` to include:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "types": ["node"]
     }
   }
   ```
3. Run `npm install` locally to update `package-lock.json`
4. Commit and push changes
5. Trigger new deployment on Render

### Issue: CORS errors
**Solution**: Add your Vercel domain to CORS whitelist in `server/src/index.ts`

### Issue: API not connecting
**Solution**: Check `VITE_API_URL` is correct and backend is running

### Issue: MongoDB connection failed
**Solution**: 
1. Check MongoDB Atlas IP whitelist (0.0.0.0/0)
2. Verify connection string format
3. Check database user credentials

### Issue: JWT errors
**Solution**: Ensure `JWT_SECRET` is set and matches between environments

---

## Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Add Custom Domain to Backend (Railway)
1. Go to your service settings in Railway
2. Click "Settings" → "Domains"
3. Add custom domain
4. Update DNS CNAME record

---

## Monitoring & Logs

- **Vercel Logs**: Dashboard → Your Project → Deployments → View Logs
- **Railway Logs**: Dashboard → Your Service → View Logs
- **MongoDB Logs**: Atlas Dashboard → Clusters → Metrics

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
