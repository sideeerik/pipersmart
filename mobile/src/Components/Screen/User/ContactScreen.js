import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import MobileHeader from '../../shared/MobileHeader';
import { getUser } from '../../utils/helpers';

const devTeamImages = [
  require('../../../../picsbl/prof1.png'),
  require('../../../../picsbl/prof2.png'),
  require('../../../../picsbl/prof3.png'),
  require('../../../../picsbl/prof4.png'),
];

export default function ContactScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerSlideAnim = useRef(new Animated.Value(-280)).current;

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const colors = {
    primary: '#0E3B2E',
    primaryDark: '#0A2C23',
    background: '#F3F7F4',
    surface: '#FFFFFF',
    text: '#0E3B2E',
    muted: '#5A6B63',
    border: '#DDE7E1',
    accent: '#2BB673',
    accentSoft: '#E1F4EA',
    facebook: '#1877F2',
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerSlideAnim, {
      toValue: -280,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setDrawerOpen(false));
  };

  const teamMembers = [
    {
      name: 'Even Lloyd S. Billoned',
      role: 'Developer',
      facebookLink: 'https://www.facebook.com/lloyd.billoned',
      initials: 'LB',
    },
    {
      name: 'Yhanskie Adriel D. Cipriano',
      role: 'Developer',
      facebookLink: 'https://www.facebook.com/yhanskie.cipriano.1',
      initials: 'YC',
    },
    {
      name: 'Jenard D. Inojales',
      role: 'Developer',
      facebookLink: 'https://www.facebook.com/jenard.inojales',
      initials: 'JI',
    },
    {
      name: 'Lord Cedric O. Vila',
      role: 'Developer',
      facebookLink: 'https://www.facebook.com/sideeerik',
      initials: 'LV',
    },
  ];

  const handleEmail = () => {
    Linking.openURL('mailto:pipersmart2026@gmail.com');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+639937994369');
  };

  const handleFacebook = (url) => {
    Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <MobileHeader
        navigation={navigation}
        user={user}
        drawerOpen={drawerOpen}
        openDrawer={openDrawer}
        closeDrawer={closeDrawer}
        drawerSlideAnim={drawerSlideAnim}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          <View style={styles.heroGlow} />
          <View style={styles.heroRing} />
          <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.heroEyebrow}>PiperSmart Support</Text>
            <Text style={styles.heroTitle}>Contact Us</Text>
            <Text style={styles.heroText}>
              Get in touch with the PiperSmart development team. We are here to
              support your black pepper farming journey.
            </Text>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.surface }]}
                onPress={handleEmail}
                activeOpacity={0.85}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.accentSoft }]}
                >
                  <Feather name="mail" size={18} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Email Us</Text>
                <Text style={styles.actionValue}>pipersmart2026@gmail.com</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: colors.surface }]}
                onPress={handlePhone}
                activeOpacity={0.85}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.accentSoft }]}
                >
                  <Feather name="phone" size={18} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Call Us</Text>
                <Text style={styles.actionValue}>0993 799 4369</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Meet Our Team</Text>
            <Text style={styles.sectionDesc}>
              PiperSmart is built by a dedicated team of professionals passionate about
              agricultural technology.
            </Text>
          </View>

          {teamMembers.map((member, idx) => (
            <View key={idx} style={styles.memberCard}>
              <Image source={devTeamImages[idx]} style={styles.memberProfileImage} />
              <View style={styles.memberInfo}>
                <View style={styles.memberTopRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>{member.role}</Text>
                  </View>
                </View>
                <Text style={styles.memberTagline}>PiperSmart Development Team</Text>
                <TouchableOpacity
                  style={[styles.facebookBtn, { backgroundColor: colors.facebook }]}
                  onPress={() => handleFacebook(member.facebookLink)}
                  activeOpacity={0.85}
                >
                  <FontAwesome name="facebook" size={14} color="white" />
                  <Text style={styles.facebookBtnText}>View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.sectionDesc}>
              Choose the best way to reach us. We usually respond within 24 hours on
              weekdays.
            </Text>
          </View>

          <TouchableOpacity style={styles.contactItem} onPress={handleEmail} activeOpacity={0.85}>
            <View style={[styles.contactIconBox, { backgroundColor: colors.accent }]}
            >
              <Feather name="mail" size={22} color="white" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>pipersmart2026@gmail.com</Text>
              <Text style={styles.contactHint}>Tap to send an email</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={handlePhone} activeOpacity={0.85}>
            <View style={[styles.contactIconBox, { backgroundColor: colors.primary }]}
            >
              <Feather name="phone" size={22} color="white" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>0993 799 4369</Text>
              <Text style={styles.contactHint}>Tap to call now</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <View style={[styles.contactIconBox, { backgroundColor: colors.facebook }]}
            >
              <FontAwesome name="facebook" size={22} color="white" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Facebook</Text>
              <Text style={styles.contactValue}>Message us for inquiries</Text>
              <Text style={styles.contactHint}>We reply during office hours</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Get In Touch</Text>
          </View>
          <Text style={styles.sectionText}>
            Have questions about PiperSmart or need support with your black pepper
            farming operations? Our team is ready to assist you with technical guidance,
            troubleshooting, and feature requests.
          </Text>
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Office Hours</Text>
            <Text style={styles.noticeText}>Monday to Friday, 9:00 AM - 5:00 PM (PHT)</Text>
            <Text style={styles.noticeHint}>For urgent matters, please call us directly.</Text>
          </View>
        </View>
      </ScrollView>
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
  content: {
    paddingBottom: 32,
  },
  heroWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  heroCard: {
    borderRadius: 20,
    padding: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  heroGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(43, 182, 115, 0.25)',
    top: -30,
    right: -30,
  },
  heroRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    bottom: -40,
    left: -10,
  },
  heroEyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  heroText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: 18,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E3B2E',
    marginBottom: 4,
  },
  actionValue: {
    fontSize: 12,
    color: '#5A6B63',
    lineHeight: 16,
  },
  section: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  sectionHeading: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E3B2E',
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#5A6B63',
    lineHeight: 20,
  },
  sectionText: {
    fontSize: 14,
    color: '#5A6B63',
    lineHeight: 20,
    marginBottom: 14,
  },
  memberCard: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#F7FAF8',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5EEE9',
  },
  memberProfileImage: {
    width: 64,
    height: 64,
    borderRadius: 18,
    marginRight: 14,
    resizeMode: 'cover',
  },
  memberInfo: {
    flex: 1,
  },
  memberTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0E3B2E',
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E1F4EA',
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E7E52',
  },
  memberTagline: {
    fontSize: 12,
    color: '#7A8A83',
    marginVertical: 8,
  },
  facebookBtn: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  facebookBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F7FAF8',
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5EEE9',
  },
  contactIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0E3B2E',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2D27',
    marginBottom: 2,
  },
  contactHint: {
    fontSize: 12,
    color: '#7A8A83',
  },
  noticeCard: {
    backgroundColor: '#F1F7F3',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDE7E1',
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0E3B2E',
    marginBottom: 6,
  },
  noticeText: {
    fontSize: 13,
    color: '#0E3B2E',
    marginBottom: 4,
  },
  noticeHint: {
    fontSize: 12,
    color: '#5A6B63',
  },
});
