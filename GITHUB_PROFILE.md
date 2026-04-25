# TRAK Frontend (React Native)

TRAK is a mobile-first news intelligence app built with React Native. It helps users cut through noisy, unreliable news feeds by combining personalized topic tracking with backend credibility analysis.

## What This Project Is For

This repository contains the client application that users interact with on iOS and Android. It handles:

- Authentication and secure session persistence
- Personalized onboarding and keyword tracking
- News feed rendering for tracked topics
- Role-based UI behavior (user vs admin experiences)
- Mobile UX concerns such as skeleton loading states, navigation, and platform-specific API routing

In short, this project is the user-facing layer of TRAK.

## Problem It Solves

Most users face three major issues with news consumption:

1. **Information overload**: too many sources, too little structure
2. **Low trust**: hard to quickly judge credibility
3. **Poor personalization**: users want relevant topics without irrelevant noise

TRAK frontend solves these problems by giving users a clean mobile workflow:

- Choose and track the topics they care about
- Receive a feed filtered around those interests
- View content that has already passed through backend AI credibility processing

## How The Frontend Works

The app communicates with the Django backend API for:

- Register/login/logout
- Session bootstrap (`/api/auth/me/`)
- User feed retrieval (`/api/user/feed/`)
- Keyword onboarding/tracking (`/api/user/track-keywords/`)

Authentication state is persisted with `AsyncStorage`, and app navigation adapts based on auth state and user role. For example, admin tabs are hidden for non-admin users.

## Key Features

- **JWT-based auth flow** with persistent login
- **Personalized feed** driven by backend user keyword matching
- **Keyword onboarding** flow for better recommendations
- **Role-aware navigation** (admin visibility control)
- **Production-safe behavior** where release builds avoid misleading mock fallback data

## Screenshots (Page-wise)

Images are loaded from `ScreenShots/`.

### Splash Screen
<img src="ScreenShots/Splash%20screen.png" alt="Splash Screen" width="260" />

### Onboarding Screen
<img src="ScreenShots/onboarding%20page.png" alt="Onboarding Screen" width="260" />

### Login Screen
<img src="ScreenShots/Login%20page.png" alt="Login Screen" width="260" />

### Signup Screen
<img src="ScreenShots/Signup%20page.png" alt="Signup Screen" width="260" />

### Forgot Password Screen
<img src="ScreenShots/forget%20passwords%20page.png" alt="Forgot Password Screen" width="260" />

### OTP Verification Screen
<img src="ScreenShots/after%20enetering%20email%20otp%20is%20send%20this%20is%20for%20that.png" alt="OTP Verification Screen" width="260" />

### Keyword Selection Screen
<img src="ScreenShots/keywords%20selection%20page.png" alt="Keyword Selection Screen" width="260" />

### User Home Feed Screen
<img src="ScreenShots/user%20dahsboard%20home%20feed%20page.png" alt="User Home Feed Screen" width="260" />

### Article Detail Screen
<img src="ScreenShots/on%20clicking%20the%20arcticle%20this%20page%20is%20openewd%20a%20detaield%20article%20page.png" alt="Article Detail Screen" width="260" />

### Discover / Search Screen
<img src="ScreenShots/this%20is%20a%20discover%20page%20a%20searching%20page%20whre%20you%20can%20find%20all%20the%20articles.png" alt="Discover / Search Screen" width="260" />

### Notifications Screen
<img src="ScreenShots/this%20is%20the%20page%20that%20shows%20notifucations.png" alt="Notifications Screen" width="260" />

### Profile Screen
<img src="ScreenShots/profile%20page%20that%20also%20ahs%20booksmarks.png" alt="Profile Screen" width="260" />

### Edit Profile Screen
<img src="ScreenShots/profile%20info%20page%20user%20can%20chnage%20ther%20name%20and%20desciption%20here.png" alt="Edit Profile Screen" width="260" />

### User Settings Screen
<img src="ScreenShots/user%20setting%20page4.png" alt="User Settings Screen" width="260" />

### Admin Dashboard Screen
<img src="ScreenShots/admin%20panel%20dashboard%20that%20shows%20metrics%20about%20user%20artclies%20and%20ketywords.png" alt="Admin Dashboard Screen" width="260" />

### Admin User Management Screen
<img src="ScreenShots/amdin%20panel%20user%20management.png" alt="Admin User Management Screen" width="260" />

### Admin Article Management Screen
<img src="ScreenShots/admin%20arctle%20management.png" alt="Admin Article Management Screen" width="260" />

### Admin Analytics Screen
<img src="ScreenShots/admin%20analyticval%20page%20that%20shows%20models%20performance%20and%20and%20grapghs.png" alt="Admin Analytics Screen" width="260" />

### Admin Settings Screen
<img src="ScreenShots/amdin%20panel%20setting%20whrer%20amdin%20can%20add%20or%20dleete%20keywords.png" alt="Admin Settings Screen" width="260" />

## Tech Stack

- **Framework**: React Native (`0.81.x`) + React `19`
- **Navigation**: React Navigation (native stack + tabs)
- **Storage**: `@react-native-async-storage/async-storage`
- **UI/UX libraries**: Lottie, SVG, vector icons, charting, skeleton placeholders
- **Build targets**: iOS and Android

## Architecture Notes

- `src/context/AuthContext.jsx`: auth lifecycle, bootstrap, login/register/logout
- `src/api/client.js`: API client wrapper and request handling
- `src/api/newsApi.js`: feed + keyword endpoints
- `src/config/api.js`: environment-aware base URL resolution

This structure keeps network logic centralized and screen-level components focused on rendering/interaction.

## Setup & Run

```bash
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

## Environment / API Configuration

Default API hosts are set for local emulators/simulators:

- Android emulator: `http://10.0.2.2:8000`
- iOS simulator: `http://localhost:8000`

If backend is hosted elsewhere, update the API base URL config accordingly.

## Typical User Flow

1. User signs up or logs in
2. App stores token and loads current profile
3. User provides or updates tracked keywords
4. Feed is fetched from backend using authenticated context
5. User consumes news that is already filtered and scored upstream

## Why This Frontend Matters

This app turns complex backend intelligence into an intuitive daily workflow. Even if the backend has strong models, users only benefit when results are presented clearly, quickly, and reliably on mobile. This repository is where that value is delivered.

## Roadmap Ideas

- Push notifications for high-priority tracked topics
- Offline caching for recent feed items
- Richer credibility explanations in article cards
- Improved analytics dashboards for admin users

## Related Repositories

- Backend API + pipeline: `../Backend/TRAK_Backend`
- Web client docs: `web/README.md`

## Contribution Notes

- Keep API contracts aligned with backend changes
- Test auth + feed flows on both iOS and Android before PRs
- Avoid introducing mock-data behavior in production builds
