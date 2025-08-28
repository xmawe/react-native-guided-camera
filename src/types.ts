export interface InstructionEvent {
  timestamp: string; // Format: "MM:SS" relative to recording start
  timestampMs: number; // Absolute timestamp in milliseconds from recording start
  category: "motion" | "angle" | "speed" | "lighting" | "yaw" | "guidance";
  severity: "info" | "warning" | "error";
  message: string;
  metrics?: {
    // Optional detailed metrics at the time of instruction
    pitch?: number;
    roll?: number;
    yaw?: number;
    motionScore?: number;
    speedKmh?: number;
    brightness?: number;
  };
}

export interface VideoData {
  uri: string;
  duration?: number;
  size?: number;
  instructionEvents?: InstructionEvent[]; // Array of all instruction events during recording
}

export type SupportedLanguage = "english" | "arabic" | "french";

export interface GuidedCameraViewProps {
  onCameraClose?: () => void;
  onScreen?: boolean;
  terminalLogs?: boolean;
  onVideoSave?: (videoData: VideoData) => void;
  language?: SupportedLanguage;
  metricsUpdateInterval?: number; // Update interval in milliseconds (default: 100ms)
  includeSeverityLevels?: ("info" | "warning" | "error")[]; // Which severity levels to include in instruction events (default: all)
}
