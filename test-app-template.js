import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { GuidedCameraView } from "react-native-guided-camera";

export default function App() {
  const [showCamera, setShowCamera] = useState(false);
  const [language, setLanguage] = useState("english");

  if (showCamera) {
    return (
      <View style={styles.container}>
        <GuidedCameraView
          language={language}
          onScreen={true} // Show debug logs
          terminalLogs={true} // Console logs
          onCameraClose={() => setShowCamera(false)}
          onVideoSave={(videoData) => {
            console.log("Video saved:", videoData);
            alert(`Video saved! Duration: ${videoData.duration}s`);
          }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.menuContainer}>
      <Text style={styles.title}>Guided Camera Test</Text>

      <Text style={styles.subtitle}>Select Language:</Text>

      <TouchableOpacity
        style={[styles.button, language === "english" && styles.activeButton]}
        onPress={() => setLanguage("english")}
      >
        <Text
          style={[
            styles.buttonText,
            language === "english" && styles.activeButtonText,
          ]}
        >
          English
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, language === "arabic" && styles.activeButton]}
        onPress={() => setLanguage("arabic")}
      >
        <Text
          style={[
            styles.buttonText,
            language === "arabic" && styles.activeButtonText,
          ]}
        >
          العربية (Arabic)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, language === "french" && styles.activeButton]}
        onPress={() => setLanguage("french")}
      >
        <Text
          style={[
            styles.buttonText,
            language === "french" && styles.activeButtonText,
          ]}
        >
          Français (French)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.openButton]}
        onPress={() => setShowCamera(true)}
      >
        <Text style={[styles.buttonText, styles.openButtonText]}>
          Open Camera ({language})
        </Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          • Test all three languages{"\n"}• Debug logs are enabled{"\n"}• Camera
          guidance active{"\n"}• Video save callback included
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 20,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  button: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeButton: {
    backgroundColor: "#2196F3",
    borderColor: "#1976D2",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  activeButtonText: {
    color: "white",
  },
  openButton: {
    backgroundColor: "#4CAF50",
    marginTop: 30,
    borderColor: "#388E3C",
  },
  openButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
