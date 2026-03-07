import { Link } from 'react-router-dom';
import './About.css';
import Header from '../shared/Header';
import logo from '../../../../picturesofbp/logowalangbg.png';
import EL from '../../../../EL.jpg';
import YA from '../../../../YA.jpg';
import JD from '../../../../JD.jpg';
import LC from '../../../../LC.jpg';

export default function About() {
  const featuresList = [
    {
      title: "Leaf Analysis",
      description: "AI-driven disease detection for pepper leaves",
      icon: "",
      link: "/leaf-analysis"
    },
    {
      title: "Black Pepper Analysis",
      description: "Ripeness detection for optimal harvest timing",
      icon: "",
      link: "/leaf-analysis"
    },
    {
      title: "Weather Updates",
      description: "Real-time weather data for farming decisions",
      icon: "",
      link: "/weather"
    },
    {
      title: "Community Forum",
      description: "Connect with farmers and share knowledge",
      icon: "",
      link: "/forum"
    },
    {
      title: "Macromapping",
      description: "Visualize your plantation with mapping tools",
      icon: "",
      link: "/macro-mapping"
    }
  ];

  const teamMembers = [
    { name: "Even Lloyd S. Billoned", initials: "EL", image: EL },
    { name: "Yhanskie Adriel D. Cipriano", initials: "YA", image: YA },
    { name: "Jenard D. Inojales", initials: "JD", image: JD },
    { name: "Lord Cedric O. Vila", initials: "LC", image: LC }
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
            <span>Empowering Farmers, Sustaining Excellence</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="about-content">
          {/* Mission Section */}
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              PiperSmart serves as a revolutionary bridge between agricultural wisdom and cutting-edge technology, 
              democratizing access to sophisticated crop management methodologies for farmers worldwide.
            </p>
          </section>

          {/* Vision Section */}
          <section className="about-section">
            <h2>Our Vision</h2>
            <p>
              To transform black pepper cultivation by creating an interconnected ecosystem where 
              data-driven insights and technology converge for agricultural excellence and farmer prosperity.
            </p>
          </section>

          {/* Features Section */}
          <section className="about-section">
            <h2>Platform Features</h2>
            <div className="features-grid">
              {featuresList.map((feature, idx) => (
                <Link key={idx} to={feature.link} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Team Section */}
          <section className="about-section">
            <h2>Meet Our Team</h2>
            <p className="team-subtitle">Visionary technologists dedicated to agricultural transformation</p>
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

          {/* CTA Section */}
          <section className="about-section cta-section">
            <h2>Ready to Get Started?</h2>
            <p>Join progressive farmers revolutionizing black pepper cultivation</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary">Create Account</Link>
              <Link to="/leaf-analysis" className="btn-secondary">Try Leaf Analysis</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
