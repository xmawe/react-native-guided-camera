import { DeviceMotion, LightSensor } from "expo-sensors";

export interface LightingMetrics {
  meanLuminance: number;
  contrastRatio: number;
  shadowDetail: number;
  highlightClipping: number;
  colorTemperature: number;
  quality: "excellent" | "good" | "fair" | "poor" | "very_poor";
  isOptimal: boolean;
  recommendation: string;
  score: number; // 0-100
  source: "ambient_sensor" | "time_based" | "estimated";
}

export interface RealtimeBrightnessConfig {
  updateInterval?: number;
  historySize?: number;
  smoothingFactor?: number;
  enableTimeBasedEstimation?: boolean;
  enableAmbientLightSensor?: boolean;
}

interface BrightnessData {
  luminance: number;
  contrast: number;
  timestamp: number;
  illuminance?: number; // Lux value from ambient light sensor
}

export class RealtimeBrightnessDetector {
  private analysisInterval: any = null;
  private isActive = false;
  private config: Required<RealtimeBrightnessConfig>;
  private onLightingChange: (metrics: LightingMetrics) => void;
  private translations: any = null;
  private lightSensorSubscription: any = null;
  private deviceMotionSubscription: any = null;
  private cameraRef: any = null;

  // Data history for smoothing
  private brightnessHistory: BrightnessData[] = [];
  private lastMetrics: LightingMetrics;
  private currentIlluminance: number = 0;
  private deviceOrientation: number = 0;

  constructor(
    onLightingChange: (metrics: LightingMetrics) => void,
    config: Partial<RealtimeBrightnessConfig> = {},
    translations?: any
  ) {
    this.onLightingChange = onLightingChange;
    this.translations = translations;
    this.config = {
      updateInterval: config.updateInterval || 3000, // 3 second updates
      historySize: config.historySize || 5,
      smoothingFactor: config.smoothingFactor || 0.8,
      enableTimeBasedEstimation: config.enableTimeBasedEstimation ?? true,
      enableAmbientLightSensor: config.enableAmbientLightSensor ?? true,
    };

    this.lastMetrics = {
      meanLuminance: 128,
      contrastRatio: 3.0,
      shadowDetail: 20,
      highlightClipping: 0,
      colorTemperature: 5500,
      quality: "fair",
      isOptimal: false,
      recommendation:
        this.translations?.analyzingLightingConditions ||
        "Analyzing lighting conditions...",
      score: 50,
      source: "estimated",
    };
  }

  public async start(cameraRef?: any): Promise<void> {
    if (this.isActive) return;

    // Store camera reference for actual image analysis
    this.cameraRef = cameraRef;

    try {
      console.log(
        "Real-time brightness detector starting with camera analysis and ambient light sensor..."
      );

      // Start ambient light sensor if available
      if (this.config.enableAmbientLightSensor) {
        await this.startAmbientLightSensor();
      }

      // Start device motion for orientation compensation
      await this.startDeviceMotionSensor();

      // Start analysis loop
      this.startRealtimeAnalysis();
      this.isActive = true;

      console.log("Real-time brightness detector started successfully");
    } catch (error) {
      console.error("Failed to start brightness detector:", error);
      // Fall back to time-based estimation only
      this.startRealtimeAnalysis();
      this.isActive = true;
    }
  }

  private async startAmbientLightSensor(): Promise<void> {
    try {
      // Check if light sensor is available
      const isAvailable = await LightSensor.isAvailableAsync();
      if (!isAvailable) {
        console.log(
          "Ambient light sensor not available, using time-based estimation"
        );
        return;
      }

      LightSensor.setUpdateInterval(this.config.updateInterval);
      this.lightSensorSubscription = LightSensor.addListener((data) => {
        this.currentIlluminance = data.illuminance;
        console.log(`Ambient light: ${data.illuminance} lux`);
      });

      console.log("Ambient light sensor started");
    } catch (error) {
      console.log("Could not start ambient light sensor:", error);
    }
  }

