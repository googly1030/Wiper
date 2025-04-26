import React, { useState, useEffect, useRef } from 'react';
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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

  const getUserDisplayName = () => {
    if (!user) return "User";
    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
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

          {/* Only show profile dropdown if not on add-car page */}
          {!isAddCarPage && (
            <div className="flex items-center space-x-4">
              <div className="relative" ref={profileDropdownRef}>
                {/* Existing dropdown code */}
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={toggleProfileDropdown}
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center font-medium text-sm"
                  >
                    {getUserInitials()}
                  </motion.div>
                  <ChevronDownIcon className="h-4 w-4 ml-1 text-gray-500" />
                </div>
                
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div 
                      className="absolute right-0 mt-2 w-60 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {/* Dropdown content - unchanged */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="font-medium text-gray-900">{getUserDisplayName()}</div>
                        <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                      </div>
                      <div className="py-1">
                        {/* Dropdown menu items - unchanged */}
                        <button 
                          className="flex w-full items-center px-4 py-3 text-sm hover:bg-gray-50 gap-3"
                          onClick={() => {
                            setShowProfileDropdown(false);
                            navigate('/dashboard');
                          }}
                        >
                          <HomeIcon className="h-4 w-4 text-gray-500" />
                          Dashboard
                        </button>
                        <button 
                          className="flex w-full items-center px-4 py-3 text-sm hover:bg-gray-50 gap-3"
                          onClick={() => {
                            setShowProfileDropdown(false);
                            navigate('/profile');
                          }}
                        >
                          <UserIcon className="h-4 w-4 text-gray-500" />
                          My Profile
                        </button>
                        <Separator className="my-1" />
                        <button 
                          className="flex w-full items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 gap-3"
                          onClick={handleSignOut}
                        >
                          <LogOutIcon className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;