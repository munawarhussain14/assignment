// Import necessary React hooks
import { createContext, useContext, useState, useEffect } from "react";

// Create a context for authentication
const AuthContext = createContext();

// Custom hook to access auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log(context);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider component that wraps app and makes auth object available to children
export const AuthProvider = ({ children }) => {
  // State for storing JWT token and user data
  const [token, setToken] = useState(localStorage.getItem("jwt_token"));
  const [user, setUser] = useState(null);

  // Persist token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("jwt_token", token);
    } else {
      localStorage.removeItem("jwt_token");
    }
  }, [token]);

  // Login handler - updates token and user data
  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  // Logout handler - clears token and user data
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Create value object with auth state and methods
  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token, // Boolean flag indicating if user is authenticated
  };

  // Provide auth context to children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
