import { Gyroscope, Accelerometer } from "expo-sensors";
export class MotionDetector {
    constructor(onMotionChange, config = {}) {
        var _a;
        this.gyroSubscription = null;
        this.accelSubscription = null;
        this.mockInterval = null;
        this.isActive = false;
        // Data history for smoothing and sensor fusion
        this.gyroscopeHistory = [];
        this.accelerometerHistory = [];
        this.stabilityHistory = [];
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
            enableSensorFusion: (_a = config.enableSensorFusion) !== null && _a !== void 0 ? _a : true,
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
    async start() {
        if (this.isActive)
            return;
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
        }
        catch (error) {
            console.error("Failed to start motion detector:", error);
            console.log("Falling back to mock motion data");
            this.startMockData();
            this.isActive = true;
        }
    }
    async startGyroscopeTracking() {
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
                const gyroData = {
                    x: data.x,
                    y: data.y,
                    z: data.z,
                    timestamp: Date.now(),
                };
                this.handleGyroscopeUpdate(gyroData);
            });
            return true;
        }
        catch (error) {
            console.error("Failed to start gyroscope tracking:", error);
            return false;
        }
    }
    async startAccelerometerTracking() {
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
                const accelData = {
                    x: data.x,
                    y: data.y,
                    z: data.z,
                    timestamp: Date.now(),
                };
                this.handleAccelerometerUpdate(accelData);
            });
            return true;
        }
        catch (error) {
            console.error("Failed to start accelerometer tracking:", error);
            return false;
        }
    }
    startMockData() {
        console.log("Starting mock motion data...");
        this.mockInterval = setInterval(() => {
            const mockGyroData = {
                x: (Math.random() - 0.5) * 0.1, // Small random motion
                y: (Math.random() - 0.5) * 0.1,
                z: (Math.random() - 0.5) * 0.1,
                timestamp: Date.now(),
            };
            this.handleGyroscopeUpdate(mockGyroData, "mock");
        }, this.config.updateInterval);
    }
    handleGyroscopeUpdate(gyroData, source = "gyroscope") {
        // Add to gyroscope history
        this.gyroscopeHistory.push(gyroData);
        if (this.gyroscopeHistory.length > this.config.historySize) {
            this.gyroscopeHistory.shift();
        }
        // Calculate rotation magnitude
        const rotationMagnitude = Math.sqrt(gyroData.x * gyroData.x +
            gyroData.y * gyroData.y +
            gyroData.z * gyroData.z);
        // Get acceleration magnitude from accelerometer if available
        let accelerationMagnitude = 0;
        let finalSource = source;
        if (this.config.enableSensorFusion &&
            this.accelerometerHistory.length > 0) {
            const latestAccel = this.accelerometerHistory[this.accelerometerHistory.length - 1];
            accelerationMagnitude = Math.sqrt(latestAccel.x * latestAccel.x +
                latestAccel.y * latestAccel.y +
                latestAccel.z * latestAccel.z);
            finalSource = source === "mock" ? "mock" : "hybrid";
        }
        // Calculate stability score
        const stabilityScore = this.calculateStabilityScore(rotationMagnitude, accelerationMagnitude);
        // Apply smoothing
        this.stabilityHistory.push(stabilityScore);
        if (this.stabilityHistory.length > this.config.historySize) {
            this.stabilityHistory.shift();
        }
        const smoothedScore = this.applySmoothingToScore(stabilityScore);
        // Calculate final metrics
        const metrics = this.calculateMotionMetrics(smoothedScore, rotationMagnitude, accelerationMagnitude, finalSource);
        this.lastMetrics = metrics;
        this.onMotionChange(metrics);
    }
    handleAccelerometerUpdate(accelData) {
        // Add to accelerometer history
        this.accelerometerHistory.push(accelData);
        if (this.accelerometerHistory.length > this.config.historySize) {
            this.accelerometerHistory.shift();
        }
    }
    calculateStabilityScore(rotation, acceleration) {
        // Weight rotation and acceleration components
        const rotationScore = Math.max(0, 100 - rotation * 100);
        const accelerationScore = Math.max(0, 100 - acceleration * 50);
        // Combine scores with weights
        const combinedScore = rotationScore * this.config.rotationWeight +
            accelerationScore * this.config.accelerationWeight;
        return Math.max(0, Math.min(100, combinedScore));
    }
    applySmoothingToScore(currentScore) {
        if (this.stabilityHistory.length === 0)
            return currentScore;
        const previousSmoothed = this.lastMetrics.score;
        return (this.config.smoothingFactor * previousSmoothed +
            (1 - this.config.smoothingFactor) * currentScore);
    }
    calculateMotionMetrics(score, rotationMagnitude, accelerationMagnitude, source) {
        // Determine stability level
        let stability;
        let isStable;
        let recommendation;
        if (score >= this.config.excellentThreshold) {
            stability = "excellent";
            isStable = true;
            recommendation = "Perfect stability! 🎯";
        }
        else if (score >= this.config.goodThreshold) {
            stability = "good";
            isStable = true;
            recommendation = "Good stability ✅";
        }
        else if (score >= this.config.fairThreshold) {
            stability = "fair";
            isStable = true;
            recommendation = "Fair stability ⚠️";
        }
        else if (score >= this.config.poorThreshold) {
            stability = "poor";
            isStable = false;
            recommendation = "Poor stability - steady your device ⚡";
        }
        else {
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
    stop() {
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
    getLastMetrics() {
        return this.lastMetrics;
    }
    isRunning() {
        return this.isActive;
    }
}
// Translation-aware motion message functions
export function getMotionStabilityMessage(stability, translations) {
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
//# sourceMappingURL=motionDetectorV2.js.map