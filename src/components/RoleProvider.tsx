'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'customer' | 'admin';

interface UserSummary {
  id: number;
  email: string;
  role: UserRole;
}

interface RoleContextValue {
  role: UserRole | null;
  loaded: boolean;
  setRole: (role: UserRole) => void;
  token: string | null;
  user: UserSummary | null;
  setAuth: (token: string, user: UserSummary) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);
const STORAGE_ROLE = 'frontend-marketplace-role';
const STORAGE_TOKEN = 'frontend-marketplace-token';
const STORAGE_USER = 'frontend-marketplace-user';

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedRole = window.localStorage.getItem(STORAGE_ROLE) as UserRole | null;
    const savedToken = window.localStorage.getItem(STORAGE_TOKEN);
    const savedUser = window.localStorage.getItem(STORAGE_USER);

    if (savedRole === 'admin' || savedRole === 'customer') {
      setRoleState(savedRole);
    } else {
      setRoleState('customer');
    }

    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (_) {
        setUser(null);
      }
    }

    setLoaded(true);
  }, []);

  const setRole = (next: UserRole) => {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_ROLE, next);
  };

  const setCookie = (name: string, value: string, days: number) => {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  };

  const clearCookie = (name: string) => {
    document.cookie = `${name}=; path=/; max-age=0`;
  };

  const setAuth = (nextToken: string, nextUser: UserSummary) => {
    setToken(nextToken);
    setUser(nextUser);
    setRoleState(nextUser.role);
    window.localStorage.setItem(STORAGE_TOKEN, nextToken);
    window.localStorage.setItem(STORAGE_USER, JSON.stringify(nextUser));
    window.localStorage.setItem(STORAGE_ROLE, nextUser.role);
    setCookie(STORAGE_TOKEN, nextToken, 7);
    setCookie(STORAGE_ROLE, nextUser.role, 7);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRoleState('customer');
    window.localStorage.removeItem(STORAGE_TOKEN);
    window.localStorage.removeItem(STORAGE_USER);
    window.localStorage.setItem(STORAGE_ROLE, 'customer');
    clearCookie(STORAGE_TOKEN);
    clearCookie(STORAGE_ROLE);
  };

  const value = useMemo(
    () => ({ role, loaded, setRole, token, user, setAuth, logout }),
    [role, loaded, token, user]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
}
