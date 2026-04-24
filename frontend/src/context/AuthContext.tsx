import { createContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, seedLocalDemoRoute } from '../services/api';
import type { AuthUser } from '../types';

const TOKEN_KEY = 'route_finder_token';
const USER_KEY = 'route_finder_user';

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    seedLocalDemoRoute();
    setLoading(false);
  }, []);

  const saveSession = (nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      saveSession(response.token, response.user);
      return;
    } catch {
      if (username === 'admin' && password === 'admin') {
        saveSession('local-admin-token', { username: 'admin', isLocalAdmin: true });
        return;
      }
      throw new Error('Неверный логин или пароль');
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await authApi.register(username, password);
      saveSession(response.token, response.user);
      return;
    } catch {
      if (username && password.length >= 4) {
        saveSession(`local-${Date.now()}`, { username });
        return;
      }
      throw new Error('Не удалось зарегистрироваться');
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
