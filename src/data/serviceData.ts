import { Service } from '../types/serviceTypes';
import HatchBack from './PlanImages/HatchBack.png'
import Premium from './PlanImages/Premium.png'
import Sedan from './PlanImages/Sedan.png'
import Suv from './PlanImages/Suv.png'
// Monthly plans data - available for all car types
export const monthlyPlans: Service[] = [
  {
    id: 'hatchback-plan',
    name: 'Hatchback Plan',
    description: 'Essential care plan tailored for compact cars with daily cleaning service',
    duration: '30 days',
    price: 799,
    category: 'Monthly',
    frequency: '6 days/week',
    features: [
      '6 days service per week',
      '2 interior cleanings per month',
      'Slot based on your selection',
      'Daily updates',
      'Basic exterior wash',
      'Window cleaning included'
    ],
    isMonthlyPlan: true,
    image: HatchBack,
    vehicleType: 'hatchback'  // Added vehicle type
  },
  {
    id: 'sedan-plan',
    name: 'Sedan Plan',
    description: 'Complete care package designed specifically for sedan vehicles',
    duration: '30 days',
    price: 899,
    category: 'Monthly',
    frequency: '6 days/week',
    features: [
      '6 days service per week',
      '2 interior cleanings per month',
      'Slot based on your selection',
      'Daily updates',
      'Full exterior detailing',
      'Tire and rim care'
    ],
    isMonthlyPlan: true,
    image: Sedan,
    vehicleType: 'sedan'  // Added vehicle type
  },
  {
    id: 'suv-plan',
    name: 'SUV Plan',
    description: 'Specialized cleaning package for larger vehicles with comprehensive care',
    duration: '30 days',
    price: 999,
    category: 'Monthly',
    frequency: '6 days/week',
    features: [
      '6 days service per week',
      '2 interior cleanings per month',
      'Slot based on your selection',
      'Daily updates',
      'Complete SUV detailing',
      'Extra attention to third row'
    ],
    isMonthlyPlan: true,
    image: Suv,
    vehicleType: 'suv'  // Added vehicle type
  },
  {
    id: 'premium-plan',
    name: 'Premium Plan',
    description: 'Ultimate car care experience with premium services and priority treatment',
    duration: '30 days',
    price: 1199,
    category: 'Monthly',
    popular: true,
    frequency: '6 days/week',
    features: [
      '6 days service per week',
      '2 interior cleanings per month',
      'Slot based on your selection',
      'Daily updates',
      'Premium products used',
      'Priority scheduling',
      'Monthly paint protection'
    ],
    isMonthlyPlan: true,
    image: Premium,
    vehicleType: 'luxury'  // Added vehicle type - assuming the premium plan is for luxury vehicles
  }
];

