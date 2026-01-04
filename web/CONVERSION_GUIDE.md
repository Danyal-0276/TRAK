# Conversion Guide: React Native to Web

This guide explains how to convert React Native components to web equivalents for the TRAK application.

## Component Mapping

### Basic Components

| React Native | Web Equivalent | Notes |
|-------------|----------------|-------|
| `View` | `div` | Use `div` with inline styles |
| `Text` | `span` or `Text` component | Use our `Text` component for consistency |
| `TouchableOpacity` | `button` | Convert to `button` with onClick |
| `ScrollView` | `div` with `overflow: auto` | Or use native scrolling |
| `Image` | `img` | Update `source` prop to `src` |
| `TextInput` | `input` | Use standard HTML input |
| `ActivityIndicator` | Custom spinner | Use CSS animation or loading state |

### Navigation

| React Native | Web Equivalent |
|-------------|----------------|
| `navigation.navigate('Screen')` | `useNavigate()` from react-router-dom |
| `navigation.goBack()` | `navigate(-1)` |
| `@react-navigation/native` | `react-router-dom` |

### Styling

| React Native | Web Equivalent |
|-------------|----------------|
| `StyleSheet.create()` | Inline styles or CSS modules |
| `flex: 1` | `flex: 1` (works in CSS) |
| `flexDirection: 'row'` | `display: 'flex', flexDirection: 'row'` |
| `justifyContent: 'center'` | `justifyContent: 'center'` |
| `alignItems: 'center'` | `alignItems: 'center'` |
| `padding: 16` | `padding: '16px'` |
| `marginTop: 20` | `marginTop: '20px'` |
| `borderRadius: 10` | `borderRadius: '10px'` |
| `backgroundColor: '#fff'` | `backgroundColor: '#fff'` |

### Icons

| React Native | Web Equivalent |
|-------------|----------------|
| `lucide-react-native` | `lucide-react` |

### Animations

| React Native | Web Equivalent |
|-------------|----------------|
| `Animated.Value` | CSS transitions or React state |
| `Animated.timing()` | CSS `transition` or `@keyframes` |
| `Animated.spring()` | CSS `transition` with easing |

## Step-by-Step Conversion Process

### 1. Copy the Screen File

Copy the screen from `src/route/[ScreenName]/[ScreenName].jsx` to `web/src/route/[ScreenName]/[ScreenName].jsx`

### 2. Update Imports

```javascript
// Before (React Native)
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

// After (Web)
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
// No need to import View, Text - use div and our Text component
```

### 3. Convert Components

```javascript
// Before
const MyScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <Text>Go Home</Text>
            </TouchableOpacity>
        </View>
    );
};

// After
const MyScreen = () => {
    const navigate = useNavigate();
    
    return (
        <div style={{ padding: 16 }}>
            <button onClick={() => navigate('/home')}>
                <Text>Go Home</Text>
            </button>
        </div>
    );
};
```

### 4. Convert Styles

```javascript
// Before
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    button: {
        padding: 12,
        borderRadius: 8,
    }
});

// After - Use inline styles or convert to CSS
<div style={{
    flex: 1,
    padding: '16px',
    backgroundColor: '#fff',
}}>
    <button style={{
        padding: '12px',
        borderRadius: '8px',
    }}>
```

### 5. Convert Form Inputs

```javascript
// Before
<TextInput
    value={email}
    onChangeText={setEmail}
    placeholder="Email"
/>

// After
<input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Email"
/>
```

### 6. Convert ScrollView

```javascript
// Before
<ScrollView contentContainerStyle={styles.content}>
    {items.map(...)}
</ScrollView>

// After
<div style={{ overflow: 'auto', height: '100vh' }}>
    {items.map(...)}
</div>
```

### 7. Update Route

Add the route to `web/src/navigation/AppRouter.jsx`:

```javascript
import MyScreen from '../route/MyScreen/MyScreen';

<Route path="/my-screen" element={<MyScreen />} />
```

## Common Patterns

### SafeAreaView

```javascript
// React Native
<SafeAreaView style={styles.container}>
    {content}
</SafeAreaView>

// Web - Just use div, browser handles safe areas
<div style={{ minHeight: '100vh', padding: '16px' }}>
    {content}
</div>
```

### StatusBar

```javascript
// React Native
<StatusBar barStyle="dark-content" />

// Web - Remove or use meta tags in index.html
// No equivalent needed
```

### LinearGradient

```javascript
// React Native
<LinearGradient colors={['#fff', '#000']}>
    {content}
</LinearGradient>

// Web
<div style={{
    background: 'linear-gradient(135deg, #fff, #000)'
}}>
    {content}
</div>
```

### Alert

```javascript
// React Native
Alert.alert('Title', 'Message');

// Web
alert('Message');
// Or use a custom modal component
```

## Testing Checklist

- [ ] All navigation works correctly
- [ ] Forms submit properly
- [ ] Styles match mobile design
- [ ] Responsive on different screen sizes
- [ ] Theme switching works
- [ ] Images load correctly
- [ ] No console errors
- [ ] Accessibility maintained

## Tips

1. **Use our UI components**: Always use `Text`, `Button`, `Input`, `Card`, `Screen` from `components/ui`
2. **Theme colors**: Use `useTheme()` hook to get theme colors
3. **Responsive design**: Use CSS media queries for responsive layouts
4. **Performance**: Use CSS transitions instead of JavaScript animations when possible
5. **Accessibility**: Add proper `aria-label` attributes to buttons and inputs

## Example: Complete Screen Conversion

See `web/src/route/LoginPage/LoginScreen.jsx` and `web/src/route/signUpPage/SignUpScreen.jsx` for complete examples of converted screens.


