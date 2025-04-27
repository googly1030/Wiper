export interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  category: string;
  popular?: boolean;
  features?: string[];
  frequency?: string;
  isMonthlyPlan?: boolean;
}

export interface UserCar {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  size: 'hatchback' | 'sedan' | 'coupe' | 'suv' | 'luxury';
  plate_number?: string;
}