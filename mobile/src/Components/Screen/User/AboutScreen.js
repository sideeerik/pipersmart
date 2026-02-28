import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileHeader from '../../shared/MobileHeader';
import { getUser } from '../../utils/helper';

export default function AboutScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('overview');
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

  const pepperStats = [
    { label: "Global Trade Value", value: "$1.9B", icon: "💰" },
    { label: "Countries Producing", value: "75+", icon: "🌍" },
    { label: "Medicinal Compounds", value: "500+", icon: "🧪" },
    { label: "Years of Cultivation", value: "2000+", icon: "📜" }
  ];

  const pepperBenefits = [
    {
      title: "Nutritional Powerhouse",
      desc: "Rich in piperine, antioxidants, and essential minerals"
    },
    {
      title: "Antimicrobial Properties",
      desc: "Combat pathogenic organisms effectively"
    },
    {
      title: "Anti-inflammatory Impact",
      desc: "Supports cellular health and wellness"
    },
    {
      title: "Antioxidant Capacity",
      desc: "Exceptional free radical scavenging ability"
    }
  ];

  const features = [
    {
      icon: "🍃",
      title: "Leaf Analysis",
      desc: "AI-driven disease detection"
    },
    {
      icon: "🌶️",
      title: "Pepper Analysis",
      desc: "Ripeness detection and quality assessment"
    },
    {
      icon: "🌦️",
      title: "Weather Intelligence",
      desc: "Real-time meteorological data"
    },
    {
      icon: "🗺️",
      title: "Macromapping",
      desc: "Spatial data visualization"
    },
    {
      icon: "💬",
      title: "Community Forum",
      desc: "Collaborative knowledge exchange"
    }
  ];

  const coreValues = [
    { title: "Innovation", desc: "Perpetual technological advancement" },
    { title: "Sustainability", desc: "Environmental stewardship" },
    { title: "Collaboration", desc: "Community-centric approach" },
    { title: "Integrity", desc: "Transparent operations" },
    { title: "Excellence", desc: "Relentless pursuit of quality" },
    { title: "Accessibility", desc: "Democratized technology" }
  ];

  const developers = [
    "Even Lloyd S. Billoned",
    "Yhanskie Adriel D. Cipriano",
    "Jenard D. Inojales",
    "Lord Cedric O. Villa"
  ];

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
          <Text style={styles.headerTitle}>About PiperSmart</Text>
          <Text style={styles.tagline}>
            Revolutionizing Black Pepper Agriculture Through Intelligent Technology
          </Text>
          <View style={styles.visionBadge}>
            <Text style={styles.visionText}>🎯 Empowering Farmers, Sustaining Excellence</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {['overview', 'pepper', 'mission'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                activeTab === tab && styles.tabBtnActive
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabBtnText,
                activeTab === tab && styles.tabBtnTextActive
              ]}>
                {tab === 'overview' ? 'Overview' : tab === 'pepper' ? 'Pepper' : 'Mission'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚀 Platform Features</Text>
              {features.map((feature, idx) => (
                <View key={idx} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* PEPPER TAB */}
        {activeTab === 'pepper' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌶️ Black Pepper: The King of Spices</Text>
              <Text style={styles.sectionText}>
                Piper nigrum stands as a cornerstone of global commerce and culinary excellence. Originating from the Malabar Coast of India, this perennial climbing vine has shaped international trade for over two millennia.
              </Text>
              <Text style={styles.sectionText}>
                Esteemed for its complex pungent alkaloid composition, particularly piperine, black pepper exemplifies a sophisticated intersection of gastronomic perception and biochemical sophistication.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Global Significance</Text>
              {pepperStats.map((stat, idx) => (
                <View key={idx} style={styles.statCard}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧬 Biochemical Attributes</Text>
              {pepperBenefits.map((benefit, idx) => (
                <View key={idx} style={styles.benefitCard}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* MISSION TAB */}
        {activeTab === 'mission' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Our Mission</Text>
              <Text style={styles.missionText}>
                PiperSmart serves as a revolutionary conduit between centuries-old agricultural wisdom and cutting-edge technological innovation, democratizing access to sophisticated crop management methodologies.
              </Text>
              <Text style={styles.missionText}>
                We are committed to empowering farmers through data-driven decision frameworks and sustainable intensification.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ Our Vision</Text>
              <Text style={styles.sectionText}>
                To catalyze a paradigmatic shift in black pepper cultivation by fostering an interconnected ecosystem wherein data-driven insights, collaborative knowledge exchange, and technological sophistication converge to establish benchmarks for agricultural excellence and farmer prosperity.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💎 Core Values</Text>
              {coreValues.map((value, idx) => (
                <View key={idx} style={styles.valueCard}>
                  <Text style={styles.valueTitle}>{value.title}</Text>
                  <Text style={styles.valueDesc}>{value.desc}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👨‍💻 Development Team</Text>
              {developers.map((dev, idx) => (
                <View key={idx} style={styles.developerCard}>
                  <Text style={styles.devAvatar}>{dev.charAt(0)}</Text>
                  <Text style={styles.devName}>{dev}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

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
    marginBottom: 12,
    lineHeight: 21,
  },
  visionBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  visionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#1B4D3E',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabBtnTextActive: {
    color: '#1B4D3E',
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
  sectionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 10,
  },
  missionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  featureCard: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#666',
  },
  statCard: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  benefitCard: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 13,
    color: '#666',
  },
  valueCard: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
  },
  valueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 3,
  },
  valueDesc: {
    fontSize: 13,
    color: '#666',
  },
  developerCard: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  devAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
  },
  devName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4D3E',
    flex: 1,
  },
  spacer: {
    height: 30,
  },
});
