import { useState, useEffect, useRef, createRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Check,
  AlertCircle,
  Upload,
  Building,
  UserCheck,
  BanknoteIcon,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import { toast } from "../../components/CustomToast";

export const WiperProfileSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    address: string | null;
  }>({ latitude: null, longitude: null, address: null });

  // Add phone verification states
  const [phoneVerificationStep, setPhoneVerificationStep] = useState(1); // 1: Phone entry, 2: OTP verification
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const otpInputRefs = Array(6).fill(0).map(() => createRef<HTMLInputElement>());

  // Profile data
  const [profile, setProfile] = useState({
    fullName: "",
    idType: "aadhar", // 'aadhar', 'pan', 'driving_license'
    idNumber: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    paymentPreference: "bank", // 'bank' or 'upi'
  });

  // First, add a new state to track if a document was uploaded
  const [idDocumentUploaded, setIdDocumentUploaded] = useState(false);
  const [documentName, setDocumentName] = useState("");

  // Get user data from localStorage if available
  useEffect(() => {
    try {
      const wiperSession = JSON.parse(localStorage.getItem('wiperSession') || '{}');
      if (wiperSession?.user?.name) {
        setProfile(prev => ({
          ...prev,
          fullName: wiperSession.user.name
        }));
      }
      
      // Check if user already completed onboarding
      if (wiperSession?.user?.onboarded) {
        navigate('/wiper-dashboard');
      }

      // Set phone number from session if available
      if (wiperSession?.user?.phone) {
        const phoneWithoutCode = wiperSession.user.phone.replace('+91', '');
        setPhoneNumber(phoneWithoutCode);
        // Skip phone verification if already authenticated
        setPhoneVerificationStep(3); // Move directly to profile setup
      }
    } catch (error) {
      console.error("Error loading wiper data:", error);
    }
  }, [navigate]);

  // Handle countdown for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
      setCountdown(30);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

  // Handle OTP input changes
  const handleOtpChange = (index: number, value: string) => {
    // Allow only digits
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last filled input or the next empty one
    const lastIndex = Math.min(pastedData.length, 5);
    otpInputRefs[lastIndex].current?.focus();
  };

  // Request OTP
  const requestOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // In a real app, you would call your backend service to send OTP
      // For demo purposes, we'll simulate a successful OTP request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Move to OTP verification screen
      setPhoneVerificationStep(2);
      
      // Focus the first OTP input
      setTimeout(() => {
        otpInputRefs[0].current?.focus();
      }, 100);
      
      // Disable resend button for 30 seconds
      setResendDisabled(true);
      
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrorMessage("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    if (resendDisabled) return;
    
    setLoading(true);
    setErrorMessage("");
    
    try {
      // Simulate OTP resend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset OTP fields
      setOtp(["", "", "", "", "", ""]);
      
      // Disable resend button
      setResendDisabled(true);
      setCountdown(30);
      
      // Focus the first OTP input
      setTimeout(() => {
        otpInputRefs[0].current?.focus();
      }, 100);
      
    } catch (error) {
      console.error("Error resending OTP:", error);
      setErrorMessage("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the OTP");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // In a real app, you'd verify the OTP with your backend
      // For demo, we'll simulate successful verification after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the session with phone verification
      const wiperSession = JSON.parse(localStorage.getItem('wiperSession') || '{}');
      const updatedSession = {
        ...wiperSession,
        user: {
          ...wiperSession.user,
          phone: countryCode + phoneNumber,
          phone_verified: true
        }
      };
      
      localStorage.setItem('wiperSession', JSON.stringify(updatedSession));
      
      // Move to profile setup
      setPhoneVerificationStep(3);
      
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMessage("Invalid OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Go back in phone verification flow
  const goBackInVerification = () => {
    if (phoneVerificationStep === 2) {
      setPhoneVerificationStep(1);
    }
  };

  // Handle file input changes for profile image
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      setUploading(true);
      
      // For demo, we'll use a mock URL instead of actually uploading
      // In a real app, you'd upload to Supabase storage or another service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setUploading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast("Failed to upload image");
      setUploading(false);
    }
  };

  // Update the handleIdUpload function
  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      setUploading(true);
      
      // Store the file name for display
      setDocumentName(file.name);
      
      // Mock file upload with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Just for demo purposes
      toast("ID document uploaded successfully");
      setIdDocumentUploaded(true);
      setUploading(false);
    } catch (error) {
      console.error("Error uploading ID:", error);
      toast("Failed to upload ID document");
      setUploading(false);
    }
  };

  // Handle getting current location
  const handleGetLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // For demo, we'll simulate getting an address from coordinates
          // In a real app, you would use a geocoding service like Google Maps API
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          setLocation({
            latitude,
            longitude,
            address: "Chennai, TamilNadu, India", 
          });
          
          setLocationLoading(false);
        } catch (error) {
          console.error("Error getting location:", error);
          setErrorMessage("Failed to get your location");
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setErrorMessage(
          error.code === 1
            ? "Please allow location access to continue"
            : "Failed to get your location"
        );
        setLocationLoading(false);
      }
    );
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle step navigation
  const goToNextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!profile.fullName.trim()) {
        setErrorMessage("Please enter your full name");
        return;
      }
      setErrorMessage("");
    } else if (currentStep === 2) {
      if (!profileImage) {
        setErrorMessage("Please upload a profile photo");
        return;
      }
      setErrorMessage("");
    } else if (currentStep === 3) {
      if (!profile.idNumber) {
        setErrorMessage(`Please enter your ${profile.idType.toUpperCase()} number`);
        return;
      }
      setErrorMessage("");
    } else if (currentStep === 4) {
      if (!location.latitude || !location.longitude) {
        setErrorMessage("Please allow location access");
        return;
      }
      setErrorMessage("");
    } else if (currentStep === 5) {
      if (profile.paymentPreference === 'bank') {
        if (!profile.bankName || !profile.accountNumber || !profile.ifscCode) {
          setErrorMessage("Please fill all bank details");
          return;
        }
      } else if (profile.paymentPreference === 'upi') {
        if (!profile.upiId) {
          setErrorMessage("Please enter your UPI ID");
          return;
        }
      }
      setErrorMessage("");
    }

    setCurrentStep(prev => Math.min(5, prev + 1));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    setErrorMessage("");
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // In a real app, you would save this data to your database
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock saving data to localStorage
      const wiperSession = JSON.parse(localStorage.getItem('wiperSession') || '{}');
      const updatedSession = {
        ...wiperSession,
        user: {
          ...wiperSession.user,
          fullName: profile.fullName,
          profileImage: profileImage,
          idType: profile.idType,
          idNumber: profile.idNumber,
          location: location,
          paymentDetails: {
            preference: profile.paymentPreference,
            bankName: profile.bankName,
            accountNumber: profile.accountNumber,
            ifscCode: profile.ifscCode,
            upiId: profile.upiId
          },
          onboarded: true
        }
      };
      
      localStorage.setItem('wiperSession', JSON.stringify(updatedSession));
      
      toast("Profile setup completed successfully!");
      navigate("/wiper-dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrorMessage("Failed to save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const fadeVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { 
        duration: 0.3 
      }
    }
  };

  const slideVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    exit: {
      x: -50,
      opacity: 0,
      transition: {
        type: "tween",
        duration: 0.2,
      },
    },
  };

  // Phone verification UI components
  const renderPhoneVerification = () => {
    if (phoneVerificationStep === 1) {
      return (
        <motion.div
          className="space-y-6"
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          key="phone-step"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Welcome to Wiper!</h2>
            <p className="text-gray-600">Let's verify your phone number first</p>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
              Phone Number
            </label>
            <div className="flex">
              <div className="shrink-0">
                <div className="h-[42px] inline-flex items-center px-3 md:px-4 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-700 border-r-0">
                  <span className="text-sm font-medium">+91</span>
                </div>
              </div>
              <Input
                name="phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setPhoneNumber(value);
                  }
                }}
                className="h-[42px] w-full rounded-l-none border-l-0 border border-gray-300 rounded-r-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5e82e] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                placeholder="Enter your 10-digit phone number"
                maxLength={10}
                inputMode="numeric"
              />
            </div>
            <motion.div
              className="h-0.5 bg-gradient-to-r from-[#c5e82e] to-[#a5c824] mt-0.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: phoneNumber ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <Button
            onClick={requestOTP}
            disabled={loading || phoneNumber.length !== 10}
            className="w-full py-6 rounded-xl bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending OTP...
              </>
            ) : (
              <>Get OTP</>
            )}
          </Button>
        </motion.div>
      );
    } // Update the renderPhoneVerification function for the OTP step:
    else if (phoneVerificationStep === 2) {
      return (
        <motion.div
          className="space-y-6"
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          key="otp-step"
        >
          <button
            onClick={goBackInVerification}
            className="flex items-center text-gray-500 hover:text-black transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Back</span>
          </button>
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Verify Your Phone</h2>
            <p className="text-gray-600">
              We've sent a verification code to <br />
              <span className="font-semibold">{countryCode} {phoneNumber}</span>
            </p>
          </div>
          
          <div className="relative mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter 6-digit OTP
            </label>
            
            <div className="flex justify-center items-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={otpInputRefs[index]}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c5e82e] focus:border-[#c5e82e] transition-all bg-gray-50"
                  maxLength={1}
                  inputMode="numeric"
                />
              ))}
            </div>
            
            <motion.div
              className="h-0.5 bg-gradient-to-r from-[#c5e82e] to-[#a5c824] mt-2 rounded-full mx-auto"
              initial={{ width: 0 }}
              animate={{ width: otp.filter(d => d).length / 6 * 100 + "%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="text-center mt-4">
            <button 
              onClick={resendOTP}
              disabled={resendDisabled}
              className={`text-sm flex items-center justify-center mx-auto gap-1 py-2 px-4 rounded-lg ${
                resendDisabled 
                  ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                  : 'text-[#c5e82e] hover:text-[#b2cc2b] hover:bg-[#c5e82e]/10'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resendDisabled ? '' : 'animate-pulse'}`} />
              {resendDisabled 
                ? `Resend OTP in ${countdown}s` 
                : "Resend OTP"}
            </button>
          </div>
        </motion.div>
      );
    }else {
      return null;
    }
  };

  const renderProgressBar = () => {
    // Show profile setup progress only after phone verification
    if (phoneVerificationStep < 3) return null;
    
    return (
      <div className="w-full mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Setup Progress</span>
          <span className="text-xs font-medium text-black">{Math.round((currentStep / 5) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#c5e82e] to-[#a5c824] transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 5) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

      </div>
    );
  };
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
// Update the renderStepContent function's case 1:
case 1:
  return (
    <motion.div 
      key="step1"
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Welcome to Wiper!</h2>
        <p className="text-gray-600">Let's set up your profile to get you started</p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <div className="relative group">
          <Input
            type="text"
            name="fullName"
            value={profile.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="pl-10 py-6 rounded-xl bg-gray-50 hover:bg-white focus:bg-white transition-colors border-gray-200 focus:border-[#c5e82e] focus:ring-[#c5e82e]/20 group-hover:border-gray-300"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-500">
            <UserCheck className="w-5 h-5" />
          </div>
          <motion.div
            className="h-0.5 bg-gradient-to-r from-[#c5e82e] to-[#a5c824] mt-0.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: profile.fullName ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-gray-500">This is how customers will see you in the app</p>
      </div>
    </motion.div>
  );
      
// Update the renderStepContent function's case 2:
case 2:
  return (
    <motion.div 
      key="step2"
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Add Profile Photo</h2>
        <p className="text-gray-600">Upload a clear photo of yourself</p>
      </div>

      <div className="flex justify-center mt-4">
        <div 
          className="relative group cursor-pointer" 
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={`w-36 h-36 rounded-full overflow-hidden shadow-md ${
            profileImage ? 'border-2 border-[#c5e82e]' : 'border-2 border-gray-300 border-dashed'
          }`}>
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <Camera className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 text-center px-2">
                  Tap to upload
                </span>
              </div>
            )}
          </div>
          
          {/* Overlay effect on hover */}
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <div className="bg-white bg-opacity-80 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800">
              {profileImage ? 'Change' : 'Upload'}
            </div>
          </div>
          
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-60 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#c5e82e] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileImageChange}
            disabled={uploading}
          />
        </div>
      </div>

      <p className="text-center text-sm text-gray-600 mt-4">
        Your profile photo helps build trust with customers
      </p>
    </motion.div>
  );
      case 3:
        return (
          <motion.div 
            key="step3"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">ID Verification</h2>
              <p className="text-gray-600">Verify your identity with valid ID proof</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ID Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'aadhar', label: 'Aadhar' },
                    { id: 'pan', label: 'PAN Card' },
                    { id: 'driving_license', label: 'Driving License' }
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, idType: option.id }))}
                      className={`py-2 px-3 text-sm rounded-lg border ${
                        profile.idType === option.id 
                          ? 'bg-[#c5e82e]/20 border-[#c5e82e] text-black font-medium' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  {profile.idType === 'aadhar' ? 'Aadhar Number' : 
                   profile.idType === 'pan' ? 'PAN Number' : 'License Number'}
                </label>
                <Input
                  type="text"
                  name="idNumber"
                  value={profile.idNumber}
                  onChange={handleInputChange}
                  placeholder={`Enter your ${profile.idType} number`}
                  className="py-6 rounded-xl bg-gray-50 hover:bg-white focus:bg-white transition-colors"
                />
              </div>

              <div className="mt-2">
                <div className={`border-2 rounded-lg overflow-hidden transition-all ${
                  idDocumentUploaded 
                    ? 'border-[#c5e82e] bg-[#c5e82e]/5 shadow-md' 
                    : 'border-gray-300 border-dashed bg-gray-50 hover:bg-gray-100'
                }`}>
                  {idDocumentUploaded ? (
                    // Uploaded state
                    <div className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#c5e82e]/20 flex items-center justify-center mr-3">
                          <Check className="w-5 h-5 text-[#c5e82e]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{documentName}</p>
                          <p className="text-xs text-gray-500">Document uploaded successfully</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => document.getElementById('id-upload')?.click()}
                          className="text-xs font-medium text-[#c5e82e] hover:text-[#a5c824]"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Not uploaded state
                    <label 
                      className="flex items-center justify-center w-full h-32 cursor-pointer"
                      htmlFor="id-upload"
                    >
                      {uploading ? (
                        // Uploading state
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-10 h-10 mb-2 border-3 border-[#c5e82e] border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm font-medium text-gray-600">Uploading document...</p>
                        </div>
                      ) : (
                        // Default state
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Upload {profile.idType} document</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG or PDF (max 5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  )}
                  <input 
                    id="id-upload"
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleIdUpload}
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      
// Update the renderStepContent function's case 4:
case 4:
  return (
    <motion.div 
      key="step4"
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Location Access</h2>
        <p className="text-gray-600">We need your location to find jobs near you</p>
      </div>

      <div className="p-6 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center space-y-4">
        <div className="p-3.5 bg-[#c5e82e]/20 rounded-full">
          <MapPin className="w-8 h-8 text-[#c5e82e]" />
        </div>
        
        {location.address ? (
          <div className="text-center w-full">
            <div className="flex items-center justify-center space-x-2 text-green-600 font-medium mb-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Location access granted</span>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-gray-800 font-medium">
                {location.address}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Lat: {location.latitude?.toFixed(6)}, Lng: {location.longitude?.toFixed(6)}
              </p>
            </div>
            
            <button 
              onClick={handleGetLocation}
              disabled={locationLoading}
              className="text-sm text-[#c5e82e] hover:text-[#a5c824] mt-3 flex items-center justify-center mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh location
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4 w-full">
            <p className="text-gray-700">
              Please allow location access so we can find jobs near you
            </p>
            <Button
              onClick={handleGetLocation}
              disabled={locationLoading}
              className="bg-black text-white hover:bg-gray-800 rounded-xl py-5 w-full shadow-md hover:shadow-lg transition-all"
            >
              {locationLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 mr-2" />
                  Allow Location Access
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-gray-500">
        Your location helps us match you with nearby vehicles
      </p>
    </motion.div>
  );

case 5:
  return (
    <motion.div 
      key="step5"
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Payment Details</h2>
        <p className="text-gray-600">How would you like to receive payments?</p>
      </div>

      <div className="space-y-5">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setProfile(prev => ({ ...prev, paymentPreference: 'bank' }))}
            className={`flex-1 flex flex-col items-center justify-center space-y-2 py-4 px-4 rounded-xl border transition-all ${
              profile.paymentPreference === 'bank'
                ? 'bg-[#c5e82e]/15 border-[#c5e82e] shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              profile.paymentPreference === 'bank' ? 'bg-[#c5e82e]/20' : 'bg-gray-100'
            }`}>
              <BanknoteIcon className={`w-6 h-6 ${profile.paymentPreference === 'bank' ? 'text-[#c5e82e]' : 'text-gray-400'}`} />
            </div>
            <span className={`${profile.paymentPreference === 'bank' ? 'font-medium' : ''} text-center`}>Bank Account</span>
          </button>
          
          <button
            type="button"
            onClick={() => setProfile(prev => ({ ...prev, paymentPreference: 'upi' }))}
            className={`flex-1 flex flex-col items-center justify-center space-y-2 py-4 px-4 rounded-xl border transition-all ${
              profile.paymentPreference === 'upi'
                ? 'bg-[#c5e82e]/15 border-[#c5e82e] shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              profile.paymentPreference === 'upi' ? 'bg-[#c5e82e]/20' : 'bg-gray-100'
            }`}>
              <IndianRupee className={`w-6 h-6 ${profile.paymentPreference === 'upi' ? 'text-[#c5e82e]' : 'text-gray-400'}`} />
            </div>
            <span className={`${profile.paymentPreference === 'upi' ? 'font-medium' : ''} text-center`}>UPI</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {profile.paymentPreference === 'bank' ? (
            <motion.div 
              key="bank-details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bank Name
                </label>
                <Input
                  type="text"
                  name="bankName"
                  value={profile.bankName}
                  onChange={handleInputChange}
                  placeholder="Enter your bank name"
                  className="py-5 rounded-xl bg-white border-gray-200 focus:border-[#c5e82e] focus:ring-[#c5e82e]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Account Number
                </label>
                <Input
                  type="text"
                  name="accountNumber"
                  value={profile.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your account number"
                  className="py-5 rounded-xl bg-white border-gray-200 focus:border-[#c5e82e] focus:ring-[#c5e82e]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  IFSC Code
                </label>
                <Input
                  type="text"
                  name="ifscCode"
                  value={profile.ifscCode}
                  onChange={handleInputChange}
                  placeholder="Enter IFSC code"
                  className="py-5 rounded-xl bg-white border-gray-200 focus:border-[#c5e82e] focus:ring-[#c5e82e]/20"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="upi-details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gray-50 p-5 rounded-xl border border-gray-200"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  UPI ID
                </label>
                <Input
                  type="text"
                  name="upiId"
                  value={profile.upiId}
                  onChange={handleInputChange}
                  placeholder="Enter your UPI ID (example@bank)"
                  className="py-5 rounded-xl bg-white border-gray-200 focus:border-[#c5e82e] focus:ring-[#c5e82e]/20"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-sm text-gray-500">
        Your payment details are securely stored and can be updated later
      </p>
    </motion.div>
  );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-md w-full mx-auto px-4 py-8 flex-1 flex flex-col">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          {(phoneVerificationStep === 3 && currentStep > 1) ? (
            <button 
              onClick={goToPreviousStep}
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span>Back</span>
            </button>
          ) : null}
          
          <div className="flex-1 text-center">
            <div className="w-16 h-16 bg-black rounded-full mx-auto flex items-center justify-center">
              <img src="/wiperlogo.png" alt="Wiper" className="w-10 h-10" />
            </div>
          </div>
          
          <div className="w-10"></div> {/* Empty div for balance */}
        </div>

        {/* Progress bar */}
        {renderProgressBar()}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-red-500" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Content - with flex-1 to push the button to bottom */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {phoneVerificationStep < 3 ? (
              renderPhoneVerification()
            ) : (
              renderStepContent()
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons - fixed at bottom */}
        <div className="mt-6 sticky bottom-4">
          {phoneVerificationStep === 3 && (
            currentStep < 5 ? (
              <Button
                onClick={goToNextStep}
                className="w-full py-6 rounded-xl bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e] shadow-lg hover:shadow-xl transition-all"
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-6 rounded-xl bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e] shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Setting Up...
                  </>
                ) : (
                  <>Complete Setup</>
                )}
              </Button>
            )
          )}
          
          {phoneVerificationStep < 3 && (
            <div className="w-full">
              {phoneVerificationStep === 1 ? (
                <Button
                  onClick={requestOTP}
                  disabled={loading || phoneNumber.length !== 10}
                  className="w-full py-6 rounded-xl bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e] shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending OTP...
                    </>
                  ) : (
                    <>Get OTP</>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={verifyOTP}
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full py-6 rounded-xl bg-black text-white hover:bg-gray-800 border-b-2 border-[#c5e82e] shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>Verify & Continue</>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};