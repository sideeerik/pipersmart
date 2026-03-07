import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Knowledge.css';
import Header from '../shared/Header';
import Footer from '../shared/Footer';

// Image imports from web/picsbl
import bpImage1 from '../../../picsbl/11.png';
import bpImage2 from '../../../picsbl/12.png';
import bpImage3 from '../../../picsbl/13.png';
import botanicalImage1 from '../../../picsbl/index1.jpg';
import botanicalImage2 from '../../../picsbl/index2.png';
import botanicalImage3 from '../../../picsbl/index3.png';
import botanicalImage4 from '../../../picsbl/index4.png';
import diseaseImage1 from '../../../picsbl/14.jpg';
import diseaseImage2 from '../../../picsbl/15.jpg';
import diseaseImage3 from '../../../picsbl/16.jpg';
import diseaseImage4 from '../../../picsbl/17.jpg';
import diseaseImage5 from '../../../picsbl/18.jpg';
import benefitsImage1 from '../../../picsbl/19.jpg';
import benefitsImage2 from '../../../picsbl/20.jpg';
import benefitsImage3 from '../../../picsbl/21.jpg';
import logoImage from '../../../picsbl/logowalangbg.png';

const bpImages = [bpImage1, bpImage2, bpImage3];
const botanicalImages = [botanicalImage1, botanicalImage2, botanicalImage3, botanicalImage4];
const diseaseImages = [diseaseImage1, diseaseImage2, diseaseImage3, diseaseImage4, diseaseImage5];
const benefitsImages = [benefitsImage1, benefitsImage2, benefitsImage3];

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

const diseases = [
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
];

const cultivationSteps = [
  {
    step: 1,
    title: 'Propagation: Stem Cutting & Rooting',
    content: 'Select healthy stem cuttings with 3-5 nodes from disease-free mother plants (terminal or runner shoots preferred). Prepare cuttings to 15-20 cm length, removing lower leaves. Root cuttings in sandy, shaded nursery beds for 4-6 weeks until 4-7 new leaves develop (typically 1-2 months). Maintain 75-80% shade and consistent moisture. Use rooting hormone (IBA 500-1000 ppm) to enhance rooting success rate. Once rooted with adequate leaf development, cuttings are ready for field transplanting.',
  },
  {
    step: 2,
    title: 'Field Preparation & Planting',
    content: 'Prepare field during months 2-3 before monsoon planting (June-July). Dig pits (30×30×30 cm) filled with organic matter (15-20 kg farmyard manure per pit). Install vertical supports/standards (Kakawate poles, concrete posts, or bamboo stakes) 2-2.5 m tall at spacing of 2-3 m between plants and 2.5-3 m between rows (1,000-2,000 plants/hectare). Plant rooted cuttings near supports during monsoon for natural moisture. Soil should be loamy with pH 5.5-6.5, well-drained with minimum 45-60 cm depth. Proper drainage infrastructure prevents Quick Wilt (Phytophthora) which kills plantations rapidly.',
  },
  {
    step: 3,
    title: 'Vegetative Growth & Maintenance (Years 1-2)',
    content: 'During the critical first 1-2 years, train vines to climb supports for proper canopy development. Perform regular weeding to reduce competition for nutrients. Apply farmyard manure (20-30 tons/hectare annually) and balanced NPK fertilizer (50 kg N, 50 kg P₂O₅, 50 kg K₂O per hectare) in 2-3 split applications during monsoon. Maintain irrigation at 2000-3000 mm annually through drip systems (2-3 liters/plant daily during dry season) to ensure rapid growth. Mulch around plants (5-8 cm) with organic material to conserve moisture, regulate soil temperature, and suppress weeds. Monitor soil with tensiometers for precise irrigation scheduling.',
  },
  {
    step: 4,
    title: 'Flowering & Fruit Development (Years 3-4)',
    content: 'After 3 years of vineyard establishment, plants begin producing flowers which develop into green, hanging spikes (inflorescences). Continued nutrient and water management is critical during this phase. A short dry period (20-30 days) before flowering triggers massive flower flush. Once flowering begins, berries develop over 5-6 months into mature green berries ready for harvest. Apply micronutrients (Zn 5 kg/ha, Mg 10 kg/ha, Fe 5 kg/ha) and foliar spray with 1% urea in July-August to support flowering vigor. Maintain mulch and weed control to direct plant energy toward fruit production.',
  },
  {
    step: 5,
    title: 'Harvesting & Post-Harvest Processing',
    content: 'Harvest spikes when berries start turning red (7-8 months after flowering, typically in years 3+). Detach berries from spikes and sun-dry for 7-10 days to reduce moisture from ~70% to 10-12%. Spread berries on clean drying grounds, rotating every 4-6 hours for even drying. Alternatively, briefly boil berries before drying (alternative method). Final product should be dark brown/black with wrinkled appearance and strong aroma. Store in dry, ventilated containers (jute bags, wooden boxes) at 10-15°C to maintain quality and prevent mold. Expected yield: 2-3 tons dried pepper per hectare at maturity.',
  },
];

