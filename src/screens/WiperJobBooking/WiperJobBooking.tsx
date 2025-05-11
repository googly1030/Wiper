import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  MapPin,
  Car,
  CheckCircle,
  X,
  BellRing,
  User,
  AlertTriangle,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { toast } from "../../components/CustomToast";
import WiperNavigation from "../../components/WiperNavigation";
import { monthlyPlans } from "../../data/serviceData";

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
    regNumber: string; 
  };
  distance: string;
  payment: number;
  microSlots: MicroSlot[];
  isBooked: boolean;
  bookedBy?: string;
  planId?: string;
  planName?: string;
  planFrequency?: string;
  planFeatures?: string[];
}

export const WiperJobBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<string | null>(null);
  const [availableJobs, setAvailableJobs] = useState<JobSlot[]>([]);
  const [myBookings, setMyBookings] = useState<JobSlot[]>([]);

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

  // Simulated data fetch
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock available jobs
        const mockAvailableJobs = generateMockAvailableJobs();
        setAvailableJobs(mockAvailableJobs);
        
        // Set initial bookings to empty
        setMyBookings([]);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast("Failed to load job data");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Handle job selection/booking
  const handleSelectJob = async (jobId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find the job from available jobs
      const selectedJob = availableJobs.find(job => job.id === jobId);
      if (!selectedJob) return;
      
      // Move from available to booked jobs
      const updatedAvailableJobs = availableJobs.filter(job => job.id !== jobId);
      
      // Mark as booked by this wiper
      const bookedJob = {
        ...selectedJob,
        isBooked: true,
        bookedBy: "You"
      };
      
      setAvailableJobs(updatedAvailableJobs);
      setMyBookings(prev => [...prev, bookedJob]);
      
      // Close the confirm modal
      setConfirmModal(null);
      
      toast("Job booked successfully! You can view it in 'My Bookings'");
    } catch (error) {
      console.error("Error booking job:", error);
      toast("Failed to book job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Mock available jobs generator with plan details
  const generateMockAvailableJobs = (): JobSlot[] => {
    const availableJobs: JobSlot[] = [];
    const today = new Date();
    
    // Create 6 different job posts with diverse plans and car types
    const jobData = [
      {
        planIndex: 0, // Hatchback plan
        carMake: "Maruti Suzuki",
        carModel: "Swift",
        carType: "Hatchback",
        carColor: "Red",
        regNumber: "TN 01 AK 4567", // Added registration number
        location: "Anna Nagar, Chennai",
        distance: "3.2 km",
        dayOffset: 0, // today
        startHour: 9
      },
      {
        planIndex: 1, // Sedan plan
        carMake: "Honda",
        carModel: "City",
        carType: "Sedan",
        carColor: "Silver",
        regNumber: "TN 07 CJ 2345", // Added registration number
        location: "T Nagar, Chennai",
        distance: "5.7 km",
        dayOffset: 0, // today
        startHour: 14
      },
      {
        planIndex: 2, // SUV plan
        carMake: "Hyundai",
        carModel: "Creta",
        carType: "SUV",
        carColor: "White",
        location: "Velachery, Chennai",
        distance: "8.1 km",
        dayOffset: 1, // tomorrow
        startHour: 10
      },
      {
        planIndex: 3, // Premium plan
        carMake: "BMW",
        carModel: "3 Series",
        carType: "Premium",
        carColor: "Black",
        location: "Adyar, Chennai",
        distance: "6.5 km",
        dayOffset: 1, // tomorrow
        startHour: 16
      },
      {
        planIndex: 0, // Hatchback plan
        carMake: "Tata",
        carModel: "Altroz",
        carType: "Hatchback",
        carColor: "Blue",
        location: "Porur, Chennai",
        distance: "10.3 km",
        dayOffset: 2, // day after tomorrow
        startHour: 8
      },
      {
        planIndex: 2, // SUV plan
        carMake: "Mahindra",
        carModel: "XUV700",
        carType: "SUV",
        carColor: "Green",
        location: "OMR, Chennai",
        distance: "12.8 km",
        dayOffset: 2, // day after tomorrow
        startHour: 11
      }
    ];
    
    // Generate jobs based on the data above
    jobData.forEach((data, i) => {
      const date = addDays(today, data.dayOffset);
      const startHour = data.startHour;
      const endHour = startHour + 2;
      
      // Generate micro slots for this job
      const microSlots: MicroSlot[] = [];
      for (let k = 0; k < 4; k++) {
        const slotStartHour = startHour + Math.floor(k / 2);
        const slotStartMinute = (k % 2) * 30;
        const slotTime = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`;
        
        microSlots.push({
          id: `slot-${i}-${k}`,
          time: slotTime,
          isAvailable: true // All slots are available for booking
        });
      }
      
      // Get the plan details
      const plan = monthlyPlans[data.planIndex];
      
      availableJobs.push({
        id: `job-${i}`,
        date: format(date, 'yyyy-MM-dd'),
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:00`,
        customerName: `Customer ${i + 100}`,
        location: data.location,
        carDetails: {
          make: data.carMake,
          model: data.carModel,
          type: data.carType,
          color: data.carColor,
          regNumber: data.regNumber, // Added registration number
        },
        distance: data.distance,
        payment: plan.price,
        microSlots,
        isBooked: false,
        planId: plan.id,
        planName: plan.name,
        planFrequency: plan.frequency,
        planFeatures: plan.features
      });
    });
    
    return availableJobs;
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
            <h1 className="text-xl font-bold">Available Jobs</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#c5e82e] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content - improved padding for mobile */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        {/* Available Jobs Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2 text-[#c5e82e]" /> 
            Jobs Available For Booking
          </h2>
          
          <AnimatePresence mode="wait">
            <motion.div
              key="available-jobs"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-10 h-10 border-2 border-[#c5e82e] border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600">Loading available jobs...</p>
                </div>
              ) : availableJobs.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">No jobs available</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    There are currently no cleaning jobs available for booking.
                    Check back later for new opportunities.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {availableJobs.map(job => (
                    <motion.div
                      key={job.id}
                      variants={cardVariants}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 sm:p-5">
                        {/* Date, Plan Badge and Time info - improved mobile layout */}
{/* Job header with plan, date and time */}
<div className="mb-3">
  <div className="flex flex-wrap items-center gap-2 mb-2">
    <Badge className="bg-[#c5e82e] text-black px-2 py-1 text-xs">
      {job.planName}
    </Badge>
    <Badge variant="outline" className="border-gray-200 text-gray-600 text-xs">
      {job.startTime} - {job.endTime}
    </Badge>
  </div>
  
  {/* Car details section with improved layout */}
  <div className="flex justify-between items-start mt-1">
    <div>
      <h3 className="font-medium text-base mb-1.5 ml-1">
        {job.carDetails.make} {job.carDetails.model}
      </h3>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-600 text-xs">
          {job.carDetails.type}
        </Badge>
        <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-600 text-xs font-mono">
          {job.carDetails.regNumber}
        </Badge>
       
      </div>
       <span className="text-xs text-gray-500 flex items-center">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 mr-1 ml-2"></span>
          Block A
        </span>
    </div>
    <div className="text-right mt-1.5">
      <div className="text-lg font-bold text-black">
        ₹{job.payment}
      </div>
      {job.planFrequency && (
        <div className="text-xs text-gray-500">
          {job.planFrequency}
        </div>
      )}
    </div>
  </div>
</div>
                        
                        {/* Separator - added more margin */}
                        <Separator className="my-4" />
                        
                        {/* Plan features (first 2) - fixed layout */}
                        {job.planFeatures && job.planFeatures.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-1 mb-2">
                              <Sparkles className="w-3.5 h-3.5 text-[#c5e82e]" />
                              <span className="text-xs font-medium">Plan Features:</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {job.planFeatures.slice(0, 2).map((feature, index) => (
                                <div key={index} className="flex items-start">
                                  <CheckCircle className="w-3 h-3 text-[#c5e82e] mt-0.5 mr-1.5 flex-shrink-0" />
                                  <span className="text-xs text-gray-600">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Available note - better padding */}
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100 flex items-start mb-4">
                          <BellRing className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-800">
                            <span className="font-medium">Notice: </span>
                            Booking this job will add it to your schedule.
                          </div>
                        </div>
                        
                        {/* Book job button */}
                        <div className="flex justify-center sm:justify-end">
                          <Button
                            className="bg-[#c5e82e] hover:bg-[#b3d429] text-black shadow-sm text-xs py-2 w-full sm:w-auto"
                            onClick={() => setConfirmModal(job.id)}
                          >
                            <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                            Book This Job
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* My Bookings Section - Will show once jobs are booked - improved spacing */}
        {myBookings.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" /> 
              My Booked Jobs
            </h2>
            
            <div className="space-y-5">
              {myBookings.map(job => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden"
                >
                  <div className="p-4 sm:p-5">
                    {/* Plan Badge and Time info - improved mobile layout */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 px-2 py-1 text-xs border border-green-200">
                          {job.planName}
                        </Badge>
                        <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700 text-xs">
                          {format(parseISO(job.date), "MMM d")}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="border-gray-200 text-gray-600 text-xs w-fit">
                        {job.startTime} - {job.endTime}
                      </Badge>
                    </div>
                    
                    {/* Car details section - improved mobile layout */}
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0 sm:items-start">
                      <div>
                        <h3 className="font-medium text-base mb-1">
                          {job.carDetails.make} {job.carDetails.model}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-gray-200 text-gray-600 text-xs">
                            {job.carDetails.type}
                          </Badge>
                          <Badge variant="outline" className="border-gray-200 text-gray-600 text-xs">
                            {job.carDetails.color}
                          </Badge>
                        </div>
                        <div className="flex items-center text-gray-600 text-xs">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{job.location}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span>{job.distance}</span>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-lg font-bold text-black">
                          ₹{job.payment}
                        </div>
                        {job.planFrequency && (
                          <div className="text-xs text-gray-500">
                            {job.planFrequency}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Success note - better padding */}
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100 flex items-start mt-4">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-green-800">
                        <span className="font-medium">Booked Successfully!</span> You can find all your booked jobs in 
                        the My Bookings section. Remember to arrive at your selected time.
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WiperNavigation component */}
      <WiperNavigation />

      {/* Confirm booking modal - improved button layout */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-[#ebf5d3] rounded-full flex items-center justify-center">
                  <Car className="w-6 h-6 text-[#c5e82e]" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-center mb-2">Confirm Booking</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to book this cleaning job? This will add it to your schedule.
              </p>
              
              <div className="flex gap-3 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1 py-2.5"
                  onClick={() => setConfirmModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#c5e82e] hover:bg-[#b3d429] text-black py-2.5"
                  onClick={() => handleSelectJob(confirmModal)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Yes, Book This Job"
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