# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/api-server run seed` — seed superadmin user

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### API Server (`artifacts/api-server`)
- **Kind**: Express 5 API server (port 8080)
- **Auth**: Session-based with `express-session` + `bcryptjs`
- **Session secret**: `SESSION_SECRET` env var (falls back to dev string)
- **Routes**:
  - `POST /api/auth/login` — login with email/password
  - `POST /api/auth/logout` — end session
  - `GET /api/auth/me` — get current user
  - `PUT /api/auth/profile` — update own name/password
  - `GET /api/users` — list users (admin only)
  - `POST /api/users` — create teacher (admin only)
  - `PUT /api/users/:id` — update user (admin only)
  - `DELETE /api/users/:id` — delete user (admin only)
- **Database schema**: `lib/db/src/schema/users.ts` — `users` table
- **Seed**: `artifacts/api-server/src/seed.ts` — creates superadmin

### Concurso de Cálculo Mental (`artifacts/calculo-mental`)
- **Kind**: React + Vite web app (port 20250)
- **Preview path**: `/`
- **Tech**: React, Vite, Tailwind CSS, Wouter, Framer Motion, localStorage
- **Auth**: Frontend auth via `useAuth` hook → calls API server via Vite proxy
- **Purpose**: Interactive classroom contest app for mental math practice

#### Auth & Roles
- **Login page**: Shown when no session exists (`GET /api/auth/me` returns 401)
- **Roles**: `admin` (Administrador) and `teacher` (Maestro)
- **Admin**: Sees "Usuarios" tab in nav, manages teacher accounts
- **Teacher**: Regular access to contest features
- **Superadmin**: `admin@correo.com` / `Admin123!`
- **Session cookie**: 7-day expiry, httpOnly

#### Features
- Student management (add/edit/delete/export/import)
- Operation management (add/edit/delete/shuffle)
- Random student picker with animation
- Game modes: Simple (show only) and Interactive (enter answers)
- Optional countdown timer per operation
- Limit operations per round
- Results screen with per-answer breakdown
- No-repeat student option
- Fullscreen mode
- All contest data persisted in localStorage
- Profile page: update own name and password
- Admin panel: create/edit/delete teacher users

#### Key Files
- `src/types/index.ts` — shared TypeScript types (incl. AuthUser, UsuarioItem)
- `src/hooks/useLocalStorage.ts` — localStorage hook
- `src/hooks/useAppData.ts` — student/operation state management
- `src/hooks/useAuth.ts` — auth context (AuthProvider, useAuth hook)
- `src/components/Header.tsx` — app header with role badge
- `src/components/NavBar.tsx` — navigation bar with user info and logout
- `src/pages/Login.tsx` — login page (shown when unauthenticated)
- `src/pages/Inicio.tsx` — home/dashboard page
- `src/pages/GestionAlumnos.tsx` — student management page
- `src/pages/GestionOperaciones.tsx` — operation management page
- `src/pages/Juego.tsx` — game page (selector + playing + finished)
- `src/pages/Resultados.tsx` — results history page
- `src/pages/Perfil.tsx` — profile page (update name/password)
- `src/pages/AdminUsuarios.tsx` — admin user management page

## Database

- **Table**: `users`
  - `id` serial PK
  - `name` text NOT NULL
  - `email` text NOT NULL UNIQUE
  - `password` text NOT NULL (bcrypt hash)
  - `role` text NOT NULL DEFAULT 'teacher' ('admin' | 'teacher')
  - `created_at` timestamptz
  - `updated_at` timestamptz

## Docker

- `Dockerfile` + `docker-compose.yml` → production (nginx, port 80)
- `Dockerfile.dev` + `docker-compose.dev.yml` → development with hot reload (port 3000)

## OpenAPI Spec

`lib/api-spec/openapi.yaml` — defines all API endpoints. Run codegen after changes.
