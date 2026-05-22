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

### Google sign-in (Firebase)

1. User clicks **Google** on login/sign-up.
2. Firebase `signInWithPopup` opens Google OAuth (loads scripts from `apis.google.com`).
3. App sends the Firebase **ID token** to Django `POST /api/auth/firebase/`.
4. Django verifies the token and returns TRAK JWT (`access` / `refresh`).

Requires Firebase keys in `.env` (see `.env.example`). **Restart `npm run dev`** after changing `.env` or [vite.config.js](vite.config.js) CSP headers.

In **Firebase Console** → Authentication → Sign-in method: enable **Google**, and add `localhost` (and your production domain) under **Authorized domains**.

## Real-time notifications (WebSocket)

`runserver` is HTTP-only; `/ws/notifications/` returns 404 and the app will spam reconnects unless you disable the socket.

- **Default in dev:** WebSocket is off; notifications still refresh via `GET /api/notifications/` (polling on the notifications screen).
- **Enable locally:** run Django with ASGI, then set `VITE_ENABLE_NOTIFICATIONS_WS=true` in `.env`:

```bash
# from Backend/TRAK_Backend, with venv active
daphne -b 0.0.0.0 -p 8000 TRAK_Backend.asgi:application
```

## Related

- Mobile app: [../README.md](../README.md)
- API reference: [../../Backend/TRAK_Backend/README-AUTH-JWT.md](../../Backend/TRAK_Backend/README-AUTH-JWT.md)
