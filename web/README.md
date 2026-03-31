# TRAK Web (Vite + React)

## Setup

```bash
npm install
npm run dev
```

## API configuration

[src/config/api.js](src/config/api.js) uses `import.meta.env.VITE_API_URL` when set; otherwise `http://127.0.0.1:8000`.

Create `.env` in this folder:

```env
VITE_API_URL=http://127.0.0.1:8000
# Production: omit or set false — mock feed is disabled when not in dev unless you set:
# VITE_ALLOW_MOCK_FEED=true
```

## Auth

[src/context/AuthContext.jsx](src/context/AuthContext.jsx) uses the same backend as mobile:

- `POST /api/auth/login/` — stores `access` / `refresh` in `localStorage`
- `GET /api/auth/me/` — on load if token present
- Admin routes use `ProtectedRoute` with `user.role === 'admin'` (no hardcoded password list)

## Related

- Mobile app: [../README.md](../README.md)
- API reference: [../../Backend/TRAK_Backend/README-AUTH-JWT.md](../../Backend/TRAK_Backend/README-AUTH-JWT.md)
