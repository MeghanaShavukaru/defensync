# DefenSync AI

DefenSync AI is an intelligent multi-base asset management and decision-support platform designed for academic demonstration purposes. It provides secure visibility into asset procurement, inventory, transfers, assignments, expenditures, maintenance, audit logs, analytics, and AI-assisted insights using fictional data.

## Overview

This repository contains a full-stack application with:

- React + Vite frontend
- Node.js + Express backend
- PostgreSQL database with Prisma ORM
- JWT authentication and role-based access control
- Seeded demo accounts and fictional bases
- Initial dashboards and protected routes

## Project structure

- `frontend/` - React SPA
- `backend/` - Express API server
- `backend/prisma/` - Prisma schema and seed script

## Demo credentials

- Admin: `admin@defensync.demo` / `Admin@123`
- Base Commander: `commander.alpha@defensync.demo` / `Commander@123`
- Logistics Officer: `logistics.alpha@defensync.demo` / `Logistics@123`
- Auditor: `auditor@defensync.demo` / `Auditor@123`

## Setup

1. Copy `.env.example` to `.env` in `backend/`.
2. Configure `DATABASE_URL`.
3. Run `npm install` in both `backend/` and `frontend/`.
4. Run Prisma migrations and seed data in backend.
5. Start frontend and backend.

## Notes

The environment where this code is being generated currently blocks npm package installation. Once package access is available, install dependencies and run the backend and frontend builds.

## Render deployment

### Frontend (Static Site)

- Root directory: `frontend/`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_API_URL=https://<your-backend-service>.onrender.com/api`

### Backend (Web Service)

- Root directory: `backend/`
- Build command: `npm install && npm run build && npm run prisma:generate`
- Start command: `npm run start`
- Environment variables:
  - `DATABASE_URL=<your-render-postgres-url>`
  - `JWT_SECRET=<your-secret>`
  - `FRONTEND_URL=https://<your-frontend-service>.onrender.com`
  - `PORT=10000`

### Database

- Create a Render PostgreSQL database
- Set `DATABASE_URL` in the backend service
- Run once via the backend service shell:
  - `npm run prisma:migrate`
  - `npm run seed`

### Combined Render deployment

If you want backend + frontend together in one container, use the root `Dockerfile` and root `docker-compose.yml` for local testing, then deploy the backend as a Docker service on Render.
# defensync
# defensync
# defensync
