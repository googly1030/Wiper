import { Calendar, Package, Clock, User, Gift } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

export const WiperNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigationItems: NavigationItem[] = [
    {
      name: "Home",
      icon: <Calendar className="w-[18px] h-[18px] sm:w-5 sm:h-5" />,
      path: "/wiper-home"
    },
    {
      name: "Jobs",
      icon: <Package className="w-[18px] h-[18px] sm:w-5 sm:h-5" />,
      path: "/wiper-job-bookings"
    },
    {
      name: "Refer",
      icon: <Gift className="w-[18px] h-[18px] sm:w-5 sm:h-5" />,
      path: "/wiper-referral"
    },
    {
      name: "History",
      icon: <Clock className="w-[18px] h-[18px] sm:w-5 sm:h-5" />,
      path: "/wiper-history"
    },
    {
      name: "Profile",
      icon: <User className="w-[18px] h-[18px] sm:w-5 sm:h-5" />,
      path: "/wiper-profile"
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <div className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 h-14 sm:h-16 flex items-center justify-around z-50 shadow-md">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.path || 
                          (item.path === "/wiper-home" && currentPath === "/");
          
          return (
            <button 
              key={item.name}
              className="flex flex-col items-center justify-center w-1/5 h-full px-1 py-1.5"
              onClick={() => handleNavigation(item.path)}
            >
              <div className={`${isActive ? "text-[#c5e82e]" : "text-gray-500"} mb-0.5`}>
                {item.icon}
              </div>
              <span 
                className={`text-[10px] sm:text-xs leading-tight ${
                  isActive 
                    ? "font-medium text-[#c5e82e]" 
                    : "font-normal text-gray-500"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
      {/* Add padding to prevent content from being hidden behind the navigation */}
      <div className="h-14 sm:h-16"></div>
    </>
  );
};

export default WiperNavigation;