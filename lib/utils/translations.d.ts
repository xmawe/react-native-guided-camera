import { SupportedLanguage } from "../types";
/**
 * Complete Translation System for GuidedCameraView
 *
 * This file provides comprehensive translations for all user-facing text in the
 * GuidedCameraView component including:
 *
 * 1. UI Labels: Button texts, status indicators, titles
 * 2. Status Messages: Recording states, camera status, error messages
 * 3. Guidance Messages: User instructions, help text, tips
 * 4. Error Messages: Camera permissions, sensor failures, device issues
 * 5. Instruction Messages: Real-time guidance from utility functions
 *    - Angle/Pitch detection messages (tilt left/right)
 *    - Yaw detection messages (turn body left/right, compass alignment)
 *    - Motion stability messages (excellent/good/fair/poor/very poor stability)
 *    - Speed detection messages (stationary/walking/running/vehicle/high speed)
 *    - Brightness detection messages (excellent/good/fair/poor/very poor lighting)
 *
 * Supported Languages:
 * - English: Default language with complete translations
 * - Arabic: Full RTL support with cultural adaptations
 * - French: Complete translations with proper grammar
 *
 * Usage:
 * - Use getTranslations(language) to get translation object
 * - Use translation-aware utility functions for real-time instructions
 * - Component automatically applies RTL layout for Arabic
 */
export interface Translations {
    recording: string;
    preparing: string;
    cameraPermissionMessage: string;
    grantPermission: string;
    pitch: string;
    motionScore: string;
    distance: string;
    compass: string;
    speed: string;
    brightness: string;
    level: string;
    tilted: string;
    excellent: string;
    good: string;
    fair: string;
    poor: string;
    very_poor: string;
    veryPoor: string;
    bad: string;
    onTrack: string;
    turnBody: string;
    stationary: string;
    perfectHoldSteady: string;
    rotateLeft: string;
    rotateRight: string;
    tiltUp: string;
    tiltDown: string;
    targetSet: string;
    guidanceModeEnabled: string;
    targetAngleSet: string;
    targetSetToLevel: string;
    moveLeft: string;
    moveRight: string;
    moveUp: string;
    moveDown: string;
    faceNorth: string;
    faceSouth: string;
    faceEast: string;
    faceWest: string;
    motionTooHigh: string;
    stabilizePhone: string;
    movementTooFast: string;
    errorRecording: string;
    failedToRecord: string;
    errorStopping: string;
    errorSaving: string;
    failedToSave: string;
    noVideoToSave: string;
    videoSaved: string;
    success: string;
    metricsLogs: string;
    clear: string;
    noLogsYet: string;
    greatKeepSteady: string;
    tiltRight: string;
    tiltLeft: string;
    tiltBack: string;
    tiltForward: string;
    adjust: string;
    adjustSeverity: string;
    compassAligned: string;
    turnBodyLeft: string;
    turnBodyRight: string;
    adjustOrientation: string;
    perfectStability: string;
    goodStability: string;
    fairStability: string;
    poorStabilityDevice: string;
    veryPoorStabilityHold: string;
    analyzing: string;
    deviceStationary: string;
    walkingPaceStabilization: string;
    runningDetectedShaky: string;
    vehicleMovementDetected: string;
    highSpeedAvoidRecording: string;
    motionDetected: string;
    insufficientData: string;
    excellentLightingConditions: string;
    goodLightingRecording: string;
    adequateLightingImproved: string;
    poorLightingAddLight: string;
    veryPoorLightingInsufficient: string;
    analyzingLightingConditions: string;
}
declare const translations: Record<SupportedLanguage, Translations>;
export declare const getTranslations: (language?: SupportedLanguage) => Translations;
export { translations };
//# sourceMappingURL=translations.d.ts.map