import { Link, useNavigate } from 'react-router-dom';
import './Contact.css';
import Header from '../shared/Header';
import { FaFacebook, FaEnvelope, FaPhone, FaArrowLeft, FaUserFriends } from 'react-icons/fa';

export default function Contact() {
  const navigate = useNavigate();
  
  // Team member data with Facebook links
  const teamMembers = [
    {
      name: "Even Lloyd S. Billoned",
      role: "Developer",
      facebookLink: "https://www.facebook.com/lloyd.billoned",
      initials: "LB"
    },
    {
      name: "Yhanskie Adriel D. Cipriano",
      role: "Developerr",
      facebookLink: "https://www.facebook.com/yhanskie.cipriano.1",
      initials: "YC"
    },
    {
      name: "Jenard D. Inojales",
      role: "Developer",
      facebookLink: "https://www.facebook.com/jenard.inojales",
      initials: "JI"
    },
    {
      name: "Lord Cedric O. Vila",
      role: "Developer",
      facebookLink: "https://www.facebook.com/sideeerik",
      initials: "LV"
    }
  ];

  return (
    <>
      <Header />
      <div className="contact-container">
        {/* Header Section */}
        <div className="contact-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
          <h1>Contact Us</h1>
          <p>Get in touch with the PiperSmart development team. We're here to support your black pepper farming journey with innovative solutions.</p>
        </div>

        {/* Main Content */}
        <div className="contact-content">
          {/* Contact Information Section */}
          <section className="contact-section">
            <h2><FaEnvelope /> Contact Information</h2>
            <div className="contact-details">
              <div className="contact-item" onClick={() => window.location.href = 'mailto:billonedlloyd@gmail.com'}>
                <div className="contact-icon"><FaEnvelope /></div>
                <div className="contact-info">
                  <h3>Email</h3>
                  <p>pipersmart2026@gmail.com</p>
                  <p>Click to send us an email</p>
                </div>
              </div>
              
              <div className="contact-item" onClick={() => window.location.href = 'tel:09633769724'}>
                <div className="contact-icon"><FaPhone /></div>
                <div className="contact-info">
                  <h3>Phone</h3>
                  <p>+63 963 376 9724</p>
                  <p>Call us for immediate assistance</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon"><FaFacebook /></div>
                <div className="contact-info">
                  <h3>Facebook</h3>
                  <p>Connect with us on Facebook</p>
                  <p>Message us for inquiries and updates</p>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="team-section">
            <h2><FaUserFriends /> Meet Our Team</h2>
            <p>PiperSmart is developed by a dedicated team of professionals passionate about agricultural technology. Connect with us directly through our Facebook profiles.</p>
            
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div className="team-member" key={index}>
                  <div className="member-avatar">{member.initials}</div>
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <a 
                    href={member.facebookLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="facebook-link"
                  >
                    <FaFacebook /> Facebook Profile
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Info */}
          <section className="contact-section">
            <h2>💬 Get In Touch</h2>
            <p>
              Have questions about PiperSmart or need support with your black pepper farming operations? 
              Our team is ready to assist you with technical guidance, troubleshooting, and feature requests.
            </p>
            <p>
              We typically respond within 24 hours on weekdays. For urgent matters, please call us directly. 
              Follow us on Facebook for the latest updates, farming tips, and feature announcements.
            </p>
            <p>
              <strong>Office Hours:</strong> Monday to Friday, 9:00 AM - 5:00 PM (PHT)
            </p>
          </section>
        </div>
      </div>
    </>
  );
}