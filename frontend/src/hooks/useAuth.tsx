import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  baseId?: string | null;
  active: boolean;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuthToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('defensync_token'));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('defensync_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('defensync_token', token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('defensync_token');
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('defensync_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('defensync_user');
    }
  }, [user]);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      setAuthToken: setToken,
      setUser,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
