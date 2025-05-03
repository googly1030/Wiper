import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import {
  User,
  MapPin,
  Phone,
  Mail,
  BanknoteIcon,
  LogOut,
  HelpCircle,
  Settings,
  ChevronRight,
  Bell,
  Shield,
  Star,
  Camera,
  Edit,
  IndianRupee
} from "lucide-react";
import { toast } from "../../components/CustomToast";
import { motion, AnimatePresence } from "framer-motion";
import WiperNavigation from "../../components/WiperNavigation";

interface ProfileData {
  user?: {
    fullName?: string;
    phone?: string;
    email?: string;
    profileImage?: string;
    idType?: string;
    idNumber?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      address?: string;
    };
    paymentDetails?: {
      preference?: string;
      bankName?: string;
      accountNumber?: string;
      ifscCode?: string;
      upiId?: string;
    };
    onboarded?: boolean;
    joinedDate?: string;
  };
}

export const WiperProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    // Load profile data from localStorage
    const loadProfileData = () => {
      try {
        setLoading(true);
        const wiperSession = JSON.parse(localStorage.getItem('wiperSession') || '{}');
        
        // If no session data or user not onboarded, redirect to profile setup
        if (!wiperSession?.user?.onboarded) {
          navigate('/wiper-profile-setup');
          return;
        }
        
        // Set joined date if not present
        if (!wiperSession.user.joinedDate) {
          wiperSession.user.joinedDate = new Date().toISOString();
          localStorage.setItem('wiperSession', JSON.stringify(wiperSession));
        }
        
        setProfileData(wiperSession);
        setLoading(false);
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast("Failed to load profile data");
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, [navigate]);

  // Handle profile image update
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      setUploadingImage(true);
      
      // For demo purposes, we'll just use a local URL
      // In a real app, you would upload to a server/storage
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const imageUrl = URL.createObjectURL(file);
      
      // Update profile image in localStorage
      const wiperSession = JSON.parse(localStorage.getItem('wiperSession') || '{}');
      wiperSession.user.profileImage = imageUrl;
      localStorage.setItem('wiperSession', JSON.stringify(wiperSession));
      
      // Update state
      setProfileData(wiperSession);
      toast("Profile image updated successfully");
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast("Failed to update profile image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    try {
      // Clear localStorage (or just the session part)
      localStorage.removeItem('wiperSession');
      
      // Show success message
      toast("Logged out successfully");
      
      // Redirect to login/home page
      navigate('/');
    } catch (error) {
      console.error("Error during logout:", error);
      toast("Failed to log out");
    }
  };

  // Stats for wiper performance
  const wiperStats = {
    rating: 4.8,
    jobsCompleted: 78,
    totalEarnings: 23450,
    averageTime: "45 min"
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Format bank account number to show only last 4 digits
  const formatAccountNumber = (accountNumber?: string) => {
    if (!accountNumber) return "Not provided";
    return `XXXX XXXX ${accountNumber.slice(-4)}`;
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
            <h1 className="text-xl font-bold">My Profile</h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-[#c5e82e] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Profile Header */}
            <motion.div 
              variants={itemVariants}
              className="relative bg-gradient-to-r from-gray-900 to-black rounded-xl overflow-hidden p-6 text-white"
            >
              {/* Profile Image with edit button */}
              <div className="flex flex-col items-center sm:items-start sm:flex-row pb-6">
                <div className="relative group mb-4 sm:mb-0 sm:mr-4">
                  <div 
                    className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#c5e82e] bg-white flex items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profileData.user?.profileImage ? (
                      <img 
                        src={profileData.user.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover cursor-pointer" 
                      />
                    ) : (
                      <div className="w-full h-full bg-[#c5e82e]/20 flex items-center justify-center cursor-pointer">
                        <span className="text-3xl font-bold text-[#c5e82e]">
                          {profileData.user?.fullName 
                            ? profileData.user.fullName.charAt(0).toUpperCase() 
                            : "W"}
                        </span>
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Loading spinner when uploading */}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-full">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    disabled={uploadingImage}
                  />
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{profileData.user?.fullName || "Wiper User"}</h2>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center mt-1 gap-2 sm:gap-4">
                    <div className="flex items-center justify-center sm:justify-start">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-300" />
                      <span className="text-sm text-gray-300">{profileData.user?.phone || "Not provided"}</span>
                    </div>
                    
                    {profileData.user?.email && (
                      <div className="flex items-center justify-center sm:justify-start">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-300" />
                        <span className="text-sm text-gray-300">{profileData.user.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Location Information */}
              {profileData.user?.location?.address && (
                <div className="flex items-start border-t border-gray-700 pt-3 mt-3">
                  <MapPin className="w-4 h-4 mr-2 text-gray-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm text-gray-300">Service Location</span>
                    <p className="text-white">{profileData.user.location.address}</p>
                  </div>
                </div>
              )}
              
              {/* Wiper Since Badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-[#c5e82e] text-black text-xs flex items-center gap-1 py-1">
                  <User className="w-3 h-3" />
                  Wiper since {profileData.user?.joinedDate ? new Date(profileData.user.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "2023"}
                </Badge>
              </div>
            </motion.div>

            {/* Performance Stats */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Star className="w-5 h-5 mr-2 text-[#c5e82e]" />
                Performance Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500 mb-1">Rating</p>
                    <div className="flex items-end">
                      <p className="text-2xl font-bold">{wiperStats.rating}</p>
                      <div className="ml-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-500 inline-block" fill="currentColor" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500 mb-1">Jobs Completed</p>
                    <p className="text-2xl font-bold">{wiperStats.jobsCompleted}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold">₹{wiperStats.totalEarnings.toLocaleString()}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500 mb-1">Avg. Time/Job</p>
                    <p className="text-2xl font-bold">{wiperStats.averageTime}</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Payment Information */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BanknoteIcon className="w-5 h-5 mr-2 text-[#c5e82e]" />
                Payment Details
              </h3>
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4">
                  {profileData.user?.paymentDetails?.preference === 'bank' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#c5e82e]/10 flex items-center justify-center mr-3">
                            <BanknoteIcon className="w-5 h-5 text-[#c5e82e]" />
                          </div>
                          <div>
                            <h4 className="font-medium">Bank Account</h4>
                            <p className="text-sm text-gray-500">
                              {profileData.user?.paymentDetails?.bankName || "Bank Name"}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-gray-200">Primary</Badge>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Account Number</p>
                          <p className="font-medium">
                            {formatAccountNumber(profileData.user?.paymentDetails?.accountNumber)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">IFSC Code</p>
                          <p className="font-medium">
                            {profileData.user?.paymentDetails?.ifscCode || "Not provided"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs text-[#c5e82e] hover:text-[#a5c824] hover:bg-[#c5e82e]/10"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit Details
                        </Button>
                      </div>
                    </div>
                  ) : profileData.user?.paymentDetails?.preference === 'upi' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#c5e82e]/10 flex items-center justify-center mr-3">
                            <IndianRupee className="w-5 h-5 text-[#c5e82e]" />
                          </div>
                          <div>
                            <h4 className="font-medium">UPI</h4>
                            <p className="text-sm text-gray-500">
                              Unified Payments Interface
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-gray-200">Primary</Badge>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">UPI ID</p>
                        <p className="font-medium">
                          {profileData.user?.paymentDetails?.upiId || "Not provided"}
                        </p>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs text-[#c5e82e] hover:text-[#a5c824] hover:bg-[#c5e82e]/10"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit Details
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-gray-500">No payment details found</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                      >
                        Add Payment Details
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ID Verification */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-[#c5e82e]" />
                Identity Verification
              </h3>
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {profileData.user?.idType === 'aadhar' ? 'Aadhar Card' : 
                             profileData.user?.idType === 'pan' ? 'PAN Card' : 'Driving License'}
                          </h4>
                          <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {profileData.user?.idType === 'aadhar' ? 'Aadhar Number: ' : 
                           profileData.user?.idType === 'pan' ? 'PAN Number: ' : 'License Number: '}
                          {profileData.user?.idNumber ? 
                            `${profileData.user.idNumber.slice(0, 4)}...${profileData.user.idNumber.slice(-4)}` : 
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Preferences */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-[#c5e82e]" />
                Notification Preferences
              </h3>
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-500">Receive alerts for new job opportunities</p>
                      </div>
                    </div>
                    <Switch 
                      checked={pushNotifications} 
                      onCheckedChange={setPushNotifications} 
                      className="data-[state=checked]:bg-[#c5e82e]" 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Email Updates</p>
                        <p className="text-sm text-gray-500">Receive weekly summary and payment updates</p>
                      </div>
                    </div>
                    <Switch 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications} 
                      className="data-[state=checked]:bg-[#c5e82e]" 
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Support & Help */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    <button 
                      className="flex items-center justify-between w-full p-4 hover:bg-gray-50 text-left"
                      onClick={() => navigate('/help-center')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <HelpCircle className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium">Help Center</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <button 
                      className="flex items-center justify-between w-full p-4 hover:bg-gray-50 text-left"
                      onClick={() => setShowLogoutModal(true)}
                    >
                      <div className="flex items-center gap-3 text-red-600">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <LogOut className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-medium">Logout</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <WiperNavigation />

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-center mb-2">Sign Out</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to sign out from your wiper account?
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 py-5"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-5"
                  onClick={handleLogout}
                >
                  Sign Out
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

export default WiperProfile;