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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileHeader from '../../shared/MobileHeader';
import { getUser } from '../../utils/helpers';

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
      desc: "Leaf Disease Detection"
    },
    {
      icon: "🔬",
      title: "Bunga Analysis",
      desc: "Ripeness Percentage Detection & Health Percentage Detection"
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
          <Image 
            source={require('../../../../picsbl/logowalangbg.png')} 
            style={styles.headerLogo}
          />
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
              <Text style={styles.sectionTitle}>🌶️ Black Pepper: The King of Spices</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 35,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 12,
  },
  headerLogo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 12,
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
    textAlign: 'justify',
  },
  missionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  bulletPoint: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
    textAlign: 'justify',
  },
  bulletBold: {
    fontWeight: '700',
    color: '#1B4D3E',
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
    textAlign: 'justify',
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
    textAlign: 'justify',
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
  devProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    resizeMode: 'cover',
  },
  devInfo: {
    flex: 1,
  },
  devName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B4D3E',
  },
  devRole: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
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
  spacer: {
    height: 30,
  },
});
