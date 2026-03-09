import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MobileHeader from '../../shared/MobileHeader';
import { getUser, logout } from '../../utils/helpers';

const devTeamImages = [
  require('../../../../picsbl/prof1.png'),
  require('../../../../picsbl/prof2.png'),
  require('../../../../picsbl/prof3.png'),
  require('../../../../picsbl/prof4.png'),
];

const features = [
  { icon: '🍃', title: 'Leaf Analysis', desc: 'Leaf Disease Detection' },
  { icon: '🔬', title: 'Peppercorn Analysis', desc: 'Ripeness and Health Percentage Detection' },
  { icon: '🗺️', title: 'Macromapping', desc: 'Spatial visualization, location saving, location details & route guidance' },
  { icon: '🤖', title: 'Chatbot', desc: 'AI-powered farming assistance' },
  { icon: '📝', title: 'Notepad', desc: 'Take Notes, Track Activities' },
  { icon: '📊', title: 'Track Recent Activities', desc: 'Monitor PiperSmart activity history' },
  { icon: '💬', title: 'Community Forum', desc: 'Collaborative knowledge exchange' },
];

const developers = [
  'Even Lloyd S. Billoned',
  'Yhanskie Adriel D. Cipriano',
  'Jenard D. Inojales',
  'Lord Cedric O. Vila',
];

const coreValues = [
  {
    title: 'Innovation',
    desc: 'Perpetual technological advancement while respecting traditional wisdom',
  },
  {
    title: 'Sustainability',
    desc: 'Environmental stewardship through precision farming and reduced chemical inputs',
  },
  {
    title: 'Collaboration',
    desc: 'Community-centric empowerment where farmers co-create solutions',
  },
  {
    title: 'Integrity',
    desc: 'Transparent operations and unwavering commitment to farmer welfare',
  },
  {
    title: 'Excellence',
    desc: 'Relentless pursuit of accuracy, usability, and impact in every feature',
  },
  {
    title: 'Accessibility',
    desc: 'Democratizing modern agriculture for all farmers across diverse contexts',
  },
];

