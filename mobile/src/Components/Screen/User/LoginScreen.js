import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { authenticate } from '../../utils/helper';
import { BACKEND_URL, GOOGLE_WEB_CLIENT_ID } from 'react-native-dotenv';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import auth from '@react-native-firebase/auth';

const { width, height } = Dimensions.get('window');
const logoImage = require('../../../../logowalangbg.png');
const bgImage1 = require('../../../../picsbl/1.jpg');
const bgImage2 = require('../../../../picsbl/2.jpg');
const bgImage3 = require('../../../../picsbl/3.jpg');
const bgImage4 = require('../../../../picsbl/4.jpg');
const backgroundImages = [bgImage1, bgImage2, bgImage3, bgImage4];

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Animation values
  const formSlideAnim = useRef(new Animated.Value(height)).current;
  const videoOpacityAnim = useRef(new Animated.Value(1)).current;
  const imageFadeAnim = useRef(new Animated.Value(1)).current;
  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passwordFocusAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const getStartedScaleAnim = useRef(new Animated.Value(1)).current;
  
  const passwordInput = useRef(null);
  const emailInput = useRef(null);
  
  // Rotate background images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle "Get Started" button press
  const handleGetStarted = () => {
    // Scale animation on button
    Animated.sequence([
      Animated.timing(getStartedScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(getStartedScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Slide form up from bottom
    Animated.parallel([
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(videoOpacityAnim, {
        toValue: 0.4,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    setShowForm(true);
  };

  // Handle close form
  const handleCloseForm = () => {
    Animated.parallel([
      Animated.timing(formSlideAnim, {
        toValue: height,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(videoOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowForm(false);
      setEmail('');
      setPassword('');
    });
  };

  const onGoogleButtonPress = async () => {
    setLoading(true);
    try {
      console.log('🔥 Native Google Login attempt (DISABLED IN EXPO GO)');
      Alert.alert('Development Mode', 'Google Login is disabled in Expo Go. Please build the native app to test.');
    } catch (error) {
      console.error('❌ Google Login error:', error);
      Alert.alert('Google Login Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Animation Values
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ])
    ).start();
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    animateButtonPress();

    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('🌱 Login attempt:', email);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 15000)
      );

      const loginPromise = axios.post(
        `${BACKEND_URL}/api/v1/users/login`, 
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      const res = await Promise.race([loginPromise, timeoutPromise]);
      
      console.log('✅ Login successful:', res.data?.user?.email);
      
      await authenticate(res.data, () => {
        setTimeout(() => {
          Alert.alert(
            'Welcome Back! 🌿',
            'Login successful!',
            [
              { 
                text: 'Continue', 
                onPress: () => {
                  if (res.data.user?.role === 'admin') {
                    navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
                  } else {
                    navigation.reset({ index: 0, routes: [{ name: 'UserHome' }] });
                  }
                }
              }
            ]
          );
        }, 300);
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      let errorTitle = 'Login Failed';
      let errorMessage = 'Something went wrong. Please try again.';
      let buttons = [{ text: 'OK' }];

      if (error.message === 'Network timeout' || !error.response) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
        buttons = [{ text: 'Try Again' }];
      } else if (error.response?.status === 401) {
        errorTitle = 'Invalid Credentials';
        errorMessage = 'The email or password you entered is incorrect.';
      } else if (error.response?.status === 404) {
        errorTitle = 'User Not Found';
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert(errorTitle, errorMessage, buttons);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image with rotation */}
      <Animated.Image
        source={backgroundImages[currentImageIndex]}
        style={[styles.backgroundImage, { opacity: videoOpacityAnim }]}
        resizeMode="cover"
      />
      
      {/* Dark overlay */}
      <View style={styles.overlay} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Hero Section - Visible when form is closed */}
        {!showForm && (
          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <Image source={logoImage} style={styles.heroLogo} resizeMode="contain" />
              <Text style={styles.heroTitle}>PiperSmart</Text>
              <Text style={styles.heroSubtitle}>Smart Pepper Disease Detection</Text>
              <Text style={styles.heroDescription}>
                Identify and manage black pepper diseases with advanced AI technology
              </Text>
            </View>

            {/* Get Started Button */}
            <Animated.View style={{ transform: [{ scale: getStartedScaleAnim }] }}>
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}
                activeOpacity={0.8}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
                <Feather name="arrow-right" size={20} color="#FFFFFF" style={styles.arrowIcon} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* Sliding Login Form - Appears from bottom */}
        <Animated.View
          style={[
            styles.formWrapper,
            { transform: [{ translateY: formSlideAnim }] }
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            {/* Close Button at top of form */}
            {showForm && (
              <View style={styles.closeButtonArea}>
                <TouchableOpacity
                  onPress={handleCloseForm}
                  style={styles.closeButton}
                >
                  <Feather name="chevron-down" size={28} color="#1B4D3E" />
                </TouchableOpacity>
              </View>
            )}

            <ScrollView
              contentContainerStyle={styles.formScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <BlurView intensity={25} tint="dark" style={styles.formCard}>
                {/* Form Header */}
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Welcome Back</Text>
                  <Text style={styles.formSubtitle}>Sign in to your account</Text>
                </View>

                {/* Form Inputs */}
                <View style={styles.formContainer}>
                  <AnimatedInput
                    label="Email Address"
                    icon="mail"
                    focusAnim={emailFocusAnim}
                    value={email}
                    onChangeText={setEmail}
                    ref={emailInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInput.current?.focus()}
                    textContentType="emailAddress"
                    autoComplete="email"
                  />

                  <AnimatedInput
                    label="Password"
                    icon="lock"
                    focusAnim={passwordFocusAnim}
                    value={password}
                    onChangeText={setPassword}
                    ref={passwordInput}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    rightElement={
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                      >
                        <Feather 
                          name={showPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color="rgba(45, 45, 45, 0.7)" 
                        />
                      </TouchableOpacity>
                    }
                    textContentType="password"
                    autoComplete="password"
                  />

                  <TouchableOpacity
                    onPress={() => {
                      handleCloseForm();
                      setTimeout(() => navigation.navigate('ForgotPassword'), 300);
                    }}
                    style={styles.forgotLink}
                  >
                    <Text style={styles.linkText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <Animated.View
                      style={[
                        styles.shimmer,
                        { transform: [{ translateX: shimmerTranslate }] }
                      ]}
                    >
                      <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                      />
                    </Animated.View>

                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login */}
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={onGoogleButtonPress}
                  disabled={loading}
                >
                  <Feather name="chrome" size={20} color="#1B4D3E" />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => {
                    handleCloseForm();
                    setTimeout(() => navigation.navigate('Register'), 300);
                  }}>
                    <Text style={styles.signupLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// Custom Input Component with Animated Border - MOVED OUTSIDE
const AnimatedInput = ({ label, icon, focusAnim, value, ...props }) => {
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E8F6F0', '#27AE60'], // Light Border to Primary Green
  });

  const labelTranslate = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const labelScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  });

  const labelColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#52866A', '#27AE60'], // Text Light to Primary Green
  });

  return (
    <View style={styles.inputContainer}>
      <Animated.View style={[styles.inputWrapper, { borderColor }]}>
        <Feather name={icon} size={20} color="#52866A" style={styles.icon} />
        <View style={{ flex: 1 }}>
          <Animated.Text style={[
            styles.floatingLabel,
            { 
              transform: [{ translateY: labelTranslate }, { scale: labelScale }],
              color: labelColor
            }
          ]}>
            {label}
          </Animated.Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="transparent"
            onFocus={() => {
              Animated.timing(focusAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
              }).start();
            }}
            onBlur={() => {
              if (!value) {
                Animated.timing(focusAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: false,
                }).start();
              }
            }}
            value={value}
            {...props}
          />
        </View>
        {props.rightElement}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  heroLogo: {
    width: 180,
    height: 180,
    marginBottom: 24,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27AE60',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 12,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 28,
    backgroundColor: '#27AE60',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 24,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  arrowIcon: {
    marginLeft: 4,
  },
  formWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  formCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 12,
  },
  closeButtonArea: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  formScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
    height: 56,
    justifyContent: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    height: '100%',
  },
  icon: {
    marginRight: 12,
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    top: 18,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    color: '#1B4D3E',
    fontSize: 16,
    height: '100%',
    marginTop: 8,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  linkText: {
    color: '#27AE60',
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999999',
    fontSize: 13,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: {
    color: '#1B4D3E',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666666',
    fontSize: 14,
  },
  signupLink: {
    color: '#27AE60',
    fontSize: 14,
    fontWeight: '700',
  },
});
