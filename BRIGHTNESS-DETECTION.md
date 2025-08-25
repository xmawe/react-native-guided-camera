# Brightness Detection for Video Recording Quality

The brightness detector has been significantly improved to provide realistic feedback for video recording conditions. Here's how it now works:

## Real Lux Values and Video Quality

### Ambient Light Sensor (when available):

- **0-5 lux**: Too dark for video recording (moonlight) → **VERY POOR**
- **5-25 lux**: Very dim, poor video quality (candlelight, dim room) → **POOR**
- **25-100 lux**: Minimum acceptable for video (indoor lighting) → **FAIR**
- **100-300 lux**: Good indoor lighting for video (well-lit room) → **GOOD**
- **300-750 lux**: Excellent lighting for video (bright office) → **EXCELLENT**
- **750+ lux**: Very bright, may cause overexposure → **GOOD**

### Luminance Score Thresholds:

- **Excellent**: 120-180 luminance (optimal for video)
- **Good**: 80-119 or 181-220 luminance
- **Fair**: 50-79 or 221-240 luminance
- **Poor**: 30-49 luminance (video will be dark)
- **Very Poor**: Below 30 or above 240 luminance

## What Changed:

1. **Realistic Lux Mapping**: The conversion from lux to luminance now reflects actual video recording requirements
2. **Lower Thresholds**: It's now much harder to get "excellent" ratings in poor lighting
3. **Conservative Time-Based Estimation**: When ambient light sensor isn't available, assumes typical indoor conditions
4. **Better Debugging**: Console shows detailed lighting assessment for video quality

## Usage in Your App:

The brightness detector will now accurately tell users:

- ✅ **"Excellent lighting conditions!"** → Perfect for recording
- ⚠️ **"Adequate lighting - could be improved"** → Video will be okay but not great
- 💡 **"Poor lighting - add more light"** → Video will be dark, turn on lights
- 🔦 **"Very poor lighting - insufficient for recording"** → Video will be too dark to use

## Testing:

Try the camera in different lighting conditions:

1. **Dark room** → Should show "Very Poor" or "Poor"
2. **Dim room with single lamp** → Should show "Fair"
3. **Well-lit room** → Should show "Good"
4. **Bright office/daylight** → Should show "Excellent"
5. **Very bright sunlight** → Should show "Good" (to avoid overexposure)

The system now properly reflects whether the lighting is actually sufficient for good video recording quality.
