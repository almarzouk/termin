# Mien-Termin App

Booking System (SaaS) — Next.js (frontend) + Laravel (backend)

Note: this repository was initialized from multiple sources — merged into a single skeleton.

Quickstart

1. Copy `.env.example` to `.env` and set credentials.
2. Start development using Docker Compose (recommended):

```bash
# from repo root
docker compose up --build
```

Local Git setup

```bash
git checkout -b feature/init-repo
# make changes, commit, push
```

Stack

- Frontend: Next.js (App Router), TypeScript (recommended), TailwindCSS
- Backend: Laravel 10/11, MySQL 8, Redis
- Auth: Laravel Sanctum
- Permissions: Spatie Laravel Permission
- Payments: Stripe

Files of interest

- `todo.md` — canonical task list
- `.github/workflows/ci.yml` — CI skeleton
- `.github/workflows/sync-todo.yml` — todo sync workflow (issues -> todo.md)

Contributing

See `CONTRIBUTING.md` for branch strategy and PR guidelines.
