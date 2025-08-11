# Manual npm link Setup for React Native Guided Camera

## Method 1: npm link (Standard approach)

### Step 1: Prepare and Link Your Package

```bash
# Navigate to your package directory
cd c:\Users\user\Desktop\react-native-guided-camera\packages\react-native-guided-camera

# Build the package
npm run build

# Create global symlink
npm link
```

### Step 2: Create Test App

```bash
# Navigate to parent directory
cd c:\Users\user\Desktop

# Create new Expo app
npx create-expo-app guided-camera-test

# Navigate to test app
cd guided-camera-test

# Install required dependencies
npx expo install expo-camera expo-sensors expo-media-library react-native-svg

# Link your local package
npm link react-native-guided-camera
```

### Step 3: Fix Metro Configuration (Important for React Native)

Create or update `metro.config.js` in your test app:

```javascript
const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add the path to your package
const packagePath = path.resolve(
  __dirname,
  "../../react-native-guided-camera/packages/react-native-guided-camera"
);

config.watchFolders = [packagePath];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(packagePath, "node_modules"),
];

module.exports = config;
```

### Step 4: Start with Clear Cache

```bash
# Clear Metro cache and start
npx expo start --clear
```

## Method 2: Direct File Path (Recommended for local testing)

If npm link doesn't work, use direct file installation:

### Step 1: Build Your Package

```bash
# In your package directory
cd c:\Users\user\Desktop\react-native-guided-camera\packages\react-native-guided-camera
npm run build
```

### Step 2: Create Test App

```bash
# Navigate to parent directory
cd c:\Users\user\Desktop

# Create new Expo app
npx create-expo-app guided-camera-test
cd guided-camera-test

# Install dependencies
npx expo install expo-camera expo-sensors expo-media-library react-native-svg
```

### Step 3: Install from Local Path

```bash
# Install directly from local path
npm install file:../react-native-guided-camera/packages/react-native-guided-camera
```

### Step 4: Start Testing

```bash
npx expo start
```

## Method 3: Manual Copy (Quick and reliable)

### Step 1: Build Package

```bash
cd c:\Users\user\Desktop\react-native-guided-camera\packages\react-native-guided-camera
npm run build
```

### Step 2: Create Test App

```bash
cd c:\Users\user\Desktop
npx create-expo-app guided-camera-test
cd guided-camera-test
npx expo install expo-camera expo-sensors expo-media-library react-native-svg
```

### Step 3: Copy Package Files

```bash
# Create a local packages directory
mkdir packages
mkdir packages\react-native-guided-camera

# Copy your built package (you can do this manually in File Explorer)
# Copy from: c:\Users\user\Desktop\react-native-guided-camera\packages\react-native-guided-camera
# To: c:\Users\user\Desktop\guided-camera-test\packages\react-native-guided-camera
```

### Step 4: Update package.json

Add to your test app's `package.json`:

```json
{
  "dependencies": {
    "react-native-guided-camera": "file:./packages/react-native-guided-camera"
  }
}
```

Then run:

```bash
npm install
```

## Test App Code

Create this `App.js` in your test app:

```javascript
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { GuidedCameraView } from "react-native-guided-camera";

export default function App() {
  const [showCamera, setShowCamera] = useState(false);
  const [language, setLanguage] = useState("english");

  if (showCamera) {
    return (
      <View style={styles.container}>
        <GuidedCameraView
          language={language}
          onScreen={true}
          terminalLogs={true}
          onCameraClose={() => setShowCamera(false)}
          onVideoSave={(videoData) => {
            console.log("Video saved:", videoData);
            alert(`Video saved! Duration: ${videoData.duration}s`);
          }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.menuContainer}>
      <Text style={styles.title}>Guided Camera Test</Text>

      <Text style={styles.subtitle}>Select Language:</Text>

      <TouchableOpacity
        style={[styles.button, language === "english" && styles.activeButton]}
        onPress={() => setLanguage("english")}
      >
        <Text
          style={[
            styles.buttonText,
            language === "english" && styles.activeButtonText,
          ]}
        >
          English
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, language === "arabic" && styles.activeButton]}
        onPress={() => setLanguage("arabic")}
      >
        <Text
          style={[
            styles.buttonText,
            language === "arabic" && styles.activeButtonText,
          ]}
        >
          العربية (Arabic)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, language === "french" && styles.activeButton]}
        onPress={() => setLanguage("french")}
      >
        <Text
          style={[
            styles.buttonText,
            language === "french" && styles.activeButtonText,
          ]}
        >
          Français (French)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.openButton]}
        onPress={() => setShowCamera(true)}
      >
        <Text style={[styles.buttonText, styles.openButtonText]}>
          Open Camera ({language})
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  menuContainer: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 20,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  button: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeButton: { backgroundColor: "#2196F3", borderColor: "#1976D2" },
  buttonText: { fontSize: 16, fontWeight: "500", color: "#333" },
  activeButtonText: { color: "white" },
  openButton: {
    backgroundColor: "#4CAF50",
    marginTop: 30,
    borderColor: "#388E3C",
  },
  openButtonText: { color: "white", fontWeight: "bold" },
});
```

## Troubleshooting

### Common Issues and Solutions

1. **"Unable to resolve" error:**

   - Try Method 2 (file path) instead of npm link
   - Clear Metro cache: `npx expo start --clear`
   - Restart your terminal/IDE

2. **TypeScript errors:**

   - Restart TypeScript service in your editor
   - Clear cache and restart

3. **Metro bundler issues:**

   - Update metro.config.js as shown above
   - Use `--clear` flag when starting

4. **Package not found:**
   - Verify the build was successful
   - Check that package.json exports are correct
   - Try the manual copy method

### Development Workflow

1. Make changes in your package
2. Run `npm run build` in package directory
3. If using Method 1: Package is automatically updated
4. If using Method 2: Run `npm install` in test app
5. If using Method 3: Copy files manually again
6. Test your changes

### Recommended Method

For most reliable testing, use **Method 2 (Direct File Path)** as it:

- Avoids symlink issues
- Works reliably with Metro bundler
- Easy to update when you make changes
- Most similar to how users will install your package

Just remember to run `npm run build` in your package directory whenever you make changes, then `npm install` in your test app to pick up the updates.
