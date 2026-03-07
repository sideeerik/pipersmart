import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Hero.css';

// Carousel media items
const carouselMedia = [
  { type: 'video', src: '/newbg.mp4', duration: null }, // Will auto-advance when video ends
  { type: 'video', src: '/watermarked_preview.mp4', duration: null },
  { type: 'image', src: '/paminta.webp', duration: 2000 }, // 2 seconds
  { type: 'image', src: '/plant.jpg', duration: 2000 }, // 2 seconds
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef(null);

  const currentMedia = carouselMedia[currentIndex];

  // Handle video ended event
  const handleVideoEnded = () => {
    goToNext();
  };

  // Go to next slide
  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % carouselMedia.length);
  };

  // Go to previous slide
  const goToPrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + carouselMedia.length) % carouselMedia.length);
  };

  // Handle transition complete
  const handleTransitionComplete = () => {
    setIsTransitioning(false);
  };

  // Set up timer for image slides
  useEffect(() => {
    if (currentMedia.type === 'image' && currentMedia.duration) {
      const timer = setTimeout(() => {
        goToNext();
      }, currentMedia.duration);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentMedia.type, currentMedia.duration]);

  // Auto-slide carousel every 2 seconds
  useEffect(() => {
    const autoSlideTimer = setInterval(() => {
      goToNext();
    }, 2000);
    return () => clearInterval(autoSlideTimer);
  }, [isTransitioning]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (video && currentMedia.type === 'video') {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, [currentIndex]);

  return (
    <section className="hero-section">
      {/* Background */}
      <div className="hero-background">
        <div className="hero-gradient-bg"></div>
        <div className="hero-pattern"></div>
      </div>

      {/* Floating leaf icons */}
      <div className="hero-floating-icons">
        <motion.div 
          className="floating-icon icon-1"
          animate={{ y: [0, -15, 0], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
          </svg>
        </motion.div>
        <motion.div 
          className="floating-icon icon-2"
          animate={{ y: [0, 12, 0], rotate: [0, -12, 12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.33.26 2.61.74 3.77l-1.89.66c-.6-1.41-.85-2.93-.85-4.43 0-4.97 4.03-9 9-9s9 4.03 9 9c0 1.5-.25 3.02-.85 4.43l-1.89-.66c.48-1.16.74-2.44.74-3.77 0-5.52-4.48-10-10-10z"/>
            <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.11.3 2.14.83 3.02l1.89-.66C8.25 13.58 8 12.83 8 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .83-.25 1.58-.72 2.36l1.89.66c.53-.88.83-1.91.83-3.02 0-3.31-2.69-6-6-6z"/>
          </svg>
        </motion.div>
        <motion.div 
          className="floating-icon icon-3"
          animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c4-4 8-7.5 8-12 0-3.5-2.5-6-6-6s-6 2.5-6 6c0 4.5 4 8 8 12z"/>
          </svg>
        </motion.div>
        <motion.div 
          className="floating-icon icon-4"
          animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
          </svg>
        </motion.div>
        <motion.div 
          className="floating-icon icon-5"
          animate={{ y: [0, 14, 0], rotate: [0, -15, 15, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.33.26 2.61.74 3.77l-1.89.66c-.6-1.41-.85-2.93-.85-4.43 0-4.97 4.03-9 9-9s9 4.03 9 9c0 1.5-.25 3.02-.85 4.43l-1.89-.66c.48-1.16.74-2.44.74-3.77 0-5.52-4.48-10-10-10z"/>
          </svg>
        </motion.div>
        <motion.div 
          className="floating-icon icon-6"
          animate={{ y: [0, -12, 0], rotate: [0, 12, -12, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c4-4 8-7.5 8-12 0-3.5-2.5-6-6-6s-6 2.5-6 6c0 4.5 4 8 8 12z"/>
          </svg>
        </motion.div>
        <motion.div 
          className="floating-icon icon-7"
          animate={{ y: [0, 16, 0], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
          </svg>
        </motion.div>
        <motion.div 
          className="floating-icon icon-8"
          animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0] }}
          transition={{ duration: 4.7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.33.26 2.61.74 3.77l-1.89.66c-.6-1.41-.85-2.93-.85-4.43 0-4.97 4.03-9 9-9s9 4.03 9 9c0 1.5-.25 3.02-.85 4.43l-1.89-.66c.48-1.16.74-2.44.74-3.77 0-5.52-4.48-10-10-10z"/>
          </svg>
        </motion.div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          {/* Left Side - Text Content */}
          <motion.div 
            className="hero-text-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="hero-main-title">
              Anything's possible when you have the knowledge
            </h1>
            <p className="hero-description">
              Join our community of black pepper farmers and agricultural experts. 
              Share insights, discover best practices, and grow your harvest with AI-powered tools.
            </p>
            
            <motion.div 
              className="hero-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to="/forum" className="btn-primary-hero">
                Get Started
              </Link>
              <button 
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary-hero"
              >
                Learn More
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side - Carousel Blob */}
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-blob-container">
              <div className="hero-blob"></div>
              <div className="hero-video-wrapper">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    onAnimationComplete={handleTransitionComplete}
                    className="carousel-media-container"
                  >
                    {currentMedia.type === 'video' ? (
                      <video 
                        ref={videoRef}
                        className="hero-video"
                        autoPlay 
                        muted 
                        playsInline
                        onEnded={handleVideoEnded}
                      >
                        <source src={currentMedia.src} type="video/mp4" />
                      </video>
                    ) : (
                      <img 
                        src={currentMedia.src} 
                        alt="Carousel" 
                        className="hero-image"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Carousel Navigation Dots */}
        <div className="carousel-dots">
          {carouselMedia.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentIndex(index);
                }
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="hero-scroll-indicator"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span>Scroll to explore</span>
        <div className="scroll-arrow"></div>
      </motion.div>
    </section>
  );
}
