# DecoyVerse — AI Agent Guide

DecoyVerse is a cybersecurity deception platform (honeytokens, ML threat analysis, real-time alerting).
Full-stack: React 19 + TypeScript + Vite frontend, Express backend (auth only), FastAPI backend (separate repo).

## Repository Structure

```
/
├── src/                   # React frontend
│   ├── api/               # Axios clients + endpoint functions + types
│   ├── components/        # common/, layout/, auth/, landing/
│   ├── context/           # AuthContext, ThemeContext
│   ├── pages/             # Route-level page components
│   └── utils/cn.ts        # clsx + tailwind-merge helper
├── server/src/            # Express backend (TypeScript)
│   ├── config/            # MongoDB connection
│   ├── middleware/auth.ts  # JWT protect() + generateToken()
│   ├── models/            # User.ts, VaultItem.ts (Mongoose)
│   ├── routes/            # auth.ts, vault.ts (ONLY these are mounted)
│   └── utils/mailer.ts    # SendGrid email helpers
└── dist/ / server/dist/   # Build outputs (do not edit)
```

## Build, Lint & Type-Check Commands

### Frontend (root directory)
```bash
npm run dev       # Vite dev server on :5173
npm run build     # Production build → dist/
npm run lint      # ESLint (JS/JSX only — TS files are NOT linted by current config)
npm run preview   # Preview production build
```

**Type-check frontend (no emit):**
```bash
npx tsc --noEmit
```

### Backend (`server/` directory)
```bash
npm run dev       # ts-node-dev hot reload on :5000
npm run build     # tsc → server/dist/
npm start         # node dist/index.js (production)
```

**Type-check backend:**
```bash
cd server && npx tsc --noEmit
```

### Testing
No automated test suite. Test manually:
- **UI**: use demo mode (`admin@gmail.com` / `Admin@0265`)
- **API**: Postman or `curl` against `:5000` (Express) or `:8000` (FastAPI)

## Environment Variables

