# Color Theme System

This directory contains all color definitions for the TRAK app. The color system is organized into separate files for easy customization.

## File Structure

- **`lightColors.js`** - Color palette for light theme
- **`darkColors.js`** - Color palette for dark theme
- **`index.js`** - Central export point for all colors

## How to Change Colors

To change the app's color scheme, simply modify the color values in the respective theme files:

### For Light Theme
Edit `src/theme/colors/lightColors.js`

### For Dark Theme
Edit `src/theme/colors/darkColors.js`

### Example
```javascript
// In lightColors.js, change:
primary: '#6366F1',  // Change this hex value to your desired color
primaryDark: '#4F46E5',  // And adjust related colors accordingly
primaryLight: '#818CF8',
```

## Color Categories

Each theme file includes these color categories:

- **Primary Colors** - Main brand colors (indigo/purple gradient)
- **Secondary Colors** - Supporting accent colors (cyan/teal)
- **Background Colors** - Screen and container backgrounds
- **Surface Colors** - Cards and elevated elements
- **Text Colors** - Typography colors
- **Border Colors** - Border and divider colors
- **Accent Colors** - Highlight and emphasis colors
- **Status Colors** - Success, warning, error, info states
- **Social Media Colors** - Facebook, Google, Apple brand colors
- **Shadow & Overlay Colors** - Shadow and overlay effects
- **Gradient Colors** - Pre-defined gradient combinations
- **Chart Colors** - Data visualization colors

## Best Practices

1. **Maintain Contrast** - Ensure text colors have sufficient contrast against backgrounds
2. **Consistent Gradients** - When changing primary colors, update gradient arrays to match
3. **Test Both Themes** - Always check both light and dark themes after changes
4. **Status Colors** - Keep status colors (success/warning/error) consistent for user recognition

## Usage in Components

Colors are accessed through the theme context:

```javascript
import { useTheme } from '../../theme/ThemeContext';

const MyComponent = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary }}>Hello</Text>
    </View>
  );
};
```

## Current Color Scheme

The app uses a modern, vibrant color scheme:
- **Primary**: Indigo/Purple gradient (#6366F1 to #8B5CF6)
- **Secondary**: Cyan/Teal accents (#06B6D4)
- **Accent**: Vibrant purple (#8B5CF6)
- **Status**: Emerald (success), Amber (warning), Red (error), Blue (info)

This creates an eye-catching, modern appearance that works well for a news aggregation app.

