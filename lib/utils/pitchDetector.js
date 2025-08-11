import { Accelerometer } from "expo-sensors";
export class PitchDetector {
    constructor(onAngleChange, config = {}) {
        this.subscription = null;
        this.onAngleChange = onAngleChange;
        this.config = {
            rollTolerance: config.rollTolerance || 15,
            pitchTolerance: config.pitchTolerance || 15,
            pitchVertical: config.pitchVertical || 90,
            updateInterval: config.updateInterval || 100,
        };
    }
    start() {
        if (this.subscription) {
            this.stop();
        }
        Accelerometer.setUpdateInterval(this.config.updateInterval);
        this.subscription = Accelerometer.addListener((accelerometerData) => {
            const metrics = this.calculateAngleMetrics(accelerometerData);
            this.onAngleChange(metrics);
        });
    }
    stop() {
        if (this.subscription) {
            this.subscription.remove();
            this.subscription = null;
        }
    }
    calculateAngleMetrics(accelerometerData) {
        const { x, y, z } = accelerometerData;
        // Roll: left/right tilt (rotation around y axis)
        const roll = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);
        // Pitch: front/back tilt (rotation around x axis)
        const pitch = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);
        // isLevel: roll near 0, pitch near +90 (upright)
        const isLevel = Math.abs(roll) < this.config.rollTolerance &&
            Math.abs(Math.abs(pitch) - this.config.pitchVertical) <
                this.config.pitchTolerance;
        // Determine direction and severity
        let direction = "level";
        let severity = "good";
        if (!isLevel) {
            // If pitch is not vertical enough, suggest forward/backward
            if (Math.abs(Math.abs(pitch) - this.config.pitchVertical) >
                this.config.pitchTolerance) {
                direction = pitch > 0 ? "tilt_backward" : "tilt_forward";
                // Severity based on how far from vertical
                const pitchDelta = Math.abs(Math.abs(pitch) - this.config.pitchVertical);
                if (pitchDelta > 45) {
                    severity = "major";
                }
                else if (pitchDelta > 25) {
                    severity = "minor";
                }
            }
            else {
                // Otherwise, it's a roll (side tilt) issue
                direction = roll > 0 ? "tilt_right" : "tilt_left";
                if (Math.abs(roll) > 45) {
                    severity = "major";
                }
                else if (Math.abs(roll) > 25) {
                    severity = "minor";
                }
            }
        }
        return {
            roll,
            pitch,
            isLevel,
            direction,
            severity,
        };
    }
}
// Utility functions for angle calculations
export const calculateAngleColor = (severity) => {
    switch (severity) {
        case "good":
            return "#4CAF50";
        case "minor":
            return "#FF9800";
        case "major":
            return "#F44336";
        default:
            return "#9E9E9E";
    }
};
export const getAngleMessage = (metrics) => {
    if (metrics.isLevel) {
        return "✓ Great! Keep it steady";
    }
    let directionMsg = "";
    switch (metrics.direction) {
        case "tilt_left":
            directionMsg = "Tilt Right";
            break;
        case "tilt_right":
            directionMsg = "Tilt Left";
            break;
        case "tilt_forward":
            directionMsg = "Tilt Back";
            break;
        case "tilt_backward":
            directionMsg = "Tilt Forward";
            break;
        default:
            directionMsg = "Adjust";
    }
    const severity = metrics.severity === "major" ? " (Adjust)" : "";
    return `${directionMsg}${severity}`;
};
// Translation-aware version
export const getAngleMessageTranslated = (metrics, translations) => {
    if (metrics.isLevel) {
        return translations.greatKeepSteady;
    }
    let directionMsg = "";
    switch (metrics.direction) {
        case "tilt_left":
            directionMsg = translations.tiltRight;
            break;
        case "tilt_right":
            directionMsg = translations.tiltLeft;
            break;
        case "tilt_forward":
            directionMsg = translations.tiltBack;
            break;
        case "tilt_backward":
            directionMsg = translations.tiltForward;
            break;
        default:
            directionMsg = translations.adjust;
    }
    const severity = metrics.severity === "major" ? ` (${translations.adjustSeverity})` : "";
    return `${directionMsg}${severity}`;
};
//# sourceMappingURL=pitchDetector.js.map