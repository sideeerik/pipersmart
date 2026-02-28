import { useState, useEffect } from 'react';
import './Knowledge.css';
import { Link } from 'react-router-dom';
import Header from '../shared/Header';
import Footer from '../shared/Footer';

export default function Knowledge() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchLatestNews();
  }, []);

  const fetchLatestNews = async () => {
    setLoadingNews(true);
    try {
      // Fetch from backend - the backend should have an endpoint that gets news from chatbot/API
      const response = await fetch('http://localhost:5000/api/v1/news/latest', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNews(data.news || getDefaultNews());
      } else {
        // Fallback to default news if API fails
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
      {
        id: 1,
        title: 'Global Black Pepper Market Growth Trends 2024',
        date: 'January 2024',
        description: 'The global black pepper market is expected to grow at a CAGR of 5.2% from 2024 to 2030, driven by increasing demand for natural spices and organic farming practices.',
        link: 'https://example.com/pepper-market-trends',
        source: 'Agricultural News',
      },
      {
        id: 2,
        title: 'Sustainable Black Pepper Farming Practices',
        date: 'December 2023',
        description: 'New research highlights the importance of sustainable practices in black pepper cultivation, including organic fertilizers and integrated pest management.',
        link: 'https://example.com/sustainable-farming',
        source: 'Environmental Agriculture',
      },
      {
        id: 3,
        title: 'Disease Resistance Varieties Released',
        date: 'November 2023',
        description: 'Agricultural universities have released new black pepper varieties with enhanced resistance to Footrot and Pollu diseases.',
        link: 'https://example.com/disease-resistant-varieties',
        source: 'Research Updates',
      },
      {
        id: 4,
        title: 'Climate Impact on Black Pepper Production',
        date: 'October 2023',
        description: 'Climate change is affecting black pepper yields globally. Experts recommend adaptive farming strategies and water management techniques.',
        link: 'https://example.com/climate-impact',
        source: 'Climate & Agriculture',
      },
    ];
  };

  const toggleExpandSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const tabs = [
    { id: 'overview', label: '📚 Overview', icon: '📚' },
    { id: 'botanical', label: '🌱 Botanical Information', icon: '🌱' },
    { id: 'cultivation', label: '🌾 Cultivation Guide', icon: '🌾' },
    { id: 'diseases', label: '🔍 Disease Management', icon: '🔍' },
    { id: 'benefits', label: '💪 Health Benefits', icon: '💪' },
    { id: 'news', label: '📰 News & Resources', icon: '📰' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="content-section">
            <h2 className="section-title">🌿 What is Black Pepper?</h2>
            <div className="overview-hero">
              <div className="overview-text">
                <p className="large-intro">
                  Black pepper (Piper nigrum) is a flowering vine in the family Piperaceae, cultivated for its fruit, commonly known as peppercorns or black pepper. It is the world's most traded spice and is widely used as a seasoning and spice across all cuisines.
                </p>
              </div>
            </div>

            <div className="content-grid">
              <div className="content-card expandable">
                <h3 onClick={() => toggleExpandSection('history')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['history'] ? '▼' : '▶'}</span>
                  🏛️ Historical Significance
                </h3>
                {expandedSections['history'] && (
                  <div className="expandable-content">
                    <p>
                      Black pepper has been used for thousands of years in Asian cuisine and traditional medicine. Known as "black gold" in medieval Europe, it was once so valuable that it was used as currency in trade routes. The spice trade shaped world history and commerce for centuries.
                    </p>
                    <p className="highlight">
                      💡 Fun Fact: Pepper was so valuable in the Middle Ages that it was literally worth more than gold by weight!
                    </p>
                  </div>
                )}
              </div>

              <div className="content-card expandable">
                <h3 onClick={() => toggleExpandSection('production')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['production'] ? '▼' : '▶'}</span>
                  🌍 Global Production
                </h3>
                {expandedSections['production'] && (
                  <div className="expandable-content">
                    <p>
                      Vietnam, India, and Indonesia are the world's leading producers of black pepper. The global black pepper market is valued at billions of dollars annually, making it one of the most economically important spices worldwide.
                    </p>
                    <div className="stats-box">
                      <div className="stat">
                        <h4>Vietnam</h4>
                        <p>35-40% of world production</p>
                      </div>
                      <div className="stat">
                        <h4>India</h4>
                        <p>25-30% of world production</p>
                      </div>
                      <div className="stat">
                        <h4>Indonesia</h4>
                        <p>15-20% of world production</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="content-card expandable">
                <h3 onClick={() => toggleExpandSection('economic')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['economic'] ? '▼' : '▶'}</span>
                  💰 Economic Importance
                </h3>
                {expandedSections['economic'] && (
                  <div className="expandable-content">
                    <p>
                      For many farmers, especially in tropical regions, black pepper cultivation provides a stable income source. High-quality black pepper can command premium prices in international markets.
                    </p>
                    <ul className="info-list">
                      <li>💵 Global market value: $3-4 billion annually</li>
                      <li>📈 Growing demand from food & beverage industry</li>
                      <li>🌱 Premium organic pepper commands 30-50% price premium</li>
                      <li>🚚 Consistent international demand</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="cta-section">
              <h3>Ready to Start Growing?</h3>
              <p>Explore our cultivation guide to learn everything about farming black pepper.</p>
              <button onClick={() => setActiveTab('cultivation')} className="btn-primary">
                📚 View Cultivation Guide
              </button>
            </div>
          </div>
        );

      case 'botanical':
        return (
          <div className="content-section">
            <h2 className="section-title">🌱 Botanical Information</h2>
            
            <div className="botanical-intro">
              <div className="intro-card">
                <h3>Scientific Classification</h3>
                <table className="classification-table">
                  <tbody>
                    <tr>
                      <td><strong>Kingdom:</strong></td>
                      <td>Plantae</td>
                    </tr>
                    <tr>
                      <td><strong>Family:</strong></td>
                      <td>Piperaceae</td>
                    </tr>
                    <tr>
                      <td><strong>Genus:</strong></td>
                      <td>Piper</td>
                    </tr>
                    <tr>
                      <td><strong>Species:</strong></td>
                      <td>P. nigrum</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="content-grid">
              <div className="content-card expandable">
                <h3 onClick={() => toggleExpandSection('structure')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['structure'] ? '▼' : '▶'}</span>
                  🌿 Plant Structure
                </h3>
                {expandedSections['structure'] && (
                  <div className="expandable-content">
                    <p>
                      Black pepper is a perennial woody vine that grows 3-4 meters tall. It has heart-shaped leaves and produces small white flowers that develop into berries.
                    </p>
                    <ul className="info-list">
                      <li><strong>Vine Height:</strong> 3-4 meters (can reach higher with support)</li>
                      <li><strong>Leaf Type:</strong> Heart-shaped, alternate arrangement</li>
                      <li><strong>Flowers:</strong> Small white flowers in spikes</li>
                      <li><strong>Fruit:</strong> Berries turn red when mature</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="content-card expandable">
                <h3 onClick={() => toggleExpandSection('lifecycle')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['lifecycle'] ? '▼' : '▶'}</span>
                  📅 Growth Cycle
                </h3>
                {expandedSections['lifecycle'] && (
                  <div className="expandable-content">
                    <div className="timeline">
                      <div className="timeline-item">
                        <div className="timeline-marker year-1"></div>
                        <h4>Year 1-2: Establishment</h4>
                        <p>Vine development and root establishment</p>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-marker year-2"></div>
                        <h4>Year 3: First Fruiting</h4>
                        <p>First flowering and initial fruit production</p>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-marker year-3"></div>
                        <h4>Year 4-20+: Peak Production</h4>
                        <p>Maximum yield period (can produce for 20-30 years)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="content-card expandable">
                <h3 onClick={() => toggleExpandSection('climate')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['climate'] ? '▼' : '▶'}</span>
                  🌡️ Climate Requirements
                </h3>
                {expandedSections['climate'] && (
                  <div className="expandable-content">
                    <div className="requirements-grid">
                      <div className="req-box">
                        <h4>🌡️ Temperature</h4>
                        <p className="highlight">20-30°C (optimal)</p>
                      </div>
                      <div className="req-box">
                        <h4>💧 Rainfall</h4>
                        <p className="highlight">200-250 cm annually</p>
                      </div>
                      <div className="req-box">
                        <h4>💨 Humidity</h4>
                        <p className="highlight">70-80%</p>
                      </div>
                      <div className="req-box">
                        <h4>⛰️ Elevation</h4>
                        <p className="highlight">Up to 1,500 meters</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="content-card expandable">
                <h3 onClick={() => toggleExpandSection('soil')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['soil'] ? '▼' : '▶'}</span>
                  🌍 Soil Conditions
                </h3>
                {expandedSections['soil'] && (
                  <div className="expandable-content">
                    <div className="requirements-grid">
                      <div className="req-box">
                        <h4>pH Level</h4>
                        <p className="highlight">5.5-7.0</p>
                        <small>(slightly acidic)</small>
                      </div>
                      <div className="req-box">
                        <h4>Soil Type</h4>
                        <p className="highlight">Loamy</p>
                        <small>Well-draining</small>
                      </div>
                      <div className="req-box">
                        <h4>Organic Matter</h4>
                        <p className="highlight">Rich</p>
                        <small>15-20% recommended</small>
                      </div>
                      <div className="req-box">
                        <h4>Drainage</h4>
                        <p className="highlight">Excellent</p>
                        <small>Avoid waterlogging</small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'cultivation':
        return (
          <div className="content-section">
            <h2 className="section-title">🌾 Cultivation Guide</h2>

            <div className="cultivation-steps">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Land Preparation</h3>
                <p>Clear land and add 20-25 tons of organic manure per hectare. Ensure good drainage system.</p>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Spacing & Support</h3>
                <p>Plant 2m x 2m or 2m x 3m apart (2,500-3,000 plants per hectare). Erect support structures.</p>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Planting</h3>
                <p>Plant during monsoon (June-July) using cuttings or rooted vine cuttings for faster establishment.</p>
              </div>

              <div className="step-card">
                <div className="step-number">4</div>
                <h3>Maintenance</h3>
                <p>Regular watering, fertilizing, and weeding. Monitor for pests and diseases throughout the year.</p>
              </div>

              <div className="step-card">
                <div className="step-number">5</div>
                <h3>Harvesting</h3>
                <p>Harvest December-February when berries turn red/dark. Hand-pick for best quality.</p>
              </div>

              <div className="step-card">
                <div className="step-number">6</div>
                <h3>Processing</h3>
                <p>Dry pepper to achieve proper moisture content and quality grade for market sale.</p>
              </div>
            </div>

            <div className="content-grid">
              <div className="content-card expandable">
                <h3 onClick={() => toggleExpandSection('fertilizer')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['fertilizer'] ? '▼' : '▶'}</span>
                  🌱 Fertilizer Schedule
                </h3>
                {expandedSections['fertilizer'] && (
                  <div className="expandable-content">
                    <table className="schedule-table">
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>FYM/Manure</th>
                          <th>N-P-K</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Year 1</strong></td>
                          <td>5 kg/plant</td>
                          <td>-</td>
                        </tr>
                        <tr>
                          <td><strong>Year 2-3</strong></td>
                          <td>10-15 kg/plant</td>
                          <td>50g-25g-50g</td>
                        </tr>
                        <tr>
                          <td><strong>Year 4+</strong></td>
                          <td>15-20 kg/plant</td>
                          <td>100g-50g-100g</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="note">💡 Apply in two splits: May and August</p>
                  </div>
                )}
              </div>

              <div className="content-card expandable">
                <h3 onClick={() => toggleExpandSection('watering')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['watering'] ? '▼' : '▶'}</span>
                  💧 Watering Schedule
                </h3>
                {expandedSections['watering'] && (
                  <div className="expandable-content">
                    <ul className="info-list">
                      <li><strong>Rainy Season:</strong> Minimal watering; ensure good drainage</li>
                      <li><strong>Dry Season:</strong> Regular watering every 7-10 days</li>
                      <li><strong>Mature Plants:</strong> 1,000-1,500 liters per plant annually</li>
                      <li><strong>⚠️ Warning:</strong> Avoid waterlogging at all costs</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="content-card expandable large">
              <h3 onClick={() => toggleExpandSection('checklist')} className="expandable-header">
                <span className="expand-icon">{expandedSections['checklist'] ? '▼' : '▶'}</span>
                ✅ Best Practices Checklist
              </h3>
              {expandedSections['checklist'] && (
                <div className="expandable-content">
                  <div className="checklist">
                    <label><input type="checkbox" /> Ensure good drainage to prevent root rot</label>
                    <label><input type="checkbox" /> Provide adequate support structures</label>
                    <label><input type="checkbox" /> Maintain soil pH between 5.5-7.0</label>
                    <label><input type="checkbox" /> Follow organic mulching practices</label>
                    <label><input type="checkbox" /> Implement integrated pest management</label>
                    <label><input type="checkbox" /> Monitor for disease symptoms regularly</label>
                    <label><input type="checkbox" /> Keep records of fertilizer applications</label>
                    <label><input type="checkbox" /> Harvest at peak maturity for best quality</label>
                  </div>
                </div>
              )}
            </div>

            <div className="yield-info">
              <h3>🎯 Expected Yield</h3>
              <div className="yield-stat">
                <h4>3-5 tons</h4>
                <p>dry pepper per hectare (mature plantation)</p>
              </div>
            </div>
          </div>
        );

      case 'diseases':
        return (
          <div className="content-section">
            <h2 className="section-title">🔍 Disease Management</h2>
            <p className="section-intro">
              Black pepper is susceptible to several diseases. Early detection is crucial. Use our Leaf Analysis Tool to identify diseases quickly.
            </p>

            <div className="disease-cards">
              <div className="disease-card expandable">
                <h3 onClick={() => toggleExpandSection('footrot')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['footrot'] ? '▼' : '▶'}</span>
                  🦠 Footrot Disease (Quick Wilt)
                </h3>
                {expandedSections['footrot'] && (
                  <div className="expandable-content">
                    <div className="disease-details">
                      <div className="detail-box red">
                        <h4>Cause</h4>
                        <p>Fungal infection (Phytophthora)</p>
                      </div>
                      <div className="detail-box orange">
                        <h4>Symptoms</h4>
                        <p>Wilting leaves, blackening of vines, sudden death</p>
                      </div>
                      <div className="detail-box green">
                        <h4>Prevention</h4>
                        <p>Proper drainage, avoid waterlogging, resistant varieties</p>
                      </div>
                      <div className="detail-box blue">
                        <h4>Treatment</h4>
                        <p>Remove infected plants, fungicide application, improve drainage</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="disease-card expandable">
                <h3 onClick={() => toggleExpandSection('pollu')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['pollu'] ? '▼' : '▶'}</span>
                  🌿 Pollu Disease
                </h3>
                {expandedSections['pollu'] && (
                  <div className="expandable-content">
                    <div className="disease-details">
                      <div className="detail-box red">
                        <h4>Cause</h4>
                        <p>Fungal pathogen (Colletotrichum)</p>
                      </div>
                      <div className="detail-box orange">
                        <h4>Symptoms</h4>
                        <p>Leaf spots, stem lesions, premature defoliation</p>
                      </div>
                      <div className="detail-box green">
                        <h4>Prevention</h4>
                        <p>Remove infected parts, improve air circulation, avoid overhead watering</p>
                      </div>
                      <div className="detail-box blue">
                        <h4>Treatment</h4>
                        <p>Fungicide sprays, pruning of affected branches</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="disease-card expandable">
                <h3 onClick={() => toggleExpandSection('virus')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['virus'] ? '▼' : '▶'}</span>
                  🦟 Yellow Mottle Virus
                </h3>
                {expandedSections['virus'] && (
                  <div className="expandable-content">
                    <div className="disease-details">
                      <div className="detail-box red">
                        <h4>Cause</h4>
                        <p>Viral infection spread by whiteflies</p>
                      </div>
                      <div className="detail-box orange">
                        <h4>Symptoms</h4>
                        <p>Yellow mottling on leaves, stunted growth, reduced yield</p>
                      </div>
                      <div className="detail-box green">
                        <h4>Prevention</h4>
                        <p>Use virus-free planting material, control whitefly population</p>
                      </div>
                      <div className="detail-box blue">
                        <h4>Treatment</h4>
                        <p>No cure; remove and destroy infected plants, control insect vectors</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="cta-card">
              <h3>🔍 Spot a Disease? Use Our Leaf Analysis Tool</h3>
              <p>Upload a photo of your plant and our AI will identify the issue instantly.</p>
              <Link to="/leaf-analysis" className="btn-primary">
                🔍 Analyze Plant Leaf
              </Link>
            </div>
          </div>
        );

      case 'benefits':
        return (
          <div className="content-section">
            <h2 className="section-title">💪 Health Benefits of Black Pepper</h2>

            <div className="content-grid">
              <div className="content-card expandable">
                <h3 onClick={() => toggleExpandSection('compounds')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['compounds'] ? '▼' : '▶'}</span>
                  🧪 Active Compounds
                </h3>
                {expandedSections['compounds'] && (
                  <div className="expandable-content">
                    <div className="compound-box highlight">
                      <h4>Piperine (5-10% by weight)</h4>
                      <p>The primary alkaloid responsible for pepper's pungent taste and most health benefits</p>
                    </div>
                    <p className="info-text">Other important compounds:</p>
                    <ul className="info-list">
                      <li>🌿 Essential oils</li>
                      <li>⛰️ Minerals: Manganese, Copper, Chromium</li>
                      <li>💊 Vitamins: K, C, and B vitamins</li>
                      <li>🛡️ Antioxidants and polyphenols</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="content-card expandable">
                <h3 onClick={() => toggleExpandSection('medical')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['medical'] ? '▼' : '▶'}</span>
                  💊 Medicinal Properties
                </h3>
                {expandedSections['medical'] && (
                  <div className="expandable-content">
                    <div className="benefits-list">
                      <div className="benefit-item">
                        <span className="benefit-icon">🔥</span>
                        <div>
                          <h4>Anti-inflammatory</h4>
                          <p>Reduces inflammation in the body</p>
                        </div>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">🛡️</span>
                        <div>
                          <h4>Antioxidant</h4>
                          <p>Fights free radicals and oxidative stress</p>
                        </div>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">🍽️</span>
                        <div>
                          <h4>Improves Digestion</h4>
                          <p>Enhances gastric juice production</p>
                        </div>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">⚡</span>
                        <div>
                          <h4>Nutrient Absorption</h4>
                          <p>Increases bioavailability of other nutrients</p>
                        </div>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">🦴</span>
                        <div>
                          <h4>Bone Health</h4>
                          <p>Supports mineral absorption and bone density</p>
                        </div>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">🧠</span>
                        <div>
                          <h4>Brain Health</h4>
                          <p>May support cognitive function</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="content-card expandable">
                <h3 onClick={() => toggleExpandSection('culinary')} className="expandable-header">
                  <span className="expand-icon">{expandedSections['culinary'] ? '▼' : '▶'}</span>
                  🍽️ Culinary Uses
                </h3>
                {expandedSections['culinary'] && (
                  <div className="expandable-content">
                    <p>Black pepper is the most commonly used spice worldwide:</p>
                    <ul className="info-list">
                      <li>🍲 Savory dishes and everyday seasonings</li>
                      <li>🍖 Marinades and meat rubs</li>
                      <li>🧂 Sauces and gravies</li>
                      <li>☕ Beverages and health drinks</li>
                      <li>🥘 Spice blends and curry powders</li>
                      <li>🍪 Even in some sweet dishes</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'news':
        return (
          <div className="content-section">
            <h2 className="section-title">📰 Latest News & Resources</h2>
            
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {loadingNews && <div className="loading">Loading latest news...</div>}

            <div className="news-grid">
              {news.map((newsItem) => (
                <a
                  key={newsItem.id}
                  href={newsItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-card"
                >
                  <div className="news-header">
                    <h3>{newsItem.title}</h3>
                    <span className="news-source">{newsItem.source}</span>
                  </div>
                  <p className="news-date">📅 {newsItem.date}</p>
                  <p className="news-desc">{newsItem.description}</p>
                  <div className="read-more">Read Full Article →</div>
                </a>
              ))}
            </div>

            <div className="content-card large">
              <h3>📚 Recommended Resources</h3>
              <div className="resources-list">
                <a href="https://www.fao.org/agriculture" target="_blank" rel="noopener noreferrer" className="resource-item">
                  <span className="resource-icon">🌐</span>
                  <div>
                    <h4>FAO Guide to Spice Cultivation</h4>
                    <p>Food and Agriculture Organization resources</p>
                  </div>
                </a>
                <a href="https://www.indianspices.com" target="_blank" rel="noopener noreferrer" className="resource-item">
                  <span className="resource-icon">🌐</span>
                  <div>
                    <h4>Indian Spice Board</h4>
                    <p>Official spice production statistics and guidelines</p>
                  </div>
                </a>
                <a href="https://scholar.google.com" target="_blank" rel="noopener noreferrer" className="resource-item">
                  <span className="resource-icon">🌐</span>
                  <div>
                    <h4>Google Scholar</h4>
                    <p>Academic research papers and studies</p>
                  </div>
                </a>
                <a href="https://www.sustainableagriculture.org" target="_blank" rel="noopener noreferrer" className="resource-item">
                  <span className="resource-icon">🌐</span>
                  <div>
                    <h4>Sustainable Agriculture Network</h4>
                    <p>Best practices for sustainable farming</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="knowledge-container">
        {/* Hero Section */}
        <div className="knowledge-hero">
          <h1>🌿 Learn About Black Pepper</h1>
          <p>Complete guide to black pepper farming, benefits, and cultivation</p>
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
            <Link to="/bunga-analysis" className="link-card">
              <span className="card-icon">🫒</span>
              <h4>Bunga Analysis</h4>
              <p>Check ripeness & health grade</p>
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
