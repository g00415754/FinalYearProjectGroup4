import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Account from './Account';
import LogIn from './LogIn';

export default function AccountWrapper() {
  const { currentUser } = useAuth();

  return currentUser ? <Account /> : <LogIn />;
}
