import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Wiper {
  id: string;
  name: string;
  experience: string;
  rating: number;
  price_per_wash: number;
  available: boolean;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [wipers, setWipers] = useState<Wiper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchWipers();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
    }
    setLoading(false);
  };

  const fetchWipers = async () => {
    const { data, error } = await supabase
      .from('wipers')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching wipers:', error);
    } else {
      setWipers(data || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Car Wipers</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Available Car Wipers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wipers.map((wiper) => (
            <div key={wiper.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{wiper.name}</h2>
              <p className="text-gray-600 mb-4">{wiper.experience}</p>
              <div className="flex items-center mb-4">
                <span className="text-yellow-400 mr-1">★</span>
                <span className="text-gray-700">{wiper.rating.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">
                  ${wiper.price_per_wash}/wash
                </span>
                <button
                  className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                  onClick={() => {/* Implement booking logic */}}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};