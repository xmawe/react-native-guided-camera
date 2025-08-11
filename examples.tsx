import React from "react";
import { Alert } from "react-native";
import {
  GuidedCameraView,
  VideoData,
  SupportedLanguage,
  getTranslations,
  getAngleMessageTranslated,
  getYawMessageTranslated,
  getMotionStabilityMessage,
  getSpeedRecommendationMessage,
  getBrightnessRecommendationMessage,
} from "./src/index";

// Example 1: Basic usage (saves to gallery)
export const BasicUsage = () => (
  <GuidedCameraView onCameraClose={() => console.log("Camera closed")} />
);

// Example 2: With custom video handling
export const CustomVideoHandling = () => {
  const handleVideoSave = (videoData: VideoData) => {
    console.log("Custom video handler called:", videoData);

    // Example: Upload to your server
    uploadToServer(videoData);

    // Example: Show custom success message
    Alert.alert(
      "Video Captured!",
      `Duration: ${videoData.duration}s\nURI: ${videoData.uri}`,
      [{ text: "OK" }]
    );
  };

  return (
    <GuidedCameraView
      onCameraClose={() => console.log("Camera closed")}
      onVideoSave={handleVideoSave}
    />
  );
};

// Example 3: Cloud storage integration
export const CloudStorageExample = () => {
  const handleVideoSave = async (videoData: VideoData) => {
    try {
      // Example: Upload to AWS S3, Google Cloud, etc.
      const uploadResult = await uploadToCloudStorage(videoData.uri);

      Alert.alert("Success", `Video uploaded to cloud: ${uploadResult.url}`);
    } catch (error) {
      Alert.alert("Error", "Failed to upload video to cloud");
    }
  };

  return (
    <GuidedCameraView
      onCameraClose={() => console.log("Camera closed")}
      onVideoSave={handleVideoSave}
    />
  );
};

// Example 4: Server integration with metadata
export const ServerIntegrationExample = () => {
  const handleVideoSave = async (videoData: VideoData) => {
    try {
      // Add custom metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        location: await getCurrentLocation(),
        deviceInfo: getDeviceInfo(),
        duration: videoData.duration,
      };

      // Send to your API
      const response = await fetch("https://your-api.com/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUri: videoData.uri,
          metadata,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Video processed and sent to server!");
      } else {
        throw new Error("Server error");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to process video");
    }
  };

  return (
    <GuidedCameraView
      onCameraClose={() => console.log("Camera closed")}
      onVideoSave={handleVideoSave}
    />
  );
};

// Example 5: Debug mode with custom handling
export const DebugModeExample = () => {
  const handleVideoSave = (videoData: VideoData) => {
    console.log("DEBUG: Video captured with following data:", videoData);

    // In debug mode, you might want to log additional information
    console.log("DEBUG: File size:", videoData.size);
    console.log("DEBUG: Recording duration:", videoData.duration);

    // Still handle the video as needed
    processVideoForDebugging(videoData);
  };

  return (
    <GuidedCameraView
      onCameraClose={() => console.log("Camera closed")}
      onVideoSave={handleVideoSave}
      onScreen={true} // Show visual logs
      terminalLogs={true} // Show console logs
    />
  );
};

// Example 6: Language Support - English (Default)
export const EnglishExample = () => {
  const handleVideoSave = (videoData: VideoData) => {
    Alert.alert("Success", "Video saved successfully!");
  };

  return (
    <GuidedCameraView
      language="english"
      onCameraClose={() => console.log("Camera closed")}
      onVideoSave={handleVideoSave}
    />
  );
};

// Example 7: Language Support - Arabic (with RTL support)
export const ArabicExample = () => {
  const handleVideoSave = (videoData: VideoData) => {
    Alert.alert("نجح", "تم حفظ الفيديو بنجاح!");
  };

  return (
    <GuidedCameraView
      language="arabic"
      onCameraClose={() => console.log("تم إغلاق الكاميرا")}
      onVideoSave={handleVideoSave}
    />
  );
};

