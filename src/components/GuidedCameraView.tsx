import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Vibration,
  Animated,
  Platform,
  ScrollView,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import Svg, {
  Circle,
  Rect,
  Line,
  Text as SvgText,
  Path,
} from "react-native-svg";
import {
  PitchDetector,
  AngleMetrics,
  calculateAngleColor,
  getAngleMessage,
  getAngleMessageTranslated,
} from "../utils/pitchDetector";

import {
  YawDetector,
  YawMetrics,
  getYawColor,
  getYawMessage,
  getYawMessageTranslated,
} from "../utils/yawDetector";

import {
  RealtimeBrightnessDetector,
  LightingMetrics,
} from "../utils/realtimeBrightnessDetectorV2";

import {
  MotionDetector,
  MotionMetrics,
  getMotionStabilityMessage,
} from "../utils/motionDetectorV2";

import {
  FallbackSpeedDetector as SpeedDetector,
  SpeedMetrics,
  getSpeedColor,
  getSpeedMessage,
  getSpeedRecommendationMessage,
  shouldAllowRecordingSpeed,
  getSpeedIcon,
} from "../utils/fallbackSpeedDetector";

import { VideoData, SupportedLanguage, InstructionEvent } from "../types";
import { getTranslations } from "../utils/translations";

// SVG Icon Component
const CubeIcon = ({
  size = 22,
  color = "#FFFFFF",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.75 20.7501L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L14.25 20.7501M5.25 18.2501L3.82297 17.4573C3.52346 17.2909 3.37368 17.2077 3.26463 17.0893C3.16816 16.9847 3.09515 16.8606 3.05048 16.7254C3 16.5726 3 16.4013 3 16.0586V14.5001M3 9.50009V7.94153C3 7.59889 3 7.42757 3.05048 7.27477C3.09515 7.13959 3.16816 7.01551 3.26463 6.91082C3.37368 6.79248 3.52345 6.70928 3.82297 6.54288L5.25 5.75009M9.75 3.25008L11.223 2.43177C11.5066 2.27421 11.6484 2.19543 11.7986 2.16454C11.9315 2.13721 12.0685 2.13721 12.2015 2.16454C12.3516 2.19543 12.4934 2.27421 12.777 2.43177L14.25 3.25008M18.75 5.75008L20.177 6.54288C20.4766 6.70928 20.6263 6.79248 20.7354 6.91082C20.8318 7.01551 20.9049 7.13959 20.9495 7.27477C21 7.42757 21 7.59889 21 7.94153V9.50008M21 14.5001V16.0586C21 16.4013 21 16.5726 20.9495 16.7254C20.9049 16.8606 20.8318 16.9847 20.7354 17.0893C20.6263 17.2077 20.4766 17.2909 20.177 17.4573L18.75 18.2501M9.75 10.7501L12 12.0001M12 12.0001L14.25 10.7501M12 12.0001V14.5001M3 7.00008L5.25 8.25008M18.75 8.25008L21 7.00008M12 19.5001V22.0001"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SwitchIcon = ({
  size = 22,
  color = "#FFFFFF",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 14C2 14 2.12132 14.8492 5.63604 18.364C9.15076 21.8787 14.8492 21.8787 18.364 18.364C19.6092 17.1187 20.4133 15.5993 20.7762 14M2 14V20M2 14H8M22 10C22 10 21.8787 9.15076 18.364 5.63604C14.8492 2.12132 9.15076 2.12132 5.63604 5.63604C4.39076 6.88131 3.58669 8.40072 3.22383 10M22 10V4M22 10H16"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const XCloseIcon = ({
  size = 22,
  color = "#FFFFFF",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SaveIcon = ({
  size = 22,
  color = "#FFFFFF",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 8H8.6C8.03995 8 7.75992 8 7.54601 7.89101C7.35785 7.79513 7.20487 7.64215 7.10899 7.45399C7 7.24008 7 6.96005 7 6.4V3M17 21V14.6C17 14.0399 17 13.7599 16.891 13.546C16.7951 13.3578 16.6422 13.2049 16.454 13.109C16.2401 13 15.9601 13 15.4 13H8.6C8.03995 13 7.75992 13 7.54601 13.109C7.35785 13.2049 7.20487 13.3578 7.10899 13.546C7 13.7599 7 14.0399 7 14.6V21M21 9.32548V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3H14.6745C15.1637 3 15.4083 3 15.6385 3.05526C15.8425 3.10425 16.0376 3.18506 16.2166 3.29472C16.4184 3.4184 16.5914 3.59135 16.9373 3.93726L20.0627 7.06274C20.4086 7.40865 20.5816 7.5816 20.7053 7.78343C20.8149 7.96237 20.8957 8.15746 20.9447 8.36154C21 8.59171 21 8.8363 21 9.32548Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DeleteIcon = ({
  size = 22,
  color = "#FFFFFF",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6M10 10.5V15.5M14 10.5V15.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Helper functions for motion detection
const getMotionColor = (stability: string): string => {
  switch (stability) {
    case "excellent":
      return "#4CAF50";
    case "good":
      return "#8BC34A";
    case "fair":
      return "#FFC107";
    case "poor":
      return "#FF9800";
    case "very_poor":
      return "#F44336";
    default:
      return "#FFC107";
  }
};

const getMotionMessage = (metrics: MotionMetrics): string => {
  return metrics.recommendation;
};

const getLightingColor = (quality: string): string => {
  switch (quality) {
    case "excellent":
      return "#4CAF50";
    case "good":
      return "#8BC34A";
    case "fair":
      return "#FFC107";
    case "poor":
      return "#FF9800";
    case "very_poor":
      return "#F44336";
    default:
      return "#FFC107";
  }
};

const shouldAllowRecording = (metrics: MotionMetrics): boolean => {
  return metrics.isStable;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Helper function to generate guidance messages based on current vs target angle
const generateGuidanceMessage = (
  current: AngleMetrics,
  yawMetrics: YawMetrics,
  target: { roll: number; pitch: number; yaw?: number },
  translations: ReturnType<typeof getTranslations>
): string => {
  const rollDiff = current.roll - target.roll;
  const pitchDiff = current.pitch - target.pitch;
  const tolerance = 5; // degrees

  // Check if we're close enough to target
  if (
    Math.abs(rollDiff) <= tolerance &&
    Math.abs(pitchDiff) <= tolerance &&
    yawMetrics.isOnTarget
  ) {
    return translations.perfectHoldSteady;
  }

  // Generate directional guidance
  const messages: string[] = [];

  // Yaw guidance (compass direction) - highest priority
  if (!yawMetrics.isOnTarget && target.yaw !== undefined) {
    messages.push(getYawMessageTranslated(yawMetrics, translations));
  }

  // Roll guidance (left/right rotation)
  if (Math.abs(rollDiff) > tolerance) {
    if (rollDiff > 0) {
      messages.push(translations.rotateLeft);
    } else {
      messages.push(translations.rotateRight);
    }
  }

  // Pitch guidance (up/down tilt)
  if (Math.abs(pitchDiff) > tolerance) {
    if (pitchDiff > 0) {
      messages.push(translations.tiltDown);
    } else {
      messages.push(translations.tiltUp);
    }
  }

  return messages.join(" • ");
};

// Helper function to check if current angle matches target
const isAngleOnTarget = (
  current: AngleMetrics,
  yawMetrics: YawMetrics,
  target: { roll: number; pitch: number; yaw?: number },
  tolerance: number = 5
): boolean => {
  const rollDiff = Math.abs(current.roll - target.roll);
  const pitchDiff = Math.abs(current.pitch - target.pitch);

  return (
    rollDiff <= tolerance &&
    pitchDiff <= tolerance &&
    (target.yaw === undefined || yawMetrics.isOnTarget)
  );
};

interface GuidedCameraViewProps {
  onCameraClose?: () => void;
  onScreen?: boolean;
  terminalLogs?: boolean;
  onVideoSave?: (videoData: VideoData) => void;
  language?: SupportedLanguage;
  metricsUpdateInterval?: number; // Update interval in milliseconds (default: 100ms)
  includeSeverityLevels?: ("info" | "warning" | "error")[]; // Which severity levels to include in instruction events (default: all)
}

const GuidedCameraView: React.FC<GuidedCameraViewProps> = ({
  onCameraClose,
  onScreen = false,
  terminalLogs = false,
  onVideoSave,
  language = "english",
  metricsUpdateInterval = 100, // Default 100ms update interval
  includeSeverityLevels = ["info", "warning", "error"], // Default: include all severity levels
}) => {
  const translations = getTranslations(language);
  const isRTL = language === "arabic";

  // Helper function to get text style with appropriate font
  const getTextStyle = (weight: "regular" | "bold" = "regular") => {
    return {
      fontWeight: (weight === "bold" ? "bold" : "normal") as "normal" | "bold",
      ...(isRTL && {
        textAlign: "right" as const,
        writingDirection: "rtl" as const,
      }),
    };
  };

  // Helper function to get translated quality text
  const getQualityTranslation = (quality: string): string => {
    const qualityKey = quality.replace("_", "") as keyof typeof translations;
    return (
      (translations as any)[qualityKey] ||
      (translations as any)[quality] ||
      quality
    );
  };
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(false);

  // Camera mode state for dynamic switching
  const [cameraMode, setCameraMode] = useState<"picture" | "video">("picture");

  // Recording state - exactly like VideoRecorderApp
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<any>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [instructionEvents, setInstructionEvents] = useState<
    InstructionEvent[]
  >([]);
  const [lastInstructionTime, setLastInstructionTime] = useState<
    Record<string, number>
  >({});

  const [motionMetrics, setMotionMetrics] = useState<MotionMetrics>({
    score: 100,
    isStable: true,
    stability: "excellent",
    accelerationMagnitude: 0,
    rotationMagnitude: 0,
    recommendation: "Perfect stability!",
    source: "gyroscope",
  });

  const [speedMetrics, setSpeedMetrics] = useState<SpeedMetrics>({
    speed: 0,
    speedKmh: 0,
    speedMph: 0,
    accuracy: 0,
    isMoving: false,
    movementType: "stationary",
    recommendation: "Device is stationary - perfect for stable recording",
    source: "gps",
  });

  const [lightingMetrics, setLightingMetrics] = useState<LightingMetrics>({
    meanLuminance: 128,
    contrastRatio: 3.0,
    shadowDetail: 20,
    highlightClipping: 0,
    colorTemperature: 5500,
    quality: "good",
    isOptimal: true,
    recommendation: "Lighting looks good",
    score: 85,
    source: "estimated",
  });

  const [pulseAnim] = useState(new Animated.Value(1));
  const [angleMetrics, setAngleMetrics] = useState<AngleMetrics>({
    roll: 0,
    pitch: 0,
    isLevel: true,
    direction: "level",
    severity: "good",
  });
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Target angle state - the desired orientation we want to guide users to
  const [targetAngle, setTargetAngle] = useState({
    roll: 0,
    pitch: 0,
    yaw: undefined as number | undefined,
  });
  const [isGuidanceMode, setIsGuidanceMode] = useState(false);
  const [guidanceMessage, setGuidanceMessage] = useState("");

  // Metrics logging state
  const [metricsLogs, setMetricsLogs] = useState<string[]>([]);
  const maxLogs = 50; // Keep only the last 50 log entries

  // Helper function to add log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;

    // Terminal logs
    if (terminalLogs) {
      console.log(`📊 ${logEntry}`);
    }

    // On-screen logs
    if (onScreen) {
      setMetricsLogs((prev) => {
        const newLogs = [logEntry, ...prev];
        return newLogs.slice(0, maxLogs); // Keep only the latest entries
      });
    }
  };

  // Helper function to record instruction events during recording
  const recordInstructionEvent = (
    category: InstructionEvent["category"],
    severity: InstructionEvent["severity"],
    message: string,
    throttleMs: number = 2000 // Don't record same category more than once every 2 seconds
  ) => {
    if (!isRecording || recordingStartTime.current === 0) {
      return; // Only record during active recording
    }

    // Check if this severity level should be included
    if (!includeSeverityLevels.includes(severity)) {
      return; // Skip if severity not included in filter
    }

    // Throttling: don't record the same category too frequently
    const now = Date.now();
    const lastTime = lastInstructionTime[category] || 0;
    if (now - lastTime < throttleMs) {
      return;
    }

    const elapsedMs = Date.now() - recordingStartTime.current;
    const minutes = Math.floor(elapsedMs / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000);
    const timestamp = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    const instructionEvent: InstructionEvent = {
      timestamp,
      timestampMs: elapsedMs,
      category,
      severity,
      message,
      metrics: {
        pitch: angleMetrics.pitch,
        roll: angleMetrics.roll,
        yaw: yawMetrics.yaw,
        motionScore: motionMetrics.score,
        speedKmh: speedMetrics.speedKmh,
        brightness: lightingMetrics.meanLuminance,
      },
    };

    setInstructionEvents((prev) => [...prev, instructionEvent]);
    setLastInstructionTime((prev) => ({ ...prev, [category]: now }));
  };

  // Yaw tracking state
  const [yawMetrics, setYawMetrics] = useState<YawMetrics>({
    yaw: 0,
    isOnTarget: true,
    deviation: 0,
    direction: "on_target",
    severity: "good",
  });

  // Refs
  const cameraRef = useRef<CameraView>(null);
  const pitchDetectorRef = useRef<PitchDetector | null>(null);
  const recordingStartTime = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const lastVibrationRef = useRef<number>(0);
  const motionDetectorRef = useRef<MotionDetector | null>(null);
  const yawDetectorRef = useRef<YawDetector | null>(null);
  const speedDetectorRef = useRef<SpeedDetector | null>(null);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === "granted");
    })();
  }, []);

  // YawDetector effect for compass tracking
  useEffect(() => {
    const handleYawChange = (metrics: YawMetrics) => {
      setYawMetrics(metrics);
      addLog(
        `Yaw: ${metrics.direction} (${Math.round(
          metrics.yaw
        )}°, Dev: ${metrics.deviation.toFixed(1)}°)`
      );
    };

    yawDetectorRef.current = new YawDetector(handleYawChange, {
      updateInterval: metricsUpdateInterval,
      yawTolerance: 5,
      smoothingFactor: 0.8,
    });

    yawDetectorRef.current.start();

    return () => {
      if (yawDetectorRef.current) {
        yawDetectorRef.current.stop();
      }
    };
  }, [metricsUpdateInterval]);

  // Update guidance message when yaw metrics change
  useEffect(() => {
    if (isGuidanceMode) {
      const guidance = generateGuidanceMessage(
        angleMetrics,
        yawMetrics,
        targetAngle,
        translations
      );
      setGuidanceMessage(guidance);
    }
  }, [yawMetrics, isGuidanceMode, angleMetrics, targetAngle, translations]);

  useEffect(() => {
    const handleMotionChange = (metrics: MotionMetrics) => {
      setMotionMetrics(metrics);
      addLog(
        `Motion: ${metrics.stability} (Score: ${metrics.score}, ${metrics.source})`
      );

      // Optional: Vibration feedback for very poor stability
      const now = Date.now();
      if (
        metrics.stability === "very_poor" &&
        now - lastVibrationRef.current > 3000
      ) {
        Vibration.vibrate([200, 100, 200]);
        lastVibrationRef.current = now;
      }
    };

    motionDetectorRef.current = new MotionDetector(handleMotionChange, {
      updateInterval: metricsUpdateInterval,
      historySize: 8,
      excellentThreshold: 75, // Lowered from 85 - easier to get "excellent"
      goodThreshold: 60, // Lowered from 70 - easier to get "good"
      fairThreshold: 40, // Lowered from 50 - easier to get "fair"
      poorThreshold: 20, // Lowered from 30 - easier to get "poor"
      accelerationWeight: 0.6,
      rotationWeight: 0.4,
      smoothingFactor: 0.7,
    });

    motionDetectorRef.current.start();

    return () => {
      if (motionDetectorRef.current) {
        motionDetectorRef.current.stop();
      }
    };
  }, [metricsUpdateInterval]);

  // SpeedDetector effect for movement tracking
  useEffect(() => {
    const handleSpeedChange = (metrics: SpeedMetrics) => {
      setSpeedMetrics(metrics);
      addLog(
        `Speed: ${metrics.movementType} (${metrics.speedKmh.toFixed(1)} km/h, ${
          metrics.source
        })`
      );
    };

    // Use only the accelerometer-based speed detector (no GPS required)
    const initSpeedDetector = async () => {
      try {
        speedDetectorRef.current = new SpeedDetector(handleSpeedChange, {
          updateInterval: Math.max(metricsUpdateInterval, 1000), // Speed detection minimum 1 second
          enableSensorFusion: true,
          movingThreshold: 0.3,
          smoothingFactor: 0.8,
        });

        await speedDetectorRef.current.start();
      } catch (error) {
        console.error("Failed to start speed detector:", error);
      }
    };

    initSpeedDetector();

    return () => {
      if (speedDetectorRef.current) {
        speedDetectorRef.current.stop();
      }
    };
  }, [metricsUpdateInterval]);

  const brightnessDetectorRef = useRef<RealtimeBrightnessDetector | null>(null);

  useEffect(() => {
    const handleLightingChange = (metrics: LightingMetrics) => {
      setLightingMetrics(metrics);
      addLog(
        `Lighting: ${metrics.quality} (Luminance: ${Math.round(
          metrics.meanLuminance
        )}, Score: ${metrics.score})`
      );
    };

    brightnessDetectorRef.current = new RealtimeBrightnessDetector(
      handleLightingChange,
      {
        updateInterval: Math.max(metricsUpdateInterval * 4, 1000), // Brightness detection at least 1 second, typically 4x slower than other metrics
        enableTimeBasedEstimation: true,
        enableAmbientLightSensor: true, // Use ambient light sensor for better accuracy
        smoothingFactor: 0.9, // More smoothing for stable readings
      },
      translations // Pass translations for localized messages
    );

    // Start without camera reference - uses ambient light sensor instead
    brightnessDetectorRef.current.start();

    return () => {
      if (brightnessDetectorRef.current) {
        brightnessDetectorRef.current.stop();
      }
    };
  }, [translations, metricsUpdateInterval]); // Include translations and update interval to recreate detector when they change

  // Initialize pitch detector
  useEffect(() => {
    const handleAngleChange = (metrics: AngleMetrics) => {
      setAngleMetrics(metrics);
      addLog(
        `Angle: ${metrics.direction} (Roll: ${metrics.roll.toFixed(
          1
        )}°, Pitch: ${metrics.pitch.toFixed(1)}°, ${metrics.severity})`
      );

      // Generate guidance message if in guidance mode
      if (isGuidanceMode) {
        const guidance = generateGuidanceMessage(
          metrics,
          yawMetrics,
          targetAngle,
          translations
        );
        setGuidanceMessage(guidance);
      }

      // Vibration feedback for major tilts
      const now = Date.now();
      if (
        !metrics.isLevel &&
        metrics.severity === "major" &&
        now - lastVibrationRef.current > 2000
      ) {
        Vibration.vibrate([100, 50, 100]);
        lastVibrationRef.current = now;
      }
    };

    pitchDetectorRef.current = new PitchDetector(handleAngleChange, {
      rollTolerance: 15,
      pitchTolerance: 15,
      pitchVertical: 90,
      updateInterval: metricsUpdateInterval,
    });

    pitchDetectorRef.current.start();

    return () => {
      if (pitchDetectorRef.current) {
        pitchDetectorRef.current.stop();
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [metricsUpdateInterval]);

  // Pulse animation for recording button
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation;

    if (isRecording) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [isRecording]);

  // Monitor and record guidance messages during recording
  useEffect(() => {
    if (!isRecording) return;

    // Record speed guidance messages
    if (speedMetrics.isMoving && speedMetrics.movementType !== "stationary") {
      recordInstructionEvent(
        "speed",
        "warning",
        getSpeedRecommendationMessage(
          speedMetrics.speed,
          speedMetrics.isMoving,
          translations
        )
      );
    }

    // Record motion guidance messages
    if (!motionMetrics.isStable) {
      recordInstructionEvent(
        "motion",
        motionMetrics.stability === "very_poor" ? "error" : "warning",
        getMotionStabilityMessage(motionMetrics.stability, translations)
      );
    }

    // Record angle guidance messages
    if (!angleMetrics.isLevel) {
      recordInstructionEvent(
        "angle",
        angleMetrics.severity === "major" ? "warning" : "info",
        getAngleMessageTranslated(angleMetrics, translations)
      );
    }

    // Record target angle guidance (only in guidance mode)
    if (
      isGuidanceMode &&
      guidanceMessage &&
      guidanceMessage !== translations.perfectHoldSteady
    ) {
      recordInstructionEvent("guidance", "info", guidanceMessage);
    }

    // Record yaw guidance (only in guidance mode with target)
    if (
      isGuidanceMode &&
      !yawMetrics.isOnTarget &&
      targetAngle.yaw !== undefined
    ) {
      recordInstructionEvent(
        "yaw",
        "warning",
        getYawMessageTranslated(yawMetrics, translations)
      );
    }
  }, [
    isRecording,
    speedMetrics.isMoving,
    speedMetrics.movementType,
    speedMetrics.speed,
    motionMetrics.isStable,
    motionMetrics.stability,
    angleMetrics.isLevel,
    angleMetrics.severity,
    isGuidanceMode,
    guidanceMessage,
    yawMetrics.isOnTarget,
    targetAngle.yaw,
    translations,
  ]);

  // Recording duration tracking
  useEffect(() => {
    if (isRecording && recordingStartTime.current > 0) {
      durationInterval.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - recordingStartTime.current) / 1000
        );
        setRecordingDuration(elapsed);
      }, 1000);
    } else if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [isRecording]);

  // Start recording - exactly like VideoRecorderApp
  const startRecording = async () => {
    if (cameraRef.current && !isRecording && isCameraReady) {
      try {
        // Set current angle as target when recording starts
        const currentYaw = yawDetectorRef.current?.getCurrentYaw();
        console.log("DEBUG: Auto-setting target on record start");
        console.log("DEBUG: Current yaw from detector:", currentYaw);
        console.log("DEBUG: Current angle metrics:", angleMetrics);

        setTargetAngle({
          roll: angleMetrics.roll,
          pitch: angleMetrics.pitch,
          yaw: currentYaw,
        });

        // Set the target in the yaw detector
        if (currentYaw !== undefined && yawDetectorRef.current) {
          yawDetectorRef.current.setTarget(currentYaw);
          console.log("DEBUG: Set yaw target to:", currentYaw);
        }

        setIsGuidanceMode(true);
        setGuidanceMessage(translations.targetSet);

        // Clear any previous instruction events and throttling state
        setInstructionEvents([]);
        setLastInstructionTime({});

        // Switch to video mode for recording
        setCameraMode("video");

        // Small delay to allow mode switch
        await new Promise((resolve) => setTimeout(resolve, 100));

        setIsRecording(true);
        recordingStartTime.current = Date.now();
        setRecordingDuration(0);

        console.log("Starting recording...");
        const video = await cameraRef.current.recordAsync();

        setRecordedVideo(video);
        console.log("Video recorded:", video?.uri);
      } catch (error) {
        console.error("Error recording video:", error);
        Alert.alert(translations.errorRecording, translations.failedToRecord);
      } finally {
        setIsRecording(false);
        recordingStartTime.current = 0;
        setRecordingDuration(0);
        // Turn off guidance mode when recording stops
        setIsGuidanceMode(false);
        setGuidanceMessage("");
        // Clear the yaw target
        if (yawDetectorRef.current) {
          yawDetectorRef.current.clearTarget();
        }
        // Switch back to picture mode for brightness analysis
        setCameraMode("picture");
      }
    }
  };

  // Stop recording - exactly like VideoRecorderApp
  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      try {
        console.log("Stopping recording...");
        cameraRef.current.stopRecording();
        // Mode will be switched back to picture in the finally block of startRecording
      } catch (error) {
        console.error("Error stopping recording:", error);
        // Ensure we switch back to picture mode even if stopping fails
        setCameraMode("picture");
      }
    }
  };

  // Save video to gallery or pass to callback - exactly like VideoRecorderApp
  const saveVideoToGallery = async () => {
    if (recordedVideo?.uri) {
      try {
        console.log("Processing video:", recordedVideo.uri);

        // If onVideoSave callback is provided, use it instead of saving to gallery
        if (onVideoSave) {
          const videoData: VideoData = {
            uri: recordedVideo.uri,
            duration: recordingDuration,
            instructionEvents: instructionEvents, // Include all recorded instruction events
          };

          onVideoSave(videoData);
          setRecordedVideo(null);
          setInstructionEvents([]); // Clear instruction events after saving
          setLastInstructionTime({}); // Clear throttling state
          return;
        }

        // Original gallery saving logic (fallback)
        if (!hasMediaLibraryPermission) {
          Alert.alert(
            "Permission Required",
            "Please grant media library permission to save videos"
          );
          return;
        }

        // Create asset
        const asset = await MediaLibrary.createAssetAsync(recordedVideo.uri);

        // Try to add to album
        const album = await MediaLibrary.getAlbumAsync("Videos");
        if (album == null) {
          await MediaLibrary.createAlbumAsync("Videos", asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        Alert.alert(translations.success, translations.videoSaved);
        setRecordedVideo(null);
      } catch (error) {
        console.error("Error saving video:", error);
        Alert.alert(translations.errorRecording, translations.failedToSave);
      }
    } else {
      Alert.alert(translations.errorRecording, translations.noVideoToSave);
    }
  };

  const discardVideo = () => {
    setRecordedVideo(null);
    setInstructionEvents([]); // Clear instruction events when discarding video
    setLastInstructionTime({}); // Clear throttling state
  };

  // Combined toggle function - like VideoRecorderApp
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      // Check motion stability before starting recording
      if (!shouldAllowRecording(motionMetrics)) {
        Alert.alert(translations.motionTooHigh, translations.stabilizePhone, [
          { text: "OK" },
        ]);
        return;
      }

      // Check speed before starting recording
      if (!shouldAllowRecordingSpeed(speedMetrics)) {
        Alert.alert(
          translations.movementTooFast,
          `${
            speedMetrics.recommendation
          }\nCurrent speed: ${speedMetrics.speedKmh.toFixed(1)} km/h`,
          [{ text: "OK" }]
        );
        return;
      }

      startRecording();
    }
  };

  const onCameraReady = useCallback(() => {
    console.log("Camera is ready");
    setIsCameraReady(true);
  }, []);

  const toggleCameraFacing = useCallback(() => {
    if (!isRecording) {
      setFacing((current) => (current === "back" ? "front" : "back"));
    }
  }, [isRecording]);

  // Function to handle camera close
  const handleCameraClose = useCallback(() => {
    console.log("Camera close requested");
    if (onCameraClose) {
      onCameraClose();
    }
  }, [onCameraClose]);

  // Function to set current angle as target
  const setCurrentAsTarget = useCallback(() => {
    console.log("DEBUG: setCurrentAsTarget called");
    const currentYaw = yawDetectorRef.current?.getCurrentYaw();
    console.log("DEBUG: Current yaw from detector:", currentYaw);
    console.log("DEBUG: Current angle metrics:", angleMetrics);

    setTargetAngle({
      roll: angleMetrics.roll,
      pitch: angleMetrics.pitch,
      yaw: currentYaw,
    });

    // Set the target in the yaw detector
    if (currentYaw !== undefined && yawDetectorRef.current) {
      yawDetectorRef.current.setTarget(currentYaw);
      console.log("DEBUG: Set yaw target to:", currentYaw);
    }

    setIsGuidanceMode(true);
    setGuidanceMessage(translations.targetAngleSet);
    console.log("DEBUG: Target angle set to:", {
      roll: angleMetrics.roll,
      pitch: angleMetrics.pitch,
      yaw: currentYaw,
    });
  }, [angleMetrics.roll, angleMetrics.pitch, translations]);

  // Function to toggle guidance mode
  const toggleGuidanceMode = useCallback(() => {
    console.log(
      "DEBUG: toggleGuidanceMode called, current state:",
      isGuidanceMode
    );
    setIsGuidanceMode(!isGuidanceMode);
    if (!isGuidanceMode) {
      setGuidanceMessage(translations.guidanceModeEnabled);
      console.log("DEBUG: Guidance mode enabled");
    } else {
      setGuidanceMessage("");
      console.log("DEBUG: Guidance mode disabled");
    }
  }, [isGuidanceMode, translations]);

  // Function to reset to level target (0,0)
  const setLevelTarget = useCallback(() => {
    console.log("DEBUG: setLevelTarget called");
    setTargetAngle({ roll: 0, pitch: 0, yaw: undefined });

    // Clear the target in the yaw detector
    if (yawDetectorRef.current) {
      yawDetectorRef.current.clearTarget();
      console.log("DEBUG: Cleared yaw target");
    }

    setIsGuidanceMode(true);
    setGuidanceMessage(translations.targetSetToLevel);
    console.log("DEBUG: Target set to level (0, 0, undefined)");
  }, [translations]);

  // Permission check
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={[styles.message, getTextStyle("regular")]}>
          {translations.cameraPermissionMessage}
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={[styles.buttonText, getTextStyle("bold")]}>
            {translations.grantPermission}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const renderAngleIndicator = () => {
    const centerX = screenWidth / 2;
    const centerY = 80;
    const radius = 24;
    const bubbleRadius = 5;

    const maxOffset = radius - bubbleRadius;
    const offsetX = (angleMetrics.roll / 60) * maxOffset;
    const offsetY = (-angleMetrics.pitch / 60) * maxOffset;

    const bubbleX =
      centerX + Math.max(-maxOffset, Math.min(maxOffset, offsetX));
    const bubbleY =
      centerY + Math.max(-maxOffset, Math.min(maxOffset, offsetY));

    return (
      <Svg style={styles.angleIndicator} width={screenWidth} height="90">
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={calculateAngleColor(angleMetrics.severity)}
          strokeWidth="2"
        />
        <Line
          x1={centerX - 12}
          y1={centerY}
          x2={centerX + 12}
          y2={centerY}
          stroke="#FFFFFF"
          strokeWidth="1"
          opacity={0.5}
        />
        <Line
          x1={centerX}
          y1={centerY - 12}
          x2={centerX}
          y2={centerY + 12}
          stroke="#FFFFFF"
          strokeWidth="1"
          opacity={0.5}
        />
        <Circle
          cx={bubbleX}
          cy={bubbleY}
          r={bubbleRadius}
          fill={calculateAngleColor(angleMetrics.severity)}
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        <SvgText
          x={centerX}
          y={centerY + 38}
          textAnchor="middle"
          fontSize="11"
          fill="#FFFFFF"
          fontWeight="bold"
        >
          {`Roll: ${Math.abs(angleMetrics.roll).toFixed(1)}°  Pitch: ${Math.abs(
            angleMetrics.pitch
          ).toFixed(1)}°`}
        </SvgText>
      </Svg>
    );
  };

  const renderBalanceIndicator = () => {
    const centerX = screenWidth / 2;
    const indicatorY = 100;
    const barWidth = 120;
    const barHeight = 4;

    const rollRatio = angleMetrics.roll / 60;
    const indicatorX = centerX + rollRatio * (barWidth / 2);

    const pitchRatio = angleMetrics.pitch / 60;
    const indicatorY2 = indicatorY + 20;
    const indicatorY2Bar = indicatorY2;
    const indicatorY2Circle = indicatorY2Bar + barHeight / 2;
    const indicatorX2 = centerX + pitchRatio * (barWidth / 2);

    // Target indicators
    const targetRollRatio = targetAngle.roll / 60;
    const targetIndicatorX = centerX + targetRollRatio * (barWidth / 2);
    const targetPitchRatio = targetAngle.pitch / 60;
    const targetIndicatorX2 = centerX + targetPitchRatio * (barWidth / 2);

    return (
      <Svg style={styles.balanceIndicator} width={screenWidth} height="40">
        {/* Roll indicator bar */}
        <Rect
          x={centerX - barWidth / 2}
          y={indicatorY}
          width={barWidth}
          height={barHeight}
          fill="rgba(255,255,255,0.3)"
          rx="2"
        />
        <Line
          x1={centerX}
          y1={indicatorY - 3}
          x2={centerX}
          y2={indicatorY + barHeight + 3}
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Target indicator for roll (if guidance mode is on) */}
        {isGuidanceMode && (
          <Circle
            cx={Math.max(
              centerX - barWidth / 2 + 8,
              Math.min(centerX + barWidth / 2 - 8, targetIndicatorX)
            )}
            cy={indicatorY + barHeight / 2}
            r="4"
            fill="none"
            stroke="#00FF00"
            strokeWidth="2"
          />
        )}

        {/* Current position indicator for roll */}
        <Circle
          cx={Math.max(
            centerX - barWidth / 2 + 8,
            Math.min(centerX + barWidth / 2 - 8, indicatorX)
          )}
          cy={indicatorY + barHeight / 2}
          r="6"
          fill={
            isGuidanceMode &&
            isAngleOnTarget(angleMetrics, yawMetrics, targetAngle)
              ? "#00FF00"
              : calculateAngleColor(angleMetrics.severity)
          }
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        <SvgText
          x={centerX - barWidth / 2 - 12}
          y={indicatorY + barHeight / 2 + 4}
          textAnchor="middle"
          fontSize="10"
          fill="#FFFFFF"
        >
          L
        </SvgText>
        <SvgText
          x={centerX + barWidth / 2 + 12}
          y={indicatorY + barHeight / 2 + 4}
          textAnchor="middle"
          fontSize="10"
          fill="#FFFFFF"
        >
          R
        </SvgText>

        {/* Pitch indicator bar */}
        <Rect
          x={centerX - barWidth / 2}
          y={indicatorY2Bar}
          width={barWidth}
          height={barHeight}
          fill="rgba(255,255,255,0.3)"
          rx="2"
        />
        <Line
          x1={centerX - barWidth / 2}
          y1={indicatorY2Bar + barHeight / 2}
          x2={centerX + barWidth / 2}
          y2={indicatorY2Bar + barHeight / 2}
          stroke="#FFFFFF"
          strokeWidth="1"
          opacity={0.5}
        />

        {/* Target indicator for pitch (if guidance mode is on) */}
        {isGuidanceMode && (
          <Circle
            cx={targetIndicatorX2}
            cy={indicatorY2Circle}
            r="4"
            fill="none"
            stroke="#00FF00"
            strokeWidth="2"
          />
        )}

        {/* Current position indicator for pitch */}
        <Circle
          cx={indicatorX2}
          cy={indicatorY2Circle}
          r="6"
          fill={
            isGuidanceMode &&
            isAngleOnTarget(angleMetrics, yawMetrics, targetAngle)
              ? "#00FF00"
              : calculateAngleColor(angleMetrics.severity)
          }
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        <SvgText
          x={centerX - barWidth / 2 - 18}
          y={indicatorY2Circle + 4}
          textAnchor="middle"
          fontSize="10"
          fill="#FFFFFF"
        >
          B
        </SvgText>
        <SvgText
          x={centerX + barWidth / 2 + 18}
          y={indicatorY2Circle + 4}
          textAnchor="middle"
          fontSize="10"
          fill="#FFFFFF"
        >
          F
        </SvgText>
      </Svg>
    );
  };

  const renderCompassIndicator = () => {
    if (!isGuidanceMode || targetAngle.yaw === undefined) {
      return null;
    }

    const centerX = screenWidth / 2;
    const centerY = 200;
    const radius = 30;
    const needleLength = 20;

    // Calculate current yaw needle position
    const currentRadians = (yawMetrics.yaw * Math.PI) / 180;
    const currentNeedleX = centerX + Math.sin(currentRadians) * needleLength;
    const currentNeedleY = centerY - Math.cos(currentRadians) * needleLength;

    // Calculate target yaw needle position
    const targetRadians = (targetAngle.yaw * Math.PI) / 180;
    const targetNeedleX = centerX + Math.sin(targetRadians) * needleLength;
    const targetNeedleY = centerY - Math.cos(targetRadians) * needleLength;

    return (
      <Svg style={styles.compassIndicator} width={screenWidth} height="80">
        {/* Compass circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
        />

        {/* Target direction (green) */}
        <Line
          x1={centerX}
          y1={centerY}
          x2={targetNeedleX}
          y2={targetNeedleY}
          stroke="#00FF00"
          strokeWidth="3"
        />

        {/* Current direction (white/red) */}
        <Line
          x1={centerX}
          y1={centerY}
          x2={currentNeedleX}
          y2={currentNeedleY}
          stroke={yawMetrics.isOnTarget ? "#00FF00" : "#FF4444"}
          strokeWidth="2"
        />

        {/* North indicator */}
        <SvgText
          x={centerX}
          y={centerY - radius - 8}
          textAnchor="middle"
          fontSize="12"
          fill="#FFFFFF"
          fontWeight="bold"
        >
          N
        </SvgText>

        {/* Compass label */}
        <SvgText
          x={centerX}
          y={centerY + radius + 20}
          textAnchor="middle"
          fontSize="10"
          fill="#FFFFFF"
        >
          {`${Math.round(yawMetrics.yaw)}° / ${Math.round(targetAngle.yaw)}°`}
        </SvgText>
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={onCameraReady}
        mode={cameraMode}
      />

      {/* Overlay content - only show when recording */}
      {isRecording && (
        <View style={StyleSheet.absoluteFillObject}>
          {renderAngleIndicator()}
          {renderBalanceIndicator()}
          {renderCompassIndicator()}
        </View>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={[styles.recordingText, getTextStyle("bold")]}>
            {translations.recording} {formatRecordingTime(recordingDuration)}
          </Text>
        </View>
      )}

      {/* Camera ready indicator */}
      {!isCameraReady && (
        <View style={styles.cameraNotReady}>
          <Text style={[styles.cameraNotReadyText, getTextStyle("bold")]}>
            {translations.preparing}
          </Text>
        </View>
      )}

      {/* Status bar - only show when recording */}
      {isRecording && (
        <View style={[styles.topBar, isRTL && styles.topBarRTL]}>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, getTextStyle("bold")]}>
              {translations.pitch}
            </Text>
            <Text
              style={[
                styles.statusComment,
                { color: calculateAngleColor(angleMetrics.severity) },
                getTextStyle("bold"),
              ]}
            >
              {angleMetrics.isLevel ? translations.level : translations.tilted}
            </Text>
            <Text style={[styles.statusValue, getTextStyle("bold")]}>
              {Math.abs(angleMetrics.pitch).toFixed(1)}°
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, getTextStyle("bold")]}>
              {translations.motionScore}
            </Text>
            <Text
              style={[
                styles.statusComment,
                { color: getMotionColor(motionMetrics.stability) },
                getTextStyle("bold"),
              ]}
            >
              {getQualityTranslation(motionMetrics.stability)}
            </Text>
            <Text style={[styles.statusValue, getTextStyle("bold")]}>
              {motionMetrics.score}
            </Text>
          </View>
          {/* Distance indicator commented out */}
          {/* <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, isRTL && styles.textRTL]}>
            {translations.distance}
          </Text>
          <Text
            style={[
              styles.statusComment,
              { color: calculateAngleColor(angleMetrics.severity) },
              isRTL && styles.textRTL,
            ]}
          >
            {translations.bad}
          </Text>
          <Text style={[styles.statusValue, isRTL && styles.textRTL]}>
            4.32m
          </Text>
        </View> */}
          {isGuidanceMode && targetAngle.yaw !== undefined && (
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, getTextStyle("bold")]}>
                {translations.compass}
              </Text>
              <Text
                style={[
                  styles.statusComment,
                  {
                    color: yawMetrics.isOnTarget ? "#4CAF50" : "#FF9800",
                  },
                  getTextStyle("bold"),
                ]}
              >
                {yawMetrics.isOnTarget
                  ? translations.onTrack
                  : translations.turnBody}
              </Text>
              <Text style={[styles.statusValue, getTextStyle("bold")]}>
                {`${Math.round(yawMetrics.yaw)}°`}
              </Text>
            </View>
          )}
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, getTextStyle("bold")]}>
              {translations.speed}
            </Text>
            <Text
              style={[
                styles.statusComment,
                { color: getSpeedColor(speedMetrics.speed) },
                getTextStyle("bold"),
              ]}
            >
              {speedMetrics.movementType === "stationary"
                ? translations.stationary
                : speedMetrics.movementType}
            </Text>
            <Text style={[styles.statusValue, getTextStyle("bold")]}>
              {speedMetrics.speedKmh.toFixed(1)} km/h
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, getTextStyle("bold")]}>
              {translations.brightness}
            </Text>
            <Text
              style={[
                styles.statusComment,
                { color: getLightingColor(lightingMetrics.quality) },
                getTextStyle("bold"),
              ]}
            >
              {getQualityTranslation(lightingMetrics.quality)}
            </Text>
            <Text style={[styles.statusValue, getTextStyle("bold")]}>
              {Math.round(lightingMetrics.meanLuminance)}
            </Text>
          </View>
        </View>
      )}

      {/* Detection Frame */}
      {/* <View
        style={[
          styles.detectionFrame,
          {
            borderColor:
              isGuidanceMode &&
              isAngleOnTarget(angleMetrics, yawMetrics, targetAngle)
                ? "#4CAF50"
                : angleMetrics.isLevel
                ? "#4CAF50"
                : "#FF9800",
          },
        ]}
      >
        <View
          style={[
            styles.frameCorner,
            {
              borderColor:
                isGuidanceMode &&
                isAngleOnTarget(angleMetrics, yawMetrics, targetAngle)
                  ? "#4CAF50"
                  : angleMetrics.isLevel
                  ? "#4CAF50"
                  : "#FF9800",
            },
          ]}
        />
        <View
          style={[
            styles.frameCorner,
            styles.frameCornerTopRight,
            {
              borderColor:
                isGuidanceMode &&
                isAngleOnTarget(angleMetrics, yawMetrics, targetAngle)
                  ? "#4CAF50"
                  : angleMetrics.isLevel
                  ? "#4CAF50"
                  : "#FF9800",
            },
          ]}
        />
        <View
          style={[
            styles.frameCorner,
            styles.frameCornerBottomLeft,
            {
              borderColor:
                isGuidanceMode &&
                isAngleOnTarget(angleMetrics, yawMetrics, targetAngle)
                  ? "#4CAF50"
                  : angleMetrics.isLevel
                  ? "#4CAF50"
                  : "#FF9800",
            },
          ]}
        />
        <View
          style={[
            styles.frameCorner,
            styles.frameCornerBottomRight,
            {
              borderColor:
                isGuidanceMode &&
                isAngleOnTarget(angleMetrics, yawMetrics, targetAngle)
                  ? "#4CAF50"
                  : angleMetrics.isLevel
                  ? "#4CAF50"
                  : "#FF9800",
            },
          ]}
        />
      </View> */}

      {/* Guidance message - only show when recording */}
      {isRecording && (
        <View style={styles.guidanceContainer}>
          {/* Speed guidance - appears at top when active (most urgent) */}
          {speedMetrics.isMoving &&
            speedMetrics.movementType !== "stationary" && (
              <View
                style={[
                  styles.guidanceItem,
                  { backgroundColor: getSpeedColor(speedMetrics.speed) },
                ]}
              >
                <Text style={[styles.guidanceText, getTextStyle("bold")]}>
                  {getSpeedRecommendationMessage(
                    speedMetrics.speed,
                    speedMetrics.isMoving,
                    translations
                  )}
                </Text>
              </View>
            )}

          {/* Motion guidance - appears above angle guidance when unstable */}
          {!motionMetrics.isStable && (
            <View
              style={[
                styles.guidanceItem,
                { backgroundColor: getMotionColor(motionMetrics.stability) },
              ]}
            >
              <Text style={[styles.guidanceText, getTextStyle("bold")]}>
                {getMotionStabilityMessage(
                  motionMetrics.stability,
                  translations
                )}
              </Text>
            </View>
          )}

          {/* Target angle guidance - main guidance when in guidance mode */}
          {isGuidanceMode && guidanceMessage && (
            <View
              style={[
                styles.guidanceItem,
                {
                  backgroundColor: isAngleOnTarget(
                    angleMetrics,
                    yawMetrics,
                    targetAngle
                  )
                    ? "#4CAF50"
                    : "#FF9800",
                },
              ]}
            >
              <Text style={[styles.guidanceText, getTextStyle("bold")]}>
                {guidanceMessage}
              </Text>
            </View>
          )}

          {/* Angle guidance - basic level guidance when not in guidance mode */}
          {!isGuidanceMode && (
            <View
              style={[
                styles.guidanceItem,
                { backgroundColor: calculateAngleColor(angleMetrics.severity) },
              ]}
            >
              <Text style={[styles.guidanceText, getTextStyle("bold")]}>
                {getAngleMessageTranslated(angleMetrics, translations)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Left side - Close button */}
        <TouchableOpacity
          style={styles.bottomControllsButton}
          onPress={handleCameraClose}
        >
          <XCloseIcon size={28} color="white" />
        </TouchableOpacity>

        {/* Center - Record button or video actions */}
        {recordedVideo ? (
          <View style={styles.videoActions}>
            <TouchableOpacity
              style={styles.bottomControllsButton}
              onPress={discardVideo}
            >
              <DeleteIcon size={24} color="white" />
              {/* <Text style={styles.actionText}>Discard</Text> */}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomControllsButton}
              onPress={saveVideoToGallery}
            >
              <SaveIcon size={24} color="white" />
              {/* <Text style={styles.actionText}>Save</Text> */}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.recordButton,
              {
                opacity: isCameraReady ? 1 : 0.5,
                backgroundColor: isRecording
                  ? "rgba(255, 0, 0, 0.3)"
                  : "rgba(255, 255, 255, 0.3)",
              },
            ]}
            onPress={toggleRecording}
            disabled={!isCameraReady}
          >
            <Animated.View
              style={[
                styles.recordButtonInner,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: isRecording ? "#FFFFFF" : "#FF4444",
                  borderRadius: isRecording ? 0 : 25,
                  width: isRecording ? 20 : 50,
                  height: isRecording ? 20 : 50,
                },
              ]}
            />
          </TouchableOpacity>
        )}

        {/* Right side - Camera flip button */}
        <TouchableOpacity
          style={[
            styles.bottomControllsButton,
            { opacity: isRecording ? 0.5 : 1 },
          ]}
          onPress={toggleCameraFacing}
          disabled={isRecording}
        >
          <SwitchIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Metrics Logs Overlay */}
      {onScreen && (
        <View style={styles.logsContainer}>
          <View style={[styles.logsHeader, isRTL && styles.topBarRTL]}>
            <Text style={[styles.logsTitle, getTextStyle("bold")]}>
              {translations.metricsLogs}
            </Text>
            <TouchableOpacity
              style={styles.clearLogsButton}
              onPress={() => setMetricsLogs([])}
            >
              <Text style={[styles.clearLogsText, getTextStyle("bold")]}>
                {translations.clear}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.logsList}
            showsVerticalScrollIndicator={false}
          >
            {metricsLogs.length === 0 ? (
              <Text style={[styles.noLogsText, getTextStyle("regular")]}>
                {translations.noLogsYet}
              </Text>
            ) : (
              metricsLogs.slice(0, 15).map((log, index) => (
                <Text
                  key={index}
                  style={[styles.logEntry, getTextStyle("regular")]}
                >
                  {log}
                </Text>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 16,
    color: "#333",
  },
  camera: {
    flex: 1,
  },
  recordingIndicator: {
    position: "absolute",
    top: 60,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 68, 68, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
  },
  recordingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  cameraNotReady: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "rgba(255, 165, 0, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cameraNotReadyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  topBar: {
    position: "absolute",
    top: screenHeight * 0.12,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusItem: {
    borderRadius: 8,
  },
  statusLabel: {
    color: "#FFF",
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  statusComment: {
    color: "#FFF",
    textTransform: "capitalize",
    fontSize: 14,
    fontWeight: "bold",
  },
  statusValue: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  guidanceContainer: {
    position: "absolute",
    top: screenHeight * 0.72,
    left: 16,
    right: 16,
    flexDirection: "column-reverse",
  },
  bottomControllsButton: {
    width: 48,
    height: 48,
    borderRadius: 48,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  guidanceItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 2,
    borderRadius: 8,
    alignItems: "center",
  },
  guidanceText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  angleIndicator: {
    position: "absolute",
    top: -10,
    left: 0,
    right: 0,
  },
  balanceIndicator: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
  },
  compassIndicator: {
    position: "absolute",
    top: 50,
    left: 100,
    right: 0,
  },
  detectionFrame: {
    position: "absolute",
    top: screenHeight * 0.2,
    left: 32,
    right: 32,
    bottom: screenHeight * 0.25,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderStyle: "dashed",
  },
  frameCorner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: "#FFFFFF",
    top: -2,
    left: -2,
  },
  frameCornerTopRight: {
    transform: [{ rotate: "90deg" }],
    top: -2,
    right: -2,
    left: undefined,
  },
  frameCornerBottomLeft: {
    transform: [{ rotate: "-90deg" }],
    bottom: -2,
    top: undefined,
    left: -2,
  },
  frameCornerBottomRight: {
    transform: [{ rotate: "180deg" }],
    bottom: -2,
    right: -2,
    top: undefined,
    left: undefined,
  },
  bottomControls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 50,
  },
  videoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  actionText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  recordButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  logsContainer: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    bottom: 120,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: 12,
    padding: 16,
  },
  logsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  logsTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  clearLogsButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearLogsText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  logsList: {
    flex: 1,
  },
  noLogsText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  logEntry: {
    color: "#FFFFFF",
    fontSize: 11,
    marginBottom: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  // RTL styles
  topBarRTL: {
    flexDirection: "row-reverse",
  },
  textRTL: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});

export default GuidedCameraView;
