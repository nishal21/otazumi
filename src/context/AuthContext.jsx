import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on app start
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');
        
        if (savedUser && token) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('auth_token', token || 'temp_token');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    
    // Clear other user-specific data
    localStorage.removeItem('continueWatching');
    localStorage.removeItem('favorites');
    localStorage.removeItem('watchlist');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const updatePreferences = (preferences) => {
    if (user) {
      const updatedUser = { ...user, preferences };
      updateUser(updatedUser);
    }
  };

  const refreshUser = async () => {
    try {
      if (!user || !user.id) return;

      // Fetch fresh user data from database
      const { AuthService } = await import('../services/authService');
      const { db } = await import('../db/index');
      const { users } = await import('../db/schema');
      const { eq } = await import('drizzle-orm');

      const [freshUser] = await db.select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (freshUser) {
        // Update user with fresh data (without password)
        const { password: _, ...userWithoutPassword } = freshUser;
        updateUser(userWithoutPassword);
        return userWithoutPassword;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    updatePreferences,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};