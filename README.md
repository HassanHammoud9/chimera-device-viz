# Chimera Device Viz

A lightweight device analytics and visualization demo consisting of a React (Vite) web app and a FastAPI backend.

## Overview
- Frontend: `app-web/` — React 19 + Vite 7, 3D topology with three.js, charts, and a slide-out device panel.
- Backend: `api/` — FastAPI serving device data from a JSON store with simple mutation endpoints.

The frontend queries the backend under the `/api/*` path (CORS enabled on the server). In local dev, Vite proxies `/api` to the FastAPI server.

## Tech stack
- React 19, Vite 7, TypeScript tooling (source in JS)
- @react-three/fiber, @react-three/drei, three
- antd, framer-motion, styled-components
- FastAPI, Uvicorn

## Project structure
```
api/
  main.py           # FastAPI app (GET /api/devices, /api/summary; PATCH & POST actions)
  storage.py        # JSON storage helpers
  devices.sample.json
  requirements.txt  # Backend Python deps
app-web/
  src/              # React app
  vite.config.ts    # Vite config + dev proxy for /api
  package.json
```

## Prerequisites
- Node.js 18+ (recommended 20+)
- Python 3.10+

## Backend — run locally
```powershell
# From repo root
cd api
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
This starts the API at http://localhost:8000 with:
- GET /api/devices
- GET /api/summary
- PATCH /api/devices/{id}
- POST /api/devices/{id}/actions

Data persists to `devices.sample.json` in-place.

## Frontend — run locally
```powershell
# From repo root
cd app-web
npm install
npm run dev
```
Vite dev server runs at http://localhost:5173 and proxies `/api` to http://localhost:8000.

Build for production:
```powershell
cd app-web
npm run build
npm run preview
```

## Deployment notes
- Frontend: Deploy `app-web/` to Vercel (build: `npm run build`, output: `dist`).
- Backend: Deploy `api/` to your preferred Python host (Railway, Fly.io, Render, Azure, etc.). Ensure the public URL is allowed by CORS (currently `*`).
- In production, set your API base path accordingly (the app uses `/api/...`; you can keep that path if you reverse-proxy the backend under the same domain, or expose a public base URL and adjust fetches).

## API contract (simplified)
- Device summary: `GET /api/summary` → `{ total, active, by_group, by_category }`
- Devices list: `GET /api/devices` → `Device[]`
- Update device: `PATCH /api/devices/{id}` → updated `Device`
- Device actions: `POST /api/devices/{id}/actions` with `{ action, category? }`

## Troubleshooting
- If clicks don’t load device details, confirm the API is reachable and IDs are strings end-to-end.
- For local dev, ensure Uvicorn runs on port 8000 before starting Vite.
- If TypeScript errors in dependencies appear on CI, we already set `moduleResolution: bundler` and `skipLibCheck: true` in `tsconfig.json`.

## License
MIT
