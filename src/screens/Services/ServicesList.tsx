import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Clock3Icon,
  CheckCircleIcon,
  StarIcon,
  CalendarIcon,
  MenuIcon,
  X as XIcon,
  ChevronDown,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { noCarHeroContent } from "../../data/heroContent";
import Header from "../../components/Header";
import MobileNavBar from "../../components/MobileNavBar";

// Import static data from separated files
import {
  carImageMap,
  categoryImageMap,
  monthlyPlanImageMap,
} from "../../data/carImages";
import { servicesByType, defaultServiceFeatures } from "../../data/serviceData";
import { Service, UserCar } from "../../types/serviceTypes";
import { categoryIcons } from "../../components/CategoryIcons";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
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
  const [showServiceDetails, setShowServiceDetails] = useState<string | null>(
    null
  );
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [userCars, setUserCars] = useState<UserCar[]>([]);
  const [selectedCarIndex, setSelectedCarIndex] = useState<number>(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  // Add this state to manage the modal
  const [showNoCarsModal, setShowNoCarsModal] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("User");
  // Add a state for active tab that we'll pass to the MobileNavBar
  const [activeTab, setActiveTab] = useState<string>("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkUserAndCar = async () => {
      setLoading(true);
      try {
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          navigate("/");
          return;
        }

        setUser(session.user);

        // Fetch user's car information - UPDATED to handle multiple cars
        const { data: carData, error: carError } = await supabase
          .from("user_cars")
          .select("*")
          .eq("user_id", session.user.id);

        if (carError) {
          console.error("Error fetching car data:", carError);
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
          fetchServices("sedan");

          // Optionally show a prompt to add a car
          // This can be implemented with a banner or notification in the UI
        }
      } catch (error) {
        console.error("Error checking user and car:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndCar();
  }, [navigate]);

  useEffect(() => {
    // Only show Monthly category services
    setFilteredServices(
      services.filter(
        (service) => service.category.toLowerCase() === "monthly".toLowerCase()
      )
    );
  }, [services]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "User");
  }, []);

  const fetchServices = async (carType: string) => {
    setLoading(true);

    // Map car size to a standard type for service matching
    const normalizedType = carType === "suv" ? "sedan" : carType;

    // Get services for the car type or default to sedan if type not found
    const carServices = servicesByType[normalizedType] || servicesByType.sedan;

    // Add some delay to simulate API fetch
    setTimeout(() => {
      setServices(carServices);

      if (currentCategory === "all") {
        setFilteredServices(carServices);
      } else {
        setFilteredServices(
          carServices.filter(
            (service) =>
              service.category.toLowerCase() === currentCategory.toLowerCase()
          )
        );
      }

      setLoading(false);
    }, 500);
  };

  const handlePlanSelection = (serviceId: string) => {
    // Check if user has a car
    if (!userCar) {
      // Show modal telling user they need to add a car first
      setShowNoCarsModal(true);
      return;
    }

    setBookingService(serviceId);

    // Navigate to plan selection page with calendar and time slots
    setTimeout(() => {
      navigate("/plan-selection", {
        state: {
          serviceId,
          carDetails: userCar,
        },
      });
    }, 800);
  };

  const handleBookService = (serviceId: string) => {
    setBookingService(serviceId);

    // Navigate to booking page
    setTimeout(() => {
      navigate("/", {
        state: {
          serviceId,
          carDetails: userCar,
        },
      });
    }, 800);
  };

  const getServiceCategories = () => {
    const categories = services.map((service) => service.category);
    return ["all", ...new Set(categories)];
  };

  const getCarImage = (car: UserCar | null) => {
    if (!car) return carImageMap.sedan;
    return carImageMap[car.size] || carImageMap.sedan;
  };

  const getServiceImage = (
    category: string,
    serviceId?: string,
    serviceObject?: Service
  ) => {
    // First check if the service object has its own image
    if (serviceObject && serviceObject.image) {
      return serviceObject.image;
    }

    // Then check monthly plan image map
    if (
      serviceId &&
      monthlyPlanImageMap[serviceId as keyof typeof monthlyPlanImageMap]
    ) {
      return monthlyPlanImageMap[serviceId as keyof typeof monthlyPlanImageMap];
    }

    // Finally fallback to category image
    return (
      categoryImageMap[category as keyof typeof categoryImageMap] ||
      categoryImageMap.default
    );
  };

  const getCategoryIcon = (category: string) => {
    return (
      categoryIcons[category as keyof typeof categoryIcons] ||
      categoryIcons.default
    );
  };

  const toggleServiceDetails = (serviceId: string) => {
    if (showServiceDetails === serviceId) {
      setShowServiceDetails(null);
    } else {
      setShowServiceDetails(serviceId);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user.email) {
      return user.email.split("@")[0];
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

  // Add a function to handle adding a car
  const handleAddCar = () => {
    navigate("/add-car");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5">
            <div className="absolute inset-0 border-4 border-t-[#c5e82e] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div
              className="absolute inset-2 border-4 border-t-transparent border-r-[#c5e82e] border-b-transparent border-l-transparent rounded-full animate-spin"
              style={{ animationDuration: "1.5s" }}
            ></div>
          </div>
          <div className="text-lg sm:text-xl font-medium text-white">
            Preparing your shine...
          </div>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Loading personalized services for your vehicle
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16 md:pb-0">
      {/* Header component in a fixed position */}
      <div
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-transparent"
        }`}
      >
        <Header />
      </div>

      {/* Hero Section with Vehicle Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <div className="h-[40vh] sm:h-[50vh] overflow-hidden relative">
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
              alt={
                userCar
                  ? `${userCar.make} ${userCar.model}`
                  : "Car wash service"
              }
              className="w-full h-full object-cover object-center"
            />
          </motion.div>

          {/* Hero content */}

          <div className="absolute inset-0 z-20 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full sm:max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {userCar ? (
                  <>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge className="bg-[#c5e82e] text-black font-medium px-3 py-1">
                        Your Vehicle
                      </Badge>

                      {/* Only show car switcher if user has multiple cars */}
                      {userCars.length > 1 && (
                        <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full pl-2 pr-3 py-1 border border-white/20 mt-1 sm:mt-0">
                          <span className="text-white text-xs mr-2">
                            Switch car:
                          </span>
                          <div className="flex gap-1">
                            {userCars.map((car, index) => (
                              <button
                                key={car.id}
                                onClick={() => switchCar(index)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                  selectedCarIndex === index
                                    ? "bg-[#c5e82e] text-black"
                                    : "bg-black/50 text-white hover:bg-black/70"
                                }`}
                              >
                                <span className="text-xs font-medium">
                                  {index + 1}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 text-white">
                      <span className="text-[#c5e82e]">
                        {userCar.make} {userCar.model}
                      </span>
                    </h1>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className="border-white/30 bg-black/30 backdrop-blur-sm text-white text-xs"
                      >
                        {userCar.size.charAt(0).toUpperCase() +
                          userCar.size.slice(1)}
                      </Badge>

                      {userCar.plate_number && (
                        <Badge
                          variant="outline"
                          className="border-white/30 bg-black/30 backdrop-blur-sm text-white text-xs"
                        >
                          {userCar.plate_number}
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-200 mb-6 max-w-md text-sm sm:text-base">
                      Premium wash services tailored for your {userCar.make}{" "}
                      {userCar.model}. Select from our curated options below.
                    </p>
                  </>
                ) : (
                  /* No car added yet - show generic content */
                  <>
                    <Badge className="bg-[#c5e82e] text-black font-medium px-3 py-1 mb-4">
                      Get Started
                    </Badge>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-white">
                      {noCarHeroContent.title} <br />
                      <span className="text-[#c5e82e]">
                        {noCarHeroContent.subtitle}
                      </span>
                    </h1>

                    <p className="text-gray-200 mb-6 max-w-md text-sm sm:text-base">
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
  className="bg-[#c5e82e] hover:bg-[#d0f53a] text-black font-medium rounded-full
    text-sm px-4 py-2.5 
    sm:text-lg sm:px-6 sm:px-8 sm:py-5 sm:py-6"
  onClick={() =>
    navigate(
      userCar ? "/dashboard" : noCarHeroContent.ctaLink
    )
  }
>
  {userCar ? "View Dashboard" : noCarHeroContent.ctaText}
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
          <svg
            className="fill-white w-full h-16 sm:h-32"
            preserveAspectRatio="none"
            viewBox="0 0 1440 96"
          >
            <path d="M0,96L80,80C160,64,320,32,480,32C640,32,800,64,960,69.3C1120,75,1280,53,1360,42.7L1440,32L1440,96L1360,96C1280,96,1120,96,960,96C800,96,640,96,480,96C320,96,160,96,80,96L0,96Z"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-20 -mt-8 sm:-mt-10">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 sm:mb-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Welcome Back, {username}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base sm:hidden">
              Choose a monthly care plan tailored for your{" "}
              {userCar?.make || "vehicle"} {userCar?.model || ""}. Regular
              maintenance with flexible scheduling to keep your vehicle in
              perfect condition.
            </p>
          </motion.div>

          {/* Category Filters - Modern Tabs - Mobile-friendly version */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8 sm:mb-12"
          >
            <Tabs
              defaultValue="Monthly"
              value={currentCategory}
              onValueChange={setCurrentCategory}
              className="w-full"
            >
              {/* Mobile dropdown filter */}
              <div className="flex justify-center mb-8 sm:hidden">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between bg-white shadow-md rounded-lg p-3 border border-gray-100"
                  // No need for onClick if we're not opening a dropdown
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon("Monthly")}
                    <span>Plans</span>
                  </div>
                </Button>

                <AnimatePresence>
                  {mobileFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-16 left-4 right-4 bg-white rounded-lg shadow-lg z-30 mt-1 border border-gray-100"
                    >
                      <div className="flex flex-col p-2">
                        {getServiceCategories().map((category) => (
                          <button
                            key={category}
                            className={`flex items-center gap-2 p-3 text-left rounded-md transition-colors ${
                              currentCategory === category
                                ? "bg-black text-[#c5e82e]"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              setCurrentCategory(category);
                              setMobileFilterOpen(false);
                            }}
                          >
                            {category === "all" ? (
                              "All Services"
                            ) : (
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(category)}
                                <span>{category}</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop tabs */}
              <div className="relative hidden sm:flex flex-col items-center justify-center mb-10">
                {/* Decorative line */}
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent top-1/2 -z-10"></div>

                {/* Title and Description */}
                <div className="text-center max-w-3xl mx-auto px-4">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {getCategoryIcon("Monthly")}
                    <h2 className="text-2xl font-bold text-gray-900">
                      Monthly Subscription Plans
                    </h2>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Choose from our carefully curated monthly plans designed to
                    keep your vehicle in perfect condition. Regular maintenance
                    with flexible scheduling and premium service guaranteed.
                  </p>

                  {/* Optional features list */}
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <span className="flex items-center text-sm text-gray-500">
                      <CheckCircleIcon className="w-4 h-4 text-[#c5e82e] mr-1.5" />
                      Flexible Scheduling
                    </span>
                    <span className="flex items-center text-sm text-gray-500">
                      <CheckCircleIcon className="w-4 h-4 text-[#c5e82e] mr-1.5" />
                      Priority Service
                    </span>
                    <span className="flex items-center text-sm text-gray-500">
                      <CheckCircleIcon className="w-4 h-4 text-[#c5e82e] mr-1.5" />
                      Premium Care
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Cards Grid - Responsive layout */}
              <TabsContent value={currentCategory} className="mt-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCategory}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    variants={container}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
                  >
                    {filteredServices.map((service, index) => (
                      <motion.div
                        key={service.id}
                        variants={item}
                        className={`${
                          index % 3 === 1 ? "sm:mt-8 lg:mt-12" : ""
                        }`}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <Card className="overflow-hidden border-0 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                          {/* Service Card Image Area */}
                          <div
                            className="h-44 sm:h-56 relative cursor-pointer overflow-hidden"
                            onClick={() => toggleServiceDetails(service.id)}
                          >
                            <motion.img
                              src={getServiceImage(
                                service.category,
                                service.id,
                                service
                              )}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>

                            {/* Price badge */}
                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                              <div className="bg-white text-black font-bold rounded-full py-1.5 px-3 sm:py-2 sm:px-4 flex items-center shadow-lg text-sm sm:text-base">
                                {service.isMonthlyPlan ? (
                                  <span>
                                    ₹{service.price.toLocaleString("en-IN")}/mo
                                  </span>
                                ) : (
                                  <span>
                                    ₹{service.price.toLocaleString("en-IN")}
                                  </span>
                                )}
                              </div>
                            </div>

                            {userCar &&
                              service.vehicleType &&
                              userCar.size.toLowerCase() ===
                                service.vehicleType.toLowerCase() && (
                                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                                  <Badge className="bg-[#c5e82e] text-black font-medium px-2 py-0.5 sm:px-3 sm:py-1 shadow-lg flex items-center gap-1 text-xs">
                                    <CheckCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    Recommended
                                  </Badge>
                                </div>
                              )}

                            {/* Category & duration */}
                            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex justify-between items-center">
                              <Badge className="bg-black/50 backdrop-blur-sm text-white border-none px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 text-xs sm:text-sm">
                                {getCategoryIcon(service.category)}
                                <span className="truncate max-w-[90px] sm:max-w-none">
                                  {service.category}
                                </span>
                              </Badge>
                            </div>
                          </div>

                          {/* Service Card Content */}
                          <CardContent className="p-4 sm:p-6 flex flex-col flex-grow relative">
                            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-[#c5e82e] transition-colors duration-300">
                              {service.name}
                            </h3>

                            {service.isMonthlyPlan && service.frequency && (
                              <Badge
                                variant="outline"
                                className="mb-2 sm:mb-3 inline-flex w-fit text-xs sm:text-sm"
                              >
                                <CalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
                                {service.frequency}
                              </Badge>
                            )}

                            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                              {service.description}
                            </p>

                            {/* Display features for monthly plans */}
                            {service.isMonthlyPlan && service.features && (
                              <div className="mb-4 sm:mb-6 flex-grow">
                                <ul className="space-y-1.5 sm:space-y-2">
                                  {service.features
                                    .slice(0, 2)
                                    .map((feature, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-start text-xs text-gray-600"
                                      >
                                        <CheckCircleIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#c5e82e] mr-1.5 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-1">
                                          {feature}
                                        </span>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}

                            <div className="mt-auto flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between sm:items-center">
                              <Button
                                variant="outline"
                                onClick={() => toggleServiceDetails(service.id)}
                                className="text-xs sm:text-sm border-gray-300 hover:bg-gray-50 hover:text-black h-8 sm:h-auto"
                              >
                                View Details
                              </Button>

                              <motion.div
                                className="w-full sm:w-auto"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  onClick={() =>
                                    service.isMonthlyPlan
                                      ? handlePlanSelection(service.id)
                                      : handleBookService(service.id)
                                  }
                                  className="bg-black hover:bg-gray-900 text-white rounded-full px-4 sm:px-6 h-10 sm:h-auto w-full sm:w-auto text-xs sm:text-sm"
                                  style={{
                                    boxShadow:
                                      bookingService === service.id
                                        ? "0 0 0 2px #c5e82e"
                                        : "none",
                                    borderBottom: "3px solid #c5e82e",
                                  }}
                                >
                                  {bookingService === service.id
                                    ? "Processing..."
                                    : service.isMonthlyPlan
                                    ? "Select Plan"
                                    : "Book"}
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
          <div className="relative flex items-center ">
            <div className="flex-grow h-0.5 bg-gray-200"></div>
            <div className="flex-shrink-0 px-3">
              <span className="bg-[#c5e82e] w-4 h-4 sm:w-6 sm:h-6 rounded-full block"></span>
            </div>
            <div className="flex-grow h-0.5 bg-gray-200"></div>
          </div>

          {/* Quality Promise Section - Reimagined - Mobile friendly */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative rounded-xl sm:rounded-3xl overflow-hidden"
          >
            {/* Background with blur effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900 rounded-xl sm:rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000')] bg-cover bg-center opacity-20"></div>
              <div className="absolute inset-0 backdrop-blur-sm"></div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Service Details Modal - Mobile-friendly */}
      <AnimatePresence>
        {showServiceDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowServiceDetails(null)}
          >
            <motion.div
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl sm:max-w-2xl max-h-[85vh] overflow-y-auto service-details-modal"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              {services
                .filter((s) => s.id === showServiceDetails)
                .map((service) => (
                  <div key={service.id} className="p-0">
                    <div className="h-48 sm:h-64 relative">
                      <img
                        src={getServiceImage(
                          service.category,
                          service.id,
                          service
                        )}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end">
                        <div className="p-4 sm:p-8 text-white">
                          <Badge className="mb-2 sm:mb-3 bg-[#c5e82e] text-black px-2 py-0.5 sm:px-3 sm:py-1 text-xs">
                            {service.category}
                          </Badge>
                          <h2 className="text-2xl sm:text-3xl font-bold">
                            {service.name}
                          </h2>
                        </div>
                      </div>
                      <button
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/10 backdrop-blur-md text-white rounded-full p-1.5 sm:p-2 hover:bg-white/30"
                        onClick={() => setShowServiceDetails(null)}
                      >
                        <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>

                    <div className="p-4 sm:p-8">
                      <div className="flex flex-wrap justify-between items-center mb-6 sm:mb-8 gap-3">
                        <div className="flex items-center gap-2 sm:gap-4 text-base sm:text-lg">
                          <div className="flex items-center text-black font-bold text-xl sm:text-3xl">
                            {service.isMonthlyPlan ? (
                              <span>
                                ₹{service.price.toLocaleString("en-IN")}
                                <span className="text-sm sm:text-base font-medium text-gray-500">
                                  /month
                                </span>
                              </span>
                            ) : (
                              <span>
                                ₹{service.price.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          {service.frequency && (
                            <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                              <CalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              {service.frequency}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mb-6 sm:mb-8">
                        <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">
                          Description
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                          {service.description}
                        </p>
                      </div>

                      <Separator className="my-6 sm:my-8" />

                      <div className="mb-6 sm:mb-8">
                        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                          {service.isMonthlyPlan
                            ? "Plan Includes"
                            : "What's Included"}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {(service.features || defaultServiceFeatures).map(
                            (item, i) => (
                              <div key={i} className="flex items-start">
                                <div className="mt-0.5 mr-2 sm:mr-3 bg-[#c5e82e] p-1 rounded-full flex-shrink-0">
                                  <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                                </div>
                                <span className="text-gray-700 text-xs sm:text-sm">
                                  {item}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {service.isMonthlyPlan && (
                        <div className="mb-6 sm:mb-8 bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                          <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">
                            How It Works
                          </h3>
                          <ol className="space-y-2 sm:space-y-3 list-decimal pl-5 text-gray-700 text-xs sm:text-sm">
                            <li>Select your preferred plan</li>
                            <li>
                              Choose your preferred time slots on the calendar
                            </li>
                            <li>Our team will arrive at the scheduled times</li>
                            <li>
                              Receive updates and manage your bookings through
                              the app
                            </li>
                            <li>Pay monthly for hassle-free service</li>
                          </ol>
                        </div>
                      )}

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className="w-full bg-black text-white hover:bg-gray-800 py-4 sm:py-6 rounded-xl text-sm sm:text-lg border-b-3 sm:border-b-4 border-[#c5e82e]"
                          onClick={() => {
                            service.isMonthlyPlan
                              ? handlePlanSelection(service.id)
                              : handleBookService(service.id);
                            setShowServiceDetails(null);
                          }}
                        >
                          {service.isMonthlyPlan
                            ? "Select This Plan"
                            : "Book This Service"}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Car Modal */}
      <AnimatePresence>
        {showNoCarsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNoCarsModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-yellow-50 rounded-full p-3">
                    <CalendarIcon className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">
                  Car Details Required
                </h3>

                <p className="text-gray-600 text-center mb-6">
                  You need to add your car details before selecting a plan. This
                  helps us customize the service for your vehicle.
                </p>

                <div className="flex flex-col gap-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="w-full bg-black text-white hover:bg-gray-800 py-4 rounded-xl text-base border-b-3 border-[#c5e82e]"
                      onClick={() => {
                        setShowNoCarsModal(false);
                        navigate("/add-car");
                      }}
                    >
                      Add Car Details
                    </Button>
                  </motion.div>

                  <Button
                    variant="outline"
                    className="w-full py-3.5 rounded-xl text-sm"
                    onClick={() => setShowNoCarsModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Mobile Navigation Bar at the bottom */}
      <MobileNavBar 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === "dashboard") {
            navigate("/dashboard");
          } else if (tab === "plans") {
            navigate("/dashboard", { state: { initialTab: "plans" } });
          } else if (tab === "car") {
            navigate("/dashboard", { state: { initialTab: "car" } });
          }
        }}
        onAddCarClick={handleAddCar}
        hasActiveCar={!!userCar}
      />

      {/* Add a CSS class to hide scrollbars but keep functionality */}
      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .service-details-modal {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }

        .service-details-modal::-webkit-scrollbar {
          width: 5px;
        }

        .service-details-modal::-webkit-scrollbar-track {
          background: transparent;
        }

        .service-details-modal::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 20px;
        }

        @media (max-width: 640px) {
          .service-details-modal::-webkit-scrollbar {
            width: 3px;
          }
        }
      `}</style>
    </div>
  );
};

export default ServicesList;
