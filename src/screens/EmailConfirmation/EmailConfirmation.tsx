import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the hash fragment from the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const access_token = hashParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token');
    
    const handleConfirmation = async () => {
      try {
        if (!access_token) {
          throw new Error('No access token found in URL');
        }
        
        // Set the auth session with the tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: access_token,
          refresh_token: refresh_token || ''
        });

        if (error) throw error;
        
        console.log('Email confirmed successfully');
        
        // Store session info in localStorage for quick access
        if (data.session) {
          localStorage.setItem('userSession', JSON.stringify({
            expires_at: data.session.expires_at,
            user: {
              id: data.session.user.id,
              email: data.session.user.email
            }
          }));
        }
        
        // Change this line to redirect to services instead of dashboard
        navigate('/services', { replace: true });
      } catch (error) {
        console.error('Error during email confirmation:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };
    
    handleConfirmation();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg font-medium">Confirming your email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Email Confirmation Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-100">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
        <div className="text-[#c5e82e] text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">Email Confirmed Successfully!</h1>
        <p className="text-gray-600 mb-4">Your email has been verified. You'll be redirected to the services page shortly.</p>
        <button 
          onClick={() => navigate('/services')}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Go to Services
        </button>
      </div>
    </div>
  );
};