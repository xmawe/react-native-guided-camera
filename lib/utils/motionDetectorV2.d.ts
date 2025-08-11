export interface MotionMetrics {
    score: number;
    isStable: boolean;
    stability: "excellent" | "good" | "fair" | "poor" | "very_poor";
    accelerationMagnitude: number;
    rotationMagnitude: number;
    recommendation: string;
    source: "gyroscope" | "accelerometer" | "hybrid" | "mock";
}
export interface MotionDetectorConfig {
    updateInterval?: number;
    historySize?: number;
    excellentThreshold?: number;
    goodThreshold?: number;
    fairThreshold?: number;
    poorThreshold?: number;
    accelerationWeight?: number;
    rotationWeight?: number;
    smoothingFactor?: number;
    enableSensorFusion?: boolean;
}
export declare class MotionDetector {
    private gyroSubscription;
    private accelSubscription;
    private mockInterval;
    private isActive;
    private config;
    private onMotionChange;
    private gyroscopeHistory;
    private accelerometerHistory;
    private stabilityHistory;
    private lastMetrics;
    constructor(onMotionChange: (metrics: MotionMetrics) => void, config?: Partial<MotionDetectorConfig>);
    start(): Promise<void>;
    private startGyroscopeTracking;
    private startAccelerometerTracking;
    private startMockData;
    private handleGyroscopeUpdate;
    private handleAccelerometerUpdate;
    private calculateStabilityScore;
    private applySmoothingToScore;
    private calculateMotionMetrics;
    stop(): void;
    getLastMetrics(): MotionMetrics;
    isRunning(): boolean;
}
export declare function getMotionStabilityMessage(stability: "excellent" | "good" | "fair" | "poor" | "very_poor", translations: any): string;
//# sourceMappingURL=motionDetectorV2.d.ts.map