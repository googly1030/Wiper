import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, addDays, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Card, CardContent } from "../../components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  BellRing,
  AlertCircle,
  ArrowRight,
  Filter,
  User,
  AlertTriangle,
} from "lucide-react";
import { toast } from "../../components/CustomToast";
import WiperNavigation from "../../components/WiperNavigation";

// Interface definitions
interface MicroSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

interface JobSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  location: string;
  carDetails: {
    make: string;
    model: string;
    type: string;
    color: string;
  };
  distance: string;
  payment: number;
  microSlots: MicroSlot[];
  isBooked: boolean;
  bookedBy?: string;
}

export const WiperJobBooking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableJobs, setAvailableJobs] = useState<JobSlot[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobSlot | null>(null);
  const [selectedMicroSlot, setSelectedMicroSlot] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterDistance, setFilterDistance] = useState("all"); // 'all', 'near', 'medium', 'far'
  const [filterTime, setFilterTime] = useState("all"); // 'all', 'morning', 'afternoon', 'evening'
  const [activeTab, setActiveTab] = useState("available"); // 'available', 'booked'
  const [myBookings, setMyBookings] = useState<JobSlot[]>([]);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);

  // Simulated data fetch
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data - In real app, this would come from the backend
        const mockJobs: JobSlot[] = generateMockJobs();
        setAvailableJobs(mockJobs);
        setFilteredJobs(mockJobs.filter(job => 
          isSameDay(parseISO(job.date), selectedDate)
        ));
        
        // Mock booked jobs
        const mockBookedJobs: JobSlot[] = generateMockBookedJobs();
        setMyBookings(mockBookedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast("Failed to load available jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs when date or filters change
  useEffect(() => {
    let filtered = availableJobs.filter(job => 
      isSameDay(parseISO(job.date), selectedDate)
    );

    // Apply distance filter
    if (filterDistance !== "all") {
      filtered = filtered.filter(job => {
        const distanceValue = parseInt(job.distance.split(" ")[0]);
        if (filterDistance === "near") return distanceValue <= 5;
        if (filterDistance === "medium") return distanceValue > 5 && distanceValue <= 10;
        if (filterDistance === "far") return distanceValue > 10;
        return true;
      });
    }

    // Apply time filter
    if (filterTime !== "all") {
      filtered = filtered.filter(job => {
        const hour = parseInt(job.startTime.split(":")[0]);
        if (filterTime === "morning" && hour < 12) return true;
        if (filterTime === "afternoon" && hour >= 12 && hour < 16) return true;
        if (filterTime === "evening" && hour >= 16) return true;
        return false;
      });
    }

    setFilteredJobs(filtered);
  }, [selectedDate, availableJobs, filterDistance, filterTime]);

  // Generate date range for week view
  const dateRange = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  // Mock job generator
  const generateMockJobs = (): JobSlot[] => {
    const jobs: JobSlot[] = [];
    const today = new Date();
    
    // Generate jobs for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      const numJobs = 2 + Math.floor(Math.random() * 4); // 2-5 jobs per day
      
      for (let j = 0; j < numJobs; j++) {
        // Random start hour between 6AM and 7PM
        const startHour = 6 + Math.floor(Math.random() * 14);
        const endHour = Math.min(startHour + 2, 21); // 2-hour slots, cap at 9PM
        
        // Generate random micro slots within the 2-hour window
        const microSlots: MicroSlot[] = [];
        for (let k = 0; k < 4; k++) {
          const slotStartHour = startHour + Math.floor(k / 2);
          const slotStartMinute = (k % 2) * 30;
          const slotTime = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`;
          
          microSlots.push({
            id: `slot-${j}-${k}`,
            time: slotTime,
            isAvailable: Math.random() > 0.3, // 70% chance of being available
          });
        }
        
        const carTypes = ["Sedan", "SUV", "Hatchback", "Premium"];
        const carColors = ["Black", "White", "Red", "Silver", "Blue"];
        const carMakes = ["Toyota", "Honda", "Ford", "Hyundai", "BMW", "Mercedes"];
        
        jobs.push({
          id: `job-${i}-${j}`,
          date: format(date, 'yyyy-MM-dd'),
          startTime: `${startHour.toString().padStart(2, '0')}:00`,
          endTime: `${endHour.toString().padStart(2, '0')}:00`,
          customerName: `Customer ${i * 10 + j}`,
          location: `Block ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}, Chennai`,
          carDetails: {
            make: carMakes[Math.floor(Math.random() * carMakes.length)],
            model: `Model ${Math.floor(Math.random() * 10) + 1}`,
            type: carTypes[Math.floor(Math.random() * carTypes.length)],
            color: carColors[Math.floor(Math.random() * carColors.length)],
          },
          distance: `${Math.floor(Math.random() * 15) + 1} km`,
          payment: 200 + Math.floor(Math.random() * 300), // ₹200-₹500
          microSlots,
          isBooked: false
        });
      }
    }
    
    return jobs;
  };

  // Mock booked jobs generator
  const generateMockBookedJobs = (): JobSlot[] => {
    const bookedJobs: JobSlot[] = [];
    const today = new Date();
    
    // Generate 3 booked jobs
    for (let i = 0; i < 3; i++) {
      const date = addDays(today, i);
      const startHour = 8 + Math.floor(Math.random() * 10); // 8AM to 6PM
      const endHour = startHour + 2;
      
      const microSlots: MicroSlot[] = [];
      for (let k = 0; k < 4; k++) {
        const slotStartHour = startHour + Math.floor(k / 2);
        const slotStartMinute = (k % 2) * 30;
        const slotTime = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`;
        
        microSlots.push({
          id: `booked-slot-${i}-${k}`,
          time: slotTime,
          isAvailable: false // All slots are unavailable because the job is booked
        });
      }
      
      const selectedSlot = microSlots[Math.floor(Math.random() * microSlots.length)];
      selectedSlot.isAvailable = true; // This is the one the wiper has selected
      
      const carTypes = ["Sedan", "SUV", "Hatchback"];
      const carColors = ["Black", "White", "Red", "Silver", "Blue"];
      
      bookedJobs.push({
        id: `booked-job-${i}`,
        date: format(date, 'yyyy-MM-dd'),
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:00`,
        customerName: `Customer ${i + 100}`,
        location: `Block ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}, Chennai`,
        carDetails: {
          make: ["Toyota", "Honda", "Ford"][Math.floor(Math.random() * 3)],
          model: `Model ${Math.floor(Math.random() * 5) + 1}`,
          type: carTypes[Math.floor(Math.random() * carTypes.length)],
          color: carColors[Math.floor(Math.random() * carColors.length)],
        },
        distance: `${Math.floor(Math.random() * 10) + 1} km`,
        payment: 250 + Math.floor(Math.random() * 150), // ₹250-₹400
        microSlots,
        isBooked: true,
        bookedBy: "You" // In a real app, this would be the wiper's ID/name
      });
    }
    
    return bookedJobs;
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Handle job selection
  const handleJobSelect = (job: JobSlot) => {
    setSelectedJob(job);
    setSelectedMicroSlot(null);
  };

  // Handle micro-slot selection
  const handleMicroSlotSelect = (slotId: string) => {
    setSelectedMicroSlot(slotId);
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedJob || !selectedMicroSlot) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show confirmation screen
      setShowConfirmation(true);
      
      // In a real app, you would update the booking in your database
      const updatedJobs = availableJobs.map(job => {
        if (job.id === selectedJob.id) {
          // Mark the job as booked
          return {
            ...job,
            isBooked: true,
            bookedBy: "You"
          };
        }
        return job;
      });
      
      setAvailableJobs(updatedJobs);
      
      // Add to my bookings
      setMyBookings([...myBookings, {
        ...selectedJob,
        isBooked: true,
        bookedBy: "You"
      }]);
      
    } catch (error) {
      console.error("Error booking job:", error);
      toast("Failed to book job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle closing the booking modal
  const handleCloseModal = () => {
    setSelectedJob(null);
    setSelectedMicroSlot(null);
  };

  // Handle closing the confirmation screen
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setSelectedJob(null);
    setSelectedMicroSlot(null);
    setActiveTab("booked"); // Switch to the booked tab
  };

  // Handle cancellation of a booking
  const handleCancelBooking = async (jobId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove from my bookings
      const updatedBookings = myBookings.filter(job => job.id !== jobId);
      setMyBookings(updatedBookings);
      
      // Close the cancel modal
      setShowCancelModal(null);
      
      toast("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast("Failed to cancel booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
              <img src="/wiperlogo.png" alt="Wiper" className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">Wiper Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#c5e82e] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Date selector */}
        <div className="mb-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 py-1 min-w-max">
            {dateRange.map((date, i) => (
              <button
                key={i}
                onClick={() => handleDateClick(date)}
                className={`flex flex-col items-center justify-center min-w-[4.5rem] py-3 px-2 rounded-xl transition-all ${
                  isSameDay(date, selectedDate)
                    ? "bg-black text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <span className="text-xs font-medium mb-1">
                  {format(date, "EEE")}
                </span>
                <span className={`text-2xl font-bold ${
                  isSameDay(date, new Date()) ? "text-[#c5e82e]" : ""
                }`}>
                  {format(date, "d")}
                </span>
                <span className="text-xs mt-1">
                  {format(date, "MMM")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters (expandable panel) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <h3 className="font-medium mb-3">Filter Options</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Distance</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "all", label: "All" },
                        { id: "near", label: "Near (< 5km)" },
                        { id: "medium", label: "Medium (5-10km)" },
                        { id: "far", label: "Far (> 10km)" }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => setFilterDistance(option.id)}
                          className={`text-xs px-3 py-1.5 rounded-full ${
                            filterDistance === option.id
                              ? "bg-[#c5e82e] text-black font-medium"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Time of Day</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "all", label: "All" },
                        { id: "morning", label: "Morning" },
                        { id: "afternoon", label: "Afternoon" },
                        { id: "evening", label: "Evening" }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => setFilterTime(option.id)}
                          className={`text-xs px-3 py-1.5 rounded-full ${
                            filterTime === option.id
                              ? "bg-[#c5e82e] text-black font-medium"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`pb-3 px-4 text-sm font-medium flex items-center gap-2 ${
              activeTab === "available"
                ? "border-b-2 border-[#c5e82e] text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("available")}
          >
            <Calendar className="w-4 h-4" />
            Available Jobs
          </button>
          <button
            className={`pb-3 px-4 text-sm font-medium flex items-center gap-2 ${
              activeTab === "booked"
                ? "border-b-2 border-[#c5e82e] text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("booked")}
          >
            <CheckCircle className="w-4 h-4" />
            My Bookings
          </button>
        </div>

        {/* Main content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === "available" ? (
            <motion.div
              key="available-jobs"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
            >
              {/* Available jobs */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-10 h-10 border-2 border-[#c5e82e] border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600">Loading available jobs...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No jobs available</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    There are no cleaning jobs available on {format(selectedDate, "EEEE, MMMM d")}.
                    Try selecting a different date or check back later.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map(job => (
                    <motion.div
                      key={job.id}
                      variants={cardVariants}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      whileHover={{ y: -2 }}
                    >
                      <div onClick={() => handleJobSelect(job)} className="cursor-pointer p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-[#c5e82e] text-black px-2 py-0.5 text-xs">
                                {format(parseISO(job.date), "EEE, MMM d")}
                              </Badge>
                              <Badge variant="outline" className="border-gray-200 text-gray-600 text-xs">
                                {job.startTime} - {job.endTime}
                              </Badge>
                            </div>
                            <h3 className="font-medium mb-1">
                              {job.carDetails.make} {job.carDetails.model} ({job.carDetails.color})
                            </h3>
                            <div className="flex items-center text-gray-600 text-sm">
                              <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{job.location}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-black">
                              ₹{job.payment}
                            </div>
                            <div className="text-xs text-gray-500">
                              {job.carDetails.type}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">
                              Available Micro-Slots:
                            </span>
                            <div className="flex items-center gap-1">
                              {job.microSlots.filter(slot => slot.isAvailable).map((slot, idx) => (
                                <div
                                  key={idx}
                                  className="w-2 h-2 rounded-full bg-[#c5e82e]"
                                ></div>
                              ))}
                              {job.microSlots.filter(slot => !slot.isAvailable).map((slot, idx) => (
                                <div
                                  key={idx}
                                  className="w-2 h-2 rounded-full bg-gray-200"
                                ></div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex gap-1 flex-wrap">
                              {job.microSlots.map(slot => (
                                <Badge
                                  key={slot.id}
                                  variant={slot.isAvailable ? "default" : "outline"}
                                  className={`text-xs py-0.5 ${
                                    slot.isAvailable 
                                      ? "bg-[#c5e82e]/20 text-black border border-[#c5e82e]/30" 
                                      : "bg-gray-100 text-gray-400 border-gray-200"
                                  }`}
                                >
                                  {slot.time}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-[#c5e82e] hover:text-[#a5c824] hover:bg-[#c5e82e]/10"
                            >
                              View Details <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="my-bookings"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
            >
              {/* My Bookings */}
              {myBookings.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You haven't booked any jobs yet. Browse available jobs and select a micro-slot to start cleaning.
                  </p>
                  <Button 
                    className="mt-4 bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e]"
                    onClick={() => setActiveTab("available")}
                  >
                    Browse Available Jobs
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map(job => (
                    <motion.div
                      key={job.id}
                      variants={cardVariants}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-green-100 text-green-800 px-2 py-0.5 text-xs">
                                Booked
                              </Badge>
                              <Badge className="bg-[#c5e82e] text-black px-2 py-0.5 text-xs">
                                {format(parseISO(job.date), "EEE, MMM d")}
                              </Badge>
                            </div>
                            <h3 className="font-medium mb-1">
                              {job.carDetails.make} {job.carDetails.model} ({job.carDetails.color})
                            </h3>
                            <div className="flex items-center text-gray-600 text-sm">
                              <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{job.location}</span>
                              <span className="mx-2 text-gray-300">•</span>
                              <span>{job.distance}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-black">
                              ₹{job.payment}
                            </div>
                            <div className="text-xs text-gray-500">
                              {job.carDetails.type}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-xs font-medium text-gray-600 mb-2">
                                Your Micro-Slot:
                              </div>
                              <div className="flex gap-2">
                                {job.microSlots.map(slot => (
                                  <Badge
                                    key={slot.id}
                                    variant={slot.isAvailable ? "default" : "outline"}
                                    className={`text-xs py-1 ${
                                      slot.isAvailable 
                                        ? "bg-green-100 text-green-800 border border-green-200" 
                                        : "bg-gray-100 text-gray-400 border-gray-200"
                                    }`}
                                  >
                                    {slot.time}
                                    {slot.isAvailable && (
                                      <CheckCircle className="w-3 h-3 ml-1 text-green-700" />
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex items-start">
                            <BellRing className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-yellow-800">
                              <span className="font-medium">Reminder:</span> You'll need to arrive at your selected micro-slot time. 
                              You'll receive a reminder notification the day before.
                            </div>
                          </div>
                          
                          {/* New fixed position for the cancel button */}
                          <div className="flex justify-end mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100"
                              onClick={() => setShowCancelModal(job.id)}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel Booking
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Use the WiperNavigation component */}
      <WiperNavigation />

      {/* Keep your existing modals */}
      {/* Job detail modal */}
      <AnimatePresence>
        {selectedJob && !showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black text-white p-6 pb-8">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-white/80 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <h2 className="text-xl font-bold mb-1">
                  {selectedJob.carDetails.make} {selectedJob.carDetails.model}
                </h2>
                <div className="flex items-center gap-3 text-gray-300 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(parseISO(selectedJob.date), "EEE, MMM d")}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {selectedJob.startTime} - {selectedJob.endTime}
                  </div>
                </div>
                
                <div className="absolute -bottom-5 right-6 bg-[#c5e82e] text-black font-bold px-4 py-2 rounded-lg shadow-lg">
                  ₹{selectedJob.payment}
                </div>
              </div>
              
              <div className="p-6 pt-8">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Car Type</div>
                    <div className="flex items-center">
                      <Car className="w-4 h-4 mr-1 text-gray-700" />
                      <span className="font-medium">{selectedJob.carDetails.type}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Color</div>
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                        style={{ 
                          backgroundColor: selectedJob.carDetails.color.toLowerCase() === "white" 
                            ? "#ffffff" 
                            : selectedJob.carDetails.color.toLowerCase()
                        }}
                      ></div>
                      <span className="font-medium">{selectedJob.carDetails.color}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-5 h-5 text-gray-700 mr-2" />
                    <h3 className="font-medium">Location Details</h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">{selectedJob.location}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <span>{selectedJob.distance} away</span>
                      <span className="mx-2">•</span>
                      <Button variant="ghost" size="sm" className="text-xs text-[#c5e82e] hover:text-[#a5c824] p-0 h-auto">
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Select Your Micro-Slot</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Choose a specific 30-minute window when you'll arrive to clean the vehicle:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {selectedJob.microSlots.map(slot => (
                      <button
                        key={slot.id}
                        disabled={!slot.isAvailable}
                        onClick={() => handleMicroSlotSelect(slot.id)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          !slot.isAvailable
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : selectedMicroSlot === slot.id
                            ? "bg-[#c5e82e]/20 border-[#c5e82e] text-black"
                            : "bg-white border-gray-200 hover:border-[#c5e82e] hover:bg-[#c5e82e]/5"
                        }`}
                      >
                        <div className="font-medium">{slot.time}</div>
                        <div className="text-xs mt-1">
                          {slot.isAvailable ? "Available" : "Unavailable"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-gray-700 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800">Important Information</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Please arrive within your selected micro-slot time. You'll need to confirm 
                        arrival using the app. The customer expects cleaning to be completed within 
                        your allotted time.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleConfirmBooking}
                  disabled={!selectedMicroSlot || loading}
                  className="w-full py-6 rounded-xl bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>Confirm Booking</>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation screen */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 text-center"
            >
              <div className="w-20 h-20 bg-[#c5e82e]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-[#c5e82e]" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                You have successfully booked a cleaning job for {format(parseISO(selectedJob!.date), "EEEE, MMMM d")}.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center mb-6">
                <div className="text-sm text-gray-500 mb-1">Your selected micro-slot</div>
                <div className="text-xl font-bold mb-2">
                  {selectedJob?.microSlots.find(s => s.id === selectedMicroSlot)?.time}
                </div>
                <Badge className="bg-[#c5e82e] text-black">
                  {selectedJob?.startTime} - {selectedJob?.endTime} window
                </Badge>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex items-start mb-6 text-left">
                <BellRing className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <span className="font-medium">Remember:</span> You'll receive a reminder notification
                  the day before your booking. Please arrive on time within your micro-slot.
                </div>
              </div>
              
              <Button
                onClick={handleCloseConfirmation}
                className="w-full py-5 rounded-xl bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e]"
              >
                Go to My Bookings
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel confirmation modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCancelModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-center mb-2">Cancel Booking</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1 py-2.5"
                  onClick={() => setShowCancelModal(null)}
                >
                  Keep Booking
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5"
                  onClick={() => handleCancelBooking(showCancelModal)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Yes, Cancel Booking"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default WiperJobBooking;