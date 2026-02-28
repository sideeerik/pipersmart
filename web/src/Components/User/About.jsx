import { useState } from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import Header from '../shared/Header';
import logo from '../../../../picturesofbp/logowalangbg.png';

export default function About() {
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const pepperStats = [
    { label: "Global Trade Value", value: "$1.9B", icon: "💰" },
    { label: "Countries Producing", value: "75+", icon: "🌍" },
    { label: "Medicinal Compounds", value: "500+", icon: "🧪" },
    { label: "Years of Cultivation", value: "2000+", icon: "📜" }
  ];

  const pepperBenefits = [
    {
      title: "Nutritional Powerhouse",
      desc: "Rich in piperine, antioxidants, and essential minerals that enhance nutrient bioavailability and metabolic function"
    },
    {
      title: "Antimicrobial Properties",
      desc: "Exhibits robust antimicrobial and antifungal characteristics that combat pathogenic organisms"
    },
    {
      title: "Anti-inflammatory Impact",
      desc: "Contains bioactive compounds that modulate inflammatory pathways and support cellular health"
    },
    {
      title: "Antioxidant Capacity",
      desc: "Demonstrates exceptional free radical scavenging ability, supporting oxidative stress mitigation"
    }
  ];

  return (
    <>
      <Header />

      <div className="about-container">
        {/* Hero Section with Logo */}
        <div className="about-header">
          <div className="header-logo-section">
            <img src={logo} alt="PiperSmart Logo" className="prime-logo" />
          </div>
          <h1>About PiperSmart</h1>
          <p className="tagline">Revolutionizing Black Pepper Agriculture Through Intelligent Technology</p>
          <div className="vision-badge">
            <span>🎯 Vision: Empowering Farmers, Sustaining Excellence</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pepper' ? 'active' : ''}`}
            onClick={() => setActiveTab('pepper')}
          >
            Black Pepper Analysis
          </button>
          <button 
            className={`tab-btn ${activeTab === 'mission' ? 'active' : ''}`}
            onClick={() => setActiveTab('mission')}
          >
            Our Mission
          </button>
        </div>

        {/* Main Content */}
        <div className="about-content">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              {/* System Features Section */}
              <section className="about-section features-section">
                <h2>🚀 Intelligent Platform Features</h2>
                <p className="section-intro">Comprehensive technological ecosystem engineered for comprehensive pepper plantation management</p>
                <div className="features-grid-enhanced">
                  {[
                    {
                      icon: "🍃",
                      title: "Leaf Analysis",
                      desc: "AI-driven pathological assessment utilizing deep learning for precise disease detection and classification"
                    },
                    {
                      icon: "pepper-logo",
                      title: "Black Pepper Analysis",
                      desc: "Comprehensive ripeness detection and quality assessment using advanced YOLO mechanisms for optimal harvest timing"
                    },
                    {
                      icon: "🌦️",
                      title: "Weather Intelligence",
                      desc: "Real-time meteorological data synthesis for predictive farming decisions and environmental optimization"
                    },
                    {
                      icon: "🗺️",
                      title: "Macromapping",
                      desc: "Spatial data visualization and plantation cartography for systematic crop management"
                    },
                    {
                      icon: "💬",
                      title: "Community Forum",
                      desc: "Collaborative knowledge exchange facilitating farmer networking and best-practice dissemination"
                    }
                  ].map((feature, idx) => (
                    <div 
                      key={idx}
                      className="feature-card-enhanced"
                      onMouseEnter={() => setExpandedCard(idx)}
                      onMouseLeave={() => setExpandedCard(null)}
                    >
                      {feature.icon === "pepper-logo" ? (
                        <img src={logo} alt={feature.title} className="feature-logo-icon" />
                      ) : (
                        <div className="feature-icon-large">{feature.icon}</div>
                      )}
                      <h3>{feature.title}</h3>
                      <p>{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* BLACK PEPPER ANALYSIS TAB */}
          {activeTab === 'pepper' && (
            <div className="tab-content">
              {/* Pepper Overview */}
              <section className="about-section pepper-section">
                <h2>🌶️ Black Pepper: The King of Spices</h2>
                <div className="pepper-intro">
                  <div className="pepper-text">
                    <p className="intro-para">
                      <strong>Piper nigrum</strong>, the quintessential black pepper, stands as a cornerstone of global commerce and culinary excellence. Originating from the Malabar Coast of India, this perennial climbing vine has fundamentally shaped international trade trajectories for over two millennia.
                    </p>
                    <p className="intro-para">
                      Esteemed for its <em>complex pungent alkaloid composition</em>, particularly piperine, black pepper transcends pedestrian culinary utility to exemplify a sophisticated intersection of gastronomic perception and biochemical sophistication.
                    </p>
                  </div>
                  <div className="pepper-image">
                    <img src={logo} alt="Pepper Analysis" />
                  </div>
                </div>
              </section>

              {/* Pepper Statistics */}
              <section className="about-section stats-section">
                <h2>📊 Global Significance Metrics</h2>
                <div className="stats-grid">
                  {pepperStats.map((stat, idx) => (
                    <div key={idx} className="stat-card-interactive">
                      <div className="stat-icon">{stat.icon}</div>
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Pepper Benefits */}
              <section className="about-section benefits-section">
                <h2>🧬 Biochemical & Nutritional Attributes</h2>
                <div className="benefits-grid">
                  {pepperBenefits.map((benefit, idx) => (
                    <div key={idx} className="benefit-card-interactive">
                      <div className="benefit-card-content">
                        <h4>{benefit.title}</h4>
                        <p>{benefit.desc}</p>
                      </div>
                      <div className="benefit-indicator"></div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Agricultural Challenges */}
              <section className="about-section challenges-section">
                <h2>🔍 Cultivation Challenges & PiperSmart Solutions</h2>
                <div className="challenges-table">
                  <div className="challenge-row header">
                    <div className="challenge-col">Challenge</div>
                    <div className="challenge-col">Impact</div>
                    <div className="challenge-col">PiperSmart Solution</div>
                  </div>
                  {[
                    {
                      challenge: "Phytopathogenic Infections",
                      impact: "30-50% yield reduction",
                      solution: "AI-powered early detection & identification"
                    },
                    {
                      challenge: "Climatic Variability",
                      impact: "Unpredictable yield fluctuations",
                      solution: "Real-time weather analytics & forecasting"
                    },
                    {
                      challenge: "Knowledge Fragmentation",
                      impact: "Suboptimal farming practices",
                      solution: "Community-driven knowledge repository"
                    },
                    {
                      challenge: "Spatial Inefficiency",
                      impact: "Resource misallocation",
                      solution: "Precision mapping & resource optimization"
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="challenge-row">
                      <div className="challenge-col">{item.challenge}</div>
                      <div className="challenge-col">{item.impact}</div>
                      <div className="challenge-col">{item.solution}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* MISSION TAB */}
          {activeTab === 'mission' && (
            <div className="tab-content">
              {/* Mission Statement */}
              <section className="about-section mission-section">
                <h2>🎯 Our Foundational Mission</h2>
                <div className="mission-statement">
                  <p className="mission-primary">
                    <strong>PiperSmart</strong> serves as a revolutionary conduit between centuries-old agricultural wisdom and cutting-edge technological innovation, democratizing access to sophisticated crop management methodologies.
                  </p>
                  <p className="mission-secondary">
                    We are fundamentally committed to the <em>triadic imperative</em> of sustainable intensification, disease mitigation, and farmer empowerment—enabling agricultural practitioners to transcend traditional limitations and actualize their productive potential through evidence-based decision frameworks.
                  </p>
                </div>
              </section>

              {/* Vision Statement */}
              <section className="about-section vision-section">
                <h2>✨ Our Vision</h2>
                <div className="vision-statement">
                  <p>
                    To catalyze a paradigmatic shift in black pepper cultivation by fostering an <strong>interconnected ecosystem</strong> wherein data-driven insights, collaborative knowledge exchange, and technological sophistication converge to establish global benchmarks for agricultural excellence, sustainability, and farmer prosperity.
                  </p>
                </div>
              </section>

              {/* Core Values */}
              <section className="about-section values-section">
                <h2>💎 Core Organizational Values</h2>
                <div className="values-grid">
                  {[
                    { title: "Innovation", desc: "Perpetual technological advancement and creative problem-solving" },
                    { title: "Sustainability", desc: "Environmental stewardship and long-term agricultural viability" },
                    { title: "Collaboration", desc: "Community-centric approach to collective farmer empowerment" },
                    { title: "Integrity", desc: "Transparent operations and unwavering commitment to farmer welfare" },
                    { title: "Excellence", desc: "Relentless pursuit of quality and continuous improvement" },
                    { title: "Accessibility", desc: "Democratized technology for farmers across diverse contexts" }
                  ].map((value, idx) => (
                    <div key={idx} className="value-card">
                      <h4>{value.title}</h4>
                      <p>{value.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Developers Section */}
              <section className="about-section developers-section">
                <h2>👨‍💻 Development Team</h2>
                <p className="team-intro">Visionary technologists dedicated to agricultural transformation</p>
                <div className="developers-list">
                  {[
                    "Even Lloyd S. Billoned",
                    "Yhanskie Adriel D. Cipriano",
                    "Jenard D. Inojales",
                    "Lord Cedric O. Villa"
                  ].map((dev, idx) => (
                    <div key={idx} className="developer-card">
                      <div className="dev-avatar">{dev.charAt(0)}</div>
                      <h3>{dev}</h3>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Call to Action Section */}
          <section className="about-section cta-section">
            <h2>🚀 Embark on Your Agricultural Transformation</h2>
            <p>Join an ecosystem of progressive farmers revolutionizing black pepper cultivation through intelligent technology</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary-enhanced">Commence Journey</Link>
              <Link to="/forum" className="btn-secondary-enhanced">Explore Community</Link>
              <Link to="/leaf-analysis" className="btn-tertiary-enhanced">Experience Platform</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
