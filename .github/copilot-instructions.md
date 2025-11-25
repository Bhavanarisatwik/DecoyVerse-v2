# Copilot Instructions for DecoyVerse

## Project Overview
DecoyVerse is a cybersecurity deception platform frontend built with React 19 + TypeScript + Vite + Tailwind CSS v4. The app manages decoys, honeytokens, and threat intelligence visualization.

## Tech Stack & Commands
- **Dev server**: `npm run dev` (Vite)
- **Build**: `npm run build` 
- **Lint**: `npm run lint`
- **Path alias**: `@/*` maps to `./src/*` (configured in `tsconfig.json` and `vite.config.ts`)

## Architecture

### Route Structure (`src/App.tsx`)
- **Public routes**: `/`, `/auth/login`, `/auth/signup`, `/onboarding/*`
- **Dashboard routes**: Wrapped in `<DashboardLayout>` - includes `/dashboard`, `/nodes`, `/decoys`, `/honeytokens`, `/logs`, `/alerts`, `/ai-insights`, `/grafana`, `/settings`
- Catch-all redirects to `/`

### Component Organization
```
src/components/
  common/    → Reusable UI primitives (Button, Card, Input, Modal, Table, Badge, Tabs)
  landing/   → Marketing page sections (Hero, Features, Pricing, Footer)
  layout/    → App structure (DashboardLayout, Sidebar, Navbar)
```

## Design System Patterns

### Color Palette (defined in `tailwind.config.js` and `src/index.css`)
- **Primary accent**: `gold-400/500/600/700` - use for CTAs, active states, highlights
- **Backgrounds**: `black-900` (main), `gray-800` (cards), `gray-700` (borders)
- **Status colors**: `status-success`, `status-info`, `status-warning`, `status-danger`
- **Dark mode only** - `darkMode: 'class'` but app uses dark theme by default

### Typography
- **Headings**: `font-heading` (Poppins) with `text-gold-500`
- **Body**: `font-sans` (Inter)
- **Code**: `font-mono` (Fira Code)

### Component Patterns
1. **Use `cn()` utility** from `src/utils/cn.ts` for conditional classes (wraps `clsx` + `tailwind-merge`)
2. **forwardRef pattern** for all common components - see `Card.tsx`, `Button.tsx`, `Input.tsx`
3. **Variant props** use object maps, not `cva` - see `Button.tsx` for variant/size patterns
4. **Card styling**: `bg-gray-800 border-gray-700 rounded-xl`
5. **Gold glow effect**: `shadow-gold-glow` for emphasis

### Animation
- Uses `framer-motion` for page transitions and reveals - see `Hero.tsx`
- Tailwind animations: `animate-pulse`, `animate-ping` for status indicators

## Key Dependencies
- `react-router-dom` v7 - routing
- `recharts` - dashboard charts (AreaChart, BarChart)
- `lucide-react` - icons (Ghost, Shield, Server, etc.)
- `framer-motion` - animations

## Conventions
- Pages are default exports in `src/pages/`
- Components use named exports
- No state management library - local state with hooks
- No backend integration yet - pages use mock data
