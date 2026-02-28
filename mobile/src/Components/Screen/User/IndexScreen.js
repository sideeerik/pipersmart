import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  Image,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import MobileHeader from '../../shared/MobileHeader';
import MobileFooter from '../../shared/MobileFooter';
import { logout, getUser } from '../../utils/helper';

const { width } = Dimensions.get('window');

const detectionImage = require('../../../../picsbl/index1.jpg');

const bpImages = [
  require('../../../../picsbl/index2.png'),
  require('../../../../picsbl/index3.png'),
  require('../../../../picsbl/index4.png'),
];

export default function IndexScreen({ navigation }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const drawerSlideAnim = React.useRef(new Animated.Value(-280)).current;
  
  // Pulse animation for FAB
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselTimerRef = useRef(null);
  
  // Recent Activity Toggle
  const [showRecentActivity, setShowRecentActivity] = useState(false);

  const colors = {
    primary: '#1B4D3E',
    primaryDark: '#0D2818',
    primaryLight: '#E8F5E9',
    secondary: '#FFFFFF',
    background: '#F2F4F0', // Slightly darker for contrast
    text: '#1B4D3E',
    textLight: '#5A7A73',
    border: '#D4E5DD',
    accent: '#D4AF37',
    warning: '#F39C12',
    danger: '#E74C3C',
    success: '#27AE60',
    cardBg: '#FFFFFF',
  };

  const slides = [
    {
      title: 'Black Pepper Disease Detection',
      description: 'Advanced AI-powered analysis for early disease detection',
      image: bpImages[0],
    },
    {
      title: 'Protect Your Crops',
      description: 'Identify diseases early and take preventive measures',
      image: bpImages[1],
    },
    {
      title: 'Smart Farming Solutions',
      description: 'Using machine learning for sustainable farming',
      image: bpImages[2],
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    fetchUser();
    
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start Carousel Timer
    resetCarouselTimer();
    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    };
  }, []);

  const resetCarouselTimer = () => {
    if (carouselTimerRef.current) {
      clearInterval(carouselTimerRef.current);
    }
    carouselTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
  };





  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout(navigation);
        },
      },
    ]);
  };

  const closeDrawer = () => {
    Animated.timing(drawerSlideAnim, {
      toValue: -280,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleNavigation = (screen) => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to access this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    navigation.navigate(screen);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };



  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      <MobileHeader
        navigation={navigation}
        drawerOpen={drawerOpen}
        openDrawer={openDrawer}
        closeDrawer={closeDrawer}
        drawerSlideAnim={drawerSlideAnim}
        user={user}
        onLogout={handleLogout}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userNameText}>{user ? user.name.split(' ')[0] : 'Farmer'}</Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={styles.statusText}>System Online</Text>
            </View>
          </View>
          <View style={styles.welcomeRight}>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
            <View style={styles.weatherBadge}>
              <Feather name="sun" size={20} color={colors.warning} />
              <Text style={styles.weatherText}>28°C</Text>
            </View>
          </View>
        </View>
        {/* Image Slides / Carousel */}
        <View style={styles.carouselContainer}>
          <ImageBackground
            source={slides[currentSlide].image}
            style={styles.carouselSlide}
            resizeMode="cover"
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.carouselOverlay} />
            <View style={styles.carouselContent}>
              <Text style={styles.carouselTitle}>{slides[currentSlide].title}</Text>
              <Text style={styles.carouselDescription}>{slides[currentSlide].description}</Text>
            </View>
            {/* Carousel Indicators */}
            <View style={styles.indicatorsContainer}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentSlide === index ? styles.activeIndicator : styles.inactiveIndicator
                  ]}
                />
              ))}
            </View>
          </ImageBackground>
        </View>

        {/* About PiperSmart Introduction Card */}
        <View style={styles.introCard}>
          <View style={styles.introHeader}>
            <View style={styles.introIcon}>
              <Feather name="shield" size={24} color={colors.primary} />
            </View>
            <Text style={styles.introTitle}>About PiperSmart</Text>
          </View>
          <Text style={styles.introText}>
            Your advanced AI companion for black pepper farming. Detect diseases early, get expert advice, and manage your crops efficiently.
          </Text>
        </View>

        {/* Main Functions - Bento Grid Layout */}
        <View style={styles.bentoGrid}>
          {/* Main Action Card - Leaf Analysis */}
          <TouchableOpacity 
            style={styles.mainCard} 
            onPress={() => handleNavigation('LeafAnalysis')}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={detectionImage}
              style={styles.mainCardBg}
              imageStyle={{ borderRadius: 24, opacity: 0.8 }}
            >
              <View style={styles.mainCardOverlay} />
              <View style={styles.mainCardContent}>
                <View style={styles.mainCardHeader}>
                  <View style={styles.iconCircle}>
                    <Feather name="camera" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>AI READY</Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.mainCardTitle}>Start Detection</Text>
                  <Text style={styles.mainCardSubtitle}>Scan Black Pepper Bunga and Leaves</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Secondary Features Grid */}
          <View style={styles.gridRow}>
            <TouchableOpacity 
              style={[styles.gridCard, { backgroundColor: colors.cardBg }]} 
              onPress={() => handleNavigation('PiperKnowledge')}
            >
              <View style={[styles.gridIcon, { backgroundColor: '#E3F2FD' }]}>
                <Feather name="book-open" size={24} color="#1565C0" />
              </View>
              <Text style={styles.gridTitle}>Knowledge</Text>
              <Text style={styles.gridSubtitle}>Pepper guide</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridCard, { backgroundColor: colors.cardBg }]} 
              onPress={() => handleNavigation('Forum')}
            >
              <View style={[styles.gridIcon, { backgroundColor: '#FFF3E0' }]}>
                <Feather name="users" size={24} color="#EF6C00" />
              </View>
              <Text style={styles.gridTitle}>Community</Text>
              <Text style={styles.gridSubtitle}>Ask experts</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            <TouchableOpacity 
              style={[styles.gridCard, { backgroundColor: colors.cardBg }]} 
              onPress={() => handleNavigation('Macromapping')}
            >
              <View style={[styles.gridIcon, { backgroundColor: '#E8F5E9' }]}>
                <Feather name="map" size={24} color="#2E7D32" />
              </View>
              <Text style={styles.gridTitle}>Farm Map</Text>
              <Text style={styles.gridSubtitle}>Track crops & weather</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridCard, { backgroundColor: colors.cardBg }]} 
              onPress={() => handleNavigation('Messenger')}
            >
              <View style={[styles.gridIcon, { backgroundColor: '#F3E5F5' }]}>
                <Feather name="message-circle" size={24} color="#7B1FA2" />
              </View>
              <Text style={styles.gridTitle}>Messages</Text>
              <Text style={styles.gridSubtitle}>Chat & discuss</Text>
            </TouchableOpacity>
          </View>
          
          {/* About & Contact Row (Public Access) */}
          <View style={styles.gridRow}>
             <TouchableOpacity 
              style={[styles.smallCard, { backgroundColor: colors.cardBg }]} 
              onPress={() => navigation.navigate('About')}
            >
              <Feather name="info" size={20} color={colors.textLight} />
              <Text style={styles.smallCardText}>About</Text>
            </TouchableOpacity>
             <TouchableOpacity 
              style={[styles.smallCard, { backgroundColor: colors.cardBg }]} 
              onPress={() => navigation.navigate('Contact')}
            >
              <Feather name="mail" size={20} color={colors.textLight} />
              <Text style={styles.smallCardText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How It Works - Horizontal Scroll */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepsContainer}>
            <View style={styles.stepCard}>
              <View style={[styles.stepNumber, { backgroundColor: '#E3F2FD' }]}>
                <Text style={[styles.stepNumberText, { color: '#1565C0' }]}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Capture</Text>
              <Text style={styles.stepDesc}>Take a photo of the leaf</Text>
            </View>
            <View style={styles.stepCard}>
              <View style={[styles.stepNumber, { backgroundColor: '#E8F5E9' }]}>
                <Text style={[styles.stepNumberText, { color: '#2E7D32' }]}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Upload</Text>
              <Text style={styles.stepDesc}>Submit to PiperSmart AI</Text>
            </View>
            <View style={styles.stepCard}>
              <View style={[styles.stepNumber, { backgroundColor: '#FFF3E0' }]}>
                <Text style={[styles.stepNumberText, { color: '#EF6C00' }]}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Analyze</Text>
              <Text style={styles.stepDesc}>Get instant diagnosis</Text>
            </View>
            <View style={styles.stepCard}>
              <View style={[styles.stepNumber, { backgroundColor: '#F3E5F5' }]}>
                <Text style={[styles.stepNumberText, { color: '#7B1FA2' }]}>4</Text>
              </View>
              <Text style={styles.stepTitle}>Act</Text>
              <Text style={styles.stepDesc}>Follow expert advice</Text>
            </View>
          </ScrollView>
        </View>

        {/* Recent Activity Section with Toggle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => setShowRecentActivity(!showRecentActivity)}>
              <Feather 
                name={showRecentActivity ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color={colors.textLight} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Recent Activity Content - Toggled */}
          {showRecentActivity && (
            <View style={styles.emptyState}>
              <Feather name="activity" size={32} color={colors.border} />
              <Text style={styles.emptyStateText}>No recent scans found</Text>
              <TouchableOpacity 
                style={styles.scanButtonSmall}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.scanButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button - Camera */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => handleNavigation('LeafAnalysis')}
          activeOpacity={0.8}
        >
          <Feather name="camera" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  welcomeLeft: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  welcomeRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 8,
  },
  greetingText: {
    fontSize: 16,
    color: '#5A7A73',
    fontWeight: '600',
  },
  userNameText: {
    fontSize: 28,
    color: '#1B4D3E',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  weatherText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  carouselContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  carouselSlide: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  carouselContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  carouselTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  carouselDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 13,
    color: '#5A7A73',
    fontWeight: '500',
  },
  bentoGrid: {
    gap: 16,
    marginBottom: 32,
  },
  mainCard: {
    height: 200,
    borderRadius: 24,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  mainCardBg: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  mainCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 77, 62, 0.4)', // Primary color overlay
  },
  mainCardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5252',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  mainCardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mainCardSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  gridCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    height: 140,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: 'space-between',
  },
  gridIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 2,
  },
  gridSubtitle: {
    fontSize: 13,
    color: '#5A7A73',
  },
  smallCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  smallCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A7A73',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4E5DD',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    marginTop: 12,
    marginBottom: 16,
    color: '#5A7A73',
    fontSize: 14,
  },
  scanButtonSmall: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    zIndex: 999,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 4,
    borderColor: '#F2F4F0', // Match bg color for "cutout" effect
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B4D3E',
  },
  introText: {
    fontSize: 14,
    color: '#5A7A73',
    lineHeight: 22,
  },
  stepsContainer: {
    gap: 12,
    paddingRight: 16,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: 140,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4D3E',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: '#5A7A73',
    textAlign: 'center',
  },
});
