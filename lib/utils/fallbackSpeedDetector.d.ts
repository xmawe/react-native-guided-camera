export interface SpeedMetrics {
    speed: number;
    speedKmh: number;
    speedMph: number;
    accuracy: number;
    isMoving: boolean;
    movementType: "stationary" | "walking" | "running" | "driving" | "fast_moving";
    recommendation: string;
    source: "gps" | "sensors" | "hybrid";
}
export interface SpeedDetectorConfig {
    updateInterval?: number;
    historySize?: number;
    smoothingFactor?: number;
    enableSensorFusion?: boolean;
    movingThreshold?: number;
    walkingThreshold?: number;
    runningThreshold?: number;
    drivingThreshold?: number;
}
export declare class FallbackSpeedDetector {
    private callback;
    private config;
    private isActive;
    private accelerometerSubscription;
    private accelerometerHistory;
    constructor(callback: (metrics: SpeedMetrics) => void, config?: Partial<SpeedDetectorConfig>);
    start(): Promise<void>;
    private startAccelerometerTracking;
    private calculateMotionFromAccelerometer;
    private getMovementRecommendation;
    stop(): void;
    isRunning(): boolean;
}
export declare const getSpeedColor: (speed: number) => string;
export declare const getSpeedMessage: (metrics: SpeedMetrics) => string;
export declare const shouldAllowRecordingSpeed: (metrics: SpeedMetrics) => boolean;
export declare const getSpeedIcon: (movementType: string) => string;
export declare function getSpeedRecommendationMessage(speed: number, isMoving: boolean, translations: any): string;
export declare function getSpeedMotionMessage(translations: any): string;
//# sourceMappingURL=fallbackSpeedDetector.d.ts.map