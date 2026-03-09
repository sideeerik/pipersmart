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

const overviewReferenceCards = [
  {
    icon: 'weather-partly-rainy',
    title: 'Preferred Weather Conditions',
    accent: '#1F8A70',
    bgColor: '#EAF7F1',
    items: [
      'Temperature: best at 25 C to 35 C, with a wider workable range of 20 C to 35 C.',
      'Rainfall: strong, consistent moisture is preferred, roughly 1,750 mm to 3,000 mm annually.',
      'Humidity: healthy vine growth depends on high relative humidity around 60% to 80%.',
      'Sunlight: black pepper performs better under partial shade than under harsh all-day sun.',
    ],
  },
  {
    icon: 'sprout',
    title: 'Growing Season and Moisture',
    accent: '#2D6A57',
    bgColor: '#F0FAF4',
    items: [
      'Best planting window: rainy season, when soil moisture helps young vines establish quickly.',
      'A short clear dry spell can help flower induction, but long dry periods need irrigation support.',
      'Soil should stay consistently moist but must remain well-drained to avoid root rot.',
      'Mulch, shade regulation, and drainage management are as important as rainfall itself.',
    ],
  },
  {
    icon: 'terrain',
    title: 'Key Environmental Factors',
    accent: '#7A5C1E',
    bgColor: '#FFF7E7',
    items: [
      'Altitude: productive from sea level up to 1,500 m, with strongest yield potential usually below 350 m.',
      'Wind: vines should be protected from strong winds to prevent mechanical damage and moisture loss.',
      'Ideal site character: warm, humid, tropical, and commonly associated with shaded or forest-like conditions.',
      'Field planning should combine climate fit, support trees or posts, and good airflow around the crop.',
    ],
  },
];

const cultivationSteps = [
  {
    step: 1,
    key: 'propagation',
    icon: 'content-cut',
    accent: '#1F8A70',
    tone: '#EAF7F1',
    title: 'Propagation: Stem Cutting & Rooting',
    quickFacts: ['3-5 nodes', 'Shaded nursery', '4-7 new leaves'],
    content: 'Propagation starts with healthy vine cuttings rooted in a protected nursery before they are moved to the field.',
    details: [
      'Use healthy terminal or lateral stem cuttings with 3 to 5 nodes.',
      'Root the cuttings in moist sandy nursery media under shade.',
      'Keep the nursery evenly moist while the cuttings establish.',
      'Move to the field once each cutting has developed about 4 to 7 new leaves.',
    ],
  },
  {
    step: 2,
    key: 'planting',
    icon: 'sprout',
    accent: '#227C9D',
    tone: '#EAF6FB',
    title: 'Field Setup, Supports & Planting',
    quickFacts: ['Support trees', '2.5-3 m spacing', '60 cm pits'],
    content: 'Field planting depends on preparing the support system first, then spacing vines correctly for airflow and growth.',
    details: [
      'Establish support trees or standards before planting because black pepper is a climbing vine.',
      'Common support trees include kakawate, ipil-ipil, and silver oak.',
      'Supports are best planted 1 to 2 years ahead of the pepper vines.',
      'Use about 2.5 x 2.5 m to 3 x 3 m spacing with planting holes around 60 cm square.',
    ],
  },
  {
    step: 3,
    key: 'vegetative',
    icon: 'leaf',
    accent: '#3E8E41',
    tone: '#EEF8EE',
    title: 'Vegetative Growth & Maintenance',
    quickFacts: ['Regular watering', 'Compost inputs', 'Train and prune'],
    content: 'The early growth stage is about keeping vines moist, fed, and properly trained on their supports.',
    details: [
      'Water regularly, especially in the dry season, but avoid waterlogging.',
      'Use compost or other organic inputs to maintain soil fertility.',
      'Starter fertilizer such as 16-0-0 or 14-14-14 can support young vines.',
      'Tie vines upward and prune support trees to manage shade and structure.',
    ],
  },
  {
    step: 4,
    key: 'flowering',
    icon: 'flower-pollen',
    accent: '#9C6ADE',
    tone: '#F3EDFC',
    title: 'Bearing Stage & Crop Development',
    quickFacts: ['3-4 years to bear', 'Humid tropics', 'Below 350 m best'],
    content: 'Once the vines are established, productivity depends on strong climate fit and stable crop development conditions.',
    details: [
      'Black pepper performs best in hot, humid tropical conditions.',
      'Ideal rainfall is about 100 to 250 cm annually with well-drained fertile soil.',
      'Sites below 350 meters are usually the most productive.',
      'Plants commonly begin bearing about 3 to 4 years after planting.',
    ],
  },
  {
    step: 5,
    key: 'harvest',
    icon: 'basket-fill',
    accent: '#C97A00',
    tone: '#FFF6E7',
    title: 'Harvesting & Post-Harvest Processing',
    quickFacts: ['March-June peak', '1-2 berries red', 'Sun-dry 7-10 days'],
    content: 'Harvest timing and drying quality determine the final appearance, aroma, and value of the peppercorns.',
    details: [
      'Harvesting usually begins 3 to 4 years after planting.',
      'Peak harvests commonly fall between March and June.',
      'Pick spikes when 1 or 2 berries start turning red.',
      'Separate the berries and sun-dry for 7 to 10 days until black and wrinkled.',
    ],
  },
];

const cultivationHighlights = [
  {
    key: 'climate',
    icon: 'weather-partly-rainy',
    title: 'Climate & Soil',
    body: 'Thrives in hot, humid conditions with 100-250 cm rainfall, fertile well-drained soil, and best performance below 350 m elevation.',
    accent: '#1F8A70',
    tone: '#EAF7F1',
  },
  {
    key: 'propagation',
    icon: 'content-cut',
    title: 'Propagation',
    body: 'Stem cuttings with 3-5 nodes are rooted under shade in moist sandy nursery media until they push 4-7 new leaves.',
    accent: '#227C9D',
    tone: '#EAF6FB',
  },
  {
    key: 'support',
    icon: 'pine-tree',
    title: 'Support Trees',
    body: 'Use kakawate, ipil-ipil, silver oak, or similar supports, ideally planted 1-2 years before vines go into the field.',
    accent: '#3E8E41',
    tone: '#EEF8EE',
  },
  {
    key: 'harvest',
    icon: 'basket-fill',
    title: 'Harvest Window',
    body: 'Plants usually bear in 3-4 years. Pick spikes when 1-2 berries redden, then sun-dry for 7-10 days until black and wrinkled.',
    accent: '#C97A00',
    tone: '#FFF6E7',
  },
];

