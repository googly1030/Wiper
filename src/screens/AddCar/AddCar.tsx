import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CarIcon, 
  ArrowRightCircleIcon, 
  XCircleIcon, 
  CheckCircleIcon, 
  MapPinIcon, 
  BuildingIcon, 
  CalendarIcon,
  PaletteIcon,
  BadgeIcon as LicenseIcon,
  MapPinIcon as LocateIcon,
  HomeIcon,
  WarehouseIcon as GarageIcon
} from 'lucide-react';
import Header from '../../components/Header';


interface CarFormData {
  make: string;
  model: string;
  year: string;
  color: string;
  size: 'hatchback' | 'sedan' | 'coupe' | 'suv' | 'luxury'; 
  plate_number?: string;
  location?: {
    address?: string;
    apartment?: string;
    block?: string;
    landmark?: string;
  };
}

export const AddCar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CarFormData>({
    make: '',
    model: '',
    year: '',
    color: '',
    size: 'sedan',
    location: {
      address: '',
      apartment: '',
      block: '',
      landmark: '',
    }
  });
  const [user, setUser] = useState<any>(null);
  // Use const instead of useState if you don't need to update it
  const popularMakes = [
    'Toyota', 'Honda', 'BMW', 'Mercedes', 'Ford', 'Audi', 'Tesla', 'Nissan'
  ];

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

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        [name]: value
      }
    });
  };
  
  const handleMakeSelect = (value: string) => {
    setFormData({
      ...formData,
      make: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const detectCurrentLocation = () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Get coordinates from the browser
            const { latitude, longitude } = position.coords;
            
            // Use a geocoding service (Google Maps, Mapbox, etc.)
            // This example uses the free Nominatim OpenStreetMap API
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            
            if (!response.ok) throw new Error("Geocoding failed");
            
            const data = await response.json();
            
            // Extract address components
            const address = data.display_name.split(',').slice(0, 3).join(',');
            
            setFormData({
              ...formData,
              location: {
                ...formData.location,
                address: address || "Address not found",
                landmark: data.address?.suburb || data.address?.neighbourhood || ""
              }
            });
          } catch (error) {
            console.error("Error getting location details:", error);
            alert("Found your location, but couldn't get the address. Please enter it manually.");
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);
          alert("Unable to detect your location. Please enter it manually.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationLoading(false);
      alert("Geolocation is not supported by your browser");
    }
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
          plate_number: formData.plate_number || null,
          // Store location fields in separate columns
          location_address: formData.location?.address || null,
          location_apartment: formData.location?.apartment || null,
          location_block: formData.location?.block || null,
          location_landmark: formData.location?.landmark || null
        })
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Car added successfully:", data);
      
      // Show success indicator
      setCurrentStep(5);
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        console.log("Navigating to services page...");
        navigate('/services', { replace: true });
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


  // Animation variants
  const pageTransition = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.3 } }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Progress steps
  const steps = [
    { id: 1, title: "Car Basics" },
    { id: 2, title: "Details" },
    { id: 3, title: "Type" },
    { id: 4, title: "Location" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-x-hidden">
      {/* Header */}
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Background design elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5e82e]/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[#c5e82e]/5 rounded-full blur-3xl -z-10"></div>

        {/* Modern Progress indicator */}
        <div className="mb-12 relative">
          <div className="hidden md:flex justify-between items-center mb-2 px-2">
            {steps.map((step) => (
              <p 
                key={`label-${step.id}`} 
                className={`text-xs font-medium transition-colors w-1/4 text-center ${
                  currentStep >= step.id ? 'text-[#c5e82e]' : 'text-gray-500'
                }`}
              >
                {step.title}
              </p>
            ))}
          </div>
          
          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className="absolute h-full rounded-full bg-gradient-to-r from-[#c5e82e] to-[#d0f53a]"
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep - 1) * (100 / (steps.length - 1))}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex justify-between items-center relative -top-[9px]">
            {steps.map((step) => (
              <div 
                key={`step-${step.id}`}
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  currentStep >= step.id ? 'bg-[#c5e82e]' : 'bg-gray-700'
                }`}
              >
                {currentStep > step.id && (
                  <CheckCircleIcon className="h-3 w-3 text-black" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Welcome message */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-10 md:mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">Hey <span className="text-[#c5e82e]">{getUserName()}</span>, welcome to Wiper!</h1>
          <p className="text-xl text-gray-300 mb-2">Let's set up your car details for personalized cleaning services.</p>
          <div className="h-1 w-24 bg-[#c5e82e] rounded-full"></div>
        </motion.div>

        {/* Form steps */}
        <div className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Car Make & Model */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                className="p-8"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#c5e82e] rounded-lg">
                    <CarIcon className="h-5 w-5 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold">First, tell us about your car</h2>
                </div>

                <div className="mb-8">
                  <div className="mb-6">
                    <label htmlFor="make" className="block text-sm font-medium text-gray-300 mb-2">
                      Car Make
                    </label>
                    <div className="relative">
                      <Input
                        id="make"
                        name="make"
                        value={formData.make}
                        onChange={handleChange}
                        placeholder="e.g., Toyota, Honda, BMW"
                        className="bg-gray-700 text-white border-gray-600 focus:border-[#c5e82e] pl-4 pr-10 py-6 rounded-xl"
                        required
                      />
                    </div>
                    
                    {/* Popular makes buttons */}
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-2">Popular makes:</p>
                      <div className="flex flex-wrap gap-2">
                        {popularMakes.slice(0, 5).map(make => (
                          <button
                            key={make}
                            type="button"
                            onClick={() => handleMakeSelect(make)}
                            className={`px-3 py-1 text-xs rounded-full transition-all ${
                              formData.make === make 
                              ? 'bg-[#c5e82e] text-black' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {make}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-2">
                      Car Model
                    </label>
                    <Input
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="e.g., Camry, Civic, X5"
                      className="bg-gray-700 text-white border-gray-600 focus:border-[#c5e82e] py-6 rounded-xl"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={nextStep}
                      disabled={!formData.make || !formData.model}
                      className="flex items-center bg-[#c5e82e] text-black hover:bg-[#d0f53a] px-6 py-6 rounded-xl text-lg font-medium"
                    >
                      Next <ArrowRightCircleIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>

                {/* Decorative element */}
                <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-[#c5e82e]/10 rounded-full blur-xl"></div>
              </motion.div>
            )}

            {/* Step 2: Car Year & Color */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                className="p-8"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#c5e82e] rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold">More car details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-2">
                      Year
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="year"
                        name="year"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={handleChange}
                        placeholder="e.g., 2020"
                        className="bg-gray-700 text-white border-gray-600 focus:border-[#c5e82e] pl-10 py-6 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="relative">
                      <PaletteIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="e.g., Black, Silver, Red"
                        className="bg-gray-700 text-white border-gray-600 focus:border-[#c5e82e] pl-10 py-6 rounded-xl"
                        required
                      />
                    </div>
                    
                    {/* Color palette */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["Black", "White", "Silver", "Red", "Blue", "Gray"].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleSelectChange('color', color)}
                          className={`px-3 py-1 text-xs rounded-full transition-all ${
                            formData.color === color 
                            ? 'bg-[#c5e82e] text-black' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="plate_number" className="block text-sm font-medium text-gray-300 mb-2">
                      License Plate (optional)
                    </label>
                    <div className="relative">
                      <LicenseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="plate_number"
                        name="plate_number"
                        value={formData.plate_number || ''}
                        onChange={handleChange}
                        placeholder="e.g., ABC-1234"
                        className="bg-gray-700 text-white border-gray-600 focus:border-[#c5e82e] pl-10 py-6 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      onClick={prevStep}
                      className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl"
                    >
                      Back
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={nextStep}
                      disabled={!formData.year || !formData.color}
                      className="flex items-center bg-[#c5e82e] text-black hover:bg-[#d0f53a] px-6 py-3 rounded-xl"
                    >
                      Next <ArrowRightCircleIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
                
                {/* Decorative element */}
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#c5e82e]/10 rounded-full blur-2xl"></div>
              </motion.div>
            )}

            {/* Step 3: Car Type */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                className="p-8 relative"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#c5e82e] rounded-lg">
                    <CarIcon className="h-5 w-5 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold">What type of car do you have?</h2>
                </div>
                
                <p className="text-gray-300 mb-8">This helps us tailor our cleaning services specifically for your vehicle.</p>
                
                <form>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4"> {/* Update to 5 columns for better layout */}
                    {(['hatchback', 'sedan', 'coupe', 'suv', 'luxury'] as const).map((type) => (
                      <motion.div 
                        key={type}
                        onClick={() => setFormData({...formData, size: type})}
                        className={`cursor-pointer rounded-2xl p-6 flex flex-col items-center justify-center transition-all ${
                          formData.size === type ? 'bg-[#c5e82e] text-black shadow-lg shadow-[#c5e82e]/20' : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                   
                        <div className="text-center capitalize font-medium">{type}</div>
                        
                        {formData.size === type && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                            className="mt-2"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-10 flex justify-between">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl"
                      >
                        Back
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="button"
                        onClick={() => nextStep()} // Explicitly call nextStep as a function
                        disabled={!formData.size}
                        className="flex items-center bg-[#c5e82e] text-black hover:bg-[#d0f53a] px-6 py-3 rounded-xl"
                      >
                        Next <ArrowRightCircleIcon className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </div>
                </form>

                <div className="absolute top-1/2 left-0 w-16 h-16 bg-[#c5e82e]/30 rounded-full blur-xl animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-0 right-10 w-24 h-24 bg-[#c5e82e]/20 rounded-full blur-xl animate-pulse pointer-events-none"></div>
              </motion.div>
            )}
            
            {/* NEW Step 4: Location Details */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                className="p-8 relative"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#c5e82e] rounded-lg">
                    <MapPinIcon className="h-5 w-5 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold">Where is your car usually parked?</h2>
                </div>
                
                <p className="text-gray-300 mb-8">
                  This helps our cleaners locate your vehicle when providing service.
                </p>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-300">
                      Address
                    </label>
                    <motion.button
                      type="button"
                      onClick={detectCurrentLocation}
                      disabled={locationLoading}
                      className="text-xs flex items-center text-[#c5e82e] hover:text-[#d0f53a]"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {locationLoading ? (
                        <>
                          <div className="h-3 w-3 mr-1 rounded-full border-2 border-t-[#c5e82e] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                          Detecting...
                        </>
                      ) : (
                        <>
                          <LocateIcon className="h-3 w-3 mr-1" />
                          Detect my location
                        </>
                      )}
                    </motion.button>
                  </div>
                  
                  <div className="relative">
                    <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="address"
                      name="address"
                      value={formData.location?.address || ''}
                      onChange={handleLocationChange}
                      placeholder="e.g., 123 Main Street"
                      className="bg-gray-700 text-white border-gray-600 focus:border-[#c5e82e] pl-10 py-6 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="apartment" className="block text-sm font-medium text-gray-300 mb-2">
                      Apartment/Unit Number
                    </label>
                    <div className="relative">
                      <BuildingIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="apartment"
                        name="apartment"
                        value={formData.location?.apartment || ''}
                        onChange={handleLocationChange}
                        placeholder="e.g., Apt 502"
                        className="bg-gray-700 text-white border-gray-600 focus:border-[#c5e82e] pl-10 py-6 rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="block" className="block text-sm font-medium text-gray-300 mb-2">
                      Block/Building
                    </label>
                    <div className="relative">
                      <GarageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="block"
                        name="block"
                        value={formData.location?.block || ''}
                        onChange={handleLocationChange}
                        placeholder="e.g., Block A"
                        className="bg-gray-700 text-white border-gray-600 focus:border-[#c5e82e] pl-10 py-6 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="landmark" className="block text-sm font-medium text-gray-300 mb-2">
                    Nearby Landmark (optional)
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="landmark"
                      name="landmark"
                      value={formData.location?.landmark || ''}
                      onChange={handleLocationChange}
                      placeholder="e.g., Near Central Park"
                      className="bg-gray-700 text-white border-gray-600 focus:border-[#c5e82e] pl-10 py-6 rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="mt-10 flex justify-between">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl"
                    >
                      Back
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center bg-[#c5e82e] text-black hover:bg-[#d0f53a] px-8 py-3 rounded-xl"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-black border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        'Complete Setup'
                      )}
                    </Button>
                  </motion.div>
                </div>
                
                {/* Map-like decorative elements */}
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 -left-5 w-10 h-10 bg-[#c5e82e]/30 rounded-full blur-lg"></div>
              </motion.div>
            )}

            {/* Success Step */}
            {currentStep === 5 && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                className="p-8 text-center pt-16 pb-16"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotateY: [0, 360] }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 10,
                    rotateY: { duration: 1.5 }
                  }}
                  className="w-24 h-24 bg-[#c5e82e] rounded-full mx-auto flex items-center justify-center mb-6"
                >
                  <CheckCircleIcon className="w-12 h-12 text-black" />
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-3xl font-bold mb-4">All set!</h2>
                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    Your car details have been saved. We're preparing personalized services for your {formData.year} {formData.make} {formData.model}.
                  </p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-8">
                    <div className="h-2 w-2 bg-[#c5e82e] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="h-2 w-2 bg-[#c5e82e] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-[#c5e82e] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  
                  <motion.div 
                    className="inline-block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="bg-gray-700 rounded-xl p-4 inline-flex items-center gap-4 shadow-lg">
                   
                      <div className="text-left">
                        <p className="text-sm text-gray-400">Your car</p>
                        <p className="font-medium">{formData.make} {formData.model}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
                
                {/* Success confetti effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-[#c5e82e]"
                      initial={{ 
                        x: Math.random() * window.innerWidth, 
                        y: -20,
                        opacity: 1
                      }}
                      animate={{ 
                        y: window.innerHeight + 20,
                        opacity: 0
                      }}
                      transition={{ 
                        duration: Math.random() * 2 + 1,
                        delay: Math.random() * 0.5,
                        repeat: Infinity,
                        repeatDelay: Math.random() + 1
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Car summary preview - shows when data is entered */}
        {currentStep > 1 && currentStep < 5 && (formData.make || formData.model) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700"
          >
            <div className="flex items-start gap-4">
          
              <div className="flex-grow">
                <h3 className="text-lg font-medium mb-1">Your Car</h3>
                <p className="text-gray-400">{formData.make} {formData.model} {formData.year && `(${formData.year})`} {formData.color && `• ${formData.color}`}</p>
                {formData.location?.address && (
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <MapPinIcon className="w-3 h-3 mr-1" />
                    {formData.location.address}
                  </div>
                )}
              </div>
              <div>
                <span className="text-xs bg-[#c5e82e]/20 text-[#c5e82e] px-2 py-1 rounded-full">
                  Step {currentStep} of 4
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Help text */}
        {currentStep < 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-4 bg-gray-700/50 backdrop-blur-sm rounded-xl text-sm text-gray-300 flex items-center"
          >
            <XCircleIcon className="h-5 w-5 mr-2 text-[#c5e82e]" />
            <p>Need help? Contact our support team at support@wiper.com</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};