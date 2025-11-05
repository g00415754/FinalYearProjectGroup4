import React, { useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../../context/AuthContext';
import * as jwt_decode from 'jwt-decode';
import '../../styles/Account.css';

export default function Login() {
  const { login } = useContext(AuthContext);

  const handleLoginSuccess = (credentialResponse) => {
    const user = jwt_decode(credentialResponse.credential);
    login(user);
  };

  return (
    <div className="login-page d-flex flex-column align-items-center justify-content-center vh-100">
      <h2>Sign in to your account</h2>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => console.log('Login Failed')}
      />
    </div>
  );
}
