---
name: new-endpoint
description: Add a new Express API endpoint to the DecoyVerse backend
---

## Steps

1. Create route file: `server/src/routes/myRoute.ts`
2. Mount in [server/src/index.ts](../../server/src/index.ts): `app.use('/api/my-route', myRouter)`
3. Add typed API call in `src/api/endpoints/`

## Route template

```ts
import { Router } from 'express';
import { protect } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import type { AuthRequest } from '../types';

const router = Router();

router.get('/', protect, async (req: AuthRequest, res) => {
  res.json({ data: [] });
});

export default router;
```

## Notes

- Use `protect` middleware for JWT-protected routes
- Use `express-validator` + `validationResult(req)` for input validation
- `AuthRequest` extends `Request` with `req.user`
- Password fields need `.select('+password')` (select: false in schema)
