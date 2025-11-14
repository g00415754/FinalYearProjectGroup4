import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Track Firebase user (Google + email/password)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });

    return () => unsubscribe();
  }, []);

  // Email/Password Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Email/Password Signup
  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Google login is handled outside & calls login(user) indirectly,
  // so no need for a special function here.

  // Logout
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for convenience
export const useAuth = () => useContext(AuthContext);
