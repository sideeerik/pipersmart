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
  const [latestPhoto, setLatestPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const cameraRef = useRef(null);
  const analyzeIntervalRef = useRef(null);

  const colors = {
    primary: '#0E3B2E',
    primaryLight: '#2BB673',
    background: '#F3F7F4',
    text: '#0E3B2E',
    textLight: '#5A6B63',
    danger: '#E2554D',
    success: '#2BB673',
    warning: '#F2A93B',
    accent: '#C9A227',
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
      iconName: 'check-circle',
      title: 'Plant is Healthy',
      description: 'Your pepper plant shows no signs of disease.',
      actions: ['Continue regular watering', 'Monitor weekly', 'Maintain proper spacing'],
      color: colors.success
    },
    'Footrot': {
      iconName: 'alert-circle',
      title: 'Footrot Disease Detected',
      description: 'This is a fungal disease affecting the base of the plant.',
      actions: ['Remove infected plant parts', 'Improve soil drainage', 'Apply fungicide treatment', 'Avoid waterlogging'],
      color: colors.danger
    },
    'Pollu_Disease': {
      iconName: 'alert',
      title: 'Pollu Disease Detected',
      description: 'Viral infection causing leaf curling and discoloration.',
      actions: ['Isolate affected plant', 'Remove diseased leaves', 'Control aphid vectors', 'Use insecticide if needed'],
      color: colors.warning
    },
    'Slow_Decline': {
      iconName: 'chart-line',
      title: 'Slow Decline Detected',
      description: 'Progressive weakening of plant vigor.',
      actions: ['Check soil moisture', 'Test soil pH and nutrients', 'Improve fertilization', 'Ensure proper drainage'],
      color: colors.warning
    },
    'Leaf_Blight': {
      iconName: 'leaf',
      title: 'Leaf Blight Detected',
      description: 'Fungal infection causing leaf spots and browning.',
      actions: ['Remove affected leaves', 'Improve air circulation', 'Reduce leaf wetness', 'Apply copper fungicide'],
      color: colors.danger
    },
    'Yellow_Mottle_Virus': {
      iconName: 'virus',
      title: 'Yellow Mottle Virus Detected',
      description: 'Viral infection causing yellow patterns on leaves.',
      actions: ['Remove infected plant if severe', 'Control insect vectors', 'Sanitize tools', 'Avoid spreading to other plants'],
      color: colors.danger
    }
  };

  const leafAdvisoryGuide = {
    Healthy: {
      status: 'Plant is Vigorous',
      description: 'Leaves are vibrant green with optimal chlorophyll levels and no visible pathogen interference.',
      commonSymptoms: 'Glossy leaf surface; uniform green color; smooth margins with no lesions, curling, or distortion.',
      prevention: 'Maintain balanced NPK levels; apply Neem oil (prophylactic) monthly to repel sap-sucking vectors from the foliage.',
      treatment: 'No chemical treatment required.',
      primaryAdvice: 'Focus on leaf-absorbed biostimulants like seaweed extract to boost immunity for the upcoming flowering season.',
      advancedProTips: [
        'Precision Feeding: Every 6 months, conduct a soil pH test (Target: 5.5-6.5). If pH is off, the leaves cannot absorb the NPK nutrients you provide.',
        'Micro-Nutrient Boost: Apply a foliar spray of Zinc and Magnesium during spike initiation to ensure maximum berry setting and leaf health.',
      ],
    },
    Footrot: {
      status: 'CRITICAL: Immediate Action Required',
      description: 'A lethal fungal infection (Phytophthora) detected by rapid leaf degradation and vascular blockage.',
      commonSymptoms: 'Water-soaked dark lesions on the leaf surface; rapid yellowing; total leaf drop (defoliation) within days.',
      prevention: 'Ensure raised-bed planting for drainage; apply Trichoderma-enriched manure to the soil before the monsoon.',
      treatment: 'Drench the soil and spray the foliage with 1% Bordeaux mixture or Metalaxyl-Mancozeb (0.2%).',
      primaryAdvice: 'Check the vine base for blackening; if the collar is rotten, the vine may need to be removed to save neighbors.',
      advancedProTips: [
        'Containment Trenching: Dig a 30cm deep isolation trench around the infected vine to cut off root-to-root spread of fungi.',
        'The 3-Step Drench: Treat the infected vine AND the immediate 8 healthy neighbor vines; the fungus spreads underground before leaves show wilt.',
      ],
    },
    Pollu_Disease: {
      status: 'WARNING: Crop Quality Risk',
      description: 'A fungal pathogen detected via foliar spots that eventually migrates to fruit spikes, causing "hollow berries."',
      commonSymptoms: 'Circular brown spots with distinct yellow halos on the leaves; necrotic (dead) patches on leaf margins.',
      prevention: 'Prune for better aeration; regulate shade to ensure at least 50% sunlight reaches the leaf canopy.',
      treatment: 'Apply Copper Oxychloride (0.2%) or Carbendazim (0.1%) sprays twice during the monsoon cycle.',
      primaryAdvice: 'Remove all fallen leaves and spikes from the basin, as they act as a reservoir for spores that re-infect the plant.',
      advancedProTips: [
        'Shade Regulation: Use a lux meter to ensure light intensity is between 2,000-3,000 foot-candles. Over-shading breeds this leaf-eating fungus.',
        'Spike Protection: Prioritize spraying the fruit spikes specifically to prevent "hollow berries," which can reduce harvest weight by 40%.',
      ],
    },
    Leaf_Blight: {
      status: 'ATTENTION: Localized Infection',
      description: 'A localized infection spread through leaf-to-leaf contact, usually triggered by rain splashes and high humidity.',
      commonSymptoms: 'Large, papery brown patches that look "burnt"; visible fungal threads (mycelium) often found on the leaf underside.',
      prevention: 'Avoid overhead irrigation; keep the area around the vine free of weeds that trap moisture near lower leaves.',
      treatment: 'Use a foliar spray of Mancozeb (0.2%) or Propiconazole; ensure total coverage of the leaf underside.',
      primaryAdvice: 'Sanitize pruning shears with alcohol after use to prevent spreading the blight from infected leaves to healthy ones.',
      advancedProTips: [
        'Mulch Management: Replace damp mulch with fresh, dry organic matter. Old mulch acts as a springboard for fungal spores to splash onto lower leaves.',
        'Morning Watering: Irrigate before 9:00 AM. This allows the sun to dry the leaves quickly; wet leaves at night are the #1 cause of blight outbreaks.',
      ],
    },
    Yellow_Mottle_Virus: {
      status: 'ALERT: Viral Contamination',
      description: 'A systemic virus spread by insects. The leaves act as the primary visual indicator of the plant\'s internal viral load.',
      commonSymptoms: 'Distinct yellow mosaic patterns on the leaf; leaf curling/puckering; brittle, narrow, and distorted leaf growth.',
      prevention: 'Use only certified disease-free cuttings; strictly control mealybugs on the foliage using Imidacloprid.',
      treatment: 'No chemical cure. Infected vines must be uprooted and burnt to stop the spread.',
      primaryAdvice: 'Do not take any cuttings from this vine; the virus will inhabit any new plants created from this infected foliage.',
      advancedProTips: [
        'Vector Scouting: Inspect leaf undersides and node joints for white, cottony masses (Mealybugs). Killing the bugs stops the virus from moving.',
        'Tool Sterilization: If you prune an infected vine, you must flame-sterilize or soak tools in 10% bleach for 5 minutes before touching a healthy vine.',
      ],
    },
    Slow_Decline: {
      status: 'MANAGEMENT REQUIRED: Long-term Stress',
      description: 'A root-based complex where leaf yellowing and size reduction signal that the root system is failing.',
      commonSymptoms: 'Gradual paling/yellowing of the entire canopy; reduced leaf size over time; "die-back" of terminal twigs.',
      prevention: 'Apply Neem cake (1-2 kg) to the base annually; avoid moving soil from "declined" leaf zones to healthy zones.',
      treatment: 'Drench roots with bio-nematicides (Paecilomyces) or apply Phorate (10g) per vine if the decline is severe.',
      primaryAdvice: 'This is a root issue; if the leaves are showing these symptoms, the roots are already 50% compromised. Act on the soil immediately.',
      advancedProTips: [
        'Root Health Check: Dig up a small feeder root. If you see tiny knots or galls (bead-like), you have a nematode infestation destroying the leaf-feeding system.',
        'Potash Recovery: Increase Potassium (K) application by 20%. Potash helps the leaves "pump" water more effectively, compensating for nematode root damage.',
      ],
    },
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
      iconName: 'leaf',
      title: `${diseaseName || 'Unknown'} Disease`,
      description: 'Unable to identify the disease.',
      actions: ['Consult agricultural expert', 'Get professional diagnosis'],
      color: colors.textLight
    };
  };

  const getLeafAdvisory = (diseaseName) => {
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
    const normalizedName = diseaseMapping[lowerName] || diseaseName;
    return leafAdvisoryGuide[normalizedName] || null;
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
      const photoName = `realtime_${Date.now()}.jpg`;
      const photoPayload = {
        uri: photo.uri,
        type: 'image/jpeg',
        name: photoName,
      };
      setLatestPhoto(photoPayload);

      const formData = new FormData();
      formData.append('image', photoPayload);
      formData.append('save', 'false');

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
    setLatestPhoto(null);
    
    // Capture ONE frame only
    await captureAndAnalyze();
  };

  const stopRealTimeAnalysis = () => {
    setIsActive(false);
    if (analyzeIntervalRef.current) {
      clearInterval(analyzeIntervalRef.current);
      analyzeIntervalRef.current = null;
    }
    setLatestPhoto(null);
  };

  const handleSaveResult = async () => {
    if (!result || !latestPhoto || saving) return;

    try {
      setSaving(true);
      const token = axios.defaults.headers.common['Authorization'];
      if (!token) {
        Alert.alert('Authentication Required', 'Please login first before saving');
        return;
      }

      const formData = new FormData();
      formData.append('image', latestPhoto);
      formData.append('disease', result.disease);
      formData.append('confidence', String(result.confidence || 0));
      formData.append('processingTime', String(result.processingTime || 0));
      if (result.detections) {
        formData.append('detections', JSON.stringify(result.detections));
      }

      await axios.post(
        `${BACKEND_URL}/api/v1/predict/leaf-save`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token,
          },
          timeout: 60000,
        }
      );

      setShowResultModal(false);
      setResult(null);
      setDiseaseInfo(null);
      setLatestPhoto(null);
      console.log('Analysis saved successfully');
    } catch (err) {
      console.error('Save error:', err.message);
      Alert.alert('Save Failed', 'Unable to save this result. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelResult = () => {
    setShowResultModal(false);
    setResult(null);
    setDiseaseInfo(null);
    setLatestPhoto(null);
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
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        
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
              ? 'Android: Camera permission required from Settings'
              : 'iOS: Camera access required to use this feature'}
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
        <Text style={styles.headerTitle}>Real-time Analysis</Text>
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
            <Text style={styles.statusText}>Please wait - Analyzing...</Text>
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
            <Text style={styles.statusText}>Ready for analysis</Text>
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
        onRequestClose={handleCancelResult}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {/* Result Header */}
              <View style={[styles.resultModalHeader, { 
                backgroundColor: `${diseaseInfo?.color || colors.primary}15`,
              }]}>
                <MaterialCommunityIcons
                  name={diseaseInfo?.iconName || 'leaf'}
                  size={46}
                  color={diseaseInfo?.color || colors.primary}
                  style={styles.resultModalIcon}
                />
                <Text style={[styles.resultModalTitle, { color: diseaseInfo?.color || colors.primary }]}>
                  {diseaseInfo?.title || 'Analysis Result'}
                </Text>
                <Text style={[styles.resultModalConfidence, { color: diseaseInfo?.color || colors.primary }]}>
                  {result?.confidence}% Confidence
                </Text>
              </View>

              {/* Description */}
              <Text style={styles.resultModalDescription}>
                {diseaseInfo?.description}
              </Text>

              {/* Recommendations */}
              {diseaseInfo?.actions && (
                <View style={styles.resultModalRecommendations}>
                  <Text style={styles.resultModalRecommendationsTitle}>Recommended Actions</Text>
                  {diseaseInfo.actions.map((action, idx) => (
                    <View key={idx} style={styles.resultModalActionItem}>
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color={diseaseInfo.color}
                        style={styles.resultModalActionCheck}
                      />
                      <Text style={styles.resultModalActionText}>
                        {action}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {(() => {
                const advisory = getLeafAdvisory(result?.disease);
                if (!advisory) return null;
                return (
                  <View style={[styles.resultModalAdvice, { borderColor: diseaseInfo?.color || colors.primary }]}>
                    <View style={styles.resultModalAdviceHeader}>
                      <Text style={styles.resultModalAdviceTitle}>Advisory Guide</Text>
                      <Text style={[styles.resultModalAdviceStatus, { color: diseaseInfo?.color || colors.primary }]}>
                        {advisory.status}
                      </Text>
                    </View>

                    <View style={styles.resultModalAdviceSection}>
                      <Text style={styles.resultModalAdviceLabel}>Description</Text>
                      <Text style={styles.resultModalAdviceText}>{advisory.description}</Text>
                    </View>

                    <View style={styles.resultModalAdviceSection}>
                      <Text style={styles.resultModalAdviceLabel}>Common Symptoms</Text>
                      <Text style={styles.resultModalAdviceText}>{advisory.commonSymptoms}</Text>
                    </View>

                    <View style={styles.resultModalAdviceSection}>
                      <Text style={styles.resultModalAdviceLabel}>Prevention</Text>
                      <Text style={styles.resultModalAdviceText}>{advisory.prevention}</Text>
                    </View>

                    <View style={styles.resultModalAdviceSection}>
                      <Text style={styles.resultModalAdviceLabel}>Treatment</Text>
                      <Text style={styles.resultModalAdviceText}>{advisory.treatment}</Text>
                    </View>

                    <View style={styles.resultModalAdviceSection}>
                      <Text style={styles.resultModalAdviceLabel}>Primary Advice</Text>
                      <Text style={styles.resultModalAdviceText}>{advisory.primaryAdvice}</Text>
                    </View>

                    <View style={styles.resultModalAdviceSection}>
                      <Text style={styles.resultModalAdviceLabel}>Advanced Pro-Tip</Text>
                      {advisory.advancedProTips.map((tip, idx) => (
                        <View key={idx} style={styles.resultModalAdviceBullet}>
                          <View style={[styles.resultModalAdviceDot, { backgroundColor: diseaseInfo?.color || colors.primary }]} />
                          <Text style={styles.resultModalAdviceText}>{tip}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })()}

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
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Feather name="check" size={20} color="#FFFFFF" />
                  )}
                  <Text style={[styles.resultModalButtonText, { color: '#FFFFFF' }]}>
                    {saving ? 'Saving...' : 'Save Result'}
                  </Text>
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
    color: '#5A6B63',
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
    borderTopColor: '#2BB673',
    borderLeftColor: '#2BB673',
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
    borderTopColor: '#2BB673',
    borderRightColor: '#2BB673',
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
    borderBottomColor: '#2BB673',
    borderLeftColor: '#2BB673',
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
    borderBottomColor: '#2BB673',
    borderRightColor: '#2BB673',
    borderBottomRightRadius: 8,
  },
  frameGuideText: {
    color: 'rgba(43, 182, 115, 0.7)',
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
    backgroundColor: '#0E3B2EF0',
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
    left: 16,
    right: 16,
    backgroundColor: '#000000F0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderLeftWidth: 6,
    zIndex: 5,
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
    backgroundColor: '#E2554DF2',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
    zIndex: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#FFFFFF',
    shadowColor: '#E2554D',
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
    backgroundColor: '#0E3B2EF0',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    backgroundColor: '#0F1A16',
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
    textAlign: 'left',
    color: '#9CB3A8',
  },
  resultModalRecommendations: {
    backgroundColor: '#14221C',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E3027',
  },
  resultModalRecommendationsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F3F7F4',
    marginBottom: 14,
  },
  resultModalActionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  resultModalActionCheck: {
    marginRight: 12,
    marginTop: 2,
  },
  resultModalActionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
    color: '#F3F7F4',
  },
  resultModalAdvice: {
    backgroundColor: '#111F19',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E3027',
  },
  resultModalAdviceHeader: {
    marginBottom: 12,
  },
  resultModalAdviceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F3F7F4',
    marginBottom: 6,
  },
  resultModalAdviceStatus: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  resultModalAdviceSection: {
    marginBottom: 12,
  },
  resultModalAdviceLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F3F7F4',
    marginBottom: 6,
  },
  resultModalAdviceText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#9CB3A8',
  },
  resultModalAdviceBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  resultModalAdviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
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













