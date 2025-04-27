import React from 'react';
import {
  CalendarIcon,
  DropletIcon,
  SparklesIcon,
  ShieldIcon,
  Clock3Icon,
  CarIcon,
  MapPinIcon
} from 'lucide-react';

// Category icons mapped by category name
export const categoryIcons = {
  Monthly: <CalendarIcon className="w-4 h-4" />,
  Exterior: <DropletIcon className="w-4 h-4" />,
  Interior: <SparklesIcon className="w-4 h-4" />,
  Protection: <ShieldIcon className="w-4 h-4" />,
  Eco: <SparklesIcon className="w-4 h-4" />,
  Express: <Clock3Icon className="w-4 h-4" />,
  default: <CarIcon className="w-4 h-4" />
};

// Helper function to get the right icon based on string name
export const getIconByName = (name: string): React.ReactNode => {
  switch (name) {
    case 'shield': return <ShieldIcon className="h-8 w-8" />;
    case 'clock': return <Clock3Icon className="h-8 w-8" />;
    case 'map-pin': return <MapPinIcon className="h-8 w-8" />;
    default: return <CarIcon className="h-8 w-8" />;
  }
};