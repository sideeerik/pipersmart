import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    { 
      number: 1, 
      title: 'Capture Image', 
      description: 'Take a photo of the affected pepper leaf using your smartphone or camera. Make sure the image is clear and shows the affected area clearly.',
      icon: '📷'
    },
    { 
      number: 2, 
      title: 'Upload', 
      description: 'Upload the image to PiperSmart through our user-friendly interface. You can drag and drop or select files from your device.',
      icon: '☁️'
    },
    { 
      number: 3, 
      title: 'AI Analysis', 
      description: 'Our advanced AI system analyzes the image instantly using deep learning models trained on thousands of pepper plant images.',
      icon: '🤖'
    },
    { 
      number: 4, 
      title: 'Get Results', 
      description: 'Receive a comprehensive disease diagnosis with treatment recommendations. Our AI provides detailed insights and actionable steps.',
      icon: '📋'
    },
  ];

  const features = [
    {
      title: 'Leaf Analysis',
      description: 'Upload photos of pepper leaves for disease detection and identification',
      icon: '🍃',
      link: '/leaf-analysis'
    },
    {
      title: 'Weather Updates',
      description: 'Get real-time weather information for your farming area',
      icon: '🌦️',
      link: '/weather'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other farmers and share experiences',
      icon: '💬',
      link: '/forum'
    },
    {
      title: 'Macromapping',
      description: 'Visualize your plantation with advanced mapping tools',
      icon: '🗺️',
      link: '/macro-mapping'
    }
  ];

  return (
    <div className="how-it-works-page">
      <Header />
      
      <div className="how-it-works-container">
        {/* Hero Section */}
        <section className="how-it-works-hero">
          <h1>How It Works</h1>
          <p>Discover how PiperSmart uses AI to help you protect your pepper crops</p>
        </section>

        {/* Steps Section */}
        <section className="how-it-works-steps">
          <h2>4 Simple Steps to Disease Detection</h2>
          <div className="steps-grid">
            {steps.map((step, idx) => (
              <div key={idx} className="step-card">
                <div className="step-icon">{step.icon}</div>
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Preview */}
        <section className="how-it-works-features">
          <h2>Explore Our Features</h2>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <Link key={idx} to={feature.link} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="how-it-works-cta">
          <h2>Ready to Get Started?</h2>
          <p>Start analyzing your pepper plants today and protect your harvest</p>
          <div className="cta-buttons">
            <Link to="/leaf-analysis" className="btn-primary">Try Leaf Analysis</Link>
            <Link to="/register" className="btn-secondary">Create Account</Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
