import { Link } from 'react-router-dom';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import './HowItWorks.css';

export default function HowItWorks() {
  const StepIcon = ({ type }) => {
    if (type === 'camera') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8a2 2 0 0 1 2-2h2l1.2-1.6A2 2 0 0 1 9.8 4h4.4a2 2 0 0 1 1.6.8L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    }

    if (type === 'upload') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8.5 8.5 12 5l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 16.5a3.5 3.5 0 0 0 .8 7H18a3 3 0 1 0 .4-6A4.5 4.5 0 0 0 9.6 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    if (type === 'ai') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="7" width="12" height="10" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="10" cy="12" r="1.2" fill="currentColor" />
          <circle cx="14" cy="12" r="1.2" fill="currentColor" />
          <path d="M9.5 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 4v2M4 12h2M18 12h2M7 5.5l1.2 1.2M17 5.5l-1.2 1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="4" width="10" height="16" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.5 8h5M9.5 11h5M9.5 14h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10 4.8h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  };

  const steps = [
    {
      number: 1,
      title: 'Capture Image',
      description:
        'Take a photo of the affected pepper leaf using your smartphone or camera. Make sure the image is clear and shows the affected area clearly.',
      iconType: 'camera'
    },
    {
      number: 2,
      title: 'Upload',
      description:
        'Upload the image to PiperSmart through our user-friendly interface. You can drag and drop or select files from your device.',
      iconType: 'upload'
    },
    {
      number: 3,
      title: 'AI Analysis',
      description:
        'Our advanced AI system analyzes the image instantly using deep learning models trained on thousands of pepper plant images.',
      iconType: 'ai'
    },
    {
      number: 4,
      title: 'Get Results',
      description:
        'Receive a comprehensive disease diagnosis with treatment recommendations. Our AI provides detailed insights and actionable steps.',
      iconType: 'results'
    }
  ];

  const features = [
    {
      title: 'Leaf Analysis',
      description: 'Upload photos of pepper leaves for disease detection and identification',
      link: '/leaf-analysis'
    },
    {
      title: 'Weather Updates',
      description: 'Get real-time weather information for your farming area',
      link: '/weather'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other farmers and share experiences',
      link: '/forum'
    },
    {
      title: 'Macromapping',
      description: 'Visualize your plantation with advanced mapping tools',
      link: '/macromapping'
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
                <div className="step-icon">
                  <StepIcon type={step.iconType} />
                </div>
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
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Start analyzing your pepper plants today and protect your harvest</p>
            <div className="cta-buttons">
              <Link to="/leaf-analysis" className="btn-primary">Try Leaf Analysis</Link>
              <Link to="/register" className="btn-secondary">Create Account</Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
