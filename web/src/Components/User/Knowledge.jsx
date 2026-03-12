import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdAccountTree,
  MdArrowUpward,
  MdBiotech,
  MdBlock,
  MdCleaningServices,
  MdCloud,
  MdContentCut,
  MdCoronavirus,
  MdEco,
  MdError,
  MdFavorite,
  MdForest,
  MdLocalFireDepartment,
  MdLocalFlorist,
  MdPark,
  MdPieChart,
  MdPlace,
  MdPublic,
  MdScience,
  MdShoppingBasket,
  MdShowChart,
  MdSpa,
  MdStar,
  MdTerrain,
  MdVerifiedUser,
  MdWaterDrop,
  MdWaves,
  MdWbSunny,
} from 'react-icons/md';
import './Knowledge.css';
import Header from '../shared/Header';
import Footer from '../shared/Footer';

import bpImage1 from '../../../picsbl/11.png';
import bpImage2 from '../../../picsbl/12.png';
import bpImage3 from '../../../picsbl/13.png';
import botanicalImage1 from '../../../picsbl/index1.jpg';
import botanicalImage2 from '../../../picsbl/index2.png';
import botanicalImage3 from '../../../picsbl/index3.png';
import diseaseImage1 from '../../../picsbl/14.jpg';
import diseaseImage2 from '../../../picsbl/15.jpg';
import diseaseImage3 from '../../../picsbl/16.jpg';
import diseaseImage4 from '../../../picsbl/17.jpg';
import diseaseImage5 from '../../../picsbl/18.jpg';
import benefitsImage1 from '../../../picsbl/19.jpg';
import benefitsImage2 from '../../../picsbl/20.jpg';
import benefitsImage3 from '../../../picsbl/21.jpg';

const bpImages = [bpImage1, bpImage2, bpImage3];
const botanicalImages = [botanicalImage1, botanicalImage2, botanicalImage3];
const diseaseImages = [diseaseImage1, diseaseImage2, diseaseImage3, diseaseImage4, diseaseImage5];
const benefitsImages = [benefitsImage1, benefitsImage2, benefitsImage3];

