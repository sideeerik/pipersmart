  import { useState } from 'react';
  import { Link } from 'react-router-dom';
  import { motion } from 'framer-motion';
  import './Index.css';
  import Header from '../shared/Header';
  import Footer from '../shared/Footer';
  import Chat from '../Chat/Chat';
  import bp1 from '../../../../picturesofbp/bp1.jpg';
  import bp2 from '../../../../picturesofbp/bp2.jpg';
  import bp3 from '../../../../picturesofbp/bp3.jpg';

  export default function Index() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
      {
        title: 'Black Pepper Disease Detection',
        description: 'Advanced AI-powered analysis for early disease detection in black pepper crops',
        image: bp1,
      },
      {
        title: 'Protect Your Crops',
        description: 'Identify diseases early and take preventive measures to save your harvest',
        image: bp2,
      },
      {
        title: 'Smart Farming Solutions',
        description: 'Using machine learning to support sustainable pepper farming practices',
        image: bp3,
      },
    ];

    const nextSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const features = [
      {
        title: 'Disease Detection',
        description: 'Advanced AI analysis of pepper leaves for disease identification',
        image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=500&h=400&fit=crop',
        icon: '🔍',
      },
      {
        title: 'Expert Analysis',
        description: 'Get comprehensive disease analysis and treatment recommendations',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=400&fit=crop',
        icon: '📊',
      },
      {
        title: 'Smart Solutions',
        description: 'Access PiperSmart on any device, anywhere on your farm',
        image: 'https://images.unsplash.com/photo-1512941691920-25bdb67c3201?w=500&h=400&fit=crop',
        icon: '📱',
      },
    ];

    const steps = [
      { number: 1, title: 'Capture Image', description: 'Take a photo of the affected pepper leaf' },
      { number: 2, title: 'Upload', description: 'Upload the image to PiperSmart' },
      { number: 3, title: 'AI Analysis', description: 'Our AI analyzes the image instantly' },
      { number: 4, title: 'Get Results', description: 'Receive disease diagnosis and treatment advice' },
    ];

    return (
      <div className="w-full bg-white">
        {/* Header */}
        <Header />

        {/* Hero Carousel */}
        <section className="hero">
          <div className="carousel">
            <div 
              className="carousel-slide" 
              style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            />
            <div className="carousel-overlay">
              <div className="carousel-content">
                <motion.h2
                  key={`title-${currentSlide}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.5 }}
                >
                  {slides[currentSlide].title}
                </motion.h2>
                <motion.p
                  key={`desc-${currentSlide}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {slides[currentSlide].description}
                </motion.p>
                <motion.div
                  className="carousel-btn-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Link to="/leaf-analysis" className="btn-primary">
                    Get Started ✨
                  </Link>
                  <button 
                    onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
                    className="btn-secondary"
                  >
                    Learn More 📚
                  </button>
                </motion.div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button 
              className="carousel-btn prev" 
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              ❮
            </button>
            <button 
              className="carousel-btn next" 
              onClick={nextSlide}
              aria-label="Next slide"
            >
              ❯
            </button>

            {/* Indicators */}
            <div className="carousel-indicators">
              {slides.map((_, index) => (
                <motion.button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="about py-20 md:py-32 px-6 max-w-6xl mx-auto" id="about">
          <div className="about-content-wrapper">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <img 
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=600&h=500&fit=crop" 
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
              <h3 className="text-primary-600 text-sm font-bold tracking-widest mb-4 uppercase">
                About PiperSmart
              </h3>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Empowering Farmers with AI
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
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

        {/* Features Section */}
        <section className="features py-20 md:py-32 px-6 bg-gradient-to-br from-gray-50 to-gray-100" id="features">
          <div className="features-section max-w-6xl mx-auto">
            <motion.h2
              className="features-title section-title text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Key Features
            </motion.h2>

            <div className="features-grid">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="feature-item"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="feature-img"
                  />
                  <div style={{ padding: '1.5rem' }}>
                    <div className="text-4xl mb-4 text-center" style={{ lineHeight: '1' }}>{feature.icon}</div>
                    <h3 className="text-2xl font-bold text-primary-600 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-base">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works py-20 md:py-32 px-6 max-w-6xl mx-auto" id="how-it-works">
          <motion.h2
            className="how-it-works-title section-title text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>

          <div className="steps-grid">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                className="step"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, borderColor: '#22c55e' }}
              >
                <motion.div
                  className="step-number"
                  whileHover={{ scale: 1.1, rotateZ: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {step.number}
                </motion.div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <motion.section
          className="cta"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Protect Your Pepper Crops?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join thousands of farmers using PiperSmart
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link to="/register" className="btn-primary">
              Get Started Today 🚀
            </Link>
          </motion.div>
        </motion.section>

        {/* Footer */}
        <Footer />

        {/* Floating Chat Widget */}
        <Chat />
      </div>
    );
  }
