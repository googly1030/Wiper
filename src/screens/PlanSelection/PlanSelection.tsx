import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfWeek, getDay, isSameDay, startOfToday, endOfMonth, eachDayOfInterval } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import Header from '../../components/Header';
import {
  CheckCircleIcon,
  CalendarIcon,
  Clock3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  CheckIcon
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  category: string;
  popular?: boolean;
  features?: string[];
  frequency?: string;
  isMonthlyPlan?: boolean;
}

interface UserCar {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  size: string;
  plate_number?: string;
}

interface LocationState {
  serviceId: string;
  carDetails: UserCar;
}

// Available time slots
const timeSlots = [
  { id: 1, time: '08:00 AM - 09:30 AM' },
  { id: 2, time: '10:00 AM - 11:30 AM' },
  { id: 3, time: '12:00 PM - 01:30 PM' },
  { id: 4, time: '02:00 PM - 03:30 PM' },
  { id: 5, time: '04:00 PM - 05:30 PM' },
  { id: 6, time: '06:00 PM - 07:30 PM' },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const PlanSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<number[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [frequencyDays, setFrequencyDays] = useState<number>(0);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const locationState = location.state as LocationState;
    
    if (!locationState || !locationState.serviceId) {
      navigate('/services');
      return;
    }
    
    const fetchServiceDetails = async () => {
      setLoading(true);
      
      // In a real app, fetch from your database
      // For this example, we'll use the mock data based on the location state
      
      // Get service ID from location state
      const serviceId = locationState.serviceId;
      
      // Mock service data - would be fetched from your API
      const mockServices: Record<string, Service> = {
        'monthly-basic': {
          id: 'monthly-basic',
          name: 'Basic Monthly Plan',
          description: 'Essential care for your vehicle with regular exterior cleaning',
          duration: '30 days',
          price: 3999, // ₹3,999/month
          category: 'Monthly',
          frequency: '4 days/week',
          features: [
            '4 exterior washes per week',
            '1 interior cleaning per month',
            'Flexible time slots',
            'Daily updates via app'
          ],
          isMonthlyPlan: true
        },
        'monthly-premium': {
          id: 'monthly-premium',
          name: 'Premium Monthly Plan',
          description: 'Complete care package with interior and exterior attention',
          duration: '30 days',
          price: 5999, // ₹5,999/month
          category: 'Monthly',
          popular: true,
          frequency: '6 days/week',
          features: [
            '6 exterior washes per week',
            '2 interior cleanings per month',
            'Priority scheduling',
            'Slot based on your selection',
            'Daily updates with photos'
          ],
          isMonthlyPlan: true
        },
        'monthly-ultimate': {
          id: 'monthly-ultimate',
          name: 'Ultimate Monthly Plan',
          description: 'The complete package for car enthusiasts who demand perfection',
          duration: '30 days',
          price: 8999, // ₹8,999/month
          category: 'Monthly',
          frequency: '7 days/week',
          features: [
            'Daily exterior washes',
            'Weekly interior deep cleaning',
            'Monthly ceramic coating refresh',
            'Premium time slots',
            'Dedicated car care specialist',
            'Detailed maintenance reports'
          ],
          isMonthlyPlan: true
        }
      };
      
      const selectedService = mockServices[serviceId];
      setService(selectedService);
      
      // Parse frequency to get number of days
      // e.g. "4 days/week" => 4
      if (selectedService?.frequency) {
        const frequencyMatch = selectedService.frequency.match(/(\d+)/);
        if (frequencyMatch && frequencyMatch[1]) {
          setFrequencyDays(parseInt(frequencyMatch[1]));
        }
      }
      
      setLoading(false);
    };
    
    fetchServiceDetails();
  }, [location, navigate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSlotSelect = (slotId: number) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(slotId)) {
        return prev.filter(id => id !== slotId);
      } else {
        return [...prev, slotId].sort((a, b) => a - b);
      }
    });
  };

  const handleDayOfWeekSelect = (day: number) => {
    setSelectedDaysOfWeek(prev => {
      // Remove if already selected
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      }
      
      // Add if we haven't reached frequency limit
      if (prev.length < frequencyDays) {
        return [...prev, day].sort((a, b) => a - b);
      }
      
      // Replace the first day with the new one (shift pattern)
      return [...prev.slice(1), day].sort((a, b) => a - b);
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => {
      const days = direction === 'prev' ? -7 : 7;
      return addDays(prev, days);
    });
  };

  const handleSubmit = async () => {
    if (selectedDaysOfWeek.length === 0 || selectedTimeSlots.length === 0) {
      alert("Please select days and time slots for your plan");
      return;
    }

    setSubmitLoading(true);
    
    // Here you would typically send this data to your backend
    const bookingData = {
      serviceId: service?.id,
      daysOfWeek: selectedDaysOfWeek,
      timeSlots: selectedTimeSlots.map(id => timeSlots.find(slot => slot.id === id)?.time),
      startDate: format(new Date(), 'yyyy-MM-dd')
    };
    
    console.log("Booking data:", bookingData);
    
    // Simulate API call
    setTimeout(() => {
      // Navigate to success page or dashboard
      navigate('/dashboard', { 
        state: { 
          success: true,
          message: "Your plan has been successfully activated"
        }
      });
    }, 1000);
  };

  // Format day names for display
  const getDayName = (date: Date) => {
    return format(date, 'EEE');
  };
  
  const getDayNumber = (date: Date) => {
    return format(date, 'd');
  };

  // Generate days from today to end of month
  const today = startOfToday();
  const monthEnd = endOfMonth(today);
  const weekDays = eachDayOfInterval({
    start: today,
    end: monthEnd
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-5">
            <div className="absolute inset-0 border-4 border-t-[#c5e82e] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-t-transparent border-r-[#c5e82e] border-b-transparent border-l-transparent rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
          </div>
          <div className="text-xl font-medium text-white">Setting up your plan...</div>
          <p className="text-gray-400 mt-2">Loading schedule options</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header component in a fixed position */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}>
        <Header />
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black py-16">
        {/* Design elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5e82e]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c5e82e]/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {service?.popular && (
                <Badge className="bg-[#c5e82e] text-black mb-4 px-3 py-1 inline-flex items-center gap-1">
                  <StarIcon className="w-3.5 h-3.5" />
                  Popular Choice
                </Badge>
              )}
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              {service?.name}
            </h1>
            
            <p className="text-xl text-[#c5e82e] font-medium mb-4">
              ₹{service?.price.toLocaleString('en-IN')}/month
            </p>
            
            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
              {service?.description}
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center items-center mb-6">
              <Badge variant="outline" className="border-white/30 bg-black/30 backdrop-blur-sm text-white px-3 py-1.5 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" />
                {service?.frequency}
              </Badge>
              
              <Badge variant="outline" className="border-white/30 bg-black/30 backdrop-blur-sm text-white px-3 py-1.5 flex items-center gap-1.5">
                <Clock3Icon className="w-3.5 h-3.5" />
                {service?.duration}
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Curved separator */}
        <div className="relative -mt-12 z-10">
          <svg className="fill-white w-full h-24" preserveAspectRatio="none" viewBox="0 0 1440 96">
            <path d="M0,96L80,80C160,64,320,32,480,32C640,32,800,64,960,69.3C1120,75,1280,53,1360,42.7L1440,32L1440,96L1360,96C1280,96,1120,96,960,96C800,96,640,96,480,96C320,96,160,96,80,96L0,96Z"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Customize Your Plan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select your preferred days and time slots for your {service?.name}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Plan Details */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-1"
            >
              <Card className="bg-white shadow-lg rounded-3xl overflow-hidden border-0">
                <div className="bg-gradient-to-r from-gray-900 to-black p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Plan Details</h3>
                  <p className="text-gray-300 text-sm">{service?.frequency} service for your vehicle</p>
                </div>
                
                <CardContent className="p-6">
                  <h4 className="font-bold mb-4 text-lg">What's Included:</h4>
                  
                  <ul className="space-y-3 mb-6">
                    {service?.features?.map((feature, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-start"
                        variants={itemVariants}
                      >
                        <div className="mt-0.5 mr-3 bg-[#c5e82e] p-1 rounded-full">
                          <CheckCircleIcon className="h-4 w-4 text-black" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Plan price</span>
                      <span className="font-medium">₹{service?.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{service?.duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">First billing</span>
                      <span className="font-medium">{format(new Date(), 'dd MMM, yyyy')}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-bold mb-3">How it works</h4>
                    <ol className="space-y-2 list-decimal pl-5 text-gray-600 text-sm">
                      <li>Select your preferred days of the week</li>
                      <li>Choose convenient time slots</li>
                      <li>Our team will arrive at the scheduled times</li>
                      <li>Manage your bookings through the app</li>
                      <li>Automatic monthly billing for convenience</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Right Column - Calendar & Schedule */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2"
            >
              <Card className="bg-white shadow-lg rounded-3xl overflow-hidden border-0 mb-6">
                <div className="bg-gradient-to-r from-gray-900 to-black p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Select Days</h3>
                  <p className="text-gray-300 text-sm">Choose {frequencyDays} days/week for your service</p>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-8">
                    <h4 className="font-medium mb-4">Days of Week</h4>
                    <div className="flex justify-between items-center mb-5">
                      <Button 
                        variant="outline" 
                        className="rounded-full w-10 h-10 p-0"
                        onClick={() => navigateWeek('prev')}
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </Button>
                      
                      <div className="text-sm font-medium">
                        Select your {frequencyDays} preferred days
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="rounded-full w-10 h-10 p-0"
                        onClick={() => navigateWeek('next')}
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-4 flex-wrap">
                      {weekDays.map((date, index) => {
                        const dayIndex = getDay(date);
                        const isSelected = selectedDaysOfWeek.includes(dayIndex);
                        
                        return (
                          <motion.div 
                            key={index}
                            className={`aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-[#c5e82e] text-black shadow-lg shadow-[#c5e82e]/20' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            onClick={() => handleDayOfWeekSelect(dayIndex)}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="text-sm font-medium">{getDayName(date)}</div>
                            <div className="text-xl font-bold mb-1">{getDayNumber(date)}</div>
                            {isSelected && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-white rounded-full p-1"
                              >
                                <CheckIcon className="h-3 w-3" />
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    <div className="text-sm text-gray-500 mt-3">
                      <span className="font-medium">Selected: </span>
                      {selectedDaysOfWeek.length > 0 
                        ? selectedDaysOfWeek.map(day => 
                            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
                          ).join(', ')
                        : 'None'}
                      <span className="ml-1">({selectedDaysOfWeek.length}/{frequencyDays})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-lg rounded-3xl overflow-hidden border-0">
                <div className="bg-gradient-to-r from-gray-900 to-black p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Select Time</h3>
                  <p className="text-gray-300 text-sm">Choose your preferred time slot</p>
                </div>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTimeSlots.includes(slot.id);
                      
                      return (
                        <motion.div
                          key={slot.id}
                          className={`p-4 rounded-xl border cursor-pointer ${
                            isSelected 
                              ? 'border-[#c5e82e] bg-[#c5e82e]/10' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleTimeSlotSelect(slot.id)}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center">
                            <Clock3Icon className={`w-4 h-4 mr-2 ${isSelected ? 'text-[#c5e82e]' : 'text-gray-400'}`} />
                            <span className={isSelected ? 'font-medium' : ''}>{slot.time}</span>
                            
                            {isSelected && (
                              <div className="ml-auto">
                                <div className="bg-[#c5e82e] rounded-full p-1">
                                  <CheckIcon className="h-3 w-3 text-black" />
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  <div className="text-sm text-gray-500 mt-4">
                    <span className="font-medium">Selected: </span>
                    {selectedTimeSlots.length > 0 
                      ? selectedTimeSlots.map(id => 
                          timeSlots.find(slot => slot.id === id)?.time
                        ).join(', ')
                      : 'None'}
                  </div>
                </CardContent>
              </Card>
              
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  onClick={handleSubmit}
                  disabled={selectedDaysOfWeek.length === 0 || selectedTimeSlots.length === 0 || submitLoading}
                  className={`bg-black text-white hover:bg-gray-800 px-8 py-6 rounded-full text-lg border-b-4 border-[#c5e82e] min-w-[200px] ${
                    submitLoading ? 'opacity-80' : ''
                  }`}
                >
                  {submitLoading ? (
                    <>
                      <div className="h-5 w-5 mr-2 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Complete Plan Setup'
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlanSelection;