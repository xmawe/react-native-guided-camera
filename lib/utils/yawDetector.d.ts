export interface YawMetrics {
    yaw: number;
    isOnTarget: boolean;
    deviation: number;
    direction: "on_target" | "turn_left" | "turn_right";
    severity: "good" | "minor" | "major";
}
export interface YawDetectorConfig {
    updateInterval: number;
    yawTolerance: number;
    smoothingFactor: number;
}
export declare class YawDetector {
    private subscription;
    private isActive;
    private config;
    private onYawChange;
    private smoothedYaw;
    private targetYaw;
    constructor(onYawChange: (metrics: YawMetrics) => void, config?: Partial<YawDetectorConfig>);
    private calculateYaw;
    private calculateYawMetrics;
    start(): Promise<void>;
    stop(): void;
    setTarget(yaw: number): void;
    clearTarget(): void;
    calibrateToCurrentPosition(): void;
    getCurrentYaw(): number;
    hasTarget(): boolean;
}
export declare const getYawColor: (severity: string) => string;
export declare const getYawMessage: (metrics: YawMetrics) => string;
export declare const getYawMessageTranslated: (metrics: YawMetrics, translations: any) => string;
export declare const shouldAllowRecordingYaw: (metrics: YawMetrics) => boolean;
//# sourceMappingURL=yawDetector.d.ts.map