// Fallback implementation that gracefully handles when Google Fonts are not available
export const useArabicFonts = () => {
    try {
        // Try to use expo-google-fonts if available
        const { useFonts, IBMPlexSansArabic_400Regular, IBMPlexSansArabic_700Bold, } = require("@expo-google-fonts/ibm-plex-sans-arabic");
        const [fontsLoaded] = useFonts({
            IBMPlexSansArabic_400Regular,
            IBMPlexSansArabic_700Bold,
        });
        return fontsLoaded;
    }
    catch (error) {
        // If package is not installed, return true to continue without custom fonts
        console.log("Arabic fonts package not found, using system fonts");
        return true;
    }
};
export const getArabicTextStyle = (language, weight = "regular") => {
    if (language !== "arabic") {
        return {};
    }
    let fontFamily;
    try {
        // Try to use custom fonts if available
        const fontFamilyMap = {
            regular: "IBMPlexSansArabic_400Regular",
            medium: "IBMPlexSansArabic_500Medium",
            semibold: "IBMPlexSansArabic_600SemiBold",
            bold: "IBMPlexSansArabic_700Bold",
        };
        fontFamily = fontFamilyMap[weight];
    }
    catch (error) {
        // Fallback to system fonts
        fontFamily = undefined;
    }
    return {
        ...(fontFamily && { fontFamily }),
        textAlign: "right",
        writingDirection: "rtl",
    };
};
//# sourceMappingURL=fonts.js.map