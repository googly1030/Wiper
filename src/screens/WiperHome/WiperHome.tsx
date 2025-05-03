import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, addDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, getMonth, getYear, startOfMonth, endOfMonth, isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  ChevronRight,
  PieChart,
  CalendarDays,
  ArrowRight,
  Package,
  Sparkles
} from "lucide-react";
import { toast } from "../../components/CustomToast";
// Import service data
import { monthlyPlans } from "../../data/serviceData";

// Interface for job/booking data - updated to include service details
interface JobBooking {
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
  payment: number;
  status: "upcoming" | "completed" | "cancelled" | "in-progress";
  microSlot?: string;
  planName: string;
  planDescription: string;
}

// Job status counts interface
interface StatusCounts {
  upcoming: number;
  completed: number;
  cancelled: number;
  inProgress: number;
}

export const WiperHome = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayJobs, setTodayJobs] = useState<JobBooking[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<JobBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    inProgress: 0
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('month');

  // Generate week dates for the calendar
  const currentWeekStart = startOfWeek(selectedDate);
  const currentWeekEnd = endOfWeek(selectedDate);
  const weekDates = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  // Fetch jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock data
        const mockJobs = generateMockJobs();
        
        // Sort jobs: upcoming first, then in-progress, completed, and cancelled
        const sortedMockJobs = [...mockJobs].sort((a, b) => {
          const statusOrder = {
            "upcoming": 0,
            "in-progress": 1,
            "completed": 2,
            "cancelled": 3
          };
          return statusOrder[a.status] - statusOrder[b.status];
        });
        
        // Set today's jobs
        const today = new Date();
        const todayJobsList = sortedMockJobs.filter(job => 
          isSameDay(parseISO(job.date), today)
        );
        setTodayJobs(todayJobsList);

        // Set upcoming jobs for the selected date (if different from today)
        if (!isSameDay(selectedDate, today)) {
          const selectedJobs = sortedMockJobs.filter(job => 
            isSameDay(parseISO(job.date), selectedDate)
          );
          setUpcomingJobs(selectedJobs);
        } else {
          setUpcomingJobs([]);
        }

        // Calculate status counts
        const counts: StatusCounts = {
          upcoming: mockJobs.filter(job => job.status === "upcoming").length,
          completed: mockJobs.filter(job => job.status === "completed").length,
          cancelled: mockJobs.filter(job => job.status === "cancelled").length,
          inProgress: mockJobs.filter(job => job.status === "in-progress").length
        };
        setStatusCounts(counts);

      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast("Failed to load job data");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [selectedDate]);

  // Generate mock job data with monthly plans
  const generateMockJobs = () => {
    const jobs: JobBooking[] = [];
    const today = new Date();
    
    // Generate jobs for the next 14 days
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      const jobCountForDay = i === 0 ? 5 : 2 + Math.floor(Math.random() * 3); // More jobs for today
      
      for (let j = 0; j < jobCountForDay; j++) {
        // For today, create a mix of different statuses
        let status: "upcoming" | "completed" | "cancelled" | "in-progress" = "upcoming";
        
        if (i === 0) {
          // For today's jobs
          if (j === 0) status = "completed";
          else if (j === 1) status = "in-progress";
          else if (j === jobCountForDay - 1) status = "cancelled";
        } else {
          // For future days, all jobs are upcoming
          status = "upcoming";
        }
        
        // Random start hour between 7AM and 7PM
        const startHour = 7 + Math.floor(Math.random() * 12);
        const endHour = Math.min(startHour + 1, 21);
        
        // Get random service plan from monthly plans
        const randomPlan = monthlyPlans[Math.floor(Math.random() * monthlyPlans.length)];
        
        const carTypes = ["Sedan", "SUV", "Hatchback", "Premium"];
        const carColors = ["Black", "White", "Red", "Silver", "Blue"];
        const carMakes = ["Toyota", "Honda", "Ford", "Hyundai", "BMW", "Mercedes"];
        const locations = [
          "chennai, Tamil Nadu",
        ];
        
        // Match car type with appropriate plan
        const carType = randomPlan.vehicleType === 'hatchback' ? "Hatchback" :
                         randomPlan.vehicleType === 'sedan' ? "Sedan" :
                         randomPlan.vehicleType === 'suv' ? "SUV" : "Premium";
        
        jobs.push({
          id: `job-${i}-${j}`,
          date: format(date, 'yyyy-MM-dd'),
          startTime: `${startHour.toString().padStart(2, '0')}:00`,
          endTime: `${endHour.toString().padStart(2, '0')}:00`,
          customerName: `Customer ${i * 10 + j}`,
          location: locations[Math.floor(Math.random() * locations.length)],
          carDetails: {
            make: carMakes[Math.floor(Math.random() * carMakes.length)],
            model: `Model ${Math.floor(Math.random() * 5) + 1}`,
            type: carType,
            color: carColors[Math.floor(Math.random() * carColors.length)],
          },
          payment: randomPlan.price,
          status: status,
          microSlot: `${startHour.toString().padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`,
          planName: randomPlan.name,
          planDescription: randomPlan.description
        });
      }
    }
    
    return jobs;
  };

  // Handle date selection from the weekly calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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
      case "cancelled":
        return { color: "bg-red-100 text-red-800", icon: <XCircle className="w-3.5 h-3.5" /> };
      case "in-progress":
        return { color: "bg-blue-100 text-blue-800", icon: <Package className="w-3.5 h-3.5" /> };
      default:
        return { color: "bg-[#c5e82e]/20 text-black", icon: <Clock className="w-3.5 h-3.5" /> };
    }
  };

  // Add this function to handle month navigation
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' 
      ? subMonths(currentMonth, 1) 
      : addMonths(currentMonth, 1));
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
        {/* Stats overview cards - modernized design */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center mb-3">
            <PieChart className="w-5 h-5 mr-2 text-[#c5e82e]" />
            Job Summary
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-[#ebf5d3] to-[#f7fbef] border-none overflow-hidden shadow-sm relative">
              <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-xl bg-[#c5e82e]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#a5c824]" />
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-3xl font-bold mt-2 text-black">{statusCounts.upcoming}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {statusCounts.upcoming > 0 ? "Jobs scheduled" : "No upcoming jobs"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-[#e6f0ff] to-[#f5f9ff] border-none overflow-hidden shadow-sm relative">
              <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-xl bg-blue-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold mt-2 text-black">{statusCounts.inProgress}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {statusCounts.inProgress > 0 ? "Currently active" : "No active jobs"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-[#e6f9ef] to-[#f5fef9] border-none overflow-hidden shadow-sm relative">
              <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold mt-2 text-black">{statusCounts.completed}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {statusCounts.completed > 0 ? "Jobs finished" : "No completed jobs"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-[#fff0f0] to-[#fff7f7] border-none overflow-hidden shadow-sm relative">
              <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-3xl font-bold mt-2 text-black">{statusCounts.cancelled}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {statusCounts.cancelled > 0 ? "Jobs cancelled" : "No cancellations"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

{/* Calendar with horizontal scrolling view */}
<Card className="mb-6 bg-white border border-gray-100 shadow-sm">
  <CardContent className="p-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <CalendarDays className="w-5 h-5 mr-2 text-[#c5e82e]" />
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex ml-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleMonthChange('prev')}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleMonthChange('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={navigateToJobBooking}>
        View All Bookings <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
    
    {/* Horizontal scrolling calendar */}
    <div className="pb-1">
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
        {(() => {
          const monthStart = startOfMonth(currentMonth);
          const monthEnd = endOfMonth(currentMonth);
          const startDate = startOfWeek(monthStart);
          const endDate = endOfWeek(monthEnd);
          
          const dateRange = eachDayOfInterval({
            start: startDate,
            end: endDate
          });
          
          // Group dates by weeks for better organization
          const weeks: Date[][] = [];
          let currentWeek: Date[] = [];
          
          dateRange.forEach((date, index) => {
            if (index % 7 === 0 && currentWeek.length > 0) {
              weeks.push(currentWeek);
              currentWeek = [];
            }
            currentWeek.push(date);
          });
          
          if (currentWeek.length > 0) {
            weeks.push(currentWeek);
          }
          
          return dateRange.map((date, i) => {
            // Check if this date has jobs
            const jobsForDate = generateMockJobs().filter(job => 
              isSameDay(parseISO(job.date), date)
            );
            
            // Count jobs by status
            const upcomingCount = jobsForDate.filter(job => job.status === "upcoming").length;
            const inProgressCount = jobsForDate.filter(job => job.status === "in-progress").length;
            
            // Check if this date is in the current month
            const isCurrentMonth = getMonth(date) === getMonth(currentMonth) && 
                                    getYear(date) === getYear(currentMonth);
            
            // Format day name
            const dayName = format(date, 'EEE');
            
            return (
              <button
                key={i}
                onClick={() => handleDateSelect(date)}
                disabled={date < new Date() && !isToday(date)} // Disable past dates except today
                className={`
                  flex-shrink-0 w-14 py-3 px-1 rounded-xl flex flex-col items-center justify-center relative
                  ${isCurrentMonth ? '' : 'opacity-40'}
                  ${isSameDay(date, selectedDate) 
                    ? 'bg-black text-white shadow-md' 
                    : isToday(date)
                      ? 'bg-[#c5e82e]/10 text-black border border-[#c5e82e]'
                      : 'hover:bg-gray-50 border border-gray-100'}
                  ${date < new Date() && !isToday(date) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
              >
                <span className="text-xs font-medium mb-1">
                  {dayName}
                </span>
                <span className={`text-xl font-bold ${isToday(date) && !isSameDay(date, selectedDate) ? 'text-[#c5e82e]' : ''}`}>
                  {format(date, "d")}
                </span>
                
              </button>
            );
          });
        })()}
      </div>
    </div>
    
    {/* Month view indicator */}
    <div className="flex justify-center mt-2 mb-1">
      <div className="flex space-x-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-[#c5e82e]' : 'bg-gray-200'}`} 
          />
        ))}
      </div>
    </div>
    
    {/* Selected date preview */}
    {!isSameDay(selectedDate, new Date()) && upcomingJobs.length > 0 && (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#c5e82e]" />
          {format(selectedDate, "MMMM d")} Preview:
        </h3>
        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
          {upcomingJobs.slice(0, 3).map((job, index) => (
            <div key={index} className="flex-shrink-0 bg-gray-50 rounded-lg p-2 border border-gray-100 min-w-[130px] max-w-[150px]">
              <div className="flex items-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#c5e82e]"></span>
                <span className="text-xs text-gray-600 truncate">{job.startTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Car className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <p className="text-xs font-medium truncate">
                  {job.carDetails.make} {job.carDetails.model}
                </p>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3 text-[#c5e82e] flex-shrink-0" />
                <p className="text-xs truncate">
                  {job.planName}
                </p>
              </div>
            </div>
          ))}
          {upcomingJobs.length > 3 && (
            <div className="flex items-center justify-center px-3">
              <span className="text-xs text-gray-500">
                +{upcomingJobs.length - 3} more
              </span>
            </div>
          )}
        </div>
      </div>
    )}
  </CardContent>
</Card>

        {/* Today's jobs section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Clock className="w-5 h-5 mr-2 text-[#c5e82e]" />
              {isSameDay(selectedDate, new Date()) ? "Today's Jobs" : format(selectedDate, "MMM d")}
            </h2>
            <Badge className="bg-[#c5e82e] text-black font-medium">
              {isSameDay(selectedDate, new Date()) ? todayJobs.length : upcomingJobs.length} Jobs
            </Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-2 border-[#c5e82e] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {(isSameDay(selectedDate, new Date()) ? todayJobs : upcomingJobs).length === 0 ? (
                <Card className="bg-white border border-gray-100 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No jobs scheduled</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {isSameDay(selectedDate, new Date()) 
                        ? "You don't have any cleaning jobs scheduled for today."
                        : `You don't have any cleaning jobs scheduled for ${format(selectedDate, "MMMM d")}.`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                (isSameDay(selectedDate, new Date()) ? todayJobs : upcomingJobs).map(job => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="px-2 py-0.5 text-xs flex items-center gap-1.5 font-medium"
                            variant={job.status === "upcoming" ? "default" : "outline"}
                            style={{
                              backgroundColor: job.status === "upcoming" ? "#c5e82e20" : "",
                              color: job.status === "upcoming" ? "black" : "",
                              borderColor: job.status === "upcoming" ? "#c5e82e" : ""
                            }}
                          >
                            {job.status === "upcoming" && <Clock className="w-3 h-3" />}
                            {job.status === "completed" && <CheckCircle className="w-3 h-3 text-green-600" />}
                            {job.status === "cancelled" && <XCircle className="w-3 h-3 text-red-600" />}
                            {job.status === "in-progress" && <Package className="w-3 h-3 text-blue-600" />}
                            <span className="capitalize">{job.status.replace('-', ' ')}</span>
                          </Badge>
                          <Badge variant="outline" className="border-gray-200 text-gray-600 text-xs">
                            {job.startTime} - {job.endTime}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-black">
                            ₹{job.payment}
                          </div>
                        </div>
                      </div>

                      {/* Plan information */}
                      <div className="mb-3 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 text-[#c5e82e] mr-1.5" />
                        <span className="text-sm font-medium">{job.planName}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                          <div className="flex items-start">
                            <Car className="w-3.5 h-3.5 text-gray-600 mt-0.5 mr-1.5 flex-shrink-0" />
                            <p className="text-sm font-medium">
                              {job.carDetails.make} {job.carDetails.model}
                              <span className="block text-xs text-gray-500">
                                {job.carDetails.color} {job.carDetails.type}
                              </span>
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Micro Slot</p>
                          <div className="flex items-start">
                            <Clock className="w-3.5 h-3.5 text-gray-600 mt-0.5 mr-1.5 flex-shrink-0" />
                            <p className="text-sm font-medium">
                              {job.microSlot}
                              <span className="block text-xs text-gray-500">
                                Your arrival time
                              </span>
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Location</p>
                          <div className="flex items-start">
                            <MapPin className="w-3.5 h-3.5 text-gray-600 mt-0.5 mr-1.5 flex-shrink-0" />
                            <p className="text-sm font-medium truncate">
                              {job.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-[#c5e82e] hover:text-[#a5c824] hover:bg-[#c5e82e]/10"
                        >
                          View Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Performance summary - optional section */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold flex items-center mb-4">
              <PieChart className="w-5 h-5 mr-2 text-[#c5e82e]" />
              Performance Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">Weekly Earnings</div>
                <div className="text-2xl font-bold">₹{(3200).toLocaleString('en-IN')}</div>
                <div className="text-xs text-green-600 mt-1 flex items-center">
                  <span>+12% from last week</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">Completed Jobs</div>
                <div className="text-2xl font-bold">92%</div>
                <div className="text-xs text-green-600 mt-1 flex items-center">
                  <span>23 out of 25 jobs</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom navigation - optional */}
      <div className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around">
        <button className="flex flex-col items-center justify-center w-1/4 h-full">
          <Calendar className="w-5 h-5 text-[#c5e82e]" />
          <span className="text-xs mt-1 font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center w-1/4 h-full"
          onClick={navigateToJobBooking}>
          <Package className="w-5 h-5 text-gray-400" />
          <span className="text-xs mt-1">Jobs</span>
        </button>
        <button className="flex flex-col items-center justify-center w-1/4 h-full">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="text-xs mt-1">History</span>
        </button>
        <button className="flex flex-col items-center justify-center w-1/4 h-full">
          <User className="w-5 h-5 text-gray-400" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>

      {/* Add padding at the bottom to prevent content from being hidden behind the bottom nav */}
      <div className="h-16"></div>

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

export default WiperHome;