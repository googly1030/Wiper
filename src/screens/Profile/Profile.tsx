import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import { 
  UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Camera,
  CheckCircle2,
  AlertCircle,
  CalendarIcon,
  Pencil,
  UserCog,
  CarFront,
  Clock3Icon,
  LockIcon,
  ClipboardIcon,
  StarIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '../../components/CustomToast';
import { Label } from '../../components/CustomLabel';
import { Badge } from '../../components/ui/badge';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  address: string | null;
  occupation: string | null;
  bio: string | null;
  birth_date: string | null;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [formModified, setFormModified] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [scrolled, setScrolled] = useState<boolean>(false);
  
  // Hardcoded profile data
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user-123456',
    email: 'demo.user@example.com',
    full_name: 'Demo User',
    phone_number: '+1 (555) 123-4567',
    address: '123 Main Street, City, Country',
    occupation: 'Software Developer',
    bio: 'I am a passionate software developer with experience in React, TypeScript, and modern web development frameworks.',
    birth_date: '1990-01-15',
    profile_image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-03-15T00:00:00Z'
  });

  // Success/error states for notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    setFormModified(true);
  };

  const handleSaveProfile = async () => {
    try {
      setUpdating(true);
      
      // Mock update operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the updated_at timestamp to simulate a real update
      setProfile(prev => ({
        ...prev,
        updated_at: new Date().toISOString()
      }));
      
      setFormModified(false);
      setNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      });
      
      setTimeout(() => {
        setNotification({ type: null, message: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      setUploadingImage(true);
      
      // Mock image upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Pretend we uploaded and got back a URL - using a random Unsplash image
      const randomId = Math.floor(Math.random() * 1000);
      const mockImageUrl = `https://images.unsplash.com/photo-${randomId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80`;
      
      // Update local state
      setProfile(prev => ({ ...prev, profile_image_url: mockImageUrl }));
      
      setNotification({
        type: 'success',
        message: 'Profile image uploaded successfully!'
      });
      
      setTimeout(() => {
        setNotification({ type: null, message: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setNotification({
        type: 'error',
        message: 'Failed to upload image. Please try again.'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Hard-coded cars data
  const userCars = [
    {
      id: 'car-1',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      color: 'Silver',
      license_plate: 'ABC-1234',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 'car-2',
      make: 'Honda',
      model: 'Civic',
      year: 2019,
      color: 'Blue',
      license_plate: 'XYZ-5678',
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1000&auto=format&fit=crop'
    }
  ];

  // Navigation sections
  const sections = [
    { id: 'profile', name: 'Profile', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'security', name: 'Security', icon: <LockIcon className="w-5 h-5" /> },
    { id: 'vehicles', name: 'Vehicles', icon: <CarFront className="w-5 h-5" /> },
    { id: 'history', name: 'History', icon: <ClipboardIcon className="w-5 h-5" /> },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-transparent"
        }`}>
          <Header />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-t-[#c5e82e] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-t-transparent border-r-[#c5e82e] border-b-transparent border-l-transparent rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}>
        <Header />
      </div>
      
      {/* Hero Section - Improved for mobile */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <div className="h-[30vh] sm:h-[40vh] overflow-hidden relative">
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50 z-10"></div>
          
          {/* Background pattern */}
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <div className="w-full h-full bg-black bg-opacity-70 bg-[url('https://images.unsplash.com/photo-1595064085577-7c2ef98ec311?q=80&w=2000')] bg-cover bg-center bg-blend-overlay"></div>
          </motion.div>
          
          {/* Hero content - Improved layout for mobile */}
          <div className="absolute inset-0 z-20 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full flex flex-col items-center md:items-start text-center md:text-left"
            >
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 max-w-4xl mx-auto md:mx-0">
                <motion.div 
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-[#c5e82e] overflow-hidden shadow-xl">
                    {profile.profile_image_url ? (
                      <img 
                        src={profile.profile_image_url} 
                        alt={profile.full_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="w-10 h-10 sm:w-16 sm:h-16 text-gray-400" />
                      </div>
                    )}
                    <label htmlFor="profile-image-upload" className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      <input 
                        id="profile-image-upload" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProfileImageUpload} 
                        className="hidden" 
                        disabled={uploadingImage}
                      />
                    </label>
                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </motion.div>
                
                <div className="space-y-2 sm:space-y-4 mt-2 sm:mt-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                    {profile.full_name || 'Update your name'}
                  </h1>
                  
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 sm:gap-4 text-gray-300">
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-[#c5e82e]" />
                      <span className="text-xs sm:text-sm">{profile.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-[#c5e82e]" />
                      <span className="text-xs sm:text-sm">Member since {format(new Date(profile.created_at), 'MMM yyyy')}</span>
                    </div>
                    
                    {profile.phone_number && (
                      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-[#c5e82e]" />
                        <span className="text-xs sm:text-sm">{profile.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Curved separator - adjusted height for mobile */}
      <div className="relative -mt-10 sm:-mt-16 z-10">
        <svg className="fill-white w-full h-20 sm:h-32" preserveAspectRatio="none" viewBox="0 0 1440 96">
          <path d="M0,96L80,80C160,64,320,32,480,32C640,32,800,64,960,69.3C1120,75,1280,53,1360,42.7L1440,32L1440,96L1360,96C1280,96,1120,96,960,96C800,96,640,96,480,96C320,96,160,96,80,96L0,96Z"></path>
        </svg>
      </div>
      
      {/* Notification - adjusted for mobile */}
      <AnimatePresence>
        {notification.type && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 sm:top-24 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md px-2 sm:px-4"
          >
            <motion.div 
              className={`p-3 sm:p-4 rounded-xl flex items-center shadow-lg ${
                notification.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              {notification.type === 'success' 
                ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-green-500" /> 
                : <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-red-500" />
              }
              <span className="text-sm sm:text-base font-medium">{notification.message}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content - Mobile responsive adjustments */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-16 -mt-6">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left sidebar with tabs - Hidden on mobile */}
            <div className="hidden md:block md:w-80 border-r border-gray-100 shrink-0">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-[#c5e82e]" />
                  <span>Account Settings</span>
                </h2>
                
                {/* Progress info */}
                <div className="mb-6 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Profile completion</span>
                    <Badge className="bg-black text-white">80%</Badge>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#c5e82e]" style={{width: '80%'}}></div>
                  </div>
                </div>

                {/* Custom Tab Navigation */}
                <div className="space-y-2">
                  {sections.map((section) => (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                        activeTab === section.id 
                          ? 'bg-[#c5e82e]/10 text-black' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      whileHover={{ x: activeTab === section.id ? 0 : 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-2 rounded-lg ${
                        activeTab === section.id 
                          ? 'bg-[#c5e82e] text-black' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {section.icon}
                      </div>
                      <span className="font-medium">{section.name}</span>
                      
                      {activeTab === section.id && (
                        <motion.div 
                          className="ml-auto h-full w-1 bg-[#c5e82e] rounded-full"
                          layoutId="activeTab"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Save Button */}
              <div className="p-6 pt-0 mt-auto">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={!formModified || updating}
                  className="w-full bg-black text-white hover:bg-gray-800 px-6 py-6 rounded-xl border-b-2 border-[#c5e82e]"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
            
            {/* Right content area - Adjusted for mobile */}
            <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* Profile Section - Responsive layout */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 sm:space-y-8"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#c5e82e]" />
                        <span>Personal Information</span>
                      </h2>
                      <Badge variant="outline" className="bg-gray-50 gap-1 text-gray-500 text-xs sm:text-sm self-start sm:self-auto">
                        <Clock3Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Last updated: {profile.updated_at 
                          ? format(new Date(profile.updated_at), 'MMM d, yyyy')
                          : 'Never'
                        }</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                      <div>
                        <Label htmlFor="full_name" className="text-sm sm:text-base font-medium">Full Name</Label>
                        <div className="mt-1 sm:mt-2 relative">
                          <Input
                            id="full_name"
                            name="full_name"
                            value={profile.full_name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="pl-9 sm:pl-10 py-5 sm:py-6 rounded-xl text-sm sm:text-base"
                          />
                          <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email</Label>
                        <div className="mt-1 sm:mt-2 relative">
                          <Input
                            id="email"
                            name="email"
                            value={profile.email}
                            disabled
                            className="pl-9 sm:pl-10 py-5 sm:py-6 rounded-xl bg-gray-50 text-sm sm:text-base"
                          />
                          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="phone_number" className="text-sm sm:text-base font-medium">Phone Number</Label>
                        <div className="mt-1 sm:mt-2 relative">
                          <Input
                            id="phone_number"
                            name="phone_number"
                            value={profile.phone_number || ''}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                            className="pl-9 sm:pl-10 py-5 sm:py-6 rounded-xl text-sm sm:text-base"
                          />
                          <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="address" className="text-sm sm:text-base font-medium">Address</Label>
                        <div className="mt-1 sm:mt-2 relative">
                          <Input
                            id="address"
                            name="address"
                            value={profile.address || ''}
                            onChange={handleInputChange}
                            placeholder="Enter your address"
                            className="pl-9 sm:pl-10 py-5 sm:py-6 rounded-xl text-sm sm:text-base"
                          />
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                      </div>
                    </div>
                  
                    
                    <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2 mb-4">
                        <div className="p-1.5 sm:p-2 bg-black rounded-lg">
                          <Clock3Icon className="w-3 h-3 sm:w-4 sm:h-4 text-[#c5e82e]" />
                        </div>
                        Account Timeline
                      </h3>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#c5e82e]"></div>
                            <span className="text-xs sm:text-sm text-gray-600">Member since</span>
                          </div>
                          <span className="text-xs sm:text-sm font-medium">{format(new Date(profile.created_at), 'MMMM d, yyyy')}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-400"></div>
                            <span className="text-xs sm:text-sm text-gray-600">Last update</span>
                          </div>
                          <span className="text-xs sm:text-sm font-medium">
                            {profile.updated_at 
                              ? format(new Date(profile.updated_at), 'MMMM d, yyyy')
                              : 'Never updated'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Security Section - Made responsive */}
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 sm:space-y-8"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#c5e82e]" />
                      <span>Security & Privacy</span>
                    </h2>
                    
                    <div className="bg-white rounded-2xl p-4 sm:p-8 border border-gray-100 shadow-md">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="p-2 sm:p-3 bg-black rounded-xl">
                          <LockIcon className="w-4 h-4 sm:w-6 sm:h-6 text-[#c5e82e]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg sm:text-xl">Password Management</h3>
                          <p className="text-gray-500 text-xs sm:text-sm">Keep your account secure with a strong password</p>
                        </div>
                      </div>
                      
                      <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-800 flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm sm:text-base font-medium">Password last changed 3 months ago</p>
                          <p className="text-xs sm:text-sm mt-1">We recommend changing your password every 3 months for security.</p>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => toast('Password reset email sent!')}
                        className="bg-black hover:bg-gray-800 text-white text-sm sm:text-base px-4 sm:px-6 py-4 sm:py-6 rounded-xl border-b-2 border-[#c5e82e]"
                      >
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Reset Password
                      </Button>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-4 sm:p-8 border border-gray-100 shadow-md">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="p-2 sm:p-3 bg-red-100 rounded-xl">
                          <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg sm:text-xl text-red-600">Danger Zone</h3>
                          <p className="text-gray-500 text-xs sm:text-sm">Irreversible account actions</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm sm:text-base mb-6 sm:mb-8">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      
                      <Button 
                        variant="destructive" 
                        className="text-sm sm:text-base px-4 sm:px-6 py-4 sm:py-6 rounded-xl"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                            toast('Account deletion is not implemented in this demo.');
                          }
                        }}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                {/* Vehicles Section - Responsive adjustments */}
                {activeTab === 'vehicles' && (
                  <motion.div
                    key="vehicles"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 sm:space-y-8"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
                      <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <CarFront className="w-5 h-5 sm:w-6 sm:h-6 text-[#c5e82e]" />
                        <span>Your Vehicles</span>
                      </h2>
                      <Button 
                        onClick={() => navigate('/add-car')}
                        className="bg-black text-white hover:bg-gray-800 rounded-full text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5 border-b-2 border-[#c5e82e]"
                      >
                        Add New Vehicle
                      </Button>
                    </div>
                    
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {userCars.map((car, index) => (
                        <motion.div
                          key={car.id}
                          variants={item}
                          whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                          <Card className="overflow-hidden border-0 rounded-2xl sm:rounded-3xl shadow-lg h-full group">
                            <div className="h-36 sm:h-48 relative">
                              <img 
                                src={car.image}
                                alt={`${car.make} ${car.model}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"></div>
                              <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                                <Badge className="bg-[#c5e82e] text-black text-xs px-2 sm:px-3 py-0.5 sm:py-1 flex items-center gap-1">
                                  <StarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  Primary
                                </Badge>
                              </div>
                              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                                <Badge className="bg-black/50 text-xs backdrop-blur-sm text-white mb-1">
                                  {car.year}
                                </Badge>
                                <h3 className="text-base sm:text-xl font-bold text-white">
                                  {car.make} {car.model}
                                </h3>
                              </div>
                            </div>
                            <CardContent className="p-4 sm:p-6">
                              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                  <p className="text-xs sm:text-sm text-gray-500">Color</p>
                                  <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-${car.color.toLowerCase()}-500`}></div>
                                    <p className="text-sm sm:text-base font-medium">{car.color}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm text-gray-500">License Plate</p>
                                  <p className="text-sm sm:text-base font-medium mt-0.5 sm:mt-1">{car.license_plate}</p>
                                </div>
                              </div>
                              <div className="mt-4 sm:mt-6 flex justify-between">
                                <Button variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                                  <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button className="bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e] text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                                  View History
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
                
                {/* History Section - Made responsive */}
                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 sm:space-y-8"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                      <ClipboardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#c5e82e]" />
                      <span>Service History</span>
                    </h2>
                    
                    <Card className="overflow-hidden border-0 rounded-2xl sm:rounded-3xl shadow-lg h-48 sm:h-64">
                      <CardContent className="p-6 sm:p-8 flex items-center justify-center h-full">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <ClipboardIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                          </div>
                          <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No service history yet</p>
                          <p className="text-xs sm:text-sm text-gray-500 text-center max-w-xs sm:max-w-sm">
                            Your service history will appear here once you book your first car wash service
                          </p>
                          <Button 
                            className="mt-4 sm:mt-6 bg-black hover:bg-gray-800 text-white text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border-b-2 border-[#c5e82e]"
                            onClick={() => navigate('/services')}
                          >
                            Book a service
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Mobile save button - Fixed to bottom */}
          <div className="md:hidden sticky bottom-0 p-4 bg-white border-t border-gray-100 shadow-lg">
            <Button 
              onClick={handleSaveProfile} 
              disabled={!formModified || updating}
              className="w-full bg-black text-white hover:bg-gray-800 px-4 py-4 rounded-xl border-b-2 border-[#c5e82e] text-sm"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};