const overviewFeatures = [
  { icon: 'camera', route: 'LeafAnalysis', tint: '#E9F6EE', border: '#CEE6D6', title: 'Leaf Analysis', desc: 'Leaf Disease Detection' },
  { icon: 'aperture', route: 'BungaRipeness', tint: '#EEF1FF', border: '#D8DEFF', title: 'Peppercorn Analysis', desc: 'Ripeness and Health Percentage Detection' },
  { icon: 'map', route: 'Macromapping', tint: '#FFF2E9', border: '#F1DDCF', title: 'Macromapping', desc: 'Spatial visualization, location saving, location details & route guidance' },
  { icon: 'message-circle', route: 'Pipebot', tint: '#EAF7F4', border: '#D0E8DF', title: 'Chatbot', desc: 'AI-powered farming assistance' },
  { icon: 'book-open', route: 'PiperKnowledge', tint: '#EFF7EA', border: '#D6E7C9', title: 'Piper Knowledge', desc: 'Learn black pepper botanical, cultivation, and disease management information' },
  { icon: 'send', route: 'Messenger', tint: '#EEF5FF', border: '#D5E2F2', title: 'Messenger', desc: 'Send direct messages and stay connected with the community' },
  { icon: 'edit-3', route: 'UserHome', tint: '#FFF8EA', border: '#EEDFB9', title: 'Notepad', desc: 'Take Notes, Track Activities' },
  { icon: 'bar-chart-2', route: 'RecentActivities', tint: '#F3EEFF', border: '#DDD2FF', title: 'Track Recent Activities', desc: 'Monitor PiperSmart activity history' },
  { icon: 'users', route: 'Forum', tint: '#EAF4FF', border: '#D3E0F1', title: 'Community Forum', desc: 'Collaborative knowledge exchange' },
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
      { text: 'Logout', style: 'destructive', onPress: () => logout(navigation) },
    ]);
  };

  const handleFeatureNavigation = (screenName) => {
    const protectedScreens = new Set([
      'LeafAnalysis',
      'BungaRipeness',
      'Macromapping',
      'Forum',
      'Messenger',
      'Pipebot',
      'RecentActivities',
      'UserHome',
    ]);

    if (protectedScreens.has(screenName) && !user) {
      Alert.alert(
        'Login Required',
        'Please log in to access this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#1B4D3E" />

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
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#103328', '#1B4D3E', '#2A6A56']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
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
        </LinearGradient>

        <View style={styles.tabContainer}>
          {['overview', 'pepper', 'mission'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {tab === 'overview' ? 'Overview' : tab === 'pepper' ? 'Black Pepper' : 'About Us'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <View style={[styles.section, styles.overviewHeroSection]}>
              <View style={styles.heroGlow} />
              <View style={styles.decoratedHeader}>
                <View style={[styles.iconBadge, styles.forestBadge]}>
                  <Feather name="grid" size={18} color="#1B4D3E" />
                </View>
                <Text style={styles.sectionTitle}>Platform Features</Text>
              </View>

              <View style={styles.overviewGrid}>
                {overviewFeatures.map((feature, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.88}
                    style={styles.overviewCard}
                    onPress={() => handleFeatureNavigation(feature.route)}
                  >
                    <View
                      style={[
                        styles.overviewIconWrap,
                        { backgroundColor: feature.tint, borderColor: feature.border },
                      ]}
                    >
                      <Feather name={feature.icon} size={20} color="#1B4D3E" />
                    </View>
                    <View style={styles.overviewTextWrap}>
                      <Text style={styles.overviewFeatureTitle}>{feature.title}</Text>
                      <Text style={styles.overviewFeatureDesc}>{feature.desc}</Text>
                    </View>
                    <View style={styles.overviewArrowWrap}>
                      <Feather name="arrow-up-right" size={16} color="#1B4D3E" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {false && (
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
        )}

          </View>
        )}

        {activeTab === 'pepper' && (
          <View style={styles.tabContent}>
            <View style={[styles.section, styles.heroSection]}>
              <View style={styles.heroGlow} />
              <View style={styles.heroTitleRow}>
                <View style={styles.logoBadge}>
                  <Image source={require('../../../../picsbl/rara.png')} style={styles.sectionLogo} />
                </View>
                <Text style={[styles.sectionTitle, styles.heroTitle]}>Black Pepper: The King of Spices</Text>
              </View>
              <Text style={styles.sectionText}>
                Black pepper (Piper nigrum), often referred to as the "King of Spices" holds immense global significance, acting as a cornerstone of the international spice trade for thousands of years, a vital culinary staple, and a potent, multi-functional medicinal agent. Native to the Malabar Coast of India, it is currently the world's most traded spice, accounting for approximately 20% of all global spice imports.
              </Text>
            </View>

            <View style={[styles.section, styles.decoratedSection]}>
              <View style={[styles.topAccent, styles.amberAccent]} />
              <View style={styles.decoratedHeader}>
                <View style={[styles.iconBadge, styles.amberBadge]}>
                  <Feather name="dollar-sign" size={18} color="#955A19" />
                </View>
                <Text style={styles.sectionTitle}>💰 Historical and Economic Significance</Text>
              </View>
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

            <View style={[styles.section, styles.decoratedSection]}>
              <View style={[styles.topAccent, styles.terracottaAccent]} />
              <View style={styles.decoratedHeader}>
                <View style={[styles.iconBadge, styles.terracottaBadge]}>
                  <Feather name="coffee" size={18} color="#8B4E1F" />
                </View>
                <Text style={styles.sectionTitle}>🍽️ Culinary Ubiquity</Text>
              </View>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Global Standard</Text>
                <Text style={styles.benefitDesc}>It is one of the few seasonings, along with salt, that is used almost universally in kitchens, restaurants, and dining tables across the globe.</Text>
              </View>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>Flavor Profile</Text>
                <Text style={styles.benefitDesc}>It provides a unique pungent, earthy, and aromatic flavor to dishes, making it essential in cuisines ranging from Asian to European.</Text>
              </View>
            </View>

            <View style={[styles.section, styles.decoratedSection]}>
              <View style={[styles.topAccent, styles.mintAccent]} />
              <View style={styles.decoratedHeader}>
                <View style={[styles.iconBadge, styles.mintBadge]}>
                  <Feather name="activity" size={18} color="#186E59" />
                </View>
                <Text style={styles.sectionTitle}>🧬 Nutritional and Medicinal Significance</Text>
              </View>
              <Text style={styles.sectionText}>The primary active compound in black pepper is piperine, which is responsible for its pungent taste and extensive health benefits.</Text>
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

            <View style={[styles.section, styles.decoratedSection]}>
              <View style={[styles.topAccent, styles.sageAccent]} />
              <View style={styles.decoratedHeader}>
                <View style={[styles.iconBadge, styles.sageBadge]}>
                  <Feather name="briefcase" size={18} color="#406957" />
                </View>
                <Text style={styles.sectionTitle}>🏭 Industrial and Agricultural Use</Text>
              </View>
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

        {activeTab === 'mission' && (
          <View style={styles.tabContent}>
            <View style={[styles.section, styles.heroSection]}>
              <View style={styles.heroGlow} />
              <View style={styles.decoratedHeader}>
                <View style={[styles.iconBadge, styles.forestBadge]}>
                  <Feather name="target" size={18} color="#1B4D3E" />
                </View>
                <Text style={styles.sectionTitle}>🎯 Our Mission</Text>
              </View>
              <Text style={styles.missionText}>PiperSmart democratizes advanced agricultural intelligence for black pepper farmers worldwide by bridging traditional farming wisdom with cutting-edge technology. We empower farmers to detect crop diseases in real-time, optimize harvest timing, and connect with thriving community networks through AI-powered image analysis and precise crop grading. Our commitment is to maximize farmer profitability by providing market-grade classification that reduces waste and commands premium prices. We believe that breaking geographic isolation through community-driven intelligence accelerates the adoption of sustainable, high-yield cultivation methods.</Text>
            </View>

            <View style={[styles.section, styles.decoratedSection]}>
              <View style={[styles.topAccent, styles.skyAccent]} />
              <View style={styles.decoratedHeader}>
                <View style={[styles.iconBadge, styles.skyBadge]}>
                  <Feather name="star" size={18} color="#2B6281" />
                </View>
                <Text style={styles.sectionTitle}>✨ Our Vision</Text>
              </View>
              <Text style={styles.sectionText}>We envision revolutionizing global black pepper agriculture by creating an interconnected, intelligent ecosystem that seamlessly bridges traditional farming wisdom with contemporary technology. By 2030, we aspire to empower 500,000+ farmers across Vietnam, India, Indonesia, Brazil, and emerging regions through data-driven precision farming that reduces crop losses by 30-40% and increases premium-grade yield by 25%+. In this vision, farmers own their agricultural data, global cooperatives leverage transparent pricing and blockchain certification, and 50 million crops generate unprecedented insights into pathology and optimization. We envision technology that respects regional traditions while delivering world-class innovation that sustains excellence for generations to come.</Text>
            </View>

            <View style={[styles.section, styles.decoratedSection]}>
              <View style={[styles.topAccent, styles.roseAccent]} />
              <View style={styles.decoratedHeader}>
                <View style={[styles.iconBadge, styles.roseBadge]}>
                  <Feather name="shield" size={18} color="#8B3F63" />
                </View>
                <Text style={styles.sectionTitle}>💎 Core Values</Text>
              </View>
              <View style={styles.valuesGrid}>
                <View style={[styles.valueColumn, styles.valueColumnLeft]}>
                  {coreValues.slice(0, 3).map((item) => (
                    <View key={item.title} style={styles.valueRow}>
                      <Text style={styles.valueTitle}>{item.title}</Text>
                      <Text style={styles.valueDesc}>{item.desc}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.valueColumn}>
                  {coreValues.slice(3).map((item) => (
                    <View key={item.title} style={styles.valueRow}>
                      <Text style={styles.valueTitle}>{item.title}</Text>
                      <Text style={styles.valueDesc}>{item.desc}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={[styles.section, styles.decoratedSection]}>
              <View style={[styles.topAccent, styles.goldAccent]} />
              <View style={styles.decoratedHeader}>
                <View style={[styles.iconBadge, styles.goldBadge]}>
                  <Feather name="users" size={18} color="#8A6816" />
                </View>
                <Text style={styles.sectionTitle}>👨‍💻 Development Team</Text>
              </View>
              {developers.map((dev, idx) => (
                <View key={idx} style={styles.developerCard}>
                  <Image source={devTeamImages[idx]} style={styles.devProfileImage} />
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
  screen: { flex: 1, backgroundColor: '#EEF4F0' },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 28 },
  backgroundDecor: { position: 'absolute', top: 0, left: 0, right: 0, height: 280, overflow: 'hidden' },
  decorOrbOne: { position: 'absolute', top: -90, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(27,77,62,0.10)' },
  decorOrbTwo: { position: 'absolute', top: -30, left: -80, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(39,174,96,0.12)' },
  header: { marginTop: 8, marginHorizontal: 12, borderRadius: 24, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center' },
  headerLogo: { width: 82, height: 82, resizeMode: 'contain', marginBottom: 10 },
  headerEyebrow: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.8)', marginBottom: 4, fontWeight: '700' },
  headerTitle: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.94)', textAlign: 'center', marginBottom: 12, lineHeight: 21 },
  visionBadge: { backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  visionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  tabContainer: { flexDirection: 'row', marginHorizontal: 12, marginTop: 10, marginBottom: 4, padding: 6, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#D8E7DF' },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabBtnActive: { backgroundColor: '#1B4D3E' },
  tabBtnText: { fontSize: 13, fontWeight: '700', color: '#6F8A80' },
  tabBtnTextActive: { color: '#FFFFFF' },
  tabContent: { gap: 2 },
  section: { paddingHorizontal: 18, paddingVertical: 18, backgroundColor: '#FFFFFF', marginHorizontal: 12, marginVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: '#DCEAE3' },
  heroSection: { overflow: 'hidden', backgroundColor: '#F5FAF7', paddingTop: 22 },
  heroGlow: { position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(52,143,92,0.12)' },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  logoBadge: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D7E7DF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  heroTitle: { marginBottom: 0, flex: 1 },
  heroCopy: { color: '#4A655D', marginBottom: 0 },
  decoratedSection: { overflow: 'hidden', paddingTop: 22 },
  topAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 6, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  amberAccent: { backgroundColor: '#D99B3B' },
  terracottaAccent: { backgroundColor: '#D07A4D' },
  mintAccent: { backgroundColor: '#23A07A' },
  sageAccent: { backgroundColor: '#6E9A7E' },
  skyAccent: { backgroundColor: '#4D8FB7' },
  roseAccent: { backgroundColor: '#BE6E93' },
  goldAccent: { backgroundColor: '#C6A54A' },
  decoratedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconBadge: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginRight: 12 },
  amberBadge: { backgroundColor: '#FFF3E2', borderColor: '#F2DDC0' },
  terracottaBadge: { backgroundColor: '#FFF0E8', borderColor: '#F0D7C9' },
  mintBadge: { backgroundColor: '#EAF7F1', borderColor: '#D1EBDD' },
  sageBadge: { backgroundColor: '#EEF6F1', borderColor: '#D9E7DE' },
  forestBadge: { backgroundColor: '#E7F4ED', borderColor: '#D1E7DA' },
  skyBadge: { backgroundColor: '#EAF4FB', borderColor: '#D5E4EF' },
  roseBadge: { backgroundColor: '#FAEDF4', borderColor: '#EED4E1' },
  goldBadge: { backgroundColor: '#FFF7E7', borderColor: '#F0E2BD' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1B4D3E', marginBottom: 13, flex: 1 },
  sectionLogo: { width: 42, height: 42, resizeMode: 'contain' },
  sectionText: { fontSize: 14, color: '#4F6961', lineHeight: 22, marginBottom: 10, textAlign: 'justify' },
  missionText: { fontSize: 14, color: '#4F6961', lineHeight: 22, marginBottom: 0, textAlign: 'justify' },
  overviewHeroSection: { overflow: 'hidden', backgroundColor: '#F5FAF7', paddingTop: 22 },
  overviewGrid: { gap: 12 },
  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDEDE4',
  },
  overviewIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  overviewTextWrap: { flex: 1, minWidth: 0 },
  overviewFeatureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4D3E',
    marginBottom: 4,
  },
  overviewFeatureDesc: {
    fontSize: 13,
    color: '#55716A',
    lineHeight: 18,
  },
  overviewArrowWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECF5F0',
    borderWidth: 1,
    borderColor: '#D8E9DF',
    marginLeft: 10,
  },
  featureCard: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#F4FAF7', borderRadius: 13, marginBottom: 10, alignItems: 'flex-start', borderWidth: 1, borderColor: '#DDEDE4' },
  featureIcon: { fontSize: 24, marginRight: 10, marginTop: 1 },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '800', color: '#1B4D3E', marginBottom: 4 },
  featureDesc: { fontSize: 13, color: '#55716A', textAlign: 'justify', lineHeight: 18 },
  benefitCard: { paddingHorizontal: 15, paddingVertical: 14, backgroundColor: '#F8FCFA', borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#DDEDE4' },
  benefitTitle: { fontSize: 15, fontWeight: '800', color: '#1B4D3E', marginBottom: 5 },
  benefitDesc: { fontSize: 13, color: '#55716A', textAlign: 'justify', lineHeight: 19 },
  valuesGrid: { flexDirection: 'row', alignItems: 'flex-start' },
  valueColumn: { flex: 1 },
  valueColumnLeft: { marginRight: 6 },
  valueRow: { paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#F8FCFA', borderRadius: 13, borderWidth: 1, borderColor: '#DDEDE4', marginBottom: 10, minHeight: 112 },
  valueTitle: { fontSize: 15, fontWeight: '800', color: '#1B4D3E', marginBottom: 6 },
  valueDesc: { fontSize: 13, color: '#55716A', lineHeight: 19 },
  bulletPoint: { fontSize: 14, color: '#4F6961', lineHeight: 21, textAlign: 'justify' },
  bulletBold: { fontWeight: '700', color: '#1B4D3E' },
  developerCard: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#F8FCFA', borderRadius: 14, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#DDEDE4' },
  devProfileImage: { width: 58, height: 58, borderRadius: 29, marginRight: 14, resizeMode: 'cover', borderWidth: 2, borderColor: '#D7E7DF' },
  devInfo: { flex: 1 },
  devName: { fontSize: 14, fontWeight: '700', color: '#1B4D3E', marginBottom: 3 },
  devRole: { alignSelf: 'flex-start', fontSize: 11, color: '#5D7C72', fontWeight: '700', backgroundColor: '#E8F5EE', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  spacer: { height: 28 },
});
