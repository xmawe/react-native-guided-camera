#React Native Guided Camera

A React Native component for agricultural camera guidance with sensor-based motion detection, orientation tracking, and real-time feedback.

## Features

📷 **Camera Integration**: Built on top of expo-camera for reliable camera functionality  
🧭 **Orientation Guidance**: Real-time pitch, roll, and yaw detection with visual feedback  
🔄 **Motion Detection**: Advanced gyroscope and accelerometer-based stability analysis  
📍 **Speed Detection**: Movement tracking with recommendations for optimal recording  
💡 **Lighting Analysis**: Time-based brightness estimation for optimal capture conditions  
🎯 **Automatic Guidance**: Recording automatically sets current orientation as target  
📊 **Logging System**: Configurable on-screen and terminal logging for debugging  
🔄 **Smart Instruction Stacking**: Newest guidance messages appear on top  
📱 **Cross-Platform**: Works on both iOS and Android with Expo  
� **Multi-Language**: Full support for English, Arabic (RTL), and French  
�🎨 **Customizable UI**: Clean, intuitive interface with SVG icons

## Installation

```bash
npm install react-native-guided-camera
```

### Peer Dependencies

Make sure you have these peer dependencies installed:

```bash
npm install react react-native expo expo-camera expo-sensors expo-media-library react-native-svg
```

## Usage

### Basic Usage (Clean Mode)

```tsx
import React from "react";
import { GuidedCameraView } from "react-native-guided-camera";

export default function App() {
  return (
    <GuidedCameraView onCameraClose={() => console.log("Camera closed")} />
  );
}
```

### With Visual Logs Overlay

```tsx
import React from "react";
import { GuidedCameraView } from "react-native-guided-camera";

export default function App() {
  return (
    <GuidedCameraView
      onCameraClose={() => console.log("Camera closed")}
      onScreen={true} // Shows logs overlay on camera
    />
  );
}
```

### With Terminal Logs

```tsx
import React from "react";
import { GuidedCameraView } from "react-native-guided-camera";

export default function App() {
  return (
    <GuidedCameraView
      onCameraClose={() => console.log("Camera closed")}
      terminalLogs={true} // Outputs logs to console
    />
  );
}
```

### With Custom Video Handling

```tsx
import React from "react";
import { GuidedCameraView, VideoData } from "react-native-guided-camera";

export default function App() {
  const handleVideoSave = (videoData: VideoData) => {
    console.log("Video captured:", videoData);

    // Custom handling: upload to server, cloud storage, etc.
    // uploadToServer(videoData.uri);

    // Or save with custom metadata
    // saveWithMetadata(videoData);
  };

  return (
    <GuidedCameraView
      onCameraClose={() => console.log("Camera closed")}
      onVideoSave={handleVideoSave}
    />
  );
}
```

### With Instruction Events Analysis

```tsx
import React from "react";
import { GuidedCameraView, VideoData, InstructionEvent } from "react-native-guided-camera";

export default function App() {
  const handleVideoSave = (videoData: VideoData) => {
    console.log("Video recorded:", videoData.uri);
    console.log("Recording duration:", videoData.duration);
    
    // Analyze instruction events that occurred during recording
    if (videoData.instructionEvents && videoData.instructionEvents.length > 0) {
      console.log("Problems detected during recording:");
      
      videoData.instructionEvents.forEach((event: InstructionEvent) => {
        console.log(`${event.timestamp} => ${event.category}: ${event.message}`);
        // Example: "03:15 => angle: Tilt the device up slightly"
      });
      
      // Count problems by category
      const problemsByCategory = videoData.instructionEvents.reduce((acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("Problems summary:", problemsByCategory);
      // Example: { motion: 5, angle: 12, lighting: 2 }
    } else {
      console.log("Perfect recording! No issues detected.");
    }
  };

  return (
    <GuidedCameraView
      onCameraClose={() => console.log("Camera closed")}
      onVideoSave={handleVideoSave}
    />
  );
}
```

### With Custom Update Interval

```tsx
import React from "react";
import { GuidedCameraView } from "react-native-guided-camera";

export default function App() {
  return (
    <GuidedCameraView
      onCameraClose={() => console.log("Camera closed")}
      metricsUpdateInterval={500} // Update metrics every 500ms instead of default 100ms
    />
  );
}
```

