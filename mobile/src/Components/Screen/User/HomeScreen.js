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
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { BACKEND_URL } from 'react-native-dotenv';
import { LinearGradient } from 'expo-linear-gradient';
import MobileHeader from '../../shared/MobileHeader';
import Notepad from '../../shared/Notepad';
import { logout, getUser, getToken } from '../../utils/helpers';

const { width } = Dimensions.get('window');

const detectionImage = require('../../../../picsbl/index1.jpg');

const bpImages = [
  require('../../../../picsbl/index2.png'),
  require('../../../../picsbl/index3.png'),
  require('../../../../picsbl/index4.png'),
];

export default function HomeScreen({ navigation }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const drawerSlideAnim = React.useRef(new Animated.Value(-280)).current;
  
  // Pulse animation for FAB
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselTimerRef = useRef(null);

  const colors = {
    primary: '#0E3B2E',
    primaryDark: '#0A241C',
    primaryLight: '#EAF4EF',
    secondary: '#FFFFFF',
    background: '#F3F7F4', // Slightly darker for contrast
    text: '#0E3B2E',
    textLight: '#5A6B63',
    border: '#DDE7E1',
    accent: '#C9A227',
    warning: '#F2A93B',
    danger: '#E2554D',
    success: '#2BB673',
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

  const howItWorksSteps = [
    {
      key: 'choose',
      number: '01',
      title: 'Choose',
      desc: 'Select leaf or peppercorn analysis',
      icon: 'compass',
      colors: ['#E3F2FD', '#FFFFFF'],
      accent: '#1565C0',
    },
    {
      key: 'capture',
      number: '02',
      title: 'Capture',
      desc: 'Use the in-app camera or gallery',
      icon: 'camera',
      colors: ['#EAF4EF', '#FFFFFF'],
      accent: '#2E7D32',
    },
    {
      key: 'analyze',
      number: '03',
      title: 'Analyze',
      desc: 'AI evaluates the image',
      icon: 'cpu',
      colors: ['#FFF3E0', '#FFFFFF'],
      accent: '#EF6C00',
    },
    {
      key: 'results',
      number: '04',
      title: 'Shows Results',
      desc: 'Disease or ripeness results',
      icon: 'bar-chart-2',
      colors: ['#F3E5F5', '#FFFFFF'],
      accent: '#7B1FA2',
    },
    {
      key: 'advice',
      number: '05',
      title: 'Advice',
      desc: 'Follow the recommended actions',
      icon: 'check-circle',
      colors: ['#E8F5E9', '#FFFFFF'],
      accent: '#2E7D32',
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    fetchUser();
    fetchRecentActivities();
    
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

  const fetchRecentActivities = async () => {
    try {
      setLoadingActivities(true);
      const token = await getToken();
      if (!token) {
        setLoadingActivities(false);
        return;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/activities/limited?limit=3`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        }
      );

      if (response.data.success) {
        setRecentActivities(response.data.data.activities);
        console.log('✅ Fetched recent activities:', response.data.data.activities.length);
      }
    } catch (error) {
      console.error('❌ Error fetching recent activities:', error.message);
    } finally {
      setLoadingActivities(false);
    }
  };

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

  const handleStartDetection = () => {
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

    Alert.alert(
      'Start Detection',
      'What do you want to detect?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leaf Disease', onPress: () => navigation.navigate('LeafAnalysis') },
        { text: 'Peppercorn', onPress: () => navigation.navigate('BungaRipeness') },
      ]
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'BUNGA_ANALYSIS':
        return { image: require('../../../../picsbl/logowalangbg.png'), color: colors.warning };
      case 'LEAF_ANALYSIS':
        return { name: 'activity', color: colors.success };
      case 'FORUM_POST':
        return { name: 'message-circle', color: colors.primary };
      case 'SAVED_LOCATION':
        return { name: 'map-pin', color: colors.danger };
      default:
        return { name: 'activity', color: colors.textLight };
    }
  };

  const getActivityTitle = (activity) => {
    switch (activity.type) {
      case 'BUNGA_ANALYSIS':
        return `Peppercorn: ${activity.results?.full_class || 'Analysis'}`;
      case 'LEAF_ANALYSIS':
        return `Leaf: ${activity.results?.disease || 'Analysis'}`;
      case 'FORUM_POST':
        return `Forum Post`;
      case 'SAVED_LOCATION':
        return `Saved: ${activity.farm.name}`;
      default:
        return 'Activity';
    }
  };

  const getActivityBadgeLabel = (type) => {
    if (type === 'BUNGA_ANALYSIS') return 'Peppercorn';
    if (type === 'LEAF_ANALYSIS') return 'Leaf';
    if (type === 'FORUM_POST') return 'Forum';
    if (type === 'SAVED_LOCATION') return 'Location';
    return 'Activity';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        <View pointerEvents="none" style={styles.backgroundDecor}>
          <View style={styles.decorCircleA} />
          <View style={styles.decorCircleB} />
        </View>
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
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
                <Text style={styles.weatherText}>28 C</Text>
              </View>
            </View>
          </View>
        </View>

        {/* System Introduction Card */}
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

        {/* Introduction / Carousel Section */}
        <View style={styles.carouselContainer}>
          <ImageBackground
            source={slides[currentSlide].image}
            style={styles.carouselSlide}
            resizeMode="cover"
            imageStyle={{ borderRadius: 16 }}
          >
            <LinearGradient
              colors={['rgba(14, 59, 46, 0.1)', 'rgba(14, 59, 46, 0.7)']}
              style={styles.carouselOverlay}
            />
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

        {/* How It Works - Horizontal Scroll */}
        <View style={styles.howItWorksSection}>
          <View style={styles.howItWorksHeader}>
            <View>
              <Text style={styles.sectionTitle}>How It Works</Text>
              <Text style={styles.howItWorksSub}>Choose - Capture - Analyze - Shows Results - Advice</Text>
            </View>
            <View style={styles.howItWorksBadge}>
              <Feather name="zap" size={14} color="#FFFFFF" />
              <Text style={styles.howItWorksBadgeText}>5 Steps</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.howItWorksScroller}
          >
            {howItWorksSteps.map((step, idx) => (
              <LinearGradient
                key={step.key}
                colors={step.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.howItWorksCard}
              >
                <View style={[styles.howItWorksAccent, { backgroundColor: step.accent }]} />
                <Text style={styles.howItWorksNumber}>{step.number}</Text>
                <View style={[styles.howItWorksIconWrap, { borderColor: step.accent }]}> 
                  <Feather name={step.icon} size={20} color={step.accent} />
                </View>
                <Text style={styles.howItWorksTitle}>{step.title}</Text>
                <Text style={styles.howItWorksDesc}>{step.desc}</Text>
                <View style={styles.howItWorksFooter}>
                  <View style={[styles.howItWorksDot, { backgroundColor: step.accent }]} />
                  <Text style={[styles.howItWorksStepLabel, { color: step.accent }]}>Step {idx + 1}</Text>
                </View>
              </LinearGradient>
            ))}
          </ScrollView>
        </View>
        {/* Bento Grid Layout */}
        <View style={styles.bentoGrid}>
          {/* Main Action Card - Leaf Analysis */}
          <TouchableOpacity 
            style={styles.mainCard} 
            onPress={handleStartDetection}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={detectionImage}
              style={styles.mainCardBg}
              imageStyle={{ borderRadius: 24, opacity: 0.8 }}
            >
              <LinearGradient
                colors={['rgba(14, 59, 46, 0.2)', 'rgba(14, 59, 46, 0.75)']}
                style={styles.mainCardOverlay}
              />
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
                  <Text style={styles.mainCardSubtitle}>Choose leaf or peppercorn detection</Text>
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
              <View style={[styles.gridIcon, { backgroundColor: '#EAF4EF' }]}>
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

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => handleNavigation('RecentActivities')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {loadingActivities ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : recentActivities.length > 0 ? (
            <View style={styles.activitiesContainer}>
              {recentActivities.map((activity, index) => {
                const iconData = getActivityIcon(activity.type);
                return (
                  <View key={index} style={styles.activityItemHome}>
                    <View style={[styles.activityIconHome, { backgroundColor: iconData.color + '20' }]}>
                      {iconData.image ? (
                        <Image source={iconData.image} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
                      ) : (
                        <Feather name={iconData.name} size={20} color={iconData.color} />
                      )}
                    </View>
                    <View style={styles.activityDetailsHome}>
                      <Text style={styles.activityTitleHome}>{getActivityTitle(activity)}</Text>
                      <Text style={styles.activityTimeHome}>
                        {formatDate(activity.createdAt || activity.savedAt)}
                      </Text>
                    </View>
                    <View style={styles.activityBadgeHome}>
                      <Text style={styles.badgeTypeHome}>{getActivityBadgeLabel(activity.type)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Feather name="activity" size={32} color={colors.border} />
              <Text style={styles.emptyStateText}>No recent activities yet</Text>
              <TouchableOpacity 
                style={styles.scanButtonSmall}
                onPress={handleStartDetection}
              >
                <Text style={styles.scanButtonText}>Start Scanning</Text>
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
          onPress={handleStartDetection}
          activeOpacity={0.8}
        >
          <Feather name="camera" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Floating Notepad */}
      <Notepad />
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
  backgroundDecor: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 220,
    overflow: 'hidden',
  },
  decorCircleA: {
    position: 'absolute',
    top: -60,
    left: -80,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(14, 59, 46, 0.08)',
  },
  decorCircleB: {
    position: 'absolute',
    top: -30,
    right: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(43, 182, 115, 0.12)',
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DDE7E1',
    shadowColor: '#0E3B2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
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
    color: '#5A6B63',
    fontWeight: '600',
  },
  userNameText: {
    fontSize: 28,
    color: '#0E3B2E',
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
    borderWidth: 1,
    borderColor: '#DDE7E1',
    shadowColor: '#0E3B2E',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  weatherText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0E3B2E',
  },
  carouselContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#0E3B2E',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: '#DDE7E1',
  },
  carouselSlide: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
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
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(43, 182, 115, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#2BB673',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 13,
    color: '#5A6B63',
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
    shadowColor: '#0E3B2E',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  mainCardBg: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  mainCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
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
    backgroundColor: '#F3F7F4',
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
    shadowColor: '#0E3B2E',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DDE7E1',
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
    color: '#0E3B2E',
    marginBottom: 2,
  },
  gridSubtitle: {
    fontSize: 13,
    color: '#5A6B63',
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
    shadowColor: '#0E3B2E',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#DDE7E1',
  },
  smallCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A6B63',
  },
  section: {
    marginBottom: 24,
  },
  howItWorksSection: {
    marginBottom: 26,
  },
  howItWorksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  howItWorksSub: {
    fontSize: 12,
    color: '#5A6B63',
    marginTop: 6,
    fontWeight: '600',
  },
  howItWorksBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#1B4D3E',
  },
  howItWorksBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  howItWorksScroller: {
    paddingRight: 16,
    gap: 14,
  },
  howItWorksCard: {
    width: 210,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDE7E1',
    shadowColor: '#0E3B2E',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
  },
  howItWorksAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 6,
    height: '100%',
  },
  howItWorksNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0E3B2E',
    opacity: 0.2,
    alignSelf: 'flex-end',
  },
  howItWorksIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -6,
    backgroundColor: '#FFFFFF',
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0E3B2E',
    marginTop: 12,
  },
  howItWorksDesc: {
    fontSize: 12,
    color: '#5A6B63',
    marginTop: 6,
    lineHeight: 18,
  },
  howItWorksFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  howItWorksDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  howItWorksStepLabel: {
    fontSize: 11,
    fontWeight: '700',
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
    color: '#0E3B2E',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2BB673',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE7E1',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    marginTop: 12,
    marginBottom: 16,
    color: '#5A6B63',
    fontSize: 14,
  },
  scanButtonSmall: {
    backgroundColor: '#0E3B2E',
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
    backgroundColor: '#0E3B2E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 4,
    borderColor: '#F3F7F4', // Match bg color for "cutout" effect
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#0E3B2E',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: '#DDE7E1',
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
    backgroundColor: '#EAF4EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0E3B2E',
  },
  introText: {
    fontSize: 14,
    color: '#5A6B63',
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
    shadowColor: '#0E3B2E',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: '#DDE7E1',
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
    color: '#0E3B2E',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: '#5A6B63',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activitiesContainer: {
    gap: 12,
  },
  activityItemHome: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  activityIconHome: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetailsHome: {
    flex: 1,
  },
  activityTitleHome: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E3B2E',
    marginBottom: 2,
  },
  activityTimeHome: {
    fontSize: 11,
    color: '#5A6B63',
    fontWeight: '500',
  },
  activityBadgeHome: {
    backgroundColor: '#EAF4EF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeTypeHome: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0E3B2E',
    textTransform: 'uppercase',
  },
});





