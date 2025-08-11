// Main component
import GuidedCameraView from "./components/GuidedCameraView";
export { GuidedCameraView };
export type {
  GuidedCameraViewProps,
  VideoData,
  SupportedLanguage,
} from "./types";

// Utility classes
export { PitchDetector } from "./utils/pitchDetector";
export { YawDetector } from "./utils/yawDetector";
export { MotionDetector } from "./utils/motionDetectorV2";
export { FallbackSpeedDetector as SpeedDetector } from "./utils/fallbackSpeedDetector";
export { RealtimeBrightnessDetector } from "./utils/realtimeBrightnessDetectorV2";

// Types
export type { AngleMetrics, PitchDetectorConfig } from "./utils/pitchDetector";
export type { YawMetrics, YawDetectorConfig } from "./utils/yawDetector";
export type {
  MotionMetrics,
  MotionDetectorConfig,
} from "./utils/motionDetectorV2";
export type {
  SpeedMetrics,
  SpeedDetectorConfig,
} from "./utils/fallbackSpeedDetector";
export type {
  LightingMetrics,
  RealtimeBrightnessConfig,
} from "./utils/realtimeBrightnessDetectorV2";

// Utility functions
export { calculateAngleColor, getAngleMessage } from "./utils/pitchDetector";

export {
  getYawColor,
  getYawMessage,
  shouldAllowRecordingYaw,
} from "./utils/yawDetector";

export {
  getSpeedColor,
  getSpeedMessage,
  shouldAllowRecordingSpeed,
  getSpeedIcon,
} from "./utils/fallbackSpeedDetector";

// Translation utilities
export { getTranslations, translations } from "./utils/translations";

// Translation-aware message functions
export { getAngleMessageTranslated } from "./utils/pitchDetector";
export { getYawMessageTranslated } from "./utils/yawDetector";
export { getMotionStabilityMessage } from "./utils/motionDetectorV2";
export {
  getSpeedRecommendationMessage,
  getSpeedMotionMessage,
} from "./utils/fallbackSpeedDetector";
export { getBrightnessRecommendationMessage } from "./utils/realtimeBrightnessDetectorV2";

// Default export
export default GuidedCameraView;
