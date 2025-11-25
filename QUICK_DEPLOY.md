# Quick Deployment Steps

## 1. Setup MongoDB Atlas (5 minutes)
```
✓ Create free cluster at mongodb.com/cloud/atlas
✓ Create database user
✓ Add IP whitelist: 0.0.0.0/0
✓ Copy connection string
```

## 2. Deploy Backend to Railway (5 minutes)
```bash
# Go to railway.app
# New Project → Deploy from GitHub
# Root Directory: server
# Add Environment Variables:
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/decoyverse
JWT_SECRET=generate_random_secret_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# Copy Railway URL: https://your-app.railway.app
```

## 3. Deploy Frontend to Vercel (3 minutes)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Or use Vercel Dashboard:
# 1. Import GitHub repo
# 2. Add env: VITE_API_URL=https://your-app.railway.app/api
# 3. Deploy
```

## 4. Update vercel.json
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-app.railway.app/api/:path*"
    }
  ]
}
```

## 5. Test
```
✓ Visit your Vercel URL
✓ Try signup/login
✓ Check dashboard access
```

---

## Alternative: One Command Deploy (Coming Soon)
We can set up GitHub Actions for automatic deployment on push!