export default function Knowledge() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedGuide, setExpandedGuide] = useState(-1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentBotanicalSlide, setCurrentBotanicalSlide] = useState(0);
  const [currentDiseaseSlide, setCurrentDiseaseSlide] = useState(0);
  const [currentBenefitsSlide, setCurrentBenefitsSlide] = useState(0);
  const [botanicalActive, setBotanicalActive] = useState('classification');
  const [benefitsTab, setBenefitsTab] = useState('nutrition');

  useEffect(() => {
    fetchLatestNews();
    
    // Auto-rotate carousels
    const carouselInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bpImages.length);
    }, 5000);
    
    const botanicalInterval = setInterval(() => {
      setCurrentBotanicalSlide((prev) => (prev + 1) % botanicalImages.length);
    }, 5000);
    
    const diseaseInterval = setInterval(() => {
      setCurrentDiseaseSlide((prev) => (prev + 1) % diseaseImages.length);
    }, 5000);
    
    const benefitsInterval = setInterval(() => {
      setCurrentBenefitsSlide((prev) => (prev + 1) % benefitsImages.length);
    }, 5000);
    
    return () => {
      clearInterval(carouselInterval);
      clearInterval(botanicalInterval);
      clearInterval(diseaseInterval);
      clearInterval(benefitsInterval);
    };
  }, []);

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
      console.error('Error fetching news:', error);
      setNews(getDefaultNews());
    } finally {
      setLoadingNews(false);
    }
  };

  const getDefaultNews = () => {
    return [
      { id: 1, title: 'Global Black Pepper Market Growth Trends 2024', date: 'January 2024', description: 'The global black pepper market is expected to grow at a CAGR of 5.2% from 2024 to 2030, driven by increasing demand for natural spices and organic farming practices.', link: '#', source: 'Agricultural News' },
      { id: 2, title: 'Sustainable Black Pepper Farming Practices', date: 'December 2023', description: 'New research highlights the importance of sustainable practices in black pepper cultivation, including organic fertilizers and integrated pest management.', link: '#', source: 'Environmental Agriculture' },
      { id: 3, title: 'Disease Resistance Varieties Released', date: 'November 2023', description: 'Agricultural universities have released new black pepper varieties with enhanced resistance to Footrot and Pollu diseases.', link: '#', source: 'Research Updates' },
    ];
  };

  const toggleExpand = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'botanical', label: 'Botanical' },
    { id: 'diseases', label: 'Disease Management' },
    { id: 'benefits', label: 'Health Benefits' },
    { id: 'cultivation', label: 'Cultivation' },
    { id: 'news', label: 'News & Resources' },
  ];

  const renderOverview = () => (
    <div className="overview-section">
      {/* Black Pepper Carousel */}
      <div className="carousel-container">
        <img src={bpImages[currentSlide]} alt="Black Pepper" className="carousel-image" />
        <div className="carousel-overlay"></div>
        <div className="carousel-indicators">
          {bpImages.map((_, idx) => (
            <span key={idx} className={`indicator ${currentSlide === idx ? 'active' : ''}`} onClick={() => setCurrentSlide(idx)}></span>
          ))}
        </div>
      </div>

      {/* Black Pepper Guide */}
      <div className="guide-section">
        <h2 className="section-title">Black Pepper Guide</h2>
        <p className="guide-subtext">Understand your crop's needs</p>
        
        <div className="guide-cards">
          {pepperGuide.map((guide, index) => (
            <div 
              key={index} 
              className={`guide-card ${expandedGuide === index ? 'expanded' : ''}`}
              style={{ backgroundColor: guide.bgColor, borderColor: guide.accent }}
              onClick={() => setExpandedGuide(expandedGuide === index ? -1 : index)}
            >
              <div className="guide-card-header">
                <div className="guide-icon">{guide.icon}</div>
                <div className="guide-title-container">
                  <h3 style={{ color: guide.accent }}>{guide.title}</h3>
                  <p className="guide-heading" style={{ color: guide.accent }}>{guide.heading}</p>
                </div>
                <span className="expand-icon">{expandedGuide === index ? '▼' : '▶'}</span>
              </div>
              
              <div className="highlights">
                {guide.highlights.map((h, hIdx) => (
                  <span key={hIdx} className="highlight-badge" style={{ color: guide.accent }}>• {h}</span>
                ))}
              </div>
              
              {expandedGuide === index && (
                <div className="guide-details">
                  <p>{guide.details}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBotanical = () => (
    <div className="botanical-section">
      {/* Botanical Carousel */}
      <div className="carousel-container">
        <img src={botanicalImages[currentBotanicalSlide]} alt="Botanical" className="carousel-image" />
        <div className="carousel-overlay"></div>
        <div className="carousel-indicators">
          {botanicalImages.map((_, idx) => (
            <span key={idx} className={`indicator ${currentBotanicalSlide === idx ? 'active' : ''}`} onClick={() => setCurrentBotanicalSlide(idx)}></span>
          ))}
        </div>
      </div>

      {/* Subtabs */}
      <div className="subtabs">
        <button className={`subtab-btn ${botanicalActive === 'classification' ? 'active' : ''}`} onClick={() => setBotanicalActive('classification')}>Classification</button>
        <button className={`subtab-btn ${botanicalActive === 'morphology' ? 'active' : ''}`} onClick={() => setBotanicalActive('morphology')}>Morphology</button>
        <button className={`subtab-btn ${botanicalActive === 'growth' ? 'active' : ''}`} onClick={() => setBotanicalActive('growth')}>Growth Stages</button>
      </div>

      {botanicalActive === 'classification' && (
        <div className="classification-content">
          <div className="info-card">
            <h3>Scientific Classification</h3>
            <div className="classification-list">
              <div className="class-item">
                <div className="class-icon">🧬</div>
                <div className="class-content">
                  <h4>Kingdom: Plantae</h4>
                  <p>Multicellular, eukaryotic organisms characterized by cell walls containing cellulose.</p>
                </div>
              </div>
              <div className="class-item">
                <div className="class-icon">🌸</div>
                <div className="class-content">
                  <h4>Division: Magnoliophyta</h4>
                  <p>Flowering plants (angiosperms) characterized by the presence of flowers and fruits.</p>
                </div>
              </div>
              <div className="class-item">
                <div className="class-icon">🍃</div>
                <div className="class-content">
                  <h4>Class: Magnoliopsida</h4>
                  <p>Dicotyledons with two cotyledons, typical net-like leaf venation.</p>
                </div>
              </div>
              <div className="class-item">
                <div className="class-icon">🌿</div>
                <div className="class-content">
                  <h4>Order: Piperales</h4>
                  <p>An order of flowering plants containing aromatic families like Piperaceae.</p>
                </div>
              </div>
              <div className="class-item">
                <div className="class-icon">🌱</div>
                <div className="class-content">
                  <h4>Family: Piperaceae</h4>
                  <p>A primitive angiosperm family of "pepper-like" plants with pungent aromatic oils.</p>
                </div>
              </div>
              <div className="class-item">
                <div className="class-icon">🔍</div>
                <div className="class-content">
                  <h4>Genus: Piper L.</h4>
                  <p>A massive, pantropical genus containing over 3,000 species.</p>
                </div>
              </div>
              <div className="class-item">
                <div className="class-icon"><img src={logoImage} alt="logo" style={{width: 24, height: 24}} /></div>
                <div className="class-content">
                  <h4>Species: Piper nigrum L.</h4>
                  <p>The perennial woody vine cultivated for peppercorns; famously known as "King of Spices". Native to the Malabar Coast of India.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {botanicalActive === 'morphology' && (
        <div className="morphology-content">
          <div className="info-card">
            <p>Black pepper (Piper nigrum L.) is a tropical, woody perennial climbing vine (family Piperaceae) that grows up to 10m using aerial adventitious roots. It features dimorphic branching, thick, glossy green ovate leaves, and produces minute, white-to-yellow flowers on hanging spikes.</p>
            
            <h3>Morphological Components</h3>
            <div className="morphology-list">
              <div className="morph-item">
                <h4>🎋 Habit</h4>
                <p>A trailing or climbing vine that requires support, producing adventitious roots at nodes for climbing.</p>
              </div>
              <div className="morph-item">
                <h4>🌳 Stem</h4>
                <p>Woody at the base with swollen nodes. Two types of branches: orthotropic (main, climbing stems) and plagiotropic (lateral, fruit-bearing branches).</p>
              </div>
              <div className="morph-item">
                <h4>🍃 Leaves</h4>
                <p>Simple, alternate, dark green, glossy, ovate-elliptic or ovate-lanceolate, often with an acuminate tip. Blade sizes typically 8–17.5 cm long.</p>
              </div>
              <div className="morph-item">
                <h4>🌸 Inflorescence</h4>
                <p>A spike or catkin, 3–12 cm long, produced opposite the leaves. Contains minute, sessile, bisexual or unisexual flowers.</p>
              </div>
              <div className="morph-item">
                <h4>🍇 Fruit (Peppercorn)</h4>
                <p>A sessile, globose berry (drupe), 5–6 mm in diameter. Green when immature, turning red when ripe. Dried berries become black pepper of commerce.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {botanicalActive === 'growth' && (
        <div className="growth-content">
          <div className="info-card">
            <p>Black pepper plants (Piper nigrum) are woody climbers that typically take 3–4 years to reach full maturity, progressing through vegetative, flowering, and fruiting stages.</p>
            
            <h3>Key Growth Stages</h3>
            <div className="growth-stages">
              {[
                { stage: 1, emoji: '🌱', title: 'Propagation & Seedling', duration: '0–3 Months', desc: 'Typically grown from runner shoot cuttings planted in nurseries. Requires high humidity and shade, before being transplanted to the field.' },
                { stage: 2, emoji: '🌿', title: 'Vegetative Growth Phase', duration: 'Year 1–2', desc: 'The vine grows rapidly, climbing up a support tree. The plant develops orthotropes (vertical main shoots) and plagiotropes (lateral fruiting branches).' },
                { stage: 3, emoji: '🌸', title: 'Flowering Phase', duration: 'Year 3 onwards', desc: 'The plant begins flowering 3–4 years after planting. Small white flowers appear on spikes which hang down from the branches.' },
                { stage: 4, emoji: '🌾', title: 'Fruit Development', duration: '5–6 Months', desc: 'After pollination, the spikes develop berries (peppercorns). Berries grow from green to shiny yellowish-green, and finally turn red when fully mature.' },
                { stage: 5, emoji: '🌾', title: 'Harvesting', duration: 'Mature Stage', desc: 'Harvesting occurs when one or two berries on the spike turn red. The entire spike is picked, and berries are separated and dried.' },
              ].map((item, idx) => (
                <div key={idx} className="growth-stage-item">
                  <div className="stage-number" style={{ backgroundColor: '#00FF88' }}>{item.emoji}</div>
                  <div className="stage-content">
                    <div className="stage-header">
                      <h4>{item.stage}. {item.title}</h4>
                      <span className="stage-duration">{item.duration}</span>
                    </div>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDiseases = () => (
    <div className="diseases-section">
      {/* Disease Image Carousel */}
      <div className="carousel-container">
        <img src={diseaseImages[currentDiseaseSlide]} alt="Disease" className="carousel-image" />
        <div className="carousel-overlay"></div>
        <div className="carousel-indicators">
          {diseaseImages.map((_, idx) => (
            <span key={idx} className={`indicator ${currentDiseaseSlide === idx ? 'active' : ''}`} onClick={() => setCurrentDiseaseSlide(idx)}></span>
          ))}
        </div>
      </div>

      <div className="disease-cards">
        {diseases.map((disease, idx) => (
          <div 
            key={idx} 
            className="disease-card"
            style={{ borderLeftColor: disease.severity === 'critical' ? '#E74C3C' : '#F39C12' }}
          >
            <div className="disease-header">
              <span className="disease-icon">{disease.icon}</span>
              <div className="disease-title-section">
                <h3>{disease.title}</h3>
                <p>{disease.desc}</p>
              </div>
              <span className={`severity-badge ${disease.severity}`}>{disease.severity}</span>
            </div>
            
            <div className="disease-symptoms">
              <h4>Symptoms:</h4>
              <div className="symptoms-tags">
                {disease.symptoms.map((sym, sIdx) => (
                  <span key={sIdx} className="symptom-tag">• {sym}</span>
                ))}
              </div>
            </div>
            
            <div className="disease-prevention">
              <h4>🛡️ Prevention:</h4>
              <p>{disease.prevention}</p>
            </div>
            
            <div className="disease-treatment">
              <h4>💊 Treatment:</h4>
              <p>{disease.treatment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBenefits = () => (
    <div className="benefits-section">
      {/* Benefits Image Carousel */}
      <div className="carousel-container">
        <img src={benefitsImages[currentBenefitsSlide]} alt="Benefits" className="carousel-image" />
        <div className="carousel-overlay"></div>
        <div className="carousel-indicators">
          {benefitsImages.map((_, idx) => (
            <span key={idx} className={`indicator ${currentBenefitsSlide === idx ? 'active' : ''}`} onClick={() => setCurrentBenefitsSlide(idx)}></span>
          ))}
        </div>
      </div>

      {/* Benefits Tabs */}
      <div className="subtabs">
        <button className={`subtab-btn ${benefitsTab === 'nutrition' ? 'active' : ''}`} onClick={() => setBenefitsTab('nutrition')}>Antioxidants</button>
        <button className={`subtab-btn ${benefitsTab === 'digestive' ? 'active' : ''}`} onClick={() => setBenefitsTab('digestive')}>Digestive Support</button>
        <button className={`subtab-btn ${benefitsTab === 'antiInflammatory' ? 'active' : ''}`} onClick={() => setBenefitsTab('antiInflammatory')}>Anti-inflammatory</button>
      </div>

      {benefitsTab === 'nutrition' && (
        <div className="benefit-card" style={{ borderLeftColor: '#00FF88' }}>
          <div className="benefit-header">
            <div className="benefit-icon">💚</div>
            <div>
              <h3>Antioxidant Power</h3>
              <p>Neutralizes free radicals</p>
            </div>
          </div>
          <p>Black pepper is rich in piperine (5-10% by weight), a polyphenol with extraordinary antioxidant power. Piperine actively neutralizes harmful free radicals and reactive oxygen species (ROS) that damage cells and accelerate aging. Research shows it enhances curcumin absorption by 2000%.</p>
          <div className="benefit-stats">
            <span className="stat-badge">ORAC: 27,618 µmol/100g</span>
            <span className="stat-badge">Potent vs Blueberries</span>
          </div>
        </div>
      )}

      {benefitsTab === 'digestive' && (
        <div className="benefit-card" style={{ borderLeftColor: '#F59E0B' }}>
          <div className="benefit-header">
            <div className="benefit-icon">🔥</div>
            <div>
              <h3>Digestive Fire</h3>
              <p>Boost metabolism & absorption</p>
            </div>
          </div>
          <p>Black pepper ignites your digestive fire. Piperine stimulates saliva and gastric juice secretion, preparing your body to break down and absorb nutrients efficiently. It increases intestinal permeability by up to 30%, allowing your body to absorb more nutrients.</p>
        </div>
      )}

      {benefitsTab === 'antiInflammatory' && (
        <div className="benefit-card" style={{ borderLeftColor: '#EF4444' }}>
          <div className="benefit-header">
            <div className="benefit-icon">🛡️</div>
            <div>
              <h3>Anti-Inflammatory</h3>
              <p>Combat chronic inflammation</p>
            </div>
          </div>
          <p>Piperine is a potent NF-κB inhibitor - essentially blocking the "master switch" that activates chronic inflammation. It reduces pro-inflammatory cytokines (TNF-α, IL-6, IL-8) by up to 40%, offering relief comparable to pharmaceutical NSAIDs without the side effects.</p>
        </div>
      )}
    </div>
  );

  const renderCultivation = () => (
    <div className="cultivation-section">
      <h2 className="section-title">Cultivation Steps</h2>
      <div className="cultivation-steps">
        {cultivationSteps.map((step, idx) => (
          <div 
            key={idx} 
            className={`cultivation-card ${expandedSections[`cultivation-${idx}`] ? 'expanded' : ''}`}
            onClick={() => toggleExpand(`cultivation-${idx}`)}
          >
            <div className="cultivation-header">
              <div className="step-number">{step.step}</div>
              <div className="step-title">
                <h3>{step.title}</h3>
              </div>
              <span className="expand-icon">{expandedSections[`cultivation-${idx}`] ? '▼' : '▶'}</span>
            </div>
            {expandedSections[`cultivation-${idx}`] && (
              <div className="cultivation-content">
                <p>{step.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderNews = () => (
    <div className="news-section">
      <h2 className="section-title">Latest News & Resources</h2>
      <div className="search-box">
        <input 
          type="text" 
          placeholder="Search news..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {loadingNews ? (
        <div className="loading">Loading news...</div>
      ) : (
        <div className="news-grid">
          {news
            .filter(item => 
              !searchQuery || 
              item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item, idx) => (
              <a key={idx} href={item.link || '#'} className="news-card" target="_blank" rel="noopener noreferrer">
                <h3>{item.title}</h3>
                <p className="news-meta">{item.source} • {item.date}</p>
                <p className="news-desc">{item.description}</p>
                <span className="read-more">Read Full Article →</span>
              </a>
            ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'botanical': return renderBotanical();
      case 'diseases': return renderDiseases();
      case 'benefits': return renderBenefits();
      case 'cultivation': return renderCultivation();
      case 'news': return renderNews();
      default: return renderOverview();
    }
  };

  return (
    <>
      <Header />
      <div className="knowledge-container">
        {/* Hero Section */}
        <div className="knowledge-hero">
          <h1>🌿 Piper Knowledge</h1>
          <p>Your comprehensive guide to black pepper cultivation and management</p>
        </div>

        {/* Tab Navigation */}
        <div className="knowledge-tabs">
          <div className="tabs-wrapper">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <span>Knowledge Base</span> / <span>{tabs.find(t => t.id === activeTab)?.label}</span>
        </div>

        {/* Content Section */}
        <div className="knowledge-content">
          {renderContent()}
        </div>

        {/* Related Links */}
        <div className="related-links">
          <h3>🚀 Quick Access to Features</h3>
          <div className="links-grid">
            <Link to="/leaf-analysis" className="link-card">
              <span className="card-icon">🍃</span>
              <h4>Leaf Analysis</h4>
              <p>Detect diseases using AI</p>
            </Link>
            <Link to="/weather" className="link-card">
              <span className="card-icon">🌤️</span>
              <h4>Weather</h4>
              <p>Check conditions & forecast</p>
            </Link>
            <Link to="/macro-mapping" className="link-card">
              <span className="card-icon">🗺️</span>
              <h4>Macro Mapping</h4>
              <p>View farm analytics & insights</p>
            </Link>
          </div>
        </div>

        {/* Back to Top Button */}
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ↑
        </button>
      </div>
      <Footer />
    </>
  );
}
