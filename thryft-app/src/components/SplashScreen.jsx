import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SplashScreen.css';
import logo from '../assets/LogoThrift.png';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const splash = document.querySelector('.splash-screen');
      if (splash) splash.classList.add('fade-out');
    }, 1600);

    const navTimer = setTimeout(() => navigate('/login'), 2200);

    return () => {
      clearTimeout(timer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className="splash-screen">
      <div className="splash-gradient"></div>
      <div className="splash-content">
        <img src={logo} alt="Thryft Logo" className="splash-logo" />
        <p className="splash-tagline">Wear | Style | Play</p>
      </div>
    </div>
  );
}
