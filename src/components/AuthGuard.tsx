import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [hasCar, setHasCar] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();

  const checkForCars = async (userId: string) => {
    if (!userId) {
      console.error('❌ No user ID provided for car check');
      return false;
    }

    console.log('🚗 Checking for user cars with ID:', userId);
    
    try {
      const { data: cars, error } = await supabase
        .from('user_cars')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      
      if (error) {
        console.error('❌ Error fetching cars:', error.message);
        return false;
      }

      const userHasCar = cars && cars.length > 0;
      console.log(userHasCar ? `✅ User has cars: ${cars.length} found` : '❌ No cars found for user');
      
      // Store car status in localStorage for faster loading on subsequent visits
      localStorage.setItem('userHasCar', JSON.stringify(userHasCar));
      
      return userHasCar;
    } catch (err) {
      console.error('❌ Exception during car check:', err);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔒 Checking authentication status...');
        
        // Check with Supabase first for the most reliable auth status
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('❌ No valid session found, user is not authenticated');
          // Make sure to clean up any stale session data
          localStorage.removeItem('userSession');
          localStorage.removeItem('userHasCar');
          setAuthenticated(false);
          setLoading(false);
          return;
        }

        console.log('✅ User authenticated:', session.user.id);
        // Store session data in localStorage for faster subsequent loads
        localStorage.setItem('userSession', JSON.stringify({
          expires_at: session.expires_at,
          user: {
            id: session.user.id,
            email: session.user.email
          }
        }));

        setUserId(session.user.id);
        setAuthenticated(true);
        
        // Check for cars and update state
        const userHasCar = await checkForCars(session.user.id);
        setHasCar(userHasCar);
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.key]); // Re-check auth & cars when location changes

  // Same as before...
  useEffect(() => {
    if (authenticated && userId && location.pathname === '/dashboard') {
      const recheckCars = async () => {
        console.log('🔄 Rechecking cars after possible add-car completion');
        const hasCarNow = await checkForCars(userId);
        setHasCar(hasCarNow);
      };
      
      recheckCars();
    }
  }, [authenticated, userId, location.pathname]);

  useEffect(() => {
    // Debug state changes
    console.log('🔄 AuthGuard State:', {
      loading,
      authenticated,
      hasCar,
      userId,
      currentPath: location.pathname
    });
  }, [loading, authenticated, hasCar, userId, location.pathname]);

  if (loading) {
    console.log('⌛ Loading auth state...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!authenticated) {
    console.log('🔄 Redirecting to login page');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (authenticated && !hasCar && location.pathname !== '/add-car') {
    console.log('🔄 Redirecting to add-car page');
    return <Navigate to="/add-car" replace />;
  }

  console.log('✅ Rendering protected content');
  return <>{children}</>;
};