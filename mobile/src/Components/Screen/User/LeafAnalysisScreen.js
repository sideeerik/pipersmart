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
      icon: '❓',
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🔬 Leaf Analysis</Text>
          <Text style={styles.subtitle}>Detect pepper diseases using AI</Text>
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
            <>
              <MaterialCommunityIcons 
                name="leaf" 
                size={48} 
                color={colors.textLight} 
              />
              <Text style={[styles.placeholderText, { color: colors.textLight }]}>
                No image selected
              </Text>
              <Text style={[styles.placeholderSubtext, { color: colors.border }]}>
                Select an image of your pepper leaf
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

        {/* Result Section */}
        {result && (
          <View style={[styles.card, { borderLeftColor: resultInfo?.color || colors.primary, borderLeftWidth: 4 }]}>
            {/* Result Header */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>{resultInfo?.icon || '🔬'}</Text>
              <Text style={[styles.resultTitle, { color: resultInfo?.color || colors.primary }]}>
                {resultInfo?.title || result.disease || 'Analysis Complete'}
              </Text>
              <Text style={styles.confidence}>
                {result.confidence}% Confidence
              </Text>
            </View>

            {/* Description */}
            <Text style={[styles.description, { color: colors.textLight }]}>
              {resultInfo?.description || 'Analysis completed successfully.'}
            </Text>

            {/* Recommendations */}
            {resultInfo?.actions && (
              <View style={styles.recommendationsBox}>
                <Text style={styles.recommendationsTitle}>📋 Recommended Actions</Text>
                {resultInfo.actions.map((action, idx) => (
                  <View key={idx} style={styles.actionItem}>
                    <Text style={[styles.actionCheck, { color: resultInfo.color }]}>✓</Text>
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
                <Text style={styles.confidenceTitle}>📊 Analysis Confidence</Text>
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
              style={[styles.analyzeAgainButton, { backgroundColor: colors.primaryLight }]}
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#5A7A73',
    fontWeight: '500',
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
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  placeholderSubtext: {
    fontSize: 13,
    marginTop: 4,
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
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  analyzeButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  confidence: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  recommendationsBox: {
    backgroundColor: '#F8FAF7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  actionCheck: {
    fontWeight: '700',
    marginRight: 12,
    fontSize: 16,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  predictionsBox: {
    backgroundColor: '#F8FAF7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  predictionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 12,
  },
  confidenceBox: {
    backgroundColor: '#F8FAF7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  confidenceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 12,
  },
  confidenceBar: {
    height: 12,
    backgroundColor: '#D4E5DD',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 6,
  },
  confidencePercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4D3E',
    textAlign: 'center',
  },
  detectionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#1B4D3E',
  },
  detectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A7A73',
    marginBottom: 4,
  },
  detectionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B4D3E',
  },
  predictionRow: {
    marginBottom: 12,
  },
  diseaseName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B4D3E',
    marginBottom: 4,
  },
  predictionBar: {
    height: 8,
    backgroundColor: '#D4E5DD',
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
    color: '#1B4D3E',
    textAlign: 'right',
  },
  analyzeAgainButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  analyzeAgainText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
