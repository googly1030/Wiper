import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { 
  Clock3Icon, 
  CheckCircleIcon,
  StarIcon,
  CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from '../../components/ui/badge';
import { Separator } from "../../components/ui/separator";
import { noCarHeroContent } from '../../data/heroContent';
import Header from '../../components/Header';

// Import static data from separated files
import { carImageMap, categoryImageMap, monthlyPlanImageMap } from '../../data/carImages';
import { monthlyPlans, servicesByType, qualityPromiseFeatures, defaultServiceFeatures } from '../../data/serviceData';
import { Service, UserCar } from '../../types/serviceTypes';
import { categoryIcons, getIconByName } from '../../components/CategoryIcons';

// Animation variants
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

const ServicesList = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [userCar, setUserCar] = useState<UserCar | null>(null);
  const [bookingService, setBookingService] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>("Monthly");
  const [showServiceDetails, setShowServiceDetails] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [userCars, setUserCars] = useState<UserCar[]>([]);
  const [selectedCarIndex, setSelectedCarIndex] = useState<number>(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        
        // Fetch user's car information - UPDATED to handle multiple cars
        const { data: carData, error: carError } = await supabase
          .from('user_cars')
          .select('*')
          .eq('user_id', session.user.id);
        
        if (carError) {
          console.error('Error fetching car data:', carError);
          return;
        }
        
        if (carData && carData.length > 0) {
          // Store all cars
          setUserCars(carData);
          
          // Use the first car as default selection
          setUserCar(carData[0]);
          
          // Fetch services for this car type
          fetchServices(carData[0].size);
        } else {
          // Instead of redirecting to add-car page, show default services
          // Use a default car type (sedan) for showing services
          setUserCar(null);
          fetchServices('sedan');
          
          // Optionally show a prompt to add a car
          // This can be implemented with a banner or notification in the UI
        }
      } catch (error) {
        console.error('Error checking user and car:', error);
      } finally {
        setLoading(false);
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
    
    // Get services for the car type or default to sedan if type not found
    const carServices = servicesByType[normalizedType] || servicesByType.sedan;
    
    // Add some delay to simulate API fetch
    setTimeout(() => {
      setServices(carServices);
      setFilteredServices(carServices);
      setLoading(false);
    }, 500);
  };

  const handlePlanSelection = (serviceId: string) => {
    setBookingService(serviceId);
    
    // Navigate to plan selection page with calendar and time slots
    setTimeout(() => {
      navigate('/plan-selection', { 
        state: { 
          serviceId, 
          carDetails: userCar 
        } 
      });
    }, 800);
  };

  const handleBookService = (serviceId: string) => {
    setBookingService(serviceId);
    
    // Navigate to booking page
    setTimeout(() => {
      navigate('/', { 
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
  
  const getServiceImage = (category: string, serviceId?: string) => {
    if (serviceId && monthlyPlanImageMap[serviceId]) {
      return monthlyPlanImageMap[serviceId];
    }
    return categoryImageMap[category] || categoryImageMap.default;
  };
  
  const getCategoryIcon = (category: string) => {
    return categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.default;
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

  // Add a function to switch between cars
  const switchCar = (index: number) => {
    if (userCars[index]) {
      setSelectedCarIndex(index);
      setUserCar(userCars[index]);
      fetchServices(userCars[index].size);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-5">
            <div className="absolute inset-0 border-4 border-t-[#c5e82e] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-t-transparent border-r-[#c5e82e] border-b-transparent border-l-transparent rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
          </div>
          <div className="text-xl font-medium text-white">Preparing your shine...</div>
          <p className="text-gray-400 mt-2">Loading personalized services for your vehicle</p>
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

      {/* Hero Section with Vehicle Banner */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <div className="h-[50vh] overflow-hidden relative">
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50 z-10"></div>
          
          {/* Background image with parallax effect */}
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <img 
              src={userCar ? getCarImage(userCar) : noCarHeroContent.imageSrc} 
              alt={userCar ? `${userCar.make} ${userCar.model}` : 'Car wash service'} 
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
          
          {/* Hero content */}
          <div className="absolute inset-0 z-20 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {userCar ? (
                  /* User has car - show car details */
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-[#c5e82e] text-black font-medium px-3 py-1">Your Vehicle</Badge>
                      
                      {/* Only show car switcher if user has multiple cars */}
                      {userCars.length > 1 && (
                        <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full pl-2 pr-3 py-1 border border-white/20">
                          <span className="text-white text-xs mr-2">Switch car:</span>
                          <div className="flex gap-1">
                            {userCars.map((car, index) => (
                              <button
                                key={car.id}
                                onClick={() => switchCar(index)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                  selectedCarIndex === index 
                                    ? 'bg-[#c5e82e] text-black' 
                                    : 'bg-black/50 text-white hover:bg-black/70'
                                }`}
                              >
                                <span className="text-xs font-medium">{index + 1}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                      {userCar.year} {userCar.make} <br />
                      <span className="text-[#c5e82e]">{userCar.model}</span>
                    </h1>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge variant="outline" className="border-white/30 bg-black/30 backdrop-blur-sm text-white">
                        {userCar.size.charAt(0).toUpperCase() + userCar.size.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="border-white/30 bg-black/30 backdrop-blur-sm text-white">
                        {userCar.color.charAt(0).toUpperCase() + userCar.color.slice(1)}
                      </Badge>
                      {userCar.plate_number && (
                        <Badge variant="outline" className="border-white/30 bg-black/30 backdrop-blur-sm text-white">
                          {userCar.plate_number}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-200 mb-8 max-w-md">
                      Premium wash services tailored for your {userCar.make} {userCar.model}. Select from our curated options below.
                    </p>
                  </>
                ) : (
                  /* No car added yet - show generic content */
                  <>
                    <Badge className="bg-[#c5e82e] text-black font-medium px-3 py-1 mb-4">Get Started</Badge>
                    
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                      {noCarHeroContent.title} <br />
                      <span className="text-[#c5e82e]">{noCarHeroContent.subtitle}</span>
                    </h1>
                    
                    <p className="text-gray-200 mb-8 max-w-md">
                      {noCarHeroContent.description}
                    </p>
                  </>
                )}
                
                <motion.div 
                  className="inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="bg-[#c5e82e] hover:bg-[#d0f53a] text-black text-lg font-medium px-8 py-6 rounded-full"
                    onClick={() => navigate(userCar ? '/dashboard' : noCarHeroContent.ctaLink)}
                  >
                    {userCar ? 'View Services' : noCarHeroContent.ctaText}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Curved separator */}
        <div className="relative -mt-16 z-10">
          <svg className="fill-white w-full h-32" preserveAspectRatio="none" viewBox="0 0 1440 96">
            <path d="M0,96L80,80C160,64,320,32,480,32C640,32,800,64,960,69.3C1120,75,1280,53,1360,42.7L1440,32L1440,96L1360,96C1280,96,1120,96,960,96C800,96,640,96,480,96C320,96,160,96,80,96L0,96Z"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-10">
          {/* Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12 text-center"
          >
            <span className="inline-block mb-2 px-4 py-1 bg-black text-[#c5e82e] rounded-full text-sm font-medium">
              Monthly Car Care Plans
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome back, {getUserDisplayName()}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose a monthly care plan tailored for your {userCar?.make || 'vehicle'} {userCar?.model || ''}.
              Regular maintenance with flexible scheduling to keep your vehicle in perfect condition.
            </p>
          </motion.div>

          {/* Category Filters - Modern Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-12"
          >
            <Tabs defaultValue="Monthly" value={currentCategory} onValueChange={setCurrentCategory} className="w-full">
              <div className="relative flex justify-center mb-10">
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent top-1/2 -z-10"></div>
                <TabsList className="inline-flex bg-white shadow-lg rounded-full p-1.5 border border-gray-100">
                  {getServiceCategories().map(category => (
                    <TabsTrigger 
                      key={category}
                      value={category}
                      className={`px-6 py-2.5 rounded-full transition-all duration-300 min-w-[100px] ${
                        currentCategory === category ? 'bg-black text-[#c5e82e]' : ''
                      }`}
                    >
                      {category === 'all' ? 'All Services' : (
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <span>{category}</span>
                        </div>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Service Cards Grid - Masonry-style layout */}
              <TabsContent value={currentCategory} className="mt-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCategory}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    variants={container}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                  >
                    {filteredServices.map((service, index) => (
                      <motion.div
                        key={service.id}
                        variants={item}
                        className={`${index % 3 === 1 ? 'md:mt-12' : ''}`}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <Card className="overflow-hidden border-0 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                          {/* Service Card Image Area */}
                          <div 
                            className="h-56 relative cursor-pointer overflow-hidden"
                            onClick={() => toggleServiceDetails(service.id)}
                          >
                            <motion.img 
                              src={getServiceImage(service.category, service.id)}
                              alt={service.name}
                              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                            />
                            
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                            
                            {/* Price badge */}
                            <div className="absolute top-4 right-4">
                              <div className="bg-white text-black font-bold rounded-full py-2 px-4 flex items-center shadow-lg">
                                {service.isMonthlyPlan ? (
                                  <span>₹{service.price.toLocaleString('en-IN')}/mo</span>
                                ) : (
                                  <span>₹{service.price.toLocaleString('en-IN')}</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Popular badge */}
                            {service.popular && (
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-[#c5e82e] text-black flex items-center gap-1 px-3 py-1.5">
                                  <StarIcon className="w-3.5 h-3.5" />
                                  Popular
                                </Badge>
                              </div>
                            )}
                            
                            {/* Category & duration */}
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                              <Badge className="bg-black/50 backdrop-blur-sm text-white border-none px-3 py-1.5 flex items-center gap-1.5">
                                {getCategoryIcon(service.category)}
                                {service.category}
                              </Badge>
                              
                              <Badge variant="outline" className="border-white/40 text-white bg-black/30 backdrop-blur-sm">
                                <Clock3Icon className="w-3.5 h-3.5 mr-1" />
                                {service.duration}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Service Card Content */}
                          <CardContent className="p-6 flex flex-col flex-grow relative">
                            <h3 className="text-xl font-bold mb-3 group-hover:text-[#c5e82e] transition-colors duration-300">
                              {service.name}
                            </h3>
                            
                            {service.isMonthlyPlan && service.frequency && (
                              <Badge variant="outline" className="mb-3 inline-flex w-fit">
                                <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                                {service.frequency}
                              </Badge>
                            )}
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {service.description}
                            </p>
                            
                            {/* Display features for monthly plans */}
                            {service.isMonthlyPlan && service.features && (
                              <div className="mb-6 flex-grow">
                                <ul className="space-y-2">
                                  {service.features.slice(0, 2).map((feature, idx) => (
                                    <li key={idx} className="flex items-start text-xs text-gray-600">
                                      <CheckCircleIcon className="h-3.5 w-3.5 text-[#c5e82e] mr-1.5 mt-0.5" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="mt-auto flex justify-between items-center">
                              <Button 
                                variant="outline" 
                                onClick={() => toggleServiceDetails(service.id)}
                                className="text-sm border-gray-300 hover:bg-gray-50 hover:text-black"
                              >
                                View Details
                              </Button>
                              
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button 
                                  onClick={() => service.isMonthlyPlan ? handlePlanSelection(service.id) : handleBookService(service.id)}
                                  className="bg-black hover:bg-gray-900 text-white rounded-full px-6"
                                  style={{
                                    boxShadow: bookingService === service.id ? '0 0 0 2px #c5e82e' : 'none',
                                    borderBottom: '3px solid #c5e82e'
                                  }}
                                >
                                  {bookingService === service.id ? 'Processing...' : (service.isMonthlyPlan ? 'Select Plan' : 'Book')}
                                </Button>
                              </motion.div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </motion.div>
          
          {/* Accent Divider */}
          <div className="relative flex items-center py-12 my-12">
            <div className="flex-grow h-0.5 bg-gray-200"></div>
            <div className="flex-shrink-0 px-3">
              <span className="bg-[#c5e82e] w-6 h-6 rounded-full block"></span>
            </div>
            <div className="flex-grow h-0.5 bg-gray-200"></div>
          </div>
          
          {/* Quality Promise Section - Reimagined */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background with blur effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000')] bg-cover bg-center opacity-20"></div>
              <div className="absolute inset-0 backdrop-blur-sm"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 px-6 py-16 md:py-20 text-white">
              <div className="max-w-5xl mx-auto text-center mb-12">
                <Badge className="mb-4 bg-white/10 backdrop-blur-md text-white border-none px-4 py-1.5">
                  Our Promise
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Experience the <span className="text-[#c5e82e]">Wiper Difference</span>
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  We don't just clean cars - we restore their shine and protect their finish.
                  Every service comes with our quality guarantee and attention to detail.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {qualityPromiseFeatures.map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                    whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.2)' }}
                  >
                    <div className="bg-[#c5e82e] p-3 rounded-xl inline-flex mb-4 text-black">
                      {getIconByName(item.icon)}
                    </div>
                    <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
          
          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-20 text-center"
          >
            <h3 className="text-2xl font-bold mb-4">Ready for regular shine?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Select a monthly plan and enjoy premium car care on your schedule
            </p>
            <Button 
              className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-6 rounded-full border-b-4 border-[#c5e82e]"
              onClick={() => navigate('/dashboard', { state: { activeTab: 'plans' } })}
            >
              View Monthly Plans
            </Button>
          </motion.div>
        </div>
      </main>

      {/* Service Details Modal */}
      <AnimatePresence>
        {showServiceDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowServiceDetails(null)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto service-details-modal"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              {services.filter(s => s.id === showServiceDetails).map(service => (
                <div key={service.id} className="p-0">
                  <div className="h-64 relative">
                    <img 
                      src={getServiceImage(service.category, service.id)}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end">
                      <div className="p-8 text-white">
                        <Badge className="mb-3 bg-[#c5e82e] text-black px-3 py-1">
                          {service.category}
                        </Badge>
                        <h2 className="text-3xl font-bold">{service.name}</h2>
                      </div>
                    </div>
                    <button 
                      className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white rounded-full p-2 hover:bg-white/30"
                      onClick={() => setShowServiceDetails(null)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>

                  <div className="p-8">
                    <div className="flex flex-wrap justify-between items-center mb-8 gap-3">
                      <div className="flex items-center gap-4 text-lg">
                        <div className="flex items-center text-black font-bold text-3xl">
                          {service.isMonthlyPlan ? (
                            <span>₹{service.price.toLocaleString('en-IN')}<span className="text-base font-medium text-gray-500">/month</span></span>
                          ) : (
                            <span>₹{service.price.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className="bg-gray-100 text-gray-700 flex items-center gap-1.5 px-3 py-1.5">
                          <Clock3Icon className="w-3.5 h-3.5" />
                          {service.duration}
                        </Badge>
                        
                        {service.frequency && (
                          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1.5 px-3 py-1.5">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {service.frequency}
                          </Badge>
                        )}
                        
                        {service.popular && (
                          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1.5 px-3 py-1.5">
                            <StarIcon className="w-3.5 h-3.5" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-lg font-bold mb-3">Description</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <Separator className="my-8" />

                    <div className="mb-8">
                      <h3 className="text-lg font-bold mb-4">
                        {service.isMonthlyPlan ? "Plan Includes" : "What's Included"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(service.features || defaultServiceFeatures).map((item, i) => (
                          <div key={i} className="flex items-start">
                            <div className="mt-0.5 mr-3 bg-[#c5e82e] p-1 rounded-full">
                              <CheckCircleIcon className="h-4 w-4 text-black" />
                            </div>
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {service.isMonthlyPlan && (
                      <div className="mb-8 bg-gray-50 p-4 rounded-xl">
                        <h3 className="text-lg font-bold mb-3">How It Works</h3>
                        <ol className="space-y-3 list-decimal pl-5 text-gray-700">
                          <li>Select your preferred plan</li>
                          <li>Choose your preferred time slots on the calendar</li>
                          <li>Our team will arrive at the scheduled times</li>
                          <li>Receive updates and manage your bookings through the app</li>
                          <li>Pay monthly for hassle-free service</li>
                        </ol>
                      </div>
                    )}

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className="w-full bg-black text-white hover:bg-gray-800 py-6 rounded-xl text-lg border-b-4 border-[#c5e82e]"
                        onClick={() => {
                          service.isMonthlyPlan ? handlePlanSelection(service.id) : handleBookService(service.id);
                          setShowServiceDetails(null);
                        }}
                      >
                        {service.isMonthlyPlan ? 'Select This Plan' : 'Book This Service'}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicesList;