export interface InstructionEvent {
    timestamp: string;
    timestampMs: number;
    category: 'motion' | 'angle' | 'speed' | 'lighting' | 'yaw' | 'guidance';
    severity: 'info' | 'warning' | 'error';
    message: string;
    metrics?: {
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
    instructionEvents?: InstructionEvent[];
}
export type SupportedLanguage = "english" | "arabic" | "french";
export interface GuidedCameraViewProps {
    onCameraClose?: () => void;
    onScreen?: boolean;
    terminalLogs?: boolean;
    onVideoSave?: (videoData: VideoData) => void;
    language?: SupportedLanguage;
    metricsUpdateInterval?: number;
    includeSeverityLevels?: ('info' | 'warning' | 'error')[];
}
//# sourceMappingURL=types.d.ts.map