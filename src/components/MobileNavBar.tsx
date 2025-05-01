import React from "react";
import { Home, Layout, Clipboard, Car, Menu } from "lucide-react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

interface MobileNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddCarClick: () => void;
  hasActiveCar: boolean;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  setActiveTab,
  onAddCarClick,
  hasActiveCar,
}) => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate("/services"); // Navigate to home/root route
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="grid grid-cols-4 h-16">
        <button
          onClick={handleHomeClick}
          className="flex flex-col items-center justify-center gap-1 text-gray-500"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </button>
        
        <button
          onClick={() => setActiveTab("dashboard")}
          className={cn(
            "flex flex-col items-center justify-center gap-1",
            activeTab === "dashboard" 
              ? "text-[#c5e82e]" 
              : "text-gray-500"
          )}
        >
          <Layout className="w-5 h-5" />
          <span className="text-xs font-medium">Dashboard</span>
        </button>
        
        <button
          onClick={() => setActiveTab("plans")}
          className={cn(
            "flex flex-col items-center justify-center gap-1",
            activeTab === "plans" 
              ? "text-[#c5e82e]" 
              : "text-gray-500"
          )}
        >
          <Clipboard className="w-5 h-5" />
          <span className="text-xs font-medium">Plans</span>
        </button>
        
        <button
          onClick={hasActiveCar ? () => setActiveTab("car") : onAddCarClick}
          className={cn(
            "flex flex-col items-center justify-center gap-1",
            activeTab === "car" 
              ? "text-[#c5e82e]" 
              : "text-gray-500"
          )}
        >
          <Car className="w-5 h-5" />
          <span className="text-xs font-medium">Vehicles</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavBar;