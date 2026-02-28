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
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import MobileHeader from '../../shared/MobileHeader';
import { getUser } from '../../utils/helper';

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
    primary: '#1B4D3E',
    background: '#F8FAF7',
    text: '#1B4D3E',
    border: '#D4E5DD',
    accent: '#22c55e',
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
      name: "Even Lloyd S. Billoned",
      role: "Developer",
      facebookLink: "https://www.facebook.com/lloyd.billoned",
      initials: "LB"
    },
    {
      name: "Yhanskie Adriel D. Cipriano",
      role: "Developer",
      facebookLink: "https://www.facebook.com/yhanskie.cipriano.1",
      initials: "YC"
    },
    {
      name: "Jenard D. Inojales",
      role: "Developer",
      facebookLink: "https://www.facebook.com/jenard.inojales",
      initials: "JI"
    },
    {
      name: "Lord Cedric O. Vila",
      role: "Developer",
      facebookLink: "https://www.facebook.com/sideeerik",
      initials: "LV"
    }
  ];

  const handleEmail = () => {
    Linking.openURL('mailto:pipersmart2026@gmail.com');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+639633769724');
  };

  const handleFacebook = (url) => {
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <MobileHeader
        navigation={navigation}
        user={user}
        drawerOpen={drawerOpen}
        openDrawer={openDrawer}
        closeDrawer={closeDrawer}
        drawerSlideAnim={drawerSlideAnim}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <Text style={styles.tagline}>
            Get in touch with the PiperSmart development team. We're here to support your black pepper farming journey.
          </Text>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📧 Contact Information</Text>
          
          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleEmail}
          >
            <View style={styles.contactIconBox}>
              <Feather name="mail" size={24} color="white" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>pipersmart2026@gmail.com</Text>
              <Text style={styles.contactHint}>Tap to send email</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handlePhone}
          >
            <View style={styles.contactIconBox}>
              <Feather name="phone" size={24} color="white" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>+63 963 376 9724</Text>
              <Text style={styles.contactHint}>Tap to call</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
          >
            <View style={styles.contactIconBox}>
              <FontAwesome name="facebook" size={24} color="white" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Facebook</Text>
              <Text style={styles.contactValue}>Connect with us</Text>
              <Text style={styles.contactHint}>Message us for inquiries</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Meet Our Team</Text>
          <Text style={styles.sectionDesc}>
            PiperSmart is developed by a dedicated team of professionals passionate about agricultural technology.
          </Text>
          
          {teamMembers.map((member, idx) => (
            <View key={idx} style={styles.teamMemberCard}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{member.initials}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
                <TouchableOpacity
                  style={styles.facebookBtn}
                  onPress={() => handleFacebook(member.facebookLink)}
                >
                  <FontAwesome name="facebook" size={14} color="white" />
                  <Text style={styles.facebookBtnText}>Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Get In Touch</Text>
          <Text style={styles.sectionText}>
            Have questions about PiperSmart or need support with your black pepper farming operations? Our team is ready to assist you with technical guidance, troubleshooting, and feature requests.
          </Text>
          <Text style={styles.sectionText}>
            We typically respond within 24 hours on weekdays. For urgent matters, please call us directly.
          </Text>
          <Text style={[styles.sectionText, styles.officeHours]}>
            <Text style={styles.bold}>Office Hours:</Text> Monday to Friday, 9:00 AM - 5:00 PM (PHT)
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 35,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 21,
  },
  section: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 15,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  officeHours: {
    marginTop: 5,
  },
  bold: {
    fontWeight: '700',
    color: '#1B4D3E',
  },
  contactItem: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  contactIconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactHint: {
    fontSize: 12,
    color: '#999',
  },
  teamMemberCard: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'linear-gradient(135deg, #22c55e, #3b82f6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#22c55e',
  },
  memberAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 13,
    color: '#22c55e',
    fontWeight: '600',
    marginBottom: 8,
  },
  facebookBtn: {
    flexDirection: 'row',
    backgroundColor: '#1877f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  facebookBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  spacer: {
    height: 30,
  },
});
