# Copilot Instructions for DecoyVerse

## Project Overview
DecoyVerse is a full-stack cybersecurity deception platform with React 19 + TypeScript + Vite + Tailwind CSS v4 frontend and Express + MongoDB backend. The app manages decoys, honeytokens, and threat intelligence visualization.

## Monorepo Structure
```
/                → Frontend (React + Vite)
/server          → Backend (Express + MongoDB + TypeScript)
```

## Frontend Architecture

### Dev Commands
- **Dev server**: `npm run dev` (runs on `http://localhost:5173`)
- **Build**: `npm run build` 
- **Lint**: `npm run lint`
- **Path alias**: `@/*` maps to `./src/*` (configured in `tsconfig.json` and `vite.config.ts`)

### Route Structure (`src/App.tsx`)
Route protection uses `AuthContext` with JWT tokens stored in `localStorage`:
- **Public routes**: `/`, `/auth/login`, `/auth/signup` - wrapped in `<PublicRoute>` (redirects to `/dashboard` if authenticated)
- **Onboarding routes**: `/onboarding/subscription`, `/onboarding/agent` - protected, multi-step setup flow
- **Dashboard routes**: All wrapped in `<DashboardLayout>` and `<ProtectedRoute>` - includes `/dashboard`, `/nodes`, `/decoys`, `/honeytokens`, `/logs`, `/alerts`, `/ai-insights`, `/grafana`, `/settings`, `/configuration`
- Catch-all redirects to `/`

### Authentication Flow (`src/context/AuthContext.tsx`)
- On mount, checks `localStorage` for token and validates with backend via `authApi.getMe()`
- Failed validation clears storage and redirects to login
- `login()` and `signup()` store `{ token, user }` in `localStorage` and set context state
- Axios interceptor in `src/api/client.ts` adds `Authorization: Bearer ${token}` to all requests
- 401 responses auto-clear storage and redirect to login (except when already on auth pages)

### API Layer (`src/api/`)
```typescript
// src/api/client.ts - Axios instance with interceptors
apiClient.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
// Request: auto-adds Bearer token from localStorage
// Response: handles 401 errors globally

// src/api/endpoints/auth.ts - Auth API methods
authApi.login({ email, password })
authApi.signup({ name, email, password })
authApi.getMe() // Verify token validity
```

### Component Organization
```
src/components/
  common/    → Reusable UI primitives (Button, Card, Input, Modal, Table, Badge, Tabs)
  landing/   → Marketing page sections (Hero, Features, Pricing, Footer)
  layout/    → App structure (DashboardLayout, Sidebar, Navbar)
  auth/      → ProtectedRoute, PublicRoute - route guards using AuthContext
```

### Design System Patterns

**Color Palette** (defined in `tailwind.config.js`):
- **Primary accent**: `gold-400/500/600/700` - use for CTAs, active states, highlights
- **Backgrounds**: `black-900` (main), `gray-800` (cards), `gray-700` (borders)
- **Status colors**: `status-success`, `status-info`, `status-warning`, `status-danger`
- **Dark mode only** - `darkMode: 'class'` but app uses dark theme by default

**Typography**:
- **Headings**: `font-heading` (Poppins) with `text-gold-500`
- **Body**: `font-sans` (Inter)
- **Code**: `font-mono` (Fira Code)

**Component Patterns**:
1. **Use `cn()` utility** from `src/utils/cn.ts` for conditional classes (wraps `clsx` + `tailwind-merge`)
2. **forwardRef pattern** for all common components - see `Card.tsx`, `Button.tsx`, `Input.tsx`
3. **Variant props** use object maps, not `cva` - see `Button.tsx` for variant/size patterns
4. **Card styling**: `bg-gray-800 border-gray-700 rounded-xl`
5. **Gold glow effect**: `shadow-gold-glow` for emphasis

**Animation**:
- Uses `framer-motion` for page transitions - see `Hero.tsx`
- Tailwind animations: `animate-pulse`, `animate-ping` for status indicators

### Key Dependencies
- `react-router-dom` v7 - routing with `BrowserRouter`
- `axios` - HTTP client with interceptors
- `recharts` - dashboard charts (AreaChart, BarChart)
- `lucide-react` - icons (Ghost, Shield, Server, etc.)
- `framer-motion` - animations

### Conventions
- Pages are **default exports** in `src/pages/`
- Components use **named exports**
- No Redux/Zustand - use `AuthContext` for auth, local state for UI
- TypeScript strict mode enabled

---

## Backend Architecture (`/server`)

### Dev Commands
```bash
cd server
npm run dev      # ts-node-dev with hot reload on :5000
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled dist/index.js (production)
```

