import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, clearAuthStorage } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge'; // Add Badge component import
import { Separator } from '../../components/ui/separator';
import { 
  CarIcon, 
  PlusIcon, 
  WrenchIcon,
  Calendar, 
  ChevronRightIcon, 
  DropletIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon,
  ClockIcon,
  CalendarIcon
} from 'lucide-react';
import Header from '../../components/Header';
import { format, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Wiper {
  id: string;
  name: string;
  experience: string;
  rating: number;
  price_per_wash: number;
  available: boolean;
}

interface User {
  email?: string;
  user_metadata?: {
    name?: string;
  };
}

interface UserCar {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  size: 'small' | 'medium' | 'large' | 'suv';
  plate_number?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

interface BookedPlan {
  id: string;
  name: string;
  startDate: string;
  daysOfWeek: number[];
  timeSlots: string[];
  features: string[];
  nextServiceDate: string;
  completedServices: number;
  totalServices: number;
  price: number;
}

const formatDaysOfWeek = (days: number[]) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map(day => dayNames[day]).join(', ');
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [wipers, setWipers] = useState<Wiper[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userCar, setUserCar] = useState<UserCar | null>(null);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recommendedServices, setRecommendedServices] = useState<any[]>([]);
  const [bookedPlans, setBookedPlans] = useState<BookedPlan[]>([]);

  // Placeholder plans - replace with actual plans from your database
  const plans: Plan[] = [
    {
      id: '1',
      name: 'Basic',
      price: 99.99,
      features: ['1 car wash per week', 'Basic exterior cleaning', 'Window cleaning']
    },
    {
      id: '2',
      name: 'Premium',
      price: 149.99,
      features: ['2 car washes per week', 'Interior & exterior cleaning', 'Window cleaning', 'Tire shine']
    },
    {
      id: '3',
      name: 'Ultimate',
      price: 199.99,
      features: ['Unlimited car washes', 'Full detailing service', 'Interior vacuum cleaning', 'Waxing', 'Tire shine', 'Priority booking']
    }
  ];

  useEffect(() => {
    checkUser();
    fetchWipers();
  }, []);

  useEffect(() => {
    if (userCar) {
      fetchRecommendedServices(userCar.size);
    }
  }, [userCar]);

  useEffect(() => {
    // In a real app, fetch from your database
    // For demo, we'll use mock data
    const fetchBookedPlans = async () => {
      // Check for plan info passed from plan-selection screen
      const state = window.history.state?.usr;
      
      if (state?.success && userCar) {
        // Create a new booked plan based on the state data
        const mockPlan: BookedPlan = {
          id: 'plan-' + Date.now(),
          name: 'Premium Monthly Plan',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
          timeSlots: ['10:00 AM - 11:30 AM'],
          features: [
            '6 exterior washes per week',
            '2 interior cleanings per month',
            'Priority scheduling',
            'Slot based on your selection',
            'Daily updates with photos'
          ],
          nextServiceDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
          completedServices: 0,
          totalServices: 24,
          price: 5999
        };
        
        // Add the new plan
        setBookedPlans([mockPlan]);
        
        // Clear the state to avoid duplication on refresh
        window.history.replaceState({}, document.title);
      } else {
        // Mock existing plans
        const mockPlans: BookedPlan[] = userCar ? [
          {
            id: 'plan-1',
            name: 'Premium Monthly Plan',
            startDate: '2025-04-15',
            daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
            timeSlots: ['10:00 AM - 11:30 AM'],
            features: [
              '6 exterior washes per week',
              '2 interior cleanings per month',
              'Priority scheduling',
              'Slot based on your selection',
              'Daily updates with photos'
            ],
            nextServiceDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
            completedServices: 8,
            totalServices: 24,
            price: 5999
          }
        ] : [];
        
        setBookedPlans(mockPlans);
      }
    };
    
    fetchBookedPlans();
  }, [userCar]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
      return;
    }
    
    // Set user data
    setUser({
      email: session.user.email || '',
      user_metadata: session.user.user_metadata,
    });
    
    // Check if user has a subscription (this would be from your actual database)
    // For demo purposes, we'll just simulate a subscription check
    const { data: subscriptionData } = await supabase
      .from('wipers')
      .select('*')
      .limit(1);
      
    setHasSubscription(!!subscriptionData);
    
    // Fetch user's car information
    // This would be replaced with an actual query to your cars table
    // For now we'll use a placeholder car
    const { data: carData } = await supabase
      .from('user_cars')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (carData) {
      setUserCar(carData);
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
    try {
      console.log('🔄 Signing out user...');
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any local storage items related to auth
      clearAuthStorage();
      
      // Navigate to home
      console.log('✅ User signed out successfully, redirecting to login');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ Error signing out:', error);
      // Force sign out by clearing storage even if there was an error
      clearAuthStorage();
      navigate('/');
    }
  };

  const getUserName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const handleAddCar = () => {
    navigate('/add-car');
  };

  const fetchRecommendedServices = (carType: string) => {
    // In a real app, you'd fetch this from your database based on car type
    const services = {
      hatchback: [
        {
          id: '1',
          name: 'Compact Exterior Wash',
          description: 'Quick and efficient exterior cleaning tailored for smaller vehicles',
          duration: '30 mins',
          price: 19.99,
          image: '/services/hatchback-wash.jpg'
        },
        {
          id: '2',
          name: 'Eco Clean Package',
          description: 'Water-efficient wash perfect for compact cars with eco-friendly products',
          duration: '45 mins',
          price: 29.99,
          image: '/services/eco-clean.jpg'
        },
        {
          id: '3',
          name: 'City Car Protection',
          description: 'Special coating to protect against urban pollutants and scratches',
          duration: '60 mins',
          price: 39.99,
          image: '/services/city-protection.jpg'
        }
      ],
      sedan: [
        {
          id: '1',
          name: 'Full Sedan Wash',
          description: 'Complete exterior wash designed specifically for sedan bodies',
          duration: '45 mins',
          price: 24.99,
          image: 'https://images.unsplash.com/photo-1636427743695-eccbf1c05af6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
          id: '2',
          name: 'Executive Interior Clean',
          description: 'Premium interior detailing for a professional clean look',
          duration: '60 mins',
          price: 44.99,
          image: 'https://images.unsplash.com/photo-1602786195490-c785a218df40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
          id: '3',
          name: 'Commuter Special',
          description: 'Quick wash and vacuum ideal for daily drivers',
          duration: '35 mins',
          price: 29.99,
          image: 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
      ],
      coupe: [
        {
          id: '1',
          name: 'Sports Car Detail',
          description: 'Specialized cleaning for aerodynamic bodies and performance vehicles',
          duration: '60 mins',
          price: 49.99,
          image: '/services/sports-detail.jpg'
        },
        {
          id: '2',
          name: 'Performance Wax',
          description: 'High-gloss wax treatment for show-quality finish',
          duration: '75 mins',
          price: 59.99,
          image: '/services/performance-wax.jpg'
        },
        {
          id: '3',
          name: 'Weekend Warrior',
          description: 'Complete prep package to get your coupe ready for weekend drives',
          duration: '90 mins',
          price: 69.99,
          image: '/services/weekend-warrior.jpg'
        }
      ],
      suv: [
        {
          id: '1',
          name: 'SUV Deep Clean',
          description: 'Extra attention for larger vehicles with hard-to-reach areas',
          duration: '75 mins',
          price: 59.99,
          image: '/services/suv-clean.jpg'
        },
        {
          id: '2',
          name: 'Family Vehicle Package',
          description: 'Interior sanitization and stain removal perfect for family SUVs',
          duration: '90 mins',
          price: 69.99,
          image: '/services/family-package.jpg'
        },
        {
          id: '3',
          name: 'Off-Road Recovery',
          description: 'Special cleaning for SUVs after outdoor adventures',
          duration: '120 mins',
          price: 89.99,
          image: '/services/offroad-recovery.jpg'
        }
      ]
    };
    
    // Set recommended services based on car type
    setRecommendedServices(services[carType as keyof typeof services] || services.sedan);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-100">
        <div className="animate-pulse text-xl font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100">
      {/* Header */}
      <Header />

      {/* Welcome Banner */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {getUserName()}
              </h1>
              <p className="mt-2 text-gray-300">
                {hasSubscription 
                  ? 'Your car deserves the best care. Check out your dashboard below.' 
                  : 'Your car deserves a wipe everyday! Choose a subscription plan to get started.'}
              </p>
            </div>
            
            {userCar ? (
              <div className="mt-4 md:mt-0 bg-gray-800 rounded-lg p-3 flex items-center space-x-3">
                <div className="bg-gray-700 p-2 rounded-md">
                  <CarIcon className="text-white w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-medium">{userCar.year} {userCar.make} {userCar.model}</div>
                  <div className="text-gray-400 text-sm">{userCar.color} • {userCar.plate_number || 'No plate'}</div>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleAddCar}
                className="mt-4 md:mt-0 bg-white text-black hover:bg-gray-100 rounded-full"
              >
                <PlusIcon className="w-4 h-4 mr-2" /> Add Your Car
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-6 border-b overflow-x-auto scrollbar-hide">
          <button 
            className={`pb-4 px-2 font-medium whitespace-nowrap ${activeTab === 'dashboard' 
              ? 'text-black border-b-2 border-black' 
              : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`pb-4 px-2 font-medium whitespace-nowrap ${activeTab === 'wipers' 
              ? 'text-black border-b-2 border-black' 
              : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('wipers')}
          >
            Car Wipers
          </button>
          <button 
            className={`pb-4 px-2 font-medium whitespace-nowrap ${activeTab === 'plans' 
              ? 'text-black border-b-2 border-black' 
              : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('plans')}
          >
            Subscription Plans
          </button>
          <button 
            className={`pb-4 px-2 font-medium whitespace-nowrap ${activeTab === 'car' 
              ? 'text-black border-b-2 border-black' 
              : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('car')}
          >
            My Car
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {hasSubscription ? (
              <div className="space-y-6">
                {/* Personalized recommendation based on car type */}
                {userCar && (
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg">
                          <WrenchIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium text-lg">Recommended for your {userCar.make} {userCar.model}</h3>
                          <p className="text-gray-600 mt-1">
                            {userCar.size === 'suv' ? 
                              'SUVs need special attention for their larger surfaces. We recommend our Premium package that includes interior detailing.' :
                              'Based on your car model, we recommend a full exterior wash with waxing protection every two weeks.'}
                          </p>
                          <Button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                            Schedule Recommended Service
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Next Service</CardTitle>
                        <div className="bg-white border border-gray-200 p-2 rounded-full">
                          <CalendarIcon className="w-5 h-5 text-gray-700" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-[#c5e82e]/10 p-4 border border-[#c5e82e]/30 mb-4">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 text-[#c5e82e] mr-2" />
                          <span className="text-sm font-medium">{bookedPlans.length > 0 ? bookedPlans[0].timeSlots[0] : "9:00 AM - 10:00 AM"}</span>
                        </div>
                        <div className="text-2xl font-bold mt-1">Tomorrow</div>
                        <div className="text-sm text-gray-600 mt-1 flex items-center">
                          <ShieldCheckIcon className="w-3.5 h-3.5 mr-1.5" />
                          Exterior + Interior Cleaning
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button variant="outline" className="w-[48%] text-sm rounded-full">
                          Skip
                        </Button>
                        <Button variant="outline" className="w-[48%] text-sm rounded-full border-[#c5e82e] bg-[#c5e82e]/5 text-black hover:bg-[#c5e82e]/10">
                          Reschedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Services Used</CardTitle>
                        <div className="bg-white p-2 rounded-full">
                          <ClockIcon className="w-5 h-5 text-gray-700" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">3</div>
                      <p className="text-sm text-gray-500 mt-2">This month</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div className="bg-black h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">5 remaining this month</p>
                    </CardContent>
                  </Card>
                  
                  {bookedPlans.length > 0 ? (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-3"
                      >
                        <Card className="overflow-hidden border-0 shadow-lg">
                          <div className="bg-gradient-to-r from-gray-900 to-black p-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-xl font-bold text-white">Your Active Plan</h3>
                                <p className="text-[#c5e82e] mt-1">
                                  Next service tomorrow
                                </p>
                              </div>
                              <Badge className="bg-[#c5e82e] text-black px-3 py-1">
                                Active
                              </Badge>
                            </div>
                          </div>
                          
                          <CardContent className="p-0">
                            {/* Plan details section */}
                            <div className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                                <div>
                                  <h3 className="text-2xl font-bold">{bookedPlans[0].name}</h3>
                                  <p className="text-gray-500 mt-1">Started on {format(new Date(bookedPlans[0].startDate), 'MMM dd, yyyy')}</p>
                                </div>
                                <div className="mt-4 md:mt-0">
                                  <div className="text-2xl font-bold">₹{bookedPlans[0].price.toLocaleString('en-IN')}</div>
                                  <p className="text-gray-500 text-sm text-right">per month</p>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">Monthly Progress</span>
                                  <span className="text-sm text-gray-600">
                                    {bookedPlans[0].completedServices} of {bookedPlans[0].totalServices} services
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                  <motion.div 
                                    className="bg-[#c5e82e] h-3 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ 
                                      width: `${(bookedPlans[0].completedServices / bookedPlans[0].totalServices) * 100}%` 
                                    }}
                                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                                  ></motion.div>
                                </div>
                              </div>
                              
                              {/* Schedule summary */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                  <div className="flex items-center mb-3">
                                    <CalendarIcon className="w-5 h-5 text-gray-700 mr-2" />
                                    <h4 className="font-bold">Schedule</h4>
                                  </div>
                                  <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex justify-between">
                                      <span>Days:</span>
                                      <span className="font-medium">{formatDaysOfWeek(bookedPlans[0].daysOfWeek)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Time:</span>
                                      <span className="font-medium">{bookedPlans[0].timeSlots[0]}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Next service:</span>
                                      <span className="font-medium">{format(new Date(bookedPlans[0].nextServiceDate), 'EEE, MMM d')}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-xl">
                                  <div className="flex items-center mb-3">
                                    <CheckCircleIcon className="w-5 h-5 text-gray-700 mr-2" />
                                    <h4 className="font-bold">Includes</h4>
                                  </div>
                                  <ul className="text-sm space-y-1">
                                    {bookedPlans[0].features.slice(0, 3).map((feature, idx) => (
                                      <motion.li 
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className="flex items-start"
                                      >
                                        <div className="mt-1 mr-2 text-[#c5e82e]">•</div>
                                        <span className="text-gray-700">{feature}</span>
                                      </motion.li>
                                    ))}
                                    {bookedPlans[0].features.length > 3 && (
                                      <li className="text-sm text-gray-500">+ {bookedPlans[0].features.length - 3} more</li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            
                            {/* Next upcoming services */}
                            <div className="border-t">
                              <div className="p-6">
                                <h4 className="font-bold mb-4">Upcoming Services</h4>
                                <div className="space-y-4">
                                  {[...Array(3)].map((_, idx) => {
                                    const date = addDays(new Date(bookedPlans[0].nextServiceDate), idx * 2);
                                    return (
                                      <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + (idx * 0.1) }}
                                        className="flex items-center justify-between bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
                                      >
                                        <div className="flex items-center">
                                          <div className="bg-[#c5e82e]/10 p-2 rounded-lg mr-4">
                                            <DropletIcon className="w-5 h-5 text-[#c5e82e]" />
                                          </div>
                                          <div>
                                            <div className="font-medium">{bookedPlans[0].name.split(' ')[0]} Cleaning Service</div>
                                            <div className="text-sm text-gray-500">{format(date, 'EEEE, MMMM d')}</div>
                                          </div>
                                        </div>
                                        <div className="flex items-center">
                                          <div className="text-sm text-gray-500 mr-4">{bookedPlans[0].timeSlots[0]}</div>
                                          <Button variant="outline" size="sm" className="rounded-full">
                                            Reschedule
                                          </Button>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="bg-gray-50 p-6 border-t">
                              <div className="flex flex-wrap gap-4 justify-end">
                                <Button variant="outline" className="rounded-full">
                                  Manage Plan
                                </Button>
                                <Button className="rounded-full bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e]">
                                  Add Special Service
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-shadow col-span-1">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Current Plan</CardTitle>
                          <div className="bg-black p-2 rounded-full">
                            <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">No Active Plan</div>
                        <p className="text-sm text-gray-500 mt-2">Subscribe to get started</p>
                        <Button className="w-full mt-4 text-sm bg-black text-white hover:bg-gray-800">
                          Choose a Plan
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="mb-6 bg-gray-100 w-24 h-24 rounded-full mx-auto flex items-center justify-center">
                    <CarIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">Ready to keep your car clean?</h3>
                  <p className="text-gray-600 mb-8">
                    Get started with one of our plans to enjoy regular car washing services from our expert wipers, customized for your vehicle.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('plans')}
                    className="bg-black text-white hover:bg-gray-800 px-8 py-4 rounded-full text-lg"
                  >
                    View Plans
                  </Button>
                </div>
              </div>
            )}

            {userCar && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Recommended for your {userCar.size.charAt(0).toUpperCase() + userCar.size.slice(1)}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedServices.map((service) => (
                    <motion.div
                      key={service.id}
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all">
                        <div className="h-48 bg-gray-200 relative">
                          {/* Replace with actual image */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CarIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold">{service.name}</h3>
                            <div className="bg-black text-white px-3 py-1 rounded-full text-sm">
                              ${service.price}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              {service.duration}
                            </span>
                            <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-5">
                              Book Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wipers Tab */}
        {activeTab === 'wipers' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Expert Car Wipers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wipers.map((wiper) => (
                <Card key={wiper.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">{wiper.name}</h3>
                      <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-gray-700 font-medium">{wiper.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">{wiper.experience}</p>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">
                        ${wiper.price_per_wash}/wash
                      </span>
                      <Button
                        className="bg-black text-white rounded-full hover:bg-gray-800"
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card key={plan.id} className={`overflow-hidden ${plan.name === 'Premium' ? 'ring-2 ring-black' : ''}`}>
                  {plan.name === 'Premium' && (
                    <div className="bg-black text-white text-center py-2 text-sm font-medium">
                      MOST POPULAR
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="text-xl font-bold mb-1">{plan.name}</div>
                    <div className="flex items-baseline mb-6">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                    <Separator className="mb-6" />
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${plan.name === 'Premium' 
                        ? 'bg-black text-white hover:bg-gray-800' 
                        : 'bg-white text-black border border-gray-300 hover:bg-gray-50'}`}
                    >
                      Subscribe Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Car Tab */}
        {activeTab === 'car' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Vehicle</h2>
            
            {userCar ? (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
                        <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                          <CarIcon className="w-20 h-20 text-gray-400" />
                        </div>
                      </div>
                      <div className="md:w-2/3">
                        <h3 className="text-2xl font-bold mb-4">{userCar.year} {userCar.make} {userCar.model}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <p className="text-sm text-gray-500">Color</p>
                            <p className="font-medium">{userCar.color}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Size</p>
                            <p className="font-medium capitalize">{userCar.size}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">License Plate</p>
                            <p className="font-medium">{userCar.plate_number || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3 mt-6">
                          <Button className="bg-black text-white hover:bg-gray-800">
                            Edit Details
                          </Button>
                          <Button variant="outline">
                            Add Another Vehicle
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Service History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map(item => (
                        <div key={item} className="flex justify-between border-b pb-4 last:border-0">
                          <div>
                            <div className="font-medium">Full Exterior Wash</div>
                            <div className="text-sm text-gray-500">April {20 + item}, 2025</div>
                          </div>
                          <div className="text-sm font-medium">Completed</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <WrenchIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">Interior Deep Clean</div>
                            <div className="text-sm text-gray-500">Recommended every 3 months</div>
                          </div>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Book Service
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <WrenchIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">Wax Protection</div>
                            <div className="text-sm text-gray-500">Recommended every 2 months</div>
                          </div>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Book Service
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CarIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No vehicles added yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Add your vehicle details so we can provide personalized washing services for your car
                </p>
                <Button 
                  onClick={handleAddCar}
                  className="bg-black text-white hover:bg-gray-800 rounded-full"
                >
                  <PlusIcon className="w-4 h-4 mr-2" /> Add Your Car
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};