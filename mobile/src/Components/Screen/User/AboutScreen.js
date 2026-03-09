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
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MobileHeader from '../../shared/MobileHeader';
import { getUser, logout } from '../../utils/helpers';

const devTeamImages = [
  require('../../../../picsbl/prof1.png'), // Even Lloyd S. Billoned
  require('../../../../picsbl/prof2.png'), // Yhanskie Adriel D. Cipriano
  require('../../../../picsbl/prof3.png'), // Jenard D. Inojales
  require('../../../../picsbl/prof4.png'), // Lord Cedric O. Villa
];

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
    background: '#EEF4F0',
    text: '#1B4D3E',
    border: '#D4E5DD',
    accent: '#22c55e',
    cardBg: '#FFFFFF',
    textLight: '#5E7B74',
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerSlideAnim, {
      toValue: -280,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(navigation),
      },
    ]);
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
      desc: "Leaf Disease Detection"
    },
    {
      icon: "🔬",
      title: "Peppercorn Analysis",
      desc: "Ripeness and Health Percentage Detection"
    },
    {
      icon: "🗺️",
      title: "Macromapping",
      desc: "Spatial visualization, location saving, location details & route guidance"
    },
    {
      icon: "🤖",
      title: "Chatbot",
      desc: "AI-powered farming assistance"
    },
    {
      icon: "📝",
      title: "Notepad",
      desc: "Take Notes, Track Activities"
    },
    {
      icon: "📊",
      title: "Track Recent Activities",
      desc: "Monitor PiperSmart activity history"
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
    "Lord Cedric O. Vila"
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      <View pointerEvents="none" style={styles.backgroundDecor}>
        <View style={styles.decorOrbOne} />
        <View style={styles.decorOrbTwo} />
      </View>

      <MobileHeader
        navigation={navigation}
        user={user}
        drawerOpen={drawerOpen}
        openDrawer={openDrawer}
        closeDrawer={closeDrawer}
        drawerSlideAnim={drawerSlideAnim}
        onLogout={handleLogout}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#103328', '#1B4D3E', '#2A6A56']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerGlowTop} />
          <View style={styles.headerGlowBottom} />

          <Image
            source={require('../../../../picsbl/logowalangbg.png')}
            style={styles.headerLogo}
          />
          <Text style={styles.headerEyebrow}>About</Text>
          <Text style={styles.headerTitle}>PiperSmart</Text>
          <Text style={styles.tagline}>
            Revolutionizing Black Pepper Agriculture Through Intelligent Technology
          </Text>
          <View style={styles.visionBadge}>
            <Text style={styles.visionText}>Empowering Farmers, Sustaining Excellence</Text>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{features.length}</Text>
              <Text style={styles.heroStatLabel}>Features</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{coreValues.length}</Text>
              <Text style={styles.heroStatLabel}>Core Values</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{developers.length}</Text>
              <Text style={styles.heroStatLabel}>Team Members</Text>
            </View>
          </View>
        </LinearGradient>

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
                {tab === 'overview' ? 'Overview' : tab === 'pepper' ? 'Black Pepper' : 'About Us'}
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
              <View style={styles.titleWithLogo}>
                <Image 
                  source={require('../../../../picsbl/rara.png')} 
                  style={styles.sectionLogo}
                />
                <Text style={styles.sectionTitle}>Black Pepper: The King of Spices</Text>
              </View>
              <Text style={styles.sectionText}>
                Black pepper (Piper nigrum), often referred to as the "King of Spices" holds immense global significance, acting as a cornerstone of the international spice trade for thousands of years, a vital culinary staple, and a potent, multi-functional medicinal agent. Native to the Malabar Coast of India, it is currently the world's most traded spice, accounting for approximately 20% of all global spice imports.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Historical and Economic Significance</Text>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Historical Currency: "Black Gold"</Text>
                <Text style={styles.benefitDesc}>In ancient and medieval times, black pepper was so highly valued it was used as a form of money, rent, and dowry, earning the nickname "black gold".</Text>
              </View>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Driver of Exploration</Text>
                <Text style={styles.benefitDesc}>The desire to control trade routes from Asia to Europe in the 15th century fuelled the Age of Exploration, directly prompting voyages by explorers like Vasco da Gama.</Text>
              </View>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Current Economic Value</Text>
                <Text style={styles.benefitDesc}>The global black pepper market is a multi-billion dollar industry (projected at 7.2 billion USD by 2026). It is a crucial export crop for countries like Vietnam (the top producer), Brazil, Indonesia, and India, supporting thousands of smallholder farmers.</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🍽️ Culinary Ubiquity</Text>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Global Standard</Text>
                <Text style={styles.benefitDesc}>It is one of the few seasonings, along with salt, that is used almost universally in kitchens, restaurants, and dining tables across the globe.</Text>
              </View>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Flavor Profile</Text>
                <Text style={styles.benefitDesc}>It provides a unique pungent, earthy, and aromatic flavor to dishes, making it essential in cuisines ranging from Asian to European.</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧬 Nutritional and Medicinal Significance</Text>
              <Text style={styles.sectionText}>
                The primary active compound in black pepper is piperine, which is responsible for its pungent taste and extensive health benefits.
              </Text>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Digestive Aid</Text>
                <Text style={styles.benefitDesc}>Piperine stimulates pancreatic and intestinal enzymes, enhancing digestion and nutrient absorption.</Text>
              </View>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Bioenhancer</Text>
                <Text style={styles.benefitDesc}>A critical function of black pepper is its ability to enhance the bioavailability of other nutrients and phytochemicals (e.g., increasing the absorption of curcumin from turmeric by up to 20-fold).</Text>
              </View>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Therapeutic Properties</Text>
                <Text style={styles.benefitDesc}>It possesses antioxidant, antimicrobial, anti-inflammatory, and antidepressant properties. It is used in traditional medicines (Ayurveda, Unani) to treat respiratory issues, gastrointestinal issues, and to enhance immune function.</Text>
              </View>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Potential Future Medicine</Text>
                <Text style={styles.benefitDesc}>Research suggests piperine may have anti-cancer properties and potential in treating neurodegenerative conditions like Alzheimer's disease.</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏭 Industrial and Agricultural Use</Text>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Food Industry</Text>
                <Text style={styles.benefitDesc}>Beyond household use, it is a key ingredient in the processed food industry, used in meat products, sauces, and as a natural preservative due to its antimicrobial properties.</Text>
              </View>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Cosmetics</Text>
                <Text style={styles.benefitDesc}>It is used in the flavoring and fragrance industry.</Text>
              </View>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Agriculture</Text>
                <Text style={styles.benefitDesc}>Black pepper is an excellent intercropping plant (often grown with coffee or in agroforestry systems), supporting sustainable agricultural practices, particularly in Asia.</Text>
              </View>
            </View>
          </View>
        )}

        {/* MISSION TAB */}
        {activeTab === 'mission' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Our Mission</Text>
              <Text style={styles.missionText}>
                PiperSmart democratizes advanced agricultural intelligence for black pepper farmers worldwide by bridging traditional farming wisdom with cutting-edge technology. We empower farmers to detect crop diseases in real-time, optimize harvest timing, and connect with thriving community networks through AI-powered image analysis and precise crop grading. Our commitment is to maximize farmer profitability by providing market-grade classification that reduces waste and commands premium prices. We believe that breaking geographic isolation through community-driven intelligence accelerates the adoption of sustainable, high-yield cultivation methods.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ Our Vision</Text>
              <Text style={styles.sectionText}>
                We envision revolutionizing global black pepper agriculture by creating an interconnected, intelligent ecosystem that seamlessly bridges traditional farming wisdom with contemporary technology. By 2030, we aspire to empower 500,000+ farmers across Vietnam, India, Indonesia, Brazil, and emerging regions through data-driven precision farming that reduces crop losses by 30-40% and increases premium-grade yield by 25%+. In this vision, farmers own their agricultural data, global cooperatives leverage transparent pricing and blockchain certification, and 50 million crops generate unprecedented insights into pathology and optimization. We envision technology that respects regional traditions while delivering world-class innovation that sustains excellence for generations to come.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💎 Core Values</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bulletBold}>Innovation</Text> - Perpetual technological advancement while respecting traditional wisdom</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bulletBold}>Sustainability</Text> - Environmental stewardship through precision farming and reduced chemical inputs</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bulletBold}>Collaboration</Text> - Community-centric empowerment where farmers co-create solutions</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bulletBold}>Integrity</Text> - Transparent operations and unwavering commitment to farmer welfare</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bulletBold}>Excellence</Text> - Relentless pursuit of accuracy, usability, and impact in every feature</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bulletBold}>Accessibility</Text> - Democratizing modern agriculture for all farmers across diverse contexts</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👨‍💻 Development Team</Text>
              {developers.map((dev, idx) => (
                <View key={idx} style={styles.developerCard}>
                  <Image
                    source={devTeamImages[idx]}
                    style={styles.devProfileImage}
                  />
                  <View style={styles.devInfo}>
                    <Text style={styles.devName}>{dev}</Text>
                    <Text style={styles.devRole}>Team Member</Text>
                  </View>
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
  scrollContent: {
    paddingBottom: 28,
  },
  backgroundDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    overflow: 'hidden',
  },
  decorOrbOne: {
    position: 'absolute',
    top: -90,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(27,77,62,0.10)',
  },
  decorOrbTwo: {
    position: 'absolute',
    top: -30,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(39,174,96,0.12)',
  },
  header: {
    marginTop: 8,
    marginHorizontal: 12,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#0d2b20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  headerGlowTop: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerGlowBottom: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerLogo: {
    width: 82,
    height: 82,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  headerEyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.94)',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 21,
  },
  visionBadge: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 14,
  },
  visionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroStatsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  heroStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  heroStatValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    marginTop: 2,
    fontSize: 10,
    color: 'rgba(255,255,255,0.84)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8E7DF',
    shadowColor: '#123227',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#1B4D3E',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6F8A80',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCEAE3',
    shadowColor: '#123227',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 13,
  },
  titleWithLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLogo: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
    marginRight: 11,
  },
  sectionText: {
    fontSize: 14,
    color: '#4F6961',
    lineHeight: 22,
    marginBottom: 10,
    textAlign: 'justify',
  },
  missionText: {
    fontSize: 14,
    color: '#4F6961',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  bulletPoint: {
    fontSize: 14,
    color: '#4F6961',
    lineHeight: 21,
    marginBottom: 10,
    textAlign: 'justify',
  },
  bulletBold: {
    fontWeight: '700',
    color: '#1B4D3E',
  },
  featureCard: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#F4FAF7',
    borderRadius: 13,
    marginBottom: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#DDEDE4',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 10,
    marginTop: 1,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#55716A',
    textAlign: 'justify',
    lineHeight: 18,
  },
  benefitCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F4FAF7',
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
    borderWidth: 1,
    borderColor: '#DDEDE4',
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 13,
    color: '#55716A',
    textAlign: 'justify',
    lineHeight: 18,
  },
  developerCard: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#F4FAF7',
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDEDE4',
  },
  devProfileImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#D7E7DF',
  },
  devInfo: {
    flex: 1,
  },
  devName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  devRole: {
    fontSize: 12,
    color: '#6D8880',
    marginTop: 2,
    fontWeight: '600',
  },
  spacer: {
    height: 28,
  },
});

