import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in (restore session from cookie)
  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      // Make a request with credentials to check if cookie is valid
      const response = await axios.get(`${API_BASE_URL}/user/me`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Token expired or invalid, user not authenticated
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth status on app mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/user/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/login";
    }
  };

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        logout,
        login,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
