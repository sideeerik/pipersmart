import './Contact.css';
import Header from '../shared/Header';
import { FaFacebook, FaEnvelope, FaPhone } from 'react-icons/fa';
import EL from '../../../media/EL.jpg';
import YA from '../../../media/YA.jpg';
import JD from '../../../media/JD.jpg';
import LC from '../../../media/LC.jpg';

export default function Contact() {
  const teamMembers = [
    { name: "Even Lloyd S. Billoned", role: "Developer", facebookLink: "https://www.facebook.com/lloyd.billoned", initials: "EL", image: EL },
    { name: "Yhanskie Adriel D. Cipriano", role: "Developer", facebookLink: "https://www.facebook.com/yhanskie.cipriano.1", initials: "YA", image: YA },
    { name: "Jenard D. Inojales", role: "Developer", facebookLink: "https://www.facebook.com/jenard.inojalae", initials: "JD", image: JD },
    { name: "Lord Cedric O. Vila", role: "Developer", facebookLink: "https://www.facebook.com/sideeerik", initials: "LC", image: LC }
  ];

  return (
    <>
      <Header />
      <div className="contact-container">
        {/* Header Section */}
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>Get in touch with the PiperSmart development team. We're here to support your black pepper farming journey.</p>
        </div>

        {/* Main Content */}
        <div className="contact-content">
          {/* Contact Information */}
          <section className="contact-section">
            <h2>Get In Touch</h2>
            <div className="contact-grid">
              <div 
                className="contact-card"
                onClick={() => window.location.href = 'mailto:pipersmart2026@gmail.com'}
              >
                <div className="contact-icon"><FaEnvelope /></div>
                <h3>Email</h3>
                <p>pipersmart2026@gmail.com</p>
              </div>
              
              <div 
                className="contact-card"
                onClick={() => window.location.href = 'tel:+639633769724'}
              >
                <div className="contact-icon"><FaPhone /></div>
                <h3>Phone</h3>
                <p>+63 963 376 9724</p>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon"><FaFacebook /></div>
                <h3>Facebook</h3>
                <p>Connect with us</p>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="contact-section">
            <h2>Meet Our Team</h2>
            <p className="team-subtitle">Dedicated professionals passionate about agricultural technology</p>
            
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-card">
                  <div className="team-avatar">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="team-image" />
                    ) : (
                      <span>{member.initials}</span>
                    )}
                  </div>
                  <h3>{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <a 
                    href={member.facebookLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="facebook-btn"
                  >
                    <FaFacebook /> Profile
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Info */}
          <section className="contact-section">
            <h2>Office Information</h2>
            <p>
              Have questions about PiperSmart or need support? Our team is ready to assist you with technical guidance and troubleshooting.
            </p>
            <p>
              We typically respond within 24 hours on weekdays. For urgent matters, please call us directly.
            </p>
            <p className="office-hours">Office Hours: Monday to Friday, 9:00 AM - 5:00 PM (PHT)</p>
          </section>
        </div>
      </div>
    </>
  );
}
