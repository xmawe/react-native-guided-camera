import { Magnetometer } from "expo-sensors";

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

export class YawDetector {
  private subscription: any = null;
  private isActive = false;
  private config: YawDetectorConfig;
  private onYawChange: (metrics: YawMetrics) => void;
  private smoothedYaw = 0;
  private targetYaw: number | null = null;

  constructor(
    onYawChange: (metrics: YawMetrics) => void,
    config: Partial<YawDetectorConfig> = {}
  ) {
    this.onYawChange = onYawChange;
    this.config = {
      updateInterval: 10,
      yawTolerance: 10, // 8 degrees tolerance (more practical)
      smoothingFactor: 0.8,
      ...config,
    };
  }

  private calculateYaw(x: number, y: number): number {
    let yaw = Math.atan2(y, x) * (180 / Math.PI);
    // Normalize to 0-360 degrees
    if (yaw < 0) yaw += 360;
    return yaw;
  }

  private calculateYawMetrics(currentYaw: number): YawMetrics {
    let deviation = 0;
    let isOnTarget = true;
    let direction: "on_target" | "turn_left" | "turn_right" = "on_target";
    let severity: "good" | "minor" | "major" = "good";

    // If no target is set, use the first reading as the target
    if (this.targetYaw === null) {
      this.targetYaw = currentYaw;
      console.log("YawDetector: Auto-setting target yaw to:", this.targetYaw);
    }

    // Calculate shortest angular distance (handling 360° wraparound)
    let diff = currentYaw - this.targetYaw;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    deviation = Math.abs(diff);
    isOnTarget = deviation <= this.config.yawTolerance;

    if (!isOnTarget) {
      direction = diff > 0 ? "turn_left" : "turn_right";

      if (deviation <= 15) {
        severity = "minor";
      } else if (deviation <= 30) {
        severity = "major";
      } else {
        severity = "major";
      }
    }

    return {
      yaw: currentYaw,
      isOnTarget,
      deviation,
      direction,
      severity,
    };
  }

  public async start(): Promise<void> {
    if (this.isActive) return;

    try {
      console.log("YawDetector: Requesting magnetometer permissions...");
      const { status } = await Magnetometer.requestPermissionsAsync();
      console.log("YawDetector: Permission status:", status);

      if (status !== "granted") {
        console.warn("YawDetector: Magnetometer permission not granted");
        return;
      }

      console.log(
        "YawDetector: Setting update interval to",
        this.config.updateInterval
      );
      Magnetometer.setUpdateInterval(this.config.updateInterval);

      console.log("YawDetector: Adding magnetometer listener...");
      this.subscription = Magnetometer.addListener((data) => {
        const rawYaw = this.calculateYaw(data.x, data.y);

        // Apply smoothing
        if (this.smoothedYaw === 0) {
          this.smoothedYaw = rawYaw;
        } else {
          // Handle 360° wraparound for smoothing
          let diff = rawYaw - this.smoothedYaw;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;

          this.smoothedYaw += diff * (1 - this.config.smoothingFactor);
          if (this.smoothedYaw < 0) this.smoothedYaw += 360;
          if (this.smoothedYaw >= 360) this.smoothedYaw -= 360;
        }

        const metrics = this.calculateYawMetrics(this.smoothedYaw);
        // console.log(
        //   "YawDetector: Current:",
        //   this.smoothedYaw.toFixed(1),
        //   "Target:",
        //   this.targetYaw?.toFixed(1),
        //   "Deviation:",
        //   metrics.deviation.toFixed(1),
        //   "OnTarget:",
        //   metrics.isOnTarget
        // );
        this.onYawChange(metrics);
      });

      this.isActive = true;
      console.log("YawDetector: Successfully started");
    } catch (error) {
      console.error("YawDetector: Failed to start yaw detector:", error);
    }
  }

  public stop(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isActive = false;
  }

  public setTarget(yaw: number): void {
    this.targetYaw = yaw;
    console.log("YawDetector: Target yaw set to:", yaw);
  }

  public clearTarget(): void {
    this.targetYaw = null;
    console.log("YawDetector: Target yaw cleared");
  }

  public calibrateToCurrentPosition(): void {
    this.targetYaw = this.smoothedYaw;
    console.log(
      "YawDetector: Calibrated target to current position:",
      this.targetYaw
    );
  }

  public getCurrentYaw(): number {
    return this.smoothedYaw;
  }

  public hasTarget(): boolean {
    return this.targetYaw !== null;
  }
}

// Helper functions for UI
export const getYawColor = (severity: string): string => {
  switch (severity) {
    case "good":
      return "#4CAF50";
    case "minor":
      return "#FF9800";
    case "major":
      return "#F44336";
    default:
      return "#FF9800";
  }
};

export const getYawMessage = (metrics: YawMetrics): string => {
  if (metrics.isOnTarget) {
    return "Compass aligned";
  }

  switch (metrics.direction) {
    case "turn_left":
      return "Turn body left";
    case "turn_right":
      return "Turn body right";
    default:
      return "Adjust orientation";
  }
};

// Translation-aware version
export const getYawMessageTranslated = (
  metrics: YawMetrics,
  translations: any
): string => {
  if (metrics.isOnTarget) {
    return translations.compassAligned;
  }

  switch (metrics.direction) {
    case "turn_left":
      return translations.turnBodyLeft;
    case "turn_right":
      return translations.turnBodyRight;
    default:
      return translations.adjustOrientation;
  }
};

export const shouldAllowRecordingYaw = (metrics: YawMetrics): boolean => {
  return metrics.isOnTarget || metrics.severity === "minor";
};
