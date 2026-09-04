'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppRole, AuthUser, PermissionClaim, ROLE_PERMISSIONS } from './roles';

interface AuthContextType {
  user: AuthUser | null;
  role: AppRole;
  isAuthenticated: boolean;
  isCommander: boolean;
  isLoading: boolean;
  permissions: PermissionClaim[];
  login: (serviceId: string, pin: string) => Promise<{ success: boolean; message?: string }>;
  loginDemo: () => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isClearanceModalOpen: boolean;
  clearanceModalReason?: string | null;
  openClearanceModal: (reason?: string | unknown) => void;
  closeClearanceModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRole>('ROLE_CITIZEN');
  const [permissions, setPermissions] = useState<PermissionClaim[]>(ROLE_PERMISSIONS.ROLE_CITIZEN);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [clearanceModalReason, setClearanceModalReason] = useState<string | null>(null);

  // Hydrate session on mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            setRole(data.role);
            setPermissions(data.permissions);
          } else {
            setUser(null);
            setRole('ROLE_CITIZEN');
            setPermissions(ROLE_PERMISSIONS.ROLE_CITIZEN);
          }
        }
      } catch (err) {
        console.warn('Failed to load auth session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, []);

  const login = async (serviceId: string, pin: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, pin })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setRole(data.user.role);
        setPermissions(data.user.permissions);
        setIsClearanceModalOpen(false);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  const loginDemo = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'quick_demo' })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setRole(data.user.role);
        setPermissions(data.user.permissions);
        setIsClearanceModalOpen(false);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Demo login failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout request failed:', err);
    } finally {
      setUser(null);
      setRole('ROLE_CITIZEN');
      setPermissions(ROLE_PERMISSIONS.ROLE_CITIZEN);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: role === 'ROLE_NDRF_OFFICIAL',
        isCommander: role === 'ROLE_NDRF_OFFICIAL',
        isLoading,
        permissions,
        login,
        loginDemo,
        logout,
        isClearanceModalOpen,
        clearanceModalReason,
        openClearanceModal: (reason?: string | unknown) => {
          setClearanceModalReason(typeof reason === 'string' ? reason : null);
          setIsClearanceModalOpen(true);
        },
        closeClearanceModal: () => {
          setClearanceModalReason(null);
          setIsClearanceModalOpen(false);
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
