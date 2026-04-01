import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import ChatWidget from './components/ChatWidget';
import DashboardPage from './components/DashboardPage';
import { formatDisplayName } from './utils';

function MainApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('cb_token');
    const savedUser = localStorage.getItem('cb_user');
    if (savedToken && savedUser) {
      setIsLoggedIn(true);
      setUserName(savedUser);
    }
  }, []);

  const handleLoginSuccess = (name) => {
    setIsLoggedIn(true);
    setUserName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('cb_token');
    localStorage.removeItem('cb_user');
    setIsLoggedIn(false);
    setUserName('');
  };

  const displayName = userName ? formatDisplayName(userName) : '';

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      <HomeScreen displayName={displayName} onLogout={handleLogout} />
      <ChatWidget displayName={displayName} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
