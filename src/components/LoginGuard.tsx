import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface LoginGuardProps {
  children: React.ReactNode;
}

export const LoginGuard = ({ children }: LoginGuardProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔒 Checking if user is already logged in...');
        
        // First check localStorage for cached session for faster response
        const cachedSession = localStorage.getItem('userSession');
        if (cachedSession) {
          const parsedSession = JSON.parse(cachedSession);
          if (parsedSession && new Date(parsedSession.expires_at * 1000) > new Date()) {
            console.log('✅ User already logged in, redirecting to dashboard');
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }
        }
        
        // If no valid cached session, check with Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('✅ Active session found, redirecting to dashboard');
          setIsAuthenticated(true);
        } else {
          console.log('❌ No active session found, staying on login page');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Session check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('🔄 Redirecting authenticated user to dashboard');
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};