const cultivationSteps = [
  {
    step: 1,
    key: 'propagation',
    icon: 'content-cut',
    accent: '#1F8A70',
    tone: '#EAF7F1',
    title: 'Propagation: Stem Cutting and Rooting',
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
    title: 'Field Setup, Supports and Planting',
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
    title: 'Vegetative Growth and Maintenance',
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
    title: 'Bearing Stage and Crop Development',
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
    title: 'Harvesting and Post-Harvest Processing',
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
    title: 'Climate and Soil',
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

const botanicalQuickTags = ['Piper nigrum', 'Piperaceae family', 'Tropical woody vine'];

const growthStages = [
  {
    stage: 1,
    title: 'Propagation and Nursery',
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

const botanicalStats = [
  { label: 'Taxonomy levels', value: classificationLevels.length },
  { label: 'Key traits', value: botanicalCharacteristics.length },
  { label: 'Growth stages', value: growthStages.length },
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
    severity: 'critical',
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

const benefitImagesByTab = {
  nutrition: benefitsImages[0],
  digestive: benefitsImages[1],
  antiInflammatory: benefitsImages[2],
};

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
    title: 'Temperature and Climate',
    heading: 'Preferred: 25-35 C',
    highlights: ['Works best in tropical heat', 'Humidity target: 60-80%', 'Protect vines below 10 C'],
    details: 'Black pepper thrives in a warm, moist tropical climate and performs best between 25 C and 35 C. It remains workable in a broader 20 C to 35 C range, but temperatures below 10 C can damage the plant. Partial shade is preferred over harsh all-day sun, especially in exposed sites.',
    bgColor: '#FFF3E0',
    accent: '#EF6C00',
  },
  {
    icon: 'weather-rainy',
    title: 'Rainfall and Irrigation',
    heading: '1750-3000 mm/year',
    highlights: ['High, consistent rainfall', 'Rainy season is best for planting', 'Long dry spells need irrigation'],
    details: 'Black pepper needs strong and steady moisture through the year. The rainy season is the best time for establishment because young vines root faster in moist soil. A short clear dry period can help flower induction, but prolonged dry weather should be backed by irrigation to avoid water stress.',
    bgColor: '#E3F2FD',
    accent: '#1565C0',
  },
  {
    icon: 'shovel',
    title: 'Moisture and Soil Care',
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

const overviewImageCards = [
  {
    image: bpImages[0],
    title: 'Key Environmental Factors',
    accent: '#7A5C1E',
    items: [
      'Altitude: productive from sea level up to 1,500 m, with strongest yield potential usually below 350 m.',
      'Wind: vines should be protected from strong winds to prevent mechanical damage and moisture loss.',
      'Ideal site character: warm, humid, tropical, and commonly associated with shaded or forest-like conditions.',
      'Field planning should combine climate fit, support trees or posts, and good airflow around the crop.',
    ],
  },
  {
    image: bpImages[1],
    title: 'Growing Season and Moisture',
    accent: '#2D6A57',
    items: [
      'Best planting window: rainy season, when soil moisture helps young vines establish quickly.',
      'A short clear dry spell can help flower induction, but long dry periods need irrigation support.',
      'Soil should stay consistently moist but must remain well-drained to avoid root rot.',
      'Mulch, shade regulation, and drainage management are as important as rainfall itself.',
    ],
  },
  {
    image: bpImages[2],
    title: 'Preferred Weather Conditions',
    accent: '#1F8A70',
    items: [
      'Temperature: best at 25 C to 35 C, with a wider workable range of 20 C to 35 C.',
      'Rainfall: strong, consistent moisture is preferred, roughly 1,750 mm to 3,000 mm annually.',
      'Humidity: healthy vine growth depends on high relative humidity around 60% to 80%.',
      'Sunlight: black pepper performs better under partial shade than under harsh all-day sun.',
    ],
  },
];

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'botanical', label: 'Botanical' },
  { id: 'diseases', label: 'Disease Management' },
  { id: 'benefits', label: 'Health Benefits' },
  { id: 'cultivation', label: 'Cultivation' },
  { id: 'news', label: 'News and Resources' },
];

const iconMap = {
  'weather-partly-rainy': MdCloud,
  'weather-sunny': MdWbSunny,
  'weather-rainy': MdWaterDrop,
  sprout: MdEco,
  'sprout-outline': MdEco,
  terrain: MdTerrain,
  'content-cut': MdContentCut,
  leaf: MdSpa,
  'leaf-maple': MdSpa,
  'flower-pollen': MdLocalFlorist,
  'basket-fill': MdShoppingBasket,
  'pine-tree': MdPark,
  sitemap: MdAccountTree,
  'waves-arrow-up': MdWaves,
  'flower-outline': MdLocalFlorist,
  'forest-outline': MdForest,
  molecule: MdScience,
  'graph-outline': MdShowChart,
  'star-four-points-outline': MdStar,
  'circle-slice-8': MdPieChart,
  'arrow-up-bold-circle-outline': MdArrowUpward,
  'map-marker-radius-outline': MdPlace,
  earth: MdPublic,
  'source-branch': MdAccountTree,
  'fruit-cherries': MdLocalFlorist,
  shovel: MdSpa,
  'seed-outline': MdEco,
  'fruit-grapes': MdLocalFlorist,
  microscope: MdBiotech,
  'water-alert': MdWaterDrop,
  'spray-bottle': MdCleaningServices,
  'alert-octagon': MdError,
  'leaf-off': MdBlock,
  'chart-line': MdShowChart,
  virus: MdCoronavirus,
  'heart-pulse': MdFavorite,
  fire: MdLocalFireDepartment,
  'shield-check': MdVerifiedUser,
};

const getIcon = (name) => iconMap[name] || MdEco;

function IconBadge({ name, className, color }) {
  const IconComponent = getIcon(name);
  return <IconComponent className={className} style={{ color }} aria-hidden="true" />;
}

export default function Knowledge() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentBotanicalSlide, setCurrentBotanicalSlide] = useState(0);
  const [currentDiseaseSlide, setCurrentDiseaseSlide] = useState(0);
  const [botanicalActive, setBotanicalActive] = useState('classification');
  const [benefitsTab, setBenefitsTab] = useState('nutrition');
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    fetchLatestNews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bpImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBotanicalSlide((prev) => (prev + 1) % botanicalImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDiseaseSlide((prev) => (prev + 1) % diseaseImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getDefaultNews = () => [
    {
      id: 1,
      title: 'Global Black Pepper Market Growth Trends 2024',
      date: 'January 2024',
      description: 'The global black pepper market is expected to grow at a CAGR of 5.2% from 2024 to 2030, driven by increasing demand for spices in food processing and medicinal applications.',
      link: 'https://example.com/pepper-market-trends',
      source: 'Agricultural News',
    },
    {
      id: 2,
      title: 'Precision Agriculture in Pepper Farming',
      date: 'February 2024',
      description: 'AI-driven disease detection and soil analysis tools are helping pepper farmers improve yields and reduce losses.',
      link: 'https://example.com/precision-agriculture-pepper',
      source: 'Farm Tech Daily',
    },
    {
      id: 3,
      title: 'Sustainable Pepper Cultivation Practices',
      date: 'March 2024',
      description: 'New guidelines focus on water management, organic fertilization, and biodiversity preservation in pepper farms.',
      link: 'https://example.com/sustainable-pepper',
      source: 'Eco Agriculture',
    },
  ];

  const fetchLatestNews = async () => {
    setLoadingNews(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/news/latest', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setNews(data.news || getDefaultNews());
      } else {
        setNews(getDefaultNews());
      }
    } catch (error) {
      setNews(getDefaultNews());
    } finally {
      setLoadingNews(false);
    }
  };

  const filteredNews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return news;
    return news.filter((item) => {
      const title = (item.title || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const source = (item.source || '').toLowerCase();
      return title.includes(query) || desc.includes(query) || source.includes(query);
    });
  }, [news, searchQuery]);

  const activeBotanicalMeta = botanicalTabs.find((tab) => tab.id === botanicalActive) || botanicalTabs[0];

  return (
    <>
      <Header />
      <div className="knowledge-page">
        <section className="knowledge-hero">
          <div className="knowledge-hero-glow" />
          <div className="knowledge-hero-ring" />
          <div className="knowledge-hero-card">
            <span className="hero-eyebrow">Learning Hub</span>
            <h1 className="hero-title">Piper Knowledge</h1>
            <p className="hero-subtitle">
              Your comprehensive guide to black pepper cultivation and management.
            </p>
            <div className="hero-pills">
              {['Botanical', 'Disease Care', 'Benefits'].map((item) => (
                <span key={item} className="hero-pill">{item}</span>
              ))}
            </div>
          </div>
        </section>

        <div className="knowledge-tabs">
          <div className="knowledge-tabs-inner">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`knowledge-tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="knowledge-content">
          {activeTab === 'overview' && (
            <div className="overview-wrapper">
              <section className="knowledge-section overview-section">
                <h2 className="section-title">What is Black Pepper?</h2>

                <div className="overview-split">
                <div className="overview-right">
                  <div className="overview-image-grid">
                    {overviewImageCards.map((card, index) => (
                      <div
                        key={card.title}
                        className={`overview-image-card ${index % 2 === 1 ? 'reverse' : ''}`}
                      >
                        <div className="overview-image-media">
                          <img src={card.image} alt={card.title} />
                        </div>
                        <div className="overview-image-content">
                          <h4>{card.title}</h4>
                          <span className="overview-image-kicker">Field reference</span>
                          <div className="overview-list overview-image-list">
                            {card.items.map((item) => (
                              <div key={item} className="overview-item">
                                <span className="overview-dot" style={{ backgroundColor: card.accent }} />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="overview-left">
                  <div className="guide-section">
                    <h3 className="section-subtitle">Black Pepper Guide</h3>
                    <p className="section-helper">Understand your crop's needs</p>

                    <div className="guide-cards">
                      {pepperGuide.map((guide, index) => (
                        <button
                          key={guide.title}
                          type="button"
                          className={`guide-card ${expandedGuide[index] ? 'expanded' : ''} ${index === pepperGuide.length - 1 ? 'center-card' : ''}`}
                          style={{ backgroundColor: guide.bgColor, borderColor: guide.accent }}
                          onClick={() => setExpandedGuide((prev) => ({ ...prev, [index]: !prev[index] }))}
                          aria-expanded={expandedGuide[index]}
                        >
                          <div className="guide-card-header">
                            <span className="guide-icon" style={{ color: guide.accent }}>
                              <IconBadge name={guide.icon} />
                            </span>
                            <div className="guide-title">
                              <h4 style={{ color: guide.accent }}>{guide.title}</h4>
                              <span>{guide.heading}</span>
                            </div>
                            <span className="guide-toggle">{expandedGuide[index] ? 'v' : '>'}</span>
                          </div>
                          <div className="guide-highlights">
                            {guide.highlights.map((item) => (
                              <span key={item} className="guide-highlight" style={{ color: guide.accent }}>
                                - {item}
                              </span>
                            ))}
                          </div>
                          {expandedGuide[index] && (
                            <div className="guide-details">
                              <p>{guide.details}</p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              </section>
            </div>
          )}

          {activeTab === 'botanical' && (
            <section className="knowledge-section">
              <div className="subtabs">
                {botanicalTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`subtab-button ${botanicalActive === tab.id ? 'active' : ''}`}
                    style={
                      botanicalActive === tab.id
                        ? { borderColor: tab.accent, backgroundColor: tab.tone, color: tab.accent }
                        : undefined
                    }
                    onClick={() => setBotanicalActive(tab.id)}
                  >
                    <span
                      className="subtab-icon"
                      style={{
                        backgroundColor: botanicalActive === tab.id ? tab.accent : '#F3F7F4',
                        color: botanicalActive === tab.id ? '#FFFFFF' : tab.accent,
                      }}
                    >
                      <IconBadge name={tab.icon} />
                    </span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="botanical-header">
                <div className="botanical-carousel">
                  <div className="carousel">
                    <img
                      src={botanicalImages[currentBotanicalSlide]}
                      alt="Botanical view"
                      className="carousel-image"
                    />
                    <div className="carousel-overlay" />
                    <div className="carousel-indicators">
                      {botanicalImages.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`carousel-indicator ${currentBotanicalSlide === index ? 'active' : ''}`}
                          onClick={() => setCurrentBotanicalSlide(index)}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="botanical-hero"
                  style={{ backgroundColor: activeBotanicalMeta.tone, borderColor: 'var(--knowledge-border)' }}
                >
                  <div className="botanical-hero-header">
                    <span className="botanical-hero-icon" style={{ color: activeBotanicalMeta.accent }}>
                      <IconBadge name={activeBotanicalMeta.icon} />
                    </span>
                    <div>
                      <span className="botanical-hero-eyebrow" style={{ color: activeBotanicalMeta.accent }}>
                        Botanical focus
                      </span>
                      <h3>{activeBotanicalMeta.title}</h3>
                    </div>
                  </div>
                  <p>{activeBotanicalMeta.description}</p>
                  <div className="botanical-tags">
                    {botanicalQuickTags.map((tag) => (
                      <span key={tag} className="botanical-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="botanical-stats">
                    {botanicalStats.map((stat) => (
                      <div key={stat.label} className="botanical-stat">
                        <span className="stat-value" style={{ color: activeBotanicalMeta.accent }}>
                          {stat.value}
                        </span>
                        <span className="stat-label">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {botanicalActive === 'classification' && (
                <div className="botanical-panel">
                  <div className="panel-header">
                    <h3>Scientific Classification</h3>
                    <p>
                      The taxonomy ladder places black pepper clearly within the pepper family and the Piper genus.
                    </p>
                  </div>
                  <div className="taxonomy-grid">
                    {classificationLevels.map((item) => (
                      <div
                        key={item.level}
                        className="taxonomy-card"
                        style={{ '--accent': activeBotanicalMeta.accent }}
                      >
                        <span className="taxonomy-icon">
                          <IconBadge name={item.icon} />
                        </span>
                        <span className="taxonomy-level">{item.level}</span>
                        <strong>{item.value}</strong>
                        <p>{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="botanical-panel secondary">
                    <div className="panel-header">
                      <h3>Key Characteristics</h3>
                    </div>
                    <div className="traits-grid">
                      {botanicalCharacteristics.map((item) => (
                        <div
                          key={item.title}
                          className="trait-card"
                          style={{
                            borderColor: 'var(--knowledge-border)',
                            '--accent': item.accent,
                          }}
                        >
                          <span className="trait-icon" style={{ color: item.accent, backgroundColor: `${item.accent}1A` }}>
                            <IconBadge name={item.icon} />
                          </span>
                          <h4>{item.title}</h4>
                          <p>{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {botanicalActive === 'morphology' && (
                <div className="botanical-panel morphology-panel">
                  <p>
                    Black pepper is a tropical woody climber with distinct climbing stems, fruiting branches, glossy leaves,
                    hanging floral spikes, and small berries that mature from green to red.
                  </p>
                  <div className="morphology-grid">
                    {morphologyParts.map((item) => (
                      <div
                        key={item.part}
                        className="morphology-card"
                        style={{
                          borderColor: 'var(--knowledge-border)',
                          '--accent': item.accent,
                        }}
                      >
                        <span className="morphology-icon" style={{ color: item.accent, backgroundColor: `${item.accent}1A` }}>
                          <IconBadge name={item.icon} />
                        </span>
                        <h4>{item.part}</h4>
                        <p>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {botanicalActive === 'growth' && (
                <div className="botanical-panel growth-panel">
                  <p>
                    Black pepper usually reaches strong production after several years, moving from nursery establishment
                    through canopy growth, flowering, fruit filling, and harvest.
                  </p>
                  <div className="growth-stage-list">
                    {growthStages.map((item) => (
                      <div key={item.stage} className="growth-stage-card">
                        <div className="growth-stage-rail" style={{ backgroundColor: item.accent }} />
                        <div className="growth-stage-header">
                          <span className="growth-stage-number" style={{ backgroundColor: item.accent }}>
                            {item.stage}
                          </span>
                          <div>
                            <div className="growth-stage-title">
                              <span className="growth-stage-icon" style={{ color: item.accent }}>
                                <IconBadge name={item.icon} />
                              </span>
                              <strong>{item.title}</strong>
                            </div>
                            <span className="growth-stage-duration" style={{ backgroundColor: item.accent }}>
                              {item.duration}
                            </span>
                          </div>
                        </div>
                        <p>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'diseases' && (
            <section className="knowledge-section">
              <div className="disease-hero">
                <span className="disease-hero-eyebrow">Disease management</span>
                <h3>Focus on early detection, cleaner fields, and fast response</h3>
                <p>
                  The biggest pepper losses usually come from fungal pressure, poor drainage, and delayed response to viral
                  spread.
                </p>
                <div className="disease-hero-chips">
                  <span>5 key threats</span>
                  <span>Fungal and viral</span>
                  <span>Scout early</span>
                </div>
              </div>

              <div className="disease-focus-grid">
                {diseaseFocusCards.map((item) => (
                  <div
                    key={item.key}
                    className="disease-focus-card"
                    style={{ backgroundColor: item.tone, borderColor: 'var(--knowledge-border)' }}
                  >
                    <span className="disease-focus-icon" style={{ color: item.accent, backgroundColor: `${item.accent}1A` }}>
                      <IconBadge name={item.icon} />
                    </span>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="disease-issues">
                {diseaseIssues.map((issue, index) => (
                  <div
                    key={issue.title}
                    className="disease-card"
                    style={{ borderLeftColor: issue.accent }}
                  >
                    <div className="disease-card-main">
                      <div className="disease-card-content">
                        <div className="disease-card-header">
                          <span className="disease-card-icon" style={{ color: issue.accent, backgroundColor: issue.tone }}>
                            <IconBadge name={issue.icon} />
                          </span>
                          <div>
                            <div className="disease-card-meta">
                              <span className="pill" style={{ color: issue.accent, backgroundColor: issue.tone }}>
                                {issue.type}
                              </span>
                              <span className="pill pill-strong" style={{ backgroundColor: issue.accent }}>
                                {issue.severity.toUpperCase()}
                              </span>
                            </div>
                            <h4>{issue.title}</h4>
                            <p>{issue.desc}</p>
                          </div>
                        </div>
                        <div className="disease-symptoms">
                          <span className="symptoms-label">Common Symptoms</span>
                          <div className="symptom-tags">
                            {issue.symptoms.map((sym) => (
                              <span key={sym} className="symptom-tag">{sym}</span>
                            ))}
                          </div>
                        </div>
                        <div className="disease-care">
                          <div className="care-box">
                            <span className="care-title">Prevention</span>
                            <p>{issue.prevention}</p>
                          </div>
                          <div className="care-box warning">
                            <span className="care-title">Treatment</span>
                            <p>{issue.treatment}</p>
                          </div>
                        </div>
                      </div>
                      <div className="disease-card-media">
                        <img
                          src={diseaseImages[index % diseaseImages.length]}
                          alt={`${issue.title} sample`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'benefits' && (
            <section className="knowledge-section">
              <div className="subtabs">
                {benefitTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`subtab-button ${benefitsTab === tab.id ? 'active' : ''}`}
                    style={
                      benefitsTab === tab.id
                        ? { borderColor: tab.accent, backgroundColor: tab.tone, color: tab.accent }
                        : undefined
                    }
                    onClick={() => setBenefitsTab(tab.id)}
                  >
                    <span
                      className="subtab-icon"
                      style={{
                        backgroundColor: benefitsTab === tab.id ? tab.accent : '#F3F7F4',
                        color: benefitsTab === tab.id ? '#FFFFFF' : tab.accent,
                      }}
                    >
                      <IconBadge name={tab.icon} />
                    </span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {benefitsTab === 'nutrition' && (
                <div className="benefit-split image-right">
                  <div className="benefit-detail-column">
                    <div className="benefit-layout">
                      <div className="benefit-column">
                        <div className="benefit-card benefit-hero" style={{ borderLeftColor: '#1F8A70', backgroundColor: '#E1F4EA' }}>
                          <div className="benefit-header">
                            <span className="benefit-icon" style={{ backgroundColor: '#1F8A70' }}>
                              <IconBadge name="heart-pulse" />
                            </span>
                            <div>
                              <h4>Antioxidant Power</h4>
                              <span>Neutralizes free radicals</span>
                            </div>
                          </div>
                          <p>
                            Black pepper is rich in piperine (5-10% by weight), a polyphenol with strong antioxidant power.
                            Piperine neutralizes harmful free radicals and reactive oxygen species that damage cells and
                            accelerate aging. Research shows it enhances curcumin absorption by 2000%.
                          </p>
                        </div>
                        <div className="benefit-mini-grid">
                          <div className="benefit-mini-card" style={{ borderColor: '#1F8A70', backgroundColor: '#E1F4EA' }}>
                            <span className="benefit-mini-label">ORAC score</span>
                            <strong>27,618 umol/100g</strong>
                          </div>
                          <div className="benefit-mini-card" style={{ borderColor: '#1F8A70', backgroundColor: '#E1F4EA' }}>
                            <span className="benefit-mini-label">Potency</span>
                            <strong>Stronger than blueberries</strong>
                          </div>
                        </div>
                      </div>
                      <div className="benefit-column">
                        <div className="benefit-mini-card benefit-mini-wide" style={{ borderColor: '#1F8A70', backgroundColor: '#E1F4EA' }}>
                          <div className="benefit-mini-row">
                            <span className="benefit-mini-dot" style={{ backgroundColor: '#1F8A70' }} />
                            <div>
                              <span className="benefit-mini-label">Antioxidant focus</span>
                              <strong>Piperine + polyphenols</strong>
                            </div>
                          </div>
                        </div>
                        <div className="benefit-list benefit-detail">
                          <h5>Key Compounds</h5>
                          <div className="benefit-list-item">
                            <strong>Piperine</strong>
                            <span>Primary active alkaloid with strong antioxidant activity</span>
                          </div>
                          <div className="benefit-list-item">
                            <strong>Volatile Oils</strong>
                            <span>Pinene, limonene, and myrcene provide aromatics and antioxidants</span>
                          </div>
                          <div className="benefit-list-item">
                            <strong>Phenolic Compounds</strong>
                            <span>Support cellular protection against oxidative stress</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="benefit-image-column">
                    <img src={benefitImagesByTab.nutrition} alt="Antioxidant benefits" />
                  </div>
                </div>
              )}

              {benefitsTab === 'digestive' && (
                <div className="benefit-split image-left">
                  <div className="benefit-image-column">
                    <img src={benefitImagesByTab.digestive} alt="Digestive support benefits" />
                  </div>
                  <div className="benefit-detail-column">
                    <div className="benefit-layout">
                      <div className="benefit-column">
                        <div className="benefit-card benefit-hero" style={{ borderLeftColor: '#F59E0B', backgroundColor: '#FFFBEB' }}>
                          <div className="benefit-header">
                            <span className="benefit-icon" style={{ backgroundColor: '#F59E0B' }}>
                              <IconBadge name="fire" />
                            </span>
                            <div>
                              <h4>Digestive Fire</h4>
                              <span>Boost metabolism and absorption</span>
                            </div>
                          </div>
                          <p>
                            Black pepper ignites your digestive fire. Piperine stimulates saliva and gastric juice secretion,
                            preparing your body to break down and absorb nutrients efficiently. It increases intestinal
                            permeability, allowing your body to absorb more nutrients.
                          </p>
                        </div>
                        <div className="benefit-mini-grid">
                          <div className="benefit-mini-card" style={{ borderColor: '#F59E0B', backgroundColor: '#FFFBEB' }}>
                            <span className="benefit-mini-label">Absorption</span>
                            <strong>Higher nutrient bioavailability</strong>
                          </div>
                          <div className="benefit-mini-card" style={{ borderColor: '#F59E0B', backgroundColor: '#FFFBEB' }}>
                            <span className="benefit-mini-label">Metabolism</span>
                            <strong>Thermogenesis support</strong>
                          </div>
                        </div>
                      </div>
                      <div className="benefit-column">
                        <div className="benefit-mini-card benefit-mini-wide" style={{ borderColor: '#F59E0B', backgroundColor: '#FFFBEB' }}>
                          <div className="benefit-mini-row">
                            <span className="benefit-mini-dot" style={{ backgroundColor: '#F59E0B' }} />
                            <div>
                              <span className="benefit-mini-label">Digestive support</span>
                              <strong>Stimulates saliva + gastric juices</strong>
                            </div>
                          </div>
                        </div>
                        <div className="benefit-list benefit-detail">
                          <h5>Key Benefits</h5>
                          <div className="benefit-list-item">
                            <strong>Enhanced absorption</strong>
                            <span>Increases nutrient bioavailability</span>
                          </div>
                          <div className="benefit-list-item">
                            <strong>Metabolic boost</strong>
                            <span>Supports thermogenesis and energy use</span>
                          </div>
                          <div className="benefit-list-item">
                            <strong>Gut health</strong>
                            <span>Promotes beneficial gut bacteria and healthy microbiome</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {benefitsTab === 'antiInflammatory' && (
                <div className="benefit-split image-right">
                  <div className="benefit-detail-column">
                    <div className="benefit-layout">
                      <div className="benefit-column">
                        <div className="benefit-card benefit-hero" style={{ borderLeftColor: '#EF4444', backgroundColor: '#FEE2E2' }}>
                          <div className="benefit-header">
                            <span className="benefit-icon" style={{ backgroundColor: '#EF4444' }}>
                              <IconBadge name="shield-check" />
                            </span>
                            <div>
                              <h4>Anti-Inflammatory</h4>
                              <span>Combat chronic inflammation</span>
                            </div>
                          </div>
                          <p>
                            Piperine is a potent NF-kB inhibitor, blocking the master switch that activates chronic
                            inflammation. It reduces pro-inflammatory cytokines (TNF-a, IL-6, IL-8) and offers relief without
                            the side effects common to some medications.
                          </p>
                        </div>
                        <div className="benefit-mini-grid">
                          <div className="benefit-mini-card" style={{ borderColor: '#EF4444', backgroundColor: '#FEE2E2' }}>
                            <span className="benefit-mini-label">NF-kB inhibition</span>
                            <strong>Blocks inflammatory signaling</strong>
                          </div>
                          <div className="benefit-mini-card" style={{ borderColor: '#EF4444', backgroundColor: '#FEE2E2' }}>
                            <span className="benefit-mini-label">Cytokine control</span>
                            <strong>Reduces TNF-a, IL-6, IL-8</strong>
                          </div>
                        </div>
                      </div>
                      <div className="benefit-column">
                        <div className="benefit-mini-card benefit-mini-wide" style={{ borderColor: '#EF4444', backgroundColor: '#FEE2E2' }}>
                          <div className="benefit-mini-row">
                            <span className="benefit-mini-dot" style={{ backgroundColor: '#EF4444' }} />
                            <div>
                              <span className="benefit-mini-label">Turmeric synergy</span>
                              <strong>Boosts curcumin absorption</strong>
                            </div>
                          </div>
                        </div>
                        <div className="benefit-list benefit-detail">
                          <h5>Inflammation-Fighting Mechanisms</h5>
                          <div className="benefit-list-item">
                            <strong>NF-kB inhibition</strong>
                            <span>Blocks the cytokine cascade that fuels inflammation</span>
                          </div>
                          <div className="benefit-list-item">
                            <strong>Cytokine reduction</strong>
                            <span>Helps reduce TNF-a, IL-6, and IL-8 levels</span>
                          </div>
                          <div className="benefit-list-item">
                            <strong>Turmeric synergy</strong>
                            <span>Boosts curcumin absorption for stronger anti-inflammatory results</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="benefit-image-column">
                    <img src={benefitImagesByTab.antiInflammatory} alt="Anti-inflammatory benefits" />
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'cultivation' && (
            <section className="knowledge-section">
              <div className="section-header">
                <h2 className="section-title">Cultivation Steps</h2>
              </div>

              <div className="cultivation-showcase">
                <span className="cultivation-eyebrow">Field roadmap</span>
                <h3>Black pepper cultivation from nursery cuttings to dried peppercorns</h3>
                <p>
                  This tab covers climate fit, support-tree setup, spacing, field care, and the harvest flow used for
                  black pepper production.
                </p>
                <div className="cultivation-chips">
                  <span>100-250 cm rainfall</span>
                  <span>Below 350 m best</span>
                  <span>3-4 years to bear</span>
                </div>
              </div>

              <div className="cultivation-highlights">
                {cultivationHighlights.map((item) => (
                  <div
                    key={item.key}
                    className="cultivation-highlight-card"
                    style={{ backgroundColor: item.tone, borderColor: 'var(--knowledge-border)' }}
                  >
                    <span className="cultivation-highlight-icon" style={{ color: item.accent, backgroundColor: `${item.accent}1A` }}>
                      <IconBadge name={item.icon} />
                    </span>
                    <h4>{item.title}</h4>
                    <p>{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="cultivation-timeline">
                {cultivationSteps.map((item, index) => (
                  <div
                    key={item.key}
                    className="cultivation-card"
                    style={{ borderColor: item.accent }}
                  >
                    <div className="cultivation-rail" style={{ backgroundColor: item.accent }} />
                    {index < cultivationSteps.length - 1 && <div className="cultivation-connector" />}
                    <div className="cultivation-card-header">
                      <span className="cultivation-step" style={{ backgroundColor: item.accent }}>
                        {item.step}
                      </span>
                      <div className="cultivation-card-body">
                        <div className="cultivation-meta">
                          <span className="pill" style={{ color: item.accent, backgroundColor: item.tone }}>
                            Stage {String(item.step).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="cultivation-title-row">
                          <span className="cultivation-icon" style={{ color: item.accent, backgroundColor: item.tone }}>
                            <IconBadge name={item.icon} />
                          </span>
                          <h4>{item.title}</h4>
                        </div>
                        <div className="cultivation-facts">
                          {item.quickFacts.map((fact) => (
                            <span key={fact} className="fact" style={{ color: item.accent, backgroundColor: item.tone }}>
                              {fact}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="cultivation-expanded">
                      <strong>Overview</strong>
                      <p>{item.content}</p>
                      <strong>Key Points</strong>
                      <div className="cultivation-details">
                        {item.details.map((detail) => (
                          <div key={detail} className="cultivation-detail">
                            <span className="detail-dot" style={{ backgroundColor: item.accent }} />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'news' && (
            <section className="knowledge-section">
              <h2 className="section-title">Latest News and Resources</h2>

              <div className="news-search">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              {loadingNews ? (
                <div className="news-skeleton">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="skeleton-card" />
                  ))}
                </div>
              ) : (
                <div className="news-grid">
                  {filteredNews.map((item, index) => (
                    <a
                      key={item.id || index}
                      href={item.link || '#'}
                      className="news-card"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.image && <img src={item.image} alt={item.title} className="news-image" />}
                      <div>
                        <h3>{item.title}</h3>
                        <span className="news-meta">{item.source} - {item.date}</span>
                        <p>{item.description}</p>
                        <span className="news-link">Read Full Article</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <div className={`knowledge-fab ${fabOpen ? 'open' : ''}`}>
          <button
            type="button"
            className="fab-button"
            onClick={() => setFabOpen((prev) => !prev)}
            aria-expanded={fabOpen}
            aria-label="AI Plant Scanner"
          >
            AI
          </button>
          <div className="fab-menu">
            <Link to="/leaf-analysis" onClick={() => setFabOpen(false)}>
              Leaf Analysis - Detect diseases
            </Link>
            <Link to="/bunga-analysis" onClick={() => setFabOpen(false)}>
              Bunga Analysis - Check ripeness
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
