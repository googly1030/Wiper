import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  CarIcon,
  PlusIcon,
  WrenchIcon,
  DropletIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  CalendarIcon,
  HomeIcon,
  TrendingUpIcon,
  CheckIcon,
  HelpCircleIcon as QuestionMarkCircleIcon,
  CameraIcon,
  HistoryIcon,
  Trash2Icon,
  Pencil,
  Wrench as ToolIcon,
  ClipboardCheck as ClipboardIcon,
} from "lucide-react";
import Header from "../../components/Header";
import { format, addDays } from "date-fns";
import { motion } from "framer-motion";
import { monthlyPlans } from "../../data/serviceData";

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
  size: "small" | "medium" | "large" | "suv";
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
  serviceId?: string; // Add this property
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
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.map((day) => dayNames[day]).join(", ");
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  // Change the interface to handle multiple cars
  const [userCars, setUserCars] = useState<UserCar[]>([]);
  const [activeCar, setActiveCar] = useState<UserCar | null>(null);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  // Update your state initialization to check for the activeTab in location state
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "dashboard"
  );
  const [recommendedServices, setRecommendedServices] = useState<any[]>([]);
  const [bookedPlans, setBookedPlans] = useState<BookedPlan[]>([]);
  const [username, setUsername] = useState<string>("User");

  // Update the Plan interface to include more fields
  const plans: Plan[] = monthlyPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    description: plan.description || "",
    category: plan.category || "Monthly",
    frequency: plan.frequency || "",
    features: plan.features || [],
    popular: plan.popular || false,
    isMonthlyPlan: true,
  }));

  useEffect(() => {
    checkUser();
  }, []);
  useEffect(() => {
    if (activeCar) {
      fetchRecommendedServices(activeCar.size);
    }
  }, [activeCar]);

  useEffect(() => {
    const fetchBookedPlans = async () => {
      // First check if there's a state from navigation
      const state = window.history.state?.usr;

      if (state?.success && activeCar) {
        // Use the plan that was just booked
        const mockPlan: BookedPlan = {
          id: "plan-" + Date.now(),
          name: "Premium Monthly Plan",
          startDate: format(new Date(), "yyyy-MM-dd"),
          daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
          timeSlots: ["10:00 AM - 11:30 AM"],
          features: [
            "6 exterior washes per week",
            "2 interior cleanings per month",
            "Priority scheduling",
            "Slot based on your selection",
            "Daily updates with photos",
          ],
          nextServiceDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
          completedServices: 0,
          totalServices: 24,
          price: 5999,
        };

        // Add the new plan
        setBookedPlans([mockPlan]);

        // Clear the state to avoid duplication on refresh
        window.history.replaceState({}, document.title);
      } else {
        // Load plans from localStorage
        try {
          const storedPlans = localStorage.getItem("bookedPlans");
          if (storedPlans) {
            const parsedPlans = JSON.parse(storedPlans);
            setBookedPlans(parsedPlans);
          } else {
            // Fallback to mock plans if nothing in localStorage
            const mockPlans: BookedPlan[] = activeCar
              ? [
                  {
                    id: "plan-1",
                    name: "Premium Monthly Plan",
                    startDate: "2025-04-15",
                    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
                    timeSlots: ["10:00 AM - 11:30 AM"],
                    features: [
                      "6 exterior washes per week",
                      "2 interior cleanings per month",
                      "Priority scheduling",
                      "Slot based on your selection",
                      "Daily updates with photos",
                    ],
                    nextServiceDate: format(
                      addDays(new Date(), 1),
                      "yyyy-MM-dd"
                    ),
                    completedServices: 8,
                    totalServices: 24,
                    price: 5999,
                  },
                ]
              : [];

            setBookedPlans(mockPlans);
          }
        } catch (error) {
          console.error("Error loading booked plans from localStorage:", error);
          setBookedPlans([]);
        }
      }
    };

    fetchBookedPlans();
  }, [activeCar]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "User");
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
      return;
    }

    // Set user data
    setUser({
      email: session.user.email || "",
      user_metadata: session.user.user_metadata,
    });

    // Check if user has a subscription
    const { data: subscriptionData } = await supabase
      .from("wipers")
      .select("*")
      .limit(1);

    setHasSubscription(!!subscriptionData);

    // Fetch user's cars information - remove .single() to get all cars
    const { data: carData } = await supabase
      .from("user_cars")
      .select("*")
      .eq("user_id", session.user.id);

    if (carData && carData.length > 0) {
      setUserCars(carData);
      setActiveCar(carData[0]); // Set the first car as active by default
    }

    setLoading(false);
  };

  const handleAddCar = () => {
    navigate("/add-car");
  };

  const fetchRecommendedServices = (carType: string) => {
    // In a real app, you'd fetch this from your database based on car type
    const services = {
      hatchback: [
        {
          id: "1",
          name: "Compact Exterior Wash",
          description:
            "Quick and efficient exterior cleaning tailored for smaller vehicles",
          duration: "30 mins",
          price: 19.99,
          image: "/services/hatchback-wash.jpg",
        },
        {
          id: "2",
          name: "Eco Clean Package",
          description:
            "Water-efficient wash perfect for compact cars with eco-friendly products",
          duration: "45 mins",
          price: 29.99,
          image: "/services/eco-clean.jpg",
        },
        {
          id: "3",
          name: "City Car Protection",
          description:
            "Special coating to protect against urban pollutants and scratches",
          duration: "60 mins",
          price: 39.99,
          image: "/services/city-protection.jpg",
        },
      ],
      sedan: [
        {
          id: "1",
          name: "Full Sedan Wash",
          description:
            "Complete exterior wash designed specifically for sedan bodies",
          duration: "45 mins",
          price: 24.99,
          image:
            "https://images.unsplash.com/photo-1636427743695-eccbf1c05af6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "2",
          name: "Executive Interior Clean",
          description:
            "Premium interior detailing for a professional clean look",
          duration: "60 mins",
          price: 44.99,
          image:
            "https://images.unsplash.com/photo-1602786195490-c785a218df40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "3",
          name: "Commuter Special",
          description: "Quick wash and vacuum ideal for daily drivers",
          duration: "35 mins",
          price: 29.99,
          image:
            "https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
      ],
      suv: [
        {
          id: "1",
          name: "SUV Deep Clean",
          description:
            "Extra attention for larger vehicles with hard-to-reach areas",
          duration: "75 mins",
          price: 59.99,
          image: "/services/suv-clean.jpg",
        },
        {
          id: "2",
          name: "Family Vehicle Package",
          description:
            "Interior sanitization and stain removal perfect for family SUVs",
          duration: "90 mins",
          price: 69.99,
          image: "/services/family-package.jpg",
        },
        {
          id: "3",
          name: "Off-Road Recovery",
          description: "Special cleaning for SUVs after outdoor adventures",
          duration: "120 mins",
          price: 89.99,
          image: "/services/offroad-recovery.jpg",
        },
      ],
    };

    // Set recommended services based on car type
    setRecommendedServices(
      services[carType as keyof typeof services] || services.sedan
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-100">
        <div className="animate-pulse text-xl font-medium text-gray-700">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100">
      {/* Header */}
      <Header />

      {/* Welcome Banner */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {username}</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-300">
                {hasSubscription
                  ? "Your car deserves the best care. Check out your dashboard below."
                  : "Your car deserves a wipe everyday! Choose a subscription plan to get started."}
              </p>
            </div>

            {activeCar ? (
              <div className="mt-4 md:mt-0 bg-gray-800 rounded-lg p-2 sm:p-3 flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gray-700 p-1.5 sm:p-2 rounded-md">
                  <CarIcon className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-white text-sm sm:text-base font-medium">
                    {activeCar.make} {activeCar.model}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {activeCar.plate_number || "No plate"}
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleAddCar}
                className="mt-4 md:mt-0 bg-white text-black hover:bg-gray-100 rounded-full text-sm py-1.5 px-3 sm:py-2 sm:px-4"
              >
                <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Add Your Car
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs - No Scroll on Mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <div className="grid grid-cols-3 border-b">
          <button
            className={`pb-2 sm:pb-3 px-1 sm:px-3 font-medium text-center whitespace-nowrap flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 ${
              activeTab === "dashboard"
                ? "text-black border-b-2 border-[#c5e82e] relative top-px"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <HomeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Dashboard</span>
          </button>
          <button
            className={`pb-2 sm:pb-3 px-1 sm:px-3 font-medium text-center whitespace-nowrap flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 ${
              activeTab === "plans"
                ? "text-black border-b-2 border-[#c5e82e] relative top-px"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("plans")}
          >
            <ClipboardIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Plans</span>
          </button>
          <button
            className={`pb-2 sm:pb-3 px-1 sm:px-3 font-medium text-center whitespace-nowrap flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 ${
              activeTab === "car"
                ? "text-black border-b-2 border-[#c5e82e] relative top-px"
                : "text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("car")}
          >
            <CarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Vehicles</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            {activeCar ? (
              <div className="space-y-8">
                {/* Quick stats overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Next service card */}
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-shadow border-0 overflow-hidden">
                    <CardHeader className="pb-1 sm:pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-1 sm:gap-2">
                          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5e82e]" />
                          Next Service
                        </CardTitle>
                        <Badge className="bg-[#c5e82e] text-black text-xs py-0.5">
                          Tomorrow
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
                      <div className="rounded-lg bg-[#c5e82e]/10 p-3 sm:p-4 border border-[#c5e82e]/30 mb-2 sm:mb-4">
                        <div className="flex items-center">
                          <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5e82e] mr-1.5 sm:mr-2" />
                          <span className="text-xs sm:text-sm font-medium">
                            {bookedPlans.length > 0
                              ? bookedPlans[0].timeSlots[0]
                              : "9:00 AM - 10:00 AM"}
                          </span>
                        </div>
                        <div className="text-lg sm:text-2xl font-bold mt-1">
                          {format(addDays(new Date(), 1), "EEE, MMM d")}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center">
                          <ShieldCheckIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                          {bookedPlans.length > 0
                            ? "Premium Cleaning Service"
                            : "Exterior + Interior Cleaning"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Services usage card */}
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-shadow border-0 overflow-hidden">
                    <CardHeader className="pb-1 sm:pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-1 sm:gap-2">
                          <DropletIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5e82e]" />
                          Services Used
                        </CardTitle>
                        <div className="bg-white p-1.5 sm:p-2 rounded-full border border-gray-100">
                          <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5e82e]" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
                      <div className="flex items-end gap-1 sm:gap-2">
                        <div className="text-2xl sm:text-3xl font-bold">
                          {bookedPlans.length > 0
                            ? bookedPlans[0].completedServices
                            : 3}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                          of{" "}
                          {bookedPlans.length > 0
                            ? bookedPlans[0].totalServices
                            : 8}{" "}
                          this month
                        </p>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-3 sm:mt-4">
                        <motion.div
                          className="bg-[#c5e82e] h-1.5 sm:h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width:
                              bookedPlans.length > 0
                                ? `${
                                    (bookedPlans[0].completedServices /
                                      bookedPlans[0].totalServices) *
                                    100
                                  }%`
                                : "60%",
                          }}
                          transition={{
                            delay: 0.3,
                            duration: 0.8,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 sm:mt-2 flex items-center">
                        <TrendingUpIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-[#c5e82e]" />
                        {bookedPlans.length > 0
                          ? bookedPlans[0].totalServices -
                            bookedPlans[0].completedServices
                          : 5}{" "}
                        remaining this month
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Active plan details - only show if user has a plan */}
                {bookedPlans.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="overflow-hidden border-0 shadow-md">
                      <CardHeader className="bg-gradient-to-r from-gray-900 to-black py-3 sm:py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-1.5 sm:gap-2">
                              <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5e82e]" />
                              Plan Details
                            </h3>
                            <p className="text-[#c5e82e] text-xs sm:text-sm mt-0.5 sm:mt-1">
                              Next service{" "}
                              {format(
                                new Date(bookedPlans[0].nextServiceDate),
                                "EEEE, MMMM d"
                              )}
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 p-4 sm:p-6">
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                          <div className="flex items-center mb-2 sm:mb-3">
                            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 mr-1.5 sm:mr-2" />
                            <h4 className="font-bold text-sm sm:text-base">Schedule</h4>
                          </div>
                          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                            <div className="flex justify-between">
                              <span>Days:</span>
                              <span className="font-medium">
                                {formatDaysOfWeek(bookedPlans[0].daysOfWeek)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Time:</span>
                              <span className="font-medium">
                                {bookedPlans[0].timeSlots[0]}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Next service:</span>
                              <span className="font-medium">
                                {format(
                                  new Date(bookedPlans[0].nextServiceDate),
                                  "EEE, MMM d"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                          <div className="flex items-center mb-2 sm:mb-3">
                            <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 mr-1.5 sm:mr-2" />
                            <h4 className="font-bold text-sm sm:text-base">Included Services</h4>
                          </div>
                          <ul className="text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                            {bookedPlans[0].features
                              .slice(0, 3)
                              .map((feature, idx) => (
                                <motion.li
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 * idx }}
                                  className="flex items-start"
                                >
                                  <div className="mt-0.5 sm:mt-1 mr-1.5 sm:mr-2 text-[#c5e82e]">
                                    •
                                  </div>
                                  <span className="text-gray-700">
                                    {feature}
                                  </span>
                                </motion.li>
                              ))}
                            {bookedPlans[0].features.length > 3 && (
                              <li className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                                + {bookedPlans[0].features.length - 3} more
                                services
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Upcoming services */}
                      <div className="border-t p-4 sm:p-6">
                        <h4 className="font-bold mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                          <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5e82e]" />
                          Upcoming Services
                        </h4>
                        <div className="space-y-3 sm:space-y-4">
                          {[...Array(3)].map((_, idx) => {
                            const date = addDays(
                              new Date(bookedPlans[0].nextServiceDate),
                              idx * 2
                            );
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                className="flex items-center justify-between bg-white border rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center">
                                  <div className="bg-[#c5e82e]/10 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-4">
                                    <DropletIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5e82e]" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm sm:text-base">
                                      {idx === 0
                                        ? "Premium"
                                        : idx === 1
                                        ? "Standard"
                                        : "Express"}{" "}
                                      Cleaning
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500">
                                      {format(date, "EEEE, MMMM d")}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div className="text-xs sm:text-sm text-gray-500 mr-2 sm:mr-4 hidden sm:block">
                                    {bookedPlans[0].timeSlots[0]}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-xs py-1 h-7 sm:h-8"
                                  >
                                    {idx === 0 ? "Reschedule" : "Change"}
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
                    To get started, add your vehicle details so we can provide
                    personalized washing services tailored to your car.
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
        {activeTab === "plans" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Show active plan banner if user has an active plan */}
            {bookedPlans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-md rounded-xl border border-[#c5e82e]/30 p-4 sm:p-6 mb-6 sm:mb-8"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-[#c5e82e]/20 p-2 sm:p-3 rounded-full">
                      <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#c5e82e]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-bold">
                          {bookedPlans[0].name}
                        </h3>
                        <Badge className="bg-[#c5e82e] text-black text-xs">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        You're currently subscribed to our{" "}
                        {bookedPlans[0].name.split(" ")[0]} plan until{" "}
                        {format(
                          addDays(new Date(bookedPlans[0].startDate), 30),
                          "MMM d, yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-[#c5e82e] text-black hover:bg-[#c5e82e]/10 rounded-full text-sm py-1.5 px-3 h-8"
                    onClick={() => setActiveTab("dashboard")}
                  >
                    View Plan Details
                  </Button>
                </div>
              </motion.div>
            )}

            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">
                {bookedPlans.length > 0
                  ? "Manage Your Subscription"
                  : "Choose Your Perfect Plan"}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 px-4 sm:px-0">
                {bookedPlans.length > 0
                  ? "Compare your current plan with our other options or make changes to your subscription."
                  : "Select from our range of subscription options designed to keep your vehicle spotless. All plans include professional service by our expert wipers."}
              </p>
            </div>

            {/* Make the plan cards more compact on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = bookedPlans.some(
                  (bookedPlan) =>
                    bookedPlan.serviceId === plan.id ||
                    bookedPlan.name === plan.name
                );

                return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex flex-col h-full"
                  >
                    <Card
                      className={`overflow-hidden flex flex-col h-full border-0 ${
                        isCurrentPlan
                          ? "bg-gradient-to-br from-white to-[#c5e82e]/10 shadow-xl shadow-[#c5e82e]/20 ring-2 ring-[#c5e82e]"
                          : "shadow-lg"
                      }`}
                    >
                      <CardContent className="p-4 sm:p-6 flex flex-col flex-grow">
                        <div>
                          <div className="flex justify-between items-start mb-1 sm:mb-2">
                            <div className="text-base sm:text-xl font-bold">{plan.name}</div>
                            {isCurrentPlan && (
                              <Badge className="bg-[#c5e82e] text-black px-1.5 sm:px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                                Current Plan
                              </Badge>
                            )}
                            {!isCurrentPlan && plan.popular && (
                              <Badge className="bg-gray-100 text-gray-700 px-1.5 sm:px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                                Popular
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-baseline mb-3 sm:mb-4">
                            <span className="text-xl sm:text-3xl font-bold">
                              ₹{plan.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-gray-600 ml-1 sm:ml-2 text-xs sm:text-sm">/month</span>
                          </div>

                          {plan.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                              {plan.description}
                            </p>
                          )}

                          {plan.frequency && (
                            <Badge
                              variant="outline"
                              className="mb-2 sm:mb-3 inline-flex w-fit text-xs"
                            >
                              <CalendarIcon className="w-3 h-3 mr-1" />
                              {plan.frequency}
                            </Badge>
                          )}

                          <Separator className="mb-3 sm:mb-4" />

                          <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-grow">
                            {plan.features.slice(0, 4).map((feature, index) => (
                              <motion.li
                                key={index}
                                className="flex items-start text-xs sm:text-sm"
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                              >
                                <div
                                  className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${
                                    isCurrentPlan
                                      ? "bg-[#c5e82e]"
                                      : "bg-gray-200"
                                  } flex items-center justify-center mt-0.5 mr-1.5 sm:mr-2`}
                                >
                                  <CheckIcon
                                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${
                                      isCurrentPlan
                                        ? "text-black"
                                        : "text-gray-600"
                                    }`}
                                  />
                                </div>
                                <span
                                  className={`${
                                    isCurrentPlan
                                      ? "text-gray-800 font-medium"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {feature}
                                </span>
                              </motion.li>
                            ))}

                            {plan.features.length > 4 && (
                              <li className="text-xs text-gray-500">
                                +{plan.features.length - 4} more features
                              </li>
                            )}
                          </ul>
                        </div>

                        <div className="mt-auto">
                          {isCurrentPlan ? (
                            <Button
                              className="w-full py-2 sm:py-5 text-sm bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e]"
                              onClick={() => setActiveTab("dashboard")}
                            >
                              View Plan Details
                            </Button>
                          ) : (
                            <Button
                              className="w-full py-2 sm:py-5 text-sm bg-white text-black border border-gray-300 hover:bg-gray-50"
                              onClick={() =>
                                navigate("/plan-selection", {
                                  state: { serviceId: plan.id },
                                })
                              }
                            >
                              Select Plan
                            </Button>
                          )}

                          {isCurrentPlan ? (
                            <p className="text-center text-xs text-gray-500 mt-2 sm:mt-3">
                              Your active subscription
                            </p>
                          ) : plan.popular ? (
                            <p className="text-center text-xs text-gray-500 mt-2 sm:mt-3">
                              30-day satisfaction guarantee
                            </p>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Rest of the plans tab with mobile improvements */}
            <div className="bg-white rounded-2xl p-8 mt-12 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <DropletIcon className="w-5 h-5 text-[#c5e82e]" />
                Plan Management Options
              </h3>

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
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
                    <p className="font-medium">
                      Need help with your subscription?
                    </p>
                    <p className="text-sm mt-1">
                      Our customer service team is available 24/7 to assist
                      you with any questions about your plan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

{activeTab === "car" && (
  <div className="space-y-6 sm:space-y-8">
    {/* Header with responsive spacing and font sizes */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
      <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-1.5 sm:gap-2">
        <CarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#c5e82e]" />
        <span>My Vehicles</span>
      </h2>

      <Button
        onClick={handleAddCar}
        className="bg-black text-white hover:bg-gray-800 rounded-full border-b-2 border-[#c5e82e] text-sm py-1.5 px-4 sm:py-2 sm:px-5 w-full sm:w-auto"
      >
        <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> 
        Add Vehicle
      </Button>
    </div>

    {userCars.length > 0 ? (
      <div className="space-y-5 sm:space-y-6">
        {/* Car selection tabs with horizontal scrolling on small screens */}
        {userCars.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-gray-300">
            {userCars.map((car) => (
              <Button
                key={car.id}
                variant={activeCar?.id === car.id ? "default" : "outline"}
                className={`rounded-full flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm py-1 px-3 sm:py-1.5 sm:px-4 h-auto ${
                  activeCar?.id === car.id
                    ? "bg-[#c5e82e] text-black"
                    : ""
                }`}
                onClick={() => setActiveCar(car)}
              >
                <CarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {car.make} {car.model}
              </Button>
            ))}
          </div>
        )}

        {/* Display active car details with responsive layout */}
        {activeCar && (
          <Card className="overflow-hidden border-0 rounded-xl sm:rounded-2xl shadow-lg">
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {userCars.length > 1 ? "Selected Vehicle" : "Primary Vehicle"}
                </h3>
                <Badge className="bg-[#c5e82e] text-black text-xs">
                  Active
                </Badge>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-5 sm:gap-6">
                {/* Car image section with responsive width */}
                <div className="w-full md:w-1/3">
                  <div className="bg-gray-100 rounded-lg sm:rounded-xl h-48 sm:h-64 flex items-center justify-center">
                    <div className="bg-gray-200 p-3 sm:p-4 rounded-full">
                      <CarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex justify-center mt-3 sm:mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs h-7 sm:h-8 px-3 sm:px-4"
                    >
                      <CameraIcon className="w-3 h-3 mr-1.5" />
                      Upload Photo
                    </Button>
                  </div>
                </div>

                {/* Car details section */}
                <div className="w-full md:w-2/3">
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {activeCar.year} {activeCar.make} {activeCar.model}
                    <Badge className="bg-gray-100 text-gray-700 text-xs mt-1 sm:mt-0">
                      {activeCar.size.charAt(0).toUpperCase() + activeCar.size.slice(1)}
                    </Badge>
                  </h3>

                  {/* Grid for car details with responsive columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-500">Make</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-medium text-sm sm:text-base">{activeCar.make}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-500">License Plate</p>
                      <p className="font-medium text-sm sm:text-base mt-1">
                        {activeCar.plate_number || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-500">Recommended Service</p>
                      <p className="font-medium text-sm sm:text-base mt-1">
                        {activeCar.size === "suv"
                          ? "Deep Clean Package"
                          : activeCar.size === "small"
                          ? "Compact Wash"
                          : "Standard Exterior Wash"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-500">Next Service</p>
                      <p className="font-medium text-sm sm:text-base mt-1">
                        {bookedPlans.length > 0
                          ? format(new Date(bookedPlans[0].nextServiceDate), "MMM d, yyyy")
                          : "No service scheduled"}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons with better mobile layout */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Button className="bg-black text-white hover:bg-gray-800 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Edit Vehicle
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                    >
                      <HistoryIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Service History
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                    >
                      <Trash2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Service history section with responsive spacing */}
              <div className="p-4 sm:p-6">
                <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                  <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5e82e]" />
                  Recent Services
                </h4>

                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex justify-between items-center border-b pb-3 sm:pb-4 last:border-0"
                    >
                      <div className="flex gap-3 sm:gap-4">
                        <div className="bg-gray-100 p-1.5 sm:p-2 rounded-lg">
                          <DropletIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm sm:text-base">
                            {["Full Exterior Wash", "Premium Detailing", "Quick Clean"][item % 3]}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            April {20 + item}, 2025
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-xs whitespace-nowrap">
                        Completed
                      </Badge>
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  className="w-full mt-3 sm:mt-4 text-gray-600 text-xs sm:text-sm h-8 sm:h-9"
                >
                  View All History
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    ) : (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-6 sm:p-8 text-center">
        <div className="bg-[#c5e82e]/10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
          <CarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#c5e82e]" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
          No vehicles added yet
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
          Add your vehicle details so we can provide personalized
          washing services tailored to your car
        </p>
        <Button
          onClick={handleAddCar}
          className="bg-black text-white hover:bg-gray-800 px-6 py-2 sm:px-8 sm:py-4 rounded-full border-b-2 border-[#c5e82e] text-sm sm:text-base"
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> Add Your Car
        </Button>
      </div>
    )}
  </div>
)}
      </main>
    </div>
  );
};