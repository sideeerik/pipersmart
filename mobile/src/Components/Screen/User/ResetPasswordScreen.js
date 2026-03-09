import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { BACKEND_URL } from 'react-native-dotenv';
import { Feather } from '@expo/vector-icons';

const logoImage = require('../../../../logowalangbg.png');

export default function ResetPasswordScreen({ navigation, route }) {
  const token = route.params?.token || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const colors = {
    primary: '#27AE60',
    primaryDark: '#1E8449',
    secondary: '#FFFFFF',
    background: '#F0F9F4',
    text: '#1B4D3E',
    textLight: '#52866A',
    border: '#C8E6C9',
    error: '#E74C3C',
    success: '#27AE60',
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return '#FF6B6B';
    if (passwordStrength <= 2) return '#FFA94D';
    if (passwordStrength <= 3) return '#FFD93D';
    if (passwordStrength <= 4) return '#6BCB77';
    return '#4D96FF';
  };

  const handleResetPassword = async () => {
    setMessage('');
    setError('');

    if (!token) {
      setError('Reset link is invalid. Please request a new password reset email.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Both password fields are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/v1/users/reset-password/${token}`,
        { password },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        const successMessage = response.data.message || 'Password has been reset successfully.';
        setMessage(successMessage);
        Alert.alert('Password Updated', successMessage, [
          {
            text: 'Go to Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        setError(response.data.message || 'Unable to reset password.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Reset link is invalid or expired.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Create New Password</Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            Enter your new password to complete the reset.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {message ? (
            <View style={[styles.messageBox, { backgroundColor: 'rgba(39, 174, 96, 0.1)', borderColor: colors.success }]}>
              <Feather name="check-circle" size={20} color={colors.success} style={styles.messageIcon} />
              <Text style={[styles.messageText, { color: colors.success }]}>{message}</Text>
            </View>
          ) : null}

          {error ? (
            <View style={[styles.messageBox, { backgroundColor: 'rgba(231, 76, 60, 0.1)', borderColor: colors.error }]}>
              <Feather name="alert-circle" size={20} color={colors.error} style={styles.messageIcon} />
              <Text style={[styles.messageText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Feather name="lock" size={20} color={colors.textLight} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="New password"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                autoComplete="password-new"
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((prev) => !prev)}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {password ? (
            <View style={styles.passwordStrengthContainer}>
              <View style={styles.strengthBarContainer}>
                <View
                  style={[
                    styles.strengthBar,
                    {
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getStrengthColor(),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: getStrengthColor() }]}>
                Strength: {getStrengthLabel()}
              </Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Feather name="lock" size={20} color={colors.textLight} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textLight}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                textContentType="newPassword"
                autoComplete="password-new"
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword((prev) => !prev)}>
                <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color={colors.secondary} />
                <Text style={[styles.buttonText, { color: colors.secondary }]}>Updating...</Text>
              </View>
            ) : (
              <Text style={[styles.buttonText, { color: colors.secondary }]}>Reset Password</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Login')} disabled={loading}>
            <Feather name="arrow-left" size={18} color={colors.primaryDark} />
            <Text style={[styles.backText, { color: colors.primaryDark }]}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
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
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
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
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    paddingVertical: 0,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  eyeButton: {
    padding: 8,
  },
  passwordStrengthContainer: {
    marginBottom: 18,
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
  },
  resetButton: {
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
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
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
});
