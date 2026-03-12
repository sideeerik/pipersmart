import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Index.css';
import Header from '../shared/Header';
import Hero from '../shared/Hero';
import Footer from '../shared/Footer';
import logo from '../../../../picturesofbp/logowalangbg.png';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginNote, setShowLoginNote] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsLoggedIn(Boolean(token && userData));
  }, []);

  const handleProtectedClick = (event) => {
    if (isLoggedIn) return;
    event.preventDefault();
    event.stopPropagation();
    setShowLoginNote(true);
  };
  const featuresList = [
    {
      icon: '🍃',
      title: 'Leaf Analysis',
      description: 'Leaf Disease Detection',
      link: '/leaf-analysis',
      accent: '#57e18c'
    },
    {
      icon: '🔬',
      title: 'Peppercorn Analysis',
      description: 'Ripeness and Health Percentage Detection',
      link: '/peppercorn-analysis',
      accent: '#7cc4ff'
    },
    {
      icon: '🗺️',
      title: 'Macromapping',
      description: 'Spatial visualization, location saving, location details & route guidance',
      link: '/macro-mapping',
      accent: '#f4c36f'
    },
    {
      icon: '💬',
      title: 'Community Forum',
      description: 'Collaborative knowledge exchange',
      link: '/forum',
      accent: '#90e0ff'
    }
  ];

  const howItWorksSteps = [
    {
      title: 'Choose',
      description: 'Pick the tool that matches your task, from leaf checks to community support.',
      icon: '✅'
    },
    {
      title: 'Capture',
      description: 'Take a clear photo of the leaf or peppercorn you want to analyze.',
      icon: '📷'
    },
    {
      title: 'Analyze',
      description: 'Our AI scans the image and extracts health, ripeness, and disease signals.',
      icon: '🧠'
    },
    {
      title: 'Shows Results',
      description: 'Receive an easy-to-read diagnosis with confidence indicators.',
      icon: '📊'
    },
    {
      title: 'Advice',
      description: 'Get practical next steps, treatment tips, and prevention guidance.',
      icon: '💡'
    }
  ];

  return (
    <div className="page-wrapper">
      {/* Dark Theme Background */}
      <div className="page-background">
        <div className="background-overlay"></div>
      </div>

      <div className="page-floating-leaves" aria-hidden="true">
        <div className="page-leaf leaf-a">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
        </div>
        <div className="page-leaf leaf-b">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c4-4 8-7.5 8-12 0-3.5-2.5-6-6-6s-6 2.5-6 6c0 4.5 4 8 8 12z"/></svg>
        </div>
        <div className="page-leaf leaf-c">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.33.26 2.61.74 3.77l-1.89.66c-.6-1.41-.85-2.93-.85-4.43 0-4.97 4.03-9 9-9s9 4.03 9 9c0 1.5-.25 3.02-.85 4.43l-1.89-.66c.48-1.16.74-2.44.74-3.77 0-5.52-4.48-10-10-10z"/></svg>
        </div>
        <div className="page-leaf leaf-d">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
        </div>
        <div className="page-leaf leaf-e">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c4-4 8-7.5 8-12 0-3.5-2.5-6-6-6s-6 2.5-6 6c0 4.5 4 8 8 12z"/></svg>
        </div>
        <div className="page-leaf leaf-f">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.33.26 2.61.74 3.77l-1.89.66c-.6-1.41-.85-2.93-.85-4.43 0-4.97 4.03-9 9-9s9 4.03 9 9c0 1.5-.25 3.02-.85 4.43l-1.89-.66c.48-1.16.74-2.44.74-3.77 0-5.52-4.48-10-10-10z"/></svg>
        </div>
      </div>

      {/* Header */}
      <Header />

      {/* Hero Section - Bio-Tech Glassmorphism */}
      <Hero />

      {/* About Section */}
      <section className="about" id="about">
        <div className="about-content-wrapper">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="about-visual"
          >
            <img 
              src={logo}
              alt="Smart Farming"
              className="about-illustration"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="about-content"
          >
            <h3 className="text-sm font-bold tracking-widest mb-4 uppercase">
              About PiperSmart
            </h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Empowering <br />
              <span className="about-highlight">Farmers</span> with <span className="about-highlight">AI</span>
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              PiperSmart is an innovative agricultural technology solution designed to help pepper farmers
              detect and manage diseases in their crops using advanced artificial intelligence and machine learning.
              Our platform provides early disease detection, enabling farmers to take timely action and protect their harvests.
            </p>
            <motion.a 
              href="#features" 
              className="read-more"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.3 }}
            >
              Read more →
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Explore Our Features Section */}
      <section className="explore-features" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="explore-header">
            <div className="explore-kicker">Explore</div>
            <motion.h2
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Explore Our Features
            </motion.h2>
            <p className="section-subtitle">
              A complete toolkit for smarter pepper farming, from detection to collaboration.
            </p>
          </div>
          {!isLoggedIn && (
            <div className={`login-note ${showLoginNote ? 'active' : ''}`} role="status" aria-live="polite">
              <div className="login-note-text">
                Please log in first to access all features.
              </div>
              {showLoginNote && (
                <div className="login-note-actions">
                  <Link to="/login" className="login-note-link">Go to login</Link>
                  <button type="button" className="login-note-cancel" onClick={() => setShowLoginNote(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="explore-grid">
            {featuresList.map((feature, idx) => (
              <Link
                key={idx}
                to={feature.link}
                className={`feature-card ${!isLoggedIn ? 'feature-card-locked' : ''}`}
                style={{ '--accent': feature.accent }}
                aria-label={feature.title}
                aria-disabled={!isLoggedIn}
                onClick={handleProtectedClick}
              >
                <span className="feature-icon" aria-hidden="true">
                  {feature.icon}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="how-it-works-inner">
          <motion.h2
            className="how-it-works-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <p className="how-it-works-subtitle">
            Choose, capture, analyze, view results, and get advice in minutes.
          </p>
          <div className="steps-grid">
            {howItWorksSteps.map((step, idx) => (
              <div key={step.title} className="step">
                <div className="step-number">{idx + 1}</div>
                <div className="step-icon" aria-hidden="true">{step.icon}</div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Get Started? Section */}
      {!isLoggedIn && (
        <section className="cta-section">
          <div className="cta-content">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Start analyzing your pepper plants today and protect your harvest
            </motion.p>
            <motion.div
              className="cta-buttons"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Link
                to="/leaf-analysis"
                className={`cta-btn-primary ${!isLoggedIn ? 'cta-btn-disabled' : ''}`}
                aria-disabled={!isLoggedIn}
                onClick={handleProtectedClick}
              >
                Try Leaf Analysis
              </Link>
              <Link to="/register" className="cta-btn-secondary">
                Create Account
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}






