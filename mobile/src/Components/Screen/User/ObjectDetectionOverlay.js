import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

/**
 * Display other detected objects (hands, leaves, etc)
 * Not shown as bounding boxes, just as list
 */
export default function ObjectDetectionOverlay({
  otherObjects,
  colors
}) {
  if (!otherObjects || otherObjects.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: '#FF9800' + '20' }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        👁️ Other Objects Detected ({otherObjects.length})
      </Text>
      
      {otherObjects.map((obj, idx) => (
        <View key={idx} style={styles.objectItem}>
          <Text style={[styles.objectLabel, { color: colors.text }]}>
            {obj.class || 'Unknown'}
          </Text>
          <Text style={[styles.objectStats, { color: colors.textLight }]}>
            {obj.confidence ? Math.round(obj.confidence) + '%' : 'N/A'} • Count: {obj.count || 1}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 200,
    left: 12,
    right: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    padding: 12,
    zIndex: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  objectItem: {
    paddingVertical: 6,
    marginBottom: 4,
  },
  objectLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  objectStats: {
    fontSize: 11,
    fontWeight: '500',
  },
});
