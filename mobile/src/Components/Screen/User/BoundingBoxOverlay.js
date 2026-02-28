import React from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
} from 'react-native';
import Svg, { Rect, Text } from 'react-native-svg';

export default function BoundingBoxOverlay({
  imageSize,
  bungaDetections,
  containerSize,
  colors
}) {
  if (!imageSize || !bungaDetections || bungaDetections.length === 0) {
    return null;
  }

  // Calculate scale factors
  const scaleX = containerSize.width / imageSize[0];
  const scaleY = containerSize.height / imageSize[1];

  const ripenessColors = {
    'Ripe': '#27AE60',
    'Unripe': '#F39C12',
    'Rotten': '#8B0000',
    'RIPE': '#27AE60',
    'UNRIPE': '#F39C12',
    'ROTTEN': '#8B0000',
  };

  return (
    <View style={styles.overlayContainer}>
      <Svg
        width={containerSize.width}
        height={containerSize.height}
        style={styles.svg}
      >
        {bungaDetections.map((detection, idx) => {
          if (!detection.bbox || detection.bbox.length < 4) {
            return null;
          }
          
          const [x1, y1, x2, y2] = detection.bbox;
          const scaledX1 = x1 * scaleX;
          const scaledY1 = y1 * scaleY;
          const scaledX2 = x2 * scaleX;
          const scaledY2 = y2 * scaleY;
          const width = scaledX2 - scaledX1;
          const height = scaledY2 - scaledY1;

          // Use ripeness for color (extract from ripeness field)
          const ripeness = detection.ripeness || 'Unknown';
          const boxColor = ripenessColors[ripeness] || '#1B4D3E';
          
          // Format label based on class structure
          let labelText = '';
          if (detection.class && detection.class.includes('Class')) {
            // Parse "Class A-a" format
            const classMatch = detection.class.match(/Class\s*([A-D])-([a-d])/);
            if (classMatch) {
              const ripenessLetter = classMatch[1]; // A, B, C, or D
              const healthLetter = classMatch[2];    // a, b, c, or d
              labelText = `${ripeness} (${ripenessLetter}-${healthLetter})`;
            } else {
              labelText = ripeness;
            }
          } else {
            labelText = ripeness;
          }
          const labelWidth = labelText.length * 6.5 + 12;

          return (
            <React.Fragment key={idx}>
              {/* Bounding box rectangle */}
              <Rect
                x={scaledX1}
                y={scaledY1}
                width={width}
                height={height}
                stroke={boxColor}
                strokeWidth="2"
                fill="none"
              />
              {/* Label background */}
              <Rect
                x={scaledX1}
                y={Math.max(0, scaledY1 - 26)}
                width={labelWidth}
                height="24"
                fill={boxColor}
              />
              {/* Label text */}
              <Text
                x={scaledX1 + 6}
                y={Math.max(16, scaledY1 - 8)}
                fontSize="11"
                fontWeight="bold"
                fill="#FFFFFF"
              >
                {labelText}
              </Text>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
});
