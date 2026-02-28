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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import MobileHeader from '../../shared/MobileHeader';
import { getUser } from '../../utils/helper';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [bungaDetections, setBungaDetections] = useState([]);
  const [otherObjects, setOtherObjects] = useState([]);
  const [imageSize, setImageSize] = useState(null);
  const drawerSlideAnim = useRef(new Animated.Value(-280)).current;

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const colors = {
    primary: '#1B4D3E',
    primaryDark: '#0D2818',
    primaryLight: '#27AE60',
    secondary: '#FFFFFF',
    background: '#F8FAF7',
    text: '#1B4D3E',
    textLight: '#5A7A73',
    border: '#D4E5DD',
    accent: '#D4AF37',
    warning: '#F39C12',
    danger: '#E74C3C',
    success: '#27AE60',
  };

  // Ripeness recommendations
  const ripenessRecommendations = {
    'Ripe': {
      icon: '🟢',
      title: 'Bunga is Ripe',
      description: 'Your black pepper bunga has reached optimal ripeness for harvesting.',
      actions: [
        'Harvest immediately for best flavor',
        'Use sharp pruning shears to avoid damage',
        'Store in cool, dry place',
        'Process or dry within 24 hours'
      ],
      color: colors.success
    },
    'Unripe': {
      icon: '🟡',
      title: 'Bunga Not Yet Ripe',
      description: 'The bunga requires more time to reach full ripeness.',
      actions: [
        'Wait 5-7 more days before harvesting',
        'Ensure adequate water and nutrients',
        'Protect from birds and pests',
        'Check daily for color change'
      ],
      color: colors.warning
    },
    'Rotten': {
      icon: '🔴',
      title: 'Bunga is Rotten',
      description: 'The bunga has deteriorated and is no longer usable.',
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
  const getMarketGrade = (classStr) => {
    if (!classStr) return null;
    
    // Check for Reject - Rotten, C-d, D-d
    if (classStr.toLowerCase() === 'rotten') {
      return {
        grade: 'Reject',
        icon: '❌',
        color: '#E74C3C',
        title: 'Reject Grade',
        description: 'This bunga is rotten and should not be processed or sold. Remove immediately to prevent contamination.',
        actions: [
          'Remove from harvest immediately',
          'Do not process or dry',
          'Prevent spread to other bunches',
          'Improve storage and ventilation conditions'
        ]
      };
    }
    
    const match = classStr.match(/Class\s*([A-D])-([a-d])/);
    if (!match) return null;
    
    const ripenessLetter = match[1]; // A, B, C, or D
    const healthLetter = match[2];   // a, b, c, or d
    
    // Reject: C-d, D-d
    if ((ripenessLetter === 'C' && healthLetter === 'd') ||
        (ripenessLetter === 'D' && healthLetter === 'd')) {
      return {
        grade: 'Reject',
        icon: '❌',
        color: '#E74C3C',
        title: 'Reject Grade',
        description: 'This bunga is not suitable for processing. Quality is too low for any commercial use.',
        actions: [
          'Do not harvest or process',
          'Wait for better development',
          'Remove defective bunches',
          'Improve care and growing conditions'
        ]
      };
    }
    
    // Premium: A-a
    if (ripenessLetter === 'A' && healthLetter === 'a') {
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
    
    // Standard: A-b, B-a, B-b
    if ((ripenessLetter === 'A' && healthLetter === 'b') ||
        (ripenessLetter === 'B' && (healthLetter === 'a' || healthLetter === 'b'))) {
      return {
        grade: 'Standard',
        icon: '✅',
        color: '#27AE60',
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
    
    // Commercial: A-c, A-d, B-c, B-d, C-a, C-b, C-c, D-a, D-b, D-c
    if ((ripenessLetter === 'A' && (healthLetter === 'c' || healthLetter === 'd')) ||
        (ripenessLetter === 'B' && (healthLetter === 'c' || healthLetter === 'd')) ||
        (ripenessLetter === 'C' && (healthLetter === 'a' || healthLetter === 'b' || healthLetter === 'c')) ||
        (ripenessLetter === 'D' && (healthLetter === 'a' || healthLetter === 'b' || healthLetter === 'c'))) {
      
      // Customize description based on ripeness
      let description = '';
      if (ripenessLetter === 'A' || ripenessLetter === 'B') {
        description = 'Ripe with maximum taste profile but lower health quality. Ready to dry but quality is reduced due to health issues.';
      } else {
        description = 'Ready to dry but taste and spice profile is lacking. Lower quality for commercial use. Consider additional ripening for better results.';
      }
      
      return {
        grade: 'Commercial',
        icon: '📦',
        color: '#F39C12',
        title: 'Commercial Grade',
        description: description,
        actions: [
          'Can be dried for commercial use',
          'Acceptable for bulk markets',
          'Lower quality than Premium or Standard',
          'Suitable for industrial applications'
        ]
      };
    }
    
    return null;
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

      console.log('🖼️ Launching image picker on iOS...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      console.log('🖼️ Gallery result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('🖼️ Asset:', asset);
        
        if (asset.uri) {
          setImageUri(asset.uri);
          setImage(asset);
          setError(null);
          setResult(null);
          console.log('✅ Gallery selection successful:', asset.uri);
        }
      } else {
        console.log('⚠️ Gallery canceled by user');
      }
    } catch (err) {
      console.error('❌ Full gallery error:', err);
      console.error('❌ Error code:', err?.code);
      console.error('❌ Error message:', err?.message);
      
      if (err?.code === 'E_PICKER_CANCELLED') {
        console.log('⚠️ User cancelled gallery');
      } else if (err?.code === 'E_PERMISSION_MISSING' || err?.message?.includes('permission')) {
        setError('❌ Photo library permission denied.\n\nGo to Settings > PiperSmart > Photos');
      } else {
        setError('❌ Failed to pick image.\n\nError: ' + (err?.message || 'Unknown error'));
      }
    }
  };

  const pickImageFromCamera = async () => {
    try {
      // Request camera permission
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      console.log('� Device Info - iOS');
      console.log('🔐 Camera permission status:', cameraPermission.status);
      console.log('🔐 Permission details:', cameraPermission);
      
      if (cameraPermission.status !== 'granted') {
        setError('❌ Camera permission required.\n\nGo to Settings > PiperSmart > Camera and enable it.');
        console.warn('Camera permission denied:', cameraPermission.status);
        return;
      }

      console.log('📸 Launching camera on iOS...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      console.log('📸 Camera result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('📸 Asset:', asset);
        
        if (asset.uri) {
          setImageUri(asset.uri);
          setImage(asset);
          setError(null);
          setResult(null);
          console.log('✅ Camera capture successful:', asset.uri);
        }
      } else {
        console.log('⚠️ Camera canceled by user');
      }
    } catch (err) {
      console.error('❌ Full camera error:', err);
      console.error('❌ Error code:', err?.code);
      console.error('❌ Error message:', err?.message);
      console.error('❌ Error domain:', err?.domain);
      
      if (err?.code === 'E_PICKER_CANCELLED') {
        console.log('⚠️ User cancelled camera');
      } else if (err?.code === 'E_CAMERA_UNAVAILABLE') {
        setError('❌ Camera not available.\n\nCheck if another app is using the camera.');
      } else if (err?.code === 'E_PERMISSION_MISSING' || err?.message?.includes('permission')) {
        setError('❌ Camera permission denied.\n\nGo to Settings > PiperSmart > Camera');
      } else if (err?.message?.includes('Camera')) {
        setError('❌ Camera error.\n\nTry restarting the app or device.');
      } else {
        setError('❌ Failed to open camera on iOS.\n\nError: ' + (err?.message || 'Unknown error'));
      }
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
      const token = axios.defaults.headers.common['Authorization'];
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setAnalyzing(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || `bunga_${Date.now()}.jpg`;
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      });

      console.log('📤 Analyzing bunga image...');

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/predict/bunga-with-objects`,
        formData,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 120s timeout (COCO model needs time to load into memory even after first run)
        }
      );

      console.log('✅ Result:', response.data);
      
      // Process confidence
      let processedResult = response.data;
      if (processedResult.ripeness_confidence) {
        let conf = Number(processedResult.ripeness_confidence);
        while (conf > 100) {
          conf = conf / 10;
        }
        if (conf < 1) {
          conf = conf * 100;
        }
        processedResult.ripeness_confidence = Math.round(conf * 100) / 100;
      }
      
      console.log(`✅ ${processedResult.class || processedResult.ripeness} - Health Class ${processedResult.health_class} (${processedResult.health_percentage}%)`);
      
      // Extract data
      setBungaDetections(processedResult.bunga_detections || []);
      setOtherObjects(processedResult.other_objects || []);
      setImageSize(processedResult.image_size || null);
      
      setResult(processedResult);
    } catch (err) {
      console.error('❌ Error:', err.message);
      
      // Check response error first (higher priority)
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 401) {
        setError('Authentication failed');
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Request timeout. First run may take 1-2 minutes while models initialize. Try again.');
      } else {
        setError(err.response?.data?.error || err.message || 'Analysis failed');
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
    setBungaDetections([]);
    // setOtherObjects([]);
    setImageSize(null);
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
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
      <View style={[styles.modeSelector, { backgroundColor: colors.primary }]}>
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
            color={analysisMode === 'standard' ? colors.accent : '#FFFFFF'} 
          />
          <Text style={[styles.modeButtonText, analysisMode === 'standard' && { color: colors.accent }]}>
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
            color={analysisMode === 'realtime' ? colors.accent : '#FFFFFF'} 
          />
          <Text style={[styles.modeButtonText, analysisMode === 'realtime' && { color: colors.accent }]}>
            Real-time
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={[styles.headerSection, { backgroundColor: colors.primary }]}>
          <Feather name="alert-circle" size={32} color={colors.accent} />
          <Text style={styles.headerTitle}>Bunga Ripeness Detection</Text>
          <Text style={styles.headerSubtitle}>
            Analyze the ripeness of your black pepper bunches for optimal harvest timing
          </Text>
        </View>

        {/* Image Selection Section */}
        <View style={[styles.imageSection, { borderColor: colors.border }]}>
          {imageUri ? (
            <>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.selectedImage}
                />
                {/* Bounding Box Overlay */}
                {bungaDetections.length > 0 && (
                  <BoundingBoxOverlay
                    imageSize={imageSize}
                    bungaDetections={bungaDetections}
                    containerSize={{ 
                      width: width - 32, 
                      height: 250 
                    }}
                    colors={colors}
                  />
                )}
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
            <>
              <MaterialCommunityIcons 
                name="image-plus" 
                size={48} 
                color={colors.textLight} 
              />
              <Text style={[styles.placeholderText, { color: colors.textLight }]}>
                No image selected
              </Text>
              <Text style={[styles.placeholderSubtext, { color: colors.border }]}>
                Select an image of your black pepper bunga
              </Text>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.primary,
              flex: 1,
              marginRight: 8
            }]}
            onPress={pickImageFromCamera}
            disabled={analyzing}
          >
            <Feather name="camera" size={20} color={colors.secondary} />
            <Text style={styles.actionButtonText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.primary,
              flex: 1,
              marginLeft: 8
            }]}
            onPress={pickImageFromGallery}
            disabled={analyzing}
          >
            <Feather name="image" size={20} color={colors.secondary} />
            <Text style={styles.actionButtonText}>Gallery</Text>
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
            <>
              <ActivityIndicator size="small" color={colors.secondary} />
              <Text style={styles.analyzeButtonText}>Analyzing...</Text>
            </>
          ) : (
            <>
              <Feather name="zap" size={20} color={colors.secondary} />
              <Text style={styles.analyzeButtonText}>Analyze Ripeness</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Error Display */}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.danger + '15', borderColor: colors.danger }]}>
            <Feather name="alert-circle" size={20} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Results Section */}
        {result && (
          <View style={[styles.resultSection, { borderColor: colors.border }]}>
            {/* Not a Black Pepper Warning */}
            {result.is_black_pepper === false && (
              <View style={[styles.warningBox, { backgroundColor: colors.danger + '20', borderColor: colors.danger }]}>
                <Feather name="alert-triangle" size={24} color={colors.danger} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.warningTitle, { color: colors.danger }]}>
                    ❌ Invalid Image
                  </Text>
                  <Text style={[styles.warningText, { color: colors.text }]}>
                    {result.error || 'This does not appear to be a black pepper bunga.'}
                  </Text>
                  <Text style={[styles.warningSubtext, { color: colors.textLight }]}>
                    {result.message || 'Please take a clear photo of a black pepper bunch and try again.'}
                  </Text>
                </View>
              </View>
            )}

            {/* Normal Results Display (only if valid pepper) */}
            {result.is_black_pepper !== false && (
              <>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultPrediction}>
                    {ripenessRecommendations[result.ripeness]?.icon || '?'} 
                    {result.ripeness || 'Unknown'}
                  </Text>
                </View>
                
                {result.class && !result.class.toLowerCase().includes('rotten') && (
                  <View>
                    {(() => {
                      // Parse class like "Class A-a" to extract ripeness letter
                      const classMatch = result.class.match(/Class\s*([A-D])-([a-d])/)
                      const ripenessLetter = classMatch ? classMatch[1] : null;
                      const healthLetter = classMatch ? classMatch[2] : null;
                      
                      // Map ripeness letter to percentage range
                      const ripenessRanges = {
                        'A': '76-100%',
                        'B': '51-75%',
                        'C': '26-50%',
                        'D': '0-25%'
                      };
                      
                      const ripenessRange = ripenessLetter ? ripenessRanges[ripenessLetter] : 'Unknown';
                      
                      return (
                        <>
                          <Text style={[styles.resultPrediction, { fontSize: 14, marginTop: 6, color: colors.textLight }]}>
                            {result.ripeness_percentage 
                              ? `Ripeness ${result.ripeness_percentage}%`
                              : `Ripeness at ${ripenessRange}`}
                          </Text>
                          {result.health_percentage !== undefined && (
                            <Text style={[styles.resultPrediction, { fontSize: 14, marginTop: 4, color: colors.textLight }]}>
                              Health {result.health_percentage}%
                            </Text>
                          )}
                        </>
                      );
                    })()}
                  </View>
                )}

                {/* Confidence Score */}
                {result.ripeness_confidence && !result.class?.toLowerCase().includes('rotten') && (
                  <View style={[styles.confidenceBox, { backgroundColor: colors.background }]}>
                    <Text style={[styles.confidenceLabel, { color: colors.textLight }]}>
                      Detection Confidence
                    </Text>
                    <View style={styles.confidenceBar}>
                      <View 
                        style={[
                          styles.confidenceBarFill,
                          { 
                            width: `${result.ripeness_confidence}%`,
                            backgroundColor: 
                              result.ripeness_confidence > 80 ? colors.success : 
                              result.ripeness_confidence > 60 ? colors.warning : 
                              colors.danger
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.confidenceValue, { color: colors.text }]}>
                      {Math.round(result.ripeness_confidence)}%
                    </Text>
                  </View>
                )}

                {/* Market Grading Card */}
                {(() => {
                  const marketGrade = getMarketGrade(result.class);
                  if (!marketGrade) return null;
                  return (
                    <View style={[styles.gradeBox, { backgroundColor: marketGrade.color + '20', borderColor: marketGrade.color, borderWidth: 2 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 32, marginRight: 12 }}>{marketGrade.icon}</Text>
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
        <View style={[styles.tipsSection, { backgroundColor: colors.primaryLight + '10' }]}>
          <View style={styles.tipsHeader}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color={colors.primaryLight} />
            <Text style={[styles.tipsTitle, { color: colors.primary }]}>
              Tips for Best Results
            </Text>
          </View>
          
          <Text style={[styles.tipItem, { color: colors.text }]}>
            • Take clear photos in natural daylight
          </Text>
          <Text style={[styles.tipItem, { color: colors.text }]}>
            • Ensure the entire bunga is visible in the frame
          </Text>
          <Text style={[styles.tipItem, { color: colors.text }]}>
            • Avoid shadows and reflections
          </Text>
          <Text style={[styles.tipItem, { color: colors.text }]}>
            • Keep the camera at a 45-degree angle to the bunga
          </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  modeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#E0E0E0',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  imageSection: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 250,
  },
  selectedImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  placeholderSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  errorBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    marginLeft: 12,
  },
  warningText: {
    fontSize: 14,
    marginLeft: 12,
    marginBottom: 4,
    flex: 1,
    fontWeight: '600',
  },
  warningSubtext: {
    fontSize: 12,
    marginLeft: 12,
    flex: 1,
  },
  resultSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  resultHeader: {
    marginBottom: 16,
  },
  resultPrediction: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  confidenceBox: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  gradeBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  gradeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  gradeSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  gradeDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  recommendationBox: {
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  recommendationDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  actionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    marginTop: 6,
  },
  actionText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  infoBox: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  tipItem: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
});
