import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext.jsx';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import NavigationBar from './components/NavigationBar';
import Home from './components/Home';
import Shop from './components/Shop';
import Game from './components/Game/Game';
import Closet from './components/Closet/Closet';
import AccountWrapper from './components/Account/AccountWrapper';
import LogIn from './components/Account/LogIn';
import SplashScreen from './components/SplashScreen';

function AppRoutes() {
  const { currentUser } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <Routes>

      {/* Login Route */}
      <Route
        path="/login"
        element={
          currentUser ? <Navigate to="/" /> : <LogIn />
        }
      />

      {/* Home */}
      <Route
        path="/"
        element={
          currentUser ? (
            <>
              <Home />
              <NavigationBar />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Shop */}
      <Route
        path="/shop"
        element={
          currentUser ? (
            <>
              <Shop />
              <NavigationBar />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Game */}
      <Route
        path="/game"
        element={
          currentUser ? (
            <>
              <Game />
              <NavigationBar />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Closet */}
      <Route
        path="/closet"
        element={
          currentUser ? (
            <>
              <Closet />
              <NavigationBar />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Account */}
      <Route
        path="/account"
        element={
          currentUser ? (
            <>
              <AccountWrapper />
              <NavigationBar />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

    </Routes>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </FirebaseProvider>
  );
}
