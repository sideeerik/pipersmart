import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Image,
  Alert,
  Animated,
  Dimensions,
  AppState,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { getUser, logout } from '../../utils/helpers';
import MobileHeader from '../../shared/MobileHeader';
import RealtimeLeafAnalyzer from './RealtimeLeafAnalyzer';
import { BACKEND_URL } from 'react-native-dotenv';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function LeafAnalysisScreen({ navigation, route }) {
  const [analysisMode, setAnalysisMode] = useState('standard'); // 'standard' or 'realtime'
  const [image, setImage] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const drawerSlideAnim = useRef(new Animated.Value(-280)).current;
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  const colors = {
    primary: '#0E3B2E',
    primaryDark: '#0A2C23',
    primaryLight: '#2BB673',
    secondary: '#FFFFFF',
    background: '#F3F7F4',
    text: '#0E3B2E',
    textLight: '#5A6B63',
    border: '#DDE7E1',
    accent: '#C9A227',
    accentSoft: '#F4E9C6',
    warning: '#F2A93B',
    danger: '#E2554D',
    success: '#2BB673',
  };
  useEffect(() => {
    const pendingImage = route?.params?.pendingImage;
    if (pendingImage?.uri) {
      console.log("PENDING: received from navigation", pendingImage.uri);
      setImageUri(pendingImage.uri);
      setImage(pendingImage);
      setError(null);
      setResult(null);
      navigation.setParams({ pendingImage: null });
    }
  }, [route?.params?.pendingImage, navigation]);

  const restorePendingImage = useCallback(async () => {
    try {
      console.log("PENDING: check (LeafAnalysisScreen)");
      const pending = await ImagePicker.getPendingResultAsync();
      console.log("PENDING: raw result", pending ? { canceled: pending.canceled, hasAssets: !!pending.assets?.length } : null);
      if (!pending || pending.canceled) return;

      const asset = pending.assets?.[0];
      if (asset?.uri) {
        console.log("PENDING: restored image", asset.uri);
        setImageUri(asset.uri);
        setImage(asset);
        setError(null);
        setResult(null);
      }
    } catch (err) {
      console.error('Failed to restore pending image:', err);
    }
  }, []);

  useEffect(() => {
    restorePendingImage();
  }, [restorePendingImage]);

  useFocusEffect(
    useCallback(() => {
      restorePendingImage();
    }, [restorePendingImage])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      console.log("APPSTATE: LeafAnalysisScreen", state);
      if (state === 'active') {
        restorePendingImage();
      }
    });
    return () => subscription.remove();
  }, [restorePendingImage]);

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

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerSlideAnim, {
      toValue: -280,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        console.log('NEW image from gallery - clearing previous result');
        setImageUri(asset.uri);
        setImage(asset);
        setError(null);
        setResult(null);
        setCameraOpen(false);
      }
    } catch (err) {
      setError('Failed to pick image from gallery');
      console.error(err);
    }
  };

  const openCamera = async () => {
    try {
      if (permission?.granted) {
        setCameraOpen(true);
        return;
      }

      const result = await requestPermission();
      if (result?.granted) {
        setCameraOpen(true);
      } else {
        setError('Camera permission denied. Enable it in Settings.');
      }
    } catch (err) {
      setError('Failed to request camera permission');
      console.error(err);
    }
  };

  const closeCamera = () => {
    setCameraOpen(false);
  };

  const capturePhoto = async () => {
    try {
      if (!cameraRef.current) {
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (!photo?.uri) return;

      const asset = {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `leaf_${Date.now()}.jpg`,
      };

      console.log('NEW image from camera - clearing previous result');
      setImageUri(asset.uri);
      setImage(asset);
      setError(null);
      setResult(null);
      setCameraOpen(false);
    } catch (err) {
      setError('Failed to capture image');
      console.error(err);
    }
  };
  const handleAnalyze = async () => {
    if (!image || !imageUri) {
      setError('Please select an image first');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const token = await axios.defaults.headers.common['Authorization'];
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setAnalyzing(false);
        return;
      }

      // Create FormData with image - UNIQUE ID for this request
      const requestId = `leaf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `${requestId}.jpg`,
      });
      formData.append('requestId', requestId);

      console.log(`📤 [${requestId}] UPLOADING NEW IMAGE`);

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/predict/disease?requestId=${requestId}&ts=${Date.now()}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token,
          },
          timeout: 120000,
        }
      );

      if (response.data && (response.data.disease || response.data.success)) {
        console.log(`✅ [${requestId}] RESULT RECEIVED - Disease: ${response.data.disease}, Confidence: ${response.data.confidence}%`);
        
        // Ensure disease name is normalized for lookup
        const diseaseName = response.data.disease;
        const info = getDiseaseInfo(diseaseName);
        
        console.log(`🔍 Lookup Info:`, info ? 'Found' : 'Not Found');
        
        setResult(response.data);
      } else {
        setError('No disease detected in response');
        console.error(`❌ [${requestId}] Invalid response from backend`);
      }
    } catch (err) {
      console.error('❌ Prediction error:', err);
      console.error('❌ Error code:', err?.code);
      console.error('❌ Error message:', err?.message);
      console.error('❌ Response status:', err?.response?.status);
      console.error('❌ Response data:', err?.response?.data);
      
      let errorMsg = 'Failed to analyze image. Please try again.';
      
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMsg = 'Request timeout. First run may take 1-2 minutes while models initialize. Try again.';
      } else if (err.message === 'Network Error') {
        errorMsg = 'Network error. Make sure backend is running and IP is correct.';
      } else if (err.code === 'ECONNREFUSED') {
        errorMsg = 'Cannot connect to backend. Check IP address and port 4001.';
      }
      
      setError(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  const getDiseaseInfo = (diseaseName) => {
    // Normalize disease name - handle different formats from model
    let normalizedName = diseaseName;
    
    // Map common variations to expected names
    const diseaseMapping = {
      'healthy': 'Healthy',
      'footrot': 'Footrot',
      'pollu': 'Pollu_Disease',
      'pollu_disease': 'Pollu_Disease',
      'slow-decline': 'Slow-Decline',
      'slow_decline': 'Slow-Decline',
      'slowdecline': 'Slow_Decline',
      'leaf-blight': 'Leaf_Blight',
      'leaf_blight': 'Leaf_Blight',
      'leafblight': 'Leaf_Blight',
      'yellow-mottle': 'Yellow_Mottle_Virus',
      'yellow_mottle': 'Yellow_Mottle_Virus',
      'yellow_mottle_virus': 'Yellow_Mottle_Virus',
      'ymv': 'Yellow_Mottle_Virus'
    };
    
    // Check if we need to normalize the name
    const lowerName = diseaseName?.toLowerCase?.() || '';
    if (diseaseMapping[lowerName]) {
      normalizedName = diseaseMapping[lowerName];
    }
    
    // Log for debugging
    console.log(`🔍 Disease name mapping: "${diseaseName}" -> "${normalizedName}"`);
    
    return diseaseRecommendations[normalizedName] || {
      iconName: 'leaf',
      title: `${diseaseName || 'Unknown'} Disease`,
      description: 'Unable to identify the disease. The model returned: ' + diseaseName,
      actions: ['Consult agricultural expert', 'Get professional diagnosis', 'Check backend logs for model output'],
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

  const handleClearImage = () => {
    setImage(null);
    setImageUri(null);
    setResult(null);
    setError(null);
  };

  const resultInfo = result ? getDiseaseInfo(result.disease) : null;
  console.log('🖼️ RENDERING RESULT:', result ? 'YES' : 'NO');
  console.log('ℹ️ RESULT INFO:', resultInfo ? 'YES' : 'NO', resultInfo?.title);

  // Show real-time analyzer if in realtime mode
  if (analysisMode === 'realtime') {
    return <RealtimeLeafAnalyzer navigation={navigation} />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <MobileHeader
        navigation={navigation}
        drawerOpen={drawerOpen}
        openDrawer={openDrawer}
        closeDrawer={closeDrawer}
        drawerSlideAnim={drawerSlideAnim}
        user={user}
        onLogout={() => {
          // ⚡ Fast logout - immediate response (backend call happens in background)
          logout(navigation);
        }}
      />

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, analysisMode === 'standard' && styles.modeButtonActive]}
          onPress={() => {
            setAnalysisMode('standard');
            setResult(null);
            setError(null);
          }}
        >
          <MaterialCommunityIcons 
            name="upload" 
            size={18} 
            color={analysisMode === 'standard' ? colors.primary : colors.textLight} 
          />
          <Text style={[styles.modeButtonText, analysisMode === 'standard' && styles.modeButtonTextActive]}>
            Standard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, analysisMode === 'realtime' && styles.modeButtonActive]}
          onPress={() => setAnalysisMode('realtime')}
        >
          <MaterialCommunityIcons 
            name="video" 
            size={18} 
            color={analysisMode === 'realtime' ? colors.primary : colors.textLight} 
          />
          <Text style={[styles.modeButtonText, analysisMode === 'realtime' && styles.modeButtonTextActive]}>
            Real-time
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.heroWrap}>
          <View style={styles.heroGlow} />
          <View style={styles.heroRing} />
          <View style={[styles.titleContainer, { backgroundColor: colors.primary }]}>
            <Image 
              source={require('../../../../picsbl/logowalangbg.png')} 
              style={styles.logoImage}
            />
            <Text style={styles.title}>Leaf Analysis</Text>
            <Text style={styles.subtitle}>Detect pepper diseases using AI</Text>
            <View style={styles.heroChips}>
              {['AI Vision', 'Pepper Leaf', 'Fast Scan'].map((chip) => (
                <View key={chip} style={styles.heroChip}>
                  <Text style={styles.heroChipText}>{chip}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionKicker}>Step 1</Text>
          <Text style={styles.sectionTitle}>Upload Leaf Image</Text>
        </View>

        {/* Image Selection Section */}
        <View style={[styles.imageSection, { borderColor: colors.border }]}>
          {cameraOpen ? (
            <>
              <View style={styles.imageContainer}>
                <CameraView
                  ref={cameraRef}
                  style={styles.cameraPreview}
                  facing="back"
                />
              </View>
              <TouchableOpacity
                style={[styles.captureButton, { backgroundColor: colors.primaryLight }]}
                onPress={capturePhoto}
              >
                <Feather name="camera" size={20} color={colors.secondary} />
                <Text style={styles.captureButtonText}>Capture Photo</Text>
              </TouchableOpacity>
            </>
          ) : imageUri ? (
            <>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.selectedImage}
                />
              </View>
              <TouchableOpacity 
                style={[styles.clearButton, { backgroundColor: colors.danger }]}
                onPress={handleClearImage}
              >
                <Feather name="x" size={20} color={colors.secondary} />
                <Text style={styles.clearButtonText}>Clear Image</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="image-plus" size={48} color={colors.textLight} />
              <Text style={[styles.placeholderText, { color: colors.textLight }]}>
                No image selected
              </Text>
              <Text style={[styles.placeholderSubtext, { color: colors.textLight }]}>
                Select an image of your pepper leaf
              </Text>
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionKicker}>Step 2</Text>
          <Text style={styles.sectionTitle}>Run Analysis</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.primaryDark,
              flex: 1,
              marginRight: 8
            }]}
            onPress={cameraOpen ? closeCamera : openCamera}
            disabled={analyzing}
          >
            <Feather name={cameraOpen ? "x" : "camera"} size={20} color={colors.secondary} />
            <Text style={styles.buttonText}>{cameraOpen ? "Close Camera" : "Open Camera"}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.primary,
              flex: 1,
              marginLeft: 8,
              opacity: cameraOpen ? 0.6 : 1
            }]}
            onPress={pickImageFromGallery}
            disabled={analyzing || cameraOpen}
          >
            <Feather name="image" size={20} color={colors.secondary} />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.danger + '15', borderColor: colors.danger }]}>
            <Feather name="alert-circle" size={20} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Analyze Button */}
        <TouchableOpacity 
          style={[styles.analyzeButton, { 
            backgroundColor: colors.primaryLight,
            opacity: imageUri && !analyzing ? 1 : 0.6
          }]}
          onPress={handleAnalyze}
          disabled={!imageUri || analyzing}
        >
          {analyzing ? (
            <>
              <ActivityIndicator size="small" color={colors.secondary} />
              <Text style={styles.analyzeButtonText}>Analyzing...</Text>
            </>
          ) : (
            <>
              <Feather name="zap" size={20} color={colors.secondary} />
              <Text style={styles.analyzeButtonText}>Analyze Leaf</Text>
            </>
          )}
        </TouchableOpacity>

        {result && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionKicker}>Results</Text>
            <Text style={styles.sectionTitle}>Health Insights</Text>
          </View>
        )}

        {/* Result Section */}
        {result && (
          <View style={[styles.card, { 
            borderLeftColor: resultInfo?.color || colors.primary, 
            borderLeftWidth: 6,
            shadowColor: resultInfo?.color || colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }]}>
            {/* Result Header */}
            <View style={styles.resultHeader}>
              <View style={styles.resultTitleRow}>
                <View
                  style={[
                    styles.resultBadge,
                    { backgroundColor: (resultInfo?.color || colors.primary) + '22' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={resultInfo?.iconName || 'leaf'}
                    size={20}
                    color={resultInfo?.color || colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resultTitle, { color: resultInfo?.color || colors.primary }]}>
                    {resultInfo?.title || result.disease || 'Analysis Complete'}
                  </Text>
                  <Text style={[styles.confidence, { color: colors.textLight }]}>
                    {result.confidence}% Confidence
                  </Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <Text style={[styles.description, { color: colors.textLight }]}>
              {resultInfo?.description || 'Analysis completed successfully.'}
            </Text>

            {/* Recommendations */}
            {resultInfo?.actions && (
              <View style={styles.recommendationsBox}>
                <Text style={styles.recommendationsTitle}>Recommended Actions</Text>
                {resultInfo.actions.map((action, idx) => (
                  <View key={idx} style={styles.actionItem}>
                    <MaterialCommunityIcons
                      name="check"
                      size={16}
                      color={resultInfo.color}
                      style={styles.actionCheck}
                    />
                    <Text style={[styles.actionText, { color: colors.text }]}>
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
                <View style={[styles.adviceCard, { borderColor: resultInfo?.color || colors.primary }]}>
                  <View style={styles.adviceHeader}>
                    <Text style={styles.adviceTitle}>Advisory Guide</Text>
                    <Text style={[styles.adviceStatus, { color: resultInfo?.color || colors.primary }]}>
                      {advisory.status}
                    </Text>
                  </View>

                  <View style={styles.adviceSection}>
                    <Text style={styles.adviceLabel}>Description</Text>
                    <Text style={styles.adviceText}>{advisory.description}</Text>
                  </View>

                  <View style={styles.adviceSection}>
                    <Text style={styles.adviceLabel}>Common Symptoms</Text>
                    <Text style={styles.adviceText}>{advisory.commonSymptoms}</Text>
                  </View>

                  <View style={styles.adviceSection}>
                    <Text style={styles.adviceLabel}>Prevention</Text>
                    <Text style={styles.adviceText}>{advisory.prevention}</Text>
                  </View>

                  <View style={styles.adviceSection}>
                    <Text style={styles.adviceLabel}>Treatment</Text>
                    <Text style={styles.adviceText}>{advisory.treatment}</Text>
                  </View>

                  <View style={styles.adviceSection}>
                    <Text style={styles.adviceLabel}>Primary Advice</Text>
                    <Text style={styles.adviceText}>{advisory.primaryAdvice}</Text>
                  </View>

                  <View style={styles.adviceSection}>
                    <Text style={styles.adviceLabel}>Advanced Pro-Tip</Text>
                    {advisory.advancedProTips.map((tip, idx) => (
                      <View key={idx} style={styles.adviceBulletRow}>
                        <View style={[styles.adviceDot, { backgroundColor: resultInfo?.color || colors.primary }]} />
                        <Text style={styles.adviceText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}

            {/* Detection Details */}
            {result.confidence && (
              <View style={styles.confidenceBox}>
                <Text style={styles.confidenceTitle}>Analysis Confidence</Text>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      {
                        width: `${result.confidence}%`,
                        backgroundColor: result.confidence > 85 ? colors.success : colors.warning,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.confidencePercent}>{result.confidence}% Confidence</Text>
              </View>
            )}

            {/* Analyze Another */}
            <TouchableOpacity
              style={[styles.analyzeAgainButton, { 
                backgroundColor: colors.primaryLight,
                shadowColor: colors.primaryLight,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 4,
              }]}
              onPress={() => {
                setImageUri(null);
                setImage(null);
                setResult(null);
                setError(null);
              }}
            >
              <Feather name="refresh-cw" size={18} color="#FFFFFF" />
              <Text style={styles.analyzeAgainText}>Analyze Another Leaf</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  modeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    padding: 6,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE7E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: '#F4E9C6',
    borderWidth: 1,
    borderColor: '#E6D9B0',
  },
  modeButtonText: {
    color: '#5A6B63',
    fontWeight: '600',
    fontSize: 13,
  },
  modeButtonTextActive: {
    color: '#0E3B2E',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  heroWrap: {
    paddingHorizontal: 4,
    marginBottom: 18,
  },
  heroGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(43, 182, 115, 0.22)',
    top: -20,
    right: -20,
  },
  heroRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    bottom: -30,
    left: -10,
  },
  titleContainer: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  heroChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoImage: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 6,
  },
  sectionKicker: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    color: '#5A6B63',
    marginBottom: 4,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0E3B2E',
  },
  imageSection: {
    borderWidth: 1,
    borderRadius: 18,
    borderColor: '#DDE7E1',
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 280,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  selectedImage: {
    width: '100%',
    height: 260,
    borderRadius: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDE7E1',
  },
  cameraPreview: {
    width: '100%',
    height: '100%',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 14,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 14,
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    color: '#0E3B2E',
  },
  placeholderSubtext: {
    fontSize: 13,
    marginTop: 6,
    color: '#5A6B63',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  errorBox: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  analyzeButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    shadowColor: '#2BB673',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  resultHeader: {
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE8',
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  confidence: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'left',
  },
  recommendationsBox: {
    backgroundColor: '#EAF6F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DDE7E1',
  },
  recommendationsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0E3B2E',
    marginBottom: 14,
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  actionCheck: {
    marginRight: 10,
    marginTop: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  predictionsBox: {
    backgroundColor: '#F3F7F4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  predictionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0E3B2E',
    marginBottom: 12,
  },
  confidenceBox: {
    backgroundColor: '#F3F7F4',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DDE7E1',
    borderLeftWidth: 4,
    borderLeftColor: '#F2A93B',
  },
  confidenceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0E3B2E',
    marginBottom: 14,
  },
  confidenceBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 8,
  },
  confidencePercent: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0E3B2E',
    textAlign: 'center',
  },
  detectionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0E3B2E',
  },
  detectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A6B63',
    marginBottom: 4,
  },
  detectionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0E3B2E',
  },
  predictionRow: {
    marginBottom: 12,
  },
  diseaseName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0E3B2E',
    marginBottom: 4,
  },
  predictionBar: {
    height: 8,
    backgroundColor: '#DDE7E1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  predictionFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0E3B2E',
    textAlign: 'right',
  },
  analyzeAgainButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  analyzeAgainText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE7E1',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  adviceCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
    backgroundColor: '#F9FBFA',
  },
  adviceHeader: {
    marginBottom: 12,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0E3B2E',
    marginBottom: 4,
  },
  adviceStatus: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  adviceSection: {
    marginBottom: 12,
  },
  adviceLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0E3B2E',
    marginBottom: 6,
  },
  adviceText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5A6B63',
  },
  adviceBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  adviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
});