### Tech Stack
- **Express** + **TypeScript** - REST API
- **MongoDB** + **Mongoose** - Database (cloud: MongoDB Atlas)
- **JWT** - Authentication (7-day expiry)
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Project Structure
```
server/src/
  index.ts          → Express app, CORS setup, route mounting
  config/
    database.ts     → MongoDB connection with Mongoose
  models/
    User.ts         → User schema with password hashing & comparison methods
  routes/
    auth.ts         → /api/auth/signup, /login, /logout, /me
  middleware/
    auth.ts         → JWT generation & verification (protect middleware)
```

### Authentication Implementation

**JWT Flow** (`server/src/middleware/auth.ts`):
```typescript
generateToken(user) // Returns JWT with { userId, email, role }, expires in 7d
protect() // Middleware: extracts Bearer token, verifies, attaches user to req.user
```

**User Model** (`server/src/models/User.ts`):
- Schema: `{ name, email, password, avatar?, role, isActive, lastLogin, createdAt, updatedAt }`
- Pre-save hook: hashes password with bcrypt (10 rounds)
- `comparePassword()` method: validates plaintext against hashed password
- `password` field has `select: false` - must explicitly include in queries

**Auth Routes** (`server/src/routes/auth.ts`):
```typescript
POST /api/auth/signup    // Validation: email format, password length, name 2-50 chars
POST /api/auth/login     // Returns { success, token, user } or 401
POST /api/auth/logout    // Updates lastLogin (optional)
GET  /api/auth/me        // Protected route - returns current user from token
```

### CORS Configuration (`server/src/index.ts`)
Allowed origins:
- `http://localhost:5173`, `http://localhost:5174` (dev)
- `https://decoy-verse-v2-bpsu.vercel.app` (production)
- `process.env.FRONTEND_URL` (dynamic config)
- `credentials: true` for cookie support

### Environment Variables (`.env` in `/server`)
Required variables:
```bash
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/decoyverse
JWT_SECRET=your_secret_key_here  # MUST change in production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Database Connection
- Uses Mongoose with strict schema validation
- Connection in `server/src/config/database.ts`
- Indexes: `email` field is unique in User model

---

## Deployment

### Architecture
- **Frontend**: Vercel (static SPA)
- **Backend**: Railway/Render (Node.js server)
- **Database**: MongoDB Atlas (cloud)

### Quick Deploy Steps
1. **MongoDB Atlas**: Create cluster, get connection string, whitelist `0.0.0.0/0`
2. **Backend (Railway)**: 
   - Root directory: `server`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Add env vars (see above)
3. **Frontend (Vercel)**:
   - Set `VITE_API_URL=https://your-backend.railway.app/api`
   - Update `vercel.json` rewrites with backend URL
   - Deploy with `vercel --prod`

### Critical Files
- `vercel.json` - API proxy rewrites to backend
- `server/.env` - Backend secrets (NEVER commit)
- Frontend reads `VITE_API_URL` from build-time env

---

## Development Workflow

### Running Full Stack Locally
```bash
# Terminal 1 - Backend
cd server
npm run dev  # Runs on :5000

# Terminal 2 - Frontend
npm run dev  # Runs on :5173
```

Frontend will proxy API requests to `http://localhost:5000/api` (configured in `src/api/client.ts`).

### Adding New Protected Routes
1. Define route in `src/App.tsx` inside `<ProtectedRoute>` wrapper
2. Create page component in `src/pages/` with default export
3. Update `Sidebar.tsx` navigation links if needed

### Adding New API Endpoints
1. Create route handler in `server/src/routes/`
2. Mount in `server/src/index.ts`: `app.use('/api/resource', resourceRoutes)`
3. Add API method in `src/api/endpoints/` (frontend)
4. Use `apiClient` from `src/api/client.ts` for auto-auth

### Common Issues
- **CORS errors**: Add origin to `allowedOrigins` array in `server/src/index.ts`
- **401 on protected routes**: Check token in localStorage, verify JWT_SECRET matches
- **MongoDB connection fails**: Check `MONGO_URI` format and IP whitelist in Atlas
- **Type errors**: Pages must return `JSX.Element`, use `React.FC` or function signature

---

## Project-Specific Patterns

### Error Handling
- Backend uses `express-validator` - check `validationResult(req)` in routes
- Frontend wraps API calls in try/catch, shows error messages in UI
- 401 errors are handled globally by axios interceptor

### State Management
- **Global**: `AuthContext` (user, isAuthenticated, login, signup, logout)
- **Local**: `useState` for forms, modals, loading states
- No Redux/MobX - keep it simple

### File Naming
- Components: PascalCase (e.g., `Button.tsx`, `DashboardLayout.tsx`)
- Utils: camelCase (e.g., `cn.ts`)
- Pages: PascalCase (e.g., `Dashboard.tsx`)
- Backend routes: lowercase (e.g., `auth.ts`)

### TypeScript Conventions
- Use `interface` for object shapes (e.g., `IUser`, `AuthRequest`)
- Backend: Extend Express types with custom interfaces (e.g., `AuthRequest extends Request`)
- Frontend: Define prop types inline or as separate interfaces
- Avoid `any` - use `unknown` or proper types
