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
  ImageBackground,
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

const backgroundImages = [
  require('../../../../picsbl/index2.png'),
  require('../../../../picsbl/index3.png'),
  require('../../../../picsbl/index4.png'),
  require('../../../../picsbl/index1.jpg'),
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const carouselTimerRef = useRef(null);
  const formSlideAnim = useRef(new Animated.Value(400)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(1)).current;
  const createAccountScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // GoogleSignin.configure({
    //   webClientId: GOOGLE_WEB_CLIENT_ID,
    // });
    
    // Start carousel timer
    carouselTimerRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 4000);
    
    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    };
  }, []);

  const onGoogleButtonPress = async () => {
    setLoading(true);
    try {
      console.log('🔥 Native Google Register attempt (DISABLED IN EXPO GO)');
      
      // await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // const { data: { idToken } } = await GoogleSignin.signIn();
      // console.log('✅ Google Sign-In success');

      // const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      // await auth().signInWithCredential(googleCredential);
      // console.log('✅ Firebase Auth success');

      // const res = await axios.post(
      //   `${BACKEND_URL}/api/v1/users/firebase/auth/google`,
      //   { idToken },
      //   { headers: { 'Content-Type': 'application/json' } }
      // );

      // console.log('✅ Backend Register/Login successful:', res.data?.user?.email);
      
      // await authenticate(res.data, () => {
      //   setTimeout(() => {
      //     Alert.alert(
      //       'Welcome! 🌿',
      //       'Account created/logged in successfully!',
      //       [
      //         { 
      //           text: 'Continue', 
      //           onPress: () => {
      //             if (res.data.user?.role === 'admin') {
      //               navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
      //             } else {
      //               navigation.reset({ index: 0, routes: [{ name: 'UserHome' }] });
      //             }
      //           }
      //         }
      //       ]
      //     );
      //   }, 300);
      // });
      Alert.alert('Development Mode', 'Google Login is disabled in Expo Go. Please build the native app to test.');

    } catch (error) {
      console.error('❌ Google Auth error:', error);
      Alert.alert('Google Auth Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Animation Values
  const nameFocusAnim = useRef(new Animated.Value(0)).current;
  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passwordFocusAnim = useRef(new Animated.Value(0)).current;
  const confirmPasswordFocusAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const nameInput = useRef(null);
  const emailInput = useRef(null);
  const passwordInput = useRef(null);
  const confirmPasswordInput = useRef(null);

  // --- Animation Handlers ---
  const handleFocus = (anim) => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (anim) => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

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

  const handleRegister = async () => {
    animateButtonPress();

    // Validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      console.log('📱 Registration attempt:', name);
      console.log('📱 URL:', `${BACKEND_URL}/api/v1/users/register`);

      const res = await axios.post(
        `${BACKEND_URL}/api/v1/users/register`,
        { name, email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Registration successful:', res.data);
      Alert.alert(
        'Success! 🌿',
        'Account created successfully!',
        [
          {
            text: 'Login Now',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Registration error:', error);

      let errorTitle = 'Registration Failed';
      let errorMessage = 'Something went wrong. Please try again.';
      let buttons = [{ text: 'OK' }];

      if (!error.response) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
        buttons = [{ text: 'Try Again' }];
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid registration data';
      } else if (error.response?.status === 409) {
        errorTitle = 'Email Already Exists';
        errorMessage = 'This email is already registered. Please use a different email or login.';
        buttons = [
          { text: 'Login', onPress: () => navigation.navigate('Login') },
          { text: 'Try Another Email', style: 'cancel' },
        ];
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert(errorTitle, errorMessage, buttons);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    Animated.parallel([
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0.4,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(createAccountScaleAnim, {
        toValue: 0.9,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    Animated.parallel([
      Animated.timing(formSlideAnim, {
        toValue: 400,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(createAccountScaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    setShowForm(false);
  };

  return (
    <ImageBackground
      source={backgroundImages[currentImageIndex]}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Dark overlay for better readability */}
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
        <View style={styles.container}>
          {/* 2. Hero Element - Glassmorphic Card */}
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {/* Hero Section */}
              {!showForm && (
                <View style={styles.heroSection}>
                  <View style={styles.heroContent}>
                    <View style={styles.heroLogoContainer}>
                      <Image source={logoImage} style={styles.heroLogo} resizeMode="contain" />
                    </View>
                    <Text style={styles.heroTitle}>PiperSmart</Text>
                    <Text style={styles.heroSubtitle}>Smart Pepper Farming Companion</Text>
                  </View>
                </View>
              )}

              {/* Form Modal - Slides up from bottom */}
              {showForm && (
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={{ flex: 1, width: '100%' }}
                >
                  <Animated.View
                    style={[
                      styles.formModalContainer,
                      { transform: [{ translateY: formSlideAnim }] },
                    ]}
                  >
                    <ScrollView
                      contentContainerStyle={styles.formScrollContent}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                      <BlurView intensity={20} tint="dark" style={styles.glassCard}>
                        {/* Close Button */}
                        <TouchableOpacity
                          style={styles.closeButton}
                          onPress={handleCloseForm}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Feather name="chevron-down" size={24} color="#1B4D3E" />
                        </TouchableOpacity>

                        {/* Logo & Title */}
                        <View style={styles.header}>
                          <View style={styles.logoContainer}>
                            <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
                          </View>
                          <Text style={styles.title}>Create Account</Text>
                          <Text style={styles.subtitle}>Join PiperSmart Today</Text>
                        </View>

                        {/* Form Inputs */}
                        <View style={styles.formContainer}>
                          <AnimatedInput
                            label="Full Name"
                            icon="user"
                            focusAnim={nameFocusAnim}
                            value={name}
                            onChangeText={setName}
                            ref={nameInput}
                            autoCapitalize="words"
                            returnKeyType="next"
                            onSubmitEditing={() => emailInput.current?.focus()}
                            textContentType="name"
                            autoComplete="name"
                          />

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
                            returnKeyType="next"
                            onSubmitEditing={() => confirmPasswordInput.current?.focus()}
                            rightElement={
                              <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                              >
                                <Feather 
                                  name={showPassword ? "eye-off" : "eye"} 
                                  size={20} 
                                  color="rgba(255,255,255,0.6)" 
                                />
                              </TouchableOpacity>
                            }
                            textContentType="newPassword"
                            autoComplete="password-new"
                          />

                          <AnimatedInput
                            label="Confirm Password"
                            icon="lock"
                            focusAnim={confirmPasswordFocusAnim}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            ref={confirmPasswordInput}
                            secureTextEntry={!showConfirmPassword}
                            returnKeyType="done"
                            onSubmitEditing={handleRegister}
                            rightElement={
                              <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeButton}
                              >
                                <Feather 
                                  name={showConfirmPassword ? "eye-off" : "eye"} 
                                  size={20} 
                                  color="rgba(255,255,255,0.6)" 
                                />
                              </TouchableOpacity>
                            }
                            textContentType="newPassword"
                            autoComplete="password-new"
                          />
                        </View>

                        {/* Register Button */}
                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                          <TouchableOpacity
                            style={styles.registerButton}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={1}
                          >
                            {/* Shimmer Effect */}
                            <Animated.View
                              style={[
                                styles.shimmer,
                                { transform: [{ translateX: shimmerTranslate }] }
                              ]}
                            >
                              <LinearGradient
                                colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ flex: 1 }}
                              />
                            </Animated.View>

                            {loading ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <Text style={styles.buttonText}>Create Account</Text>
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

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                          <Text style={styles.loginText}>Already have an account? </Text>
                          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Sign In</Text>
                          </TouchableOpacity>
                        </View>

                      </BlurView>
                    </ScrollView>
                  </Animated.View>
                </KeyboardAvoidingView>
              )}
            </View>

            {/* Create Account Button - Top of screen when form is hidden */}
            {!showForm && (
              <Animated.View style={[styles.createButtonContainer, { transform: [{ scale: createAccountScaleAnim }] }]}>
                <TouchableOpacity
                  style={styles.createAccountButton}
                  onPress={handleCreateAccount}
                  activeOpacity={0.8}
                >
                  <Text style={styles.createAccountButtonText}>Create Account</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </SafeAreaView>
        </View>
      </View>
    </ImageBackground>
  );
}

// Custom Input Component with Animated Border - MOVED OUTSIDE COMPONENT TO PREVENT RE-RENDERS
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
    backgroundColor: 'transparent',
  },
  // Hero Section Styles
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroLogoContainer: {
    width: 180,
    height: 180,
    marginBottom: 32,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroLogo: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
    marginBottom: 48,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  createButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 56,
  },
  createAccountButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  createAccountButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  formModalContainer: {
    width: '100%',
    flex: 1,
  },
  formScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 30,
  },
  closeButton: {
    alignSelf: 'center',
    paddingVertical: 16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  glassCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(200, 230, 201, 0.6)',
    overflow: 'hidden',
    backgroundColor: 'rgba(240, 249, 244, 0.98)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginBottom: 16,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    // No tintColor needed, use original logo colors
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B4D3E', // Dark Green
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#52866A', // Medium Green
    marginTop: 4,
    letterSpacing: 0.5,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
    height: 60,
    justifyContent: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White input bg
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8F6F0',
    paddingHorizontal: 16,
    height: '100%',
  },
  icon: {
    marginRight: 12,
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    top: 18, 
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    color: '#1B4D3E', // Dark text
    fontSize: 16,
    height: '100%',
    marginTop: 10, 
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
  },
  registerButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#27AE60', // Primary Green
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#C8E6C9',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#52866A',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: {
    color: '#1B4D3E',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#52866A',
    fontSize: 14,
  },
  loginLink: {
    color: '#27AE60',
    fontSize: 14,
    fontWeight: '700',
  },
});
