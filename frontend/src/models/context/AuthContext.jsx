// Model: Authentication context for managing user login, registration, and session state
import { createContext, useContext, useEffect, useState } from 'react';
import { registerUser, loginUser, getCurrentUser, getToken, setToken, removeToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (name, email, password, role = 'user') => {
    try {
      const response = await registerUser(name, email, password, role);
      
      if (response.success && response.data && response.data.token) {
        setToken(response.data.token);
        setCurrentUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role
        });
        setUserRole(response.data.user.role);
      }
      
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      
      if (response.success && response.data && response.data.token) {
        setToken(response.data.token);
        setCurrentUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role
        });
        setUserRole(response.data.user.role);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      removeToken();
      setCurrentUser(null);
      setUserRole(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getToken();
        if (token) {
          const response = await getCurrentUser();
          if (response.success && response.data) {
            setCurrentUser({
              id: response.data._id,
              email: response.data.email,
              name: response.data.name,
              role: response.data.role
            });
            setUserRole(response.data.role);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
