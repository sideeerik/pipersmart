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
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import axios from 'axios';
import MobileHeader from '../../shared/MobileHeader';
import { getUser } from '../../utils/helper';
import { BACKEND_URL } from 'react-native-dotenv';

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
  const [severityFilter, setSeverityFilter] = useState('all');
  const [benefitsTab, setBenefitsTab] = useState('nutrition');
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const init = async () => {
      const u = await getUser();
      setUser(u);
      fetchLatestNews();
    };
    init();
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
      const res = await axios.get(`${BACKEND_URL}/api/v1/news/latest`, { timeout: 8000 });
      const items = res.data?.news && Array.isArray(res.data.news) ? res.data.news : getDefaultNews();
      setNews(items);
    } catch (e) {
      setNews(getDefaultNews());
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
    { id: 'cultivation', label: 'Cultivation' },
    { id: 'diseases', label: 'Disease Mgmt' },
    { id: 'benefits', label: 'Health Benefits' },
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

        <View style={styles.tabsWrapper}>
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
        </View>

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
              <View style={styles.factsGrid}>
                {[
                  { icon: <MaterialCommunityIcons name="leaf" size={22} color={colors.accent} />, title: 'Scientific Name', value: 'Piper nigrum' },
                  { icon: <MaterialCommunityIcons name="white-balance-sunny" size={22} color={colors.accent} />, title: 'Optimal Temp', value: '24–30°C', pulse: 'sun' },
                  { icon: <MaterialCommunityIcons name="weather-pouring" size={22} color={colors.accent} />, title: 'Rainfall', value: '2000–3000 mm/yr', pulse: 'rain' },
                  { icon: <MaterialCommunityIcons name="terrain" size={22} color={colors.accent} />, title: 'Soil', value: 'Loamy, pH 5.5–6.5' },
                ].map((item, idx) => {
                  const a = factAnims[idx];
                  return (
                    <Animated.View
                      key={idx}
                      style={[
                        styles.factCard,
                        {
                          opacity: a,
                          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
                        },
                      ]}
                    >
                      <View style={styles.factIconBox}>
                        <Animated.View
                          style={
                            item.pulse === 'sun'
                              ? { transform: [{ scale: sunPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }] }
                              : item.pulse === 'rain'
                              ? { transform: [{ translateY: rainDrop.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }) }] }
                              : undefined
                          }
                        >
                          {item.icon}
                        </Animated.View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.factTitle}>{item.title}</Text>
                        <Text style={styles.factValue}>{item.value}</Text>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>

              <View style={[styles.card, { borderColor: colors.border, overflow: 'hidden' }]}>
                <View style={styles.illustrationBox}>
                  <Animated.View
                    style={[
                      styles.hotspot,
                      {
                        left: 40,
                        top: 20,
                        opacity: hotspotLeaf.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                        transform: [{ scale: hotspotLeaf.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
                      },
                    ]}
                  >
                    <TouchableOpacity style={styles.hotspotTap} onPress={() => setTooltipLeaf((v) => !v)} />
                  </Animated.View>
                  <Animated.View
                    style={[
                      styles.hotspot,
                      {
                        right: 30,
                        top: 60,
                        opacity: hotspotSpike.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                        transform: [{ scale: hotspotSpike.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
                      },
                    ]}
                  >
                    <TouchableOpacity style={styles.hotspotTap} onPress={() => setTooltipSpike((v) => !v)} />
                  </Animated.View>
                  <Animated.View
                    style={[
                      styles.hotspot,
                      {
                        left: 100,
                        bottom: 18,
                        opacity: hotspotRoot.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                        transform: [{ scale: hotspotRoot.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
                      },
                    ]}
                  >
                    <TouchableOpacity style={styles.hotspotTap} onPress={() => setTooltipRoot((v) => !v)} />
                  </Animated.View>

                  {tooltipLeaf && (
                    <View style={styles.tooltip} >
                      <Text style={styles.tooltipTitle}>Leaves</Text>
                      <Text style={styles.tooltipText}>Alternate leaves with aromatic oils.</Text>
                    </View>
                  )}
                  {tooltipSpike && (
                    <View style={[styles.tooltip, { right: 16, top: 80 }]}>
                      <Text style={styles.tooltipTitle}>Peppercorn Spikes</Text>
                      <Text style={styles.tooltipText}>Pendulous inflorescences with berries.</Text>
                    </View>
                  )}
                  {tooltipRoot && (
                    <View style={[styles.tooltip, { left: 16, bottom: 50 }]}>
                      <Text style={styles.tooltipTitle}>Roots</Text>
                      <Text style={styles.tooltipText}>Shallow roots prefer aerated loam.</Text>
                    </View>
                  )}
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsRow}>
                {[
                  { key: 'soil', title: 'Soil Preparation', icon: 'shovel', progress: soilAnim, setter: setSoilProgress },
                  { key: 'disease', title: 'Disease Prevention', icon: 'shield-check', progress: diseaseAnim, setter: setDiseaseProgress },
                  { key: 'post', title: 'Post-Harvest Handling', icon: 'warehouse', progress: postAnim, setter: setPostProgress },
                ].map((c, idx) => {
                  const circumference = 2 * Math.PI * 18;
                  const progressInterpolate = c.progress.interpolate({ inputRange: [0, 1], outputRange: [circumference, 0] });
                  return (
                    <TouchableOpacity
                      key={c.key}
                      activeOpacity={0.9}
                      onPress={() => {
                        const next = Math.min(1, (idx === 0 ? soilProgress : idx === 1 ? diseaseProgress : postProgress) + 0.15);
                        c.setter(next);
                        Animated.timing(c.progress, { toValue: next, duration: 400, useNativeDriver: false }).start();
                      }}
                      style={styles.actionCard}
                    >
                      <View style={styles.actionHeader}>
                        <MaterialCommunityIcons name={c.icon} size={20} color={colors.accent} />
                        <Text style={styles.actionTitle}>{c.title}</Text>
                      </View>
                      <View style={styles.actionBody}>
                        <Svg width={44} height={44} viewBox="0 0 44 44">
                          <Circle cx="22" cy="22" r="18" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                          <Circle
                            cx="22"
                            cy="22"
                            r="18"
                            stroke={colors.accent}
                            strokeWidth="4"
                            strokeDasharray={circumference}
                            strokeDashoffset={progressInterpolate}
                            fill="none"
                            strokeLinecap="round"
                          />
                        </Svg>
                        <Text style={styles.actionDesc}>Tap to progress</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
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
              {botanicalActive === 'classification' && (
                <View>
                  <TouchableOpacity style={styles.expandHeader} onPress={() => toggleExpand('classification')}>
                    <Text style={[styles.expandTitle, { color: colors.accent }]}>Scientific Classification</Text>
                  </TouchableOpacity>
                  <ExpandableContent visible={!!expandedSections.classification}>
                    <View style={[styles.card, { borderColor: colors.border }]}>
                      <Text style={[styles.bullet, { color: colors.textLight }]}>Kingdom: Plantae</Text>
                      <Text style={[styles.bullet, { color: colors.textLight }]}>Family: Piperaceae</Text>
                      <Text style={[styles.bullet, { color: colors.textLight }]}>Genus: Piper</Text>
                      <Text style={[styles.bullet, { color: colors.textLight }]}>Species: P. nigrum</Text>
                    </View>
                  </ExpandableContent>
                </View>
              )}
              {botanicalActive === 'morphology' && (
                <View>
                  <TouchableOpacity style={styles.expandHeader} onPress={() => toggleExpand('morphology')}>
                    <Text style={[styles.expandTitle, { color: colors.accent }]}>Morphology</Text>
                  </TouchableOpacity>
                  <ExpandableContent visible={!!expandedSections.morphology}>
                    <View style={[styles.card, { borderColor: colors.border }]}>
                      <Text style={[styles.paragraph, { color: colors.textLight }]}>
                        Perennial climbing vine with alternating leaves and pendulous spikes. Fruits mature from green to red; dried peppercorns turn black. Root systems prefer well-drained, fertile soils.
                      </Text>
                    </View>
                  </ExpandableContent>
                </View>
              )}
              {botanicalActive === 'growth' && (
                <View>
                  <View style={[styles.card, { borderColor: colors.border }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timelineRow}>
                      {['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'].map((stage, i) => (
                        <View key={stage} style={styles.timelineNode}>
                          <View style={styles.timelineDot} />
                          <Text style={styles.timelineLabel}>{stage}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <ScrollView style={{ width: pageWidth }} nestedScrollEnabled>
            <View style={styles.section}>
              <TouchableOpacity style={styles.expandHeader} onPress={() => toggleExpand('soil')}>
                <Text style={[styles.expandTitle, { color: colors.accent }]}>Soil Requirements</Text>
              </TouchableOpacity>
              <ExpandableContent visible={!!expandedSections.soil}>
                <View style={[styles.card, { borderColor: colors.border }]}>
                  <Text style={[styles.paragraph, { color: colors.textLight }]}>
                    Well-drained loamy soils with pH 5.5–6.5. Avoid waterlogging; ensure organic matter enrichment through compost and mulching.
                  </Text>
                </View>
              </ExpandableContent>
              <TouchableOpacity style={styles.expandHeader} onPress={() => toggleExpand('planting')}>
                <Text style={[styles.expandTitle, { color: colors.accent }]}>Planting & Spacing</Text>
              </TouchableOpacity>
              <ExpandableContent visible={!!expandedSections.planting}>
                <View style={[styles.card, { borderColor: colors.border }]}>
                  <Text style={[styles.paragraph, { color: colors.textLight }]}>
                    Use healthy cuttings; train vines on support standards. Typical spacing ranges from 2–3 m depending on variety and terrain.
                  </Text>
                </View>
              </ExpandableContent>
              <TouchableOpacity style={styles.expandHeader} onPress={() => toggleExpand('irrigation')}>
                <Text style={[styles.expandTitle, { color: colors.accent }]}>Irrigation</Text>
              </TouchableOpacity>
              <ExpandableContent visible={!!expandedSections.irrigation}>
                <View style={[styles.card, { borderColor: colors.border }]}>
                  <Text style={[styles.paragraph, { color: colors.textLight }]}>
                    Maintain consistent moisture without saturation. Drip systems optimize water use and reduce foliar disease pressure.
                  </Text>
                </View>
              </ExpandableContent>
              <TouchableOpacity style={styles.expandHeader} onPress={() => toggleExpand('fertilization')}>
                <Text style={[styles.expandTitle, { color: colors.accent }]}>Fertilization</Text>
              </TouchableOpacity>
              <ExpandableContent visible={!!expandedSections.fertilization}>
                <View style={[styles.card, { borderColor: colors.border }]}>
                  <Text style={[styles.paragraph, { color: colors.textLight }]}>
                    Integrate organic amendments and balanced NPK schedules based on soil tests. Micronutrients like magnesium and zinc support vigor.
                  </Text>
                </View>
              </ExpandableContent>
              <TouchableOpacity style={styles.expandHeader} onPress={() => toggleExpand('harvest')}>
                <Text style={[styles.expandTitle, { color: colors.accent }]}>Harvesting</Text>
              </TouchableOpacity>
              <ExpandableContent visible={!!expandedSections.harvest}>
                <View style={[styles.card, { borderColor: colors.border }]}>
                  <Text style={[styles.paragraph, { color: colors.textLight }]}>
                    Harvest spikes at physiological maturity; optimize post-harvest drying to ensure uniform color and aroma retention.
                  </Text>
                </View>
              </ExpandableContent>
              <View style={styles.progressWrap}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressTitle, { color: colors.text }]}>Guide Progress</Text>
                  <Text style={[styles.progressPct, { color: colors.textLight }]}>
                    {Math.round((['soil','planting','irrigation','fertilization','harvest'].filter(k => expandedSections[k]).length/5)*100)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <Animated.View style={[styles.progressFill, { width: progressAnim }]} />
                </View>
              </View>
            </View>
          </ScrollView>

          <ScrollView style={{ width: pageWidth }} nestedScrollEnabled>
            <View style={styles.section}>
              <View style={styles.chipsRow}>
                {['all','critical','warning','info'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, severityFilter === c && styles.chipActive]}
                    onPress={() => setSeverityFilter(c)}
                  >
                    <Text style={[styles.chipText, severityFilter === c && styles.chipTextActive]}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {[
                { title: 'Phytophthora Foot Rot', severity: 'critical', desc: 'Improve drainage; apply fungicides; resistant cultivars.' },
                { title: 'Leaf Spot', severity: 'warning', desc: 'Remove infected leaves; enhance airflow; preventive sprays.' },
                { title: 'Nutrient Deficiency', severity: 'info', desc: 'Conduct analysis; adjust fertilization; supplement micronutrients.' },
              ].filter(i => severityFilter === 'all' || i.severity === severityFilter).map((issue, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.issueCard,
                    {
                      borderColor: colors.border,
                      borderLeftColor: issue.severity === 'critical' ? '#E74C3C' : issue.severity === 'warning' ? '#F39C12' : colors.accent,
                    },
                  ]}
                >
                  <View style={styles.issueHeader}>
                    <Text style={[styles.issueTitle, { color: colors.text }]}>{issue.title}</Text>
                    <Text style={[styles.issueSeverity, { color: colors.textLight }]}>{issue.severity.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.listDesc, { color: colors.textLight }]}>{issue.desc}</Text>
                  <TouchableOpacity style={styles.issueBtn}>
                    <Text style={styles.issueBtnText}>View Regimen</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          <ScrollView style={{ width: pageWidth }} nestedScrollEnabled>
            <View style={styles.section}>
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
                <View style={[styles.card, { borderColor: colors.border }]}>
                  <View style={styles.benefitRow}>
                    <MaterialCommunityIcons name="heart-pulse" size={22} color={colors.accent} />
                    <Text style={[styles.listTitle, { color: colors.text }]}>Antioxidant Properties</Text>
                  </View>
                  <Text style={[styles.listDesc, { color: colors.textLight }]}>
                    Piperine supports antioxidant activity and may aid nutrient absorption.
                  </Text>
                </View>
              )}
              {benefitsTab === 'digestive' && (
                <View style={[styles.card, { borderColor: colors.border }]}>
                  <View style={styles.benefitRow}>
                    <MaterialCommunityIcons name="food-fork-drink" size={22} color={colors.accent} />
                    <Text style={[styles.listTitle, { color: colors.text }]}>Digestive Support</Text>
                  </View>
                  <Text style={[styles.listDesc, { color: colors.textLight }]}>
                    Traditionally used to stimulate digestion and metabolic function.
                  </Text>
                </View>
              )}
              {benefitsTab === 'antiInflammatory' && (
                <View style={[styles.card, { borderColor: colors.border }]}>
                  <View style={styles.benefitRow}>
                    <MaterialCommunityIcons name="fire" size={22} color={colors.accent} />
                    <Text style={[styles.listTitle, { color: colors.text }]}>Potential Anti-inflammatory Effects</Text>
                  </View>
                  <Text style={[styles.listDesc, { color: colors.textLight }]}>
                    Research indicates compounds may modulate inflammatory pathways.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          <ScrollView style={{ width: pageWidth }} nestedScrollEnabled>
            <View style={styles.section}>
              <View style={[styles.card, { borderColor: colors.border }]}>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search news"
                  placeholderTextColor={colors.textLight}
                  style={styles.searchInput}
                />
              </View>
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
                    >
                      <View style={styles.newsHeader}>
                        <Text style={[styles.newsTitle, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.newsMeta, { color: colors.textLight }]}>{item.source} • {item.date}</Text>
                      </View>
                      <Text style={[styles.newsDesc, { color: colors.textLight }]}>{item.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </ScrollView>

        <View style={{ height: 24 }} />
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
          onPress={() => navigation.navigate('LeafAnalysis')}
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
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
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
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressPct: {
    fontSize: 12,
  },
  progressBar: {
    width: 220,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#22c55e',
    borderRadius: 4,
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
});

