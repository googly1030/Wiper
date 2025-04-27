import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../components/ui/badge';
import { 
  CarIcon, 
  CheckCircleIcon, 
  ShieldIcon
} from 'lucide-react';
import Header from '../../components/Header';

interface CarFormData {
  plate_number: string;
  make: string; // Car Brand
  model: string; // Car Make
  size: 'hatchback' | 'sedan' | 'coupe' | 'suv' | 'luxury'; 
}

export const AddCar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<CarFormData>({
    plate_number: '',
    make: '',
    model: '',
    size: 'sedan', // Default size
  });
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);
  
  // Popular car brands for quick selection
  const popularMakes = [
    'Toyota', 'Honda', 'BMW', 'Mercedes', 'Ford', 'Audi', 'Tesla', 'Nissan', 'Hyundai'
  ];

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUserData();
    
    // Get the car class from location state if available
    if (location.state?.carClass) {
      setFormData(prev => ({
        ...prev,
        size: location.state.carClass
      }));
    }
  }, [location.state]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleMakeSelect = (value: string) => {
    setFormData({
      ...formData,
      make: value
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

      const { data, error } = await supabase
        .from('user_cars')
        .insert({
          user_id: user.id,
          make: formData.make,
          model: formData.model,
          year: new Date().getFullYear(), // Default to current year
          color: 'Not specified',
          size: formData.size,
          plate_number: formData.plate_number
        })
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Car added successfully:", data);
      
      // Show success state
      setSuccess(true);
      
      // Redirect to services page after short delay
      setTimeout(() => {
        if (location.state?.returnTo) {
          navigate(location.state.returnTo);
        } else {
          navigate('/services');
        }
      }, 1500);
    } catch (error) {
      console.error('Error adding car:', error);
      alert("Failed to add your car. Please try again.");
    } finally {
      setLoading(false);
    }
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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  // Container for stagger children animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const getCarSizeLabel = (size: string) => {
    switch (size) {
      case 'hatchback': return 'Hatchback';
      case 'sedan': return 'Sedan';
      case 'coupe': return 'Coupe';
      case 'suv': return 'SUV';
      case 'luxury': return 'Luxury';
      default: return size.charAt(0).toUpperCase() + size.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}>
        <Header />
      </div>
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <div className="h-[25vh] sm:h-[30vh] overflow-hidden relative">
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50 z-10"></div>
          
          {/* Background image with parallax effect */}
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <div className="w-full h-full bg-black bg-opacity-70 bg-[url('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2000')] bg-cover bg-center bg-blend-overlay"></div>
          </motion.div>
          
          {/* Hero content */}
          <div className="absolute inset-0 z-20 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Badge className="mb-4 bg-[#c5e82e] text-black font-medium px-3 py-1">Add Your Vehicle</Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
                  Hey <span className="text-[#c5e82e]">{getUserName()}</span>,
                </h1>
                <h2 className="text-xl md:text-2xl font-medium mb-2 text-white">
                  Let's add your car details
                </h2>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Curved separator */}
      <div className="relative -mt-12 z-10">
        <svg className="fill-white w-full h-24" preserveAspectRatio="none" viewBox="0 0 1440 96">
          <path d="M0,96L80,80C160,64,320,32,480,32C640,32,800,64,960,69.3C1120,75,1280,53,1360,42.7L1440,32L1440,96L1360,96C1280,96,1120,96,960,96C800,96,640,96,480,96C320,96,160,96,80,96L0,96Z"></path>
        </svg>
      </div>

      <div className="max-w-xl md:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 relative">
        {/* Background design elements */}


        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#c5e82e] rounded-lg">
              <CarIcon className="h-5 w-5 text-black" />
            </div>
            <h2 className="text-xl font-bold">Car Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Registration Number */}
            <div>
              <label htmlFor="plate_number" className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <Input
                id="plate_number"
                name="plate_number"
                value={formData.plate_number}
                onChange={handleChange}
                placeholder="Enter number here"
                className="bg-white text-black border-gray-200 focus:border-[#c5e82e] py-6 rounded-xl"
                required
              />
            </div>

            {/* Car Brand */}
            <div>
              <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-2">
                Car Brand
              </label>
              <Input
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                placeholder="Enter your car brand here"
                className="bg-white text-black border-gray-200 focus:border-[#c5e82e] py-6 rounded-xl"
                required
              />
              
              {/* Popular makes buttons */}
              <motion.div 
                className="mt-3"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <p className="text-xs text-gray-500 mb-2">Popular brands:</p>
                <div className="flex flex-wrap gap-2">
                  {popularMakes.slice(0, 6).map(make => (
                    <motion.button
                      key={make}
                      type="button"
                      variants={item}
                      onClick={() => handleMakeSelect(make)}
                      className={`px-3 py-1 text-xs rounded-full transition-all ${
                        formData.make === make 
                        ? 'bg-[#c5e82e] text-black' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {make}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Car Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                Car Model
              </label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Enter your car model here"
                className="bg-white text-black border-gray-200 focus:border-[#c5e82e] py-6 rounded-xl"
                required
              />
            </div>

            {/* Car Class Selection */}
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                Car Class
              </label>
              <div className="relative">
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={(e) => setFormData({
                    ...formData,
                    size: e.target.value as CarFormData['size']
                  })}
                  className="w-full py-6 px-4 bg-white text-gray-800 border border-gray-200 rounded-xl focus:border-[#c5e82e] focus:ring focus:ring-[#c5e82e]/20 focus:outline-none appearance-none"
                >
                  <option value="sedan">Sedan</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="coupe">Coupe</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <Badge className="bg-[#c5e82e] text-black">
                    {location.state?.carClass ? "Auto-selected" : "Choose type"}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {location.state?.carClass 
                  ? "This was automatically set based on your selected plan, but you can change it if needed."
                  : "Select the type of car you drive to ensure appropriate service."}
              </p>
            </div>

            {/* Submit button */}
            <motion.div 
              className="pt-4"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                disabled={loading || success}
                className={`w-full py-6 text-white font-medium rounded-xl flex items-center justify-center ${
                  success 
                    ? 'bg-green-500' 
                    : 'bg-black hover:bg-gray-800 border-b-2 border-[#c5e82e]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 mr-2 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    Adding your car...
                  </>
                ) : success ? (
                  <>
                    <CheckCircleIcon className="mr-2 h-5 w-5" />
                    Car Added Successfully
                  </>
                ) : (
                  'Add Your Car'
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
        
        {/* Selected car class info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#c5e82e]/20 rounded-lg">
              <ShieldIcon className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Selected Car Class: <span className="font-bold">{getCarSizeLabel(formData.size)}</span></h3>
              <p className="text-xs text-gray-600">
                This car class was selected based on your chosen plan. You can change your car's details later from your profile.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};