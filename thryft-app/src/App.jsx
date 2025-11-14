import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Splash screen delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Load previous user (deprecated once Firebase auth replaces it)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setIsAuthenticated(true);
  }, []);

  return (
    <FirebaseProvider>
      <AuthProvider>
        {showSplash ? (
          <SplashScreen />
        ) : (
          <Routes>

            {/* Login Route */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" />
                ) : (
                  <LogIn setIsAuthenticated={setIsAuthenticated} />
                )
              }
            />

            {/* Home */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
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
                isAuthenticated ? (
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
                isAuthenticated ? (
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
                isAuthenticated ? (
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
                isAuthenticated ? (
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
        )}
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;
