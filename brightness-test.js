// Test for improved brightness detector with ambient light sensor
const {
  RealtimeBrightnessDetector,
} = require("./lib/utils/realtimeBrightnessDetectorV2");

console.log("Testing Improved Brightness Detector...");

// Mock translations
const mockTranslations = {
  excellentLightingConditions: "🌟 Excellent lighting conditions!",
  goodLightingRecording: "✅ Good lighting for recording",
  adequateLightingImproved: "⚠️ Adequate lighting - could be improved",
  poorLightingAddLight: "💡 Poor lighting - add more light",
  veryPoorLightingInsufficient:
    "🔦 Very poor lighting - insufficient for recording",
  analyzingLightingConditions: "Analyzing lighting conditions...",
};

const handleLightingChange = (metrics) => {
  console.log("Lighting metrics received:");
  console.log("- Quality:", metrics.quality);
  console.log("- Luminance:", metrics.meanLuminance);
  console.log("- Illuminance:", metrics.illuminance || "N/A", "lux");
  console.log("- Score:", metrics.score);
  console.log("- Recommendation:", metrics.recommendation);
  console.log("- Source:", metrics.source);
  console.log("---");
};

// Create detector with ambient light sensor
const detector = new RealtimeBrightnessDetector(
  handleLightingChange,
  {
    updateInterval: 2000,
    enableTimeBasedEstimation: true,
    enableAmbientLightSensor: true,
  },
  mockTranslations
);

console.log("Starting brightness detector with ambient light sensor...");
detector.start();

// Run for 15 seconds then stop
setTimeout(() => {
  console.log("Stopping brightness detector...");
  detector.stop();
  console.log("Test completed. The detector now uses:");
  console.log(
    "1. Ambient light sensor (if available) for accurate lux readings"
  );
  console.log("2. Device motion for orientation compensation");
  console.log("3. Intelligent time-based estimation as fallback");
  console.log("4. No intrusive camera picture-taking");
}, 15000);
