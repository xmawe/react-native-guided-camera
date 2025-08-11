export interface AngleMetrics {
    roll: number;
    pitch: number;
    isLevel: boolean;
    direction: "level" | "tilt_left" | "tilt_right" | "tilt_forward" | "tilt_backward";
    severity: "good" | "minor" | "major";
}
export interface PitchDetectorConfig {
    rollTolerance?: number;
    pitchTolerance?: number;
    pitchVertical?: number;
    updateInterval?: number;
}
export declare class PitchDetector {
    private subscription;
    private config;
    private onAngleChange;
    constructor(onAngleChange: (metrics: AngleMetrics) => void, config?: PitchDetectorConfig);
    start(): void;
    stop(): void;
    private calculateAngleMetrics;
}
export declare const calculateAngleColor: (severity: AngleMetrics["severity"]) => string;
export declare const getAngleMessage: (metrics: AngleMetrics) => string;
export declare const getAngleMessageTranslated: (metrics: AngleMetrics, translations: any) => string;
//# sourceMappingURL=pitchDetector.d.ts.map