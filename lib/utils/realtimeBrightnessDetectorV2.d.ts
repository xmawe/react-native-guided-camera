export interface LightingMetrics {
    meanLuminance: number;
    contrastRatio: number;
    shadowDetail: number;
    highlightClipping: number;
    colorTemperature: number;
    quality: "excellent" | "good" | "fair" | "poor" | "very_poor";
    isOptimal: boolean;
    recommendation: string;
    score: number;
    source: "ambient_sensor" | "time_based" | "estimated";
}
export interface RealtimeBrightnessConfig {
    updateInterval?: number;
    historySize?: number;
    smoothingFactor?: number;
    enableTimeBasedEstimation?: boolean;
    enableAmbientLightSensor?: boolean;
}
export declare class RealtimeBrightnessDetector {
    private analysisInterval;
    private isActive;
    private config;
    private onLightingChange;
    private translations;
    private lightSensorSubscription;
    private deviceMotionSubscription;
    private cameraRef;
    private brightnessHistory;
    private lastMetrics;
    private currentIlluminance;
    private deviceOrientation;
    constructor(onLightingChange: (metrics: LightingMetrics) => void, config?: Partial<RealtimeBrightnessConfig>, translations?: any);
    start(cameraRef?: any): Promise<void>;
    private startAmbientLightSensor;
    private startDeviceMotionSensor;
    private startRealtimeAnalysis;
    private analyzeCurrentLighting;
    private getAmbientLightBasedBrightness;
    private analyzeCameraFeed;
    private analyzeImageBrightness;
    private estimateContrastFromLighting;
    private getTimeBasedEstimation;
    private estimateContrastFromLuminance;
    private handleBrightnessUpdate;
    private applySmoothingLuminance;
    private applySmoothingContrast;
    private calculateLightingMetrics;
    private scoreLuminance;
    private scoreContrast;
    private estimateColorTemperature;
    stop(): void;
    getLastMetrics(): LightingMetrics;
    isRunning(): boolean;
    setTranslations(translations: any): void;
}
export declare function getBrightnessRecommendationMessage(quality: "excellent" | "good" | "fair" | "poor" | "very_poor", translations: any): string;
//# sourceMappingURL=realtimeBrightnessDetectorV2.d.ts.map