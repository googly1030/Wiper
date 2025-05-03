import { useState, useEffect } from "react";
import { format, parseISO, subDays } from "date-fns";
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
  FileText,
  User,
  Search,
  ChevronRight,
  Star,
  Sparkles,
  Filter,
  CalendarRange,
  ArrowDownUp,
  X
} from "lucide-react";
import { toast } from "../../components/CustomToast";
import WiperNavigation from "../../components/WiperNavigation";

// Interface for history item
interface HistoryItem {
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
  rating?: number;
  feedback?: string;
  planName: string;
  planDescription: string;
  completionTime: string;
  customerTip?: number;
  status: 'completed' | 'canceled'; // Add this status field
  cancelReason?: string; // Optional field for cancel reason
}

// Filter state interface
interface FilterState {
  dateRange: 'all' | 'week' | 'month' | 'year';
  sortBy: 'recent' | 'rating' | 'payment';
  vehicleType: 'all' | 'sedan' | 'suv' | 'hatchback' | 'premium';
  status: 'all' | 'completed' | 'canceled';
}

export const WiperHistory = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    sortBy: 'recent',
    vehicleType: 'all',
    status: 'all'
  });
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedJobs: 0,
    averageRating: 0,
    totalTips: 0
  });

  // Fetch history data
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate mock data
        const mockHistory = generateMockHistory();
        setHistoryItems(mockHistory);
        setFilteredItems(mockHistory);
        
        // Calculate stats
        const totalEarnings = mockHistory.reduce((sum, item) => sum + item.payment + (item.customerTip || 0), 0);
        const completedJobs = mockHistory.length;
        const ratingsSum = mockHistory.reduce((sum, item) => sum + (item.rating || 0), 0);
        const avgRating = mockHistory.filter(item => item.rating).length > 0 
          ? ratingsSum / mockHistory.filter(item => item.rating).length 
          : 0;
        const totalTips = mockHistory.reduce((sum, item) => sum + (item.customerTip || 0), 0);
        
        setStats({
          totalEarnings,
          completedJobs,
          averageRating: avgRating,
          totalTips
        });
      } catch (error) {
        console.error("Error fetching history:", error);
        toast("Failed to load history data");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, historyItems]);

  // Generate mock history data
  const generateMockHistory = (): HistoryItem[] => {
    const items: HistoryItem[] = [];
    const today = new Date();
    
    // Plans for service types
    const plans = [
      { name: "Basic Wash", description: "Exterior wash and vacuum", price: 299 },
      { name: "Standard Clean", description: "Interior & exterior cleaning", price: 499 },
      { name: "Premium Detail", description: "Full detailing service", price: 799 },
      { name: "Quick Shine", description: "Express exterior wash", price: 199 },
      { name: "Luxury Clean", description: "Premium interior & exterior", price: 999 }
    ];
    
    // Vehicle types
    const carTypes = ["Sedan", "SUV", "Hatchback", "Premium"];
    const carColors = ["Black", "White", "Red", "Silver", "Blue"];
    const carMakes = ["Toyota", "Honda", "Ford", "Hyundai", "BMW", "Mercedes"];
    
    // Cancel reasons
    const cancelReasons = [
      "Customer requested cancellation",
      "Weather conditions",
      "Vehicle not accessible",
      "Customer unavailable",
      "Service area out of range"
    ];
    
    // Generate 30 random history items
    for (let i = 0; i < 30; i++) {
      const daysAgo = Math.floor(Math.random() * 180); // Up to 6 months in the past
      const date = subDays(today, daysAgo);
      
      // Random start hour between 8AM and 6PM
      const startHour = 8 + Math.floor(Math.random() * 10);
      const endHour = startHour + 1 + Math.floor(Math.random() * 2); // 1-2 hour job
      
      // Random plan
      const plan = plans[Math.floor(Math.random() * plans.length)];
      
      // Random car details
      const carType = carTypes[Math.floor(Math.random() * carTypes.length)];
      const carColor = carColors[Math.floor(Math.random() * carColors.length)];
      const carMake = carMakes[Math.floor(Math.random() * carMakes.length)];
      
      // Determine if job was completed or canceled (80% completed, 20% canceled)
      const status = Math.random() > 0.2 ? 'completed' : 'canceled';
      let rating, feedback, tip, cancelReason;
      
      if (status === 'completed') {
        // Only completed jobs can have ratings
        const hasRating = Math.random() > 0.2; // 80% chance of having a rating
        rating = hasRating ? Math.floor(Math.random() * 2) + 4 : undefined; // 4-5 stars
        
        // Random feedback (some might not have feedback)
        const hasFeedback = hasRating && Math.random() > 0.4; // 60% chance of having feedback if rated
        const feedbacks = [
          "Great job cleaning my car! It looks like new.",
          "Very professional and thorough service.",
          "Punctual and efficient. Would use again.",
          "Excellent service, my car has never been this clean!",
          "Very happy with the cleaning, thank you!"
        ];
        feedback = hasFeedback ? feedbacks[Math.floor(Math.random() * feedbacks.length)] : undefined;
        
        // Random tip (some might have received tips)
        const hasTip = Math.random() > 0.7; // 30% chance of receiving a tip
        tip = hasTip ? Math.floor(Math.random() * 200) + 50 : undefined; // ₹50-₹250 tip
      } else {
        // Canceled jobs have cancel reasons
        cancelReason = cancelReasons[Math.floor(Math.random() * cancelReasons.length)];
      }
      
      items.push({
        id: `history-${i}`,
        date: format(date, 'yyyy-MM-dd'),
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:00`,
        customerName: `Customer ${i + 100}`,
        location: `Block ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}, Chennai`,
        carDetails: {
          make: carMake,
          model: `Model ${Math.floor(Math.random() * 5) + 1}`,
          type: carType,
          color: carColor,
        },
        payment: status === 'completed' ? plan.price : 0,
        rating,
        feedback,
        planName: plan.name,
        planDescription: plan.description,
        completionTime: `${Math.floor(Math.random() * 20) + 40} mins`, // 40-60 mins
        customerTip: tip,
        status,
        cancelReason
      });
    }
    
    // Sort by date (newest first)
    return items.sort((a, b) => 
      parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );
  };

  // Apply filters to history items
  const applyFilters = () => {
    let filtered = [...historyItems];
    
    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const today = new Date();
      let cutoffDate = today;
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate = subDays(today, 7);
          break;
        case 'month':
          cutoffDate = subDays(today, 30);
          break;
        case 'year':
          cutoffDate = subDays(today, 365);
          break;
      }
      
      filtered = filtered.filter(item => 
        parseISO(item.date) >= cutoffDate
      );
    }
    
    // Apply vehicle type filter
    if (filters.vehicleType !== 'all') {
      filtered = filtered.filter(item => 
        item.carDetails.type.toLowerCase() === filters.vehicleType
      );
    }
    
    // Apply search query if present
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.carDetails.make.toLowerCase().includes(query) ||
        item.carDetails.model.toLowerCase().includes(query) ||
        item.planName.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }
    
    // Apply sort
    switch (filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'payment':
        filtered.sort((a, b) => 
          (b.payment + (b.customerTip || 0)) - (a.payment + (a.customerTip || 0))
        );
        break;
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => 
        item.status === filters.status
      );
    }
    
    setFilteredItems(filtered);
  };

  // Handle showing detail view for an item
  const handleViewDetail = (item: HistoryItem) => {
    setSelectedItem(item);
  };

  // Handle closing the detail view
  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  // Update a single filter
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
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
            <h1 className="text-xl font-bold">Service History</h1>
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


        {/* Search bar with integrated filter button */}
        <div className="relative mb-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by car make, model, or location..."
              className="w-full py-3 pl-10 pr-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c5e82e] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            className={`border-gray-200 h-[46px] min-w-[90px] ${showFilters ? "bg-[#c5e82e]/10 border-[#c5e82e] text-black" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1.5" />
            {showFilters ? "Hide Filters" : "Filter"}
          </Button>
        </div>

        {/* Filters */}
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Date Range</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'All Time', icon: <Calendar className="w-3.5 h-3.5" /> },
                        { id: 'week', label: 'This Week', icon: <CalendarRange className="w-3.5 h-3.5" /> },
                        { id: 'month', label: 'This Month', icon: <CalendarRange className="w-3.5 h-3.5" /> },
                        { id: 'year', label: 'This Year', icon: <CalendarRange className="w-3.5 h-3.5" /> }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => updateFilter('dateRange', option.id)}
                          className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 ${
                            filters.dateRange === option.id
                              ? "bg-[#c5e82e] text-black font-medium"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {option.icon}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Sort By</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'recent', label: 'Most Recent', icon: <Clock className="w-3.5 h-3.5" /> },
                        { id: 'rating', label: 'Highest Rated', icon: <Star className="w-3.5 h-3.5" /> },
                        { id: 'payment', label: 'Highest Paid', icon: <ArrowDownUp className="w-3.5 h-3.5" /> }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => updateFilter('sortBy', option.id)}
                          className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 ${
                            filters.sortBy === option.id
                              ? "bg-[#c5e82e] text-black font-medium"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {option.icon}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Vehicle Type</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'All Types', icon: <Car className="w-3.5 h-3.5" /> },
                        { id: 'sedan', label: 'Sedan', icon: <Car className="w-3.5 h-3.5" /> },
                        { id: 'suv', label: 'SUV', icon: <Car className="w-3.5 h-3.5" /> },
                        { id: 'hatchback', label: 'Hatchback', icon: <Car className="w-3.5 h-3.5" /> },
                        { id: 'premium', label: 'Premium', icon: <Car className="w-3.5 h-3.5" /> }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => updateFilter('vehicleType', option.id)}
                          className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 ${
                            filters.vehicleType === option.id
                              ? "bg-[#c5e82e] text-black font-medium"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {option.icon}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'All Status', icon: <FileText className="w-3.5 h-3.5" /> },
                        { id: 'completed', label: 'Completed', icon: <CheckCircle className="w-3.5 h-3.5" /> },
                        { id: 'canceled', label: 'Canceled', icon: <X className="w-3.5 h-3.5" /> }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => updateFilter('status', option.id)}
                          className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 ${
                            filters.status === option.id
                              ? "bg-[#c5e82e] text-black font-medium"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {option.icon}
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

        {/* History items list */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-[#c5e82e]" />
            Completed Services
          </h2>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-2 border-[#c5e82e] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600">Loading history...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No history found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchQuery ? 
                  "No results match your search criteria. Try different keywords or clear filters." :
                  "You don't have any completed services in your history yet."
                }
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-4"
            >
              {filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewDetail(item)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {item.status === 'completed' ? (
                            <Badge className="bg-green-100 text-green-800 px-2 py-0.5 text-xs flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 px-2 py-0.5 text-xs flex items-center gap-1">
                              <X className="w-3 h-3" />
                              Canceled
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-gray-200 text-gray-600 text-xs">
                            {format(parseISO(item.date), "MMM d, yyyy")}
                          </Badge>
                        </div>
                        <h3 className="font-medium mt-2 mb-1">
                          {item.carDetails.make} {item.carDetails.model}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#c5e82e] flex-shrink-0" />
                          <span className="truncate">{item.planName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${item.status === 'canceled' ? 'text-red-600' : 'text-black'}`}>
                          {item.status === 'canceled' ? (
                            'Canceled'
                          ) : (
                            <>
                              ₹{item.payment}
                              {item.customerTip && (
                                <span className="text-xs text-green-600 ml-1">+₹{item.customerTip} tip</span>
                              )}
                            </>
                          )}
                        </div>
                        {/* Rest of the code */}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Time</p>
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 text-gray-600 mr-1.5" />
                          <p className="text-sm">{item.startTime} - {item.endTime}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                        <div className="flex items-center">
                          <Car className="w-3.5 h-3.5 text-gray-600 mr-1.5" />
                          <p className="text-sm">{item.carDetails.color} {item.carDetails.type}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 text-gray-600 mr-1.5" />
                          <p className="text-sm">{item.completionTime}</p>
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
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* History detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4"
            onClick={handleCloseDetail}
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
                  onClick={handleCloseDetail}
                  className="absolute top-4 right-4 text-white/80 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <h2 className="text-xl font-bold mb-1">Service Details</h2>
                <div className="flex items-center gap-3 text-gray-300 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(parseISO(selectedItem.date), "EEEE, MMMM d, yyyy")}
                  </div>
                </div>
                
                <div className={`absolute -bottom-5 right-6 ${
                  selectedItem.status === 'canceled' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-[#c5e82e] text-black'
                  } font-bold px-4 py-2 rounded-lg shadow-lg`}
                >
                  {selectedItem.status === 'canceled' ? (
                    'Canceled'
                  ) : (
                    <>
                      ₹{selectedItem.payment}
                      {selectedItem.customerTip && (
                        <span className="text-xs ml-1">+₹{selectedItem.customerTip}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="p-6 pt-8">
                <h3 className="font-medium mb-3">Service Information</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Vehicle</div>
                    <div className="font-medium">
                      {selectedItem.carDetails.make} {selectedItem.carDetails.model}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedItem.carDetails.color} {selectedItem.carDetails.type}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Service Type</div>
                    <div className="font-medium">{selectedItem.planName}</div>
                    <div className="text-sm text-gray-600">{selectedItem.planDescription}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Time</div>
                    <div className="font-medium">{selectedItem.startTime} - {selectedItem.endTime}</div>
                    <div className="text-sm text-gray-600">Duration: {selectedItem.completionTime}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Location</div>
                    <div className="font-medium truncate">{selectedItem.location}</div>
                  </div>
                </div>
                
                {selectedItem.rating && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Customer Feedback</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < selectedItem.rating! ? "text-yellow-500" : "text-gray-300"}`}
                            fill={i < selectedItem.rating! ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      
                      {selectedItem.feedback && (
                        <div className="text-gray-700 italic">
                          "{selectedItem.feedback}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedItem.status === 'canceled' && selectedItem.cancelReason && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Cancellation Details</h3>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <div className="flex items-start">
                        <X className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                        <div>
                          <div className="font-medium text-red-800 mb-1">Service Canceled</div>
                          <div className="text-gray-700">
                            Reason: {selectedItem.cancelReason}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-medium mb-3">Payment Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium">₹{selectedItem.payment}</span>
                    </div>
                    
                    {selectedItem.customerTip && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Customer Tip</span>
                        <span className="font-medium text-green-600">₹{selectedItem.customerTip}</span>
                      </div>
                    )}
                    
                    <Separator className="my-3" />
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Total Earned</span>
                      <span className="font-bold">
                        ₹{selectedItem.payment + (selectedItem.customerTip || 0)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleCloseDetail}
                  className="w-full py-5 rounded-xl bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e]"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <WiperNavigation />

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

export default WiperHistory;