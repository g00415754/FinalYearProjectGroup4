import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import {
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import "../../styles/Account.css";

export default function LogIn() {
  const { login, register, currentUser } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // 🔥 Redirect user AWAY from /login if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  // ===========================
  // 🌟 1. HANDLE GOOGLE LOGIN
  // ===========================
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const cred = GoogleAuthProvider.credential(
        credentialResponse.credential
      );

      const result = await signInWithCredential(auth, cred);

      console.log("Google Auth User:", result.user);

      // 🔥 Redirect to home after Google login
      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  // ===========================
  // 🌟 2. HANDLE INPUT CHANGE
  // ===========================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===========================
  // 🌟 3. SUBMIT FORM (Email/Password)
  // ===========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          return;
        }

        // Firebase Signup
        await register(formData.email, formData.password);
        console.log("Signed up with:", formData.email);
      } else {
        // Firebase Login
        await login(formData.email, formData.password);
        console.log("Logged in with:", formData.email);
      }

      // 🔥 Redirect after login/signup
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="login-page d-flex flex-column align-items-center justify-content-center vh-100">
      <div className="account-box p-4 shadow rounded text-center">
        <h2 className="mb-4">
          {isSignUp ? "Create an Account" : "Sign in to Thryft"}
        </h2>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: "320px" }}>
          <div className="form-group mb-3 text-start">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group mb-3 text-start">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {isSignUp && (
            <div className="form-group mb-3 text-start">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 mb-3">
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div className="divider my-3">or</div>

        {/* GOOGLE LOGIN BUTTON */}
        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Google Login Failed")}
          />
        </div>


        {/* Toggle between modes */}
        <p className="mt-4">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button className="btn btn-link p-0" onClick={() => setIsSignUp(false)}>
                Log In
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button className="btn btn-link p-0" onClick={() => setIsSignUp(true)}>
                Sign Up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
