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

`.env` faylida (mahalliy) yoki **Render → Environment** (production):

| O'zgaruvchi | Majburiy | Izoh |
|-------------|----------|------|
| `DATABASE_URL` | Ha | Neon PostgreSQL (`?sslmode=require`) |
| `JWT_SECRET` | Ha | Kamida **16 belgi** (masalan: `openssl rand -base64 32`) |
| `CORS_ORIGIN` | Ha | Netlify manzili, masalan `https://your-app.netlify.app` |
| `JWT_EXPIRES_IN` | Yo'q | Default: `7d` |
| `PORT` | Yo'q | Render o'zi beradi |

⚠️ `JWT_SECRET` Renderda bo'lmasa deploy **ZodError** bilan yiqiladi.

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
