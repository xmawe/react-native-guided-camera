import { Gyroscope, Accelerometer } from "expo-sensors";

export interface MotionMetrics {
  score: number; // Overall stability score (0-100)
  isStable: boolean; // Whether device is stable enough for recording
  stability: "excellent" | "good" | "fair" | "poor" | "very_poor";
  accelerationMagnitude: number; // Current acceleration magnitude
  rotationMagnitude: number; // Current rotation magnitude
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

interface GyroscopeData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export class MotionDetector {
  private gyroSubscription: any = null;
  private accelSubscription: any = null;
  private mockInterval: any = null;
  private isActive = false;
  private config: Required<MotionDetectorConfig>;
  private onMotionChange: (metrics: MotionMetrics) => void;

  // Data history for smoothing and sensor fusion
  private gyroscopeHistory: GyroscopeData[] = [];
  private accelerometerHistory: AccelerometerData[] = [];
  private stabilityHistory: number[] = [];

  private lastMetrics: MotionMetrics;

  constructor(
    onMotionChange: (metrics: MotionMetrics) => void,
    config: Partial<MotionDetectorConfig> = {}
  ) {
    this.onMotionChange = onMotionChange;
    this.config = {
      updateInterval: config.updateInterval || 100,
      historySize: config.historySize || 10,
      excellentThreshold: config.excellentThreshold || 85,
      goodThreshold: config.goodThreshold || 70,
      fairThreshold: config.fairThreshold || 50,
      poorThreshold: config.poorThreshold || 30,
      accelerationWeight: config.accelerationWeight || 0.6,
      rotationWeight: config.rotationWeight || 0.4,
      smoothingFactor: config.smoothingFactor || 0.7,
      enableSensorFusion: config.enableSensorFusion ?? true,
    };

    this.lastMetrics = {
      score: 100,
      isStable: true,
      stability: "excellent",
      accelerationMagnitude: 0,
      rotationMagnitude: 0,
      recommendation: "Perfect stability!",
      source: "gyroscope",
    };
  }

  public async start(): Promise<void> {
    if (this.isActive) return;

    try {
      console.log("Motion detector starting with config:", this.config);

      // Try to start gyroscope first
      const gyroStarted = await this.startGyroscopeTracking();

      // Try accelerometer if sensor fusion is enabled
      if (this.config.enableSensorFusion) {
        await this.startAccelerometerTracking();
      }

      // If no real sensors available, use mock data
      if (!gyroStarted) {
        console.warn("No motion sensors available - using mock data");
        this.startMockData();
      }

      this.isActive = true;
      console.log("Motion detector started successfully");
    } catch (error) {
      console.error("Failed to start motion detector:", error);
      console.log("Falling back to mock motion data");
      this.startMockData();
      this.isActive = true;
    }
  }

  private async startGyroscopeTracking(): Promise<boolean> {
    try {
      // Check if gyroscope is available
      const isAvailable = await Gyroscope.isAvailableAsync();
      if (!isAvailable) {
        console.warn("Gyroscope not available on this device");
        return false;
      }

      // Request gyroscope permissions
      const { status } = await Gyroscope.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Gyroscope permission not granted");
        return false;
      }

      console.log("Starting gyroscope tracking...");
      Gyroscope.setUpdateInterval(this.config.updateInterval);

      this.gyroSubscription = Gyroscope.addListener((data) => {
        const gyroData: GyroscopeData = {
          x: data.x,
          y: data.y,
          z: data.z,
          timestamp: Date.now(),
        };

        this.handleGyroscopeUpdate(gyroData);
      });

      return true;
    } catch (error) {
      console.error("Failed to start gyroscope tracking:", error);
      return false;
    }
  }

