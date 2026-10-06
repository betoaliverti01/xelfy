import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // 1. Verificar sessão inicial
    const checkSession = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              avatar: session.user.user_metadata?.avatar_url || null,
            });
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          const storedUser = localStorage.getItem('xelfy_local_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Erro na checagem de sessão:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkSession();

    // 2. Escutar mudanças de autenticação
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar: session.user.user_metadata?.avatar_url || null,
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoadingAuth(false);
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('xelfy_local_user');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        logout,
        navigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
