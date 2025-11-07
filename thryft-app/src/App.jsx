import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import NavigationBar from './components/NavigationBar';
import Home from './components/Home';
import Shop from './components/Shop';
import Closet from './components/Closet/Closet';
import AccountWrapper from './components/Account/AccountWrapper';

function App() {
    return (
      <GoogleOAuthProvider clientId="266562936456-bfessc9bropo6r396rqkmuokp8g4f0lv.apps.googleusercontent.com">
        <AuthProvider>
          <NavigationBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/closet" element={<Closet />} />
            <Route path="/account" element={<AccountWrapper />} />
          </Routes>
        </AuthProvider>
      </GoogleOAuthProvider>
    );
  }

export default App;
