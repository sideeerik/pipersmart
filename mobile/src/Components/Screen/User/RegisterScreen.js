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
import { authenticate } from '../../utils/helpers';
import { BACKEND_URL } from 'react-native-dotenv';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const logoImage = require('../../../../logowalangbg.png');

const backgroundImages = [
  require('../../../../picsbl/1.jpg'),
  require('../../../../picsbl/2.jpg'),
  require('../../../../picsbl/3.jpg'),
  require('../../../../picsbl/4.jpg'),
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const carouselTimerRef = useRef(null);

  // Animation values
  const formSlideAnim = useRef(new Animated.Value(height)).current;
  const heroOpacityAnim = useRef(new Animated.Value(1)).current;
  const getStartedScaleAnim = useRef(new Animated.Value(1)).current;
  const imageFadeAnim = useRef(new Animated.Value(1)).current;
  const imageOpacity = Animated.multiply(imageFadeAnim, heroOpacityAnim);

  useEffect(() => {
    // Start carousel timer with crossfade
    carouselTimerRef.current = setInterval(() => {
      Animated.timing(imageFadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        Animated.timing(imageFadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }).start();
      });
    }, 4500);
    
    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    };
  }, [imageFadeAnim]);

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
      Animated.timing(heroOpacityAnim, {
        toValue: 0.3,
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
      Animated.timing(heroOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowForm(false);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreedToTerms(false);
      setFieldErrors({});
    });
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

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 1) return '#FF6B6B'; // Red - Weak
    if (strength <= 2) return '#FFA94D'; // Orange - Fair
    if (strength <= 3) return '#FFD93D'; // Yellow - Good
    if (strength <= 4) return '#6BCB77'; // Green - Strong
    return '#4D96FF'; // Blue - Very Strong
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    if (strength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const validateField = (field, value) => {
    const errors = { ...fieldErrors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else {
          delete errors.name;
        }
        break;
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!validateEmail(value)) {
          errors.email = 'Invalid email format';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else {
          delete errors.password;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Confirm password is required';
        } else if (value !== password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(errors);
  };

  const handleRegister = async () => {
    animateButtonPress();

    // Validate all fields
    validateField('name', name);
    validateField('email', email);
    validateField('password', password);
    validateField('confirmPassword', confirmPassword);

    // Check for errors
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!validateEmail(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the Terms & Conditions');
      return;
    }

    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Please fix the errors above');
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

  return (
    <View style={styles.container}>
      {/* Background Image with rotation */}
      <Animated.Image
        source={backgroundImages[currentImageIndex]}
        style={[styles.backgroundImage, { opacity: imageOpacity }]}
        resizeMode="cover"
      />
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.65)']}
        start={{ x: 0.1, y: 0.0 }}
        end={{ x: 0.6, y: 1.0 }}
        style={styles.overlay}
      />

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

        {/* Sliding Register Form - Appears from bottom */}
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
                  <Image source={logoImage} style={styles.formLogo} resizeMode="contain" />
                  <Text style={styles.formTitle}>Create Account</Text>
                  <Text style={styles.formSubtitle}>Join PiperSmart Today</Text>
                </View>

                {/* Form Inputs */}
                <View style={styles.formContainer}>
                <AnimatedInput
                  label="Full Name"
                  icon="user"
                  focusAnim={nameFocusAnim}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    validateField('name', text);
                  }}
                  ref={nameInput}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailInput.current?.focus()}
                  textContentType="name"
                  autoComplete="name"
                  error={fieldErrors.name}
                />
                {fieldErrors.name && <Text style={styles.errorText}>{fieldErrors.name}</Text>}

                <AnimatedInput
                  label="Email Address"
                  icon="mail"
                  focusAnim={emailFocusAnim}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    validateField('email', text);
                  }}
                  ref={emailInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInput.current?.focus()}
                  textContentType="emailAddress"
                  autoComplete="email"
                  error={fieldErrors.email}
                  validEmail={email && validateEmail(email)}
                />
                {fieldErrors.email && <Text style={styles.errorText}>{fieldErrors.email}</Text>}
                {email && validateEmail(email) && !fieldErrors.email && (
                  <Text style={styles.successText}>✓ Valid email</Text>
                )}

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
                  error={fieldErrors.password}
                />
                {fieldErrors.password && <Text style={styles.errorText}>{fieldErrors.password}</Text>}
                
                {/* Password Strength Indicator */}
                {password && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.strengthBarContainer}>
                      <View 
                        style={[
                          styles.strengthBar,
                          { 
                            width: `${(calculatePasswordStrength(password) / 5) * 100}%`,
                            backgroundColor: getPasswordStrengthColor(calculatePasswordStrength(password))
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.strengthLabel, { color: getPasswordStrengthColor(calculatePasswordStrength(password)) }]}>
                      Strength: {getPasswordStrengthLabel(calculatePasswordStrength(password))}
                    </Text>

                    {/* Requirements Checklist */}
                    <View style={styles.requirementsContainer}>
                      <RequirementItem 
                        met={password.length >= 8} 
                        text="At least 8 characters" 
                      />
                      <RequirementItem 
                        met={/[a-z]/.test(password)} 
                        text="Lowercase letter (a-z)" 
                      />
                      <RequirementItem 
                        met={/[A-Z]/.test(password)} 
                        text="Uppercase letter (A-Z)" 
                      />
                      <RequirementItem 
                        met={/[0-9]/.test(password)} 
                        text="Number (0-9)" 
                      />
                      <RequirementItem 
                        met={/[^a-zA-Z0-9]/.test(password)} 
                        text="Special character (!@#$%)" 
                      />
                    </View>
                  </View>
                )}

                <AnimatedInput
                  label="Confirm Password"
                  icon="lock"
                  focusAnim={confirmPasswordFocusAnim}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    validateField('confirmPassword', text);
                  }}
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
                  error={fieldErrors.confirmPassword}
                />
                {fieldErrors.confirmPassword && <Text style={styles.errorText}>{fieldErrors.confirmPassword}</Text>}
                {confirmPassword && password === confirmPassword && !fieldErrors.confirmPassword && (
                  <Text style={styles.successText}>✓ Passwords match</Text>
                )}

                {/* Terms & Conditions Checkbox */}
                <View style={styles.termsContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setAgreedToTerms(!agreedToTerms)}
                  >
                    {agreedToTerms ? (
                      <Feather name="check-square" size={20} color="#27AE60" />
                    ) : (
                      <Feather name="square" size={20} color="#C8E6C9" />
                    )}
                  </TouchableOpacity>
                  <View style={styles.termsTextContainer}>
                    <Text style={styles.termsText}>I agree to the </Text>
                    <TouchableOpacity>
                      <Text style={styles.termsLink}>Terms & Conditions</Text>
                    </TouchableOpacity>
                    <Text style={styles.termsText}> and </Text>
                    <TouchableOpacity>
                      <Text style={styles.termsLink}>Privacy Policy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Register Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    { opacity: agreedToTerms ? 1 : 0.6 }
                  ]}
                  onPress={handleRegister}
                  disabled={loading || !agreedToTerms}
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
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.loadingText}>Creating account...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              {/* <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View> */}

              {/* Social Login */}
              {/* <TouchableOpacity
                style={styles.googleButton}
                onPress={onGoogleButtonPress}
                disabled={loading}
              >
                <Feather name="chrome" size={20} color="#1B4D3E" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity> */}

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity style={styles.loginButton} onPress={() => {
                  handleCloseForm();
                  setTimeout(() => navigation.navigate('Login'), 300);
                }}>
                  <Text style={styles.loginLink}>Sign In</Text>
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

