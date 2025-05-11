import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isSameDay, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  CheckCircle,
  Star,
  User,
  Plus,
  TrendingUp,
  DollarSign,
  Sparkles,
  Package
} from "lucide-react";
import { toast } from "../../components/CustomToast";
import WiperNavigation from "../../components/WiperNavigation";

// Interface for booked jobs
interface BookedJob {
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
  planName: string;
  planFrequency: string;
  planFeatures: string[];
  status: "upcoming" | "completed" | "in-progress";
}

// Interface for wiper ratings
interface WiperRating {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  date: string;
}

// Interface for earnings stats
interface EarningsStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalJobs: number;
  completionRate: number;
}

export const WiperHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookedJobs, setBookedJobs] = useState<BookedJob[]>([]);
  const [recentRatings, setRecentRatings] = useState<WiperRating[]>([]);
  const [earningsStats, setEarningsStats] = useState<EarningsStats>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalJobs: 0,
    completionRate: 0
  });
  const [averageRating, setAverageRating] = useState(0);

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // Fetch data when component mounts
  useEffect(() => {
    const fetchWiperData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get booked jobs from localStorage (this would come from your API in a real app)
        const storedBookings = localStorage.getItem('wiperBookedJobs');
        const parsedBookings = storedBookings ? JSON.parse(storedBookings) : [];
        
        // Get completions from localStorage
        const completedJobs = localStorage.getItem("wiperCompletedJobs");
        const parsedCompletedJobs = completedJobs ? JSON.parse(completedJobs) : {};
        
        // Convert bookings to the BookedJob format with status from localStorage
        const formattedBookings: BookedJob[] = parsedBookings.map((job: any) => ({
          ...job,
          status: determineJobStatus(job.id, job.date, job.startTime)
        }));
        
        // Generate mock data for ratings and stats
        const mockRatings = generateMockRatings();
        const mockStats = generateMockEarningsStats(formattedBookings);
        
        // Calculate average rating
        const avgRating = mockRatings.reduce((sum, rating) => sum + rating.rating, 0) / mockRatings.length;
        
        setBookedJobs(formattedBookings);
        setRecentRatings(mockRatings);
        setEarningsStats(mockStats);
        setAverageRating(parseFloat(avgRating.toFixed(1)));
      } catch (error) {
        console.error("Error fetching wiper data:", error);
        toast("Failed to load your data");
      } finally {
        setLoading(false);
      }
    };

    fetchWiperData();
    
    // Listen for storage events to update bookings when changed in other tabs
    const handleStorageChange = () => {
      const storedBookings = localStorage.getItem('wiperBookedJobs');
      if (storedBookings) {
        const parsedBookings = JSON.parse(storedBookings);
        const formattedBookings: BookedJob[] = parsedBookings.map((job: any) => ({
          ...job,
          status: determineJobStatus(job.id, job.date, job.startTime)
        }));
        setBookedJobs(formattedBookings);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Helper function to determine job status based on date and time
  const determineJobStatus = (jobId: string, dateStr: string, timeStr: string): "upcoming" | "completed" | "in-progress" => {
    const now = new Date();
    const jobDate = parseISO(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    const jobDateTime = new Date(jobDate);
    jobDateTime.setHours(hours, minutes);
    
    const jobEndTime = new Date(jobDateTime);
    jobEndTime.setHours(jobEndTime.getHours() + 1); // Assuming jobs last 1 hour
    
    // Check if this job+date is marked as completed in localStorage
    const completedJobs = localStorage.getItem("wiperCompletedJobs");
    const parsedCompletedJobs = completedJobs ? JSON.parse(completedJobs) : {};
    
    // First check for today's date
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // If this job has completion data for today in localStorage, it's completed
    if (parsedCompletedJobs[jobId] && parsedCompletedJobs[jobId][today]) {
      return "completed";
    }
    
    // If this job has completion data for the job date in localStorage, it's also completed
    if (parsedCompletedJobs[jobId] && parsedCompletedJobs[jobId][dateStr]) {
      return "completed";
    }
    
    // Otherwise determine based on time
    if (now < jobDateTime) {
      return "upcoming";
    } else if (now >= jobDateTime && now <= jobEndTime) {
      return "in-progress";
    } else {
      // FIXED: Don't automatically mark past jobs as completed
      // Instead, show jobs as pending/upcoming if they weren't explicitly marked complete
      return "upcoming";
    }
  };

  // Generate mock ratings
  const generateMockRatings = (): WiperRating[] => {
    const ratings: WiperRating[] = [
      {
        id: "rating-1",
        rating: 5,
        comment: "Great service! My car looks brand new. Very thorough cleaning.",
        customerName: "Arun Kumar",
        date: format(addDays(new Date(), -1), 'yyyy-MM-dd')
      },
      {
        id: "rating-2",
        rating: 4,
        comment: "Good service. On time and did a nice job with the interior.",
        customerName: "Priya Sharma",
        date: format(addDays(new Date(), -3), 'yyyy-MM-dd')
      },
      {
        id: "rating-3",
        rating: 5,
        comment: "Exceptional work! Very detail-oriented and professional.",
        customerName: "Rahul Verma",
        date: format(addDays(new Date(), -5), 'yyyy-MM-dd')
      }
    ];
    
    return ratings;
  };

  // Generate mock earnings stats based on booked jobs
  const generateMockEarningsStats = (jobs: BookedJob[]): EarningsStats => {
    // Calculate earnings based on actual booked jobs
    const completedJobs = jobs.filter(job => job.status === "completed");
    const totalEarnings = completedJobs.reduce((sum, job) => sum + job.payment, 0);
    
    // Today's earnings - jobs completed today
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayEarnings = completedJobs
      .filter(job => job.date === todayStr)
      .reduce((sum, job) => sum + job.payment, 0);
    
    // This week's earnings - jobs completed in the last 7 days
    const weekAgo = addDays(today, -7);
    const weekEarnings = completedJobs
      .filter(job => parseISO(job.date) >= weekAgo)
      .reduce((sum, job) => sum + job.payment, 0);
    
    return {
      today: todayEarnings || 0,
      thisWeek: weekEarnings || 0,
      thisMonth: totalEarnings || 0,
      totalJobs: jobs.length,
      completionRate: jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0
    };
  };

  // Navigate to job booking screen
  const navigateToJobBooking = () => {
    navigate("/wiper-job-bookings");
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "completed":
        return { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3.5 h-3.5" /> };
      case "in-progress":
        return { color: "bg-blue-100 text-blue-800", icon: <Package className="w-3.5 h-3.5" /> };
      default:
        return { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3.5 h-3.5" /> };
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
            <h1 className="text-xl font-bold">My Dashboard</h1>
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
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-2 border-[#c5e82e] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Rating and Quick Stats */}
              <motion.div variants={itemVariants} className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Overall Rating Card */}
                  <Card className="bg-white shadow-sm border-none overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium text-gray-800">Your Rating</h3>
                        <Badge className="bg-[#c5e82e]/20 text-black border border-[#c5e82e]">
                          Top Performer
                        </Badge>
                      </div>
                      
                      <div className="mt-3 flex items-center">
                        <span className="text-3xl font-bold text-black mr-2">{averageRating}</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} fill={i < Math.floor(averageRating) ? "#c5e82e" : "none"} 
                              className={`w-4 h-4 ${i < Math.floor(averageRating) ? "text-[#c5e82e]" : "text-gray-300"}`} />
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        Based on {recentRatings.length} ratings
                      </div>
                      
                      <div className="mt-5 space-y-3">
                        {recentRatings.slice(0, 1).map(rating => (
                          <div key={rating.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} fill={i < rating.rating ? "#c5e82e" : "none"} 
                                    className={`w-3 h-3 ${i < rating.rating ? "text-[#c5e82e]" : "text-gray-300"}`} />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {format(parseISO(rating.date), "MMM d")}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700">{rating.comment}</p>
                            <span className="text-xs text-gray-500 mt-1 block">
                              - {rating.customerName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Earnings & Stats Cards */}
                  <Card className="bg-white shadow-sm border-none overflow-hidden">
                    <CardContent className="p-4">
                      <h3 className="text-base font-medium text-gray-800 mb-3">Earnings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#c5e82e]/20 flex items-center justify-center mr-3">
                              <DollarSign className="w-4 h-4 text-[#c5e82e]" />
                            </div>
                            <span className="text-sm text-gray-600">Today</span>
                          </div>
                          <span className="text-sm font-medium">₹{earningsStats.today}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <DollarSign className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-600">This Week</span>
                          </div>
                          <span className="text-sm font-medium">₹{earningsStats.thisWeek}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <DollarSign className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-600">This Month</span>
                          </div>
                          <span className="text-sm font-medium">₹{earningsStats.thisMonth}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white shadow-sm border-none overflow-hidden">
                    <CardContent className="p-4">
                      <h3 className="text-base font-medium text-gray-800 mb-3">Performance</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#c5e82e]/20 flex items-center justify-center mr-3">
                              <CheckCircle className="w-4 h-4 text-[#c5e82e]" />
                            </div>
                            <span className="text-sm text-gray-600">Completion Rate</span>
                          </div>
                          <span className="text-sm font-medium">{Math.round(earningsStats.completionRate)}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                              <Car className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-600">Total Jobs</span>
                          </div>
                          <span className="text-sm font-medium">{earningsStats.totalJobs}</span>
                        </div>
                      
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
              
              {/* Action Button */}
              <motion.div variants={itemVariants} className="mb-6">
                <Button 
                  className="w-full bg-[#c5e82e] hover:bg-[#b3d429] text-black shadow-sm py-6"
                  onClick={navigateToJobBooking}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Find New Jobs to Book
                </Button>
              </motion.div>
              
              {/* My Bookings Section */}
              <motion.div variants={itemVariants} className="mb-6">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-[#c5e82e]" /> 
                  My Bookings
                </h2>
                
                {bookedJobs.length === 0 ? (
                  <Card className="bg-white border-none shadow-sm">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-4">
                        You don't have any booked jobs. Find available jobs and start earning today!
                      </p>
                      <Button 
                        variant="outline"
                        className="mx-auto border-[#c5e82e] text-black hover:bg-[#c5e82e]/10"
                        onClick={navigateToJobBooking}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Find Jobs
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-5">
                    {bookedJobs
                      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
                      .map(job => {
                        const isToday = isSameDay(parseISO(job.date), new Date());
                        const statusInfo = getStatusInfo(job.status);
                        
                        return (
                          <motion.div
                            key={job.id}
                            variants={itemVariants}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="p-4 sm:p-5">
                              {/* Date, Plan Badge and Time info */}
                              <div className="mb-3">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Badge className="bg-[#c5e82e] text-black px-2 py-1 text-xs">
                                    {job.planName}
                                  </Badge>
                                  <Badge variant="outline" className="border-gray-200 text-gray-600 text-xs">
                                    {job.startTime} - {job.endTime}
                                  </Badge>
                                  <Badge variant="outline" className="border-gray-200 text-gray-600 text-xs flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {isToday ? "Today" : format(parseISO(job.date), "MMM d")}
                                  </Badge>
                                  
<Badge className={`px-2 py-1 text-xs flex items-center ${statusInfo.color}`}>
  {statusInfo.icon}
  <span className="ml-1 capitalize">{job.status.replace('-', ' ')}</span>
</Badge>
                                </div>
                                
                                {/* Car details section */}
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
                                      ₹800
                                    </div>
                                    {job.planFrequency && (
                                      <div className="text-xs text-gray-500">
                                        {job.planFrequency}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Separator */}
                              <div className="h-px bg-gray-200 my-4"></div>
                              
                              {/* Plan features (first 2) */}
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
                              
                              {/* Single action button */}
                              <div className="flex justify-center sm:justify-end">
                                <Button
                                  variant="outline"
                                  className="border-[#c5e82e] text-black hover:bg-[#c5e82e]/10 shadow-sm text-xs py-2 w-full sm:w-auto"
                                  onClick={() => navigate(`/job-details/${job.id}`)}
                                >
                                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                  View Schedule
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* WiperNavigation component */}
      <WiperNavigation />
    </div>
  );
};

export default WiperHome;