const botanicalTabs = [
  {
    id: 'classification',
    label: 'Classification',
    icon: 'sitemap',
    title: 'Scientific taxonomy',
    description: 'Trace black pepper from kingdom level down to the cultivated species.',
    tone: '#EAF7F1',
    accent: '#1F8A70',
  },
  {
    id: 'morphology',
    label: 'Morphology',
    icon: 'leaf-maple',
    title: 'Plant structure',
    description: 'See the key visible features of stems, leaves, flowers, fruits, and roots.',
    tone: '#EEF4FF',
    accent: '#227C9D',
  },
  {
    id: 'growth',
    label: 'Growth Stages',
    icon: 'sprout-outline',
    title: 'Growth timeline',
    description: 'Follow the crop from nursery propagation to harvest-ready spikes.',
    tone: '#FFF6E7',
    accent: '#C97A00',
  },
];

const classificationLevels = [
  { level: 'Kingdom', value: 'Plantae', icon: 'sprout', desc: 'Multicellular plants that produce energy through photosynthesis.' },
  { level: 'Subkingdom', value: 'Tracheobionata', icon: 'waves-arrow-up', desc: 'Vascular plants with transport tissues for water and nutrients.' },
  { level: 'Division', value: 'Magnoliophyta', icon: 'flower-outline', desc: 'Flowering plants that form seeds inside fruits.' },
  { level: 'Class', value: 'Magnoliopsida', icon: 'leaf', desc: 'Dicot plants with two cotyledons and net-like leaf venation.' },
  { level: 'Order', value: 'Piperales', icon: 'forest-outline', desc: 'An order known for aromatic and biologically active plant groups.' },
  { level: 'Family', value: 'Piperaceae', icon: 'molecule', desc: 'The pepper family, recognized for floral spikes and pungent oils.' },
  { level: 'Genus', value: 'Piper L.', icon: 'graph-outline', desc: 'A large tropical genus with thousands of spice and medicinal species.' },
  { level: 'Species', value: 'Piper nigrum L.', icon: 'star-four-points-outline', desc: 'The perennial woody vine cultivated globally for peppercorn production.' },
];

const botanicalCharacteristics = [
  {
    title: 'Fruit Type',
    detail: 'A drupe that turns red at maturity and becomes black peppercorn after drying.',
    icon: 'circle-slice-8',
    accent: '#1F8A70',
    tone: '#EAF7F1',
  },
  {
    title: 'Growth Habit',
    detail: 'A climbing perennial vine that can reach about 10 meters with support.',
    icon: 'arrow-up-bold-circle-outline',
    accent: '#227C9D',
    tone: '#EAF6FB',
  },
  {
    title: 'Origin',
    detail: 'Native to the Malabar Coast of India, where tropical conditions favor strong growth.',
    icon: 'map-marker-radius-outline',
    accent: '#9C6ADE',
    tone: '#F3EDFC',
  },
  {
    title: 'Varieties',
    detail: 'Commonly discussed by origin and local cultivation tradition, including Lampung and Sarawak types.',
    icon: 'earth',
    accent: '#C97A00',
    tone: '#FFF6E7',
  },
];

const morphologyParts = [
  {
    part: 'Habit',
    desc: 'A trailing or climbing woody vine that depends on support and produces adventitious roots at the nodes.',
    icon: 'sprout',
    accent: '#1F8A70',
    tone: '#EAF7F1',
  },
  {
    part: 'Stem',
    desc: 'Woody near the base with swollen nodes. Orthotropic stems climb upward while plagiotropic branches carry fruits.',
    icon: 'source-branch',
    accent: '#227C9D',
    tone: '#EAF6FB',
  },
  {
    part: 'Leaves',
    desc: 'Simple, alternate, glossy green leaves that are usually ovate to lanceolate with a pointed tip.',
    icon: 'leaf',
    accent: '#3E8E41',
    tone: '#EEF8EE',
  },
  {
    part: 'Inflorescence',
    desc: 'Minute flowers are arranged on hanging spikes that form opposite the leaves.',
    icon: 'flower-pollen',
    accent: '#9C6ADE',
    tone: '#F3EDFC',
  },
  {
    part: 'Fruit',
    desc: 'A small globose berry that shifts from green to red when ripe before drying into black pepper.',
    icon: 'fruit-cherries',
    accent: '#C97A00',
    tone: '#FFF6E7',
  },
  {
    part: 'Root System',
    desc: 'Adventitious roots support climbing, anchorage, and vegetative propagation.',
    icon: 'shovel',
    accent: '#7A5C1E',
    tone: '#FFF7E7',
  },
];

const growthStages = [
  {
    stage: 1,
    title: 'Propagation & Nursery',
    duration: '0-3 months',
    desc: 'Runner shoot cuttings are rooted in shaded nursery conditions before transplanting.',
    icon: 'seed-outline',
    accent: '#1F8A70',
    tone: '#EAF7F1',
  },
  {
    stage: 2,
    title: 'Vegetative Growth',
    duration: 'Years 1-2',
    desc: 'The vine climbs its support, expands leaf area, and builds the main canopy structure.',
    icon: 'sprout',
    accent: '#227C9D',
    tone: '#EAF6FB',
  },
  {
    stage: 3,
    title: 'Flowering Phase',
    duration: 'Year 3 onward',
    desc: 'Small flowers appear on spikes once the vine is mature enough to enter reproductive growth.',
    icon: 'flower-outline',
    accent: '#9C6ADE',
    tone: '#F3EDFC',
  },
  {
    stage: 4,
    title: 'Fruit Development',
    duration: '5-6 months',
    desc: 'Berries fill and change from green toward red as they approach harvest maturity.',
    icon: 'fruit-grapes',
    accent: '#C97A00',
    tone: '#FFF6E7',
  },
  {
    stage: 5,
    title: 'Harvesting',
    duration: 'Mature stage',
    desc: 'Spikes are picked when a few berries redden, then processed and dried into black pepper.',
    icon: 'basket-fill',
    accent: '#7A5C1E',
    tone: '#FFF7E7',
  },
];

const diseaseFocusCards = [
  {
    key: 'scouting',
    icon: 'microscope',
    title: 'Early scouting',
    text: 'Inspect collar zones, leaves, and new growth regularly so infections are caught before spread accelerates.',
    accent: '#1F8A70',
    tone: '#EAF7F1',
  },
  {
    key: 'drainage',
    icon: 'water-alert',
    title: 'Moisture control',
    text: 'Good drainage and lower leaf wetness are still the fastest way to reduce heavy fungal pressure.',
    accent: '#227C9D',
    tone: '#EAF6FB',
  },
  {
    key: 'sanitation',
    icon: 'spray-bottle',
    title: 'Clean management',
    text: 'Remove infected material, sanitize tools, and rotate protection measures to reduce reinfection risk.',
    accent: '#C97A00',
    tone: '#FFF6E7',
  },
];

