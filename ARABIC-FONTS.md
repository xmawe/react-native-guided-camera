# Arabic Font Support

The GuidedCameraView component supports IBM Plex Sans Arabic font for better Arabic text rendering when the language is set to "arabic".

## Installation

To enable Arabic fonts, install the optional Google Fonts package:

```bash
npm install @expo-google-fonts/ibm-plex-sans-arabic
# or
yarn add @expo-google-fonts/ibm-plex-sans-arabic
```

## Usage

The Arabic fonts will be automatically loaded when you set the language prop to "arabic":

```tsx
import { GuidedCameraView } from "react-native-guided-camera";

export default function App() {
  return (
    <GuidedCameraView
      language="arabic"
      // ... other props
    />
  );
}
```

## Fallback Behavior

If the `@expo-google-fonts/ibm-plex-sans-arabic` package is not installed, the component will gracefully fall back to system fonts while still maintaining proper RTL text direction and alignment.

## Font Weights Available

- Regular (400)
- Medium (500)
- SemiBold (600)
- Bold (700)

The component automatically applies the appropriate font weight based on the text importance and context.

## Troubleshooting

If you encounter font loading issues:

1. Make sure you have the latest version of Expo
2. Ensure the Google Fonts package is properly installed
3. Check that your app has internet connectivity during the first font load
4. The component will work without custom fonts if there are any loading issues

## Manual Font Loading

If you need to preload fonts in your app, you can use:

```tsx
import { useArabicFonts } from "react-native-guided-camera";

export default function App() {
  const fontsLoaded = useArabicFonts();

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return <YourAppContent />;
}
```
