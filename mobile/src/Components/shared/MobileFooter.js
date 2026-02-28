import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function MobileFooter() {
  const colors = {
    primary: '#1B4D3E',
    primaryDark: '#0D2818',
    background: '#F8FAF7',
    text: '#1B4D3E',
    textLight: '#5A7A73',
    border: '#D4E5DD',
  };

  const currentYear = new Date().getFullYear();

  const handleContact = (type, value) => {
    if (type === 'email') {
      Linking.openURL(`mailto:${value}`);
    } else if (type === 'phone') {
      Linking.openURL(`tel:${value}`);
    }
  };

  return (
    <View style={[styles.footer, { backgroundColor: colors.primary }]}>
      {/* Footer Content */}
      <View style={styles.footerContent}>
        {/* About Section */}
        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>PiperSmart</Text>
          <Text style={styles.footerDescription}>
            Advanced disease detection for pepper farmers using AI and machine learning
          </Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => Linking.openURL('https://facebook.com')}
            >
              <MaterialCommunityIcons name="facebook" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => Linking.openURL('https://twitter.com')}
            >
              <MaterialCommunityIcons name="twitter" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => Linking.openURL('https://instagram.com')}
            >
              <MaterialCommunityIcons name="instagram" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>Quick Links</Text>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Features</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>How It Works</Text>
          </TouchableOpacity>
        </View>

        {/* Resources */}
        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>Resources</Text>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Documentation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Blog</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Section */}
        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>Contact</Text>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('email', 'info@pipersmart.com')}
          >
            <MaterialCommunityIcons name="email" size={16} color="#FFFFFF" />
            <Text style={styles.contactText}>info@pipersmart.com</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('phone', '+63-XXX-XXX-XXXX')}
          >
            <MaterialCommunityIcons name="phone" size={16} color="#FFFFFF" />
            <Text style={styles.contactText}>+63-XXX-XXX-XXXX</Text>
          </TouchableOpacity>
          <View style={styles.contactItem}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#FFFFFF" />
            <Text style={styles.contactText}>Philippines</Text>
          </View>
        </View>
      </View>

      {/* Footer Bottom */}
      <View style={styles.footerBottom}>
        <Text style={styles.footerBottomText}>
          © {currentYear} PiperSmart. All rights reserved.
        </Text>
        <View style={styles.footerBottomLinks}>
          <TouchableOpacity>
            <Text style={styles.footerBottomLinkText}>Privacy</Text>
          </TouchableOpacity>
          <Text style={styles.footerBottomLinkText}> • </Text>
          <TouchableOpacity>
            <Text style={styles.footerBottomLinkText}>Terms</Text>
          </TouchableOpacity>
          <Text style={styles.footerBottomLinkText}> • </Text>
          <TouchableOpacity>
            <Text style={styles.footerBottomLinkText}>Cookies</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  footerContent: {
    marginBottom: 20,
  },
  footerSection: {
    marginBottom: 20,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  footerDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    marginBottom: 12,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLink: {
    paddingVertical: 6,
  },
  footerLinkText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  footerBottomText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerBottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBottomLinkText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
