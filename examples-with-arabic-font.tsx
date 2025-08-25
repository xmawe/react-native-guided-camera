import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  GuidedCameraView,
  loadArabicFonts,
  getFontStyle,
  areFontsLoaded,
} from "react-native-guided-camera";

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [language, setLanguage] = useState<"english" | "arabic" | "french">(
    "arabic"
  );

  useEffect(() => {
    const initializeFonts = async () => {
      if (language === "arabic" && !areFontsLoaded()) {
        console.log("Loading Arabic fonts...");
        await loadArabicFonts();
        setFontsLoaded(true);
        console.log("Arabic fonts loaded successfully");
      } else {
        setFontsLoaded(true);
      }
    };

    initializeFonts();
  }, [language]);

  // Example of using the font style helper
  const getTextStyle = (weight: "normal" | "bold" = "normal") => {
    return getFontStyle(language, weight);
  };

  return (
    <View style={styles.container}>
      {/* Example text with Arabic font */}
      <Text style={[styles.title, getTextStyle("bold")]}>
        {language === "arabic" ? "الكاميرا الموجهة" : "Guided Camera"}
      </Text>

      <Text style={[styles.description, getTextStyle("normal")]}>
        {language === "arabic"
          ? "هذا مثال على استخدام خط IBM Plex Sans Arabic"
          : "This is an example of using IBM Plex Sans Arabic font"}
      </Text>

      {fontsLoaded && (
        <GuidedCameraView
          language={language}
          onCameraClose={() => console.log("Camera closed")}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default App;
