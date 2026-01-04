# TRAK Web Application - Setup Instructions

## Quick Start

1. **Navigate to web directory:**
   ```bash
   cd web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Copy assets from mobile app:**
   ```bash
   # Copy images
   mkdir -p src/assets/images
   cp -r ../src/assets/images/* src/assets/images/
   
   # Copy fonts if needed
   mkdir -p src/assets/fonts
   cp -r ../src/assets/fonts/* src/assets/fonts/ 2>/dev/null || true
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to `http://localhost:3000`

## What's Been Converted

### ✅ Completed

- **Theme System**: Full theme context with light/dark mode support
- **UI Components**: Text, Button, Input, Card, Screen
- **Navigation**: React Router setup with all routes defined
- **Screens**: 
  - OpeningScreen (fully converted)
  - LoginScreen (fully converted)
  - SignUpScreen (fully converted)
- **Components**:
  - LoginPage components (Header, Footer, LoginForm, SocialButtons, etc.)
  - SignUpPage components (Header, Footer, SignUpForm, SocialButtons)

### ⏳ Pending (Placeholders Created)

The following screens have route placeholders but need full conversion:
- ForgotPasswordScreen
- ForgotPasswordCodeScreen
- ResetPasswordScreen
- PasswordChangedScreen
- TagSelectionScreen
- KeywordSelectionScreen
- NewsFeedScreen
- SearchScreen
- NotificationsScreen
- ProfileScreen
- AdminScreen
- SettingsScreen
- EditProfileScreen
- PrivacyScreen
- DataScreen
- CategoriesScreen
- AboutScreen
- ArticleDetailScreen

## Next Steps

1. **Convert remaining screens** using the `CONVERSION_GUIDE.md`
2. **Copy assets** from the mobile app to `web/src/assets/`
3. **Update image paths** in components to use web-compatible paths
4. **Test all routes** and functionality
5. **Add responsive design** for mobile/tablet/desktop
6. **Implement API integration** (replace mock APIs)

## File Structure

```
web/
├── src/
│   ├── components/
│   │   └── ui/              # Base UI components
│   ├── route/               # Screen components
│   │   ├── LoginPage/       # ✅ Converted
│   │   ├── signUpPage/      # ✅ Converted
│   │   ├── openingScreen/   # ✅ Converted
│   │   └── ...              # ⏳ Need conversion
│   ├── navigation/          # Router configuration
│   ├── theme/               # Theme system
│   └── assets/              # Images, fonts, etc.
├── index.html
├── vite.config.js
├── package.json
├── README.md
└── CONVERSION_GUIDE.md
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Notes

- Image paths in components use `/src/assets/images/` - you may need to adjust these based on your Vite configuration
- Some React Native specific features (StatusBar, SafeAreaView) have been removed or simplified
- Animations have been converted to CSS transitions where possible
- The app uses React Router for navigation instead of React Navigation


