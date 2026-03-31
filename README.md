# TRAK — React Native app

## Setup

```bash
npm install
# iOS
cd ios && pod install && cd ..
npm run ios
# Android
npm run android
```

## API configuration

Default base URL is chosen in [src/config/api.js](src/config/api.js):

- **Android emulator:** `http://10.0.2.2:8000`
- **iOS simulator:** `http://localhost:8000`

If your Django server runs elsewhere, change `API_BASE` or add an override file (see comment in `api.js`).

## Auth & data

- [src/context/AuthContext.jsx](src/context/AuthContext.jsx) — JWT in **AsyncStorage**, `login` / `register` / `logout`, bootstrap via `/api/auth/me/`.
- [src/api/client.js](src/api/client.js) — `apiFetch` with optional refresh.
- [src/api/newsApi.js](src/api/newsApi.js) — feed + track-keywords.

**Behavior highlights:**

- **Login / Sign up** call the real Django API when online.
- **News feed** uses `/api/user/feed/` when an access token exists. **Release builds** (`__DEV__ === false`) do **not** fall back to mock data if the API fails or there is no token (empty feed instead).
- **Keyword onboarding** calls `POST /api/user/track-keywords/` when logged in.
- **Admin tab** is hidden unless `user.role === 'admin'` (matches server `ADMIN_EMAILS` assignment).
- **Profile → Logout** clears tokens and resets navigation to the opening flow.

Built-in admin logins (after backend seed): see [../Backend/TRAK_Backend/README-DEFAULT-ADMINS.md](../Backend/TRAK_Backend/README-DEFAULT-ADMINS.md).

## Related

- Web client: [web/README.md](web/README.md)
- Backend API: [../Backend/TRAK_Backend/README-AUTH-JWT.md](../Backend/TRAK_Backend/README-AUTH-JWT.md)
