import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const logoImage = require('../../../../logowalangbg.png');

export default function ForgotPassword({ navigation }) {
  const colors = {
    background: '#F0F9F4',
    text: '#1B4D3E',
    textLight: '#52866A',
    success: '#27AE60',
    accent: '#52BE80',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.content}>
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
              Change password in the web side
            </Text>
          </View>

          <View
            style={[
              styles.messageBox,
              {
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                borderColor: colors.success,
              },
            ]}
          >
            <Feather
              name="info"
              size={20}
              color={colors.success}
              style={styles.messageIcon}
            />
            <Text style={[styles.messageText, { color: colors.text }]}>
              Password reset by email is disabled in the mobile app. Please change your password in the web side.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={18} color={colors.accent} />
            <Text style={[styles.backText, { color: colors.accent }]}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <Text style={[styles.helpText, { color: colors.textLight }]}>
            Open the website and use the password settings there if you need to update your password.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'space-between',
  },
  content: {
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  messageIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 24,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpContainer: {
    paddingVertical: 20,
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
