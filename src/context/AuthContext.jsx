import { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for persisted session
    const stored = localStorage.getItem('comingbro_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch { }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login - replace with Firebase Auth
    const userData = { ...mockUser, email };
    setUser(userData);
    localStorage.setItem('comingbro_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (username, email, password, profileImage = null) => {
    // Mock register - replace with Firebase Auth
    const userData = { ...mockUser, username, email, profileImage };
    setUser(userData);
    localStorage.setItem('comingbro_user', JSON.stringify(userData));
    return userData;
  };

  const loginWithGoogle = async () => {
    const userData = { ...mockUser };
    setUser(userData);
    localStorage.setItem('comingbro_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('comingbro_user');
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('comingbro_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
