// Test all translation functions
const {
  getTranslations,
  getAngleMessageTranslated,
  getYawMessageTranslated,
  getMotionStabilityMessage,
  getSpeedRecommendationMessage,
  getBrightnessRecommendationMessage,
} = require("./lib/index");

console.log("Testing all translation functions...\n");

// Test all languages
const languages = ["english", "arabic", "french"];

languages.forEach((lang) => {
  console.log(`=== ${lang.toUpperCase()} TRANSLATIONS ===`);
  const translations = getTranslations(lang);

  // Test angle messages
  const angleMetrics = {
    roll: 15,
    pitch: 5,
    isLevel: false,
    direction: "tilt_right",
    severity: "minor",
  };
  console.log(
    "Angle (tilt right):",
    getAngleMessageTranslated(angleMetrics, translations)
  );

  // Test yaw messages
  const yawMetrics = {
    yaw: 30,
    isOnTarget: false,
    deviation: 30,
    direction: "turn_left",
    severity: "major",
  };
  console.log(
    "Yaw (turn left):",
    getYawMessageTranslated(yawMetrics, translations)
  );

  // Test motion stability messages
  console.log(
    "Motion (excellent):",
    getMotionStabilityMessage("excellent", translations)
  );
  console.log(
    "Motion (poor):",
    getMotionStabilityMessage("poor", translations)
  );

  // Test speed messages
  console.log(
    "Speed (stationary):",
    getSpeedRecommendationMessage(0, false, translations)
  );
  console.log(
    "Speed (walking):",
    getSpeedRecommendationMessage(1.2, true, translations)
  );
  console.log(
    "Speed (running):",
    getSpeedRecommendationMessage(3.5, true, translations)
  );

  // Test brightness messages
  console.log(
    "Brightness (excellent):",
    getBrightnessRecommendationMessage("excellent", translations)
  );
  console.log(
    "Brightness (poor):",
    getBrightnessRecommendationMessage("poor", translations)
  );

  console.log("");
});

console.log("Translation test completed!");