// Custom Input Component with Animated Border - MOVED OUTSIDE COMPONENT TO PREVENT RE-RENDERS
const AnimatedInput = ({ label, icon, focusAnim, value, error, validEmail, ...props }) => {
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
      <Animated.View style={[
        styles.inputWrapper, 
        { 
          borderColor: error ? '#FF6B6B' : validEmail ? '#27AE60' : borderColor 
        }
      ]}>
        <Feather name={icon} size={20} color={error ? '#FF6B6B' : validEmail ? '#27AE60' : '#52866A'} style={styles.icon} />
        <View style={{ flex: 1 }}>
          <Animated.Text style={[
            styles.floatingLabel,
            { 
              transform: [{ translateY: labelTranslate }, { scale: labelScale }],
              color: error ? '#FF6B6B' : validEmail ? '#27AE60' : labelColor
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

// Requirement Item Component
const RequirementItem = ({ met, text }) => (
  <View style={styles.requirementItem}>
    <Feather 
      name={met ? 'check-circle' : 'circle'} 
      size={16} 
      color={met ? '#27AE60' : '#C8E6C9'}
      style={{ marginRight: 8 }}
    />
    <Text style={[styles.requirementText, { color: '#000000' }]}>
      {text}
    </Text>
  </View>
);

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
  formCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 12,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formLogo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#556A61',
  },
  formContainer: {
    marginBottom: 18,
  },
  inputContainer: {
    marginBottom: 16,
    height: 60,
    justifyContent: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DCE5E0',
    paddingHorizontal: 16,
    height: '100%',
    shadowColor: '#0D2818',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
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
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  successText: {
    color: '#27AE60',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  passwordStrengthContainer: {
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(39, 174, 96, 0.05)',
    borderRadius: 12,
  },
  strengthBarContainer: {
    height: 6,
    backgroundColor: '#E8F6F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  requirementsContainer: {
    marginTop: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    marginBottom: 20,
    marginTop: 8,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  termsText: {
    color: '#52866A',
    fontSize: 12,
    fontWeight: '400',
  },
  termsLink: {
    color: '#27AE60',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  registerButton: {
    height: 56,
    borderRadius: 12,
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
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
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: {
    color: '#1B4D3E',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#000000',
    fontSize: 13,
  },
  loginButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(39, 174, 96, 0.12)',
  },
  loginLink: {
    color: '#27AE60',
    fontSize: 13,
    fontWeight: '700',
  },
});
