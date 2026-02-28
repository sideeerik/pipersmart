import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setupAxiosInterceptor } from './config/axiosConfig';
import Index from './Components/User/Index.jsx';
import Login from './Components/user/Login';
import Register from './Components/user/Register';
import Dashboard from './Components/Admin/Dashboard.jsx';
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
import Chat from './Components/Chat/Chat.jsx';



function App() {
  useEffect(() => {
    setupAxiosInterceptor();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Index />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Index />} />
        <Route path="/dashboard" element={<Index />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/leaf-analysis" element={<LeafAnalysis />} />
        <Route path="/bunga-analysis" element={<BungaAnalysis />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/macro-mapping" element={<MacromappingPage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/profile/edit" element={<AdminEditProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/Contact" element={<Contact />} />

        {/* Forum routes */}
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/create" element={<CreateThread />} />
        <Route path="/forum/thread/:threadId" element={<ThreadView />} />
        <Route path="/forum/edit/:threadId" element={<CreateThread />} />

        {/* Chat route */}
        <Route path="/chat" element={<Chat />} />
        

      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;