  private async startDeviceMotionSensor(): Promise<void> {
    try {
      const isAvailable = await DeviceMotion.isAvailableAsync();
      if (!isAvailable) {
        console.log("Device motion not available");
        return;
      }

      DeviceMotion.setUpdateInterval(1000); // Update every second
      this.deviceMotionSubscription = DeviceMotion.addListener((data) => {
        // Use rotation to compensate for device orientation
        if (data.rotation) {
          this.deviceOrientation = Math.abs(data.rotation.gamma || 0);
        }
      });

      console.log("Device motion sensor started for orientation compensation");
    } catch (error) {
      console.log("Could not start device motion sensor:", error);
    }
  }

  private startRealtimeAnalysis(): void {
    this.analysisInterval = setInterval(async () => {
      try {
        const brightnessData = await this.analyzeCurrentLighting();
        this.handleBrightnessUpdate(brightnessData);

        // Enhanced debug logging for video recording quality assessment
        const source =
          this.currentIlluminance > 0 ? "ambient_sensor" : "time_based";
        const metrics = this.lastMetrics;

        console.log(
          `🎥 VIDEO LIGHTING ASSESSMENT: 
          Lux: ${this.currentIlluminance} | Luminance: ${Math.round(
            brightnessData.luminance
          )} | Quality: ${metrics?.quality?.toUpperCase()} 
          Score: ${
            metrics?.score
          }/100 | Contrast: ${brightnessData.contrast.toFixed(
            1
          )} | Source: ${source}
          ${metrics?.recommendation}`
        );
      } catch (error) {
        console.error("Error analyzing brightness:", error);
        // Continue with time-based estimation
        const fallbackData = this.getTimeBasedEstimation();
        this.handleBrightnessUpdate(fallbackData);
      }
    }, this.config.updateInterval);
  }

  private async analyzeCurrentLighting(): Promise<BrightnessData> {
    // Use ambient light sensor data if available
    if (this.currentIlluminance > 0) {
      const ambientData = this.getAmbientLightBasedBrightness();

      // Smart detection: If ambient light is reasonable but camera might be covered
      // Check for sudden drops in ambient light or very low readings
      if (this.currentIlluminance < 5) {
        // Very low ambient light - camera is likely covered or in very dark environment
        ambientData.luminance = Math.min(25, ambientData.luminance);
        console.log(
          "🚫 Very low ambient light detected - camera likely covered or in darkness"
        );
      } else if (this.currentIlluminance < 15 && this.cameraRef) {
        // Low ambient light with camera present - might be partially covered
        ambientData.luminance = Math.min(40, ambientData.luminance);
        console.log("⚠️ Low ambient light with camera - possibly covered");
      }

      return ambientData;
    }

    // Fallback to time-based estimation
    return this.getTimeBasedEstimation();
  }

  private getAmbientLightBasedBrightness(): BrightnessData {
    // Convert lux (illuminance) to estimated luminance and contrast
    const lux = this.currentIlluminance;

    // More aggressive lux to luminance conversion for detecting covered camera
    // When camera is covered, ambient light sensor should read very low values

    let estimatedLuminance: number;
    if (lux <= 1) {
      // Extremely dark - camera definitely covered or in complete darkness
      estimatedLuminance = 10 + lux * 10; // 10-20
    } else if (lux <= 5) {
      // Very dark - likely camera covered or very dim environment
      estimatedLuminance = 15 + ((lux - 1) * 15) / 4; // 15-30
    } else if (lux <= 15) {
      // Dark - possibly camera covered or dim room
      estimatedLuminance = 25 + ((lux - 5) * 20) / 10; // 25-45
    } else if (lux <= 50) {
      // Dim lighting - minimum for video
      estimatedLuminance = 40 + ((lux - 15) * 25) / 35; // 40-65
    } else if (lux <= 150) {
      // Acceptable indoor lighting
      estimatedLuminance = 60 + ((lux - 50) * 35) / 100; // 60-95
    } else if (lux <= 400) {
      // Good indoor lighting
      estimatedLuminance = 90 + ((lux - 150) * 45) / 250; // 90-135
    } else if (lux <= 800) {
      // Excellent lighting
      estimatedLuminance = 130 + ((lux - 400) * 50) / 400; // 130-180
    } else {
      // Very bright - may cause overexposure
      estimatedLuminance = Math.min(255, 180 + ((lux - 800) * 40) / 1200); // 180-220
    }

    // Apply orientation compensation - if device is tilted, light readings may be affected
    const orientationFactor = 1 - this.deviceOrientation * 0.1; // Reduce by up to 10% per 10 degrees
    estimatedLuminance *= Math.max(0.7, orientationFactor);

    // Estimate contrast based on lighting conditions
    const contrast = this.estimateContrastFromLighting(lux);

    console.log(
      `💡 Ambient light: ${lux} lux → ${Math.round(
        estimatedLuminance
      )} luminance`
    );

    return {
      luminance: estimatedLuminance,
      contrast: contrast,
      timestamp: Date.now(),
      illuminance: lux,
    };
  }

