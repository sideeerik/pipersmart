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
  Modal,
  PanResponder,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BACKEND_URL } from 'react-native-dotenv';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFocusEffect } from '@react-navigation/native';
import BoundingBoxOverlay from './BoundingBoxOverlay';
import { getUser } from '../../utils/helpers';

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
  const [showResultModal, setShowResultModal] = useState(false);
  const [modalResult, setModalResult] = useState(null);
  const [latestPhoto, setLatestPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const cameraRef = useRef(null);
  const analyzeIntervalRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const { width: screenWidth } = Dimensions.get('window');
  const [showResults, setShowResults] = useState(true);
  const resultsPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 6,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 20) setShowResults(false);
        if (gesture.dy < -20) setShowResults(true);
      },
    })
  ).current;

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

  const ripenessColors = {
    'Ripe': colors.success,
    'Unripe': colors.warning,
    'Rotten': colors.danger,
  };

  const detectionAdviceLibrary = {
    high: {
      classes: {
        a: {
          gradeKey: 'premium',
          gradeLabel: 'PREMIUM GRADE',
          tips: [
            { label: 'Best Use', text: 'Process immediately for White Pepper by soaking in clean water for 7 days to fetch the highest export price.' },
            { label: 'Black Pepper Tip', text: 'Blanch in 80C water for 1 minute before drying to achieve a premium, glossy jet-black finish.' },
            { label: 'Storage', text: 'Use hermetic (air-tight) bags and keep temperatures below 25C to lock in the high volatile oil content.' },
            { label: 'Value Strategy', text: 'Label as "Single-Origin" or "Estate Grade" to target gourmet spice markets.' },
          ],
        },
        b: {
          gradeKey: 'standard',
          gradeLabel: 'STANDARD GRADE',
          tips: [
            { label: 'Best Use', text: 'High-quality Whole Black Pepper for retail or wholesale distribution.' },
            { label: 'Processing', text: 'Use a mechanical thresher at low speed to remove stalks; ripe skins are soft and bruise easily.' },
            { label: 'Drying', text: 'Spread in a thin 3cm layer on black mats; perform a moisture test after 4 days to hit the 12% target.' },
            { label: 'Quality Check', text: 'Ensure the batch is kept away from smoke or strong odors, as ripe oils absorb ambient smells easily.' },
          ],
        },
        c: {
          gradeKey: 'commercial',
          gradeLabel: 'COMMERCIAL GRADE',
          tips: [
            { label: 'Best Use', text: 'Best suited for Ground Black Pepper; milling the berries hides surface blemishes while retaining flavor.' },
            { label: 'Pre-treatment', text: 'Wash in a 2% citric acid solution before drying to remove surface discoloration and neutralize bacteria.' },
            { label: 'Color Fix', text: 'Use a longer blanching time (2 mins) to force a uniform dark color across the "Fair" health spots.' },
            { label: 'Market Strategy', text: 'Sell to industrial spice blenders who prioritize heat and aroma over visual berry "boldness."'},
          ],
        },
        d: {
          gradeKey: 'commercial',
          gradeLabel: 'COMMERCIAL GRADE',
          tips: [
            { label: 'Best Use', text: 'Sell to industrial plants for Oleoresin or Oil Extraction; the inner chemistry is more valuable than the shell.' },
            { label: 'Sanitation', text: 'Deep-clean all baskets and mats with 10% bleach after handling this batch to kill lingering fungal spores.' },
            { label: 'Waste Control', text: 'If any berries show deep rot, bury them in a 1-meter pit with lime to protect your farm\'s soil.' },
            { label: 'Risk Mitigation', text: 'Quarantine this batch 10 meters away from Premium stock to prevent cross-contamination.' },
          ],
        },
      },
    },
    mid: {
      classes: {
        ab: {
          gradeKey: 'standard',
          gradeLabel: 'STANDARD GRADE',
          tips: [
            { label: 'Best Use', text: 'The global benchmark for Bulk Black Pepper (FAQ Grade); target high-volume commodity wholesalers.' },
            { label: 'Logistics', text: 'Ensure high airflow with industrial fans for the first 24 hours to prevent the berries from fermenting.' },
            { label: 'Density Goal', text: 'Aim for a liter-weight of 550g/L; use a blower to winnow out "light berries" and increase batch value.' },
            { label: 'Specialty Idea', text: 'These are the best candidates for Freeze-Drying to produce high-value dehydrated green peppercorns.' },
          ],
        },
        cd: {
          gradeKey: 'commercial',
          gradeLabel: 'COMMERCIAL GRADE',
          tips: [
            { label: 'Best Use', text: 'Local market sales or low-value spice mixes where a lower density is acceptable.' },
            { label: 'Quality Sort', text: 'Use a water-flotation test; keep the "sinkers" for sale and discard "floaters" (hollow berries).' },
            { label: 'Safety Alert', text: 'Monitor for "fuzzy" mold growth; if detected, incinerate that portion immediately to avoid Aflatoxins.' },
            { label: 'Blending', text: 'Limit this batch to 10% of any final blend to ensure you do not fail the overall liter-weight export test.' },
          ],
        },
      },
    },
    unripe: {
      classes: {
        ab: {
          gradeKey: 'standard',
          gradeLabel: 'STANDARD GRADE',
          tips: [
            { label: 'Best Use', text: 'Harvest as Green Peppercorns in brine or vinegar pickles for a crisp, "pop" texture.' },
            { label: 'Field Action', text: 'If still on the vine, apply Potash fertilizer immediately to help berries swell and reach Class C.' },
            { label: 'Drying Note', text: 'Expect high weight loss (80%); dry very quickly at high heat to preserve the green chlorophyll color.' },
            { label: 'Value Strategy', text: 'Sell as "Extra-Young Green Pepper" flakes to niche spice blenders for a 5x price markup.' },
          ],
        },
        c: {
          gradeKey: 'commercial',
          gradeLabel: 'COMMERCIAL GRADE',
          tips: [
            { label: 'Best Use', text: 'Internal farm use or non-food applications like organic insect repellent mulch.' },
            { label: 'Intervention', text: 'Poor health at this stage suggests vine stress; increase shade and irrigation to the parent plants.' },
            { label: 'Disease Check', text: 'Look for "Yellow Mottle" virus or sap-sucking insects that may be stunting the young fruit.' },
            { label: 'Resource Recovery', text: 'Do not waste expensive machine-drying time; sun-dry only if space and labor are free.' },
          ],
        },
        d: {
          gradeKey: 'reject',
          gradeLabel: 'REJECT',
          tips: [
            { label: 'Action', text: 'Automatic Reject. These will dry into "Pinheads" (worthless dust) and should be culled immediately.' },
            { label: 'Diagnosis', text: 'Inspect vines for Quick Wilt (Phytophthora); blackening at the base of the stem is a critical warning.' },
            { label: 'System Alert', text: 'Removing this batch now saves fuel, space, and labor costs for your processing facility.' },
          ],
        },
      },
    },
    rotten: {
      gradeKey: 'reject',
      gradeLabel: 'REJECT',
      tips: [
        { label: 'Field Audit', text: 'Check your farm\'s drainage and soil pH; rot usually signals waterlogged roots or acidic soil (pH < 5.5).' },
        { label: 'Storage Fix', text: 'Ensure your warehouse humidity is below 60%; use a dehumidifier to stop healthy berries from turning.' },
        { label: 'Safety', text: 'Dispose of this batch away from water sources; rot-prone berries can attract the Pepper Weevil pest.' },
        { label: 'Hygiene', text: 'Sanitize hands and all harvesting gear before returning to the field to prevent spreading the rot.' },
      ],
    },
  };

  const getDetectionAdvice = (analysisResult) => {
    if (!analysisResult) return null;
    const ripenessText = analysisResult.ripeness?.toLowerCase();
    const isRotten = ripenessText === 'rotten';
    const healthRaw = String(analysisResult.health_class || '').toLowerCase();
    const classRaw = String(analysisResult.class || '').toLowerCase();
    const healthLetterMatch = healthRaw.match(/^[a-d]$/) || healthRaw.match(/[a-d]/);
    const classLetterMatch = classRaw.match(/(?:-|_)([a-d])\b/);
    const healthLetter = healthLetterMatch
      ? healthLetterMatch[0]
      : classLetterMatch
        ? classLetterMatch[1]
        : '';
    const ripenessPct = Number(analysisResult.ripeness_percentage);

    let categoryKey = null;
    if (isRotten) {
      categoryKey = 'rotten';
    } else if (Number.isFinite(ripenessPct)) {
      if (ripenessPct >= 51) categoryKey = 'high';
      else if (ripenessPct >= 26) categoryKey = 'mid';
      else if (ripenessPct >= 0) categoryKey = 'unripe';
    } else if (ripenessText === 'ripe') {
      categoryKey = 'high';
    } else if (ripenessText === 'unripe') {
      categoryKey = 'unripe';
    }

    if (!categoryKey) return null;

    if (categoryKey === 'rotten') {
      return detectionAdviceLibrary.rotten;
    }

    if (!healthLetter) return null;

    const category = detectionAdviceLibrary[categoryKey];
    if (!category) return null;

    let advice = null;
    if (categoryKey === 'high') {
      advice = category.classes[healthLetter] || null;
    } else if (categoryKey === 'mid') {
      if (healthLetter === 'a' || healthLetter === 'b') advice = category.classes.ab;
      if (healthLetter === 'c' || healthLetter === 'd') advice = category.classes.cd;
    } else if (categoryKey === 'unripe') {
      if (healthLetter === 'a' || healthLetter === 'b') advice = category.classes.ab;
      if (healthLetter === 'c') advice = category.classes.c;
      if (healthLetter === 'd') advice = category.classes.d;
    }

    if (!advice) return null;

    return advice;
  };

  const getClassRipenessFromPercentage = (ripenessPercentage) => {
    const pct = Number(ripenessPercentage);
    if (!Number.isFinite(pct)) return null;
    if (pct >= 76) return { letter: 'A', label: 'Fully ripe' };
    if (pct >= 51) return { letter: 'B', label: 'Semi-Ripe' };
    if (pct >= 26) return { letter: 'C', label: 'Under-ripe' };
    if (pct >= 0) return { letter: 'D', label: 'Unripe' };
    return null;
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
      setIsActive(false);
      if (analyzeIntervalRef.current) {
        clearInterval(analyzeIntervalRef.current);
      }
    };
  }, []);

  const captureAndAnalyze = async () => {
    // Guard clause: skip if no camera or already analyzing
    if (!cameraRef.current || analyzing) return;

    try {
      setAnalyzing(true);

      const token = axios.defaults.headers.common['Authorization'];
      if (!token) {
        console.error('❌ No token');
        setError('Auth failed');
        setAnalyzing(false);
        return;
      }
      
      // Capture at quality that works with ML model
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8, // Matches BungaRipenessScreen quality
      });

      if (!photo || !photo.uri) {
        console.error('❌ Capture failed');
        setAnalyzing(false);
        return;
      }

      const photoName = `bunga_${Date.now()}.jpg`;
      const photoPayload = {
        uri: photo.uri,
        type: 'image/jpeg',
        name: photoName,
      };
      setLatestPhoto(photoPayload);

      const formData = new FormData();
      formData.append('image', photoPayload);
      formData.append('save', 'false');

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/predict/bunga-with-objects`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token,
          },
          // First load: 90s (model initialization)
          // Subsequent: 80s (model inference)
          timeout: isFirstLoadRef.current ? 90000 : 80000,
        }
      );

      if (response.data?.error || response.data?.success === false) {
        // Backend returned error (invalid image, no bunga, processing error)
        setError(response.data.error || (response.data?.success === false ? 'No bunga detected' : 'Analysis failed'));
        setAnalyzing(false);
        return;
      }

      if (response.data && response.data.ripeness) {
        // Mark first load complete - faster timeout afterwards
        if (isFirstLoadRef.current) isFirstLoadRef.current = false;
        
        // Process confidence - use confidence from response
        let conf = response.data.confidence || 0;
        if (conf > 100) {
          while (conf > 100) conf = conf / 10;
        }
        if (conf < 1) {
          conf = conf * 100;
        }
        conf = Math.round(conf * 100) / 100;

        // Show bounding boxes immediately
        const newDetections = response.data.bunga_detections || [];
        if (newDetections.length > 0) {
          setBungaDetections(newDetections);
        }
        
        // Update image size for overlay scaling
        setImageSize(response.data.image_size || null);
        
        // Prepare result for modal
        const resultData = {
          class: response.data.class,
          ripeness: response.data.ripeness,
          ripeness_percentage: response.data.ripeness_percentage,
          confidence: conf,
          health_class: response.data.health_class || null,
          health_percentage: response.data.health_percentage || 0,
          bunga_detections: response.data.bunga_detections,
          analysisId: response.data.analysisId,
          market_grade: response.data.market_grade,
          processingTime: response.data.processingTime || 0,
        };
        
        setResult(resultData);
        setModalResult(resultData);
        
        // Stop continuous analysis and show modal
        setIsActive(false);
        if (analyzeIntervalRef.current) {
          clearInterval(analyzeIntervalRef.current);
          analyzeIntervalRef.current = null;
        }
        setShowResultModal(true);
        
        setError(null);
        
        console.log(`✅ ${response.data.ripeness} - Health Class ${response.data.health_class || 'Unknown'} (${response.data.health_percentage || 0}%)`);
      } else {
        // No ripeness detection this frame - skip silently
        console.log('⚠️ No bunga detected in frame');
      }
    } catch (err) {
      // Silent skip on no pepper detected
      if (err.response?.status === 400 && err.response?.data?.error?.includes('No pepper')) {
        console.log('⚠️ No pepper frame');
        return;
      }

      // Auth error
      if (err.response?.status === 401) {
        setError('Auth failed');
      }
      // Timeout - skip silently
      else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        console.warn('⚠️ Timeout - retrying');
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

    setIsActive(true);
    setError(null);
    setResult(null);
    setLatestPhoto(null);

    console.log('Starting real-time analysis with token:', token.substring(0, 20) + '...');

    // Start first capture immediately
    await captureAndAnalyze();

    // Then continue capturing with 1.5s minimum interval between captures
    analyzeIntervalRef.current = setInterval(async () => {
      if (isActive) {
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
    // Clear results after stopping
      setResult(null);
      setBungaDetections([]);
      setOtherObjects([]);
      setImageSize(null);
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

  const handleSaveResult = async () => {
    if (!modalResult || !latestPhoto || saving) return;

    try {
      setSaving(true);
      const token = axios.defaults.headers.common['Authorization'];
      if (!token) {
        Alert.alert('Authentication Required', 'Please login first before saving');
        return;
      }

      const formData = new FormData();
      formData.append('image', latestPhoto);
      formData.append('ripeness', modalResult.ripeness);
      formData.append('ripeness_percentage', String(modalResult.ripeness_percentage || 0));
      formData.append('health_class', modalResult.health_class || '');
      formData.append('health_percentage', String(modalResult.health_percentage || 0));
      formData.append('confidence', String(modalResult.confidence || 0));
      formData.append('processingTime', String(modalResult.processingTime || 0));

      await axios.post(
        `${BACKEND_URL}/api/v1/predict/bunga-save`,
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
      setModalResult(null);
      setIsActive(false);
      setBungaDetections([]);
      setImageSize(null);
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
    setModalResult(null);
    setIsActive(false);
    setBungaDetections([]);
    setImageSize(null);
    setLatestPhoto(null);
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
        {/* Camera Frame Guide */}
        <View style={styles.frameGuide}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
          <Text style={styles.frameGuideText}>Position peppercorn here</Text>
        </View>
      </View>

      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: `${colors.primary}F2` }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Real-time Bunga Analysis</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Live Result Overlay */}
      {result && result.ripeness && (
        <View style={[styles.resultOverlay, { borderLeftColor: ripenessColors[result.ripeness] || colors.primary }]}>
          <Text style={styles.ripenessLabel}>
            {result.ripeness}{result.ripeness_percentage ? ` (${result.ripeness_percentage}%)` : ''}
          </Text>
          <Text style={[styles.confidenceText, { color: ripenessColors[result.ripeness] || colors.primary }]}>
            Health {result.health_class}: {result.health_percentage}% • Conf: {Math.round(result.confidence)}%
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
            <View style={[styles.statusBadge, { backgroundColor: colors.danger + '26' }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.danger }]} />
              <Text style={[styles.statusText, { color: colors.danger }]}>LIVE</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: colors.primaryLight + '26' }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.primaryLight }]} />
              <Text style={[styles.statusText, { color: colors.primaryLight }]}>Ready for real-time analysis</Text>
            </View>
          )}
          {!isActive && (
            <Text style={styles.instructionText}>Place camera on the peppercorn before clicking start</Text>
          )}
        </View>

        {/* Results Display */}
        {result && (
          <View style={styles.resultsSection} {...resultsPanResponder.panHandlers}>
            <TouchableOpacity
              style={styles.resultsToggle}
              onPress={() => setShowResults((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text style={styles.resultsToggleText}>Results</Text>
              <Feather name={showResults ? 'chevron-down' : 'chevron-up'} size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {showResults && (
              <>
                {/* Ripeness - Always shown when detected */}
                {result.ripeness && (
                  <View style={[styles.resultCard, { backgroundColor: colors.primaryLight + '20', borderLeftColor: colors.primaryLight }]}>
                    <View style={styles.resultCardHeader}>
                      <Text style={[styles.resultCardTitle, { color: colors.primaryLight }]}>RIPENESS</Text>
                    </View>
                    <Text style={[styles.resultCardValue, { color: colors.primaryLight }]}>
                      {result.ripeness}{result.ripeness_percentage ? ` (${result.ripeness_percentage}%)` : ''}
                    </Text>
                    <Text style={[styles.resultCardSubText, { color: colors.textLight }]}>
                      Confidence: {Math.round(result.confidence)}%
                    </Text>
                  </View>
                )}

                {/* Health Status - Show loading if not yet detected */}
                <View style={[styles.resultCard, { backgroundColor: '#2196F3' + '20', borderLeftColor: '#2196F3' }]}>
                  <View style={styles.resultCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.resultCardTitle, { color: '#2196F3' }]}>HEALTH CLASS</Text>
                      {!result.health_class && isActive && (
                        <ActivityIndicator size="small" color="#2196F3" style={{ marginLeft: 8 }} />
                      )}
                    </View>
                  </View>
                  {result.health_class ? (
                    <>
                      <Text style={[styles.resultCardValue, { color: '#2196F3' }]}>
                        Class {result.health_class} ({result.health_percentage}%)
                      </Text>
                      <Text style={[styles.resultCardSubText, { color: colors.textLight }]}>
                        Health Score: {result.health_percentage}%
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.resultCardSubText, { color: colors.textLight, fontStyle: 'italic' }]}>
                      Analyzing health status...
                    </Text>
                  )}
                </View>

                {(() => {
                  const advice = getDetectionAdvice(result);
                  if (!advice) return null;
                  const gradeColors = {
                    premium: colors.accent,
                    standard: colors.success,
                    commercial: colors.warning,
                    reject: colors.danger,
                  };
                  const accent = gradeColors[advice.gradeKey] || colors.primaryLight;
                  const isRotten = result?.ripeness?.toLowerCase() === 'rotten';
                  const classInfo = getClassRipenessFromPercentage(result?.ripeness_percentage);
                  return (
                    <View style={[styles.adviceCard, { borderColor: accent, backgroundColor: accent + '12' }]}>
                      <View style={styles.adviceHeader}>
                        <View style={[styles.adviceBadge, { backgroundColor: accent + '26' }]}>
                          <MaterialCommunityIcons name="clipboard-text" size={18} color={accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.adviceTitle, { color: '#FFFFFF' }]}>
                            Analyzation Advice
                          </Text>
                          <Text style={[styles.adviceGrade, { color: accent }]}>
                            {advice.gradeLabel}
                          </Text>
                          {isRotten ? (
                            <Text style={[styles.adviceStatus, { color: colors.textLight }]}>
                              Class: Rotten
                            </Text>
                          ) : classInfo ? (
                            <Text style={[styles.adviceStatus, { color: colors.textLight }]}>
                              {`Class ${classInfo.letter}: ${classInfo.label}`}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      {advice.tips.map((tip, index) => (
                        <View key={`${tip.label}-${index}`} style={styles.adviceItem}>
                          <View style={[styles.adviceDot, { backgroundColor: accent }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.adviceLabel, { color: '#FFFFFF' }]}>
                              {tip.label}
                            </Text>
                            <Text style={[styles.adviceText, { color: colors.textLight }]}>
                              {tip.text}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  );
                })()}
              </>
            )}
          </View>
        )}
        
        {/* Control Buttons */}
        <View style={styles.buttonContainer}>
          {isActive ? (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.danger }]}
              onPress={stopRealTimeAnalysis}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="square" size={20} color="#FFFFFF" />
                <Text style={styles.controlButtonText}>Stop Analysis</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.primaryLight }]}
              onPress={startRealTimeAnalysis}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="play-circle" size={20} color="#FFFFFF" />
                <Text style={styles.controlButtonText}>Start Analysis</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Result Confirmation Modal */}
      {showResultModal && modalResult && (
        <Modal
          visible={showResultModal}
          transparent
          animationType="slide"
          onRequestClose={handleCancelResult}
        >
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={[styles.resultModalHeader, { backgroundColor: ripenessColors[modalResult.ripeness] + '20' }]}>
                <MaterialCommunityIcons
                  name={
                    modalResult.ripeness === 'Ripe'
                      ? 'check-circle'
                      : modalResult.ripeness === 'Unripe'
                        ? 'clock-outline'
                        : 'close-circle'
                  }
                  size={46}
                  color={ripenessColors[modalResult.ripeness]}
                  style={styles.resultModalIcon}
                />
                <Text style={[styles.resultModalTitle, { color: ripenessColors[modalResult.ripeness] }]}>
                  {modalResult.ripeness}
                </Text>
              </View>

              {/* Details */}
              <View style={styles.resultModalDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel]}>Ripeness:</Text>
                  <Text style={[styles.detailValue]}>
                    {modalResult.ripeness_percentage}%
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel]}>Health Class:</Text>
                  <Text style={[styles.detailValue]}>
                    {modalResult.health_class ? `Class ${modalResult.health_class} (${modalResult.health_percentage}%)` : 'Unknown'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel]}>Confidence:</Text>
                  <Text style={[styles.detailValue]}>
                    {modalResult.confidence}%
                  </Text>
                </View>
              {modalResult.market_grade && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel]}>Market Grade:</Text>
                    <Text style={[styles.detailValue]}>
                      {modalResult.market_grade}
                    </Text>
                  </View>
                )}
              </View>

              {(() => {
                const advice = getDetectionAdvice(modalResult);
                if (!advice) return null;
                const gradeColors = {
                  premium: colors.accent,
                  standard: colors.success,
                  commercial: colors.warning,
                  reject: colors.danger,
                };
                const accent = gradeColors[advice.gradeKey] || colors.primaryLight;
                const isRotten = modalResult?.ripeness?.toLowerCase() === 'rotten';
                const classInfo = getClassRipenessFromPercentage(modalResult?.ripeness_percentage);
                return (
                  <View style={[styles.adviceCard, { borderColor: accent, backgroundColor: accent + '12', marginHorizontal: 16, marginBottom: 20 }]}>
                    <View style={styles.adviceHeader}>
                      <View style={[styles.adviceBadge, { backgroundColor: accent + '26' }]}>
                        <MaterialCommunityIcons name="clipboard-text" size={18} color={accent} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.adviceTitle, { color: '#FFFFFF' }]}>
                          Analyzation Advice
                        </Text>
                        <Text style={[styles.adviceGrade, { color: accent }]}>
                          {advice.gradeLabel}
                        </Text>
                        {isRotten ? (
                          <Text style={[styles.adviceStatus, { color: colors.textLight }]}>
                            Class: Rotten
                          </Text>
                        ) : classInfo ? (
                          <Text style={[styles.adviceStatus, { color: colors.textLight }]}>
                            {`Class ${classInfo.letter}: ${classInfo.label}`}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {advice.tips.map((tip, index) => (
                      <View key={`${tip.label}-${index}`} style={styles.adviceItem}>
                        <View style={[styles.adviceDot, { backgroundColor: accent }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.adviceLabel, { color: '#FFFFFF' }]}>
                            {tip.label}
                          </Text>
                          <Text style={[styles.adviceText, { color: colors.textLight }]}>
                            {tip.text}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })()}

              {/* Action Buttons */}
              <View style={styles.resultModalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#E2554D20', borderColor: '#E2554D', borderWidth: 1.5 }]}
                  onPress={handleCancelResult}
                >
                  <Feather name="x" size={20} color="#E2554D" />
                  <Text style={[styles.modalButtonText, { color: '#E2554D' }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#2BB673' }]}
                  onPress={handleSaveResult}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Feather name="check" size={20} color="#FFFFFF" />
                  )}
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                    {saving ? 'Saving...' : 'Save Result'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </Modal>
      )}
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
    paddingVertical: 16,
    zIndex: 10,
    shadowColor: '#0E3B2E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  permissionHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
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
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 14,
    textAlign: 'center',
    color: '#0E3B2E',
  },
  permissionDescription: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 32,
    color: '#5A6B63',
  },
  featuresList: {
    width: '100%',
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
  },
  platformNote: {
    fontSize: 13,
    marginTop: 28,
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
    color: '#5A6B63',
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0E3B2E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
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
  },
  subtitle: {
    fontSize: 15,
    color: '#5A6B63',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0E3B2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
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
    backgroundColor: `#0E3B2EE6`,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF10',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resultOverlay: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: '#000000E6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    borderLeftWidth: 5,
    zIndex: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ripenessLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorOverlay: {
    position: 'absolute',
    top: 80,
    left: 14,
    right: 14,
    flexDirection: 'row',
    backgroundColor: '#E2554DE6',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
    zIndex: 5,
    shadowColor: '#E2554D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#FFFFFF',
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
    transform: [{ translateX: -50 }],
    alignItems: 'center',
    gap: 16,
    zIndex: 5,
    backgroundColor: '#000000CC',
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  analyzeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0E3B2EF2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF10',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  sheetHandleBar: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF40',
  },
  statusSection: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
    opacity: 0.8,
    marginTop: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  resultsSection: {
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  resultsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF12',
    borderWidth: 1,
    borderColor: '#FFFFFF1A',
  },
  resultsToggleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  resultCard: {
    borderLeftWidth: 5,
    padding: 13,
    borderRadius: 11,
    backgroundColor: '#FFFFFF15',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  resultCardHeader: {
    marginBottom: 8,
  },
  resultCardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  resultCardValue: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },
  resultCardSubText: {
    fontSize: 12,
    fontWeight: '600',
  },
  adviceCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    backgroundColor: '#FFFFFF12',
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  adviceBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  adviceGrade: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  adviceStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  adviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  adviceLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  adviceText: {
    fontSize: 12,
    lineHeight: 18,
  },
  objectsList: {
    gap: 5,
  },
  objectItem: {
    fontSize: 13,
    fontWeight: '600',
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
    paddingHorizontal: 10,
    paddingVertical: 14,
    marginTop: 12,
  },
  controlButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F1A16',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  resultModalHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  resultModalIcon: {
    marginBottom: 8,
  },
  resultModalTitle: {
    fontSize: 28,
    fontWeight: '900',
  },
  resultModalDetails: {
    marginHorizontal: 16,
    gap: 14,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF20',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CB3A8',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F3F7F4',
  },
  resultModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    fontWeight: '800',
    fontSize: 15,
  },
});






