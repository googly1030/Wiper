import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const EmailConfirmation = () => {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the hash fragment from the URL
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        // Check if there's an error in the URL
        if (params.get('error')) {
          setError(`${params.get('error_description') || 'Verification failed'}. Please try signing in or request a new confirmation email.`);
          setVerifying(false);
          return;
        }

        // If hash params include access_token, it's a successful confirmation
        if (params.get('access_token')) {
          // The supabase client will automatically handle the session
          const { error } = await supabase.auth.getSession();
          if (error) throw error;
          
          // Navigate to dashboard after a short delay to allow session to be processed
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          setError('Invalid confirmation link. Please try signing in or request a new confirmation email.');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Something went wrong during verification. Please try signing in again.');
      } finally {
        setVerifying(false);
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8 text-center">
        <div className="w-[53px] h-[54px] bg-black rounded-full flex items-center justify-center mx-auto mb-6">
          <img
            className="w-[39px] h-8"
            alt="Logo"
            src="/group-46-1.png"
          />
        </div>
        
        {verifying ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Verifying your email</h2>
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black mx-auto"></div>
          </>
        ) : error ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Verification Issue</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 bg-black text-white rounded-full hover:bg-gray-800"
            >
              Return to Sign In
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Email Verified!</h2>
            <p className="text-green-600 mb-6">Your email has been verified successfully.</p>
            <p className="mb-6">You'll be redirected to the dashboard shortly...</p>
          </>
        )}
      </div>
    </div>
  );
};