const diseaseIssues = [
  {
    title: 'Footrot',
    severity: 'critical',
    type: 'Fungal disease',
    icon: 'alert-octagon',
    accent: '#E74C3C',
    tone: '#FDECEC',
    desc: 'Phytophthora infection that attacks the collar and root zone, causing rapid wilting and major plant mortality.',
    symptoms: [
      'Dark lesions at the collar region',
      'Rapid wilting and defoliation',
      'Root decay and discoloration',
      'Yellow to brown canopy decline',
      'Ooze from infected tissues in wet weather',
    ],
    prevention: 'Improve drainage, avoid waterlogging, use clean planting material, and keep nursery and field soils well aerated.',
    treatment: 'Remove heavily infected plants, improve soil aeration, and apply copper- or phosphite-based fungicide programs on schedule.',
  },
  {
    title: 'Leaf Blight',
    severity: 'warning',
    type: 'Fungal disease',
    icon: 'leaf-off',
    accent: '#F39C12',
    tone: '#FFF7E8',
    desc: 'A blight disease that causes necrotic leaf lesions, premature leaf drop, and weaker photosynthetic capacity.',
    symptoms: [
      'Brown lesions with yellow margins',
      'Concentric rings on older spots',
      'Leaf yellowing and drop',
      'Spread to stems and berries in heavy pressure',
    ],
    prevention: 'Improve airflow, prune dense canopies, reduce leaf wetness, and avoid overhead irrigation where possible.',
    treatment: 'Remove affected leaves and use recommended protective fungicides such as mancozeb or copper oxychloride in intervals.',
  },
  {
    title: 'Slow Decline',
    severity: 'critical',
    type: 'Viral disease',
    icon: 'chart-line',
    accent: '#D35454',
    tone: '#FDECEC',
    desc: 'A long-term decline syndrome that reduces vigor, berry size, and productive life of mature vines.',
    symptoms: [
      'Gradual stunting over seasons',
      'Yellowing of older leaves',
      'Reduced spike production',
      'Lower berry size and yield',
      'Plants becoming barren after several years',
    ],
    prevention: 'Start with certified clean planting material, monitor vectors closely, and isolate nurseries from infected fields.',
    treatment: 'There is no direct cure, so infected vines should be removed and vector control should be tightened immediately.',
  },
  {
    title: 'Pollu Disease',
    severity: 'warning',
    type: 'Fungal disease',
    icon: 'water-alert',
    accent: '#D68910',
    tone: '#FFF7E8',
    desc: 'A humid-weather leaf infection that produces water-soaked lesions and can trigger severe defoliation.',
    symptoms: [
      'Water-soaked spots on leaves',
      'White sporangia under infected tissue',
      'Rapid lesion spread in high humidity',
      'Petiole and stem infection in severe cases',
    ],
    prevention: 'Maintain spacing, reduce splash and leaf wetness, remove infected leaves promptly, and keep monsoon sanitation tight.',
    treatment: 'Use recommended anti-Phytophthora fungicides in rotation and remove badly affected plant parts before spread intensifies.',
  },
  {
    title: 'Yellow Mottle Virus',
    severity: 'warning',
    type: 'Viral disease',
    icon: 'virus',
    accent: '#9B59B6',
    tone: '#F5EEFB',
    desc: 'A mite-transmitted viral problem that causes yellow mottling, distortion, stunting, and weaker fruit development.',
    symptoms: [
      'Yellow mottled patterns on new leaves',
      'Mosaic-like leaf appearance',
      'Distorted foliage shape and size',
      'Reduced berry production and quality',
    ],
    prevention: 'Control mite vectors, use clean nursery material, remove volunteer hosts, and separate infected vines from healthy blocks.',
    treatment: 'There is no cure for infected plants, so management focuses on vector suppression, hygiene, and removal of severe cases.',
  },
];

const benefitTabs = [
  {
    id: 'nutrition',
    label: 'Antioxidants',
    icon: 'heart-pulse',
    accent: '#1F8A70',
    tone: '#E1F4EA',
  },
  {
    id: 'digestive',
    label: 'Digestive Support',
    icon: 'fire',
    accent: '#F59E0B',
    tone: '#FFFBEB',
  },
  {
    id: 'antiInflammatory',
    label: 'Anti-inflammatory',
    icon: 'shield-check',
    accent: '#EF4444',
    tone: '#FEE2E2',
  },
];

