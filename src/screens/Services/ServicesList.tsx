import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { 
  Clock3Icon, 
  DollarSignIcon, 
  MapPinIcon, 
  ShieldIcon, 
  CheckCircleIcon,
  StarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from '../../components/ui/badge';
import { Separator } from "../../components/ui/separator";
import Header from '../../components/Header'; // Import the Header component

// Mock car images based on type
const carImageMap = {
  hatchback: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1000&auto=format&fit=crop",
  sedan: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop",
  coupe: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop",
  suv: "https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=1000&auto=format&fit=crop"
};

// Service images by category
const categoryImageMap = {
  Exterior: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=800&auto=format&fit=crop",
  Interior: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=800&auto=format&fit=crop",
  Protection: "https://images.unsplash.com/photo-1525121577197-98c232f5a81b?q=80&w=800&auto=format&fit=crop",
  Eco: "https://images.unsplash.com/photo-1532996122724-e3c864cb1d2a?q=80&w=800&auto=format&fit=crop",
  Express: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1605164599901-f8a1482a8c75?q=80&w=800&auto=format&fit=crop"
};

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  category: string;
  popular?: boolean;
}

interface UserCar {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  size: 'hatchback' | 'sedan' | 'coupe' | 'suv';
  plate_number?: string;
}

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

const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

