import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import { 
  UserIcon, 
  ShieldIcon,
  CarFront, 
  ClipboardListIcon,
  LogOutIcon,
  ChevronRightIcon,
  PhoneIcon,
  MailIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';


interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  profile_image_url: string | null;
  created_at: string;
}

export const UserSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile>({
    id: 'user-123456',
    email: 'demo.user@example.com',
    full_name: 'Demo User',
    phone_number: '+1 (555) 123-4567',
    profile_image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    created_at: '2023-01-01T00:00:00Z',
  });
  const Avatar = ({ className, children }: { className?: string, children: React.ReactNode }) => (
    <div className={`relative rounded-full overflow-hidden ${className || ''}`}>{children}</div>
  );
  
  const AvatarImage = ({ src, alt, className }: { src: string, alt: string, className?: string }) => (
    <img src={src} alt={alt} className={`w-full h-full object-cover ${className || ''}`} />
  );
  
  const AvatarFallback = ({ className, children }: { className?: string, children: React.ReactNode }) => (
    <div className={`flex items-center justify-center w-full h-full ${className || ''}`}>{children}</div>
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const getUserInitials = () => {
    if (!user.full_name) return "U";
    const nameParts = user.full_name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.full_name[0].toUpperCase();
  };

  const handleNavigateToSection = (section: string) => {
    navigate(`/profile?section=${section}`);
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    
      // Clear everything from localStorage
      localStorage.clear();
      
      // Navigate to login page
      navigate('/');
      
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Page transition animation
  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 }
  };

  // List item animation
  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  const settingsSections = [
    {
      title: "Account Settings",
      items: [
        { id: "profile", name: "Edit Profile", icon: <UserIcon className="w-5 h-5" /> },
        { id: "security", name: "Security & Privacy", icon: <ShieldIcon className="w-5 h-5" /> },
        { id: "vehicles", name: "Your Vehicles", icon: <CarFront className="w-5 h-5" /> },
      ]
    },
    {
      title: "My Activity",
      items: [
        { id: "history", name: "Service History", icon: <ClipboardListIcon className="w-5 h-5" /> }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#c5e82e] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 pb-20"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <Header />
      
      {/* User Profile Summary Card */}
      <div className="px-4 py-8 bg-gradient-to-r from-gray-900 to-black shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-2 border-[#c5e82e] shadow-lg">
              {user.profile_image_url ? (
                <AvatarImage src={user.profile_image_url} alt={user.full_name} />
              ) : (
                <AvatarFallback className="bg-black text-white text-xl">
                  {getUserInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{user.full_name}</h2>
              <div className="text-sm text-gray-300 flex flex-col gap-1.5 mt-2">
                <div className="flex items-center gap-2">
                  <MailIcon className="w-3.5 h-3.5 text-[#c5e82e]" />
                  <span>{user.email}</span>
                </div>
                {user.phone_number && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-3.5 h-3.5 text-[#c5e82e]" />
                    <span>{user.phone_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Curved separator - similar to other pages */}
      <div className="relative -mt-4 z-10">
        <svg className="fill-white w-full h-16" preserveAspectRatio="none" viewBox="0 0 1440 96">
          <path d="M0,96L80,80C160,64,320,32,480,32C640,32,800,64,960,69.3C1120,75,1280,53,1360,42.7L1440,32L1440,96L1360,96C1280,96,1120,96,960,96C800,96,640,96,480,96C320,96,160,96,80,96L0,96Z"></path>
        </svg>
      </div>
      
      {/* Settings List */}
      <div className="px-4 py-4 max-w-md mx-auto -mt-8 relative z-20">
        <AnimatePresence>
          {settingsSections.map((section, sectionIndex) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="mb-6"
            >
              <h3 className="text-sm font-medium text-gray-600 mb-3 px-1 flex items-center">
                <div className="w-1.5 h-4 bg-[#c5e82e] rounded-full mr-2"></div>
                {section.title}
              </h3>
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {section.items.map((item, i) => (
                  <motion.div 
                    key={item.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={listItemVariants}
                  >
                    {i > 0 && <Separator />}
                    <div 
                      className="flex items-center justify-between py-4 px-5 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleNavigateToSection(item.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-[#c5e82e]/10 flex items-center justify-center text-black">
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Button 
            className="w-full py-5 bg-black text-white hover:bg-gray-800 px-4 rounded-xl font-medium text-base flex items-center justify-center gap-2 border-b-2 border-[#c5e82e]"
            onClick={handleLogout}
          >
            <LogOutIcon className="w-5 h-5" />
            Log Out
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};