export default function KnowledgeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerSlideAnim = useRef(new Animated.Value(-280)).current;
  const [activeTab, setActiveTab] = useState('overview');
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [showCultivationHighlights, setShowCultivationHighlights] = useState(false);
  const [showCultivationStages, setShowCultivationStages] = useState(false);
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
      icon: 'leaf',
      title: 'Botanical Profile',
      heading: 'Scientific Name: Piper nigrum',
      highlights: ['Member of Piperaceae family', 'Perennial woody vine', 'Native to Malabar Coast, India'],
      details: 'A perennial, woody, climbing vine that can reach heights of 10 meters or more if left unsupported. Produces spikes with 50-150 tiny flowers that develop into peppercorn drupes. The same plant produces black, white, green, and red pepper - the difference lies in berry maturity and processing.',
      bgColor: '#E8F5E9',
      accent: '#2E7D32',
    },
    {
      icon: 'weather-sunny',
      title: 'Temperature & Climate',
      heading: 'Preferred: 25-35 C',
      highlights: ['Works best in tropical heat', 'Humidity target: 60-80%', 'Protect vines below 10 C'],
      details: 'Black pepper thrives in a warm, moist tropical climate and performs best between 25 C and 35 C. It remains workable in a broader 20 C to 35 C range, but temperatures below 10 C can damage the plant. Partial shade is preferred over harsh all-day sun, especially in exposed sites.',
      bgColor: '#FFF3E0',
      accent: '#EF6C00',
    },
    {
      icon: 'weather-rainy',
      title: 'Rainfall & Irrigation',
      heading: '1750-3000 mm/year',
      highlights: ['High, consistent rainfall', 'Rainy season is best for planting', 'Long dry spells need irrigation'],
      details: 'Black pepper needs strong and steady moisture through the year. The rainy season is the best time for establishment because young vines root faster in moist soil. A short clear dry period can help flower induction, but prolonged dry weather should be backed by irrigation to avoid water stress.',
      bgColor: '#E3F2FD',
      accent: '#1565C0',
    },
    {
      icon: 'shovel',
      title: 'Moisture & Soil Care',
      heading: 'Moist but well-drained',
      highlights: ['Keep root zone evenly moist', 'Never allow waterlogging', 'Organic matter improves stability'],
      details: 'The crop wants a consistently moist root zone, but drainage must stay open. Waterlogged soil raises the risk of root rot and quick wilt, so drainage design is critical in wet areas. Organic matter, mulching, and loose friable soil help the vines hold moisture without staying saturated.',
      bgColor: '#F3E5F5',
      accent: '#7B1FA2',
    },
    {
      icon: 'terrain',
      title: 'Site Factors',
      heading: 'Best below 350 m',
      highlights: ['Viable up to 1500 m', 'Wind protection is important', 'Shaded tropical sites are ideal'],
      details: 'Black pepper can grow from sea level up to 1500 meters, but the strongest yield potential is usually below 350 meters. It performs best in warm, humid, partly shaded environments, often similar to tropical forest margins. Wind protection matters because strong winds can damage vines and dry the canopy too quickly.',
      bgColor: '#FFF6E5',
      accent: '#8D5B1A',
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

  const toggleHighlightsSection = () => {
    setShowCultivationHighlights((prev) => !prev);
  };

  const toggleStagesSection = () => {
    setShowCultivationStages((prev) => !prev);
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
    primary: '#0E3B2E',
    background: '#F3F7F4',
    text: '#0E3B2E',
    textLight: '#62736C',
    border: '#DDE7E1',
    accent: '#2BB673',
    accentSoft: '#E1F4EA',
    card: '#FFFFFF',
  };

  const activeBotanicalMeta = botanicalTabs.find((tab) => tab.id === botanicalActive) || botanicalTabs[0];

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
      <View style={styles.heroWrap}>
        <View style={styles.heroGlow} />
        <View style={styles.heroRing} />
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.heroEyebrow}>Learning Hub</Text>
          <Text style={styles.heroTitle}>Piper Knowledge</Text>
          <Text style={styles.heroSubtitle}>
            Your comprehensive guide to black pepper cultivation and management.
          </Text>
          <View style={styles.heroPills}>
            {['Botanical', 'Disease Care', 'Benefits'].map((item) => (
              <View key={item} style={[styles.heroPill, { backgroundColor: colors.accentSoft }]}>
                <Text style={styles.heroPillText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
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
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
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
          <Animated.View style={[styles.tabIndicator, { backgroundColor: colors.accentSoft, left: indicatorX, width: indicatorW }]} />
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
                          <MaterialCommunityIcons name={guide.icon} size={30} color={guide.accent} />
                        </View>
                        <View style={styles.guideTitleContainer}>
                          <Text style={[styles.guideCardTitle, { color: colors.text }]}>{guide.title}</Text>
                          <Text style={[styles.guideHeading, { color: guide.accent }]}>
                            {guide.heading}
                          </Text>
                        </View>
                        <MaterialCommunityIcons
                          name={expandedGuide === index ? 'chevron-down' : 'chevron-right'}
                          size={18}
                          color={guide.accent}
                        />
                      </View>

                      {/* Highlights (always visible) */}
                      <View style={styles.highlightsContainer}>
                        {guide.highlights.map((highlight, hIdx) => (
                          <View key={hIdx} style={[styles.highlightBadge, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
                            <Text style={[styles.highlightText, { color: guide.accent }]}>
                              - {highlight}
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

              <View style={styles.overviewReferenceSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Field Reference Overview</Text>
                <Text style={[styles.guideSubtext, { color: colors.textLight }]}>
                  Quick production guidance for climate fit, moisture timing, and site selection
                </Text>

                <View style={styles.overviewReferenceGrid}>
                  {overviewReferenceCards.map((card) => (
                    <View
                      key={card.title}
                      style={[
                        styles.overviewReferenceCard,
                        { backgroundColor: card.bgColor, borderColor: colors.border },
                      ]}
                    >
                      <View style={styles.overviewReferenceHeader}>
                        <View style={[styles.overviewReferenceIconWrap, { backgroundColor: `${card.accent}18` }]}>
                          <MaterialCommunityIcons name={card.icon} size={20} color={card.accent} />
                        </View>
                        <Text style={[styles.overviewReferenceTitle, { color: colors.text }]}>{card.title}</Text>
                      </View>

                      <View style={styles.overviewReferenceList}>
                        {card.items.map((item) => (
                          <View key={item} style={styles.overviewReferenceItem}>
                            <View style={[styles.overviewReferenceDot, { backgroundColor: card.accent }]} />
                            <Text style={[styles.overviewReferenceText, { color: colors.textLight }]}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <ScrollView style={{ width: pageWidth }} nestedScrollEnabled>
            <View style={styles.section}>
              <View style={[styles.subtabs, styles.botanicalSubtabs]}>
                {botanicalTabs.map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    style={[
                      styles.subtabBtn,
                      styles.botanicalSubtabBtn,
                      botanicalActive === tab.id && {
                        borderColor: tab.accent,
                        backgroundColor: tab.tone,
                      },
                    ]}
                    onPress={() => setBotanicalActive(tab.id)}
                    activeOpacity={0.9}
                  >
                    <View style={[styles.botanicalSubtabIconWrap, { backgroundColor: botanicalActive === tab.id ? tab.accent : '#F3F7F4' }]}>
                      <MaterialCommunityIcons
                        name={tab.icon}
                        size={16}
                        color={botanicalActive === tab.id ? '#FFFFFF' : tab.accent}
                      />
                    </View>
                    <Text
                      style={[
                        styles.subtabText,
                        styles.botanicalSubtabText,
                        botanicalActive === tab.id && { color: tab.accent },
                      ]}
                    >
                      {tab.label}
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
              <View style={[styles.botanicalHeroCard, { borderColor: colors.border, backgroundColor: activeBotanicalMeta.tone }]}>
                <View style={styles.botanicalHeroHeader}>
                  <View style={[styles.botanicalHeroIconWrap, { backgroundColor: `${activeBotanicalMeta.accent}18` }]}>
                    <MaterialCommunityIcons name={activeBotanicalMeta.icon} size={24} color={activeBotanicalMeta.accent} />
                  </View>
                  <View style={styles.botanicalHeroBody}>
                    <Text style={[styles.botanicalHeroEyebrow, { color: activeBotanicalMeta.accent }]}>
                      Botanical focus
                    </Text>
                    <Text style={[styles.botanicalHeroTitle, { color: colors.text }]}>{activeBotanicalMeta.title}</Text>
                  </View>
                </View>
                <Text style={[styles.botanicalHeroText, { color: colors.textLight }]}>
                  {activeBotanicalMeta.description}
                </Text>
              </View>
              {botanicalActive === 'classification' && (
                <View>
                  <View style={[styles.botanicalPanel, { borderColor: colors.border }]}>
                    <View style={styles.botanicalPanelHeader}>
                      <Text style={[styles.botanicalPanelTitle, { color: colors.text }]}>Scientific Classification</Text>
                      <Text style={[styles.botanicalPanelText, { color: colors.textLight }]}>
                        The taxonomy ladder places black pepper clearly within the pepper family and the Piper genus.
                      </Text>
                    </View>
                    <View style={styles.taxonomyGrid}>
                      {classificationLevels.map((item) => (
                        <View key={item.level} style={[styles.taxonomyCard, { borderColor: colors.border }]}>
                          <View style={[styles.taxonomyIconWrap, { backgroundColor: '#EAF7F1' }]}>
                            <MaterialCommunityIcons name={item.icon} size={18} color="#1F8A70" />
                          </View>
                          <Text style={styles.taxonomyLevel}>{item.level}</Text>
                          <Text style={[styles.taxonomyValue, { color: colors.text }]}>{item.value}</Text>
                          <Text style={[styles.taxonomyText, { color: colors.textLight }]}>{item.desc}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={[styles.botanicalPanel, { borderColor: colors.border, marginTop: 14 }]}>
                    <View style={styles.botanicalPanelHeader}>
                      <Text style={[styles.botanicalPanelTitle, { color: colors.text }]}>Key Characteristics</Text>
                    </View>
                    <View style={styles.botanicalTraitsGrid}>
                      {botanicalCharacteristics.map((item) => (
                        <View
                          key={item.title}
                          style={[styles.botanicalTraitCard, { backgroundColor: item.tone, borderColor: colors.border }]}
                        >
                          <View style={[styles.botanicalTraitIconWrap, { backgroundColor: `${item.accent}18` }]}>
                            <MaterialCommunityIcons name={item.icon} size={18} color={item.accent} />
                          </View>
                          <Text style={[styles.botanicalTraitTitle, { color: colors.text }]}>{item.title}</Text>
                          <Text style={[styles.botanicalTraitText, { color: colors.textLight }]}>{item.detail}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
              {botanicalActive === 'morphology' && (
                <View>
                  <View style={[styles.botanicalPanel, { borderColor: colors.border }]}>
                    <Text style={[styles.botanicalPanelText, { color: colors.textLight }]}>
                      Black pepper is a tropical woody climber with distinct climbing stems, fruiting branches, glossy leaves, hanging floral spikes, and small berries that mature from green to red.
                    </Text>
                    <View style={styles.morphologyGrid}>
                      {morphologyParts.map((item) => (
                        <View key={item.part} style={[styles.morphologyCard, { backgroundColor: item.tone, borderColor: colors.border }]}>
                          <View style={[styles.morphologyIconWrap, { backgroundColor: `${item.accent}18` }]}>
                            <MaterialCommunityIcons name={item.icon} size={18} color={item.accent} />
                          </View>
                          <Text style={[styles.morphologyTitle, { color: colors.text }]}>{item.part}</Text>
                          <Text style={[styles.morphologyText, { color: colors.textLight }]}>{item.desc}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
              {botanicalActive === 'growth' && (
                <View>
                  <View style={[styles.botanicalPanel, { borderColor: colors.border }]}>
                    <Text style={[styles.botanicalPanelText, { color: colors.textLight }]}>
                      Black pepper usually reaches strong production after several years, moving from nursery establishment through canopy growth, flowering, fruit filling, and harvest.
                    </Text>
                    <View style={styles.growthStageList}>
                      {growthStages.map((item) => (
                        <View key={item.stage} style={[styles.growthStageCard, { borderColor: colors.border, backgroundColor: '#FFFFFF' }]}>
                          <View style={[styles.growthStageRail, { backgroundColor: item.accent }]} />
                          <View style={styles.growthStageHeader}>
                            <View style={[styles.growthStageNumber, { backgroundColor: item.accent }]}>
                              <Text style={styles.growthStageNumberText}>{item.stage}</Text>
                            </View>
                            <View style={styles.growthStageBody}>
                              <View style={styles.growthStageTitleRow}>
                                <View style={[styles.growthStageIconWrap, { backgroundColor: item.tone }]}>
                                  <MaterialCommunityIcons name={item.icon} size={18} color={item.accent} />
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.growthStageTitle, { color: colors.text }]}>{item.title}</Text>
                                  <View style={[styles.growthStageDuration, { backgroundColor: item.accent }]}>
                                    <Text style={styles.growthStageDurationText}>{item.duration}</Text>
                                  </View>
                                </View>
                              </View>
                              <Text style={[styles.growthStageText, { color: colors.textLight }]}>{item.desc}</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
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
              <View style={[styles.diseaseHeroCard, { borderColor: colors.border }]}>
                <View style={styles.diseaseHeroGlow} />
                <Text style={styles.diseaseHeroEyebrow}>Disease management</Text>
                <Text style={[styles.diseaseHeroTitle, { color: colors.text }]}>
                  Focus on early detection, cleaner fields, and fast response
                </Text>
                <Text style={[styles.diseaseHeroText, { color: colors.textLight }]}>
                  The biggest pepper losses usually come from fungal pressure, poor drainage, and delayed response to viral spread.
                </Text>
                <View style={styles.diseaseHeroChips}>
                  <View style={styles.diseaseHeroChip}>
                    <Text style={styles.diseaseHeroChipText}>5 key threats</Text>
                  </View>
                  <View style={styles.diseaseHeroChip}>
                    <Text style={styles.diseaseHeroChipText}>Fungal + viral</Text>
                  </View>
                  <View style={styles.diseaseHeroChip}>
                    <Text style={styles.diseaseHeroChipText}>Scout early</Text>
                  </View>
                </View>
              </View>
              <View style={styles.diseaseFocusGrid}>
                {diseaseFocusCards.map((item) => (
                  <View
                    key={item.key}
                    style={[styles.diseaseFocusCard, { backgroundColor: item.tone, borderColor: colors.border }]}
                  >
                    <View style={[styles.diseaseFocusIconWrap, { backgroundColor: `${item.accent}18` }]}>
                      <MaterialCommunityIcons name={item.icon} size={18} color={item.accent} />
                    </View>
                    <Text style={[styles.diseaseFocusTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.diseaseFocusText, { color: colors.textLight }]}>{item.text}</Text>
                  </View>
                ))}
              </View>
              {diseaseIssues.map((issue) => (
                <View
                  key={issue.title}
                  style={[
                    styles.diseaseCard,
                    {
                      borderColor: colors.border,
                      borderLeftColor: issue.accent,
                    },
                  ]}
                >
                  <View style={styles.diseaseHeader}>
                    <View style={[styles.diseaseIconWrap, { backgroundColor: issue.tone }]}>
                      <MaterialCommunityIcons name={issue.icon} size={22} color={issue.accent} />
                    </View>
                    <View style={styles.diseaseHeaderBody}>
                      <View style={styles.diseaseMetaRow}>
                        <Text style={[styles.diseaseTypePill, { color: issue.accent, backgroundColor: issue.tone }]}>
                          {issue.type}
                        </Text>
                        <Text style={[styles.diseaseSeverityPill, { backgroundColor: issue.accent }]}>
                          {issue.severity.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.diseaseTextBlock}>
                        <Text style={[styles.diseaseTitle, { color: colors.text }]}>{issue.title}</Text>
                        <Text style={[styles.diseaseDesc, { color: colors.textLight }]}>{issue.desc}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.symptomsList}>
                    <Text style={[styles.symptomsLabel, { color: colors.text }]}>Common Symptoms</Text>
                    <View style={styles.diseaseSymptomsWrap}>
                      {issue.symptoms.map((sym) => (
                        <View key={sym} style={[styles.symptomTag, { borderColor: colors.border, backgroundColor: colors.background }]}>
                          <Text style={[styles.symptomText, { color: colors.textLight }]}>{sym}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.diseaseCareGrid}>
                    <View style={[styles.preventionBox, { borderColor: colors.border }]}>
                      <View style={styles.diseaseCareHeader}>
                        <View style={[styles.diseaseCareIconWrap, { backgroundColor: '#DFF5E8' }]}>
                          <MaterialCommunityIcons name="shield-alert" size={16} color="#1F8A70" />
                        </View>
                        <Text style={[styles.preventionTitle, { color: colors.text }]}>Prevention</Text>
                      </View>
                      <Text style={[styles.preventionText, { color: colors.textLight }]}>{issue.prevention}</Text>
                    </View>
                    <View style={[styles.treatmentBox, { borderColor: colors.border }]}>
                      <View style={styles.diseaseCareHeader}>
                        <View style={[styles.diseaseCareIconWrap, { backgroundColor: '#FFF0D9' }]}>
                          <MaterialCommunityIcons name="pill" size={16} color="#C97A00" />
                        </View>
                        <Text style={[styles.treatmentTitle, { color: colors.text }]}>Treatment</Text>
                      </View>
                      <Text style={[styles.treatmentText, { color: colors.textLight }]}>{issue.treatment}</Text>
                    </View>
                  </View>
                </View>
              ))}
              {/*
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
                          <Text style={[styles.symptomText, { color: colors.textLight }]}>- {sym}</Text>
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
              */}
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
              <View style={[styles.subtabs, styles.benefitsSubtabs]}>
                {benefitTabs.map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    style={[
                      styles.subtabBtn,
                      styles.benefitSubtabBtn,
                      benefitsTab === tab.id && styles.subtabBtnActive,
                      benefitsTab === tab.id && {
                        borderColor: tab.accent,
                        backgroundColor: tab.tone,
                      },
                    ]}
                    onPress={() => setBenefitsTab(tab.id)}
                    activeOpacity={0.9}
                  >
                    <View
                      style={[
                        styles.benefitSubtabIconWrap,
                        { backgroundColor: benefitsTab === tab.id ? tab.accent : '#F3F7F4' },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={tab.icon}
                        size={16}
                        color={benefitsTab === tab.id ? '#FFFFFF' : tab.accent}
                      />
                    </View>
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.subtabText,
                        styles.benefitSubtabText,
                        benefitsTab === tab.id && styles.subtabTextActive,
                        benefitsTab === tab.id && { color: tab.accent },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {benefitsTab === 'nutrition' && (
                <View>
                  <View style={[styles.card, { borderColor: colors.border, backgroundColor: '#E1F4EA', borderLeftWidth: 5, borderLeftColor: colors.accent }]}>
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
                <Text style={[styles.guideSubtext, { color: colors.textLight }]}>
                  Follow the crop cycle from nursery preparation to harvest-ready peppercorns
                </Text>
              </View>
              <View style={[styles.cultivationShowcase, { borderColor: colors.border }]}>
                <View style={styles.cultivationShowcaseGlow} />
                <Text style={styles.cultivationShowcaseEyebrow}>Field roadmap</Text>
                <Text style={[styles.cultivationShowcaseTitle, { color: colors.text }]}>
                  Black pepper cultivation from nursery cuttings to dried peppercorns
                </Text>
                <Text style={[styles.cultivationShowcaseText, { color: colors.textLight }]}>
                  This tab covers climate fit, support-tree setup, spacing, field care, and the harvest flow used for black pepper production.
                </Text>
                <View style={styles.cultivationShowcaseChips}>
                  <View style={styles.cultivationShowcaseChip}>
                    <Text style={styles.cultivationShowcaseChipText}>100-250 cm rainfall</Text>
                  </View>
                  <View style={styles.cultivationShowcaseChip}>
                    <Text style={styles.cultivationShowcaseChipText}>Below 350 m best</Text>
                  </View>
                  <View style={styles.cultivationShowcaseChip}>
                    <Text style={styles.cultivationShowcaseChipText}>3-4 years to bear</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.cultivationHighlightsToggle, { borderColor: colors.border }]}
                onPress={toggleHighlightsSection}
                activeOpacity={0.9}
              >
                <View>
                  <Text style={styles.cultivationHighlightsToggleLabel}>Key cultivation aspects</Text>
                  <Text style={[styles.cultivationHighlightsToggleText, { color: colors.textLight }]}>
                    {showCultivationHighlights ? 'Hide the 4 preview cards' : 'Preview the 4 cards'}
                  </Text>
                </View>
                <Animated.View
                  style={[
                    styles.cultivationHighlightsToggleChevron,
                    {
                      backgroundColor: colors.accentSoft,
                      transform: [{ rotate: showCultivationHighlights ? '180deg' : '0deg' }],
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="chevron-down" size={18} color={colors.accent} />
                </Animated.View>
              </TouchableOpacity>
              {showCultivationHighlights && (
                <View style={styles.cultivationHighlightsGrid}>
                  {cultivationHighlights.map((item) => (
                    <View
                      key={item.key}
                      style={[
                        styles.cultivationHighlightCard,
                        {
                          backgroundColor: item.tone,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.cultivationHighlightHeader}>
                        <View style={[styles.cultivationHighlightIconWrap, { backgroundColor: `${item.accent}18` }]}>
                          <MaterialCommunityIcons name={item.icon} size={20} color={item.accent} />
                        </View>
                      </View>
                      <Text style={[styles.cultivationHighlightTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.cultivationHighlightBody, { color: colors.textLight }]}>{item.body}</Text>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity
                style={[styles.cultivationHighlightsToggle, styles.cultivationStagesToggle, { borderColor: colors.border }]}
                onPress={toggleStagesSection}
                activeOpacity={0.9}
              >
                <View>
                  <Text style={styles.cultivationHighlightsToggleLabel}>Cultivation stages</Text>
                  <Text style={[styles.cultivationHighlightsToggleText, { color: colors.textLight }]}>
                    {showCultivationStages ? 'Hide the stage cards' : 'Preview the stage cards'}
                  </Text>
                </View>
                <Animated.View
                  style={[
                    styles.cultivationHighlightsToggleChevron,
                    {
                      backgroundColor: colors.accentSoft,
                      transform: [{ rotate: showCultivationStages ? '180deg' : '0deg' }],
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="chevron-down" size={18} color={colors.accent} />
                </Animated.View>
              </TouchableOpacity>
              {showCultivationStages && (
                <View style={styles.cultivationTimeline}>
                {cultivationSteps.map((item, index) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.cultivationCard,
                      expandedSections[item.key] && styles.cultivationCardExpanded,
                      {
                        borderColor: expandedSections[item.key] ? item.accent : colors.border,
                        backgroundColor: '#FFFFFF',
                      },
                    ]}
                    onPress={() => toggleExpand(item.key)}
                    activeOpacity={0.86}
                  >
                    <View style={[styles.cultivationAccentRail, { backgroundColor: item.accent }]} />
                    {index < cultivationSteps.length - 1 && <View style={styles.cultivationConnector} />}
                    <View style={styles.cultivationHeader}>
                      <View style={[styles.cultivationStepNumberBox, { backgroundColor: item.accent, shadowColor: item.accent }]}>
                        <Text style={styles.cultivationStepNumber}>{item.step}</Text>
                      </View>
                      <View style={styles.cultivationHeaderBody}>
                        <View style={styles.cultivationMetaRow}>
                          <View style={[styles.cultivationStagePill, { backgroundColor: item.tone }]}>
                            <Text style={[styles.cultivationStagePillText, { color: item.accent }]}>
                              Stage {String(item.step).padStart(2, '0')}
                            </Text>
                          </View>
                          <Text style={[styles.cultivationMetaHint, { color: colors.textLight }]}>
                            {expandedSections[item.key] ? 'Tap to collapse' : 'Tap to expand'}
                          </Text>
                        </View>
                        <View style={styles.cultivationTitleRow}>
                          <View style={[styles.cultivationIconWrap, { backgroundColor: item.tone }]}>
                            <MaterialCommunityIcons name={item.icon} size={20} color={item.accent} />
                          </View>
                          <Text style={[styles.cultivationTitle, { color: colors.text }]}>{item.title}</Text>
                        </View>
                        <View style={styles.cultivationFactRow}>
                          {item.quickFacts.map((fact) => (
                            <View key={fact} style={[styles.cultivationFactChip, { backgroundColor: item.tone }]}>
                              <Text style={[styles.cultivationFactText, { color: item.accent }]}>{fact}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      <Animated.View
                        style={[
                          styles.cultivationChevronWrap,
                          { backgroundColor: item.tone, transform: [{ rotate: expandedSections[item.key] ? '180deg' : '0deg' }] },
                        ]}
                      >
                        <MaterialCommunityIcons name="chevron-down" size={24} color={item.accent} />
                      </Animated.View>
                    </View>
                    {expandedSections[item.key] && (
                      <View style={[styles.cultivationExpanded, { borderTopColor: colors.border, backgroundColor: item.tone }]}>
                        <Text style={[styles.cultivationExpandedLabel, { color: item.accent }]}>Overview</Text>
                        <Text style={[styles.cultivationExpandedText, { color: colors.textLight }]}>
                          {item.content}
                        </Text>
                        <Text style={[styles.cultivationExpandedLabel, styles.cultivationExpandedLabelSpacing, { color: item.accent }]}>
                          Key Points
                        </Text>
                        <View style={styles.cultivationDetailList}>
                          {item.details.map((detail) => (
                            <View key={detail} style={styles.cultivationDetailItem}>
                              <View style={[styles.cultivationDetailDot, { backgroundColor: item.accent }]} />
                              <Text style={[styles.cultivationDetailText, { color: colors.textLight }]}>{detail}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
                </View>
              )}
              {/*
              {false && ([
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
              */}
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
                          {item.source} - {item.date}
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
                  text: 'Leaf Analysis - Detect diseases',
                  onPress: () => navigation.navigate('LeafAnalysis'),
                },
                {
                  text: 'Bunga Fruit - Check ripeness',
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
  screenContent: {
    paddingBottom: 40,
  },
  heroWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: 8,
  },
  heroGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(43, 182, 115, 0.25)',
    top: -24,
    right: -24,
  },
  heroRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    bottom: -40,
    left: -10,
  },
  heroCard: {
    borderRadius: 22,
    padding: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  heroEyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14.5,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 21,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  heroPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0E3B2E',
  },
  tabsWrapper: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE7E1',
    paddingVertical: 6,
    paddingHorizontal: 6,
    minHeight: 44,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  tabsContent: {
    alignItems: 'center',
    paddingRight: 8,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    zIndex: 1,
  },
  tabButtonActive: {},
  tabIndicator: {
    position: 'absolute',
    top: 6,
    height: 32,
    borderRadius: 16,
    zIndex: 0,
  },
  tabButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#62736C',
  },
  tabButtonTextActive: {
    color: '#0E3B2E',
  },
  section: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE7E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
    color: '#0E3B2E',
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE7E1',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
    fontWeight: '500',
    textAlign: 'justify',
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
    color: '#62736C',
    textAlign: 'justify',
  },
  newsItem: {
    borderWidth: 1,
    borderColor: '#DDE7E1',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
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
    lineHeight: 19,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#DDE7E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: '#0E3B2E',
    backgroundColor: '#FFFFFF',
  },
  skeletonItem: {
    height: 84,
    borderWidth: 1,
    borderRadius: 14,
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
    borderWidth: 1,
    borderColor: '#DDE7E1',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  factIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E1F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  factTitle: {
    fontSize: 12,
    color: '#62736C',
    fontWeight: '600',
  },
  factValue: {
    fontSize: 14,
    color: '#0E3B2E',
    fontWeight: '700',
  },
  overviewReferenceSection: {
    marginTop: 24,
  },
  overviewReferenceGrid: {
    gap: 14,
  },
  overviewReferenceCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  overviewReferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  overviewReferenceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewReferenceTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  overviewReferenceList: {
    gap: 10,
  },
  overviewReferenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  overviewReferenceDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginTop: 7,
  },
  overviewReferenceText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  illustrationBox: {
    height: 160,
    backgroundColor: '#F3F7F4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE7E1',
    position: 'relative',
  },
  hotspot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2BB673',
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  tooltipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0E3B2E',
  },
  tooltipText: {
    fontSize: 11,
    color: '#62736C',
  },
  actionsRow: {
    paddingVertical: 6,
    gap: 12,
  },
  actionCard: {
    width: 220,
    borderWidth: 1,
    borderColor: '#DDE7E1',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
    color: '#0E3B2E',
  },
  actionBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionDesc: {
    fontSize: 12,
    color: '#62736C',
  },
  subtabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  subtabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DDE7E1',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexShrink: 1,
  },
  subtabBtnActive: {
    borderColor: '#2BB673',
    backgroundColor: '#E1F4EA',
  },
  subtabText: {
    fontSize: 12,
    color: '#62736C',
    fontWeight: '700',
    textAlign: 'center',
  },
  subtabTextActive: {
    color: '#2BB673',
  },
  benefitsSubtabs: {
    alignItems: 'stretch',
  },
  botanicalSubtabs: {
    alignItems: 'stretch',
  },
  botanicalSubtabBtn: {
    minHeight: 64,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 18,
    flexBasis: '31%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0E3B2E',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  botanicalSubtabIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botanicalSubtabText: {
    lineHeight: 15,
  },
  benefitSubtabBtn: {
    minHeight: 64,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 18,
    flexBasis: '31%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0E3B2E',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  benefitSubtabIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitSubtabText: {
    lineHeight: 15,
  },
  botanicalHeroCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  botanicalHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  botanicalHeroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botanicalHeroBody: {
    flex: 1,
  },
  botanicalHeroEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  botanicalHeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
  },
  botanicalHeroText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  botanicalPanel: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  botanicalPanelHeader: {
    marginBottom: 14,
  },
  botanicalPanelTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  botanicalPanelText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  taxonomyGrid: {
    gap: 12,
  },
  taxonomyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#F8FCFA',
  },
  taxonomyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  taxonomyLevel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: '#62736C',
    marginBottom: 4,
  },
  taxonomyValue: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  taxonomyText: {
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '500',
  },
  botanicalTraitsGrid: {
    gap: 12,
  },
  botanicalTraitCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  botanicalTraitIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  botanicalTraitTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  botanicalTraitText: {
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '500',
  },
  morphologyGrid: {
    gap: 12,
    marginTop: 14,
  },
  morphologyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  morphologyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  morphologyTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  morphologyText: {
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '500',
  },
  growthStageList: {
    gap: 12,
    marginTop: 14,
  },
  growthStageCard: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    overflow: 'hidden',
  },
  growthStageRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  growthStageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  growthStageNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  growthStageNumberText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  growthStageBody: {
    flex: 1,
  },
  growthStageTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  growthStageIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  growthStageTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  growthStageDuration: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  growthStageDurationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  growthStageText: {
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '500',
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
    backgroundColor: '#2BB673',
    marginBottom: 6,
  },
  timelineLabel: {
    fontSize: 12,
    color: '#0E3B2E',
    fontWeight: '600',
  },
  progressWrap: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#F3F7F4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE7E1',
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
    color: '#0E3B2E',
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2BB673',
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
    backgroundColor: '#2BB673',
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
    borderWidth: 1,
    borderColor: '#DDE7E1',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    borderColor: '#2BB673',
    backgroundColor: '#E1F4EA',
  },
  chipText: {
    fontSize: 12,
    color: '#62736C',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#2BB673',
  },
  issueCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
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
    borderColor: '#DDE7E1',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  issueBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0E3B2E',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  diseaseHeroCard: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    backgroundColor: '#F9FCFA',
  },
  diseaseHeroGlow: {
    position: 'absolute',
    top: -30,
    right: -10,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6F6ED',
  },
  diseaseHeroEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    color: '#2BB673',
    marginBottom: 8,
  },
  diseaseHeroTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    maxWidth: '88%',
  },
  diseaseHeroText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    marginTop: 8,
    maxWidth: '92%',
  },
  diseaseHeroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  diseaseHeroChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE7E1',
  },
  diseaseHeroChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0E3B2E',
  },
  diseaseFocusGrid: {
    gap: 12,
    marginBottom: 16,
  },
  diseaseFocusCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  diseaseFocusIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  diseaseFocusTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  diseaseFocusText: {
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '500',
  },
  diseaseCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  diseaseIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  diseaseHeaderBody: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    paddingRight: 6,
  },
  diseaseMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  diseaseIcon: {
    fontSize: 28,
  },
  diseaseTypePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  diseaseSeverityPill: {
    color: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  diseaseTextBlock: {
    minWidth: 0,
    flexShrink: 1,
    alignSelf: 'stretch',
    marginTop: 2,
  },
  diseaseTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 20,
    flexShrink: 1,
    maxWidth: '100%',
  },
  diseaseDesc: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'left',
    flexShrink: 1,
    maxWidth: '100%',
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
  diseaseSymptomsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
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
  diseaseCareGrid: {
    gap: 10,
  },
  diseaseCareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  diseaseCareIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preventionBox: {
    backgroundColor: '#E1F4EA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DDE7E1',
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFBEB',
    borderColor: '#F2E4BF',
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
  cultivationShowcase: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    backgroundColor: '#F8FCFA',
  },
  cultivationShowcaseGlow: {
    position: 'absolute',
    top: -28,
    right: -8,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DDF5E7',
  },
  cultivationShowcaseEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#2BB673',
    marginBottom: 8,
  },
  cultivationShowcaseTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    maxWidth: '86%',
  },
  cultivationShowcaseText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: '92%',
  },
  cultivationShowcaseChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  cultivationShowcaseChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE7E1',
  },
  cultivationShowcaseChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0E3B2E',
  },
  cultivationHighlightsGrid: {
    gap: 12,
    marginBottom: 16,
    marginTop: 12,
  },
  cultivationHighlightsToggle: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cultivationStagesToggle: {
    marginTop: 6,
  },
  cultivationHighlightsToggleLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0E3B2E',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  cultivationHighlightsToggleText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  cultivationHighlightsToggleChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cultivationHighlightCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#0E3B2E',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  cultivationHighlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cultivationHighlightIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cultivationHighlightTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  cultivationHighlightBody: {
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '500',
  },
  cultivationTimeline: {
    gap: 16,
    marginTop: 14,
    paddingBottom: 6,
  },
  cultivationCard: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    overflow: 'hidden',
  },
  cultivationCardExpanded: {
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  cultivationAccentRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cultivationConnector: {
    position: 'absolute',
    left: 30,
    top: 76,
    bottom: -22,
    width: 2,
    backgroundColor: '#DCE9E2',
  },
  cultivationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cultivationStepNumberBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cultivationStepNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cultivationHeaderBody: {
    flex: 1,
  },
  cultivationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  cultivationStagePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  cultivationStagePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cultivationMetaHint: {
    fontSize: 11,
    fontWeight: '600',
  },
  cultivationTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cultivationIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cultivationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
  },
  cultivationFactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  cultivationFactChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  cultivationFactText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cultivationChevronWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  cultivationExpanded: {
    marginTop: 14,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderRadius: 16,
  },
  cultivationExpandedLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cultivationExpandedLabelSpacing: {
    marginTop: 14,
  },
  cultivationExpandedText: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'justify',
    fontWeight: '500',
  },
  cultivationDetailList: {
    gap: 10,
  },
  cultivationDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cultivationDetailDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginTop: 7,
  },
  cultivationDetailText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '500',
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  stepNumberBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2BB673',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 2,
    shadowColor: '#2BB673',
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
    borderTopColor: '#DDE7E1',
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
    textAlign: 'justify',
  },
  newsImage: {
    width: '100%',
    height: 170,
    borderRadius: 12,
    marginBottom: 12,
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
    backgroundColor: 'rgba(43,182,115,0.35)',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2BB673',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#2BB673',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  // Carousel Styles
  carouselContainer: {
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    marginVertical: 18,
    borderWidth: 1,
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
    textAlign: 'justify',
  },
  guideCardsContainer: {
    gap: 12,
  },
  guideCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDE7E1',
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
    textAlign: 'justify',
  },
});