const ServicesList = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [userCar, setUserCar] = useState<UserCar | null>(null);
  const [bookingService, setBookingService] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>("all");
  const [showServiceDetails, setShowServiceDetails] = useState<string | null>(null);

  useEffect(() => {
    const checkUserAndCar = async () => {
      setLoading(true);
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/');
          return;
        }
        
        setUser(session.user);
        
        // Fetch user's car information
        const { data: carData, error: carError } = await supabase
          .from('user_cars')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (carError) {
          console.error('Error fetching car data:', carError);
          return;
        }
        
        if (carData) {
          setUserCar(carData);
          // Fetch services for this car type
          fetchServices(carData.size);
        } else {
          // Redirect to add car page if no car found
          navigate('/add-car');
        }
      } catch (error) {
        console.error('Error checking user and car:', error);
      }
    };
    
    checkUserAndCar();
  }, [navigate]);

  useEffect(() => {
    if (currentCategory === "all") {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(service => service.category === currentCategory));
    }
  }, [currentCategory, services]);

  const fetchServices = async (carType: string) => {
    setLoading(true);
    
    // Map car size to a standard type for service matching
    const normalizedType = carType === 'coupe' ? 'sedan' : carType;
    
    // In a real app, fetch from your database based on car type
    const servicesByType: Record<string, Service[]> = {
      hatchback: [
        {
          id: 'h1',
          name: 'Compact Exterior Wash',
          description: 'Quick and efficient exterior cleaning tailored for smaller vehicles',
          duration: '30 mins',
          price: 19.99,
          category: 'Exterior'
        },
        {
          id: 'h2',
          name: 'Eco Clean Package',
          description: 'Water-efficient wash perfect for compact cars with eco-friendly products',
          duration: '45 mins',
          price: 29.99,
          category: 'Eco',
          popular: true
        },
        {
          id: 'h3',
          name: 'City Car Protection',
          description: 'Special coating to protect against urban pollutants and scratches',
          duration: '60 mins',
          price: 39.99,
          category: 'Protection'
        },
        {
          id: 'h4',
          name: 'Small Car Interior Detail',
          description: 'Complete interior clean designed specifically for compact spaces',
          duration: '45 mins',
          price: 34.99,
          category: 'Interior'
        },
        {
          id: 'h5',
          name: 'Glass & Trim Treatment',
          description: 'Specialized cleaning for windows and trim elements',
          duration: '25 mins',
          price: 19.99,
          category: 'Exterior'
        }
      ],
      sedan: [
        {
          id: 's1',
          name: 'Full Sedan Wash',
          description: 'Complete exterior wash designed specifically for sedan bodies',
          duration: '45 mins',
          price: 24.99,
          category: 'Exterior',
          popular: true
        },
        {
          id: 's2',
          name: 'Executive Interior Clean',
          description: 'Premium interior detailing for a professional clean look',
          duration: '60 mins',
          price: 44.99,
          category: 'Interior'
        },
        {
          id: 's3',
          name: 'Commuter Special',
          description: 'Quick wash and vacuum ideal for daily drivers',
          duration: '35 mins',
          price: 29.99,
          category: 'Express',
          popular: true
        },
        {
          id: 's4',
          name: 'Ceramic Coating',
          description: 'Long-lasting protection against environmental damage and UV rays',
          duration: '120 mins',
          price: 149.99,
          category: 'Protection'
        },
        {
          id: 's5',
          name: 'Leather Conditioning',
          description: 'Special treatment for leather seats to restore and protect',
          duration: '40 mins',
          price: 34.99,
          category: 'Interior'
        }
      ],
      suv: [
        {
          id: 'suv1',
          name: 'SUV Deep Clean',
          description: 'Extra attention for larger vehicles with hard-to-reach areas',
          duration: '75 mins',
          price: 59.99,
          category: 'Exterior',
          popular: true
        },
        {
          id: 'suv2',
          name: 'Family Vehicle Package',
          description: 'Interior sanitization and stain removal perfect for family SUVs',
          duration: '90 mins',
          price: 69.99,
          category: 'Interior'
        },
        {
          id: 'suv3',
          name: 'Off-Road Recovery',
          description: 'Special cleaning for SUVs after outdoor adventures',
          duration: '120 mins',
          price: 89.99,
          category: 'Exterior'
        },
        {
          id: 'suv4',
          name: 'Third Row Special',
          description: 'Complete cleaning of all rows including hard-to-reach third row',
          duration: '60 mins',
          price: 49.99,
          category: 'Interior'
        },
        {
          id: 'suv5',
          name: 'Premium Protection',
          description: 'Full body protection with advanced polymer sealants',
          duration: '100 mins',
          price: 89.99,
          category: 'Protection',
          popular: true
        }
      ]
    };
    
    // Get services for the car type or default to sedan if type not found
    const carServices = servicesByType[normalizedType] || servicesByType.sedan;
    
    // Add some delay to simulate API fetch
    setTimeout(() => {
      setServices(carServices);
      setFilteredServices(carServices); // Initialize filtered services with all services
      setLoading(false);
    }, 500);
  };

  const handleBookService = (serviceId: string) => {
    setBookingService(serviceId);
    
    // Show success message before navigating
    setTimeout(() => {
      navigate('/booking-confirmation', { 
        state: { 
          serviceId, 
          carDetails: userCar 
        } 
      });
    }, 800);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getServiceCategories = () => {
    const categories = services.map(service => service.category);
    return ["all", ...new Set(categories)];
  };

  const getCarImage = (car: UserCar | null) => {
    if (!car) return carImageMap.sedan;
    return carImageMap[car.size] || carImageMap.sedan;
  };
  
  const getServiceImage = (category: string) => {
    return categoryImageMap[category] || categoryImageMap.default;
  };

  const toggleServiceDetails = (serviceId: string) => {
    if (showServiceDetails === serviceId) {
      setShowServiceDetails(null);
    } else {
      setShowServiceDetails(serviceId);
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.user_metadata?.name) {
      const nameParts = user.user_metadata.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.user_metadata.name[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-medium text-gray-700">Loading your personalized services...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100"
    >
      {/* Use the Header component */}
      <Header />

      {/* Rest of the component stays the same */}
      {/* Vehicle Banner */}
      {userCar && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="h-[250px] sm:h-[300px] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40 z-10"></div>
            <motion.img 
              src={getCarImage(userCar)} 
              alt="Car"
              className="w-full h-full object-cover object-center"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
            />
            
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center sm:items-start text-center sm:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl"
                >
                  <Badge className="mb-2 bg-blue-500 text-white">Your Vehicle</Badge>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">
                    {userCar.year} {userCar.make} {userCar.model}
                  </h1>
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="outline" className="border-white/30 text-white">
                      {userCar.size.charAt(0).toUpperCase() + userCar.size.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="border-white/30 text-white">
                      {userCar.color.charAt(0).toUpperCase() + userCar.color.slice(1)}
                    </Badge>
                    {userCar.plate_number && (
                      <Badge variant="outline" className="border-white/30 text-white">
                        {userCar.plate_number}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Services Section */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="mb-10">
          <motion.h2 
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Welcome, {getUserDisplayName()}
          </motion.h2>
          <motion.p 
            className="text-gray-600 max-w-3xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Explore premium services tailored for your {userCar?.size}. Our experts use only high-quality products and techniques to keep your vehicle looking its best.
          </motion.p>
        </div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-10"
        >
          <Tabs defaultValue="all" value={currentCategory} onValueChange={setCurrentCategory} className="w-full">
            <TabsList className="w-full mb-6 bg-white shadow overflow-x-auto flex flex-nowrap p-1 rounded-xl">
              {getServiceCategories().map(category => (
                <TabsTrigger 
                  key={category}
                  value={category}
                  className={`flex-1 min-w-[100px] py-3 ${
                    currentCategory === category 
                      ? 'bg-black text-white rounded-lg shadow-lg' 
                      : 'text-gray-600'
                  }`}
                >
                  {category === 'all' ? 'All Services' : category}
                </TabsTrigger>
              ))}
            </TabsList>

            {getServiceCategories().map(category => (
              <TabsContent key={category} value={category} className="mt-0">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={category}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Service Cards Grid */}
                    <motion.div 
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      {filteredServices.map((service) => (
                        <motion.div 
                          key={service.id} 
                          variants={item}
                          whileHover={{ y: -5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="relative"
                          layoutId={`service-card-${service.id}`}
                        >
                          <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all h-full flex flex-col border-0">
                            {service.popular && (
                              <div className="absolute top-4 right-4 z-10">
                                <Badge 
                                  variant="warning"
                                  className="bg-black text-white flex items-center gap-1"
                                >
                                  <StarIcon className="w-3 h-3" />
                                  Popular
                                </Badge>
                              </div>
                            )}
                            <div 
                              className="h-44 relative cursor-pointer overflow-hidden"
                              onClick={() => toggleServiceDetails(service.id)}
                            >
                              <motion.img 
                                src={getServiceImage(service.category)}
                                alt={service.name}
                                className="w-full h-full object-cover object-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                              />
                              {/* Category tag */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <span className="text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                                  {service.category}
                                </span>
                              </div>
                            </div>
                            <CardContent className="p-6 flex flex-col flex-grow">
                              <div className="mb-4">
                                <h3 className="text-xl font-bold mb-2 flex items-center justify-between">
                                  {service.name}
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleServiceDetails(service.id)}
                                    className="text-sm text-blue-500 font-normal"
                                  >
                                    Details
                                  </motion.button>
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                  {service.description}
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 mb-5 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Clock3Icon className="w-4 h-4 mr-1 text-gray-500" />
                                  {service.duration}
                                </div>
                                <div className="flex items-center">
                                  <DollarSignIcon className="w-4 h-4 mr-1 text-gray-500" />
                                  ${service.price}
                                </div>
                              </div>
                              
                              <div className="mt-auto">
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button 
                                    className={`w-full bg-black text-white hover:bg-gray-800 py-6 ${
                                      bookingService === service.id ? 'bg-green-600 hover:bg-green-700' : ''
                                    }`}
                                    onClick={() => handleBookService(service.id)}
                                    disabled={bookingService === service.id}
                                  >
                                    {bookingService === service.id ? (
                                      <span className="flex items-center">
                                        <CheckCircleIcon className="mr-2 h-5 w-5 animate-pulse" />
                                        Booking...
                                      </span>
                                    ) : (
                                      'Book Now'
                                    )}
                                  </Button>
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
        
        {/* Quality Promise Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-20 bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">Our Quality Promise</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-black/5 p-4 rounded-full mb-4">
                <ShieldIcon className="h-8 w-8 text-black" />
              </div>
              <h4 className="font-bold text-lg mb-2">Premium Products</h4>
              <p className="text-gray-600 text-sm">We use only high-quality, eco-friendly products that are safe for your vehicle and the environment.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-black/5 p-4 rounded-full mb-4">
                <Clock3Icon className="h-8 w-8 text-black" />
              </div>
              <h4 className="font-bold text-lg mb-2">Efficient Service</h4>
              <p className="text-gray-600 text-sm">Our trained professionals work efficiently to deliver exceptional results without wasting your time.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-black/5 p-4 rounded-full mb-4">
                <MapPinIcon className="h-8 w-8 text-black" />
              </div>
              <h4 className="font-bold text-lg mb-2">Convenient Locations</h4>
              <p className="text-gray-600 text-sm">Multiple service locations near you with professional equipment and comfortable waiting areas.</p>
            </div>
          </div>
        </motion.div>
      </motion.main>

      {/* Service Details Modal */}
      <AnimatePresence>
        {showServiceDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowServiceDetails(null)}
          >
            <motion.div
              layoutId={`service-card-${showServiceDetails}`}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
            >
              {services.filter(s => s.id === showServiceDetails).map(service => (
                <div key={service.id} className="p-0">
                  <div className="h-56 relative">
                    <img 
                      src={getServiceImage(service.category)}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <Badge className="mb-2 bg-white text-black">
                          {service.category}
                        </Badge>
                        <h2 className="text-2xl font-bold mb-1">{service.name}</h2>
                      </div>
                    </div>
                    <button 
                      className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white rounded-full p-2 hover:bg-white/30"
                      onClick={() => setShowServiceDetails(null)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center">
                          <Clock3Icon className="w-5 h-5 mr-1 text-gray-500" />
                          {service.duration}
                        </div>
                        <div className="text-xl font-bold">
                          ${service.price}
                        </div>
                      </div>
                      {service.popular && (
                        <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                          <StarIcon className="w-3 h-3" />
                          Popular Choice
                        </Badge>
                      )}
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-2">Description</h3>
                      <p className="text-gray-600">
                        {service.description}
                      </p>
                    </div>

                    <Separator className="my-6" />

                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-3">What's Included</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "Complete exterior wash",
                          "Hand-dried finish",
                          "Wheel cleaning",
                          "Tire dressing",
                          "Window cleaning"
                        ].map((item, i) => (
                          <li key={i} className="flex items-center text-gray-700">
                            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className="w-full bg-black text-white hover:bg-gray-800 py-6 mt-4"
                      onClick={() => {
                        handleBookService(service.id);
                        setShowServiceDetails(null);
                      }}
                    >
                      Book This Service
                    </Button>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ServicesList;