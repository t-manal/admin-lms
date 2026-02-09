'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth';
import apiClient from '@/lib/api-client';
import type { User } from '@/types/api';
import { isAdminPanelRole, isInstructor } from '../rbac';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refetchUser = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      setUser(data);
    } catch (error) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Register persistent failure listener
    apiClient.setOnPersistentAuthFailure(() => {
      setUser(null);
      setIsLoading(false);
    });

    return () => {
      apiClient.setOnPersistentAuthFailure(() => { });
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      // 1. BAILOUT: Skip all auth checks on login page
      // Do NOT attempt refresh on login page to avoid race conditions
      if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
        setIsLoading(false);
        return;
      }

      let authSuccess = false;

      try {
        // 2. Refresh Token Flow (Only on protected pages)
        const data = await authApi.refresh();
        if (data?.accessToken) {
          apiClient.setAccessToken(data.accessToken);
          apiClient.resetRefreshState();
          
          try {
            const userData = await authApi.getMe();
            
            // 3. RBAC: Verify role on initialization (INSTRUCTOR Only)
            if (!isInstructor(userData.role)) {
               console.warn(`[Auth] Init failed: Role ${userData.role} not authorized`);
               throw new Error('Unauthorized role');
            }

            setUser(userData);
            authSuccess = true;
          } catch {
            setUser(null);
            apiClient.clearAccessToken();
          }
        }
      } catch {
        apiClient.markRefreshFailed();
        setUser(null);
      }
      
      setIsLoading(false);

      // 4. Redirect if auth failed on protected route
      if (!authSuccess && typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.includes('/admin')) {
          const pathSegments = path.split('/');
          const currentLocale = ['en', 'ar'].includes(pathSegments[1]) ? pathSegments[1] : 'en';
          window.location.href = `/${currentLocale}/login`;
        }
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // 1. Login Request
      const data = await authApi.login({ email, password });
      
      // 2. Validate Response & Role
      if (data?.accessToken && data?.user) {
        if (!isInstructor(data.user.role)) {
          throw new Error('Access denied: This panel requires INSTRUCTOR role');
        }

        // 3. Set State (Source of Truth)
        apiClient.setAccessToken(data.accessToken);
        apiClient.resetRefreshState();
        setUser(data.user);
        
        // 4. Resolve (Let generic page component handle redirect)
        setIsLoading(false);
      } else {
        throw new Error('Login failed: Invalid response structure');
      }
    } catch (error) {
      setIsLoading(false);
      setUser(null);
      apiClient.clearAccessToken();
      throw error;
    }
  };

  const logout = async () => {
    // Fire and forget logout request to server
    authApi.logout().catch(console.error);

    // Immediately clear client state
    apiClient.clearAccessToken();
    setUser(null);

    // Get locale from window location as fallback or path
    const pathSegments = window.location.pathname.split('/');
    const currentLocale = ['en', 'ar'].includes(pathSegments[1]) ? pathSegments[1] : 'en';
    router.push(`/${currentLocale}/login`);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
