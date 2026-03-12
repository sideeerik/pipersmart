import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import leafImg from '../imageabtus/leaf.jpg';
import bungaImg from '../imageabtus/bunga.jpg';
import mapImg from '../imageabtus/map.jpg';
import botImg from '../imageabtus/bot.jpg';
import knowledgeImg from '../imageabtus/knowledge.jpg';
import messengerImg from '../imageabtus/messenger.jpg';
import notepadImg from '../imageabtus/notepad.jpg';
import activitiesImg from '../imageabtus/activities.jpg';
import forumImg from '../imageabtus/forum.jpg';

export default function About() {
  const [activeTab, setActiveTab] = useState('overview');
  const [featureFilter, setFeatureFilter] = useState('All');
  const [featureQuery, setFeatureQuery] = useState('');
  const [activeFeature, setActiveFeature] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'pepper', label: 'Black Pepper' },
    { id: 'mission', label: 'About Us' },
  ];

  const featuresList = [
    {
      title: 'Leaf Analysis',
      description:
        'Leaf disease detection powered by AI vision for early, confident decisions. Capture a leaf photo and receive instant diagnosis, severity cues, and actionable next steps before yield is impacted.',
      icon: '\u{1F343}',
      link: '/leaf-analysis',
      size: 'xl',
      status: 'good',
      tag: 'AI Vision',
      image: leafImg,
      kpi: '98%',
      kpiLabel: 'Detection accuracy',
      trend: [32, 38, 44, 41, 48, 55, 62, 68],
    },
    {
      title: 'Peppercorn Analysis',
      description:
        'Ripeness and health percentage detection tuned for premium harvests. Analyze peppercorns to get grading signals and clear harvest readiness guidance for consistent quality.',
      icon: '\u{1F52C}',
      link: '/bunga-analysis',
      size: 'xl',
      status: 'good',
      tag: 'AI Grading',
      image: bungaImg,
      kpi: '94%',
      kpiLabel: 'Ripeness confidence',
      trend: [28, 34, 39, 45, 49, 52, 58, 63],
    },
    {
      title: 'Macromapping',
      description:
        'Spatial visualization, location saving, and route guidance for large farms. Track plot insights, microclimate notes, and scouting routes in one clean geospatial workspace.',
      icon: '\u{1F5FA}',
      link: '/macro-mapping',
      size: 'lg',
      status: 'good',
      tag: 'Geo Insights',
      image: mapImg,
      kpi: '120+',
      kpiLabel: 'Saved locations',
      trend: [20, 24, 22, 28, 30, 34, 36, 42],
    },
    {
      title: 'Chatbot',
      description:
        'AI-powered farming assistance that answers in plain language. Get tailored advice, troubleshooting, and instant links to the most relevant guides in seconds.',
      icon: '\u{1F916}',
      link: '#',
      size: 'md',
      status: 'good',
      tag: 'AI Assistant',
      image: botImg,
      kpi: '24/7',
      kpiLabel: 'Support uptime',
      trend: [40, 44, 43, 46, 50, 54, 56, 59],
    },
    {
      title: 'Piper Knowledge',
      description:
        'Learn black pepper botanical, cultivation, and disease management essentials. Explore curated guides, seasonal playbooks, and best practices built for local conditions.',
      icon: '\u{1F4DA}',
      link: '/knowledge',
      size: 'sm',
      status: 'good',
      tag: 'Learning',
      image: knowledgeImg,
      kpi: '180+',
      kpiLabel: 'Guides available',
      trend: [12, 14, 18, 22, 25, 29, 32, 38],
    },
    {
      title: 'Notepad',
      description:
        'Take notes and track activities in a clean field journal. Log sprays, irrigation, and harvest milestones with timestamps so teams stay aligned.',
      icon: '\u{1F4DD}',
      link: '#',
      size: 'sm',
      status: 'good',
      tag: 'Productivity',
      image: notepadImg,
      kpi: 'Sync',
      kpiLabel: 'Across devices',
      trend: [10, 12, 15, 14, 16, 19, 21, 24],
    },
    {
      title: 'Messenger',
      description:
        'Send direct messages and stay connected with the community. Share photos, coordinate with agronomists, and keep a reliable record of field conversations.',
      icon: '\u{2709}\u{FE0F}',
      link: '#',
      size: 'sm',
      status: 'warn',
      tag: 'Community',
      image: messengerImg,
      kpi: 'Fast',
      kpiLabel: 'Response time',
      trend: [18, 16, 20, 22, 19, 21, 23, 26],
    },
    {
      title: 'Track Recent Activities',
      description:
        'Monitor PiperSmart activity history in one unified timeline. Review detections, mapping edits, and community updates without missing a beat.',
      icon: '\u{1F4CA}',
      link: '/recent-activities',
      size: 'md',
      status: 'good',
      tag: 'Analytics',
      image: activitiesImg,
      kpi: 'Live',
      kpiLabel: 'Activity feed',
      trend: [26, 30, 29, 33, 36, 38, 41, 45],
    },
    {
      title: 'Community Forum',
      description:
        'Collaborative knowledge exchange led by growers and experts. Ask questions, share success stories, and crowdsource solutions that work locally.',
      icon: '\u{1F4AC}',
      link: '/forum',
      size: 'md',
      status: 'good',
      tag: 'Community',
      image: forumImg,
      kpi: '1.2k',
      kpiLabel: 'Active discussions',
      trend: [22, 24, 28, 31, 33, 37, 39, 44],
    },
  ];

  const pepperIntro =
    'Black pepper (Piper nigrum), often referred to as the "King of Spices" holds immense global significance, acting as a cornerstone of the international spice trade for thousands of years, a vital culinary staple, and a potent, multi-functional medicinal agent. Native to the Malabar Coast of India, it is currently the world\'s most traded spice, accounting for approximately 20% of all global spice imports.';

  const pepperSections = [
    {
      emoji: '\u{1F4B0}',
      title: 'Historical and Economic Significance',
      items: [
        {
          title: 'Historical Currency: "Black Gold"',
          desc: 'In ancient and medieval times, black pepper was so highly valued it was used as a form of money, rent, and dowry, earning the nickname "black gold".',
        },
        {
          title: 'Driver of Exploration',
          desc: 'The desire to control trade routes from Asia to Europe in the 15th century fuelled the Age of Exploration, directly prompting voyages by explorers like Vasco da Gama.',
        },
        {
          title: 'Current Economic Value',
          desc: 'The global black pepper market is a multi-billion dollar industry (projected at 7.2 billion USD by 2026). It is a crucial export crop for countries like Vietnam (the top producer), Brazil, Indonesia, and India, supporting thousands of smallholder farmers.',
        },
      ],
    },
    {
      emoji: '\u{1F37D}\u{FE0F}',
      title: 'Culinary Ubiquity',
      items: [
        {
          title: 'Global Standard',
          desc: 'It is one of the few seasonings, along with salt, that is used almost universally in kitchens, restaurants, and dining tables across the globe.',
        },
        {
          title: 'Flavor Profile',
          desc: 'It provides a unique pungent, earthy, and aromatic flavor to dishes, making it essential in cuisines ranging from Asian to European.',
        },
      ],
    },
    {
      emoji: '\u{1F9EC}',
      title: 'Nutritional and Medicinal Significance',
      lead: 'The primary active compound in black pepper is piperine, which is responsible for its pungent taste and extensive health benefits.',
      items: [
        {
          title: 'Digestive Aid',
          desc: 'Piperine stimulates pancreatic and intestinal enzymes, enhancing digestion and nutrient absorption.',
        },
        {
          title: 'Bioenhancer',
          desc: 'A critical function of black pepper is its ability to enhance the bioavailability of other nutrients and phytochemicals (e.g., increasing the absorption of curcumin from turmeric by up to 20-fold).',
        },
        {
          title: 'Therapeutic Properties',
          desc: 'It possesses antioxidant, antimicrobial, anti-inflammatory, and antidepressant properties. It is used in traditional medicines (Ayurveda, Unani) to treat respiratory issues, gastrointestinal issues, and to enhance immune function.',
        },
        {
          title: 'Potential Future Medicine',
          desc: 'Research suggests piperine may have anti-cancer properties and potential in treating neurodegenerative conditions like Alzheimer\'s disease.',
        },
      ],
    },
    {
      emoji: '\u{1F3ED}',
      title: 'Industrial and Agricultural Use',
      items: [
        {
          title: 'Food Industry',
          desc: 'Beyond household use, it is a key ingredient in the processed food industry, used in meat products, sauces, and as a natural preservative due to its antimicrobial properties.',
        },
        {
          title: 'Cosmetics',
          desc: 'It is used in the flavoring and fragrance industry.',
        },
        {
          title: 'Agriculture',
          desc: 'Black pepper is an excellent intercropping plant (often grown with coffee or in agroforestry systems), supporting sustainable agricultural practices, particularly in Asia.',
        },
      ],
    },
  ];

  const mission =
    'PiperSmart democratizes advanced agricultural intelligence for black pepper farmers worldwide by bridging traditional farming wisdom with cutting-edge technology. We empower farmers to detect crop diseases in real-time, optimize harvest timing, and connect with thriving community networks through AI-powered image analysis and precise crop grading. Our commitment is to maximize farmer profitability by providing market-grade classification that reduces waste and commands premium prices. We believe that breaking geographic isolation through community-driven intelligence accelerates the adoption of sustainable, high-yield cultivation methods.';

  const vision =
    'We envision revolutionizing global black pepper agriculture by creating an interconnected, intelligent ecosystem that seamlessly bridges traditional farming wisdom with contemporary technology. By 2030, we aspire to empower 500,000+ farmers across Vietnam, India, Indonesia, Brazil, and emerging regions through data-driven precision farming that reduces crop losses by 30-40% and increases premium-grade yield by 25%+. In this vision, farmers own their agricultural data, global cooperatives leverage transparent pricing and blockchain certification, and 50 million crops generate unprecedented insights into pathology and optimization. We envision technology that respects regional traditions while delivering world-class innovation that sustains excellence for generations to come.';

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

  const teamMembers = [
    { name: 'Even Lloyd S. Billoned', initials: 'EL' },
    { name: 'Yhanskie Adriel D. Cipriano', initials: 'YA' },
    { name: 'Jenard D. Inojales', initials: 'JD' },
    { name: 'Lord Cedric O. Vila', initials: 'LC' },
  ];

  const overviewStats = useMemo(() => {
    const aiCount = featuresList.filter((item) => item.tag?.toLowerCase().includes('ai')).length;
    const communityCount = featuresList.filter((item) => item.tag?.toLowerCase().includes('community')).length;
    return [
      { label: 'Total tools', value: featuresList.length.toString().padStart(2, '0') },
      { label: 'AI modules', value: aiCount.toString().padStart(2, '0') },
      { label: 'Community tools', value: communityCount.toString().padStart(2, '0') },
    ];
  }, [featuresList]);

  const featureFilters = ['All', 'AI', 'Community', 'Productivity', 'Learning', 'Analytics', 'Geo'];

  const filteredFeatures = useMemo(() => {
    const query = featureQuery.trim().toLowerCase();
    return featuresList.filter((feature) => {
      const matchesFilter =
        featureFilter === 'All' ||
        feature.tag?.toLowerCase().includes(featureFilter.toLowerCase());
      const matchesQuery =
        !query ||
        feature.title.toLowerCase().includes(query) ||
        feature.description.toLowerCase().includes(query) ||
        feature.tag?.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
  }, [featuresList, featureFilter, featureQuery]);

  const renderSparkline = (points) => {
    const width = 96;
    const height = 32;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const normalized = points.map((point) => {
      if (max === min) return height / 2;
      return height - ((point - min) / (max - min)) * height;
    });
    const step = width / (points.length - 1);
    const polyline = normalized
      .map((value, index) => `${(index * step).toFixed(2)},${value.toFixed(2)}`)
      .join(' ');
    return (
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <polyline points={polyline} fill="none" />
      </svg>
    );
  };

  const handlePepperNav = (event, targetId) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Header />

      <div className="about-container">
        <div className="about-header">
          <h1>About PiperSmart</h1>
          <p className="tagline">Revolutionizing Black Pepper Agriculture Through Intelligent Technology</p>
          <div className="vision-badge">
            <span>Empowering Farmers, Sustaining Excellence</span>
          </div>
        </div>

        <div className="about-tabs" role="tablist" aria-label="About sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`about-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="about-content">
          {activeTab === 'overview' && (
            <section className="about-section overview-section">
              <div className="overview-header">
                <div>
                  <h2>Platform Features</h2>
                  <p className="overview-subtitle">
                    A smart farming toolkit designed for rapid decisions, richer insights, and resilient harvests.
                  </p>
                </div>
                <div className="overview-stats">
                  {overviewStats.map((stat) => (
                    <div key={stat.label} className="overview-stat">
                      <span className="overview-value">{stat.value}</span>
                      <span className="overview-label">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overview-controls">
                <div className="overview-filters">
                  {featureFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      className={`filter-pill ${featureFilter === filter ? 'active' : ''}`}
                      onClick={() => setFeatureFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="overview-search">
                  <input
                    type="search"
                    placeholder="Search features..."
                    value={featureQuery}
                    onChange={(event) => setFeatureQuery(event.target.value)}
                    aria-label="Search features"
                  />
                  {featureQuery && (
                    <button
                      type="button"
                      className="search-clear"
                      onClick={() => setFeatureQuery('')}
                      aria-label="Clear search"
                    >
                      x
                    </button>
                  )}
                </div>
              </div>

              <div className="features-grid">
                {filteredFeatures.map((feature, idx) => (
                  <Link
                    key={idx}
                    to={feature.link}
                    className={`feature-card feature-size-${feature.size} status-${feature.status}`}
                  >
                    <div className="feature-media">
                      <img src={feature.image} alt={`${feature.title} preview`} loading="lazy" />
                      <div className="feature-media-overlay">
                        <span className="feature-tag">{feature.tag}</span>
                        <button
                          type="button"
                          className="feature-preview"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setActiveFeature(feature);
                          }}
                        >
                          View details
                        </button>
                      </div>
                    </div>
                    <div className="feature-card-body">
                      <div className="feature-title-row">
                        <h3>{feature.title}</h3>
                        <span className="feature-size-pill">{feature.size.toUpperCase()}</span>
                      </div>
                      <p>{feature.description}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {activeFeature && (
                <div
                  className="feature-modal"
                  role="dialog"
                  aria-modal="true"
                  onClick={() => setActiveFeature(null)}
                >
                  <div
                    className="feature-modal-card"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="feature-modal-close"
                      onClick={() => setActiveFeature(null)}
                      aria-label="Close"
                    >
                      x
                    </button>
                    <div className="feature-modal-header">
                      <span className="feature-icon">{activeFeature.icon}</span>
                      <div>
                        <p className="feature-modal-kicker">{activeFeature.tag}</p>
                        <h3>{activeFeature.title}</h3>
                        <p>{activeFeature.description}</p>
                      </div>
                    </div>
                    <div className="feature-modal-meta">
                      <div>
                        <span className="kpi-value">{activeFeature.kpi}</span>
                        <span className="kpi-label">{activeFeature.kpiLabel}</span>
                      </div>
                      <div className="feature-sparkline">
                        {renderSparkline(activeFeature.trend)}
                      </div>
                    </div>
                    <div className="feature-modal-actions">
                      <Link to={activeFeature.link} className="feature-modal-link">
                        Go to feature
                      </Link>
                      <button
                        type="button"
                        className="feature-modal-secondary"
                        onClick={() => setActiveFeature(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'pepper' && (
            <section className="about-section pepper-section">
              <div className="pepper-hero">
                <div className="pepper-hero-copy">
                  <span className="pepper-kicker">Botanical spotlight</span>
                  <h2>Black Pepper: The King of Spices</h2>
                  <p>{pepperIntro}</p>
                  <div className="pepper-hero-tags">
                    <span className="pepper-chip">Piper nigrum</span>
                    <span className="pepper-chip">Malabar Coast origins</span>
                    <span className="pepper-chip">Global culinary staple</span>
                  </div>
                </div>
                <div className="pepper-hero-panel">
                  <div className="pepper-hero-stats">
                    <div className="pepper-stat">
                      <span className="pepper-stat-icon" aria-hidden="true">🌍</span>
                      <span className="pepper-stat-value">20%</span>
                      <span className="pepper-stat-label">Global spice imports</span>
                    </div>
                    <div className="pepper-stat">
                      <span className="pepper-stat-icon" aria-hidden="true">📈</span>
                      <span className="pepper-stat-value">7.2B</span>
                      <span className="pepper-stat-label">Market value by 2026</span>
                    </div>
                    <div className="pepper-stat">
                      <span className="pepper-stat-icon" aria-hidden="true">🧭</span>
                      <span className="pepper-stat-value">5+</span>
                      <span className="pepper-stat-label">Major producer regions</span>
                    </div>
                  </div>
                  <div className="pepper-hero-note">
                    <h3>Why it matters</h3>
                    <p>
                      Black pepper is a rare crop that shapes global trade, nutrition, and
                      sustainable farming in equal measure.
                    </p>
                  </div>
                </div>
                <div className="pepper-hero-art" aria-hidden="true">
                  <span className="pepper-orb pepper-orb-lg" />
                  <span className="pepper-orb pepper-orb-md" />
                  <span className="pepper-orb pepper-orb-sm" />
                </div>
              </div>

              <div className="pepper-content">
                <aside className="pepper-aside">
                  <div className="pepper-aside-card">
                    <h3>Explore the story</h3>
                    <p>
                      Jump to the highlights that matter most to you, from trade history to
                      medicinal science.
                    </p>
                    <div className="pepper-nav">
                      {pepperSections.map((section, idx) => (
                        <a
                          key={section.title}
                          href={`#pepper-${idx}`}
                          className="pepper-nav-link"
                          onClick={(event) => handlePepperNav(event, `pepper-${idx}`)}
                        >
                          <span className="pepper-nav-emoji" aria-hidden="true">{section.emoji}</span>
                          <span>{section.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="pepper-aside-card pepper-aside-callout">
                    <h3>Impact snapshot</h3>
                    <p>
                      Farmers, exporters, and kitchens worldwide rely on pepper for both
                      profitability and flavor.
                    </p>
                    <div className="pepper-aside-metrics">
                      <div>
                        <span className="pepper-aside-value">20%</span>
                        <span className="pepper-aside-label">Share of spice trade</span>
                      </div>
                      <div>
                        <span className="pepper-aside-value">7.2B</span>
                        <span className="pepper-aside-label">Projected market value</span>
                      </div>
                      <div>
                        <span className="pepper-aside-value">5+</span>
                        <span className="pepper-aside-label">Key producer regions</span>
                      </div>
                    </div>
                  </div>
                </aside>

                <div className="pepper-grid">
                  {pepperSections.map((section, idx) => (
                    <article
                      key={section.title}
                      id={`pepper-${idx}`}
                      className="pepper-card"
                    >
                      <div className="pepper-card-header">
                        <span className="pepper-card-index">{String(idx + 1).padStart(2, '0')}</span>
                        <div className="pepper-card-title">
                          <span className="pepper-emoji" aria-hidden="true">{section.emoji}</span>
                          <h3 className="pepper-title">{section.title}</h3>
                        </div>
                      </div>
                      {section.lead && <p className="pepper-lead">{section.lead}</p>}
                      <div className="pepper-items">
                        {section.items.map((item) => (
                          <div key={item.title} className="pepper-item">
                            <h4>{item.title}</h4>
                            <p>{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'mission' && (
            <>
              <div className="about-row mission-row">
                <section className="about-section about-compact about-mission-card">
                  <h2>Our Mission</h2>
                  <p>{mission}</p>
                </section>

                <section className="about-section about-compact about-vision-card">
                  <h2>Our Vision</h2>
                  <p>{vision}</p>
                </section>
              </div>

              <section className="about-section values-section">
                <h2>Core Values</h2>
                <div className="values-grid">
                  {coreValues.map((item) => (
                    <p key={item.title}><strong>{item.title}</strong> {item.desc}</p>
                  ))}
                </div>
              </section>

              <section className="about-section team-section">
                <h2>Development Team</h2>
                <div className="team-grid">
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="team-card">
                      <div className="team-avatar">
                        <span>{member.initials}</span>
                      </div>
                      <h3 className="team-name">{member.name}</h3>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}


