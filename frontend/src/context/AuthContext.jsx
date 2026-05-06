import { createContext, useContext, useState, useEffect } from 'react';
import { get, post } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('bsp_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed.user);
      setRol(parsed.rol);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await post('/auth/login', { email, password });
    if (data.error) throw new Error(data.error);
    setUser(data.user);
    setRol(data.rol);
    localStorage.setItem('bsp_user', JSON.stringify({ user: data.user, rol: data.rol }));
    return data;
  };

  const logout = () => {
    setUser(null);
    setRol(null);
    localStorage.removeItem('bsp_user');
  };

  return (
    <AuthContext.Provider value={{ user, rol, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
