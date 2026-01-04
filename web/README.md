# TRAK Web Application

This is the web version of the TRAK mobile application, converted from React Native to a web application using React and React Router.

## Features

- ✅ Theme system (Light/Dark mode)
- ✅ Responsive UI components
- ✅ React Router for navigation
- ✅ Modern web design matching mobile app

## Getting Started

### Prerequisites

- Node.js >= 20
- npm or yarn

### Installation

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
web/
├── src/
│   ├── components/      # Reusable UI components
│   │   └── ui/         # Base UI components (Text, Button, Input, etc.)
│   ├── route/          # Screen components
│   │   ├── LoginPage/
│   │   ├── openingScreen/
│   │   └── ...
│   ├── navigation/     # Routing configuration
│   ├── theme/          # Theme system (colors, context)
│   └── assets/         # Images, fonts, etc.
├── index.html
├── vite.config.js
└── package.json
```

## Converting More Screens

To convert additional screens from the mobile app:

1. Copy the screen file from `src/route/[ScreenName]/[ScreenName].jsx`
2. Convert React Native components to web equivalents:
   - `View` → `div`
   - `Text` → `span` or use `Text` component
   - `TouchableOpacity` → `button`
   - `ScrollView` → `div` with `overflow: auto`
   - `StyleSheet.create()` → inline styles or CSS modules
   - `navigation.navigate()` → `useNavigate()` from react-router-dom
3. Update the route in `src/navigation/AppRouter.jsx`

## Notes

- Some screens are placeholders and need to be fully converted
- Image paths may need to be adjusted for web
- Some React Native specific features (like StatusBar) have been removed or replaced
- Animations have been simplified for web compatibility

## Development

The app uses:
- **React 19** - UI library
- **React Router DOM 6** - Routing
- **Vite** - Build tool
- **Lucide React** - Icons


