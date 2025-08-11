import { Accelerometer } from "expo-sensors";
// Fallback speed detector that only uses accelerometer data
export class FallbackSpeedDetector {
    constructor(callback, config = {}) {
        this.isActive = false;
        this.accelerometerSubscription = null;
        this.accelerometerHistory = [];
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
    async start() {
        if (this.isActive)
            return;
        try {
            console.log("Starting fallback speed detector (accelerometer only)");
            // Start accelerometer tracking
            this.startAccelerometerTracking();
            this.isActive = true;
        }
        catch (error) {
            console.error("Failed to start fallback speed detector:", error);
        }
    }
    startAccelerometerTracking() {
        Accelerometer.setUpdateInterval(this.config.updateInterval);
        this.accelerometerSubscription = Accelerometer.addListener((accelerometerData) => {
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
        });
    }
    calculateMotionFromAccelerometer() {
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
            const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
            totalMotion += magnitude;
        }
        const averageMotion = totalMotion / (recent.length - 1);
        // Convert motion intensity to estimated speed (rough approximation)
        let estimatedSpeed = 0;
        let movementType = "stationary";
        if (averageMotion > 0.1) {
            estimatedSpeed = Math.min(averageMotion * 10, 30); // Scale and cap speed
            if (estimatedSpeed < this.config.movingThreshold) {
                movementType = "stationary";
            }
            else if (estimatedSpeed < this.config.walkingThreshold) {
                movementType = "walking";
            }
            else if (estimatedSpeed < this.config.runningThreshold) {
                movementType = "running";
            }
            else if (estimatedSpeed < this.config.drivingThreshold) {
                movementType = "driving";
            }
            else {
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
            recommendation: this.getMovementRecommendation(movementType, estimatedSpeed),
            source: "sensors",
        };
    }
    getMovementRecommendation(movementType, speed) {
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
    stop() {
        if (!this.isActive)
            return;
        if (this.accelerometerSubscription) {
            this.accelerometerSubscription.remove();
            this.accelerometerSubscription = null;
        }
        this.isActive = false;
        console.log("Fallback speed detector stopped");
    }
    isRunning() {
        return this.isActive;
    }
}
// Helper functions for compatibility
export const getSpeedColor = (speed) => {
    if (speed < 1)
        return "#4CAF50"; // Green for stationary
    if (speed < 3)
        return "#FFC107"; // Yellow for walking
    if (speed < 8)
        return "#FF9800"; // Orange for running
    return "#F44336"; // Red for fast movement
};
export const getSpeedMessage = (metrics) => {
    return metrics.recommendation;
};
export const shouldAllowRecordingSpeed = (metrics) => {
    return metrics.speed < 8; // Allow recording for speeds under 8 m/s
};
export const getSpeedIcon = (movementType) => {
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
export function getSpeedRecommendationMessage(speed, isMoving, translations) {
    if (!isMoving) {
        return translations.instructionMessages.speedStationary;
    }
    else if (speed < 1.5) {
        return translations.instructionMessages.speedWalking;
    }
    else if (speed < 4.0) {
        return translations.instructionMessages.speedRunning;
    }
    else if (speed < 8.0) {
        return translations.instructionMessages.speedVehicle;
    }
    else {
        return translations.instructionMessages.speedHighSpeed;
    }
}
export function getSpeedMotionMessage(translations) {
    return translations.instructionMessages.speedMotionDetected;
}
//# sourceMappingURL=fallbackSpeedDetector.js.map