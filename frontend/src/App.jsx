import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import './App.css';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import JobBoardHome from './pages/JobBoardHome';
import JobDetail from './pages/JobDetail';
import EmployerDashboard from './pages/EmployerDashboard';
import MyApplications from './pages/MyApplications';
import EmployerApplications from './pages/EmployerApplications';
import Profile from './pages/Profile';
import Resumex from './pages/Resumex';

function App() {
  const { token, getProfile } = useAuthStore();

  useEffect(() => {
    if (token) {
      getProfile().catch(() => {
        useAuthStore.getState().setToken(null);
      });
    }
  }, [token, getProfile]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<JobBoardHome />} />
        <Route path="/job/:id" element={<JobDetail />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/employer-applications" element={<EmployerApplications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resumex" element={<Resumex />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
