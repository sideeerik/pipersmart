import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { BACKEND_URL } from 'react-native-dotenv';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const logoImage = require('../../../../logowalangbg.png');

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const emailInput = useRef(null);

  // Modern light green theme color palette
  const colors = {
    primary: '#27AE60',        // Medium green
    primaryDark: '#1E8449',    // Dark green
    primaryLight: '#52BE80',   // Light green
    secondary: '#FFFFFF',      // White
    background: '#F0F9F4',     // Very light green background
    backgroundHover: '#E8F6F0', // Lighter green hover
    text: '#1B4D3E',           // Dark green text
    textLight: '#52866A',      // Medium green text
    border: '#C8E6C9',         // Light green border
    borderFocus: '#27AE60',    // Green border when focused
    error: '#E74C3C',          // Red for errors
    success: '#27AE60',        // Green for success
    accent: '#52BE80',         // Light green accent
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const url = `${BACKEND_URL}/api/v1/users/forgot-password`;
      console.log('🔑 Forgot password URL:', url);

      const response = await axios.post(url, { email });
      console.log('✅ Forgot password response:', response.data);

      if (response.data.success) {
        setMessage(response.data.message || 'Password reset email sent successfully! Check your inbox.');
        setMessageSent(true);
        setEmail('');
      } else {
        setError(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('❌ Forgot password error:', err.response?.data || err.message);
      
      let errorMessage = 'Server error. Please try again.';
      
      if (err.response?.status === 404) {
        errorMessage = 'No account found with this email address.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={logoImage}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: colors.textLight }]}>
              We'll send you a reset link
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Success Message */}
            {message ? (
              <View style={[styles.messageBox, { backgroundColor: 'rgba(39, 174, 96, 0.1)', borderColor: colors.success }]}>
                <Feather name="check-circle" size={20} color={colors.success} style={styles.messageIcon} />
                <Text style={[styles.messageText, { color: colors.success }]}>{message}</Text>
              </View>
            ) : null}

            {/* Error Message */}
            {error ? (
              <View style={[styles.messageBox, { backgroundColor: 'rgba(231, 76, 60, 0.1)', borderColor: colors.error }]}>
                <Feather name="alert-circle" size={20} color={colors.error} style={styles.messageIcon} />
                <Text style={[styles.messageText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
              <View style={[
                styles.inputWrapper,
                { borderColor: emailFocused ? colors.borderFocus : colors.border },
                emailFocused && styles.inputFocused
              ]}>
                <Feather 
                  name="mail" 
                  size={20} 
                  color={emailFocused ? colors.accent : colors.textLight} 
                  style={styles.icon}
                />
                <TextInput
                  ref={emailInput}
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={colors.textLight}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  importantForAutofill="no"
                  editable={!loading}
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit}
                />
              </View>
            </View>

            {/* Send Reset Button */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: colors.primary },
                (loading || !email || messageSent) && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading || !email || messageSent}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color={colors.secondary} />
                  <Text style={[styles.buttonText, { color: colors.secondary }]}>Sending...</Text>
                </View>
              ) : messageSent ? (
                <View style={styles.buttonContent}>
                  <Feather name="check" size={20} color={colors.secondary} />
                  <Text style={[styles.buttonText, { color: colors.secondary }]}>Email Sent</Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, { color: colors.secondary }]}>Send Reset Email</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity
              style={styles.backLink}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Feather name="arrow-left" size={18} color={colors.accent} />
              <Text style={[styles.backText, { color: colors.accent }]}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={[styles.helpText, { color: colors.textLight }]}>
              Didn't receive the email? Check your spam folder or contact support.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(39, 174, 96, 0.2)',
  },
  logoImage: {
    width: '80%',
    height: '80%',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#52866A',
    textAlign: 'center',
    opacity: 0.8,
  },
  formContainer: {
    marginBottom: 30,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 24,
  },
  messageIcon: {
    marginRight: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4D3E',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6F0',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 56,
  },
  inputFocused: {
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1B4D3E',
    height: '100%',
    paddingVertical: 0,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    width: '100%',
  },
  sendButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpContainer: {
    marginTop: 'auto',
    paddingVertical: 20,
  },
  helpText: {
    fontSize: 12,
    color: '#52866A',
    textAlign: 'center',
    lineHeight: 18,
  },
});
