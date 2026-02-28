import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BACKEND_URL } from 'react-native-dotenv';

export default function RealtimeLeafAnalyzer({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const cameraRef = useRef(null);
  const analyzeIntervalRef = useRef(null);

  const colors = {
    primary: '#1B4D3E',
    primaryLight: '#27AE60',
    background: '#F8FAF7',
    text: '#1B4D3E',
    textLight: '#5A7A73',
    danger: '#E74C3C',
    success: '#27AE60',
    warning: '#F39C12',
  };

  const diseaseColors = {
    'Healthy': colors.success,
    'Footrot': colors.danger,
    'Pollu_Disease': colors.warning,
    'Slow_Decline': colors.warning,
    'Leaf_Blight': colors.danger,
    'Yellow_Mottle_Virus': colors.danger,
  };

  // Check permission status on mount
  useEffect(() => {
    if (permission) {
      // Permission object exists, check if granted
      if (permission.granted) {
        setPermissionRequested(true);
      } else if (permission.denied) {
        setPermissionRequested(true);
      } else {
        setPermissionRequested(false);
      }
    }
  }, [permission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (analyzeIntervalRef.current) {
        clearInterval(analyzeIntervalRef.current);
      }
    };
  }, []);

  const captureAndAnalyze = async () => {
    if (!cameraRef.current || analyzing) return;

    try {
      setAnalyzing(true);
      
      // Capture photo from camera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5, // Lower quality for faster processing
      });

      if (!photo) {
        setAnalyzing(false);
        return;
      }

      // Create FormData with image
      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `realtime_${Date.now()}.jpg`,
      });

      const token = axios.defaults.headers.common['Authorization'];

      console.log('📤 Sending image to backend...');

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/predict/disease`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token,
          },
          timeout: 60000, // 60 seconds - YOLOv8 model inference
        }
      );

      if (response.data && response.data.disease) {
        setResult(response.data);
        setError(null);
        console.log('✅ Detected:', response.data.disease, '(' + response.data.confidence + '%)');
      }
    } catch (err) {
      console.error('❌ Real-time analysis error:', err.message);
      setError('Connection failed - check backend');
    } finally {
      setAnalyzing(false); // Allow next capture only after response
    }
  };

  const startRealTimeAnalysis = async () => {
    setIsActive(true);
    setError(null);
    setResult(null);
    
    // Start first capture immediately
    await captureAndAnalyze();
    
    // Then continue capturing after each analysis completes (with 1.5s minimum interval)
    analyzeIntervalRef.current = setInterval(async () => {
      if (!analyzing) { // Only capture if previous analysis is done
        await captureAndAnalyze();
      }
    }, 1500); // Check every 1.5 seconds if ready for next capture
  };

  const stopRealTimeAnalysis = () => {
    setIsActive(false);
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
    }
  };

  // Handle permission request with dialog
  const handlePermissionRequest = async () => {
    try {
      const result = await requestPermission();
      setPermissionRequested(true);
      
      if (!result.granted) {
        const platformMsg = Platform.OS === 'android' 
          ? 'Open Settings > Apps > PiperSmart > Permissions > Camera and enable it'
          : 'Open Settings > PiperSmart > Camera and enable it';
        
        Alert.alert(
          'Camera Permission Denied',
          `Camera access is required for real-time analysis.\n\n${platformMsg}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      setPermissionRequested(true);
      Alert.alert('Error', 'Failed to request camera permission');
    }
  };

  const handleDenyPermission = () => {
    setPermissionRequested(true);
    navigation.goBack();
  };

  if (!permissionRequested) {
    // Permission request screen
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
        
        <View style={[styles.permissionHeader, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.permissionHeaderTitle}>Real-time Analyzer</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.permissionContent}>
          <MaterialCommunityIcons name="camera" size={80} color={colors.primary} />
          
          <Text style={[styles.permissionTitle, { color: colors.primary }]}>
            Camera Permission Required
          </Text>
          
          <Text style={[styles.permissionDescription, { color: colors.textLight }]}>
            We need access to your camera to analyze pepper leaves in real-time. This helps detect diseases quickly and accurately.
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={18} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>Live camera preview</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={18} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>Continuous analysis</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={18} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>Instant disease detection</Text>
            </View>
          </View>

          <Text style={[styles.platformNote, { color: colors.textLight }]}>
            {Platform.OS === 'android' 
              ? '📱 Android: Camera permission required from Settings'
              : '📱 iOS: Camera access required to use this feature'}
          </Text>
        </View>

        <View style={styles.permissionButtons}>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: `${colors.danger}20`, borderColor: colors.danger, borderWidth: 2 }]}
            onPress={handleDenyPermission}
          >
            <Text style={[styles.permissionButtonText, { color: colors.danger }]}>Deny</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={handlePermissionRequest}
          >
            <Text style={[styles.permissionButtonText, { color: '#FFFFFF' }]}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission?.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.permissionHeader, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.permissionHeaderTitle}>Real-time Analyzer</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="camera-off" size={80} color={colors.danger} />
          <Text style={[styles.centerText, { color: colors.danger, marginTop: 24 }]}>
            Camera Access Denied
          </Text>
          <Text style={[styles.subtitle, { marginTop: 12, textAlign: 'center' }]}>
            Enable camera access in your device settings to use real-time analysis
          </Text>
          
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary, marginTop: 32 }]}
            onPress={() => {
              setPermissionRequested(false);
            }}
          >
            <Feather name="repeat" size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Camera Feed */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />

      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: `${colors.primary}F2` }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎥 Real-time Analysis</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Live Result Overlay */}
      {result && (
        <View style={[styles.resultOverlay, { borderColor: diseaseColors[result.disease] || colors.primary }]}>
          <Text style={styles.diseaseLabel}>{result.disease}</Text>
          <Text style={[styles.confidenceText, { color: diseaseColors[result.disease] || colors.primary }]}>
            {result.confidence}% confidence
          </Text>
        </View>
      )}

      {/* Error Overlay */}
      {error && (
        <View style={[styles.errorOverlay, { backgroundColor: `${colors.danger}E6` }]}>
          <Feather name="alert-circle" size={16} color="#FFFFFF" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Loading Indicator */}
      {analyzing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.analyzeText}>Analyzing...</Text>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={[styles.controlsContainer, { backgroundColor: `${colors.primary}F2` }]}>
        {isActive ? (
          <>
            <Text style={styles.statusText}>🔴 LIVE - Analyzing every 2.5s</Text>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.danger }]}
              onPress={stopRealTimeAnalysis}
            >
              <Feather name="square" size={24} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Stop</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.statusText}>📷 Ready for real-time analysis</Text>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
              onPress={startRealTimeAnalysis}
            >
              <Feather name="play-circle" size={24} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Start</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    zIndex: 10,
  },
  permissionHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 28,
  },
  featuresList: {
    width: '100%',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
  },
  platformNote: {
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  permissionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  permissionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  centerText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#5A7A73',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultOverlay: {
    position: 'absolute',
    top: 80,
    right: 12,
    backgroundColor: '#000000CC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    zIndex: 5,
  },
  diseaseLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorOverlay: {
    position: 'absolute',
    top: 80,
    left: 12,
    right: 12,
    flexDirection: 'row',
    backgroundColor: '#E74C3CCC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
    zIndex: 5,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 120,
    left: '50%',
    transform: [{ translateX: -50 }],
    alignItems: 'center',
    gap: 12,
    zIndex: 5,
  },
  analyzeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  controlButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