### With Severity Level Filtering

```tsx
import React from "react";
import { GuidedCameraView } from "react-native-guided-camera";

export default function App() {
  return (
    <GuidedCameraView
      onCameraClose={() => console.log("Camera closed")}
      includeSeverityLevels={['error']} // Only include error-level instruction events
      onVideoSave={(videoData) => {
        // Will only receive critical errors, not warnings or info
        console.log("Critical issues during recording:", videoData.instructionEvents);
      }}
    />
  );
}
```

### Only Warnings and Errors (No Info)

```tsx
import React from "react";
import { GuidedCameraView } from "react-native-guided-camera";

export default function App() {
  return (
    <GuidedCameraView
      onCameraClose={() => console.log("Camera closed")}
      includeSeverityLevels={['warning', 'error']} // Exclude info-level events
      onVideoSave={(videoData) => {
        // Will receive warnings and errors, but not informational messages
        console.log("Issues during recording:", videoData.instructionEvents);
      }}
    />
  );
}
```
```

### Language Support

The component supports three languages with full UI translation:

```tsx
import React from "react";
import { GuidedCameraView } from "react-native-guided-camera";

// English (default)
export function EnglishCamera() {
  return (
    <GuidedCameraView
      language="english"
      onCameraClose={() => console.log("Camera closed")}
    />
  );
}

// Arabic with RTL support
export function ArabicCamera() {
  return (
    <GuidedCameraView
      language="arabic"
      onCameraClose={() => console.log("تم إغلاق الكاميرا")}
    />
  );
}

// French
export function FrenchCamera() {
  return (
    <GuidedCameraView
      language="french"
      onCameraClose={() => console.log("Caméra fermée")}
    />
  );
}
```

### Translation Utilities

For custom implementations, you can use the translation utilities to get localized instruction messages:

```tsx
import React from "react";
import { View, Text } from "react-native";
import {
  getTranslations,
  getAngleMessageTranslated,
  getYawMessageTranslated,
  getMotionStabilityMessage,
  getSpeedRecommendationMessage,
  getBrightnessRecommendationMessage,
  AngleMetrics,
  YawMetrics,
} from "react-native-guided-camera";

export function CustomInstructionDisplay() {
  const language = "arabic"; // or "english", "french"
  const translations = getTranslations(language);

  // Example: Get translated angle instruction
  const angleMetrics: AngleMetrics = {
    roll: 15,
    pitch: 5,
    isLevel: false,
    direction: "tilt_right",
    severity: "minor",
  };
  const angleMessage = getAngleMessageTranslated(angleMetrics, translations);

  // Example: Get translated yaw instruction
  const yawMetrics: YawMetrics = {
    yaw: 30,
    isOnTarget: false,
    deviation: 30,
    direction: "turn_left",
    severity: "major",
  };
  const yawMessage = getYawMessageTranslated(yawMetrics, translations);

  // Example: Get translated motion stability message
  const motionMessage = getMotionStabilityMessage("poor", translations);

  // Example: Get translated speed recommendation
  const speedMessage = getSpeedRecommendationMessage(2.5, true, translations);

  // Example: Get translated brightness recommendation
  const brightnessMessage = getBrightnessRecommendationMessage(
    "excellent",
    translations
  );

  return (
    <View>
      <Text>{angleMessage}</Text>
      <Text>{yawMessage}</Text>
      <Text>{motionMessage}</Text>
      <Text>{speedMessage}</Text>
      <Text>{brightnessMessage}</Text>
    </View>
  );
}
```

### Full Debug Mode

```tsx
import React from "react";
import { GuidedCameraView } from "react-native-guided-camera";

export default function App() {
  return (
    <GuidedCameraView
      onCameraClose={() => console.log("Camera closed")}
      onScreen={true} // Visual logs overlay
      terminalLogs={true} // Console logs
    />
  );
}
```

### Using Individual Components

You can also use the individual detector components separately:

```tsx
import React, { useEffect } from 'react';
import {
  PitchDetector,
  MotionDetector,
  YawDetector,
  SpeedDetector,
  RealtimeBrightnessDetector
} from 'react-native-guided-camera';

