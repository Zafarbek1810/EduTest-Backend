# EduTest Pro — Backend API

Node.js + Express + Prisma + PostgreSQL (Neon).

## O'rnatish

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

## Ishga tushirish

```bash
npm run dev
```

API: `http://localhost:3001`

## Muhit o'zgaruvchilari

`.env` faylida:

- `DATABASE_URL` — Neon PostgreSQL ulanishi
- `JWT_SECRET` — token imzolash kaliti
- `PORT` — server porti (default: 3001)
- `CORS_ORIGIN` — frontend manzili

## Demo hisoblar

| Rol | Login | Parol |
|-----|-------|-------|
| O'qituvchi | `teacher` | `teacher123` |
| Talaba | `dilnoza.k` | `pass123` |

## API yo'llari

- `POST /api/auth/login`
- `GET/POST/PATCH/DELETE /api/students` (o'qituvchi)
- `GET/POST /api/topics`, `PATCH /api/topics/:id/toggle-lock`
- `GET/POST /api/results`
- `GET /api/dashboard/teacher`
