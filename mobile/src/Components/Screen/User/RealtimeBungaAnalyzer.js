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
  Dimensions,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BACKEND_URL } from 'react-native-dotenv';
import BoundingBoxOverlay from './BoundingBoxOverlay';

export default function RealtimeBungaAnalyzer({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [bungaDetections, setBungaDetections] = useState([]);
  const [otherObjects, setOtherObjects] = useState([]);
  const [imageSize, setImageSize] = useState(null);
  const cameraRef = useRef(null);
  const analyzeIntervalRef = useRef(null);
  const isActiveRef = useRef(false);
  const { width: screenWidth } = Dimensions.get('window');
  const isFirstLoadRef = useRef(true);

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

  const ripenessColors = {
    'Ripe': colors.success,
    'Unripe': colors.warning,
    'Rotten': colors.danger,
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
      isActiveRef.current = false;
      if (analyzeIntervalRef.current) {
        clearTimeout(analyzeIntervalRef.current);
      }
    };
  }, []);

  // Keep latest results during live analysis (don't auto-clear)
  // Only clear when user stops analysis
  const handleStopAnalysis = () => {
    isActiveRef.current = false;
    setIsActive(false);
    if (analyzeIntervalRef.current) {
      clearTimeout(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
    }
    // Clear results after stopping
    setResult(null);
    setBungaDetections([]);
    setOtherObjects([]);
    setImageSize(null);
  };

  const captureAndAnalyze = async () => {
    if (!cameraRef.current) return;

    try {
      setAnalyzing(true);

      const token = axios.defaults.headers.common['Authorization'];
      if (!token) {
        console.error('❌ No token');
        setError('Auth failed');
        setAnalyzing(false);
        return;
      }
      
      // Capture at very low quality for maximum speed
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.2, // Ultra-low = fastest
      });

      if (!photo || !photo.uri) {
        console.error('❌ Capture failed');
        setAnalyzing(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `bunga_${Date.now()}.jpg`,
      });

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/predict/bunga-with-objects`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token,
          },
          // First load: 90s (model initialization + COCO download)
          // Subsequent: 80s (COCO model needs time to load into memory)
          timeout: isFirstLoadRef.current ? 90000 : 80000,
        }
      );

      if (response.data && response.data.ripeness) {
        // NEW: Progressive display - show results as they arrive
        // Mark first load complete - all subsequent loads will use faster timeout
        if (isFirstLoadRef.current) isFirstLoadRef.current = false;
        
        // Process ripeness confidence
        let ripenessConf = response.data.ripeness_confidence;
        if (ripenessConf > 100) {
          while (ripenessConf > 100) ripenessConf = ripenessConf / 10;
        }
        if (ripenessConf < 1) {
          ripenessConf = ripenessConf * 100;
        }
        ripenessConf = Math.round(ripenessConf * 100) / 100;

        // Show bounding boxes immediately
        const newDetections = response.data.bunga_detections || [];
        if (newDetections.length > 0) {
          setBungaDetections(newDetections);
        }
        
        // Update image size for overlay scaling
        setImageSize(response.data.image_size || null);
        
        // Update result progressively
        setResult(prevResult => ({
          ...(prevResult || {}),
          class: response.data.class,
          ripeness: response.data.ripeness,
          ripeness_percentage: response.data.ripeness_percentage, // NEW
          ripeness_confidence: ripenessConf,
          // Health available? show it : keep loading state
          health_class: response.data.health_class || prevResult?.health_class || null,
          health_percentage: response.data.health_percentage !== undefined ? response.data.health_percentage : prevResult?.health_percentage || 0,
          health_range: response.data.health_range || prevResult?.health_range || null,
          bunga_detections: response.data.bunga_detections,
        }));
        
        // Update objects as they arrive
        setOtherObjects(response.data.other_objects || []);
        
        setError(null);
        
        console.log(`✅ ${response.data.class || response.data.ripeness} - Health Class ${response.data.health_class || 'Analyzing...'} (${response.data.health_percentage || 0}%)`);
        console.log('📦 Other objects:', response.data.other_objects?.length || 0, response.data.other_objects || []);
      } else {
        // No ripeness detection this frame
        console.log('⚠️ No bunga');
        setAnalyzing(false);
        return;
      }
    } catch (err) {
      // Silent skip on no pepper detected
      if (err.response?.status === 400 && err.response?.data?.error?.includes('No pepper')) {
        console.log('⚠️ No pepper frame');
        setAnalyzing(false);
        return;
      }

      // Auth error
      if (err.response?.status === 401) {
        setError('Auth failed');
      }
      // Timeout - skip silently
      else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        console.warn('⚠️ Timeout');
        setAnalyzing(false);
        return;
      }
      // Network error
      else if (err.message.includes('Network')) {
        setError('Network error');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const startRealTimeAnalysis = async () => {
    // Check token before starting
    const token = axios.defaults.headers.common['Authorization'];
    if (!token) {
      Alert.alert('Authentication Required', 'Please login first before using real-time analysis');
      return;
    }

    isActiveRef.current = true;
    setIsActive(true);
    setAnalyzing(false);
    setError(null);
    
    console.log('🎥 Starting real-time analysis with token:', token.substring(0, 20) + '...');
    
    // Non-blocking loop - skip frames if previous analysis is still running
    const analyzeLoop = async () => {
      if (!isActiveRef.current) return; // Stop if user stopped analysis
      
      // Don't capture new frame if still analyzing previous one
      if (!analyzing) {
        await captureAndAnalyze();
      }
      
      // Schedule next analysis (1 second interval for fast continuous tracking)
      if (isActiveRef.current) {
        analyzeIntervalRef.current = setTimeout(analyzeLoop, 1000);
      }
    };
    
    analyzeLoop();
  };

  const stopRealTimeAnalysis = () => {
    isActiveRef.current = false;
    setIsActive(false);
    if (analyzeIntervalRef.current) {
      clearTimeout(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
    }
    // Clear results after stopping
    setResult(null);
    setBungaDetections([]);
    setOtherObjects([]);
    setImageSize(null);
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
          <Text style={styles.permissionHeaderTitle}>Real-time Bunga Analyzer</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.permissionContent}>
          <MaterialCommunityIcons name="camera" size={80} color={colors.primary} />
          
          <Text style={[styles.permissionTitle, { color: colors.primary }]}>
            Camera Permission Required
          </Text>
          
          <Text style={[styles.permissionDescription, { color: colors.textLight }]}>
            We need access to your camera to analyze black pepper bunches in real-time. This helps detect ripeness instantly and accurately.
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
              <Text style={[styles.featureText, { color: colors.text }]}>Instant ripeness detection</Text>
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
          <Text style={styles.permissionHeaderTitle}>Real-time Bunga Analyzer</Text>
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
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />
        {/* Bounding Box Overlay */}
        {bungaDetections.length > 0 && imageSize && (
          <BoundingBoxOverlay
            imageSize={imageSize}
            bungaDetections={bungaDetections}
            containerSize={{ width: screenWidth, height: screenWidth * 1.33 }}
            colors={colors}
          />
        )}
      </View>

      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: `${colors.primary}F2` }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎥 Real-time Bunga Analysis</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Live Result Overlay */}
      {result && result.ripeness && (
        <View style={[styles.resultOverlay, { borderLeftColor: ripenessColors[result.ripeness] || colors.primary }]}>
          <Text style={styles.ripenessLabel}>
            {result.class || result.ripeness} {result.ripeness_percentage ? `(${result.ripeness_percentage}%)` : ''}
          </Text>
          <Text style={[styles.confidenceText, { color: ripenessColors[result.ripeness] || colors.primary }]}>
            Health {result.health_class}: {Math.round(result.ripeness_confidence)}% • {result.health_percentage}%
          </Text>
        </View>
      )}
      
      {isActive && !result && (
        <View style={[styles.resultOverlay, { borderLeftColor: colors.warning }]}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={[styles.ripenessLabel, { marginTop: 8 }]}>Analyzing...</Text>
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

      {/* Bottom Controls - Scrollable Results */}
      <ScrollView style={[styles.controlsContainer, { backgroundColor: `${colors.primary}F2` }]} showsVerticalScrollIndicator={false}>
        {/* Status Indicator */}
        <View style={styles.statusSection}>
          {isActive ? (
            <View style={[styles.statusBadge, { backgroundColor: colors.danger + '40' }]}>
              <Text style={styles.statusDot}>🔴</Text>
              <Text style={[styles.statusText, { color: colors.danger }]}>LIVE - Analyzing continuously</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: colors.primaryLight + '40' }]}>
              <Text style={styles.statusDot}>📷</Text>
              <Text style={[styles.statusText, { color: colors.primaryLight }]}>Ready for analysis</Text>
            </View>
          )}
        </View>

        {/* Results Display */}
        {result && (
          <View style={styles.resultsSection}>
            {/* Ripeness - Always shown when detected */}
            {result.ripeness && (
              <View style={[styles.resultCard, { backgroundColor: colors.primaryLight + '20', borderLeftColor: colors.primaryLight }]}>
                <View style={styles.resultCardHeader}>
                  <Text style={[styles.resultCardTitle, { color: colors.primaryLight }]}> ◉ RIPENESS</Text>
                </View>
                <Text style={[styles.resultCardValue, { color: colors.primaryLight }]}>
                  {result.class || result.ripeness} {result.ripeness_percentage ? `(${result.ripeness_percentage}%)` : ''}
                </Text>
                <Text style={[styles.resultCardSubText, { color: colors.textLight }]}>
                  Confidence: {Math.round(result.ripeness_confidence)}%
                </Text>
              </View>
            )}

            {/* Health Status - Show loading if not yet detected */}
            <View style={[styles.resultCard, { backgroundColor: '#2196F3' + '20', borderLeftColor: '#2196F3' }]}>
              <View style={styles.resultCardHeader}>
                <Text style={[styles.resultCardTitle, { color: '#2196F3' }]}>💚 HEALTH CLASS</Text>
                {!result.health_class && isActive && (
                  <ActivityIndicator size="small" color="#2196F3" style={{ marginLeft: 8 }} />
                )}
              </View>
              {result.health_class ? (
                <>
                  <Text style={[styles.resultCardValue, { color: '#2196F3' }]}>
                    Class {result.health_class}
                  </Text>
                  <Text style={[styles.resultCardSubText, { color: colors.textLight }]}>
                    Health: {result.health_percentage}% ({result.health_range})
                  </Text>
                </>
              ) : (
                <Text style={[styles.resultCardSubText, { color: colors.textLight, fontStyle: 'italic' }]}>
                  Analyzing health status...
                </Text>
              )}
            </View>

            {/* Other Objects - Show loading if not yet detected */}
            <View style={[styles.resultCard, { backgroundColor: '#FF9800' + '20', borderLeftColor: '#FF9800' }]}>
              <View style={styles.resultCardHeader}>
                <Text style={[styles.resultCardTitle, { color: '#FF9800' }]}>👁️ OBJECTS</Text>
                {otherObjects.length === 0 && isActive && (
                  <ActivityIndicator size="small" color="#FF9800" style={{ marginLeft: 8 }} />
                )}
              </View>
              {otherObjects && otherObjects.length > 0 ? (
                <View style={styles.objectsList}>
                  {otherObjects.map((obj, idx) => (
                    <Text key={idx} style={[styles.objectItem, { color: '#FF9800' }]}>
                      • {obj.class || 'Unknown'}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={[styles.resultCardSubText, { color: colors.textLight, fontStyle: 'italic' }]}>
                  {isActive ? 'Detecting objects...' : 'No other objects'}
                </Text>
              )}
            </View>
          </View>
        )}
        
        {/* Control Buttons */}
        <View style={styles.buttonContainer}>
          {isActive ? (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.danger }]}
              onPress={stopRealTimeAnalysis}
            >
              <Feather name="square" size={20} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Stop Analysis</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
              onPress={startRealTimeAnalysis}
            >
              <Feather name="play-circle" size={20} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Start Analysis</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraContainer: {
    position: 'relative',
    flex: 1,
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
  ripenessLabel: {
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    maxHeight: 280,
  },
  statusSection: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 8,
  },
  statusDot: {
    fontSize: 16,
  },
  resultsSection: {
    gap: 8,
    paddingVertical: 8,
  },
  resultCard: {
    borderLeftWidth: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF10',
  },
  resultCardHeader: {
    marginBottom: 6,
  },
  resultCardTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  resultCardValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultCardSubText: {
    fontSize: 11,
    fontWeight: '500',
  },
  objectsList: {
    gap: 4,
  },
  objectItem: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  objectBox: {
    borderLeftWidth: 4,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  objectsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  ripenessValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  healthRange: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  objectItemBox: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF25',
    borderRadius: 6,
    marginBottom: 8,
  },
  objectName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
  },
  objectStats: {
    fontSize: 11,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  controlButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
