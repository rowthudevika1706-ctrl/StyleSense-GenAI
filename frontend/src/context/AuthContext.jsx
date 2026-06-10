import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("stylesense_token");
    const saved = localStorage.getItem("stylesense_user");
    if (token && saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("stylesense_token", token);
    localStorage.setItem("stylesense_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("stylesense_token");
    localStorage.removeItem("stylesense_user");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.me();
      const updated = res.data.user;
      localStorage.setItem("stylesense_user", JSON.stringify(updated));
      setUser(updated);
      return updated;
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}