// Example 8: Language Support - French
export const FrenchExample = () => {
  const handleVideoSave = (videoData: VideoData) => {
    Alert.alert("Succès", "Vidéo sauvegardée avec succès!");
  };

  return (
    <GuidedCameraView
      language="french"
      onCameraClose={() => console.log("Caméra fermée")}
      onVideoSave={handleVideoSave}
    />
  );
};

// Example 9: Dynamic Language Switching
export const DynamicLanguageExample = () => {
  const [language, setLanguage] = React.useState<SupportedLanguage>("english");

  const handleVideoSave = (videoData: VideoData) => {
    const messages = {
      english: "Video saved successfully!",
      arabic: "تم حفظ الفيديو بنجاح!",
      french: "Vidéo sauvegardée avec succès!",
    };

    Alert.alert("Success", messages[language]);
  };

  // In a real app, you might have UI controls to change language
  const switchToArabic = () => setLanguage("arabic");
  const switchToFrench = () => setLanguage("french");
  const switchToEnglish = () => setLanguage("english");

  return (
    <GuidedCameraView
      language={language}
      onCameraClose={() => console.log("Camera closed")}
      onVideoSave={handleVideoSave}
    />
  );
};

// Example 10: Using Translated Instruction Messages
export const TranslatedInstructionsExample = () => {
  const [language, setLanguage] = React.useState<SupportedLanguage>("arabic");

  const handleVideoSave = (videoData: VideoData) => {
    Alert.alert("Success", "Video saved successfully!");
  };

  // Example: Using translation utilities for custom instruction display
  const showInstructionExamples = () => {
    const translations = getTranslations(language);

    // Example angle instruction
    const angleMetrics = {
      roll: 15,
      pitch: 5,
      isLevel: false,
      direction: "tilt_right" as const,
      severity: "minor" as const,
    };
    const angleMessage = getAngleMessageTranslated(angleMetrics, translations);
    console.log("Angle instruction:", angleMessage);

    // Example yaw instruction
    const yawMetrics = {
      yaw: 30,
      isOnTarget: false,
      deviation: 30,
      direction: "turn_left" as const,
      severity: "major" as const,
    };
    const yawMessage = getYawMessageTranslated(yawMetrics, translations);
    console.log("Yaw instruction:", yawMessage);

    // Example motion stability instruction
    const motionMessage = getMotionStabilityMessage("poor", translations);
    console.log("Motion instruction:", motionMessage);

    // Example speed instruction
    const speedMessage = getSpeedRecommendationMessage(2.5, true, translations);
    console.log("Speed instruction:", speedMessage);

    // Example brightness instruction
    const brightnessMessage = getBrightnessRecommendationMessage(
      "excellent",
      translations
    );
    console.log("Brightness instruction:", brightnessMessage);
  };

  // Call this to see translated instructions in console
  React.useEffect(() => {
    showInstructionExamples();
  }, [language]);

  return (
    <GuidedCameraView
      language={language}
      onCameraClose={() => console.log("Camera closed")}
      onVideoSave={handleVideoSave}
    />
  );
};

// Helper functions (implement these based on your needs)
async function uploadToServer(videoData: VideoData) {
  // Implement your server upload logic
  console.log("Uploading video to server:", videoData.uri);
}

async function uploadToCloudStorage(uri: string) {
  // Implement your cloud storage upload logic
  console.log("Uploading to cloud storage:", uri);
  return { url: "https://cloud-storage.com/video123" };
}

async function getCurrentLocation() {
  // Implement location detection
  return { lat: 0, lng: 0 };
}

function getDeviceInfo() {
  // Implement device info collection
  return { platform: "ios", model: "iPhone" };
}

function processVideoForDebugging(videoData: VideoData) {
  // Implement debug-specific processing
  console.log("Processing video for debugging:", videoData);
}
