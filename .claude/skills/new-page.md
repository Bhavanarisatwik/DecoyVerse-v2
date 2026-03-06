---
name: new-page
description: Scaffold a new page in the DecoyVerse frontend
---

## Steps to add a new page

1. Create `src/pages/MyPage.tsx` (default export)
2. Add route in [src/App.tsx](../../src/App.tsx) inside `<ProtectedRoute>` / `<DashboardLayout>`
3. Add nav entry in [src/components/layout/Sidebar.tsx](../../src/components/layout/Sidebar.tsx)

## Page template

```tsx
export default function MyPage() {
  return (
    <div>
      <h1 className="font-heading text-gold-500">Page Title</h1>
    </div>
  );
}
```

## Conventions

- Cards: `bg-gray-800 border-gray-700 rounded-xl`
- Accent: `gold-400/500/600`
- Status badges: `status-success | status-info | status-warning | status-danger`
- Use `cn()` from `src/utils/cn.ts` for conditional classes
