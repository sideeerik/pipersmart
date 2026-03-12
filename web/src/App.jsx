import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Index from './Components/User/Index.jsx';
import Login from './Components/User/Login.jsx';
import Register from './Components/User/Register.jsx';
import AdminDashboard from './Components/Admin/Dashboard.jsx';
import ReportsAdmin from './Components/Admin/ReportsAdmin.jsx';
import PostReported from './Components/Admin/PostReported.jsx';
import Profile from './Components/User/Profile.jsx';
import AdminProfile from './Components/Admin/AdminProfile.jsx';
import EditProfile from './Components/User/EditProfile.jsx';
import AdminEditProfile from './Components/Admin/AdminEditProfile.jsx';
import ForgotPassword from './Components/User/ForgotPassword.jsx';
import ResetPassword from './Components/User/ResetPassword.jsx'; 
import ChangePassword from './Components/User/ChangePassword.jsx';
import LeafAnalysis from './Components/User/LeafAnalysis.jsx';
import BungaAnalysis from './Components/User/BungaAnalysis.jsx';
import WeatherPage from './Components/User/WeatherPage.jsx';
import MacromappingPage from './Components/User/MacromappingPage.jsx';
import Knowledge from './Components/User/Knowledge.jsx';
import Chatbot from './Components/shared/Chatbot';
import Forum from './Components/User/Forum.jsx';
import CreateThread from './Components/User/CreateThread.jsx';
import ThreadView from './Components/User/ThreadView.jsx';
import About from './Components/User/About.jsx';
import Contact from './Components/User/Contact.jsx';
import HowItWorks from './Components/User/HowItWorks.jsx';
import FriendRequests from './Components/User/FriendRequests.jsx';
import RecentActivitiesPage from './Components/User/RecentActivitiesPage.jsx';

const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  return Boolean(token && userData);
};

function AppContent() {
  const location = useLocation();
  const hideChatbot = location.pathname === '/login' || location.pathname === '/register' || !isLoggedIn();

  const AccessGate = ({ onClose }) => {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7, 18, 12, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        zIndex: 9999,
      }}>
        <div style={{
          maxWidth: '420px',
          width: '100%',
          background: '#0f2a20',
          border: '1px solid rgba(140, 220, 180, 0.35)',
          borderRadius: '16px',
          padding: '1.75rem',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
        }}>
          <h2 style={{ margin: '0 0 0.75rem', color: '#E6FFF1', fontSize: '1.45rem' }}>
            Login Required
          </h2>
          <p style={{ margin: '0 0 1.5rem', color: 'rgba(219, 240, 230, 0.85)', lineHeight: 1.6 }}>
            Please log in first to access this feature.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/login"
              style={{
                background: '#7ff9b4',
                color: '#042d1c',
                padding: '0.65rem 1.3rem',
                borderRadius: '999px',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Go to login
            </Link>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                color: '#ffffff',
                padding: '0.65rem 1.3rem',
                borderRadius: '999px',
                border: '1px solid rgba(220, 240, 230, 0.5)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const RequireAuth = ({ children }) => {
    const [gateOpen, setGateOpen] = useState(true);
    if (isLoggedIn()) return children;
    return (
      <>
        <div style={{ filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' }} aria-hidden="true">
          {children}
        </div>
        {gateOpen && <AccessGate onClose={() => setGateOpen(false)} />}
      </>
    );
  };

  return (
    <>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Index />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<RequireAuth><Index /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><Index /></RequireAuth>} />
        <Route path="/knowledge" element={<RequireAuth><Knowledge /></RequireAuth>} />
        <Route path="/leaf-analysis" element={<RequireAuth><LeafAnalysis /></RequireAuth>} />
        <Route path="/bunga-analysis" element={<RequireAuth><BungaAnalysis /></RequireAuth>} />
        <Route path="/weather" element={<RequireAuth><WeatherPage /></RequireAuth>} />
        <Route path="/macro-mapping" element={<RequireAuth><MacromappingPage /></RequireAuth>} />
        <Route path="/admin/dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/reports" element={<RequireAuth><ReportsAdmin /></RequireAuth>} />
        <Route path="/admin/reported-posts" element={<RequireAuth><PostReported /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/profile/edit" element={<RequireAuth><EditProfile /></RequireAuth>} />
        <Route path="/profile/:userId" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/admin/profile" element={<RequireAuth><AdminProfile /></RequireAuth>} />
        <Route path="/admin/profile/edit" element={<RequireAuth><AdminEditProfile /></RequireAuth>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
        <Route path="/about" element={<RequireAuth><About /></RequireAuth>} />
        <Route path="/Contact" element={<RequireAuth><Contact /></RequireAuth>} />
        <Route path="/how-it-works" element={<RequireAuth><HowItWorks /></RequireAuth>} />

        {/* Forum routes */}
        <Route path="/forum" element={<RequireAuth><Forum /></RequireAuth>} />
        <Route path="/forum/Forum" element={<Navigate to="/forum" replace />} />
        <Route path="/forum/create" element={<RequireAuth><CreateThread /></RequireAuth>} />
        <Route path="/forum/thread/:threadId" element={<RequireAuth><ThreadView /></RequireAuth>} />
        <Route path="/forum/edit/:threadId" element={<RequireAuth><CreateThread /></RequireAuth>} />
        
        {/* Friend routes */}
        <Route path="/friend-requests" element={<RequireAuth><FriendRequests /></RequireAuth>} />
        <Route path="/recent-activities" element={<RequireAuth><RecentActivitiesPage /></RequireAuth>} />
      </Routes>
      {!hideChatbot && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