// Service data by vehicle type
export const servicesByType: Record<string, Service[]> = {
  hatchback: [
    ...monthlyPlans,
    {
      id: 'h1',
      name: 'Compact Exterior Wash',
      description: 'Quick and efficient exterior cleaning tailored for smaller vehicles',
      duration: '30 mins',
      price: 799,  // ₹799
      category: 'Exterior'
    },
    {
      id: 'h2',
      name: 'Eco Clean Package',
      description: 'Water-efficient wash perfect for compact cars with eco-friendly products',
      duration: '45 mins',
      price: 1299, // ₹1,299
      category: 'Eco',
      popular: true
    },
    {
      id: 'h3',
      name: 'City Car Protection',
      description: 'Special coating to protect against urban pollutants and scratches',
      duration: '60 mins',
      price: 1999, // ₹1,999
      category: 'Protection'
    },
    {
      id: 'h4',
      name: 'Small Car Interior Detail',
      description: 'Complete interior clean designed specifically for compact spaces',
      duration: '45 mins',
      price: 1499, // ₹1,499
      category: 'Interior'
    },
    {
      id: 'h5',
      name: 'Glass & Trim Treatment',
      description: 'Specialized cleaning for windows and trim elements',
      duration: '25 mins',
      price: 899,  // ₹899
      category: 'Exterior'
    }
  ],
  sedan: [
    ...monthlyPlans,
    {
      id: 's1',
      name: 'Full Sedan Wash',
      description: 'Complete exterior wash designed specifically for sedan bodies',
      duration: '45 mins',
      price: 1499, // ₹1,499
      category: 'Exterior',
      popular: true
    },
    {
      id: 's2',
      name: 'Executive Interior Clean',
      description: 'Premium interior detailing for a professional clean look',
      duration: '60 mins',
      price: 2499, // ₹2,499
      category: 'Interior'
    },
    {
      id: 's3',
      name: 'Commuter Special',
      description: 'Quick wash and vacuum ideal for daily drivers',
      duration: '35 mins',
      price: 1299, // ₹1,299
      category: 'Express',
      popular: true
    },
    {
      id: 's4',
      name: 'Ceramic Coating',
      description: 'Long-lasting protection against environmental damage and UV rays',
      duration: '120 mins',
      price: 7999, // ₹7,999
      category: 'Protection'
    },
    {
      id: 's5',
      name: 'Leather Conditioning',
      description: 'Special treatment for leather seats to restore and protect',
      duration: '40 mins',
      price: 1999, // ₹1,999
      category: 'Interior'
    }
  ],
  suv: [
    ...monthlyPlans,
    {
      id: 'suv1',
      name: 'SUV Deep Clean',
      description: 'Extra attention for larger vehicles with hard-to-reach areas',
      duration: '75 mins',
      price: 2999, // ₹2,999
      category: 'Exterior',
      popular: true
    },
    {
      id: 'suv2',
      name: 'Family Vehicle Package',
      description: 'Interior sanitization and stain removal perfect for family SUVs',
      duration: '90 mins',
      price: 3499, // ₹3,499
      category: 'Interior'
    },
    {
      id: 'suv3',
      name: 'Off-Road Recovery',
      description: 'Special cleaning for SUVs after outdoor adventures',
      duration: '120 mins',
      price: 4499, // ₹4,499
      category: 'Exterior'
    },
    {
      id: 'suv4',
      name: 'Third Row Special',
      description: 'Complete cleaning of all rows including hard-to-reach third row',
      duration: '60 mins',
      price: 2499, // ₹2,499
      category: 'Interior'
    },
    {
      id: 'suv5',
      name: 'Premium Protection',
      description: 'Full body protection with advanced polymer sealants',
      duration: '100 mins',
      price: 4999, // ₹4,999
      category: 'Protection',
      popular: true
    }
  ],
  luxury: [
    ...monthlyPlans,
    {
      id: 'lux1',
      name: 'Premium Concierge Wash',
      description: 'Complete exterior wash with hand-applied premium waxes and sealants',
      duration: '90 mins',
      price: 5999, // ₹5,999
      category: 'Exterior',
      popular: true
    },
    {
      id: 'lux2',
      name: 'White Glove Interior Detail',
      description: 'Meticulous interior detailing with premium leather conditioning and fabric treatments',
      duration: '120 mins',
      price: 8999, // ₹8,999
      category: 'Interior'
    },
    {
      id: 'lux3',
      name: 'Ceramic Pro Treatment',
      description: 'Professional-grade ceramic coating that offers superior protection for luxury finishes',
      duration: '180 mins',
      price: 22999, // ₹22,999
      category: 'Protection',
      popular: true
    },
    {
      id: 'lux4',
      name: 'Executive Detail Package',
      description: 'Comprehensive interior and exterior detailing for the discerning luxury vehicle owner',
      duration: '240 mins',
      price: 8999, // ₹8,999
      category: 'Interior'
    },
    {
      id: 'lux5',
      name: 'Paint Correction & Enhancement',
      description: 'Multi-stage paint correction to remove swirl marks and enhance the showroom finish',
      duration: '300 mins',
      price: 15999, // ₹15,999
      category: 'Exterior'
    },
    {
      id: 'lux6',
      name: 'Express Luxury Refresh',
      description: 'Quick but thorough exterior wash and interior refresh for luxury vehicles',
      duration: '60 mins',
      price: 2999, // ₹2,999
      category: 'Express'
    }
  ]
};

// Quality promise features data
export const qualityPromiseFeatures = [
  {
    icon: "shield",
    title: "Premium Products",
    description: "We use only high-quality, eco-friendly products that are safe for your vehicle and the environment."
  },
  {
    icon: "clock",
    title: "Efficient Service",
    description: "Our trained professionals work efficiently to deliver exceptional results without wasting your time."
  },
  {
    icon: "map-pin",
    title: "Convenient Locations",
    description: "Multiple service locations near you with professional equipment and comfortable waiting areas."
  }
];

// Default service features (for services without specified features)
export const defaultServiceFeatures = [
  "Complete exterior wash",
  "Hand-dried finish",
  "Wheel cleaning",
  "Tire dressing",
  "Window cleaning"
];