  private async startAccelerometerTracking(): Promise<boolean> {
    try {
      // Check if accelerometer is available
      const isAvailable = await Accelerometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn("Accelerometer not available for motion detection");
        return false;
      }

      console.log("Starting accelerometer tracking...");
      Accelerometer.setUpdateInterval(this.config.updateInterval);

      this.accelSubscription = Accelerometer.addListener((data) => {
        const accelData: AccelerometerData = {
          x: data.x,
          y: data.y,
          z: data.z,
          timestamp: Date.now(),
        };

        this.handleAccelerometerUpdate(accelData);
      });

      return true;
    } catch (error) {
      console.error("Failed to start accelerometer tracking:", error);
      return false;
    }
  }

  private startMockData(): void {
    console.log("Starting mock motion data...");
    this.mockInterval = setInterval(() => {
      const mockGyroData: GyroscopeData = {
        x: (Math.random() - 0.5) * 0.1, // Small random motion
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1,
        timestamp: Date.now(),
      };

      this.handleGyroscopeUpdate(mockGyroData, "mock");
    }, this.config.updateInterval);
  }

  private handleGyroscopeUpdate(
    gyroData: GyroscopeData,
    source: "gyroscope" | "mock" = "gyroscope"
  ): void {
    // Add to gyroscope history
    this.gyroscopeHistory.push(gyroData);
    if (this.gyroscopeHistory.length > this.config.historySize) {
      this.gyroscopeHistory.shift();
    }

    // Calculate rotation magnitude
    const rotationMagnitude = Math.sqrt(
      gyroData.x * gyroData.x +
        gyroData.y * gyroData.y +
        gyroData.z * gyroData.z
    );

    // Get acceleration magnitude from accelerometer if available
    let accelerationMagnitude = 0;
    let finalSource: MotionMetrics["source"] = source;

    if (
      this.config.enableSensorFusion &&
      this.accelerometerHistory.length > 0
    ) {
      const latestAccel =
        this.accelerometerHistory[this.accelerometerHistory.length - 1];
      accelerationMagnitude = Math.sqrt(
        latestAccel.x * latestAccel.x +
          latestAccel.y * latestAccel.y +
          latestAccel.z * latestAccel.z
      );
      finalSource = source === "mock" ? "mock" : "hybrid";
    }

    // Calculate stability score
    const stabilityScore = this.calculateStabilityScore(
      rotationMagnitude,
      accelerationMagnitude
    );

    // Apply smoothing
    this.stabilityHistory.push(stabilityScore);
    if (this.stabilityHistory.length > this.config.historySize) {
      this.stabilityHistory.shift();
    }

    const smoothedScore = this.applySmoothingToScore(stabilityScore);

    // Calculate final metrics
    const metrics = this.calculateMotionMetrics(
      smoothedScore,
      rotationMagnitude,
      accelerationMagnitude,
      finalSource
    );

    this.lastMetrics = metrics;
    this.onMotionChange(metrics);
  }

  private handleAccelerometerUpdate(accelData: AccelerometerData): void {
    // Add to accelerometer history
    this.accelerometerHistory.push(accelData);
    if (this.accelerometerHistory.length > this.config.historySize) {
      this.accelerometerHistory.shift();
    }
  }

  private calculateStabilityScore(
    rotation: number,
    acceleration: number
  ): number {
    // Weight rotation and acceleration components
    const rotationScore = Math.max(0, 100 - rotation * 100);
    const accelerationScore = Math.max(0, 100 - acceleration * 50);

    // Combine scores with weights
    const combinedScore =
      rotationScore * this.config.rotationWeight +
      accelerationScore * this.config.accelerationWeight;

    return Math.max(0, Math.min(100, combinedScore));
  }

  private applySmoothingToScore(currentScore: number): number {
    if (this.stabilityHistory.length === 0) return currentScore;

    const previousSmoothed = this.lastMetrics.score;
    return (
      this.config.smoothingFactor * previousSmoothed +
      (1 - this.config.smoothingFactor) * currentScore
    );
  }

  private calculateMotionMetrics(
    score: number,
    rotationMagnitude: number,
    accelerationMagnitude: number,
    source: MotionMetrics["source"]
  ): MotionMetrics {
    // Determine stability level
    let stability: MotionMetrics["stability"];
    let isStable: boolean;
    let recommendation: string;

    if (score >= this.config.excellentThreshold) {
      stability = "excellent";
      isStable = true;
      recommendation = "Perfect stability! 🎯";
    } else if (score >= this.config.goodThreshold) {
      stability = "good";
      isStable = true;
      recommendation = "Good stability ✅";
    } else if (score >= this.config.fairThreshold) {
      stability = "fair";
      isStable = true;
      recommendation = "Fair stability ⚠️";
    } else if (score >= this.config.poorThreshold) {
      stability = "poor";
      isStable = false;
      recommendation = "Poor stability - steady your device ⚡";
    } else {
      stability = "very_poor";
      isStable = false;
      recommendation = "Very poor stability - hold device steady! 🔴";
    }

    return {
      score: Math.round(score),
      isStable,
      stability,
      accelerationMagnitude: Math.round(accelerationMagnitude * 1000) / 1000,
      rotationMagnitude: Math.round(rotationMagnitude * 1000) / 1000,
      recommendation,
      source,
    };
  }

  public stop(): void {
    // Stop gyroscope
    if (this.gyroSubscription) {
      if (typeof this.gyroSubscription.remove === "function") {
        this.gyroSubscription.remove();
      }
      this.gyroSubscription = null;
    }

    // Stop accelerometer
    if (this.accelSubscription) {
      if (typeof this.accelSubscription.remove === "function") {
        this.accelSubscription.remove();
      }
      this.accelSubscription = null;
    }

    // Stop mock data
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }

    // Clear history
    this.gyroscopeHistory = [];
    this.accelerometerHistory = [];
    this.stabilityHistory = [];

    this.isActive = false;
    console.log("Motion detector stopped");
  }

  public getLastMetrics(): MotionMetrics {
    return this.lastMetrics;
  }

  public isRunning(): boolean {
    return this.isActive;
  }
}

// Translation-aware motion message functions
export function getMotionStabilityMessage(
  stability: "excellent" | "good" | "fair" | "poor" | "very_poor",
  translations: any
): string {
  switch (stability) {
    case "excellent":
      return translations.perfectStability;
    case "good":
      return translations.goodStability;
    case "fair":
      return translations.fairStability;
    case "poor":
      return translations.poorStabilityDevice;
    case "very_poor":
      return translations.veryPoorStabilityHold;
    default:
      return translations.goodStability;
  }
}
