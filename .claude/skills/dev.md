---
name: dev
description: Start the DecoyVerse development environment (frontend + backend)
---

## Start Frontend

```bash
npm run dev
```
Runs on http://localhost:5173

## Start Backend

```bash
cd server && npm run dev
```
Runs on http://localhost:5000

## Required: FastAPI ML service must be running separately on :8000

Check `.env` and `server/.env` are populated before starting.
