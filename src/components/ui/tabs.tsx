import React, { createContext, useContext, useState } from 'react';

// Create context for tab state
type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
  variant: 'default' | 'underline' | 'pills';
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// Tabs container component
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'underline' | 'pills';
}

export function Tabs({ 
  defaultValue, 
  value, 
  onValueChange, 
  children, 
  className = '',
  variant = 'default'
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
      onValueChange: handleValueChange,
      variant 
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
  scrollable?: boolean;
}

export function TabsList({ children, className = '', scrollable = false }: TabsListProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const childrenArray = React.Children.toArray(children);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (focusedIndex + 1) % tabRefs.current.filter(Boolean).length;
      tabRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    } else if (e.key === 'ArrowLeft') {
      const nextIndex = (focusedIndex - 1 + tabRefs.current.filter(Boolean).length) % tabRefs.current.filter(Boolean).length;
      tabRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    }
  };

  return (
    <div 
      role="tablist" 
      className={`
        ${scrollable 
          ? 'flex overflow-x-auto scrollbar-hide pb-2' 
          : 'inline-flex'}
        h-10 items-center justify-start rounded-md bg-gray-100 p-1 text-gray-600 ${className}
      `}
      onKeyDown={handleKeyDown}
    >
      {React.Children.map(childrenArray, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ref: (el: HTMLButtonElement) => (tabRefs.current[index] = el),
            tabIndex: focusedIndex === index ? 0 : -1,
          });
        }
        return child;
      })}
    </div>
  );
}

// Update TabsTrigger props
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  tabIndex?: number;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(({ 
  value, 
  children, 
  className = '',
  disabled = false,
  loading = false,
  tabIndex,
  ...props
}, ref) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const { value: selectedValue, onValueChange, variant } = context;
  const isActive = selectedValue === value;
  
  const variantStyles = {
    default: isActive ? 'bg-white text-gray-900 shadow-sm' : 'hover:bg-gray-200/60 hover:text-gray-900',
    underline: isActive ? 'border-b-2 border-blue-500 text-blue-600' : 'border-b-2 border-transparent hover:border-gray-200 hover:text-gray-900',
    pills: isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 hover:text-gray-800',
  };
  
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled || loading}
      tabIndex={tabIndex}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 
        text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-offset-2 focus-visible:ring-blue-400
        disabled:pointer-events-none disabled:opacity-50
        ${variantStyles[variant]}
        ${className}
      `}
      onClick={() => onValueChange(value)}
      data-state={isActive ? 'active' : 'inactive'}
      {...props}
    >
      {loading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      ) : null}
      {children}
    </button>
  );
});

TabsTrigger.displayName = "TabsTrigger";

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
  
  return (
    <div 
      role="tabpanel"
      data-state={isSelected ? 'active' : 'inactive'}
      className={`mt-2 focus-visible:outline-none ${className}
        ${isSelected 
          ? 'animate-in fade-in-0 zoom-in-95 data-[state=active]:block' 
          : 'animate-out fade-out-0 zoom-out-95 data-[state=inactive]:hidden'}`}
    >
      {isSelected && children}
    </div>
  );
}