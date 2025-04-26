import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Input } from '../../components/ui/input';
import { 
  CarIcon, 
  PlusIcon, 
  WrenchIcon,
  DropletIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  HomeIcon,
  BadgeIcon,
  TrendingUpIcon,
  SparklesIcon,
  SearchIcon,
  StarIcon,
  CheckIcon,
  HelpCircleIcon as QuestionMarkCircleIcon,
  CameraIcon,
  HistoryIcon,
  Trash2Icon,
  Pencil,
  Wrench as ToolIcon,
  ClipboardCheck as ClipboardIcon
} from 'lucide-react';
import Header from '../../components/Header';
import { format, addDays } from 'date-fns';
import { motion } from 'framer-motion';

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
  description?: string;
  category?: string;
  frequency?: string;
  popular?: boolean;
  isMonthlyPlan?: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [userCar, setUserCar] = useState<UserCar | null>(null);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recommendedServices, setRecommendedServices] = useState<any[]>([]);
  const [bookedPlans, setBookedPlans] = useState<BookedPlan[]>([]);

  // Update the Plan interface to include more fields
  const plans: Plan[] = [
    {
      id: 'monthly-basic',
      name: 'Basic Monthly Plan',
      price: 3999,
      description: 'Essential care for your vehicle with regular exterior cleaning',
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
    {
      id: 'monthly-premium',
      name: 'Premium Monthly Plan',
      price: 5999,
      description: 'Complete care package with interior and exterior attention',
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
    {
      id: 'monthly-ultimate',
      name: 'Ultimate Monthly Plan',
      price: 8999,
      description: 'The complete package for car enthusiasts who demand perfection',
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
  ];

  useEffect(() => {
    checkUser();
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
            className={`pb-4 px-2 font-medium whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'dashboard' 
                ? 'text-black border-b-2 border-[#c5e82e]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <HomeIcon className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            className={`pb-4 px-2 font-medium whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'plans' 
                ? 'text-black border-b-2 border-[#c5e82e]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('plans')}
          >
            <ClipboardIcon className="w-4 h-4" />
            Subscription Plans
          </button>
          <button 
            className={`pb-4 px-2 font-medium whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'car' 
                ? 'text-black border-b-2 border-[#c5e82e]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('car')}
          >
            <CarIcon className="w-4 h-4" />
            My Vehicles
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {userCar ? (
              <div className="space-y-8">
                {/* Quick stats overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Next service card */}
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-shadow border-0 overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-[#c5e82e]" />
                          Next Service
                        </CardTitle>
                        <Badge className="bg-[#c5e82e] text-black">Tomorrow</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-[#c5e82e]/10 p-4 border border-[#c5e82e]/30 mb-4">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 text-[#c5e82e] mr-2" />
                          <span className="text-sm font-medium">{bookedPlans.length > 0 ? bookedPlans[0].timeSlots[0] : "9:00 AM - 10:00 AM"}</span>
                        </div>
                        <div className="text-2xl font-bold mt-1">{format(addDays(new Date(), 1), 'EEE, MMM d')}</div>
                        <div className="text-sm text-gray-600 mt-1 flex items-center">
                          <ShieldCheckIcon className="w-3.5 h-3.5 mr-1.5" />
                          {bookedPlans.length > 0 ? 'Premium Cleaning Service' : 'Exterior + Interior Cleaning'}
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
                  
                  {/* Services usage card */}
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-shadow border-0 overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DropletIcon className="w-5 h-5 text-[#c5e82e]" />
                          Services Used
                        </CardTitle>
                        <div className="bg-white p-2 rounded-full border border-gray-100">
                          <CheckCircleIcon className="w-4 h-4 text-[#c5e82e]" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2">
                        <div className="text-3xl font-bold">{bookedPlans.length > 0 ? bookedPlans[0].completedServices : 3}</div>
                        <p className="text-sm text-gray-500 mb-1">of {bookedPlans.length > 0 ? bookedPlans[0].totalServices : 8} this month</p>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <motion.div 
                          className="bg-[#c5e82e] h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: bookedPlans.length > 0 ? `${(bookedPlans[0].completedServices / bookedPlans[0].totalServices) * 100}%` : '60%' }}
                          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <TrendingUpIcon className="w-3 h-3 mr-1 text-[#c5e82e]" />
                        {bookedPlans.length > 0 ? (bookedPlans[0].totalServices - bookedPlans[0].completedServices) : 5} remaining this month
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Current plan or CTA card */}
                  {bookedPlans.length > 0 ? (
                    <Card className="bg-gradient-to-br from-gray-900 to-black text-white border-0 overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BadgeIcon className="w-5 h-5 text-[#c5e82e]" />
                            Current Plan
                          </CardTitle>
                          <Badge className="bg-[#c5e82e] text-black">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h3 className="text-xl font-bold">{bookedPlans[0].name}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Started on {format(new Date(bookedPlans[0].startDate), 'MMM d, yyyy')}
                        </p>
                        
                        <Separator className="my-3 bg-gray-700" />
                        
                        <div className="flex items-baseline mb-3">
                          <span className="text-4xl font-bold">₹{bookedPlans[0].price.toLocaleString('en-IN')}</span>
                          <span className="text-gray-600 ml-2">/month</span>
                        </div>
                        
                        <Button className="w-full bg-[#c5e82e] hover:bg-[#d0f53a] text-black">
                          Manage Plan
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-gradient-to-br from-gray-900 to-black text-white border-0 overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BadgeIcon className="w-5 h-5 text-[#c5e82e]" />
                            Subscription
                          </CardTitle>
                          <Badge variant="outline" className="text-gray-300 border-gray-600">No Active Plan</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 mb-4">
                          Subscribe to a plan to enjoy regular car wash services customized for your vehicle.
                        </p>
                        <Button className="w-full bg-[#c5e82e] hover:bg-[#d0f53a] text-black" onClick={() => setActiveTab('plans')}>
                          Choose a Plan
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                {/* Active plan details - only show if user has a plan */}
                {bookedPlans.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="overflow-hidden border-0 shadow-md">
                      <CardHeader className="bg-gradient-to-r from-gray-900 to-black">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <ShieldCheckIcon className="w-5 h-5 text-[#c5e82e]" />
                              Plan Details
                            </h3>
                            <p className="text-[#c5e82e] text-sm mt-1">
                              Next service {format(new Date(bookedPlans[0].nextServiceDate), 'EEEE, MMMM d')}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
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
                            <h4 className="font-bold">Included Services</h4>
                          </div>
                          <ul className="text-sm space-y-1">
                            {bookedPlans[0].features.slice(0, 3).map((feature, idx) => (
                              <motion.li 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="flex items-start"
                              >
                                <div className="mt-1 mr-2 text-[#c5e82e]">•</div>
                                <span className="text-gray-700">{feature}</span>
                              </motion.li>
                            ))}
                            {bookedPlans[0].features.length > 3 && (
                              <li className="text-sm text-gray-500 mt-1">+ {bookedPlans[0].features.length - 3} more services</li>
                            )}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Upcoming services */}
                      <div className="border-t p-6">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-[#c5e82e]" />
                          Upcoming Services
                        </h4>
                        <div className="space-y-4">
                          {[...Array(3)].map((_, idx) => {
                            const date = addDays(new Date(bookedPlans[0].nextServiceDate), idx * 2);
                            return (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (idx * 0.1) }}
                                className="flex items-center justify-between bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center">
                                  <div className="bg-[#c5e82e]/10 p-2 rounded-lg mr-4">
                                    <DropletIcon className="w-5 h-5 text-[#c5e82e]" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{idx === 0 ? 'Premium' : idx === 1 ? 'Standard' : 'Express'} Cleaning</div>
                                    <div className="text-sm text-gray-500">{format(date, 'EEEE, MMMM d')}</div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div className="text-sm text-gray-500 mr-4">{bookedPlans[0].timeSlots[0]}</div>
                                  <Button variant="outline" size="sm" className="rounded-full">
                                    {idx === 0 ? 'Reschedule' : 'Change'}
                                  </Button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
                
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
                <div className="max-w-md mx-auto">
                  <div className="mb-6 w-24 h-24 bg-[#c5e82e]/10 rounded-full mx-auto flex items-center justify-center">
                    <CarIcon className="w-12 h-12 text-[#c5e82e]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Welcome to Wiper!</h3>
                  <p className="text-gray-600 mb-8 px-6">
                    To get started, add your vehicle details so we can provide personalized washing services tailored to your car.
                  </p>
                  <Button 
                    onClick={handleAddCar}
                    className="bg-black text-white hover:bg-gray-800 px-8 py-4 rounded-full border-b-2 border-[#c5e82e]"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Your Car
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            {/* Show active plan banner if user has an active plan */}
            {bookedPlans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-md rounded-xl border border-[#c5e82e]/30 p-6 mb-8"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#c5e82e]/20 p-3 rounded-full">
                      <CheckCircleIcon className="w-8 h-8 text-[#c5e82e]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{bookedPlans[0].name}</h3>
                        <Badge className="bg-[#c5e82e] text-black">Active</Badge>
                      </div>
                      <p className="text-gray-600">
                        You're currently subscribed to our {bookedPlans[0].name.split(' ')[0]} plan 
                        until {format(addDays(new Date(bookedPlans[0].startDate), 30), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-[#c5e82e] text-black hover:bg-[#c5e82e]/10 rounded-full"
                    onClick={() => setActiveTab('dashboard')}
                  >
                    View Plan Details
                  </Button>
                </div>
              </motion.div>
            )}

            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {bookedPlans.length > 0 ? 'Manage Your Subscription' : 'Choose Your Perfect Plan'}
              </h2>
              <p className="text-gray-600">
                {bookedPlans.length > 0 
                  ? 'Compare your current plan with our other options or make changes to your subscription.'
                  : 'Select from our range of subscription options designed to keep your vehicle spotless. All plans include professional service by our expert wipers.'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col h-full"
                >
                  <Card 
                    className={`overflow-hidden flex flex-col h-full border-0 ${
                      plan.name === 'Premium' 
                        ? 'shadow-xl shadow-[#c5e82e]/10' 
                        : 'shadow-lg'
                    } ${
                      bookedPlans.length > 0 && bookedPlans[0].name.includes(plan.name)
                        ? 'ring-2 ring-[#c5e82e]'
                        : ''
                    }`}
                  >
                    {plan.name === 'Premium' && (
                      <div className="bg-[#c5e82e] text-black text-center py-2 text-sm font-bold">
                        MOST POPULAR
                      </div>
                    )}
                    
                    <CardContent className="p-8 flex flex-col flex-grow">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-2xl font-bold">{plan.name}</div>
                          {bookedPlans.length > 0 && bookedPlans[0].name.includes(plan.name) && (
                            <Badge className="bg-[#c5e82e] text-black px-3 py-1 text-xs font-semibold whitespace-nowrap">
                              Current Plan
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-baseline mb-6">
                          <span className="text-4xl font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
                          <span className="text-gray-600 ml-2">/month</span>
                        </div>
                        
                        <Separator className="mb-6" />
                        
                        <ul className="space-y-4 mb-8">
                          {plan.features.map((feature, index) => (
                            <motion.li 
                              key={index} 
                              className="flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                            >
                              <div className={`flex-shrink-0 w-5 h-5 rounded-full ${
                                plan.name === 'Premium'
                                  ? 'bg-[#c5e82e]'
                                  : 'bg-gray-200'
                              } flex items-center justify-center mt-0.5 mr-3`}>
                                <CheckIcon className={`w-3 h-3 ${
                                  plan.name === 'Premium'
                                    ? 'text-black'
                                    : 'text-gray-600'
                                }`} />
                              </div>
                              <span className="text-gray-700">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-auto">
                        {bookedPlans.length > 0 && bookedPlans[0].name.includes(plan.name) ? (
                          <Button
                            variant="outline"
                            className="w-full py-6 border-[#c5e82e] text-black hover:bg-[#c5e82e]/10"
                          >
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            className={`w-full py-6 ${
                              plan.name === 'Premium' 
                                ? 'bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e]' 
                                : 'bg-white text-black border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {bookedPlans.length > 0 ? 'Switch Plan' : 'Subscribe Now'}
                          </Button>
                        )}
                        
                        {plan.name === 'Premium' && (
                          <p className="text-center text-sm text-gray-500 mt-4">
                            30-day satisfaction guarantee
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {/* Show plan management section if user has an active plan */}
            {bookedPlans.length > 0 && (
              <div className="bg-white rounded-2xl p-8 mt-12 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <DropletIcon className="w-5 h-5 text-[#c5e82e]" />
                  Plan Management Options
                </h3>
                
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-xl">
                    <Button 
                      variant="outline" 
                      className="md:w-1/3 border-dashed border-gray-300"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Change Schedule
                    </Button>
                    <Button 
                      variant="outline" 
                      className="md:w-1/3 border-dashed border-gray-300"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Update Payment
                    </Button>
                    <Button 
                      variant="outline" 
                      className="md:w-1/3 border-dashed border-gray-300 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                    >
                      <Trash2Icon className="w-4 h-4 mr-2" />
                      Cancel Plan
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 flex items-start gap-3">
                    <QuestionMarkCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Need help with your subscription?</p>
                      <p className="text-sm mt-1">Our customer service team is available 24/7 to assist you with any questions about your plan.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-2xl p-8 mt-12 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <QuestionMarkCircleIcon className="w-5 h-5 text-[#c5e82e]" />
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium mb-2">Can I cancel my subscription anytime?</h4>
                  <p className="text-gray-600 text-sm">Yes, all our plans can be cancelled at any time with no cancellation fees.</p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium mb-2">How do I schedule my car wash?</h4>
                  <p className="text-gray-600 text-sm">After subscribing, you can choose your preferred days and time slots from the dashboard.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">What if I'm not satisfied with the service?</h4>
                  <p className="text-gray-600 text-sm">We offer a satisfaction guarantee. If you're not happy with a service, we'll redo it at no extra charge.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Car Tab */}
        {activeTab === 'car' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CarIcon className="w-6 h-6 text-[#c5e82e]" />
                <span>My Vehicles</span>
              </h2>
              
              <Button 
                onClick={handleAddCar}
                className="bg-black text-white hover:bg-gray-800 rounded-full border-b-2 border-[#c5e82e]"
              >
                <PlusIcon className="w-4 h-4 mr-2" /> Add Vehicle
              </Button>
            </div>
            
            {userCar ? (
              <div className="space-y-6">
                <Card className="overflow-hidden border-0 rounded-2xl shadow-lg">
                  <div className="bg-gradient-to-r from-gray-900 to-black p-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white">Primary Vehicle</h3>
                      <Badge className="bg-[#c5e82e] text-black">Active</Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col md:flex-row">
                      <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
                        <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center">
                          <div className="bg-gray-200 p-4 rounded-full">
                            <CarIcon className="w-16 h-16 text-gray-400" />
                          </div>
                        </div>
                        <div className="flex justify-center mt-4">
                          <Button variant="outline" size="sm" className="rounded-full text-xs">
                            <CameraIcon className="w-3 h-3 mr-1" />
                            Upload Photo
                          </Button>
                        </div>
                      </div>
                      
                      <div className="md:w-2/3">
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          {userCar.year} {userCar.make} {userCar.model}
                          <Badge className="bg-gray-100 text-gray-700">
                            {userCar.size.charAt(0).toUpperCase() + userCar.size.slice(1)}
                          </Badge>
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500">Color</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                              <p className="font-medium">{userCar.color}</p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500">License Plate</p>
                            <p className="font-medium mt-1">{userCar.plate_number || 'Not provided'}</p>
                          </div>
                          
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500">Recommended Service</p>
                            <p className="font-medium mt-1">{
                              userCar.size === 'suv' ? 'Deep Clean Package' :
                              userCar.size === 'small' ? 'Compact Wash' : 
                              'Standard Exterior Wash'
                            }</p>
                          </div>
                          
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500">Next Service</p>
                            <p className="font-medium mt-1">{
                              bookedPlans.length > 0 
                                ? format(new Date(bookedPlans[0].nextServiceDate), 'MMM d, yyyy')
                                : 'No service scheduled'
                            }</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 mt-6">
                          <Button className="bg-black text-white hover:bg-gray-800">
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Vehicle
                          </Button>
                          <Button variant="outline">
                            <HistoryIcon className="w-4 h-4 mr-2" />
                            Service History
                          </Button>
                          <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                            <Trash2Icon className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Service history section */}
                    <div className="p-6">
                      <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <HistoryIcon className="w-5 h-5 text-[#c5e82e]" />
                        Recent Services
                      </h4>
                      
                      <div className="space-y-4">
                        {[1, 2, 3].map(item => (
                          <div key={item} className="flex justify-between items-center border-b pb-4 last:border-0">
                            <div className="flex gap-4">
                              <div className="bg-gray-100 p-2 rounded-lg">
                                <DropletIcon className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium">{['Full Exterior Wash', 'Premium Detailing', 'Quick Clean'][item % 3]}</div>
                                <div className="text-sm text-gray-500">April {20 + item}, 2025</div>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          </div>
                        ))}
                      </div>
                      
                      <Button variant="ghost" className="w-full mt-4 text-gray-600">
                        View All History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ToolIcon className="w-5 h-5 text-[#c5e82e]" />
                      Recommended Maintenance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <WrenchIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">Interior Deep Clean</div>
                            <div className="text-sm text-gray-500">Recommended every 3 months</div>
                          </div>
                        </div>
                        <Button className="bg-black hover:bg-gray-800 text-white rounded-full border-b-2 border-[#c5e82e]">
                          Book Service
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">Wax Protection</div>
                            <div className="text-sm text-gray-500">Recommended every 2 months</div>
                          </div>
                        </div>
                        <Button className="bg-black hover:bg-gray-800 text-white rounded-full border-b-2 border-[#c5e82e]">
                          Book Service
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="bg-[#c5e82e]/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CarIcon className="w-12 h-12 text-[#c5e82e]" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No vehicles added yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Add your vehicle details so we can provide personalized washing services tailored to your car
                </p>
                <Button 
                  onClick={handleAddCar}
                  className="bg-black text-white hover:bg-gray-800 px-8 py-4 rounded-full border-b-2 border-[#c5e82e]"
                >
                  <PlusIcon className="w-5 h-5 mr-2" /> Add Your Car
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};