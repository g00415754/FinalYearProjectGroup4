import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';   // <-- ADD THIS

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="798439046806-u6ko87vb6h8opshb6ge1lqprtfmef8f3.apps.googleusercontent.com">
    <BrowserRouter>
      <AuthProvider>   {/* <-- WRAP APP IN YOUR AUTH CONTEXT */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
