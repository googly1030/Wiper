import { Calendar, Package, Clock, User } from "lucide-react";
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
      icon: <Calendar className="w-5 h-5" />,
      path: "/wiper-home"
    },
    {
      name: "Jobs",
      icon: <Package className="w-5 h-5" />,
      path: "/wiper-job-bookings"
    },
    {
      name: "History",
      icon: <Clock className="w-5 h-5" />,
      path: "/wiper-history"
    },
    {
      name: "Profile",
      icon: <User className="w-5 h-5" />,
      path: "/wiper-profile"
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <div className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around z-10">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.path || 
                          (item.path === "/wiper-home" && currentPath === "/");
          
          return (
            <button 
              key={item.name}
              className="flex flex-col items-center justify-center w-1/4 h-full"
              onClick={() => handleNavigation(item.path)}
            >
              <div className={isActive ? "text-[#c5e82e]" : "text-gray-400"}>
                {item.icon}
              </div>
              <span className={`text-xs mt-1 ${isActive ? "font-medium" : ""}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
      {/* Add padding to prevent content from being hidden behind the navigation */}
      <div className="h-16"></div>
    </>
  );
};

export default WiperNavigation;