### Frontend (`.env` in root)
```env
VITE_EXPRESS_API_URL=http://localhost:5000/api   # authClient base URL
VITE_FASTAPI_API_URL=http://localhost:8000        # apiClient base URL
```
> Note: the env var is `VITE_EXPRESS_API_URL`, not `VITE_API_URL`.

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM=DecoyVerse Security <you@example.com>
INTERNAL_SECRET=your_internal_secret   # For FastAPI → Express internal calls
```

## Code Style

### TypeScript
- **Strict mode** enabled on both frontend and backend (`"strict": true`).
- Use `interface` (not `type`) for object shapes.
- No `any` — use proper generics or `unknown`.
- `noUnusedLocals` and `noUnusedParameters` are enforced on the frontend.
- Frontend: `"moduleResolution": "bundler"`, ESNext modules, `jsx: react-jsx`.
- Backend: `"moduleResolution": "node"`, CommonJS modules, `esModuleInterop: true`.

### Imports
- Path alias `@/*` → `./src/*` available on the frontend (configured in `tsconfig.json` + `vite.config.ts`).
- Third-party imports first, then internal (`@/` or relative), then types.
- No barrel re-exports except `src/api/index.ts`.

### Naming Conventions
- **Files**: PascalCase for components/pages (`Sidebar.tsx`), camelCase for utils/api (`client.ts`, `auth.ts`).
- **Components**: named exports (`export function Sidebar(...)`).
- **Pages**: default exports (`export default function Dashboard()`).
- **Hooks/contexts**: `useAuth()`, `useTheme()` — named exports from their context files.
- Backend route files: lowercase (`auth.ts`, `vault.ts`).

### Formatting
No Prettier is configured. Match surrounding code style (2-space indent in frontend, 4-space in backend).

### React Components
```typescript
import { cn } from "@/utils/cn";

interface CardProps {
  variant?: "default" | "elevated";
  className?: string;
  children: React.ReactNode;
}

export function Card({ variant = "default", className, children }: CardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-gray-700 bg-gray-800",
      variant === "elevated" && "bg-themed-elevated",
      className
    )}>
      {children}
    </div>
  );
}
```
- Use `cn()` (from `src/utils/cn.ts`) for all conditional class merging — never string concatenation.
- Common components (`Button`, `Card`, `Input`) use `React.forwardRef`.
- Variant logic uses plain conditional objects, not `cva`.

### Styling / Tailwind v4
- Design tokens live in `src/index.css` under `@theme {}` — not in `tailwind.config.js` (legacy file).
- Theme-aware utilities: `bg-themed-primary/secondary/card/elevated`, `text-themed-primary/muted/dimmed`, `border-themed-primary/secondary`.
- Accent utilities: `bg-accent`, `text-accent`, `border-accent`, `bg-accent-600`, `text-on-accent`.
- Status: `status-success`, `status-info`, `status-warning`, `status-danger`.
- Default accent is **cyan** (`#06B6D4`). The CSS class `.theme-gold` = cyan (naming quirk).
- Card base: `bg-gray-800 border border-gray-700 rounded-xl`.

### Express Backend Routes
```typescript
// Validation arrays defined at top of file
const createValidation = [
  body('field').trim().notEmpty().withMessage('Required'),
];

router.post('/', createValidation, async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return;
  }
  // ... logic
  res.status(201).json({ success: true, message: '...', data: result });
});
```
- All routes return `{ success: boolean, message: string, data?: T }`.
- Use `protect` middleware (from `middleware/auth.ts`) for JWT-protected routes.
- Internal routes (FastAPI → Express) check `req.headers['x-internal-secret']` — no JWT.
- `password` field has `select: false` in schema; use `.select('+password')` when needed.
- Duplicate key (MongoDB code `11000`) → return 400 with descriptive message.

### Frontend API Layer
- `authClient` → Express backend (`VITE_EXPRESS_API_URL`), used only in `src/api/endpoints/auth.ts` and `src/api/endpoints/vault.ts`.
- `apiClient` → FastAPI backend (`VITE_FASTAPI_API_URL`), used for all other data endpoints.
- Both clients auto-inject `Authorization: Bearer <token>` and redirect to `/auth/login` on 401.
- When `localStorage.isDemo === 'true'`, `apiClient` methods are monkey-patched to return mock data.

## Active Server Routes

Only two route groups are mounted in `server/src/index.ts`:
- `POST/GET/PUT /api/auth/*` — signup, login, me, logout, profile, password, onboarding, email
- `GET/POST/PUT/DELETE /api/vault/*` — password vault CRUD

Files `server/src/routes/{alerts,decoys,stats,attacks,attacker-profiles}.ts` exist but are **not mounted** (dead code).

## Adding Features

**New page**: create `src/pages/MyPage.tsx` (default export) → add route in `src/App.tsx` → add nav entry in `src/components/layout/Sidebar.tsx`.

**New API endpoint (Express)**: create handler in `server/src/routes/` → mount in `server/src/index.ts` → add typed function in `src/api/endpoints/` → export from `src/api/index.ts`.

**New component**: named export in `src/components/<category>/` → use `cn()` for classes → follow forwardRef pattern if it accepts a `ref`.

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Route tree (public / protected / dashboard) |
| `src/api/client.ts` | Axios instances + auth interceptors + demo mock |
| `src/context/AuthContext.tsx` | Auth state, JWT storage, demo bypass |
| `src/context/ThemeContext.tsx` | gold / orange / light theme switching |
| `src/index.css` | Tailwind v4 `@theme` tokens + CSS custom properties |
| `src/utils/cn.ts` | `clsx` + `twMerge` helper |
| `server/src/index.ts` | Express entry point; CORS + route mounting |
| `server/src/middleware/auth.ts` | `protect()` + `generateToken()` |
| `server/src/models/User.ts` | User schema (bcrypt hook, comparePassword, toJSON) |