export default function CustomImplementation() {
  useEffect(() => {
    // Pitch detection
    const pitchDetector = new PitchDetector(
      (metrics) => {
        console.log('Angle metrics:', metrics);
      },
      {
        rollTolerance: 15,
        pitchTolerance: 15,
        updateInterval: 100,
      }
    );

    pitchDetector.start();

    // Motion detection
    const motionDetector = new MotionDetector(
      (metrics) => {
        console.log('Motion metrics:', metrics);
      },
      {
        updateInterval: 100,
        excellentThreshold: 75,
        goodThreshold: 60,
      }
    );

    motionDetector.start();

    return () => {
      pitchDetector.stop();
      motionDetector.stop();
    };
  }, []);

  return (
    // Your custom UI
  );
}
```

## Props

### GuidedCameraViewProps

| Prop                    | Type                             | Default     | Description                                                        |
| ----------------------- | -------------------------------- | ----------- | ------------------------------------------------------------------ |
| `onCameraClose`         | `() => void`                     | `undefined` | Callback when camera is closed                                     |
| `onScreen`              | `boolean`                        | `false`     | Show visual logs overlay on camera view                            |
| `terminalLogs`           | `boolean`                        | `false`     | Output metrics logs to console                                     |
| `onVideoSave`            | `(videoData: VideoData) => void` | `undefined` | Custom video save handler (bypasses default saving)                |
| `language`               | `SupportedLanguage`              | `'english'` | UI language ('english', 'arabic', 'french')                        |
| `metricsUpdateInterval`  | `number`                         | `100`       | Metrics update interval in milliseconds (100ms-2000ms recommended) |
| `includeSeverityLevels`  | `('info' \| 'warning' \| 'error')[]` | `['info', 'warning', 'error']` | Which severity levels to include in instruction events |

### SupportedLanguage Type

```tsx
type SupportedLanguage = "english" | "arabic" | "french";
```

### VideoData Interface

| Property            | Type                | Description                              |
| ------------------- | ------------------- | ---------------------------------------- |
| `uri`               | `string`            | Local file URI of the recorded video     |
| `duration`          | `number`            | Recording duration in seconds (optional) |
| `size`              | `number`            | File size in bytes (optional)            |
| `instructionEvents` | `InstructionEvent[]`| Array of all instruction events that occurred during recording (optional) |

### InstructionEvent Interface

| Property      | Type                                            | Description                              |
| ------------- | ----------------------------------------------- | ---------------------------------------- |
| `timestamp`   | `string`                                        | Format: "MM:SS" relative to recording start |
| `timestampMs` | `number`                                        | Absolute timestamp in milliseconds from recording start |
| `category`    | `'motion' \| 'angle' \| 'speed' \| 'lighting' \| 'yaw' \| 'guidance'` | Type of instruction/problem detected |
| `severity`    | `'info' \| 'warning' \| 'error'`                | Severity level of the instruction |
| `message`     | `string`                                        | Human-readable instruction message |
| `metrics`     | `object` (optional)                             | Detailed metrics at the time of instruction |

## Key Features

### Dynamic Video Handling

The `onVideoSave` prop provides maximum flexibility for video handling:

- **Default behavior**: Without `onVideoSave`, videos are saved to device gallery
- **Custom handling**: With `onVideoSave`, you receive the video data and handle it yourself
- **Use cases**: Upload to cloud, send to server, custom processing, metadata addition

### Automatic Guidance Mode

When you start recording, the camera automatically:

- Sets the current orientation as the target angle
- Activates guidance mode with visual indicators
- Provides real-time feedback to maintain that orientation
- Shows compass direction guidance when needed

### Smart Instruction Stacking

Guidance messages are intelligently prioritized:

1. **Speed warnings** (highest priority) - when moving too fast
2. **Motion stability** - when device is unstable
3. **Orientation guidance** - directional instructions during recording
4. **Basic level guidance** - general orientation feedback

### Multi-Language Support

Full internationalization support with:

- **English**: Default language with all features
- **Arabic**: Full RTL (Right-to-Left) support with Arabic translations
- **French**: Complete French language interface

All UI elements are translated including:

- Status indicators (pitch, motion, speed, brightness, compass)
- Guidance messages (rotate left/right, tilt up/down, etc.)
- Error messages and alerts
- Recording states and permissions
- Quality indicators (excellent, good, fair, poor, etc.)

The language can be set via the `language` prop and will instantly update all text in the interface.

### Custom Translation Access

You can also access the translation utilities for your own use:

```tsx
import { getTranslations } from "react-native-guided-camera";

