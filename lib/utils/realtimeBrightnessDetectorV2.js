import { DeviceMotion, LightSensor } from "expo-sensors";
export class RealtimeBrightnessDetector {
    constructor(onLightingChange, config = {}, translations) {
        var _a, _b, _c;
        this.analysisInterval = null;
        this.isActive = false;
        this.translations = null;
        this.lightSensorSubscription = null;
        this.deviceMotionSubscription = null;
        // Data history for smoothing
        this.brightnessHistory = [];
        this.currentIlluminance = 0;
        this.deviceOrientation = 0;
        this.onLightingChange = onLightingChange;
        this.translations = translations;
        this.config = {
            updateInterval: config.updateInterval || 3000, // 3 second updates
            historySize: config.historySize || 5,
            smoothingFactor: config.smoothingFactor || 0.8,
            enableTimeBasedEstimation: (_a = config.enableTimeBasedEstimation) !== null && _a !== void 0 ? _a : true,
            enableAmbientLightSensor: (_b = config.enableAmbientLightSensor) !== null && _b !== void 0 ? _b : true,
        };
        this.lastMetrics = {
            meanLuminance: 128,
            contrastRatio: 3.0,
            shadowDetail: 20,
            highlightClipping: 0,
            colorTemperature: 5500,
            quality: "fair",
            isOptimal: false,
            recommendation: ((_c = this.translations) === null || _c === void 0 ? void 0 : _c.analyzingLightingConditions) ||
                "Analyzing lighting conditions...",
            score: 50,
            source: "estimated",
        };
    }
    async start(cameraRef) {
        if (this.isActive)
            return;
        try {
            console.log("Real-time brightness detector starting with ambient light sensor...");
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
        }
        catch (error) {
            console.error("Failed to start brightness detector:", error);
            // Fall back to time-based estimation only
            this.startRealtimeAnalysis();
            this.isActive = true;
        }
    }
    async startAmbientLightSensor() {
        try {
            // Check if light sensor is available
            const isAvailable = await LightSensor.isAvailableAsync();
            if (!isAvailable) {
                console.log("Ambient light sensor not available, using time-based estimation");
                return;
            }
            LightSensor.setUpdateInterval(this.config.updateInterval);
            this.lightSensorSubscription = LightSensor.addListener((data) => {
                this.currentIlluminance = data.illuminance;
                console.log(`Ambient light: ${data.illuminance} lux`);
            });
            console.log("Ambient light sensor started");
        }
        catch (error) {
            console.log("Could not start ambient light sensor:", error);
        }
    }
    async startDeviceMotionSensor() {
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
        }
        catch (error) {
            console.log("Could not start device motion sensor:", error);
        }
    }
    startRealtimeAnalysis() {
        this.analysisInterval = setInterval(async () => {
            try {
                const brightnessData = await this.analyzeCurrentLighting();
                this.handleBrightnessUpdate(brightnessData);
                // Debug logging
                const source = this.currentIlluminance > 0 ? "ambient_sensor" : "time_based";
                console.log(`Brightness: ${Math.round(brightnessData.luminance)}, Contrast: ${brightnessData.contrast.toFixed(1)}, Illuminance: ${this.currentIlluminance} lux, Source: ${source}`);
            }
            catch (error) {
                console.error("Error analyzing brightness:", error);
                // Continue with time-based estimation
                const fallbackData = this.getTimeBasedEstimation();
                this.handleBrightnessUpdate(fallbackData);
            }
        }, this.config.updateInterval);
    }
    async analyzeCurrentLighting() {
        // Prefer ambient light sensor data if available
        if (this.currentIlluminance > 0) {
            return this.getAmbientLightBasedBrightness();
        }
        // Fallback to intelligent time-based estimation
        return this.getTimeBasedEstimation();
    }
    getAmbientLightBasedBrightness() {
        // Convert lux (illuminance) to estimated luminance and contrast
        const lux = this.currentIlluminance;
        // Lux to luminance conversion (approximate)
        // 0 lux = very dark (20 luminance)
        // 1 lux = very dim (40 luminance)
        // 10 lux = dim indoor (80 luminance)
        // 100 lux = normal indoor (120 luminance)
        // 500 lux = office lighting (160 luminance)
        // 1000 lux = bright daylight (200 luminance)
        // 10000+ lux = direct sunlight (240+ luminance)
        let estimatedLuminance;
        if (lux <= 1) {
            estimatedLuminance = 20 + lux * 20; // 20-40
        }
        else if (lux <= 10) {
            estimatedLuminance = 40 + ((lux - 1) * 40) / 9; // 40-80
        }
        else if (lux <= 100) {
            estimatedLuminance = 80 + ((lux - 10) * 40) / 90; // 80-120
        }
        else if (lux <= 500) {
            estimatedLuminance = 120 + ((lux - 100) * 40) / 400; // 120-160
        }
        else if (lux <= 1000) {
            estimatedLuminance = 160 + ((lux - 500) * 40) / 500; // 160-200
        }
        else if (lux <= 10000) {
            estimatedLuminance = 200 + ((lux - 1000) * 40) / 9000; // 200-240
        }
        else {
            estimatedLuminance = Math.min(250, 240 + ((lux - 10000) * 10) / 10000); // 240-250
        }
        // Apply orientation compensation - if device is tilted, light readings may be affected
        const orientationFactor = 1 - this.deviceOrientation * 0.1; // Reduce by up to 10% per 10 degrees
        estimatedLuminance *= Math.max(0.7, orientationFactor);
        // Estimate contrast based on lighting conditions
        const contrast = this.estimateContrastFromLighting(lux);
        return {
            luminance: estimatedLuminance,
            contrast: contrast,
            timestamp: Date.now(),
            illuminance: lux,
        };
    }
    estimateContrastFromLighting(lux) {
        // Higher lux generally means better contrast, but too high can cause overexposure
        if (lux <= 1) {
            return 1.0 + Math.random() * 0.3; // Poor contrast in very low light
        }
        else if (lux <= 10) {
            return 1.5 + Math.random() * 0.5; // Improving contrast
        }
        else if (lux <= 100) {
            return 2.0 + Math.random() * 1.0; // Good contrast range
        }
        else if (lux <= 1000) {
            return 2.5 + Math.random() * 1.5; // Excellent contrast
        }
        else if (lux <= 10000) {
            return 2.0 + Math.random() * 1.0; // Good but may start to wash out
        }
        else {
            return 1.5 + Math.random() * 0.8; // High light may reduce contrast
        }
    }
    getTimeBasedEstimation() {
        const hour = new Date().getHours();
        const minute = new Date().getMinutes();
        let baseLuminance;
        // Much more conservative lighting estimation
        // Assume indoor/moderate lighting conditions by default
        if (hour >= 6 && hour < 9) {
            // Early morning - start low, gradually increase
            baseLuminance = 30 + (hour - 6) * 15 + (minute / 60) * 10; // 30-75
        }
        else if (hour >= 9 && hour < 17) {
            // Daytime - assume moderate indoor lighting, not bright outdoor
            baseLuminance = 60 + Math.sin(((hour - 9) * Math.PI) / 8) * 20; // 40-80
        }
        else if (hour >= 17 && hour < 20) {
            // Evening - decreasing light
            baseLuminance = 70 - (hour - 17) * 15 - (minute / 60) * 10; // 25-70
        }
        else if (hour >= 20 && hour < 22) {
            // Twilight - getting quite dark
            baseLuminance = 40 - (hour - 20) * 10; // 20-40
        }
        else {
            // Night - very low, typical indoor evening lighting
            baseLuminance = 15 + Math.random() * 20; // 15-35
        }
        // Add realistic variation but keep it conservative
        const variation = (Math.random() - 0.5) * 15; // Reduced variation
        const finalLuminance = Math.max(10, // Lower minimum to detect truly dark environments
        Math.min(120, baseLuminance + variation) // Much lower maximum for indoor assumption
        );
        const contrast = this.estimateContrastFromLuminance(finalLuminance);
        return {
            luminance: finalLuminance,
            contrast: contrast,
            timestamp: Date.now(),
        };
    }
    estimateContrastFromLuminance(luminance) {
        if (luminance > 180) {
            return 1.8 + Math.random() * 0.8; // Bright = often low contrast
        }
        else if (luminance > 120) {
            return 2.5 + Math.random() * 1.0; // Good lighting = good contrast
        }
        else if (luminance > 80) {
            return 2.0 + Math.random() * 1.2; // Dim = variable contrast
        }
        else {
            return 1.2 + Math.random() * 0.6; // Dark = poor contrast
        }
    }
    handleBrightnessUpdate(brightnessData) {
        // Add to history
        this.brightnessHistory.push(brightnessData);
        if (this.brightnessHistory.length > this.config.historySize) {
            this.brightnessHistory.shift();
        }
        // Apply smoothing
        const smoothedLuminance = this.applySmoothingLuminance(brightnessData.luminance);
        const smoothedContrast = this.applySmoothingContrast(brightnessData.contrast);
        // Calculate comprehensive metrics
        const metrics = this.calculateLightingMetrics(smoothedLuminance, smoothedContrast);
        this.lastMetrics = metrics;
        this.onLightingChange(metrics);
    }
    applySmoothingLuminance(currentLuminance) {
        if (this.brightnessHistory.length <= 1)
            return currentLuminance;
        const previousLuminance = this.lastMetrics.meanLuminance;
        return (this.config.smoothingFactor * previousLuminance +
            (1 - this.config.smoothingFactor) * currentLuminance);
    }
    applySmoothingContrast(currentContrast) {
        if (this.brightnessHistory.length <= 1)
            return currentContrast;
        const previousContrast = this.lastMetrics.contrastRatio;
        return (this.config.smoothingFactor * previousContrast +
            (1 - this.config.smoothingFactor) * currentContrast);
    }
    calculateLightingMetrics(luminance, contrast) {
        var _a, _b, _c, _d, _e;
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
        let quality;
        let isOptimal;
        let recommendation;
        if (overallScore >= 85) {
            quality = "excellent";
            isOptimal = true;
            recommendation =
                ((_a = this.translations) === null || _a === void 0 ? void 0 : _a.excellentLightingConditions) ||
                    "🌟 Excellent lighting conditions!";
        }
        else if (overallScore >= 70) {
            quality = "good";
            isOptimal = true;
            recommendation =
                ((_b = this.translations) === null || _b === void 0 ? void 0 : _b.goodLightingRecording) ||
                    "✅ Good lighting for recording";
        }
        else if (overallScore >= 55) {
            quality = "fair";
            isOptimal = false;
            recommendation =
                ((_c = this.translations) === null || _c === void 0 ? void 0 : _c.adequateLightingImproved) ||
                    "⚠️ Adequate lighting - could be improved";
        }
        else if (overallScore >= 35) {
            quality = "poor";
            isOptimal = false;
            recommendation =
                ((_d = this.translations) === null || _d === void 0 ? void 0 : _d.poorLightingAddLight) ||
                    "💡 Poor lighting - add more light";
        }
        else {
            quality = "very_poor";
            isOptimal = false;
            recommendation =
                ((_e = this.translations) === null || _e === void 0 ? void 0 : _e.veryPoorLightingInsufficient) ||
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
    scoreLuminance(luminance) {
        // More realistic optimal ranges for camera recording
        // Excellent: 150-200 (bright, well-lit conditions)
        if (luminance >= 150 && luminance <= 200) {
            return 100;
        }
        // Good: 100-149 or 201-230 (good indoor lighting)
        else if ((luminance >= 100 && luminance <= 149) ||
            (luminance >= 201 && luminance <= 230)) {
            return 80;
        }
        // Fair: 70-99 or 231-250 (acceptable but not ideal)
        else if ((luminance >= 70 && luminance <= 99) ||
            (luminance >= 231 && luminance <= 250)) {
            return 60;
        }
        // Poor: 40-69 (dim lighting, needs improvement)
        else if (luminance >= 40 && luminance <= 69) {
            return 40;
        }
        // Very poor: below 40 or above 250 (too dark or too bright)
        else {
            return 20;
        }
    }
    scoreContrast(contrast) {
        // Optimal range: 2.0-4.0
        if (contrast >= 2.0 && contrast <= 4.0) {
            return 100;
        }
        else if (contrast >= 1.5 && contrast <= 5.0) {
            return 80;
        }
        else if (contrast >= 1.2 && contrast <= 6.0) {
            return 60;
        }
        else {
            return 40;
        }
    }
    estimateColorTemperature(luminance) {
        // Estimate color temperature based on brightness
        // This is a very rough estimation
        if (luminance > 180) {
            return 6500; // Bright daylight
        }
        else if (luminance > 120) {
            return 5500; // Good daylight
        }
        else if (luminance > 80) {
            return 4500; // Indoor/cloudy
        }
        else {
            return 3500; // Warm indoor lighting
        }
    }
    stop() {
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
    getLastMetrics() {
        return this.lastMetrics;
    }
    isRunning() {
        return this.isActive;
    }
    setTranslations(translations) {
        this.translations = translations;
    }
}
// Translation-aware brightness message functions
export function getBrightnessRecommendationMessage(quality, translations) {
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
//# sourceMappingURL=realtimeBrightnessDetectorV2.js.map