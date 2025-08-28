# Local Testing Guide for React Native Guided Camera

This guide shows you how to test your package locally in a React Native project before publishing.

## Method 1: npm link (Recommended)

### Step 1: Build and Link the Package

Open terminal in your package directory:

```cmd
cd "c:\Users\user\Desktop\react-native-guided-camera\packages\react-native-guided-camera"
npm run build
npm link
```

### Step 2: Create or Use a Test React Native Project

Create a new Expo project for testing:

```cmd
cd c:\Users\user\Desktop
npx create-expo-app test-guided-camera
cd test-guided-camera
```

### Step 3: Link the Package in Your Test Project

```cmd
npm link react-native-guided-camera
```

### Step 4: Install Required Dependencies

In your test project, install the peer dependencies:

```cmd
npx expo install expo-camera expo-sensors expo-media-library react-native-svg
```

### Step 5: Create a Test Component

Create `App.js` in your test project:

```jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { GuidedCameraView } from "react-native-guided-camera";

export default function App() {
  return (
    <View style={styles.container}>
      <GuidedCameraView
        language="english" // or "arabic" or "french"
        onCameraClose={() => console.log("Camera closed")}
        onScreen={true} // Show debug logs
        terminalLogs={true} // Show console logs
        onVideoSave={(videoData) => {
          console.log("Video saved:", videoData);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### Step 6: Run the Test Project

```cmd
npx expo start
```

## Method 2: Direct File Linking (Alternative)

### Step 1: Build the Package

```cmd
cd "c:\Users\user\Desktop\react-native-guided-camera\packages\react-native-guided-camera"
npm run build
```

### Step 2: Copy Package to Test Project

Create a test project and copy your built package:

```cmd
cd c:\Users\user\Desktop
npx create-expo-app test-guided-camera
cd test-guided-camera
mkdir local-packages
xcopy /E /I "c:\Users\user\Desktop\react-native-guided-camera\packages\react-native-guided-camera" "local-packages\react-native-guided-camera"
```

### Step 3: Install from Local Path

```cmd
npm install ./local-packages/react-native-guided-camera
npx expo install expo-camera expo-sensors expo-media-library react-native-svg expo-font
```

## Method 3: Using Relative Path in package.json (Quick Test)

In your test project's `package.json`, add:

```json
{
  "dependencies": {
    "react-native-guided-camera": "file:../react-native-guided-camera/packages/react-native-guided-camera"
  }
}
```

Then run:

```cmd
npm install
```

## Switching from npm Package to Local Version

If you already have the package installed from npm and want to test your local changes:

### Method 1: Uninstall and Link (Recommended)

1. **Uninstall the npm package:**

   ```cmd
   npm uninstall react-native-guided-camera
   ```

2. **Clear Metro cache:**

   ```cmd
   npx expo start --clear
   # or
   rm -rf node_modules/.cache
   ```

3. **Link your local package:**

   ```cmd
   # First, in your package directory:
   cd "c:\Users\user\Desktop\react-native-guided-camera\packages\react-native-guided-camera"
   npm run build
   npm link

   # Then, in your test project:
   cd path\to\your\test-project
   npm link react-native-guided-camera
   ```

4. **Restart the development server:**
   ```cmd
   npx expo start --clear
   ```

### Method 2: Override with Local Path

1. **Edit package.json in your test project:**

   ```json
   {
     "dependencies": {
       "react-native-guided-camera": "file:../react-native-guided-camera/packages/react-native-guided-camera"
       // ... other dependencies
     }
   }
   ```

2. **Reinstall dependencies:**
   ```cmd
   npm install
   npx expo start --clear
   ```

### Method 3: Force Link (if Method 1 doesn't work)

1. **Force unlink any existing links:**

   ```cmd
   npm unlink react-native-guided-camera --no-save
   ```

2. **Delete node_modules and package-lock.json:**

   ```cmd
   rm -rf node_modules
   rm package-lock.json
   # On Windows:
   rmdir /s node_modules
   del package-lock.json
   ```

3. **Reinstall and link:**
   ```cmd
   npm install
   npm link react-native-guided-camera
   ```

### Verification

Check which version you're using:

1. **Check package.json:**

   ```cmd
   cat package.json | grep react-native-guided-camera
   ```

2. **Check node_modules (should show a symlink):**

   ```cmd
   ls -la node_modules/react-native-guided-camera
   # On Windows:
   dir node_modules\react-native-guided-camera
   ```

   - If it shows a symlink (->), you're using the local version
   - If it shows a regular directory, you're using the npm version

3. **Add a console.log in your local package to verify:**
   In your local `GuidedCameraView.tsx`, add:
   ```tsx
   console.log("🚀 Using LOCAL version of react-native-guided-camera");
   ```
   Then rebuild and check if this appears in your test app console.

## Testing Different Features

### Basic Camera Test

```jsx
<GuidedCameraView onCameraClose={() => console.log("Camera closed")} />
```

### With Debug Logs

```jsx
<GuidedCameraView
  onScreen={true}
  terminalLogs={true}
  onCameraClose={() => console.log("Camera closed")}
/>
```

### Arabic Language Test

```jsx
<GuidedCameraView
  language="arabic"
  onCameraClose={() => console.log("تم إغلاق الكاميرا")}
/>
```

### Custom Video Handling

```jsx
<GuidedCameraView
  onVideoSave={(videoData) => {
    console.log("Custom video handling:", videoData);
    // Test your custom logic here
  }}
/>
```

## Testing Brightness Detection

To test the brightness issue you mentioned:

1. Start the app with `terminalLogs={true}`
2. Cover the camera with your hand
3. Watch the console for brightness detection logs
4. Check if it shows "poor" or "very poor" lighting

Expected console output when covered:

```
🎥 VIDEO LIGHTING ASSESSMENT:
Lux: 0-5 | Luminance: 20-30 | Quality: VERY POOR
💡 Very poor lighting - insufficient for recording
```

## Updating After Changes

When you make changes to your package:

1. Rebuild the package:

```cmd
cd "c:\Users\user\Desktop\react-native-guided-camera\packages\react-native-guided-camera"
npm run build
```

2. If using npm link, the changes should be reflected immediately in your test project
3. If using file copy method, copy the files again
4. Restart your Expo development server

## Troubleshooting

### Package not found

- Make sure you ran `npm link` in the package directory
- Verify the package name matches exactly

### TypeScript errors

- Make sure the package builds successfully with `npm run build`
- Check that all dependencies are installed

### Camera permissions

- Make sure you're testing on a physical device
- Camera permissions are required for testing

### Metro bundler issues

- Clear Metro cache: `npx expo start --clear`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## Testing Checklist

- [ ] Basic camera functionality works
- [ ] Brightness detection shows correct values when covered
- [ ] Motion detection responds to device movement
- [ ] Language switching works (English, Arabic, French)
- [ ] Recording and saving videos works
- [ ] Debug logs show meaningful information
- [ ] No console errors or warnings
- [ ] Performance is acceptable on target devices

## Ready for Publishing

Once local testing passes all checks:

1. Update version in package.json
2. Run final build: `npm run build`
3. Publish: `npm publish`

Remember to test on both iOS and Android devices if possible!
