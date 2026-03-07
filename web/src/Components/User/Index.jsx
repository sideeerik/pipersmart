import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Index.css';
import Header from '../shared/Header';
import Hero from '../shared/Hero';
import Footer from '../shared/Footer';
import logo from '../../../../picturesofbp/logowalangbg.png';

export default function Index() {
const featuresList = [
    {
      title: 'Leaf Analysis',
      description: 'Upload photos of pepper leaves for disease detection and identification',
      link: '/leaf-analysis',
      icon: '🍃'
    },
    {
      title: 'Bunga Analysis',
      description: 'Analyze pepper flowers and fruits for health assessment and ripeness detection',
      link: '/bunga-analysis',
      icon: '🌸'
    },
    {
      title: 'Weather Updates',
      description: 'Get real-time weather information for your farming area',
      link: '/weather',
      icon: '🌤️'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other farmers and share experiences',
      link: '/forum',
      icon: '💬'
    },
    {
      title: 'Macromapping',
      description: 'Visualize your plantation with advanced mapping tools',
      link: '/macro-mapping',
      icon: '🗺️'
    }
  ];

  return (
    <div className="page-wrapper">
      {/* Dark Theme Background with Image */}
      <div className="page-background">
        <img 
          src="/paminta.webp" 
          alt="Background" 
          className="background-image" 
        />
        <div className="background-overlay"></div>
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
            className="flex justify-center"
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
              Empowering Farmers with AI
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
      <section className="explore-features">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Explore Our Features
          </motion.h2>

          <div className="features-grid">
            {featuresList.map((feature, idx) => (
              <Link key={idx} to={feature.link} className="feature-card">
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Get Started? Section */}
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
            <Link to="/leaf-analysis" className="cta-btn-primary">
              Try Leaf Analysis
            </Link>
            <Link to="/register" className="cta-btn-secondary">
              Create Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
