import React, { useState, useRef, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import MobileHeader from '../../shared/MobileHeader';
import { getUser } from '../../utils/helpers';
import { BACKEND_URL } from 'react-native-dotenv';
import RealtimeBungaAnalyzer from './RealtimeBungaAnalyzer';
import BoundingBoxOverlay from './BoundingBoxOverlay';

const { width } = Dimensions.get('window');

export default function BungaRipenessScreen({ navigation }) {
  const [analysisMode, setAnalysisMode] = useState('standard'); // 'standard' or 'realtime'
  const [image, setImage] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [noBungaMessage, setNoBungaMessage] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [bungaDetections, setBungaDetections] = useState([]);
  const [otherObjects, setOtherObjects] = useState([]);
  const [imageSize, setImageSize] = useState(null);
  const drawerSlideAnim = useRef(new Animated.Value(-280)).current;
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const scrollViewRef = useRef(null);
  const resultSectionY = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!result || !scrollViewRef.current || resultSectionY.current == null) return;
    const y = Math.max(resultSectionY.current - 12, 0);
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y, animated: true });
    }, 50);
    return () => clearTimeout(timer);
  }, [result]);

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

  // Ripeness recommendations
  const ripenessRecommendations = {
    'Ripe': {
      iconName: 'check-circle',
      title: 'Peppercorn is Ripe',
      description: 'Your black pepper peppercorn has reached optimal ripeness for harvesting.',
      actions: [
        'Harvest immediately for best flavor',
        'Use sharp pruning shears to avoid damage',
        'Store in cool, dry place',
        'Process or dry within 24 hours'
      ],
      color: colors.success
    },
    'Unripe': {
      iconName: 'clock-outline',
      title: 'Peppercorn Not Yet Ripe',
      description: 'The peppercorn requires more time to reach full ripeness.',
      actions: [
        'Wait 5-7 more days before harvesting',
        'Ensure adequate water and nutrients',
        'Protect from birds and pests',
        'Check daily for color change'
      ],
      color: colors.warning
    },
    'Rotten': {
      iconName: 'close-circle',
      title: 'Peppercorn is Rotten',
      description: 'The peppercorn has deteriorated and is no longer usable.',
      actions: [
        'Remove immediately to prevent disease spread',
        'Do not attempt to process or dry',
        'Inspect nearby bunches for signs of rot',
        'Improve ventilation to prevent future rot'
      ],
      color: colors.danger
    }
  };

  // Market grading logic
  const getMarketGrade = (ripeness, healthClass) => {
    if (!ripeness) return null;
    
    // Check for Reject - Rotten
    if (ripeness.toLowerCase() === 'rotten') {
      return {
        grade: 'Reject',
        icon: '❌',
        color: '#E2554D',
        title: 'Reject Grade',
        description: 'This peppercorn is rotten and should not be processed or sold. Remove immediately to prevent contamination.',
        actions: [
          'Remove from harvest immediately',
          'Do not process or dry',
          'Prevent spread to other bunches',
          'Improve storage and ventilation conditions'
        ]
      };
    }

    // If no health class, can't determine grade
    if (!healthClass) return null;

    const ripenessLetter = ripeness === 'Ripe' ? 'A' : 'C';  // Simplified mapping for frontend
    const healthLetter = healthClass.toLowerCase();

    // Reject: C-d, D-d
    if ((ripenessLetter === 'C' && healthLetter === 'd')) {
      return {
        grade: 'Reject',
        icon: '❌',
        color: '#E2554D',
        title: 'Reject Grade',
        description: 'This peppercorn is not suitable for processing. Quality is too low for any commercial use.',
        actions: [
          'Do not harvest or process',
          'Wait for better development',
          'Remove defective bunches',
          'Improve care and growing conditions'
        ]
      };
    }

    // Premium: Ripe with health a
    if (ripeness === 'Ripe' && healthLetter === 'a') {
      return {
        grade: 'Premium',
        icon: '⭐',
        color: '#FFD700',
        title: 'Premium Grade',
        description: 'Fully and perfectly ripe with excellent aroma and spice profile. Ready for immediate drying with highest market value.',
        actions: [
          'Harvest and dry immediately for premium quality',
          'Will produce the finest and most aromatic pepper',
          'Perfect for specialty markets and export',
          'Excellent yield and spice intensity'
        ]
      };
    }

    // Standard: Ripe with health b, or Unripe with health a/b
    if ((ripeness === 'Ripe' && healthLetter === 'b') ||
        (ripeness === 'Unripe' && (healthLetter === 'a' || healthLetter === 'b'))) {
      return {
        grade: 'Standard',
        icon: '✅',
        color: '#2BB673',
        title: 'Standard Grade',
        description: 'Ready to dry and good for sale. Suitable for immediate drying and market distribution. Good quality for commercial sale.',
        actions: [
          'Ready to harvest and dry',
          'Good for immediate market sale',
          'Reliable taste and quality',
          'Standard commercial grade pepper'
        ]
      };
    }

    // Commercial: Everything else
    return {
      grade: 'Commercial',
      icon: '📦',
      color: '#F2A93B',
      title: 'Commercial Grade',
      description: ripeness === 'Ripe' 
        ? 'Ripe with maximum taste profile but lower health quality. Ready to dry but quality is reduced due to health issues.'
        : 'Ready to dry but taste and spice profile is lacking. Lower quality for commercial use. Consider additional ripening for better results.',
      actions: [
        'Can be dried for commercial use',
        'Acceptable for bulk markets',
        'Lower quality than Premium or Standard',
        'Suitable for industrial applications'
      ]
    };
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
    const healthLetterMatch = String(analysisResult.health_class || '')
      .toLowerCase()
      .match(/[a-d]/);
    const healthLetter = healthLetterMatch ? healthLetterMatch[0] : '';
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

  const gradeIconMap = {
    Reject: 'close-octagon',
    Premium: 'star-circle',
    Standard: 'check-decagram',
    Commercial: 'package-variant',
  };

  // Get market grade for current result

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
      // Request camera roll/media library permission
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('🔐 Camera roll permission status:', mediaPermission.status);
      console.log('🔐 Permission details:', mediaPermission);
      
      if (mediaPermission.status !== 'granted') {
        setError('❌ Photo library permission required.\n\nGo to Settings > PiperSmart > Photos');
        console.warn('Camera roll permission denied:', mediaPermission.status);
        return;
      }

      const platformName = Platform.OS === 'ios' ? 'iOS' : 'Android';
      console.log(`🖼️ Launching image picker on ${platformName}...`);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,  // Disable EXIF to prevent date issues
      });

      console.log('🖼️ Gallery result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log(`🖼️ [${platformName}] Asset:`, {
          uri: asset.uri?.substring(0, 50),
          width: asset.width,
          height: asset.height,
          type: asset.type,
          fileName: asset.fileName,
        });
        
        if (asset.uri) {
          setImageUri(asset.uri);
          setImage(asset);
          setError(null);
          setResult(null);
          setNoBungaMessage(null);
          console.log('✅ Gallery selection successful:', asset.uri);
        }
      } else {
        console.log('⚠️ Gallery canceled by user');
      }
    } catch (err) {
      console.error('❌ Full gallery error:', err);
      console.error('❌ Error code:', err?.code);
      console.error('❌ Error message:', err?.message);
      console.error('❌ Error name:', err?.name);
      
      // Handle specific date-related errors
      if (err?.message?.includes('Date') || err?.message?.includes('date') || err?.name === 'RangeError') {
        console.warn('⚠️ Image metadata date issue - selecting without metadata');
        setError('❌ Image has invalid metadata.\n\nTry a different photo or take a new one with the camera.');
      } else if (err?.code === 'E_PICKER_CANCELLED') {
        console.log('⚠️ User cancelled gallery');
      } else if (err?.code === 'E_PERMISSION_MISSING' || err?.message?.includes('permission')) {
        setError('❌ Photo library permission denied.\n\nGo to Settings > PiperSmart > Photos');
      } else {
        setError('❌ Failed to pick image.\n\nError: ' + (err?.message || 'Unknown error'));
      }
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
        name: `bunga_${Date.now()}.jpg`,
      };

      setImageUri(asset.uri);
      setImage(asset);
      setError(null);
      setResult(null);
      setNoBungaMessage(null);
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
    setNoBungaMessage(null);

    try {
      const token = axios.defaults.headers.common['Authorization'];
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setAnalyzing(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || `bunga_${Date.now()}.jpg`;
      
      // Platform-specific debug info
      const platformName = Platform.OS === 'ios' ? 'iOS' : 'Android';
      console.log(`\n📱 Platform: ${platformName}`);
      console.log(`   URI Format: ${imageUri.substring(0, 50)}...`);
      
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      });
      formData.append('platform', Platform.OS);
      formData.append('device', Platform.OS);

      // LOG: Confirm image is being sent
      const timestamp = new Date().toISOString();
      const requestId = `bunga_${Date.now()}`;
      console.log(`\n🟢 [${requestId}] BUNGA IMAGE TRANSMISSION STARTED`);
      console.log(`   ⏰ Timestamp: ${timestamp}`);
      console.log(`   📤 Filename: ${filename}`);
      console.log(`   📱 Platform: ${platformName}`);
      console.log(`   🔐 Token present: ${token ? '✅ YES' : '❌ NO'}`);
      console.log(`   📍 Target URL: ${BACKEND_URL}/api/v1/predict/bunga-with-objects`);
      console.log(`   ⏱️ Timeout: 120000ms`);

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/predict/bunga-with-objects`,
        formData,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data',
            'X-Platform': Platform.OS,
            'X-Device': Platform.OS,
          },
          timeout: 120000, // 120s timeout (COCO model needs time to load into memory even after first run)
        }
      );

      // LOG: Confirm image received and response got back
      console.log(`\n✅ [${requestId}] BUNGA IMAGE TRANSMISSION SUCCESSFUL`);
      console.log(`   📥 Response received from backend`);
      console.log(`   ⏱️ Total request time: ${Date.now() - parseInt(requestId.split('_')[1])}ms`);
      console.log(`   📱 From ${platformName}`);
      console.log('✅ Backend result:', response.data);
      
      // Check if backend returned a failure response
      if (response.data.error || response.data.success === false) {
        const backendError = response.data.error || 'Analysis failed';
        console.error('Backend returned error:', backendError);
        if (backendError.toLowerCase().includes('no black pepper bunga')) {
          setNoBungaMessage('No black pepper bunga detected in the image.');
          setError(null);
          setResult(null);
          setBungaDetections([]);
          setOtherObjects([]);
          setImageSize(null);
          setAnalyzing(false);
          return;
        }
        setError(backendError);
        setAnalyzing(false);
        return;
      }
      
      console.log('📦 Full response data:', response.data);
      
      // Process confidence
      let processedResult = { ...response.data };
      if (processedResult.confidence) {
        let conf = Number(processedResult.confidence);
        while (conf > 100) {
          conf = conf / 10;
        }
        if (conf < 1) {
          conf = conf * 100;
        }
        processedResult.confidence = Math.round(conf * 100) / 100;
      }
      
      console.log(`✅ ${processedResult.ripeness} - Health Class ${processedResult.health_class} (${processedResult.health_percentage}%)`);
      console.log('📊 Processed result:', processedResult);
      
      // Extract data (bunga_detections and other_objects no longer returned by backend, default to empty)
      setBungaDetections([]);
      setOtherObjects([]);
      setImageSize(processedResult.image_size || null);
      
      // Set the result to display
      setResult(processedResult);
      console.log('✅ Result state updated with:', processedResult);
    } catch (err) {
      console.error('❌ Full error object:', err);
      console.error('❌ Error type:', err.constructor.name);
      console.error('❌ Error message:', err.message);
      console.error('❌ Response status:', err.response?.status);
      console.error('❌ Response data:', err.response?.data);
      
      // Check response error first (higher priority)
      if (err.response?.data?.error) {
        console.error('Setting error from response.data.error:', err.response.data.error);
        const backendError = err.response.data.error;
        if (backendError.toLowerCase().includes('no black pepper bunga')) {
          setNoBungaMessage('No black pepper bunga detected in the image.');
          setError(null);
          setResult(null);
          setBungaDetections([]);
          setOtherObjects([]);
          setImageSize(null);
          return;
        }
        setError(backendError);
      } else if (err.response?.status === 401) {
        setError('Authentication failed');
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Request timeout. First run may take 1-2 minutes while models initialize. Try again.');
      } else {
        const errorMsg = err.response?.data?.error || err.message || 'Analysis failed';
        console.error('Setting error:', errorMsg);
        setError(errorMsg);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClearImage = () => {
    setImage(null);
    setImageUri(null);
    setResult(null);
    setError(null);
    setNoBungaMessage(null);
    setBungaDetections([]);
    // setOtherObjects([]);
    setImageSize(null);
    setCameraOpen(false);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          // ⚡ Fast logout - immediate response (backend call happens in background)
          logout(navigation);
        },
        style: 'destructive',
      },
    ]);
  };

  // Show real-time analyzer if in realtime mode
  if (analysisMode === 'realtime') {
    return <RealtimeBungaAnalyzer navigation={navigation} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <MobileHeader
        navigation={navigation}
        drawerOpen={drawerOpen}
        openDrawer={openDrawer}
        closeDrawer={closeDrawer}
        drawerSlideAnim={drawerSlideAnim}
        user={user}
        onLogout={handleLogout}
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
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.heroWrap}>
          <View style={styles.heroGlow} />
          <View style={styles.heroRing} />
          <View style={[styles.headerSection, { backgroundColor: colors.primary }]}>
            <Image 
              source={require('../../../../picsbl/logowalangbg.png')} 
              style={styles.logoImage}
            />
            <Text style={styles.headerTitle}>PepperCorn Analysis</Text>
            <Text style={styles.headerSubtitle}>
              Analyze the ripeness of your black pepper bunches for optimal harvest timing
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionKicker}>Step 1</Text>
          <Text style={styles.sectionTitle}>Upload Peppercorn Image</Text>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="camera" size={20} color={colors.secondary} />
                  <Text style={styles.captureButtonText}>Capture Photo</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : imageUri && imageUri !== '' ? (
            <View style={{ width: '100%' }}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.selectedImage}
                  onError={(e) => {
                    console.error('Image load error:', e.nativeEvent?.error);
                    setError('Failed to load image. Try selecting again.');
                  }}
                  onLoadStart={() => console.log('Image loading...')}
                  onLoadEnd={() => console.log('Image loaded successfully')}
                />
                {/* Bounding Box Overlay */}
                {bungaDetections.length > 0 && (
                  <BoundingBoxOverlay
                    imageSize={imageSize}
                    bungaDetections={bungaDetections}
                    containerSize={{
                      width: width - 32,
                      height: 260
                    }}
                    colors={colors}
                  />
                )}
              </View>
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: colors.danger }]}
                onPress={handleClearImage}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="x" size={20} color={colors.secondary} />
                  <Text style={styles.clearButtonText}>Clear Image</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons
                name="image-plus"
                size={48}
                color={colors.textLight}
              />
              <Text style={[styles.placeholderText, { color: colors.textLight }]}>
                No image selected
              </Text>
              <Text style={[styles.placeholderSubtext, { color: colors.textLight }]}>
                Select an image of your black pepper peppercorn
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
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name={cameraOpen ? "x" : "camera"} size={20} color={colors.secondary} />
              <Text style={styles.actionButtonText}>{cameraOpen ? "Close Camera" : "Open Camera"}</Text>
            </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="image" size={20} color={colors.secondary} />
              <Text style={styles.actionButtonText}>Gallery</Text>
            </View>
          </TouchableOpacity>
        </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color={colors.secondary} />
              <Text style={styles.analyzeButtonText}>Analyzing...</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="zap" size={20} color={colors.secondary} />
              <Text style={styles.analyzeButtonText}>Analyze Ripeness</Text>
            </View>
          )}
        </TouchableOpacity>

        {noBungaMessage && !error && (
          <View style={[styles.infoBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="info" size={20} color={colors.accent} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {noBungaMessage}
              </Text>
            </View>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.danger + '15', borderColor: colors.danger }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="alert-circle" size={20} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {error}
              </Text>
            </View>
          </View>
        )}

        {/* Results Section */}
        {result && (
          <View
            style={[styles.resultSection, { borderColor: colors.border }]}
            onLayout={(event) => {
              resultSectionY.current = event.nativeEvent.layout.y;
            }}
          >
            <View style={[styles.resultAccent, { backgroundColor: colors.accent }]} />
            {/* Not a Black Pepper Warning */}
            {result.is_black_pepper === false && (
              <View style={[styles.warningBox, { backgroundColor: colors.danger + '20', borderColor: colors.danger }]}>
                <View style={{ flexDirection: 'row' }}>
                  <Feather name="alert-triangle" size={24} color={colors.danger} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.warningTitle, { color: colors.danger }]}>
                      Invalid Image
                    </Text>
                    <Text style={[styles.warningText, { color: colors.text }]}>
                      {result.error || 'This does not appear to be a black pepper bunga.'}
                    </Text>
                    <Text style={[styles.warningSubtext, { color: colors.textLight }]}>
                      {result.message || 'Please take a clear photo of a black pepper bunch and try again.'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Normal Results Display (only if valid pepper) */}
            {result.is_black_pepper !== false && (
              <>
                <View style={styles.resultHeader}>
                  <View style={styles.resultTitleRow}>
                    <View
                      style={[
                        styles.resultBadge,
                        {
                          backgroundColor:
                            (ripenessRecommendations[result.ripeness]?.color || colors.border) + '22',
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={ripenessRecommendations[result.ripeness]?.iconName || 'information'}
                        size={18}
                        color={ripenessRecommendations[result.ripeness]?.color || colors.textLight}
                      />
                    </View>
                    <Text style={styles.resultPrediction}>
                      {result.ripeness || 'Unknown'}
                    </Text>
                  </View>
                </View>
                
                {result.ripeness && result.ripeness.toLowerCase() !== 'rotten' && (
                  <View>
                    {(() => {
                      return (
                        <View>
                          <Text style={[styles.resultPrediction, { fontSize: 14, marginTop: 6, color: colors.textLight }]}>
                            {result.ripeness_percentage ? `Ripeness ${result.ripeness_percentage}%` : `Ripeness: ${result.ripeness}`}
                          </Text>
                          {result.health_percentage && result.health_percentage > 0 && (
                            <Text style={[styles.resultPrediction, { fontSize: 14, marginTop: 4, color: colors.textLight }]}>
                              Health {result.health_percentage}%
                            </Text>
                          )}
                        </View>
                      );
                    })()}
                  </View>
                )}

                {/* Confidence Score */}
                {result.confidence && !result.ripeness?.toLowerCase().includes('rotten') && (
                  <View style={[styles.confidenceBox, { backgroundColor: colors.background }]}>
                    <Text style={[styles.confidenceLabel, { color: colors.textLight }]}>
                      Detection Confidence
                    </Text>
                    <View style={styles.confidenceBar}>
                      <View 
                        style={[
                          styles.confidenceBarFill,
                          { 
                            width: `${result.confidence}%`,
                            backgroundColor: 
                              result.confidence > 80 ? colors.success : 
                              result.confidence > 60 ? colors.warning : 
                              colors.danger
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.confidenceValue, { color: colors.text }]}>
                      {Math.round(result.confidence)}%
                    </Text>
                  </View>
                )}

                {/* Market Grading Card */}
                {(() => {
                  const marketGrade = getMarketGrade(result.ripeness, result.health_class);
                  if (!marketGrade) return null;
                  return (
                    <View style={[styles.gradeBox, { backgroundColor: marketGrade.color + '12', borderColor: marketGrade.color }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.resultBadge, { backgroundColor: marketGrade.color + '24', marginRight: 12 }]}>
                          <MaterialCommunityIcons
                            name={gradeIconMap[marketGrade.grade] || 'information'}
                            size={20}
                            color={marketGrade.color}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.gradeTitle, { color: marketGrade.color }]}>
                            {marketGrade.grade}
                          </Text>
                          <Text style={[styles.gradeSubtitle, { color: colors.text }]}>
                            {marketGrade.title}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.gradeDesc, { color: colors.textLight, marginTop: 12 }]}>
                        {marketGrade.description}
                      </Text>
                    </View>
                  );
                })()}

                {/* Recommendation */}
                {ripenessRecommendations[result.ripeness] && (
                  <View style={styles.recommendationBox}>
                    <Text style={[styles.recommendationTitle, { 
                      color: ripenessRecommendations[result.ripeness].color 
                    }]}>
                      {ripenessRecommendations[result.ripeness].title}
                    </Text>
                    
                    <Text style={[styles.recommendationDesc, { color: colors.textLight }]}>
                      {ripenessRecommendations[result.ripeness].description}
                    </Text>

                    <Text style={[styles.actionsTitle, { color: colors.text }]}>
                      Recommended Actions:
                    </Text>
                    
                    {ripenessRecommendations[result.ripeness].actions.map((action, index) => (
                      <View key={index} style={styles.actionItem}>
                        <View style={[styles.actionDot, { 
                          backgroundColor: ripenessRecommendations[result.ripeness].color 
                        }]} />
                        <Text style={[styles.actionText, { color: colors.text }]}>
                          {action}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Detection Advice */}
                {(() => {
                  const advice = getDetectionAdvice(result);
                  if (!advice) return null;
                  const gradeColors = {
                    premium: colors.accent,
                    standard: colors.success,
                    commercial: colors.warning,
                    reject: colors.danger,
                  };
                  const accent = gradeColors[advice.gradeKey] || colors.primary;
                  return (
                    <View style={[styles.adviceCard, { borderColor: accent, backgroundColor: accent + '10' }]}>
                      <View style={styles.adviceHeader}>
                        <View style={[styles.adviceBadge, { backgroundColor: accent + '22' }]}>
                          <MaterialCommunityIcons name="clipboard-text" size={18} color={accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.adviceTitle, { color: colors.text }]}>
                            Analyzation Advice
                          </Text>
                          <Text style={[styles.adviceGrade, { color: accent }]}>
                            {advice.gradeLabel}
                          </Text>
                          {(() => {
                            const isRotten = result?.ripeness?.toLowerCase() === 'rotten';
                            if (isRotten) {
                              return (
                                <Text style={[styles.adviceStatus, { color: colors.textLight }]}>
                                  Class: Rotten
                                </Text>
                              );
                            }
                            const classInfo = getClassRipenessFromPercentage(result?.ripeness_percentage);
                            if (!classInfo) return null;
                            return (
                              <Text style={[styles.adviceStatus, { color: colors.textLight }]}>
                                {`Class ${classInfo.letter}: ${classInfo.label}`}
                              </Text>
                            );
                          })()}
                        </View>
                      </View>
                      {advice.tips.map((tip, index) => (
                        <View key={`${tip.label}-${index}`} style={styles.adviceItem}>
                          <View style={[styles.adviceDot, { backgroundColor: accent }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.adviceLabel, { color: colors.text }]}>
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

                {/* Additional Info */}
                {result.additional_info && (
                  <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
                    <Feather name="info" size={18} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.textLight }]}>
                      {result.additional_info}
                    </Text>
                  </View>
                )}

                {/* Detection Info from YOLOv8 */}
                {result.detection_info && (
                  <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
                    <Feather name="target" size={18} color={colors.primary} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.infoText, { color: colors.text, fontWeight: '700', marginBottom: 6 }]}>
                        Detection Results
                      </Text>
                      <Text style={[styles.infoText, { color: colors.textLight }]}>
                        Bunches detected: {result.detection_info.detections_found}
                      </Text>
                      <Text style={[styles.infoText, { color: colors.textLight }]}>
                        Model confidence: {result.detection_info.yolo_confidence}%
                      </Text>
                      {result.detection_info.detected_classes && result.detection_info.detected_classes.length > 0 && (
                        <Text style={[styles.infoText, { color: colors.textLight }]}>
                          Classes: {result.detection_info.detected_classes.join(', ')}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Other Detected Objects */}
                {/* {otherObjects && otherObjects.length > 0 && (
                  <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
                    <Feather name="eye" size={18} color={colors.primary} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.infoText, { color: colors.text, fontWeight: '700', marginBottom: 8 }]}>
                        Other Objects Detected
                      </Text>
                      {otherObjects.map((obj, idx) => (
                        <View key={idx} style={{ marginBottom: 6 }}>
                          <Text style={[styles.infoText, { color: colors.text, fontWeight: '600' }]}>
                            {obj.class}
                          </Text>
                          <Text style={[styles.infoText, { color: colors.textLight, fontSize: 12 }]}>
                            Confidence: {obj.confidence}% • Count: {obj.count}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )} */}
              </>
            )}
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsHeader}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color={colors.primaryLight} />
            <Text style={[styles.tipsTitle, { color: colors.primary }]}>
              Tips for Best Results
            </Text>
          </View>

          {[
            'Take clear photos in natural daylight',
            'Ensure the entire peppercorn is visible in the frame',
            'Avoid shadows and reflections',
            'Keep the camera at a 45-degree angle to the peppercorn',
          ].map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primaryLight }]} />
              <Text style={[styles.tipItem, { color: colors.text }]}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  heroWrap: {
    paddingHorizontal: 4,
    marginBottom: 16,
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
  headerSection: {
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  logoImage: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 0,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
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
  placeholderText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    color: '#0E3B2E',
  },
  placeholderSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 14,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 14,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 22,
    shadowColor: '#2BB673',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  errorBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 18,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 18,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  warningBox: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  warningTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
    marginLeft: 12,
  },
  warningText: {
    fontSize: 15,
    marginLeft: 12,
    marginBottom: 6,
    flex: 1,
    fontWeight: '600',
  },
  warningSubtext: {
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  resultSection: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    marginBottom: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  resultAccent: {
    height: 6,
    borderRadius: 6,
    marginBottom: 14,
  },
  resultHeader: {
    paddingBottom: 12,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE8',
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultPrediction: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0E3B2E',
  },
  confidenceBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#F3F7F4',
    borderWidth: 1,
    borderColor: '#DDE7E1',
    borderLeftWidth: 4,
    borderLeftColor: '#F2A93B',
  },
  confidenceLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  confidenceBar: {
    height: 12,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
    marginBottom: 10,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  confidenceValue: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
    color: '#0E3B2E',
  },
  gradeBox: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDE7E1',
  },
  gradeTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  gradeSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  gradeDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  recommendationBox: {
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2BB673',
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 16,
    backgroundColor: '#EAF6F0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE7E1',
  },
  adviceCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  adviceBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceTitle: {
    fontSize: 16,
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
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  adviceText: {
    fontSize: 12,
    lineHeight: 18,
  },
  recommendationTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  recommendationDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 6,
  },
  actionText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#F3F7F4',
    borderWidth: 1,
    borderColor: '#DDE7E1',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 10,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  tipsSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE7E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
  },
  tipItem: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
});






