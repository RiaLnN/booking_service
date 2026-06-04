# booking_service

A fullstack booking application for meeting rooms and desks.
Built as a learning project with production-grade backend patterns.

**Stack:** Python · FastAPI · PostgreSQL · Redis · TypeScript · Docker Compose

---

## Features

**Booking logic**
- Browse available rooms and desks (`RoomType.ROOM / DESK`)
- View time slots per resource and book them
- Slots are non-overlapping — time conflicts are rejected at the service level
- Race conditions on concurrent bookings are handled via **pessimistic row-level locking** (`SELECT ... FOR UPDATE`) inside atomic transactions

**Auth**
- JWT-based authentication with bcrypt password hashing
- Role-based access: regular users and admins

**Admin panel**
- Create and manage rooms / desks
- Create time slots for resources

**Caching**
- Redis caching layer for resource and slot listings
- Manual cache invalidation on mutations

---

![screenshot](/dashboard.jpg)

---

## Architecture

```
backend/
├── core/          # config, security, Redis client, middlewares
├── models/        # SQLAlchemy models (User, Resource, Booking)
├── schemas/       # Pydantic request/response schemas
├── services/      # business logic (auth, booking, resource)
├── routes/        # FastAPI routers + dependency injection
└── helpers/       # cache helpers, time utilities

frontend/
├── src/
│   ├── api/       # Axios instance + service modules (auth, booking, resource)
│   ├── layout/    # page renderers (dashboard, rooms, admin, auth)
│   ├── types/     # TypeScript interfaces
│   └── ui/        # shared UI elements, icons, formatters
└── styles/        # per-page CSS
```

---

## Infrastructure

Four services orchestrated with Docker Compose:

| Service    | Image / Build         | Port        |
|------------|----------------------|-------------|
| `frontend` | custom build (Nginx) | `80`        |
| `backend`  | custom build         | `8080→8000` |
| `db`       | postgres:15-alpine   | —           |
| `redis`    | redis-stack-server   | `6379`      |

PostgreSQL starts with a healthcheck — the backend waits for it to be ready before accepting connections.
Redis and the database use named volumes for persistent storage.

---

## Running locally

**Requirements:** Docker, Docker Compose

1. Clone the repository
```bash
git clone https://github.com/RiaLnN/booking_service.git
cd booking_service
```

2. Create a `.env` file in the project root:
```env
DATABASE_URL=postgresql+asyncpg://user:password@db:5432/booking
DB_USER=user
DB_PASSWORD=password
DB_NAME=booking
REDIS_HOST=redis
REDIS_PORT=6379
```

3. Start all services:
```bash
docker compose up --build
```

4. Open [http://localhost](http://localhost) in your browser.

---

## Technical highlights

- **Async SQLAlchemy 2.0** — fully non-blocking DB access with `AsyncSession` and `create_async_engine`
- **Alembic migrations** — schema changes are versioned, never applied raw
- **Pessimistic locking** — `with_for_update()` prevents double-booking under concurrent requests
- **Redis caching** — reduces DB load on read-heavy listing endpoints
- **Layered backend** — strict separation: Routes → Services → Models, business logic never leaks into route handlers
- **Typed frontend** — TypeScript interfaces for all API contracts, dedicated service modules per domain