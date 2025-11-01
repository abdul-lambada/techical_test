# Vehicle Tracker Dashboard (Technical Test)

Monorepo with backend (Node.js + TypeScript + Express) and frontend (React + TypeScript + Vite). Dockerized with PostgreSQL.

## Quick start (Docker)

1. Copy env for backend:
   
   - Create `backend/.env` from `.env.example`.

2. Start all services:

```
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:4000/api/health
- Postgres: localhost:5432

## Local dev (no Docker)

- Backend:
  
  ```
  npm install --prefix backend
  npm run dev --prefix backend
  ```

- Frontend:
  
  ```
  npm install --prefix frontend
  npm run dev --prefix frontend
  ```

## Next phases

- Auth (JWT, refresh/access) with http-only cookie option.
- Prisma + PostgreSQL migrations & seed.
- Vehicle APIs, report generation (.xlsx).
- Tests (Vitest/Jest) and CI.
