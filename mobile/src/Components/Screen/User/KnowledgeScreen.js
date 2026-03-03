import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  ActivityIndicator,
  Linking,
  TextInput,
  RefreshControl,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import axios from 'axios';
import MobileHeader from '../../shared/MobileHeader';
import { getUser, logout } from '../../utils/helpers';
import { BACKEND_URL } from 'react-native-dotenv';

const bpImages = [
  require('../../../../picsbl/11.png'),
  require('../../../../picsbl/12.png'),
  require('../../../../picsbl/13.png'),
];

const botanicalImages = [
  require('../../../../picsbl/index1.jpg'),
  require('../../../../picsbl/index2.png'),
  require('../../../../picsbl/index3.png'),
];

const diseaseImages = [
  require('../../../../picsbl/14.jpg'),
  require('../../../../picsbl/15.jpg'),
  require('../../../../picsbl/16.jpg'),
  require('../../../../picsbl/17.jpg'),
  require('../../../../picsbl/18.jpg'),
];

const benefitsImages = [
  require('../../../../picsbl/19.jpg'),
  require('../../../../picsbl/20.jpg'),
  require('../../../../picsbl/21.jpg'),
];

export default function KnowledgeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerSlideAnim = useRef(new Animated.Value(-280)).current;
  const [activeTab, setActiveTab] = useState('overview');
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const contentAnim = useRef(new Animated.Value(1)).current;
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;
  const tabLayoutsRef = useRef({});
  const skeletonAnim = useRef(new Animated.Value(0)).current;
  const pagerRef = useRef(null);
  const pageWidth = Dimensions.get('window').width;
  const factAnims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  const sunPulse = useRef(new Animated.Value(0)).current;
  const rainDrop = useRef(new Animated.Value(0)).current;
  const hotspotLeaf = useRef(new Animated.Value(0)).current;
  const hotspotSpike = useRef(new Animated.Value(0)).current;
  const hotspotRoot = useRef(new Animated.Value(0)).current;
  const [tooltipLeaf, setTooltipLeaf] = useState(false);
  const [tooltipSpike, setTooltipSpike] = useState(false);
  const [tooltipRoot, setTooltipRoot] = useState(false);
  const aiGlow = useRef(new Animated.Value(0)).current;
  const [soilProgress, setSoilProgress] = useState(0.15);
  const [diseaseProgress, setDiseaseProgress] = useState(0.35);
  const [postProgress, setPostProgress] = useState(0.05);
  const soilAnim = useRef(new Animated.Value(0.15)).current;
  const diseaseAnim = useRef(new Animated.Value(0.35)).current;
  const postAnim = useRef(new Animated.Value(0.05)).current;
  const [botanicalActive, setBotanicalActive] = useState('classification');
  const [benefitsTab, setBenefitsTab] = useState('nutrition');
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [expandedGuide, setExpandedGuide] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentBotanicalSlide, setCurrentBotanicalSlide] = useState(0);
  const [currentDiseaseSlide, setCurrentDiseaseSlide] = useState(0);
  const [currentBenefitsSlide, setCurrentBenefitsSlide] = useState(0);
  const carouselTimerRef = useRef(null);
  const botanicalCarouselTimerRef = useRef(null);
  const diseaseCarouselTimerRef = useRef(null);
  const benefitsCarouselTimerRef = useRef(null);

  const pepperGuide = [
    {
      icon: '🌿',
      title: 'Botanical Profile',
      heading: 'Scientific Name: Piper nigrum',
      highlights: ['Member of Piperaceae family', 'Perennial woody vine', 'Native to Malabar Coast, India'],
      details: 'A perennial, woody, climbing vine that can reach heights of 10 meters or more if left unsupported. Produces "spikes" with 50-150 tiny flowers that develop into peppercorn drupes. The same plant produces black, white, green, and red pepper—the difference lies in berry maturity and processing.',
      bgColor: '#E8F5E9',
      accent: '#2E7D32',
    },
    {
      icon: '☀️',
      title: 'Temperature & Climate',
      heading: 'Optimal: 24–30°C',
      highlights: ['Tropical plant requirement', 'Humidity above 75% ideal', 'Chill injury below 10°C'],
      details: 'While it thrives at 28°C, it can tolerate a range between 10°C and 40°C. Requires hot and humid environment. High humidity is essential for pollination, as pollen is washed down the spike by dew or light rain to reach female flowers.',
      bgColor: '#FFF3E0',
      accent: '#EF6C00',
    },
    {
      icon: '🌧️',
      title: 'Rainfall & Irrigation',
      heading: '2000–3000 mm/year',
      highlights: ['Well-distributed rain essential', 'Drought sensitive (>30 days)', 'Pre-flowering dry period beneficial'],
      details: 'Distribution is more important than total amount—requires frequent, well-distributed rain throughout the year. Highly sensitive to long dry spells; if drought exceeds 30 days, supplemental irrigation is required. A short dry period of 20–30 days before flowering triggers massive flower flush.',
      bgColor: '#E3F2FD',
      accent: '#1565C0',
    },
    {
      icon: '🏔️',
      title: 'Soil Requirements',
      heading: 'Loamy, pH 5.5–6.3',
      highlights: ['Deep, well-drained loam', 'Rich in organic matter', 'Avoid waterlogging >24-48 hrs'],
      details: 'Best soils are deep, friable, and well-drained loams (Red Latosols or Alluvial soils). Must be rich in organic matter and high in Nitrogen, Phosphorus, and Potassium. Prefers slightly acidic conditions. Waterlogging is the plant\'s "Achilles\' heel"—causes Quick Wilt (Phytophthora capsici), a fungus that kills plantations in days.',
      bgColor: '#F3E5F5',
      accent: '#7B1FA2',
    },
  ];

  useEffect(() => {
    const init = async () => {
      const u = await getUser();
      setUser(u);
      fetchLatestNews();
    };
    init();
  }, []);

  useEffect(() => {
    const resetCarouselTimer = () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
      carouselTimerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % bpImages.length);
      }, 5000);
    };
    resetCarouselTimer();
    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const resetBotanicalCarouselTimer = () => {
      if (botanicalCarouselTimerRef.current) {
        clearInterval(botanicalCarouselTimerRef.current);
      }
      botanicalCarouselTimerRef.current = setInterval(() => {
        setCurrentBotanicalSlide((prev) => (prev + 1) % botanicalImages.length);
      }, 5000);
    };
    resetBotanicalCarouselTimer();
    return () => {
      if (botanicalCarouselTimerRef.current) {
        clearInterval(botanicalCarouselTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const resetDiseaseCarouselTimer = () => {
      if (diseaseCarouselTimerRef.current) {
        clearInterval(diseaseCarouselTimerRef.current);
      }
      diseaseCarouselTimerRef.current = setInterval(() => {
        setCurrentDiseaseSlide((prev) => (prev + 1) % diseaseImages.length);
      }, 5000);
    };
    resetDiseaseCarouselTimer();
    return () => {
      if (diseaseCarouselTimerRef.current) {
        clearInterval(diseaseCarouselTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const resetBenefitsCarouselTimer = () => {
      if (benefitsCarouselTimerRef.current) {
        clearInterval(benefitsCarouselTimerRef.current);
      }
      benefitsCarouselTimerRef.current = setInterval(() => {
        setCurrentBenefitsSlide((prev) => (prev + 1) % benefitsImages.length);
      }, 5000);
    };
    resetBenefitsCarouselTimer();
    return () => {
      if (benefitsCarouselTimerRef.current) {
        clearInterval(benefitsCarouselTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (loadingNews) {
      skeletonAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(skeletonAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [loadingNews]);

  useEffect(() => {
    Animated.stagger(120, factAnims.map((a) => Animated.timing(a, { toValue: 1, duration: 350, useNativeDriver: true }))).start();
    Animated.loop(Animated.sequence([Animated.timing(sunPulse, { toValue: 1, duration: 900, useNativeDriver: true }), Animated.timing(sunPulse, { toValue: 0, duration: 900, useNativeDriver: true })])).start();
    Animated.loop(Animated.sequence([Animated.timing(rainDrop, { toValue: 1, duration: 1000, useNativeDriver: true }), Animated.timing(rainDrop, { toValue: 0, duration: 1000, useNativeDriver: true })])).start();
    Animated.loop(Animated.sequence([Animated.timing(hotspotLeaf, { toValue: 1, duration: 1200, useNativeDriver: true }), Animated.timing(hotspotLeaf, { toValue: 0, duration: 1200, useNativeDriver: true })])).start();
    Animated.loop(Animated.sequence([Animated.timing(hotspotSpike, { toValue: 1, duration: 1200, useNativeDriver: true }), Animated.timing(hotspotSpike, { toValue: 0, duration: 1200, useNativeDriver: true })])).start();
    Animated.loop(Animated.sequence([Animated.timing(hotspotRoot, { toValue: 1, duration: 1200, useNativeDriver: true }), Animated.timing(hotspotRoot, { toValue: 0, duration: 1200, useNativeDriver: true })])).start();
    Animated.loop(Animated.sequence([Animated.timing(aiGlow, { toValue: 1, duration: 1200, useNativeDriver: true }), Animated.timing(aiGlow, { toValue: 0, duration: 1200, useNativeDriver: true })])).start();
    soilAnim.setValue(soilProgress);
    diseaseAnim.setValue(diseaseProgress);
    postAnim.setValue(postProgress);
  }, []);

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

  const getDefaultNews = () => {
    return [
      { id: 1, title: 'Global Black Pepper Market Growth Trends 2024', date: 'January 2024', description: 'The global black pepper market is expected to grow at a CAGR of 5.2% from 2024 to 2030, driven by increasing demand for spices in food processing and medicinal applications.', link: 'https://example.com/pepper-market-trends', source: 'Agricultural News' },
      { id: 2, title: 'Precision Agriculture in Pepper Farming', date: 'February 2024', description: 'AI-driven disease detection and soil analysis tools are helping pepper farmers improve yields and reduce losses.', link: 'https://example.com/precision-agriculture-pepper', source: 'Farm Tech Daily' },
      { id: 3, title: 'Sustainable Pepper Cultivation Practices', date: 'March 2024', description: 'New guidelines focus on water management, organic fertilization, and biodiversity preservation in pepper farms.', link: 'https://example.com/sustainable-pepper', source: 'Eco Agriculture' },
    ];
  };

  const fetchLatestNews = async () => {
    setLoadingNews(true);
    try {
      // Try backend first
      const res = await axios.get(`${BACKEND_URL}/api/v1/news/latest`, { timeout: 8000 });
      const items = res.data?.news && Array.isArray(res.data.news) ? res.data.news : getDefaultNews();
      setNews(items);
    } catch (e) {
      try {
        // Fallback to NewsAPI for pepper/agriculture news
        const newsRes = await axios.get('https://newsapi.org/v2/everything?q=black+pepper+farming&sortBy=publishedAt&language=en&pageSize=9&searchIn=description,title&sources=the-times-of-india,the-hindu,economic-times', {
          headers: { 'X-Api-Key': 'b527e976920f412780d315f22028c35d' },
          timeout: 8000,
        });
        if (newsRes.data?.articles && Array.isArray(newsRes.data.articles)) {
          const formatted = newsRes.data.articles.slice(0, 6).map((a, i) => ({
            id: i,
            title: a.title,
            description: a.description,
            date: new Date(a.publishedAt).toLocaleDateString(),
            source: a.source.name,
            link: a.url,
            image: a.urlToImage,
          }));
          setNews(formatted);
        } else {
          setNews(getDefaultNews());
        }
      } catch (err) {
        setNews(getDefaultNews());
      }
    } finally {
      setLoadingNews(false);
    }
  };

  const toggleExpand = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTabPress = (id, index) => {
    setActiveTab(id);
    setActiveIndex(index);
    contentAnim.setValue(0);
    Animated.timing(contentAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    const layout = tabLayoutsRef.current[id];
    if (layout) {
      Animated.parallel([
        Animated.timing(indicatorX, { toValue: layout.x, duration: 200, useNativeDriver: false }),
        Animated.timing(indicatorW, { toValue: layout.width, duration: 200, useNativeDriver: false }),
      ]).start();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'botanical', label: 'Botanical' },
    { id: 'diseases', label: 'Disease Management' },
    { id: 'benefits', label: 'Health Benefits' },
    { id: 'cultivation', label: 'Cultivation' },
    { id: 'news', label: 'News & Resources' },
  ];

  const colors = {
    primary: '#1B4D3E',
    background: '#F8FAF7',
    text: '#1B4D3E',
    textLight: '#6b7280',
    border: '#D4E5DD',
    accent: '#22c55e',
    card: '#FFFFFF',
  };

  const filteredNews = news.filter((n) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (n.title || '').toLowerCase().includes(q) ||
      (n.description || '').toLowerCase().includes(q) ||
      (n.source || '').toLowerCase().includes(q)
    );
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLatestNews();
    setRefreshing(false);
  };

  const Hero = () => {
    return (
      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Piper Knowledge</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textLight }]}>
          Your comprehensive guide to black pepper cultivation and management
        </Text>
      </View>
    );
  };

  const ExpandableContent = ({ visible, children }) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      if (visible) {
        anim.setValue(0);
        Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      }
    }, [visible]);
    if (!visible) return null;
    return (
      <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
        {children}
      </Animated.View>
    );
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
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Hero />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsWrapper}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((t, idx) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabButton, activeTab === t.id && styles.tabButtonActive]}
              onPress={() => {
                handleTabPress(t.id, idx);
                if (pagerRef.current) {
                  pagerRef.current.scrollTo({ x: idx * pageWidth, animated: true });
                }
              }}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                tabLayoutsRef.current[t.id] = { x, width };
                if (idx === activeIndex && indicatorW._value === 0) {
                  indicatorX.setValue(x);
                  indicatorW.setValue(width);
                }
              }}
            >
              <Text style={[styles.tabButtonText, activeTab === t.id && styles.tabButtonTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
          <Animated.View style={[styles.tabIndicator, { backgroundColor: colors.accent, left: indicatorX, width: indicatorW }]} />
        </ScrollView>

        <ScrollView
          horizontal
          pagingEnabled
          ref={pagerRef}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const idx = Math.round(x / pageWidth);
            const tab = tabs[idx]?.id || 'overview';
            setActiveIndex(idx);
            setActiveTab(tab);
            const layout = tabLayoutsRef.current[tab];
            if (layout) {
              Animated.parallel([
                Animated.timing(indicatorX, { toValue: layout.x, duration: 200, useNativeDriver: false }),
                Animated.timing(indicatorW, { toValue: layout.width, duration: 200, useNativeDriver: false }),
              ]).start();
            }
          }}
        >
          <ScrollView style={{ width: pageWidth }} nestedScrollEnabled>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>What is Black Pepper?</Text>

              {/* Black Pepper Carousel */}
              <View style={[styles.carouselContainer, { borderColor: colors.border }]}>
                <Image
                  source={bpImages[currentSlide]}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
                <View style={styles.carouselOverlay} />
                {/* Carousel Indicators */}
                <View style={styles.indicatorsContainer}>
                  {bpImages.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.carouselIndicator,
                        currentSlide === index ? styles.activeCarouselIndicator : styles.inactiveCarouselIndicator
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Black Pepper Guide - Interactive */}
              <View style={{ marginTop: 24 }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Black Pepper Guide</Text>
                <Text style={[styles.guideSubtext, { color: colors.textLight }]}>Understand your crop's needs</Text>
                
                <View style={styles.guideCardsContainer}>
                  {pepperGuide.map((guide, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.guideCard,
                        expandedGuide === index && styles.guideCardExpanded,
                        { backgroundColor: guide.bgColor, borderColor: colors.border }
                      ]}
                      onPress={() => setExpandedGuide(expandedGuide === index ? -1 : index)}
                      activeOpacity={0.7}
                    >
                      {/* Card Header */}
                      <View style={styles.guideCardHeader}>
                        <View style={styles.guideIconContainer}>
                          <Text style={styles.guideIcon}>{guide.icon}</Text>
                        </View>
                        <View style={styles.guideTitleContainer}>
                          <Text style={[styles.guideCardTitle, { color: colors.text }]}>{guide.title}</Text>
                          <Text style={[styles.guideHeading, { color: guide.accent }]}>
                            {guide.heading}
                          </Text>
                        </View>
                        <Text style={[styles.expandIcon, { color: guide.accent }]}>
                          {expandedGuide === index ? '▼' : '▶'}
                        </Text>
                      </View>

                      {/* Highlights (always visible) */}
                      <View style={styles.highlightsContainer}>
                        {guide.highlights.map((highlight, hIdx) => (
                          <View key={hIdx} style={[styles.highlightBadge, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
                            <Text style={[styles.highlightText, { color: guide.accent }]}>
                              • {highlight}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Expandable Details */}
                      {expandedGuide === index && (
                        <View style={[styles.detailsContainer, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
                          <Text style={[styles.detailsText, { color: colors.text }]}>{guide.details}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <ScrollView style={{ width: pageWidth }} nestedScrollEnabled>
            <View style={styles.section}>
              <View style={styles.subtabs}>
                {['classification', 'morphology', 'growth'].map((k) => (
                  <TouchableOpacity
                    key={k}
                    style={[styles.subtabBtn, botanicalActive === k && styles.subtabBtnActive]}
                    onPress={() => setBotanicalActive(k)}
                  >
                    <Text style={[styles.subtabText, botanicalActive === k && styles.subtabTextActive]}>
                      {k === 'classification' ? 'Classification' : k === 'morphology' ? 'Morphology' : 'Growth Stages'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Botanical Carousel */}
              <View style={[styles.carouselContainer, { borderColor: colors.border, marginVertical: 16 }]}>
                <Image
                  source={botanicalImages[currentBotanicalSlide]}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
                <View style={styles.carouselOverlay} />
                {/* Carousel Indicators */}
                <View style={styles.indicatorsContainer}>
                  {botanicalImages.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.carouselIndicator,
                        currentBotanicalSlide === index ? styles.activeCarouselIndicator : styles.inactiveCarouselIndicator
                      ]}
                    />
                  ))}
                </View>
              </View>
              {botanicalActive === 'classification' && (
                <View>
                  <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.background }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 15, marginBottom: 14 }]}>Scientific Classification</Text>
                    <View style={{ gap: 10 }}>
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <View style={{ backgroundColor: colors.accent, width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2 }}>
                          <Text style={{ fontSize: 20 }}>🧬</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listTitle, { color: colors.text, fontWeight: '700', marginBottom: 6 }]}>Kingdom: Plantae</Text>
                          <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, lineHeight: 18 }]}>Multicellular, eukaryotic organisms characterized by cell walls containing cellulose and the ability to synthesize energy via photosynthesis.</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <View style={{ backgroundColor: colors.accent, width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2 }}>
                          <Text style={{ fontSize: 20 }}>�</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listTitle, { color: colors.text, fontWeight: '700', marginBottom: 6 }]}>Subkingdom: Tracheobionata</Text>
                          <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, lineHeight: 18 }]}>Vascular plants with specialized tissues for water and nutrient transport throughout the plant.</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <View style={{ backgroundColor: colors.accent, width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2 }}>
                          <Text style={{ fontSize: 20 }}>🌸</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listTitle, { color: colors.text, fontWeight: '700', marginBottom: 6 }]}>Division: Magnoliophyta</Text>
                          <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, lineHeight: 18 }]}>Flowering plants (angiosperms) characterized by the presence of flowers and fruits containing seeds.</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <View style={{ backgroundColor: colors.accent, width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2 }}>
                          <Text style={{ fontSize: 20 }}>🍃</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listTitle, { color: colors.text, fontWeight: '700', marginBottom: 6 }]}>Class: Magnoliopsida</Text>
                          <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, lineHeight: 18 }]}>Dicotyledons with two cotyledons, typical net-like leaf venation, and flower parts in multiples of 4 or 5.</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <View style={{ backgroundColor: colors.accent, width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2 }}>
                          <Text style={{ fontSize: 20 }}>🌿</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listTitle, { color: colors.text, fontWeight: '700', marginBottom: 6 }]}>Order: Piperales</Text>
                          <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, lineHeight: 18 }]}>An order of flowering plants containing aromatic families like Piperaceae, known for peppery and spicy compounds.</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <View style={{ backgroundColor: colors.accent, width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2 }}>
                          <Text style={{ fontSize: 20 }}>🌱</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listTitle, { color: colors.text, fontWeight: '700', marginBottom: 6 }]}>Family: Piperaceae</Text>
                          <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, lineHeight: 18 }]}>A primitive angiosperm family of "pepper-like" plants defined by dense floral spikes, lack of petals, and the presence of pungent aromatic oils.</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <View style={{ backgroundColor: colors.accent, width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2 }}>
                          <Text style={{ fontSize: 20 }}>🔍</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listTitle, { color: colors.text, fontWeight: '700', marginBottom: 6 }]}>Genus: Piper L.</Text>
                          <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, lineHeight: 18 }]}>A massive, pantropical genus containing over 3,000 species, highly valued globally for their diverse medicinal alkaloids and culinary essential oils.</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <View style={{ backgroundColor: colors.accent, width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2 }}>
                          <Image source={require('../../../../picsbl/logowalangbg.png')} style={{ width: 28, height: 28, resizeMode: 'contain' }} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listTitle, { color: colors.text, fontWeight: '700', marginBottom: 6 }]}>Species: Piper nigrum L.</Text>
                          <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, lineHeight: 18 }]}>The perennial woody vine cultivated for peppercorns; famously known as "Kali Mirch" or the "King of Spices" for its historical economic importance. Native to the Malabar Coast of India.</Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 14, marginBottom: 12 }]}>Key Characteristics</Text>
                      <View style={styles.plantPartsList}>
                        {[
                          { char: 'Fruit Type', icon: 'logo', desc: 'A drupe (small berry) that turns red when mature. Dried fruits become black peppercorns of commerce.' },
                          { char: '📈 Growth Habit', icon: 'emoji', desc: 'A climbing vine that can reach heights of up to 10 meters (33 feet) using adhesive and adventitious roots for support.' },
                          { char: '🌍 Origin', icon: 'emoji', desc: 'Native to the Malabar Coast of India, a region with ideal tropical climate and rich soil conditions.' },
                          { char: '🌐 Varieties', icon: 'emoji', desc: 'Classified by geographic origin and cultivation practices, including Batangas (Philippines), Lampung (Indonesia), and Sarawak (Malaysia) varieties.' },
                        ].map((item, i) => (
                          <View key={i} style={[styles.partItem, { backgroundColor: colors.background, borderRadius: 12, padding: 12, borderWidth: 2, borderColor: colors.border, marginBottom: 10 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              {item.icon === 'logo' ? (
                                <Image source={require('../../../../picsbl/logowalangbg.png')} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
                              ) : null}
                              <Text style={[styles.partName, { color: colors.text, fontSize: 14, fontWeight: '700' }]}>{item.char}</Text>
                            </View>
                            <Text style={[styles.partDesc, { color: colors.textLight, fontSize: 12, lineHeight: 18 }]}>{item.desc}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              )}
              {botanicalActive === 'morphology' && (
                <View>
                  <View style={[styles.card, { borderColor: colors.border }]}>
                    <Text style={[styles.paragraph, { color: colors.textLight, marginBottom: 14 }]}>
                      Black pepper (Piper nigrum L.) is a tropical, woody perennial climbing vine (family Piperaceae) that grows up to 10m using aerial adventitious roots. It features dimorphic branching (orthotropic climbing stems and plagiotropic fruiting branches), thick, glossy green ovate leaves, and produces minute, white-to-yellow flowers on hanging spikes (catkins). The fruits are small, globose, single-seeded berries (drupes) that turn from green to red upon maturity.
                    </Text>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 14, marginVertical: 10 }]}>Morphological Components</Text>
                    <View style={styles.plantPartsList}>
                      {[
                        { part: '🎋 Habit', desc: 'A trailing or climbing vine that requires support, producing adventitious roots at nodes for climbing.' },
                        { part: '🌳 Stem', desc: 'Woody at the base with swollen nodes. Two types of branches: orthotropic (main, climbing stems with adventitious roots) and plagiotropic (lateral, fruit-bearing branches lacking aerial roots).' },
                        { part: '🍃 Leaves', desc: 'Simple, alternate, dark green, glossy, ovate-elliptic or ovate-lanceolate, often with an acuminate tip. Blade sizes typically 8–17.5 cm long.' },
                        { part: '🌸 Inflorescence', desc: 'A spike or catkin, 3–12 cm long, produced opposite the leaves. Contains minute, sessile, bisexual or unisexual flowers with 2–3 stamens.' },
                        { part: 'Fruit (Peppercorn)', icon: 'logo', desc: 'A sessile, globose berry (drupe), 5–6 mm in diameter. Green when immature, turning red when ripe. Dried berries become black pepper of commerce.' },
                        { part: '🌾 Root System', desc: 'Adventitious roots arising from nodes, allowing for vegetative propagation. Well-developed root systems enable climbing and nutrient absorption.' },
                      ].map((item, i) => (
                        <View key={i} style={[styles.partItem, { backgroundColor: colors.background, borderRadius: 12, padding: 14, borderWidth: 2, borderColor: colors.border, marginBottom: 12 }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            {item.icon === 'logo' ? (
                              <Image source={require('../../../../picsbl/logowalangbg.png')} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
                            ) : (
                              <Text style={{ fontSize: 18 }}>{item.part.split(' ')[0]}</Text>
                            )}
                            <Text style={[styles.partName, { color: colors.text, fontSize: 15, fontWeight: '700' }]}>{item.part}</Text>
                          </View>
                          <Text style={[styles.partDesc, { color: colors.textLight, fontSize: 13, lineHeight: 20 }]}>{item.desc}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
              {botanicalActive === 'growth' && (
                <View>
                  <View style={[styles.card, { borderColor: colors.border, marginBottom: 12 }]}>
                    <Text style={[styles.paragraph, { color: colors.textLight }]}>
                      Black pepper plants (Piper nigrum) are woody climbers that typically take 3–4 years to reach full maturity, progressing through vegetative, flowering, and fruiting stages. Key phases include rapid vine growth using support, flowering, and a 5-6 month maturation period for berries, which are harvested when turning red.
                    </Text>
                  </View>
                  <View style={[styles.card, { borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 14, marginBottom: 12 }]}>Key Growth Stages</Text>
                    {[
                      { stage: 1, emoji: '🌱', title: 'Propagation & Seedling Stage', duration: '0–3 Months', desc: 'Typically grown from runner shoot cuttings (rather than seeds) planted in nurseries. Cuttings are rooted in polybags, requiring high humidity and shade, before being transplanted to the field.' },
                      { stage: 2, emoji: '🌿', title: 'Vegetative Growth Phase', duration: 'Year 1–2', desc: 'The vine grows rapidly in length and produces numerous leaves, climbing up a support tree (standard). The plant develops orthotropes (vertical main shoots) and plagiotropes (lateral fruiting branches).' },
                      { stage: 3, emoji: '🌸', title: 'Flowering Phase', duration: 'Year 3 onwards', desc: 'The plant begins flowering 3–4 years after planting. Small white flowers appear on spikes (spadix) which hang down from the branches.' },
                      { stage: 4, emoji: null, logo: true, title: 'Fruit Development', duration: '5–6 Months', desc: 'After pollination, the spikes develop berries (peppercorns). Berries grow from green to shiny yellowish-green, and finally turn red when fully mature.' },
                      { stage: 5, emoji: '🌾', title: 'Harvesting', duration: 'Mature Stage', desc: 'Harvesting occurs when one or two berries on the spike turn red. The entire spike is picked, and berries are separated and dried, turning black during the drying process.' },
                    ].map((item, i) => (
                      <View key={i} style={{ marginBottom: i === 4 ? 0 : 12 }}>
                        <View style={[styles.stepCard, { borderColor: colors.border, borderLeftColor: colors.accent, flexDirection: 'row', alignItems: 'flex-start', padding: 12 }]}>
                      <View style={{ backgroundColor: colors.accent, width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12, flexShrink: 0 }}>
                            {item.logo ? (
                              <Image source={require('../../../../picsbl/logowalangbg.png')} style={{ width: 32, height: 32, resizeMode: 'contain' }} />
                            ) : (
                              <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                            )}
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                              <Text style={[styles.listTitle, { color: colors.text, fontWeight: '700', flex: 1, fontSize: 14 }]}>{item.stage}. {item.title}</Text>
                            </View>
                            <View style={{ backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 }}>
                              <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>{item.duration}</Text>
                            </View>
                            <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, lineHeight: 18 }]}>{item.desc}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <ScrollView style={{ width: pageWidth }} nestedScrollEnabled>
            <View style={styles.section}>
              {/* Disease Image Carousel */}
              <View style={[styles.carouselContainer, { borderColor: colors.border, marginVertical: 16 }]}>
                <Image
                  source={diseaseImages[currentDiseaseSlide]}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
                <View style={styles.carouselOverlay} />
                {/* Carousel Indicators */}
                <View style={styles.indicatorsContainer}>
                  {diseaseImages.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.carouselIndicator,
                        currentDiseaseSlide === index ? styles.activeCarouselIndicator : styles.inactiveCarouselIndicator
                      ]}
                    />
                  ))}
                </View>
              </View>
              {[
                {
                  title: 'Footrot',
                  severity: 'critical',
                  icon: '⚠️',
                  desc: 'Phytophthora cinnamomi infection causing root rot and stem blackening. Major disease causing heavy plant mortality (30-50% losses).',
                  symptoms: ['Dark brown/black lesions on collar region', 'Rapid wilting and defoliation', 'Root system decay and discoloration', 'Yellow/brown canopy progression', 'Ooze from infected tissues in wet conditions'],
                  prevention: 'Improve drainage with raised beds; use well-aerated loamy soils; avoid waterlogging; practice crop rotation with minimum 2-year gap; use disease-free planting material',
                  treatment: 'Apply Copper fungicides (Bordeaux mixture 1%) or Phosphites every 2 weeks; remove infected plants immediately and burn; improve soil aeration; apply steam sterilization to nursery soil',
                },
                {
                  title: 'Leaf Blight',
                  severity: 'warning',
                  icon: '🍂',
                  desc: 'Fungal disease causing necrotic lesions and premature leaf drop. Reduces photosynthesis and vigor significantly (20-40% yield loss).',
                  symptoms: ['Circular brown lesions with yellow/water-soaked margins', 'Concentric rings on mature lesions', 'Rapid leaf yellowing and defoliation', 'Premature shedding of affected leaves', 'Can spread to stems and berries'],
                  prevention: 'Enhance canopy airflow through pruning; remove lower leaves 45cm from ground; avoid overhead irrigation (use drip); apply sulphur dust weekly; use disease-resistant varieties',
                  treatment: 'Spray Mancozeb (0.3%) or Copper oxychloride (0.25%) at 10-day intervals; remove and destroy affected leaves; prune excess canopy; Apply neem oil extract (5%) as alternative',
                },
                {
                  title: 'Slow Decline',
                  severity: 'critical',
                  icon: '📉',
                  desc: 'Viral disease causing gradual plant senescence and productivity loss. Long-term damaging disease affecting mature plantations.',
                  symptoms: ['Stunting and reduced vigor over seasons', 'Yellowing of older leaves', 'Gradual reduction in vine growth', 'Lower spike production and smaller berries', 'Plant becomes barren after 4-5 years'],
                  prevention: 'Use virus-free certified planting material; rigorous insect vector control (mites, scales); remove infected plants immediately; isolate nursery from infected fields; regular plant health assessment',
                  treatment: 'No direct cure; remove and destroy infected plants; control insect vectors with approved acaricides; practice prophylactic spraying (sulphur dust); Establish new nursery on virus-free location',
                },
                {
                  title: 'Pollu Disease',
                  severity: 'warning',
                  icon: '🦠',
                  desc: 'Phytophthora leaf infection causing spots and blight. Specific to pepper plants in humid conditions. Reduces leaf area and berry development.',
                  symptoms: ['Water-soaked spots on leaves with white sporangia underneath', 'Rapid lesion expansion in high humidity', 'Affected tissue turns brown/black', 'Can affect petioles and stems', 'Heavy defoliation in severe infections'],
                  prevention: 'Maintain proper spacing for air circulation; avoid leaf wetness through drip irrigation; apply sulphur dust weekly during monsoon; remove infected leaves promptly; mulch to prevent soil splash',
                  treatment: 'Spray Metalaxyl (0.1%) or Fosetyl-Al (2%) every 10 days; Alternate fungicides to prevent resistance; Remove and destroy affected plants; Apply Bordeaux mixture (1%) as preventive',
                },
                {
                  title: 'Yellow Mottle Virus',
                  severity: 'warning',
                  icon: '🦠',
                  desc: 'Viral disease transmitted by mites causing yellowing and mosaic patterns. Reduces photosynthesis and fruit development.',
                  symptoms: ['Yellow mottled patterns on emerging leaves', 'Mosaic and mottle appearance on foliage', 'Distorted leaf shape and size', 'Reduced berry production and quality', 'Plant stunting in severe cases'],
                  prevention: 'Use virus-free planting material from certified nurseries; control mite vectors with sulphur dust or acaricides; Remove volunteer plants and weeds; Isolate infected plants from healthy ones; Regular scouting for mites',
                  treatment: 'No cure for viral infections; Apply acaricides (Wettable Sulphur 2.5%) to control mite vectors; Remove severely infected plants; Apply neem-based sprays (5%) weekly; Practice strict hygiene in tools and equipment',
                },
              ].map((issue, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.diseaseCard,
                    {
                      borderColor: colors.border,
                      borderLeftColor: issue.severity === 'critical' ? '#E74C3C' : issue.severity === 'warning' ? '#F39C12' : colors.accent,
                    },
                  ]}
                >
                  <View style={styles.diseaseHeader}>
                    <Text style={styles.diseaseIcon}>{issue.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.diseaseTitle, { color: colors.text }]}>{issue.title}</Text>
                      <Text style={[styles.diseaseDesc, { color: colors.textLight }]}>{issue.desc}</Text>
                    </View>
                  </View>
                  <View style={styles.diseaseSeverityBadge}>
                    <Text style={[
                      styles.diseaseSeverity,
                      {
                        color: '#FFFFFF',
                        backgroundColor: issue.severity === 'critical' ? '#E74C3C' : issue.severity === 'warning' ? '#F39C12' : colors.accent,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        overflow: 'hidden',
                      },
                    ]}>
                      {issue.severity.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.symptomsList}>
                    <Text style={[styles.symptomsLabel, { color: colors.text }]}>Symptoms:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {issue.symptoms.map((sym, i) => (
                        <View key={i} style={[styles.symptomTag, { borderColor: colors.border, backgroundColor: colors.background }]}>
                          <Text style={[styles.symptomText, { color: colors.textLight }]}>• {sym}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.preventionBox}>
                    <Text style={[styles.preventionTitle, { color: colors.text }]}>🛡️ Prevention:</Text>
                    <Text style={[styles.preventionText, { color: colors.textLight }]}>{issue.prevention}</Text>
                  </View>
                  <View style={[styles.treatmentBox, { borderColor: colors.border }]}>
                    <Text style={[styles.treatmentTitle, { color: colors.text }]}>💊 Treatment:</Text>
                    <Text style={[styles.treatmentText, { color: colors.textLight }]}>{issue.treatment}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <ScrollView style={{ width: pageWidth }} nestedScrollEnabled>
            <View style={styles.section}>
              {/* Health Benefits Image Carousel */}
              <View style={[styles.carouselContainer, { borderColor: colors.border, marginVertical: 16 }]}>
                <Image
                  source={benefitsImages[currentBenefitsSlide]}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
                <View style={styles.carouselOverlay} />
                {/* Carousel Indicators */}
                <View style={styles.indicatorsContainer}>
                  {benefitsImages.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.carouselIndicator,
                        currentBenefitsSlide === index ? styles.activeCarouselIndicator : styles.inactiveCarouselIndicator
                      ]}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.subtabs}>
                {['nutrition','digestive','antiInflammatory'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.subtabBtn, benefitsTab === t && styles.subtabBtnActive]}
                    onPress={() => setBenefitsTab(t)}
                  >
                    <Text style={[styles.subtabText, benefitsTab === t && styles.subtabTextActive]}>
                      {t === 'nutrition' ? 'Antioxidants' : t === 'digestive' ? 'Digestive Support' : 'Anti-inflammatory'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {benefitsTab === 'nutrition' && (
                <View>
                  <View style={[styles.card, { borderColor: colors.border, backgroundColor: '#F0FDF4', borderLeftWidth: 5, borderLeftColor: colors.accent }]}>
                    <View style={styles.benefitRow}>
                      <View style={{ backgroundColor: colors.accent, width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="heart-pulse" size={26} color="#FFFFFF" />
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={[styles.listTitle, { color: colors.text, fontSize: 16, fontWeight: '800' }]}>Antioxidant Power</Text>
                        <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12 }]}>Neutralizes free radicals</Text>
                      </View>
                    </View>
                    <Text style={[styles.paragraph, { color: colors.textLight, lineHeight: 20, marginTop: 12 }]}>
                      Black pepper is rich in piperine (5-10% by weight), a polyphenol with extraordinary antioxidant power. Piperine actively neutralizes harmful free radicals and reactive oxygen species (ROS) that damage cells and accelerate aging. Research shows it enhances curcumin absorption by 2000%, making it the perfect complement to turmeric.
                    </Text>
                    <View style={{ marginTop: 12, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      <View style={{ backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.border }}>
                        <Text style={[styles.listDesc, { color: colors.text, fontSize: 12, fontWeight: '600' }]}>ORAC: 27,618 µmol/100g</Text>
                      </View>
                      <View style={{ backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.border }}>
                        <Text style={[styles.listDesc, { color: colors.text, fontSize: 12, fontWeight: '600' }]}>Potent vs Blueberries</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.card, { borderColor: colors.border, marginTop: 12, backgroundColor: colors.background }]}>
                    <Text style={[styles.listTitle, { color: colors.text, fontSize: 14 }]}>🔬 Key Compounds:</Text>
                    <View style={{ marginTop: 10 }}>
                      <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={[styles.listDesc, { color: colors.text, fontWeight: '600' }]}>Piperine</Text>
                        <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, marginTop: 3 }]}>Primary active alkaloid with strong antioxidant activity</Text>
                      </View>
                      <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={[styles.listDesc, { color: colors.text, fontWeight: '600' }]}>Volatile Oils</Text>
                        <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, marginTop: 3 }]}>Pinene, limonene, and myrcene provide aromatics and antioxidants</Text>
                      </View>
                      <View style={{ paddingVertical: 8 }}>
                        <Text style={[styles.listDesc, { color: colors.text, fontWeight: '600' }]}>Phenolic Compounds</Text>
                        <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, marginTop: 3 }]}>Support cellular protection against oxidative stress</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
              {benefitsTab === 'digestive' && (
                <View>
                  <View style={[styles.card, { borderColor: colors.border, backgroundColor: '#FFFBEB', borderLeftWidth: 5, borderLeftColor: '#F59E0B' }]}>
                    <View style={styles.benefitRow}>
                      <View style={{ backgroundColor: '#F59E0B', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="fire" size={26} color="#FFFFFF" />
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={[styles.listTitle, { color: colors.text, fontSize: 16, fontWeight: '800' }]}>Digestive Fire</Text>
                        <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12 }]}>Boost metabolism & absorption</Text>
                      </View>
                    </View>
                    <Text style={[styles.paragraph, { color: colors.textLight, lineHeight: 20, marginTop: 12 }]}>
                      Black pepper ignites your digestive fire. Piperine stimulates saliva and gastric juice secretion, preparing your body to break down and absorb nutrients efficiently. It increases intestinal permeability by up to 30%, allowing your body to absorb more nutrients. Traditional Ayurveda calls this activating "Agni" - the metabolic flame.
                    </Text>
                  </View>
                  <View style={[styles.card, { borderColor: colors.border, marginTop: 12, backgroundColor: colors.background }]}>
                    <Text style={[styles.listTitle, { color: colors.text, fontSize: 14 }]}>✨ Key Benefits:</Text>
                    <View style={{ marginTop: 10 }}>
                      <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', gap: 10 }}>
                        <View style={{ backgroundColor: '#F59E0B', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>1</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listDesc, { color: colors.text, fontWeight: '600' }]}>Enhanced Absorption</Text>
                          <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, marginTop: 2 }]}>Increases nutrient bioavailability up to 2000%</Text>
                        </View>
                      </View>
                      <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', gap: 10 }}>
                        <View style={{ backgroundColor: '#F59E0B', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>2</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listDesc, { color: colors.text, fontWeight: '600' }]}>Metabolic Boost</Text>
                          <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, marginTop: 2 }]}>Increases thermogenesis (heat production) by 3-8%</Text>
                        </View>
                      </View>
                      <View style={{ paddingVertical: 10, flexDirection: 'row', gap: 10 }}>
                        <View style={{ backgroundColor: '#F59E0B', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>3</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listDesc, { color: colors.text, fontWeight: '600' }]}>Gut Health</Text>
                          <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, marginTop: 2 }]}>Promotes beneficial gut bacteria and healthy microbiome</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}
              {benefitsTab === 'antiInflammatory' && (
                <View>
                  <View style={[styles.card, { borderColor: colors.border, backgroundColor: '#FEE2E2', borderLeftWidth: 5, borderLeftColor: '#EF4444' }]}>
                    <View style={styles.benefitRow}>
                      <View style={{ backgroundColor: '#EF4444', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="shield-check" size={26} color="#FFFFFF" />
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={[styles.listTitle, { color: colors.text, fontSize: 16, fontWeight: '800' }]}>Anti-Inflammatory</Text>
                        <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12 }]}>Combat chronic inflammation</Text>
                      </View>
                    </View>
                    <Text style={[styles.paragraph, { color: colors.textLight, lineHeight: 20, marginTop: 12 }]}>
                      Piperine is a potent NF-κB (nuclear factor-kappa B) inhibitor - essentially blocking the "master switch" that activates chronic inflammation. It reduces pro-inflammatory cytokines (TNF-α, IL-6, IL-8) by up to 40%, offering relief comparable to pharmaceutical NSAIDs without the side effects. When combined with turmeric's curcumin, the anti-inflammatory effect increases 2-3 fold.
                    </Text>
                  </View>
                  <View style={[styles.card, { borderColor: colors.border, marginTop: 12, backgroundColor: colors.background }]}>
                    <Text style={[styles.listTitle, { color: colors.text, fontSize: 14 }]}>⚔️ Inflammation-Fighting Mechanisms:</Text>
                    <View style={{ marginTop: 10 }}>
                      <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                          <Text style={{ fontSize: 24 }}>🧬</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.listDesc, { color: colors.text, fontWeight: '600' }]}>NF-κB Inhibition</Text>
                            <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, marginTop: 2 }]}>Blocks master inflammatory switch - prevents cytokine cascade</Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                          <Text style={{ fontSize: 24 }}>💪</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.listDesc, { color: colors.text, fontWeight: '600' }]}>Cytokine Reduction</Text>
                            <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, marginTop: 2 }]}>Reduces TNF-α, IL-6, IL-8 by 30-40% - major inflammatory markers</Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ paddingVertical: 10 }}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                          <Text style={{ fontSize: 24 }}>🌱</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.listDesc, { color: colors.text, fontWeight: '600' }]}>Turmeric Synergy</Text>
                            <Text style={[styles.listDesc, { color: colors.textLight, fontSize: 12, marginTop: 2 }]}>Black pepper enhances curcumin absorption 2000%, creating 2-3x stronger anti-inflammatory effect</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <ScrollView style={{ width: pageWidth }} nestedScrollEnabled>
            <View style={styles.section}>
              <View style={styles.stepsHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Cultivation Steps</Text>
              </View>
              {[
                {
                  step: 1,
                  title: 'Propagation: Stem Cutting & Rooting',
                  content: 'Select healthy stem cuttings with 3-5 nodes from disease-free mother plants (terminal or runner shoots preferred). Prepare cuttings to 15-20 cm length, removing lower leaves. Root cuttings in sandy, shaded nursery beds for 4-6 weeks until 4-7 new leaves develop (typically 1-2 months). Maintain 75-80% shade and consistent moisture. Use rooting hormone (IBA 500-1000 ppm) to enhance rooting success rate. Once rooted with adequate leaf development, cuttings are ready for field transplanting.',
                  key: 'propagation',
                },
                {
                  step: 2,
                  title: 'Field Preparation & Planting',
                  content: 'Prepare field during months 2-3 before monsoon planting (June-July). Dig pits (30×30×30 cm) filled with organic matter (15-20 kg farmyard manure per pit). Install vertical supports/standards (Kakawate poles, concrete posts, or bamboo stakes) 2-2.5 m tall at spacing of 2-3 m between plants and 2.5-3 m between rows (1,000-2,000 plants/hectare). Plant rooted cuttings near supports during monsoon for natural moisture. Soil should be loamy with pH 5.5-6.5, well-drained with minimum 45-60 cm depth. Proper drainage infrastructure prevents Quick Wilt (Phytophthora) which kills plantations rapidly.',
                  key: 'planting',
                },
                {
                  step: 3,
                  title: 'Vegetative Growth & Maintenance (Years 1-2)',
                  content: 'During the critical first 1-2 years, train vines to climb supports for proper canopy development. Perform regular weeding to reduce competition for nutrients. Apply farmyard manure (20-30 tons/hectare annually) and balanced NPK fertilizer (50 kg N, 50 kg P₂O₅, 50 kg K₂O per hectare) in 2-3 split applications during monsoon. Maintain irrigation at 2000-3000 mm annually through drip systems (2-3 liters/plant daily during dry season) to ensure rapid growth. Mulch around plants (5-8 cm) with organic material to conserve moisture, regulate soil temperature, and suppress weeds. Monitor soil with tensiometers for precise irrigation scheduling.',
                  key: 'vegetative',
                },
                {
                  step: 4,
                  title: 'Flowering & Fruit Development (Years 3-4)',
                  content: 'After 3 years of vineyard establishment, plants begin producing flowers which develop into green, hanging spikes (inflorescences). Continued nutrient and water management is critical during this phase. A short dry period (20-30 days) before flowering triggers massive flower flush. Once flowering begins, berries develop over 5-6 months into mature green berries ready for harvest. Apply micronutrients (Zn 5 kg/ha, Mg 10 kg/ha, Fe 5 kg/ha) and foliar spray with 1% urea in July-August to support flowering vigor. Maintain mulch and weed control to direct plant energy toward fruit production.',
                  key: 'flowering',
                },
                {
                  step: 5,
                  title: 'Harvesting & Post-Harvest Processing',
                  content: 'Harvest spikes when berries start turning red (7-8 months after flowering, typically in years 3+). Detach berries from spikes and sun-dry for 7-10 days to reduce moisture from ~70% to 10-12%. Spread berries on clean drying grounds, rotating every 4-6 hours for even drying. Alternatively, briefly boil berries before drying (alternative method). Final product should be dark brown/black with wrinkled appearance and strong aroma. Store in dry, ventilated containers (jute bags, wooden boxes) at 10-15°C to maintain quality and prevent mold. Expected yield: 2-3 tons dried pepper per hectare at maturity.',
                  key: 'harvest',
                },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.diseaseCard,
                    {
                      borderColor: colors.border,
                      borderLeftColor: colors.accent,
                    },
                  ]}
                  onPress={() => toggleExpand(item.key)}
                >
                  <View style={styles.diseaseHeader}>
                    <View style={styles.stepNumberBox}>
                      <Text style={styles.stepNumber}>{item.step}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.diseaseTitle, { color: colors.text }]}>{item.title}</Text>
                    </View>
                    <Animated.View style={{ transform: [{ rotate: expandedSections[item.key] ? '180deg' : '0deg' }] }}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.accent} />
                    </Animated.View>
                  </View>
                  {expandedSections[item.key] && (
                    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <Text style={[styles.diseaseDesc, { color: colors.textLight, lineHeight: 20 }]}>
                        {item.content}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <ScrollView style={{ width: pageWidth }} nestedScrollEnabled>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest News & Resources</Text>
              {loadingNews ? (
                <View style={{ paddingVertical: 8 }}>
                  {[1, 2, 3].map((i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.skeletonItem,
                        {
                          opacity: skeletonAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                          backgroundColor: '#EEEEEE',
                          borderColor: colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
              ) : (
                <View>
                  {filteredNews.map((item) => (
                    <TouchableOpacity
                      key={item.id || item._id}
                      style={[styles.newsItem, { borderColor: colors.border, backgroundColor: colors.card }]}
                      onPress={() => item.link && Linking.openURL(item.link)}
                      activeOpacity={0.7}
                    >
                      {item.image && (
                        <Image
                          source={{ uri: item.image }}
                          style={styles.newsImage}
                        />
                      )}
                      <View style={styles.newsContent}>
                        <Text style={[styles.newsTitle, { color: colors.text }]} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={[styles.newsMeta, { color: colors.textLight }]}>
                          {item.source} • {item.date}
                        </Text>
                        <Text
                          style={[styles.newsDesc, { color: colors.textLight }]}
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                        <View style={styles.readMoreBox}>
                          <Feather name="external-link" size={14} color={colors.accent} />
                          <Text style={[styles.readMore, { color: colors.accent }]}>Read Full Article</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </ScrollView>
      </ScrollView>
      <View style={styles.fabContainer}>
        <Animated.View
          style={[
            styles.fabGlow,
            {
              transform: [{ scale: aiGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
              opacity: aiGlow.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.8] }),
            },
          ]}
        />
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.9}
          onPress={() => {
            Alert.alert(
              'AI Plant Scanner',
              'Choose what to analyze',
              [
                {
                  text: '🍃 Leaf Analysis - Detect diseases',
                  onPress: () => navigation.navigate('LeafAnalysis'),
                },
                {
                  text: '🌸 Bunga Fruit - Check ripeness',
                  onPress: () => navigation.navigate('BungaRipeness'),
                },
                {
                  text: 'Cancel',
                  onPress: () => {},
                  style: 'cancel',
                },
              ]
            );
          }}
        >
          <Feather name="aperture" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 2,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  tabsWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    position: 'relative',
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#22c55e',
  },
  tabIndicator: {
    position: 'absolute',
    height: 3,
    bottom: 0,
    borderRadius: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
  },
  tabButtonTextActive: {
    color: '#22c55e',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    color: '#1B4D3E',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  paragraph: {
    fontSize: 13.5,
    lineHeight: 22,
    marginBottom: 10,
    fontWeight: '500',
  },
  expandHeader: {
    paddingVertical: 12,
  },
  expandTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  bullet: {
    fontSize: 13,
    lineHeight: 20,
  },
  listItem: {
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  listDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
  newsItem: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  newsHeader: {
    marginBottom: 6,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  newsMeta: {
    fontSize: 11,
  },
  newsDesc: {
    fontSize: 13,
  },
  searchInput: {
    borderWidth: 2,
    borderColor: '#D4E5DD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1B4D3E',
  },
  skeletonItem: {
    height: 84,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 12,
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  factCard: {
    width: '48%',
    borderWidth: 2,
    borderColor: '#D4E5DD',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  factIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  factTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  factValue: {
    fontSize: 14,
    color: '#1B4D3E',
    fontWeight: '700',
  },
  illustrationBox: {
    height: 160,
    backgroundColor: '#F8FAF7',
    borderRadius: 12,
    position: 'relative',
  },
  hotspot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotspotTap: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  tooltip: {
    position: 'absolute',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  tooltipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  tooltipText: {
    fontSize: 11,
    color: '#6b7280',
  },
  actionsRow: {
    paddingVertical: 6,
    gap: 12,
  },
  actionCard: {
    width: 220,
    borderWidth: 2,
    borderColor: '#D4E5DD',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginRight: 12,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  actionBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  subtabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  subtabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#D4E5DD',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  subtabBtnActive: {
    borderColor: '#22c55e',
    backgroundColor: '#F0FDF4',
  },
  subtabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
  },
  subtabTextActive: {
    color: '#22c55e',
  },
  timelineRow: {
    gap: 18,
    alignItems: 'center',
  },
  timelineNode: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    marginBottom: 6,
  },
  timelineLabel: {
    fontSize: 12,
    color: '#1B4D3E',
    fontWeight: '600',
  },
  progressWrap: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAF7',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D4E5DD',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '700',
    color: '#22c55e',
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    backgroundColor: '#22c55e',
    borderRadius: 5,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#D4E5DD',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    borderColor: '#22c55e',
    backgroundColor: '#F0FDF4',
  },
  chipText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#22c55e',
  },
  issueCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  issueSeverity: {
    fontSize: 12,
    fontWeight: '700',
  },
  issueBtn: {
    marginTop: 10,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#D4E5DD',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  issueBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B4D3E',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  diseaseCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 5,
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  diseaseIcon: {
    fontSize: 28,
  },
  diseaseTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  diseaseDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  diseaseSeverityBadge: {
    marginBottom: 10,
  },
  diseaseSeverity: {
    fontSize: 11,
    fontWeight: '700',
  },
  symptomsList: {
    marginBottom: 12,
  },
  symptomsLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  symptomTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
  },
  symptomText: {
    fontSize: 12,
    fontWeight: '600',
  },
  preventionBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  preventionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  preventionText: {
    fontSize: 12,
    lineHeight: 18,
  },
  treatmentBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFBEB',
  },
  treatmentTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  treatmentText: {
    fontSize: 12,
    lineHeight: 18,
  },
  stepsHeader: {
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  stepNumberBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 2,
    shadowColor: '#22c55e',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  stepTitleText: {
    fontSize: 20,
  },
  stepTitleLabel: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    lineHeight: 22,
  },
  stepIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  plantPartsList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#D4E5DD',
    paddingTop: 12,
  },
  partItem: {
    marginBottom: 12,
  },
  partName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  partDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  newsImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
  },
  newsContent: {
    flex: 1,
  },
  readMoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  readMore: {
    fontSize: 12,
    fontWeight: '700',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabGlow: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(34,197,94,0.35)',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#22c55e',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  // Carousel Styles
  carouselContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 20,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  carouselIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeCarouselIndicator: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  inactiveCarouselIndicator: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  // Black Pepper Guide Styles
  guideSubtext: {
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '500',
  },
  guideCardsContainer: {
    gap: 12,
  },
  guideCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  guideCardExpanded: {
    elevation: 4,
    shadowOpacity: 0.12,
  },
  guideCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  guideIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideIcon: {
    fontSize: 32,
  },
  guideTitleContainer: {
    flex: 1,
  },
  guideCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  guideHeading: {
    fontSize: 13,
    fontWeight: '700',
  },
  expandIcon: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  highlightsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  highlightBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  detailsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    marginTop: 8,
  },
  detailsText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
});

