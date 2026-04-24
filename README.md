# Route Finder (React + Express + PostgreSQL)

Web app for searching places/routes, publishing custom multi-point routes, rating and commenting.

## Stack
- Frontend: React, TypeScript, Vite, React Router, styled-components
- Backend: Node.js, Express, TypeScript, PostgreSQL
- Auth: JWT + local test account `admin/admin`
- Maps: OpenStreetMap (Leaflet) + free public OSRM routing
- Tests: Vitest (frontend), Jest (backend)

## Features
- Home page, auth page, routes list page, route details page
- Route creation with multiple points (A -> B + waypoints)
- Route rendering on OpenStreetMap
- Route photos upload
- Ratings and comments
- Search + sorting
- Responsive UI (desktop / tablet / mobile)
- Offline fallback mode in frontend:
  if backend is unavailable, `admin/admin` still works and routes are saved in `localStorage`

## Environment

### Backend `.env`
Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
JWT_SECRET=your_jwt_secret
FRONTEND_ORIGIN=http://localhost:5173
```

### Frontend `.env`
Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000
VITE_OSRM_API_URL=https://router.project-osrm.org
```

## Database setup (pgAdmin)
1. Start PostgreSQL.
2. Open your DB in pgAdmin.
3. Run SQL from [backend/src/db.sql](/C:/Users/freezemyself/Desktop/project/backend/src/db.sql).

Note: backend also auto-creates required tables at startup, but running SQL manually is recommended.

## Free map/routing setup
No paid key is required.

The project uses:
1. OpenStreetMap tiles (via Leaflet).
2. Public OSRM endpoint for road routing (`VITE_OSRM_API_URL`).

If OSRM is temporarily unavailable, the app still draws the route as a direct polyline between your points.

## Install

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

Open:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Test

Backend:
```bash
cd backend
npm test
```

Frontend:
```bash
cd frontend
npm test
```

## Default test account
- login: `admin`
- password: `admin`

This account works for quick testing. In frontend it can also be used when backend is unavailable.
