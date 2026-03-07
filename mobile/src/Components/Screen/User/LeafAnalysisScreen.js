import React, { useState, useRef } from 'react';
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
import { getUser, logout } from '../../utils/helpers';
import MobileHeader from '../../shared/MobileHeader';
import RealtimeLeafAnalyzer from './RealtimeLeafAnalyzer';
import { BACKEND_URL } from 'react-native-dotenv';

const { width } = Dimensions.get('window');

export default function LeafAnalysisScreen({ navigation }) {
  const [analysisMode, setAnalysisMode] = useState('standard'); // 'standard' or 'realtime'
  const [image, setImage] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const drawerSlideAnim = useRef(new Animated.Value(-280)).current;

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
        console.log('📸 NEW image from gallery - clearing previous result');
        setImageUri(asset.uri);
        setImage(asset);
        setError(null);
        setResult(null);
      }
    } catch (err) {
      setError('Failed to pick image from gallery');
      console.error(err);
    }
  };

  const pickImageFromCamera = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Camera permission denied. Enable it in Settings.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        console.log('📷 NEW image from camera - clearing previous result');
        setImageUri(asset.uri);
        setImage(asset);
        setError(null);
        setResult(null);
      }
    } catch (err) {
      setError('Failed to open camera');
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
          {imageUri ? (
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
            onPress={pickImageFromCamera}
            disabled={analyzing}
          >
            <Feather name="camera" size={20} color={colors.secondary} />
            <Text style={styles.buttonText}>Camera</Text>
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 14,
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
});



