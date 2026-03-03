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
  Modal,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BACKEND_URL } from 'react-native-dotenv';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFocusEffect } from '@react-navigation/native';
import ObjectDetectionOverlay from './ObjectDetectionOverlay';
import { getUser } from '../../utils/helpers';

export default function RealtimeLeafAnalyzer({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [diseaseInfo, setDiseaseInfo] = useState(null);
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

  // Disease recommendations
  const diseaseRecommendations = {
    'Healthy': {
      icon: '✅',
      title: 'Plant is Healthy',
      description: 'Your pepper plant shows no signs of disease.',
      actions: ['Continue regular watering', 'Monitor weekly', 'Maintain proper spacing'],
      color: colors.success
    },
    'Footrot': {
      icon: '⚠️',
      title: 'Footrot Disease Detected',
      description: 'This is a fungal disease affecting the base of the plant.',
      actions: ['Remove infected plant parts', 'Improve soil drainage', 'Apply fungicide treatment', 'Avoid waterlogging'],
      color: colors.danger
    },
    'Pollu_Disease': {
      icon: '🚨',
      title: 'Pollu Disease Detected',
      description: 'Viral infection causing leaf curling and discoloration.',
      actions: ['Isolate affected plant', 'Remove diseased leaves', 'Control aphid vectors', 'Use insecticide if needed'],
      color: colors.warning
    },
    'Slow_Decline': {
      icon: '📉',
      title: 'Slow Decline Detected',
      description: 'Progressive weakening of plant vigor.',
      actions: ['Check soil moisture', 'Test soil pH and nutrients', 'Improve fertilization', 'Ensure proper drainage'],
      color: colors.warning
    },
    'Leaf_Blight': {
      icon: '🍂',
      title: 'Leaf Blight Detected',
      description: 'Fungal infection causing leaf spots and browning.',
      actions: ['Remove affected leaves', 'Improve air circulation', 'Reduce leaf wetness', 'Apply copper fungicide'],
      color: colors.danger
    },
    'Yellow_Mottle_Virus': {
      icon: '💛',
      title: 'Yellow Mottle Virus Detected',
      description: 'Viral infection causing yellow patterns on leaves.',
      actions: ['Remove infected plant if severe', 'Control insect vectors', 'Sanitize tools', 'Avoid spreading to other plants'],
      color: colors.danger
    }
  };

  const getDiseaseInfo = (diseaseName) => {
    let normalizedName = diseaseName;
    const diseaseMapping = {
      'healthy': 'Healthy',
      'footrot': 'Footrot',
      'pollu': 'Pollu_Disease',
      'pollu_disease': 'Pollu_Disease',
      'slow-decline': 'Slow_Decline',
      'slow_decline': 'Slow_Decline',
      'slowdecline': 'Slow_Decline',
      'leaf-blight': 'Leaf_Blight',
      'leaf_blight': 'Leaf_Blight',
      'leafblight': 'Leaf_Blight',
      'yellow-mottle': 'Yellow_Mottle_Virus',
      'yellow_mottle': 'Yellow_Mottle_Virus',
      'yellow_mottle_virus': 'Yellow_Mottle_Virus',
      'ymv': 'Yellow_Mottle_Virus'
    };
    const lowerName = diseaseName?.toLowerCase?.() || '';
    if (diseaseMapping[lowerName]) {
      normalizedName = diseaseMapping[lowerName];
    }
    return diseaseRecommendations[normalizedName] || {
      icon: '🔬',
      title: `${diseaseName || 'Unknown'} Disease`,
      description: 'Unable to identify the disease.',
      actions: ['Consult agricultural expert', 'Get professional diagnosis'],
      color: colors.textLight
    };
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
        const info = getDiseaseInfo(response.data.disease);
        setDiseaseInfo(info);
        setShowResultModal(true);
        setIsActive(false);
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
    
    // Capture ONE frame only
    await captureAndAnalyze();
  };

  const stopRealTimeAnalysis = () => {
    setIsActive(false);
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
    }
  };

  const handleSaveResult = () => {
    setShowResultModal(false);
    setResult(null);
    setDiseaseInfo(null);
  };

  const handleCancelResult = () => {
    setShowResultModal(false);
    setResult(null);
    setDiseaseInfo(null);
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

      {/* Camera Frame Guide */}
      <View style={styles.frameGuide}>
        <View style={styles.cornerTopLeft} />
        <View style={styles.cornerTopRight} />
        <View style={styles.cornerBottomLeft} />
        <View style={styles.cornerBottomRight} />
        <Text style={styles.frameGuideText}>Position leaf here</Text>
      </View>

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
            <Text style={styles.statusText}>� Please wait - Analyzing...</Text>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.danger }]}
              onPress={stopRealTimeAnalysis}
              disabled
            >
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Analyzing</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.instructionText}>Place camera on the leaf before clicking start</Text>
            <Text style={styles.statusText}>📷 Ready for analysis</Text>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
              onPress={startRealTimeAnalysis}
            >
              <Feather name="play-circle" size={24} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Start Capture</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Result Confirmation Modal */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowResultModal(false);
          setResult(null);
          setDiseaseInfo(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {/* Result Header */}
              <View style={[styles.resultModalHeader, { 
                backgroundColor: `${diseaseInfo?.color || colors.primary}15`,
              }]}>
                <Text style={styles.resultModalIcon}>{diseaseInfo?.icon || '🔬'}</Text>
                <Text style={[styles.resultModalTitle, { color: diseaseInfo?.color || colors.primary }]}>
                  {diseaseInfo?.title || 'Analysis Result'}
                </Text>
                <Text style={[styles.resultModalConfidence, { color: diseaseInfo?.color || colors.primary }]}>
                  {result?.confidence}% Confidence
                </Text>
              </View>

              {/* Description */}
              <Text style={[styles.resultModalDescription, { color: colors.textLight }]}>
                {diseaseInfo?.description}
              </Text>

              {/* Recommendations */}
              {diseaseInfo?.actions && (
                <View style={styles.resultModalRecommendations}>
                  <Text style={styles.resultModalRecommendationsTitle}>📋 Recommended Actions</Text>
                  {diseaseInfo.actions.map((action, idx) => (
                    <View key={idx} style={styles.resultModalActionItem}>
                      <Text style={[styles.resultModalActionCheck, { color: diseaseInfo.color }]}>✓</Text>
                      <Text style={[styles.resultModalActionText, { color: colors.text }]}>
                        {action}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Modal Buttons */}
            <View style={styles.resultModalButtons}>
              <TouchableOpacity
                style={[styles.resultModalButton, { 
                  backgroundColor: `${colors.danger}20`,
                  borderColor: colors.danger,
                  borderWidth: 2
                }]}
                onPress={handleCancelResult}
              >
                <Feather name="x" size={20} color={colors.danger} />
                <Text style={[styles.resultModalButtonText, { color: colors.danger }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resultModalButton, { 
                  backgroundColor: colors.primaryLight
                }]}
                onPress={handleSaveResult}
              >
                <Feather name="check" size={20} color="#FFFFFF" />
                <Text style={[styles.resultModalButtonText, { color: '#FFFFFF' }]}>Save Result</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 16,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  permissionTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 24,
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  permissionDescription: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  featuresList: {
    width: '100%',
    gap: 14,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
  },
  platformNote: {
    fontSize: 13,
    marginTop: 28,
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  permissionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 12,
  },
  permissionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  permissionButtonText: {
    fontSize: 17,
    fontWeight: '800',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  centerText: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#5A7A73',
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  frameGuide: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -120 }, { translateY: -120 }],
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopColor: '#27AE60',
    borderLeftColor: '#27AE60',
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#27AE60',
    borderRightColor: '#27AE60',
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomColor: '#27AE60',
    borderLeftColor: '#27AE60',
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomColor: '#27AE60',
    borderRightColor: '#27AE60',
    borderBottomRightRadius: 8,
  },
  frameGuideText: {
    color: 'rgba(39, 174, 96, 0.7)',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    position: 'absolute',
    bottom: -40,
    letterSpacing: 0.5,
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
    paddingVertical: 14,
    zIndex: 10,
    backgroundColor: '#1B4D3EF0',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  resultOverlay: {
    position: 'absolute',
    top: 90,
    left: '50%',
    transform: [{ translateX: -150 }],
    backgroundColor: '#000000F0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderLeftWidth: 6,
    zIndex: 5,
    width: 300,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  diseaseLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    top: 90,
    left: 12,
    right: 12,
    flexDirection: 'row',
    backgroundColor: '#E74C3CF2',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
    zIndex: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#FFFFFF',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 140,
    left: '50%',
    transform: [{ translateX: -75 }],
    alignItems: 'center',
    gap: 14,
    zIndex: 5,
    backgroundColor: '#000000CC',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  analyzeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
    opacity: 0.8,
    marginBottom: 8,
  },
  controlButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  resultModalHeader: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  resultModalIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  resultModalTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultModalConfidence: {
    fontSize: 16,
    fontWeight: '800',
  },
  resultModalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  resultModalRecommendations: {
    backgroundColor: '#F0F9F6',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  resultModalRecommendationsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 14,
  },
  resultModalActionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  resultModalActionCheck: {
    fontWeight: '800',
    marginRight: 12,
    fontSize: 16,
    marginTop: 2,
  },
  resultModalActionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  resultModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resultModalButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  resultModalButtonText: {
    fontWeight: '800',
    fontSize: 16,
  },
});
