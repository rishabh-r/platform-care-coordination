import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import ChatWidget from './components/ChatWidget';

function formatDisplayName(raw) {
  let name = raw.includes('@') ? raw.split('@')[0] : raw;
  name = name.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export default function App() {
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
