import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, LogOutIcon, HomeIcon, UserIcon } from 'lucide-react';
import { Separator } from "./ui/separator";
import { supabase } from '../lib/supabase';

const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location/route
  const [user, setUser] = useState<any>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Check if we're on the add-car page
  const isAddCarPage = location.pathname === '/add-car';

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    
    checkUser();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const getUserInitials = () => {
    if (!user) return "U";
    if (user.user_metadata?.name) {
      const nameParts = user.user_metadata.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.user_metadata.name[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };


  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo section - unchanged */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-[40px] h-[40px] bg-black rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => navigate('/services')}
            >
              <img
                className="w-[30px] h-6"
                alt="Logo"
                src="/group-46-1.png"
              />
            </motion.div>
            <img
              className="h-6 ml-3"
              alt="Brand"
              src="/group-47.png"
            />
          </div>
          {!isAddCarPage && (
            <div className="flex items-center space-x-4">
              <div className="relative" ref={profileDropdownRef}>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => navigate('/user-settings')} // Changed from '/profile' to '/user-settings'
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center font-medium text-sm"
                  >
                    {getUserInitials()}
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;