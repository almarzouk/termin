# Backend (API) — Mien‑Termin

Dieses Verzeichnis enthält die API‑Implementierung (Laravel empfohlen).

Kurze Hinweise zum lokalen Setup (ohne Docker):

1. Installiere PHP (>= 8.1), Composer und MySQL lokal.
2. Kopiere `backend/.env.example` nach `backend/.env` und passe DB‑Zugangsdaten an.
3. Im `backend/` Verzeichnis: `composer install` → `php artisan key:generate` → `php artisan migrate --seed`.
4. Starte den lokalen Server: `php artisan serve --host=127.0.0.1 --port=8000`.

API Basis‑URL (lokal): `http://127.0.0.1:8000/api`

Weitere Dateien:
- `routes/api.php` — API‑Routen
- `app/Http/Controllers/Api/` — API Controller

Sprache: Alle Kommentare und Dokumentation sind auf Deutsch.
