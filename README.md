# Mien-Termin App

Terminverwaltungs‑Plattform (SaaS) — Next.js (Frontend) + Laravel (Backend)

Kurzanleitung (Auf Deutsch)

1. Kopiere `.env.example` nach `.env` und passe die Zugangsdaten an.
2. Lokale Entwicklung (ohne Docker): siehe `backend/README.md` für Backend-Setup und `frontend/README.md` für Frontend-Setup.

Lokale Git‑Arbeit

```bash
git checkout -b feature/init-repo
# Änderungen vornehmen, committen und pushen
```

Stack (Empfohlen)

- Frontend: Next.js (App Router), TypeScript (empfohlen), TailwindCSS
- Backend: Laravel 10/11, MySQL 8, Redis
- Auth: Laravel Sanctum
- Berechtigungen: Spatie Laravel Permission
- Zahlungen: Stripe (Testmodus)

Wichtige Dateien

- `todo.md` — Kanonische Aufgabenliste (auf Deutsch)
- `.github/workflows/ci.yml` — CI Grundgerüst
- `.github/workflows/sync-todo.yml` — Sync-Workflow (Issues → `todo.md`)

Contributing

Siehe `CONTRIBUTING.md` für Branch‑Strategie und PR‑Richtlinien.
