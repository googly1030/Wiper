export interface WiperUpdate {
    id: number;
    wiperName: string;
    message: string;
    date: string;
    day: string;
    time: string;
    profileImg: string;
    serviceType: string;
    status: "Completed" | "In Progress" | "Scheduled";
  }
  
  export const wiperUpdates: WiperUpdate[] = [
    {
      id: 1,
      wiperName: "Raj Kumar",
      message: "I've completed the full exterior wash for your car. All spots and stains were removed. Your car is now shining!",
      date: "31-Mar-25",
      day: "Monday",
      time: "5:00 PM",
      profileImg: "https://ui-avatars.com/api/?name=Raj+Kumar&background=0D8ABC&color=fff&size=128",
      serviceType: "Full Exterior Wash",
      status: "Completed"
    },
    {
      id: 2,
      wiperName: "Ajay Singh",
      message: "Hi there! I've finished the interior cleaning of your car. I paid special attention to the dashboard and seats as requested.",
      date: "29-Mar-25",
      day: "Saturday",
      time: "9:30 AM",
      profileImg: "https://ui-avatars.com/api/?name=Ajay+Singh&background=E03C31&color=fff&size=128",
      serviceType: "Interior Cleaning",
      status: "Completed"
    },
    {
      id: 3,
      wiperName: "Vijay Patel",
      message: "Quick clean done for your vehicle. I noticed a small scratch on the rear bumper, might want to check it out.",
      date: "26-Mar-25",
      day: "Wednesday",
      time: "2:15 PM",
      profileImg: "https://ui-avatars.com/api/?name=Vijay+Patel&background=28A745&color=fff&size=128",
      serviceType: "Quick Clean",
      status: "Completed"
    },
    {
      id: 4,
      wiperName: "Rahul Sharma",
      message: "Scheduled maintenance completed. I applied the premium wax coating as part of your subscription package.",
      date: "23-Mar-25",
      day: "Sunday",
      time: "11:15 AM",
      profileImg: "https://ui-avatars.com/api/?name=Rahul+Sharma&background=6F42C1&color=fff&size=128",
      serviceType: "Premium Detailing",
      status: "Completed"
    },
    {
      id: 5,
      wiperName: "Amit Verma",
      message: "Your next car wash is scheduled for tomorrow. I'll be there at the scheduled time. Please ensure access to the parking area.",
      date: "20-Mar-25",
      day: "Thursday",
      time: "4:45 PM",
      profileImg: "https://ui-avatars.com/api/?name=Amit+Verma&background=FD7E14&color=fff&size=128",
      serviceType: "Full Service Wash",
      status: "Scheduled"
    }
  ];