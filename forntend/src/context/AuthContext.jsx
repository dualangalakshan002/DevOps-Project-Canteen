import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  // Persist to localStorage immediately when logging in/out to ensure axios interceptor
  // can read the token synchronously for requests that follow login.
  const login = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
    try {
      localStorage.setItem('token', newToken);
      localStorage.setItem('role', newRole);
    } catch (err) {
      // ignore storage errors
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    } catch (err) {}
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        isAuthenticated: !!token,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
