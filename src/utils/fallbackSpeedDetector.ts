import { Accelerometer } from "expo-sensors";

export interface SpeedMetrics {
  speed: number; // Current speed in m/s
  speedKmh: number; // Current speed in km/h
  speedMph: number; // Current speed in mph
  accuracy: number; // GPS accuracy in meters
  isMoving: boolean; // Whether device is moving
  movementType:
    | "stationary"
    | "walking"
    | "running"
    | "driving"
    | "fast_moving";
  recommendation: string;
  source: "gps" | "sensors" | "hybrid";
}

export interface SpeedDetectorConfig {
  updateInterval?: number;
  historySize?: number;
  smoothingFactor?: number;
  enableSensorFusion?: boolean;
  movingThreshold?: number; // m/s threshold to consider as moving
  walkingThreshold?: number; // m/s threshold for walking
  runningThreshold?: number; // m/s threshold for running
  drivingThreshold?: number; // m/s threshold for driving
}

// Fallback speed detector that only uses accelerometer data
export class FallbackSpeedDetector {
  private callback: (metrics: SpeedMetrics) => void;
  private config: Required<SpeedDetectorConfig>;
  private isActive: boolean = false;
  private accelerometerSubscription: any = null;
  private accelerometerHistory: {
    x: number;
    y: number;
    z: number;
    timestamp: number;
  }[] = [];

  constructor(
    callback: (metrics: SpeedMetrics) => void,
    config: Partial<SpeedDetectorConfig> = {}
  ) {
    this.callback = callback;
    this.config = {
      updateInterval: config.updateInterval || 1000,
      historySize: config.historySize || 10,
      smoothingFactor: config.smoothingFactor || 0.8,
      enableSensorFusion: config.enableSensorFusion || true,
      movingThreshold: config.movingThreshold || 0.5,
      walkingThreshold: config.walkingThreshold || 1.5,
      runningThreshold: config.runningThreshold || 4.0,
      drivingThreshold: config.drivingThreshold || 8.0,
    };
  }

  public async start(): Promise<void> {
    if (this.isActive) return;

    try {
      console.log("Starting fallback speed detector (accelerometer only)");

      // Start accelerometer tracking
      this.startAccelerometerTracking();
      this.isActive = true;
    } catch (error) {
      console.error("Failed to start fallback speed detector:", error);
    }
  }

  private startAccelerometerTracking(): void {
    Accelerometer.setUpdateInterval(this.config.updateInterval);

    this.accelerometerSubscription = Accelerometer.addListener(
      (accelerometerData) => {
        const timestamp = Date.now();
        this.accelerometerHistory.push({
          x: accelerometerData.x,
          y: accelerometerData.y,
          z: accelerometerData.z,
          timestamp,
        });

        // Keep history size manageable
        if (this.accelerometerHistory.length > this.config.historySize) {
          this.accelerometerHistory.shift();
        }

        // Calculate motion metrics from accelerometer
        const motionMetrics = this.calculateMotionFromAccelerometer();
        this.callback(motionMetrics);
      }
    );
  }

  private calculateMotionFromAccelerometer(): SpeedMetrics {
    if (this.accelerometerHistory.length < 2) {
      return {
        speed: 0,
        speedKmh: 0,
        speedMph: 0,
        accuracy: 0,
        isMoving: false,
        movementType: "stationary",
        recommendation: "Insufficient data for motion detection",
        source: "sensors",
      };
    }

    // Calculate motion intensity from accelerometer data
    const recent = this.accelerometerHistory.slice(-5); // Last 5 readings
    let totalMotion = 0;

    for (let i = 1; i < recent.length; i++) {
      const prev = recent[i - 1];
      const curr = recent[i];

      // Calculate magnitude of acceleration change
      const deltaX = curr.x - prev.x;
      const deltaY = curr.y - prev.y;
      const deltaZ = curr.z - prev.z;

      const magnitude = Math.sqrt(
        deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ
      );
      totalMotion += magnitude;
    }

    const averageMotion = totalMotion / (recent.length - 1);

    // Convert motion intensity to estimated speed (rough approximation)
    let estimatedSpeed = 0;
    let movementType: SpeedMetrics["movementType"] = "stationary";

    if (averageMotion > 0.1) {
      estimatedSpeed = Math.min(averageMotion * 10, 30); // Scale and cap speed

      if (estimatedSpeed < this.config.movingThreshold) {
        movementType = "stationary";
      } else if (estimatedSpeed < this.config.walkingThreshold) {
        movementType = "walking";
      } else if (estimatedSpeed < this.config.runningThreshold) {
        movementType = "running";
      } else if (estimatedSpeed < this.config.drivingThreshold) {
        movementType = "driving";
      } else {
        movementType = "fast_moving";
      }
    }

    return {
      speed: estimatedSpeed,
      speedKmh: estimatedSpeed * 3.6,
      speedMph: estimatedSpeed * 2.237,
      accuracy: 10, // Low accuracy for accelerometer-only
      isMoving: estimatedSpeed > this.config.movingThreshold,
      movementType,
      recommendation: this.getMovementRecommendation(
        movementType,
        estimatedSpeed
      ),
      source: "sensors",
    };
  }

  private getMovementRecommendation(
    movementType: string,
    speed: number
  ): string {
    switch (movementType) {
      case "stationary":
        return "Device is stationary - good for stable recording";
      case "walking":
        return "Walking pace detected - use stabilization";
      case "running":
        return "Running detected - recording may be shaky";
      case "driving":
        return "Vehicle movement detected";
      case "fast_moving":
        return "High speed movement - avoid recording";
      default:
        return "Motion detected";
    }
  }

  public stop(): void {
    if (!this.isActive) return;

    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    this.isActive = false;
    console.log("Fallback speed detector stopped");
  }

  public isRunning(): boolean {
    return this.isActive;
  }
}

// Helper functions for compatibility
export const getSpeedColor = (speed: number): string => {
  if (speed < 1) return "#4CAF50"; // Green for stationary
  if (speed < 3) return "#FFC107"; // Yellow for walking
  if (speed < 8) return "#FF9800"; // Orange for running
  return "#F4433670"; // Red for fast movement
};

export const getSpeedMessage = (metrics: SpeedMetrics): string => {
  return metrics.recommendation;
};

export const shouldAllowRecordingSpeed = (metrics: SpeedMetrics): boolean => {
  return metrics.speed < 8; // Allow recording for speeds under 8 m/s
};

export const getSpeedIcon = (movementType: string): string => {
  switch (movementType) {
    case "stationary":
      return "pause";
    case "walking":
      return "walk";
    case "running":
      return "fitness";
    case "driving":
      return "car";
    case "fast_moving":
      return "rocket";
    default:
      return "help";
  }
};

// Translation-aware speed message functions
export function getSpeedRecommendationMessage(
  speed: number,
  isMoving: boolean,
  translations: any
): string {
  if (!isMoving) {
    return translations.deviceStationary;
  } else if (speed < 1.5) {
    return translations.walkingPaceStabilization;
  } else if (speed < 4.0) {
    return translations.runningDetectedShaky;
  } else if (speed < 8.0) {
    return translations.vehicleMovementDetected;
  } else {
    return translations.highSpeedAvoidRecording;
  }
}

export function getSpeedMotionMessage(translations: any): string {
  return translations.motionDetected;
}