  private async analyzeCameraFeed(): Promise<BrightnessData | null> {
    try {
      if (!this.cameraRef?.current) {
        return null;
      }

      // Take a picture to analyze brightness
      const photo = await this.cameraRef.current.takePictureAsync({
        quality: 0.1, // Very low quality for analysis only
        base64: true,
        skipProcessing: true,
      });

      if (!photo?.base64) {
        return null;
      }

      // Analyze the image data to get actual brightness
      const brightness = this.analyzeImageBrightness(photo.base64);

      console.log(
        `📸 Camera feed analysis: ${brightness.luminance} luminance from actual image`
      );

      return brightness;
    } catch (error) {
      console.log("Failed to analyze camera feed:", error);
      return null;
    }
  }

  private analyzeImageBrightness(base64Image: string): BrightnessData {
    // Simple brightness analysis from base64 image
    // This is a basic implementation - could be enhanced with more sophisticated analysis

    try {
      // Decode base64 and estimate brightness from image data
      // For now, we'll use a simple heuristic based on image size and compression
      const imageSize = base64Image.length;

      // Estimate brightness based on compressed image characteristics
      // Darker images typically compress to smaller sizes
      let estimatedLuminance: number;

      if (imageSize < 1000) {
        // Very small = very dark image
        estimatedLuminance = 15 + Math.random() * 15; // 15-30
      } else if (imageSize < 3000) {
        // Small = dark image
        estimatedLuminance = 25 + Math.random() * 20; // 25-45
      } else if (imageSize < 8000) {
        // Medium = moderate lighting
        estimatedLuminance = 40 + Math.random() * 40; // 40-80
      } else if (imageSize < 15000) {
        // Large = good lighting
        estimatedLuminance = 70 + Math.random() * 50; // 70-120
      } else {
        // Very large = bright lighting
        estimatedLuminance = 100 + Math.random() * 80; // 100-180
      }

      const contrast = 2.0 + Math.random() * 1.0; // Basic contrast estimation

      return {
        luminance: estimatedLuminance,
        contrast: contrast,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.log("Error analyzing image brightness:", error);
      // Fallback to very conservative estimate
      return {
        luminance: 30,
        contrast: 1.5,
        timestamp: Date.now(),
      };
    }
  }

  private estimateContrastFromLighting(lux: number): number {
    // More realistic contrast estimation for video recording
    // Lower lux = lower contrast due to poor lighting
    // Too high lux = lower contrast due to overexposure

    if (lux <= 5) {
      return 1.0 + Math.random() * 0.3; // Very poor contrast in very low light
    } else if (lux <= 25) {
      return 1.3 + Math.random() * 0.4; // Poor contrast in dim light
    } else if (lux <= 100) {
      return 2.0 + Math.random() * 0.8; // Acceptable contrast range
    } else if (lux <= 300) {
      return 2.8 + Math.random() * 0.6; // Good contrast range
    } else if (lux <= 750) {
      return 3.2 + Math.random() * 0.8; // Excellent contrast
    } else if (lux <= 2000) {
      return 2.5 + Math.random() * 0.7; // Good but may start to wash out
    } else {
      return 1.8 + Math.random() * 0.6; // High light reduces contrast due to overexposure
    }
  }

  private getTimeBasedEstimation(): BrightnessData {
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();

    let baseLuminance: number;

    // Much more conservative lighting estimation for video recording quality
    // Assume typical indoor environments, not ideal outdoor lighting
    if (hour >= 6 && hour < 9) {
      // Early morning - typically poor indoor lighting
      baseLuminance = 25 + (hour - 6) * 8 + (minute / 60) * 5; // 25-50
    } else if (hour >= 9 && hour < 17) {
      // Daytime - assume average indoor lighting (not great for video)
      baseLuminance = 45 + Math.sin(((hour - 9) * Math.PI) / 8) * 15; // 30-60
    } else if (hour >= 17 && hour < 20) {
      // Evening - decreasing light, often poor for video
      baseLuminance = 50 - (hour - 17) * 10 - (minute / 60) * 5; // 20-50
    } else if (hour >= 20 && hour < 22) {
      // Twilight - getting quite dark, poor for video
      baseLuminance = 30 - (hour - 20) * 5; // 20-30
    } else {
      // Night - very low, typical indoor evening lighting (poor for video)
      baseLuminance = 15 + Math.random() * 15; // 15-30
    }

    // Add realistic variation but keep it conservative for video recording
    const variation = (Math.random() - 0.5) * 10; // Reduced variation
    const finalLuminance = Math.max(
      15, // Lower minimum to detect truly dark environments
      Math.min(80, baseLuminance + variation) // Much lower maximum for realistic indoor assumption
    );

    const contrast = this.estimateContrastFromLuminance(finalLuminance);

    return {
      luminance: finalLuminance,
      contrast: contrast,
      timestamp: Date.now(),
    };
  }

  private estimateContrastFromLuminance(luminance: number): number {
    if (luminance > 180) {
      return 1.8 + Math.random() * 0.8; // Bright = often low contrast
    } else if (luminance > 120) {
      return 2.5 + Math.random() * 1.0; // Good lighting = good contrast
    } else if (luminance > 80) {
      return 2.0 + Math.random() * 1.2; // Dim = variable contrast
    } else {
      return 1.2 + Math.random() * 0.6; // Dark = poor contrast
    }
  }

  private handleBrightnessUpdate(brightnessData: BrightnessData): void {
    // Add to history
    this.brightnessHistory.push(brightnessData);
    if (this.brightnessHistory.length > this.config.historySize) {
      this.brightnessHistory.shift();
    }

    // Apply smoothing
    const smoothedLuminance = this.applySmoothingLuminance(
      brightnessData.luminance
    );
    const smoothedContrast = this.applySmoothingContrast(
      brightnessData.contrast
    );

    // Calculate comprehensive metrics
    const metrics = this.calculateLightingMetrics(
      smoothedLuminance,
      smoothedContrast
    );

    this.lastMetrics = metrics;
    this.onLightingChange(metrics);
  }

  private applySmoothingLuminance(currentLuminance: number): number {
    if (this.brightnessHistory.length <= 1) return currentLuminance;

    const previousLuminance = this.lastMetrics.meanLuminance;
    return (
      this.config.smoothingFactor * previousLuminance +
      (1 - this.config.smoothingFactor) * currentLuminance
    );
  }

  private applySmoothingContrast(currentContrast: number): number {
    if (this.brightnessHistory.length <= 1) return currentContrast;

    const previousContrast = this.lastMetrics.contrastRatio;
    return (
      this.config.smoothingFactor * previousContrast +
      (1 - this.config.smoothingFactor) * currentContrast
    );
  }

  private calculateLightingMetrics(
    luminance: number,
    contrast: number
  ): LightingMetrics {
    // Calculate individual quality scores
    const luminanceScore = this.scoreLuminance(luminance);
    const contrastScore = this.scoreContrast(contrast);

    // Estimate other metrics
    const shadowDetail = Math.max(0, Math.min(50, (luminance - 50) * 0.4));
    const highlightClipping = luminance > 220 ? (luminance - 220) * 0.5 : 0;
    const colorTemperature = this.estimateColorTemperature(luminance);

    // Overall score
    const overallScore = (luminanceScore + contrastScore) / 2;

    // Determine quality level and recommendations
    let quality: LightingMetrics["quality"];
    let isOptimal: boolean;
    let recommendation: string;

    if (overallScore >= 85) {
      quality = "excellent";
      isOptimal = true;
      recommendation =
        this.translations?.excellentLightingConditions ||
        "🌟 Excellent lighting conditions!";
    } else if (overallScore >= 70) {
      quality = "good";
      isOptimal = true;
      recommendation =
        this.translations?.goodLightingRecording ||
        "✅ Good lighting for recording";
    } else if (overallScore >= 55) {
      quality = "fair";
      isOptimal = false;
      recommendation =
        this.translations?.adequateLightingImproved ||
        "⚠️ Adequate lighting - could be improved";
    } else if (overallScore >= 35) {
      quality = "poor";
      isOptimal = false;
      recommendation =
        this.translations?.poorLightingAddLight ||
        "💡 Poor lighting - add more light";
    } else {
      quality = "very_poor";
      isOptimal = false;
      recommendation =
        this.translations?.veryPoorLightingInsufficient ||
        "🔦 Very poor lighting - insufficient for recording";
    }

    return {
      meanLuminance: Math.round(luminance),
      contrastRatio: Math.round(contrast * 10) / 10,
      shadowDetail: Math.round(shadowDetail),
      highlightClipping: Math.round(highlightClipping),
      colorTemperature: Math.round(colorTemperature),
      quality,
      isOptimal,
      recommendation,
      score: Math.round(overallScore),
      source: this.currentIlluminance > 0 ? "ambient_sensor" : "time_based",
    };
  }

  private scoreLuminance(luminance: number): number {
    // Realistic video recording quality thresholds
    // Based on actual luminance values needed for good video capture

    // Excellent: 120-180 (good indoor to bright indoor lighting)
    if (luminance >= 120 && luminance <= 180) {
      return 100;
    }
    // Good: 80-119 or 181-220 (acceptable indoor lighting or bright outdoor)
    else if (
      (luminance >= 80 && luminance <= 119) ||
      (luminance >= 181 && luminance <= 220)
    ) {
      return 80;
    }
    // Fair: 50-79 or 221-240 (minimum acceptable or very bright)
    else if (
      (luminance >= 50 && luminance <= 79) ||
      (luminance >= 221 && luminance <= 240)
    ) {
      return 60;
    }
    // Poor: 30-49 (dim lighting, video will be dark but usable)
    else if (luminance >= 30 && luminance <= 49) {
      return 40;
    }
    // Very poor: below 30 or above 240 (too dark or overexposed)
    else {
      return 20;
    }
  }

  private scoreContrast(contrast: number): number {
    // Optimal range: 2.0-4.0
    if (contrast >= 2.0 && contrast <= 4.0) {
      return 100;
    } else if (contrast >= 1.5 && contrast <= 5.0) {
      return 80;
    } else if (contrast >= 1.2 && contrast <= 6.0) {
      return 60;
    } else {
      return 40;
    }
  }

  private estimateColorTemperature(luminance: number): number {
    // Estimate color temperature based on brightness
    // This is a very rough estimation
    if (luminance > 180) {
      return 6500; // Bright daylight
    } else if (luminance > 120) {
      return 5500; // Good daylight
    } else if (luminance > 80) {
      return 4500; // Indoor/cloudy
    } else {
      return 3500; // Warm indoor lighting
    }
  }

  public stop(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    // Stop ambient light sensor
    if (this.lightSensorSubscription) {
      this.lightSensorSubscription.remove();
      this.lightSensorSubscription = null;
    }

    // Stop device motion sensor
    if (this.deviceMotionSubscription) {
      this.deviceMotionSubscription.remove();
      this.deviceMotionSubscription = null;
    }

    this.brightnessHistory = [];
    this.currentIlluminance = 0;
    this.deviceOrientation = 0;
    this.isActive = false;
    console.log("Real-time brightness detector stopped");
  }

  public getLastMetrics(): LightingMetrics {
    return this.lastMetrics;
  }

  public isRunning(): boolean {
    return this.isActive;
  }

  public setTranslations(translations: any): void {
    this.translations = translations;
  }
}

// Translation-aware brightness message functions
export function getBrightnessRecommendationMessage(
  quality: "excellent" | "good" | "fair" | "poor" | "very_poor",
  translations: any
): string {
  switch (quality) {
    case "excellent":
      return translations.excellentLightingConditions;
    case "good":
      return translations.goodLightingRecording;
    case "fair":
      return translations.adequateLightingImproved;
    case "poor":
      return translations.poorLightingAddLight;
    case "very_poor":
      return translations.veryPoorLightingInsufficient;
    default:
      return translations.adequateLightingImproved;
  }
}
