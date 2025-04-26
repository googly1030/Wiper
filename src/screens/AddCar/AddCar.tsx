import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { motion } from 'framer-motion';
import { CarIcon, ArrowRightCircleIcon, XCircleIcon, CheckCircleIcon } from 'lucide-react';

interface CarFormData {
  make: string;
  model: string;
  year: string;
  color: string;
  size: 'hatchback' | 'sedan' | 'coupe' | 'suv';
  plate_number?: string;
}

export const AddCar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CarFormData>({
    make: '',
    model: '',
    year: '',
    color: '',
    size: 'sedan',
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        console.error("No user found");
        throw new Error('User not authenticated');
      }

      console.log("Submitting car data:", {
        user_id: user.id,
        ...formData,
        year: parseInt(formData.year)
      });

      const { data, error } = await supabase
        .from('user_cars')
        .insert({
          user_id: user.id,
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          color: formData.color,
          size: formData.size,
          plate_number: formData.plate_number || null
        })
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Car added successfully:", data);
      
      // Show success indicator
      setCurrentStep(4);
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        console.log("Navigating to dashboard...");
        navigate('/dashboard', { replace: true });
      }, 2000);
    } catch (error) {
      console.error('Error adding car:', error);
      alert("Failed to add your car. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const getUserName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  // For illustration purposes - these would be actual images of cars in production
  const carTypeImages = {
    hatchback: "🚗",
    sedan: "🚙",
    coupe: "🏎️",
    suv: "🚓"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="bg-black shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center">
                <img
                  className="w-[30px] h-6"
                  alt="Logo"
                  src="/group-46-1.png"
                />
              </div>
              <img
                className="h-6 ml-3"
                alt="Brand"
                src="/group-47.png"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center w-full max-w-xs">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div 
                  className={`rounded-full h-3 w-3 flex items-center justify-center ${
                    currentStep >= step ? 'bg-white' : 'bg-gray-600'
                  }`}
                >
                  {currentStep > step && (
                    <div className="h-2 w-2 rounded-full bg-black"></div>
                  )}
                </div>
                {step < 3 && (
                  <div 
                    className={`flex-1 h-1 ${
                      currentStep > step ? 'bg-white' : 'bg-gray-600'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Welcome message */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Hey {getUserName()}, welcome to Wiper!</h1>
          <p className="text-xl text-gray-300 mb-8">Let's set up your car details for personalized cleaning services.</p>
        </motion.div>

        {/* Form steps */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-gray-800 rounded-xl p-8 shadow-2xl"
        >
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-6">First, tell us about your car</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-300 mb-2">
                    Make
                  </label>
                  <Input
                    id="make"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    placeholder="e.g., Toyota, Honda, BMW"
                    className="bg-gray-700 text-white border-gray-600 focus:border-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-2">
                    Model
                  </label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., Camry, Civic, X5"
                    className="bg-gray-700 text-white border-gray-600 focus:border-white"
                    required
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={nextStep}
                  disabled={!formData.make || !formData.model}
                  className="flex items-center bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-full text-lg"
                >
                  Next <ArrowRightCircleIcon className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-6">More car details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-2">
                    Year
                  </label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g., 2020"
                    className="bg-gray-700 text-white border-gray-600 focus:border-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <Input
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="e.g., Black, Silver, Red"
                    className="bg-gray-700 text-white border-gray-600 focus:border-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="plate_number" className="block text-sm font-medium text-gray-300 mb-2">
                    License Plate (optional)
                  </label>
                  <Input
                    id="plate_number"
                    name="plate_number"
                    value={formData.plate_number || ''}
                    onChange={handleChange}
                    placeholder="e.g., ABC-1234"
                    className="bg-gray-700 text-white border-gray-600 focus:border-white"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button
                  onClick={prevStep}
                  className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full text-lg"
                >
                  Back
                </Button>
                <Button
                  type="button" // Change to button type instead of submit
                  disabled={loading}
                  className="flex items-center bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-full text-lg"
                  onClick={async () => { // Add direct click handler
                    setLoading(true);
                    try {
                      await handleSubmit(new Event('submit') as any);
                    } finally {
                      // Force navigation if the normal flow doesn't work
                      setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
                    }
                  }}
                >
                  {loading ? 'Saving...' : 'Finish Setup'}
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-6">What type of car do you have?</h2>
              <p className="text-gray-300 mb-6">This helps us tailor our cleaning services specifically for your vehicle.</p>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(['hatchback', 'sedan', 'coupe', 'suv'] as const).map((type) => (
                    <div 
                      key={type}
                      onClick={() => setFormData({...formData, size: type})}
                      className={`cursor-pointer rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
                        formData.size === type ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-4xl mb-2">{carTypeImages[type]}</div>
                      <div className="text-center capitalize font-medium">{type}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-between">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full text-lg"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-full text-lg"
                    onClick={async () => { // Add direct click handler
                      setLoading(true);
                      try {
                        await handleSubmit(new Event('submit') as any);
                      } finally {
                        // Force navigation if the normal flow doesn't work
                        setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
                      }
                    }}
                  >
                    {loading ? 'Saving...' : 'Finish Setup'}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-6"
              >
                <CheckCircleIcon className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">All set!</h2>
              <p className="text-gray-300 mb-4">Your car details have been saved. We're taking you to your personalized dashboard.</p>
              <div className="animate-pulse">
                <div className="w-8 h-1 bg-white mx-auto rounded-full"></div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Help text */}
        {currentStep < 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 p-4 bg-gray-700 rounded-lg text-sm text-gray-300"
          >
            <p>Need help? Contact our support team at support@wiper.com</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};