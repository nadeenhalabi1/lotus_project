import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock authentication - in production, this would check JWT token
    const mockUser = {
      id: 'admin-1',
      name: 'Executive Manager',
      role: 'administrator',
      email: 'executive@educoreai.com'
    };
    
    // Simulate loading
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);
  }, []);

  const login = async (credentials) => {
    // Mock login - in production, this would authenticate with backend
    const mockUser = {
      id: 'admin-1',
      name: 'Executive Manager',
      role: 'administrator',
      email: 'executive@educoreai.com'
    };
    
    setUser(mockUser);
    return mockUser;
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