const translations = getTranslations("arabic");
console.log(translations.recording); // "تسجيل"
```

### Logging System

The component includes a sophisticated logging system:

- **Clean Mode** (default): No logs, clean operation
- **Visual Logs** (`onScreen={true}`): Overlay with real-time metrics
- **Terminal Logs** (`terminalLogs={true}`): Console output for debugging
- **Full Debug** (both enabled): Complete monitoring solution

### Visual Indicators

- **Angle Indicator**: Circular bubble level showing roll/pitch
- **Balance Bars**: Linear indicators for precise alignment
- **Compass**: Direction guidance during recording (when applicable)
- **Status Bar**: Real-time metrics for all sensors
- **Target Indicators**: Green markers showing desired orientation
  | `style` | `any` | `undefined` | Custom styling for the container |

## Sensor Metrics

### Motion Detection Thresholds

The component uses optimized thresholds for better user experience:

```tsx
{
  excellentThreshold: 75,  // Easier to achieve "excellent" stability
  goodThreshold: 60,       // Lowered for more "good" ratings
  fairThreshold: 40,       // Adjusted for realistic conditions
  poorThreshold: 20        // Threshold for "poor" stability
}
```

### Real-time Feedback

All sensors provide continuous feedback:

- **Angle**: Roll/pitch angles with severity levels
- **Motion**: Stability score with recommendations
- **Speed**: Movement detection with km/h readings
- **Lighting**: Quality assessment with luminance values
- **Compass**: Direction tracking during guidance mode

## API Reference

### Detector Classes

#### PitchDetector

- **Purpose**: Detects device orientation (pitch and roll)
- **Methods**: `start()`, `stop()`
- **Config**: `rollTolerance`, `pitchTolerance`, `updateInterval`

#### MotionDetector

- **Purpose**: Analyzes motion stability using gyroscope and accelerometer
- **Methods**: `start()`, `stop()`, `getLastMetrics()`, `isRunning()`
- **Config**: `updateInterval`, `historySize`, stability thresholds

#### YawDetector

- **Purpose**: Compass direction tracking using magnetometer
- **Methods**: `start()`, `stop()`, `setTarget()`, `clearTarget()`, `getCurrentYaw()`
- **Config**: `updateInterval`, `yawTolerance`, `smoothingFactor`

#### SpeedDetector

- **Purpose**: Movement speed detection using accelerometer
- **Methods**: `start()`, `stop()`, `isRunning()`
- **Config**: `updateInterval`, movement thresholds

#### RealtimeBrightnessDetector

- **Purpose**: Lighting condition analysis with time-based estimation
- **Methods**: `start()`, `stop()`, `getLastMetrics()`, `isRunning()`
- **Config**: `updateInterval`, `enableTimeBasedEstimation`

### Utility Functions

```tsx
import {
  calculateAngleColor,
  getAngleMessage,
  getMotionColor,
  getSpeedColor,
  shouldAllowRecording,
  shouldAllowRecordingSpeed,
} from "react-native-guided-camera";
```

## Permissions

The component requires the following permissions:

- **Camera**: For video recording
- **Media Library**: For saving videos to device gallery
- **Sensors**: For motion, orientation, and compass detection

These are handled automatically by the Expo APIs, but make sure your app configuration includes the necessary permissions.

## Requirements

- React Native 0.70+
- Expo SDK 49+
- iOS 11+ / Android API 21+

## Agricultural Use Cases

This component was specifically designed for agricultural applications:

- **Plant Documentation**: Stable, well-oriented recording of crops
- **Field Surveys**: Consistent camera positioning for comparative analysis
- **Precision Agriculture**: GPS-free guidance using device sensors
- **Equipment Monitoring**: Stable recording in moving agricultural vehicles
- **Quality Assessment**: Optimal lighting and orientation detection

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.

---

**Keywords**: react-native, camera, agriculture, sensors, motion-detection, orientation, guidance, expo
