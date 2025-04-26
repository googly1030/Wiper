import React, { createContext, useContext, useState } from 'react';

// Create context for tab state
type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// Tabs container component
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ 
  defaultValue, 
  value, 
  onValueChange, 
  children, 
  className = '' 
}: TabsProps) {
  const [tabValue, setTabValue] = useState(value || defaultValue);
  
  const handleValueChange = (newValue: string) => {
    if (!value) {
      setTabValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ 
      value: value || tabValue, 
      onValueChange: handleValueChange 
    }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// TabsList component
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600 ${className}`}>
      {children}
    </div>
  );
}

// TabsTrigger component
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({ 
  value, 
  children, 
  className = '',
  disabled = false
}: TabsTriggerProps) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const { value: selectedValue, onValueChange } = context;
  const isActive = selectedValue === value;
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 
        text-sm font-medium ring-offset-white transition-all focus-visible:outline-none 
        disabled:pointer-events-none disabled:opacity-50
        ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'hover:bg-gray-200/60 hover:text-gray-900'}
        ${className}
      `}
      onClick={() => onValueChange(value)}
      data-state={isActive ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
}

// TabsContent component
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ 
  value, 
  children, 
  className = '' 
}: TabsContentProps) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  const { value: selectedValue } = context;
  const isSelected = selectedValue === value;
  
  if (!isSelected) {
    return null;
  }
  
  return (
    <div 
      role="tabpanel"
      data-state={isSelected ? 'active' : 'inactive'}
      className={`mt-2 focus-visible:outline-none ${className}`}
    >
      {children}
    </div>
  );
}