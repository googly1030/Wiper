import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { supabase } from "../../lib/supabase";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronLeft } from "lucide-react";

// List of country codes for the phone input
const countryCodes = [{ code: "+91", country: "IN" }];

export const AndroidCompact = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [block, setBlock] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAnimated, setIsAnimated] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  // Add this state
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const blockData = [
    "I Blocks",
    "K Blocks",
    "Q Blocks",
    "R Blocks",
    "J Blocks",
    "P Blocks",
    "S Blocks",
  ];

  // Replace the block input section with this dropdown
  useEffect(() => {
    // Start the animation after component mounts
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkForExistingSession = async () => {
      try {
        // Check for cached session in localStorage
        const cachedSession = localStorage.getItem("userSession");
        if (cachedSession) {
          const parsedSession = JSON.parse(cachedSession);
          if (
            parsedSession &&
            new Date(parsedSession.expires_at * 1000) > new Date()
          ) {
            navigate("/services");
            return;
          }
        }

        // Double-check with Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          navigate("/services");
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    checkForExistingSession();
  }, [navigate]);

  // Reset error message when switching steps
  useEffect(() => {
    setErrorMessage("");
  }, [signupStep]);

  const handleAuth = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Store session info in localStorage for quick access
        if (data.session) {
          localStorage.setItem(
            "userSession",
            JSON.stringify({
              expires_at: data.session.expires_at,
              user: {
                id: data.session.user.id,
                email: data.session.user.email,
              },
            })
          );
        }

        navigate("/services");
      } else {
        // For signup, we complete all steps first then submit the data
        if (signupStep < 4) {
          goToNextStep();
          setLoading(false);
          return;
        }

        // Form validation
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match");
        }

        // Submit all signup data with auto-confirm enabled
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: countryCode + phoneNumber,
              block,
              apartment_number: apartmentNumber,
              referral_code: referralCode || null,
            },
          },
        });

        if (error) throw error;

        // If user was created successfully, sign them in automatically
        if (data.user) {
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (signInError) throw signInError;

          // Store session info in localStorage
          if (signInData.session) {
            localStorage.setItem(
              "userSession",
              JSON.stringify({
                expires_at: signInData.session.expires_at,
                user: {
                  id: signInData.session.user.id,
                  email: signInData.session.user.email,
                },
              })
            );
          }

          // Redirect to services page
          navigate("/services");
        } else {
          // Handle edge case
          setIsLogin(true);
          setErrorMessage("Account created. Please sign in.");
        }

        return;
      }
    } catch (error) {
      // Remove specific error message about email confirmation
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevStep = () => {
    setSignupStep((prev) => Math.max(1, prev - 1));
  };

  const checkPasswordMatch = (confirmValue: string) => {
    if (confirmValue === "") {
      setPasswordMatch(null);
    } else {
      setPasswordMatch(password === confirmValue);
    }
  };

  const goToNextStep = () => {
    // Validate current step before proceeding
    if (signupStep === 1) {
      if (!email) {
        setErrorMessage("Please enter your email");
        return;
      }
    } else if (signupStep === 2) {
      if (!phoneNumber) {
        setErrorMessage("Please enter your phone number");
        return;
      }
      if (phoneNumber.length !== 10) {
        setErrorMessage("Please enter a valid 10-digit phone number");
        return;
      }
    } else if (signupStep === 3) {
      if (
        !fullName ||
        !password ||
        !confirmPassword ||
        password !== confirmPassword
      ) {
        setErrorMessage(
          password !== confirmPassword
            ? "Passwords don't match"
            : "Please fill in all required fields"
        );
        return;
      }
    }

    setSignupStep((prev) => Math.min(4, prev + 1));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
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

  const renderStepContent = () => {
    if (isLogin) {
      // Login form
      return (
        <motion.div className="space-y-5" variants={itemVariants}>
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1 ml-1"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5e82e] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                placeholder="Enter your email"
              />
            </div>
            <motion.div
              className="h-0.5 bg-gradient-to-r from-[#c5e82e] to-[#a5c824] mt-0.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: email ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1 ml-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5e82e] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => {
                  const passwordInput = document.getElementById(
                    "password"
                  ) as HTMLInputElement;
                  if (passwordInput) {
                    const newType =
                      passwordInput.type === "password" ? "text" : "password";
                    passwordInput.type = newType;
                    setShowPassword(!showPassword);
                  }
                }}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
            <motion.div
              className="h-0.5 bg-gradient-to-r from-[#c5e82e] to-[#a5c824] mt-0.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: password ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-[#a5c824] hover:text-[#c5e82e] transition-colors"
              >
                Forgot password?
              </a>
            </div>
          </div>
        </motion.div>
      );
    } else {
      // Multi-step signup flow
      switch (signupStep) {
        case 1:
          return (
            <motion.div
              className="space-y-5"
              variants={itemVariants}
              key="step1"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#c5e82e] text-black flex items-center justify-center font-medium">
                    1
                  </div>
                  <span className="ml-2 font-medium text-sm">Email</span>
                </div>
                <div className="flex items-center">
                  <div className="h-1 w-16 bg-gray-200 rounded-full">
                    <div className="h-1 w-1/4 bg-[#c5e82e] rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1 ml-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5e82e] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Enter your email"
                  />
                </div>
                <motion.div
                  className="h-0.5 bg-gradient-to-r from-[#c5e82e] to-[#a5c824] mt-0.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: email ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="relative">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  Or continue with
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors">
                    <svg
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Google
                    </span>
                  </button>
                  <button className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors">
                    <svg
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="#000000"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.16-.24 2.27-.93 3.57-.84 1.66.12 2.9.84 3.68 2.09-3.27 2.06-2.76 5.93.11 7.38-.71 1.53-1.63 3.02-2.44 3.54zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.12-1.66 4.1-3.74 4.25z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Apple
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          );

        case 2:
          return (
            <motion.div
              className="space-y-5"
              variants={slideVariants}
              key="step2"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={goToPrevStep}
                className="flex items-center text-gray-500 hover:text-black transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-sm">Back</span>
              </button>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#c5e82e] text-black flex items-center justify-center font-medium">
                    2
                  </div>
                  <span className="ml-2 font-medium text-sm">Phone Number</span>
                </div>
                <div className="flex items-center">
                  <div className="h-1 w-16 bg-gray-200 rounded-full">
                    <div className="h-1 w-2/4 bg-[#c5e82e] rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1 ml-1"
                >
                  Phone Number
                </label>
                <div className="relative flex">
                  <div className="relative">
                    <button
                      type="button"
                      className="h-[42px] inline-flex items-center px-4 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-700 border-r-0"
                      disabled
                    >
                      <span>+91</span>
                    </button>
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setPhoneNumber(value);
                        if (value.length === 10) {
                          setPhoneError("");
                        } else if (value.length > 0) {
                          setPhoneError("Phone number must be 10 digits");
                        } else {
                          setPhoneError("");
                        }
                      }
                    }}
                    onBlur={() => {
                      if (phoneNumber && phoneNumber.length !== 10) {
                        setPhoneError("Phone number must be 10 digits");
                      }
                    }}
                    className={`h-[42px] w-full rounded-l-none border-l-0 border ${
                      phoneError
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[#c5e82e]"
                    } rounded-r-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-gray-50 hover:bg-white`}
                    placeholder="Enter your 10-digit phone number"
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
                <motion.div
                  className={`h-0.5 bg-gradient-to-r ${
                    phoneError
                      ? "from-red-400 to-red-500"
                      : "from-[#c5e82e] to-[#a5c824]"
                  } mt-0.5 rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: phoneNumber ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          );

        case 3:
          return (
            <motion.div
              className="space-y-5"
              variants={slideVariants}
              key="step3"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={goToPrevStep}
                className="flex items-center text-gray-500 hover:text-black transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-sm">Back</span>
              </button>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#c5e82e] text-black flex items-center justify-center font-medium">
                    3
                  </div>
                  <span className="ml-2 font-medium text-sm">
                    Personal Details
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="h-1 w-16 bg-gray-200 rounded-full">
                    <div className="h-1 w-3/4 bg-[#c5e82e] rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="full-name"
                  className="block text-sm font-medium text-gray-700 mb-1 ml-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <Input
                    id="full-name"
                    name="full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5e82e] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Enter your full name"
                  />
                </div>
                <motion.div
                  className="h-0.5 bg-gradient-to-r from-[#c5e82e] to-[#a5c824] mt-0.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: fullName ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-gray-700 mb-1 ml-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <Input
                    id="signup-password"
                    name="signup-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5e82e] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => {
                      const passwordInput = document.getElementById(
                        "signup-password"
                      ) as HTMLInputElement;
                      if (passwordInput) {
                        const newType =
                          passwordInput.type === "password"
                            ? "text"
                            : "password";
                        passwordInput.type = newType;
                        setShowPassword(!showPassword);
                      }
                    }}
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <motion.div
                  className="h-0.5 bg-gradient-to-r from-[#c5e82e] to-[#a5c824] mt-0.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: password ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700 mb-1 ml-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      checkPasswordMatch(e.target.value);
                    }}
                    className={`w-full pl-10 pr-24 py-3.5 border ${
                      passwordMatch === null
                        ? "border-gray-300"
                        : passwordMatch
                        ? "border-green-300 focus:ring-green-500"
                        : "border-red-300 focus:ring-red-500"
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-gray-50 hover:bg-white`}
                    placeholder="Confirm your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                    {passwordMatch !== null && (
                      <span
                        className={`text-sm ${
                          passwordMatch ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {passwordMatch ? "Matches" : "Not matched"}
                      </span>
                    )}
                    <button
                      type="button"
                      className="flex items-center"
                      onClick={() => {
                        const passwordInput = document.getElementById(
                          "confirm-password"
                        ) as HTMLInputElement;
                        if (passwordInput) {
                          const newType =
                            passwordInput.type === "password"
                              ? "text"
                              : "password";
                          passwordInput.type = newType;
                          setShowConfirmPassword(!showConfirmPassword);
                        }
                      }}
                    >
                      {showConfirmPassword ? (
                        <svg
                          className="h-5 w-5 text-gray-400 hover:text-gray-600"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                            clipRule="evenodd"
                          />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-gray-400 hover:text-gray-600"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <motion.div
                  className={`h-0.5 bg-gradient-to-r ${
                    passwordMatch === null
                      ? "from-[#c5e82e] to-[#a5c824]"
                      : passwordMatch
                      ? "from-green-400 to-green-500"
                      : "from-red-400 to-red-500"
                  } mt-0.5 rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: confirmPassword ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="referral"
                  className="block text-sm font-medium text-gray-700 mb-1 ml-1"
                >
                  Referral Code (optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <Input
                    id="referral"
                    name="referral"
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5e82e] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Enter referral code (if any)"
                  />
                </div>
              </div>
            </motion.div>
          );

        case 4:
          return (
            <motion.div
              className="space-y-5"
              variants={slideVariants}
              key="step4"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={goToPrevStep}
                className="flex items-center text-gray-500 hover:text-black transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-sm">Back</span>
              </button>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#c5e82e] text-black flex items-center justify-center font-medium">
                    4
                  </div>
                  <span className="ml-2 font-medium text-sm">
                    Apartment Details
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="h-1 w-16 bg-gray-200 rounded-full">
                    <div className="h-1 w-full bg-[#c5e82e] rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="block"
                  className="block text-sm font-medium text-gray-700 mb-1 ml-1"
                >
                  Select Block
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 001 1m-4 0h4"
                      />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBlockDropdown(!showBlockDropdown)}
                    className="w-full pl-10 pr-4 py-3.5 h-[42px] border border-gray-300 rounded-lg shadow-sm bg-gray-50 hover:bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#c5e82e] focus:border-transparent transition-all flex items-center justify-between"
                  >
                    <span className={block ? "text-gray-900" : "text-gray-400"}>
                      {block || "Select your block"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        showBlockDropdown ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showBlockDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {blockData.map((blockOption) => (
                        <button
                          key={blockOption}
                          type="button"
                          onClick={() => {
                            setBlock(blockOption);
                            setShowBlockDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                            block === blockOption
                              ? "text-[#a5c824] font-medium bg-gray-50"
                              : "text-gray-700"
                          }`}
                        >
                          {blockOption}
                          {block === blockOption && (
                            <Check className="h-4 w-4 inline-block ml-2 text-[#a5c824]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <motion.div
                  className="h-0.5 bg-gradient-to-r from-[#c5e82e] to-[#a5c824] mt-0.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: block ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="apartment"
                  className="block text-sm font-medium text-gray-700 mb-1 ml-1"
                >
                  Apartment Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <Input
                    id="apartment"
                    name="apartment"
                    type="text"
                    required
                    value={apartmentNumber}
                    onChange={(e) => setApartmentNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5e82e] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    placeholder="Enter your apartment number"
                  />
                </div>
                <motion.div
                  className="h-0.5 bg-gradient-to-r from-[#c5e82e] to-[#a5c824] mt-0.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: apartmentNumber ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  This information helps our team locate your vehicle and
                  provide the best service.
                </p>
              </div>
            </motion.div>
          );

        default:
          return null;
      }
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row-reverse">
      <motion.div
        className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 py-12 bg-white overflow-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo for mobile */}
          <motion.div
            className="flex justify-center md:hidden"
            variants={itemVariants}
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-lg">
              <img
                className="w-10 h-10 object-contain"
                alt="Logo"
                src="/wiperlogo.png"
              />
            </div>
            <div className="ml-3 text-2xl font-bold flex items-center">
              wiper
            </div>
          </motion.div>

          <motion.div className="text-center" variants={itemVariants}>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {isLogin
                ? "Welcome Back"
                : !isLogin && signupStep === 1
                ? "Create your Account"
                : "Complete Your Profile"}
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Your car deserves a wipe everyday!
            </p>
          </motion.div>

          {errorMessage && (
            <motion.div
              className="p-4 text-sm rounded-lg shadow-sm flex flex-col gap-2"
              variants={itemVariants}
              style={{
                backgroundColor: errorMessage.includes("check your email")
                  ? "rgba(197, 232, 46, 0.15)"
                  : "rgba(239, 68, 68, 0.1)",
                borderLeft: `4px solid ${
                  errorMessage.includes("check your email")
                    ? "#c5e82e"
                    : "#ef4444"
                }`,
              }}
            >
              <span
                className={
                  errorMessage.includes("check your email")
                    ? "text-gray-800"
                    : "text-red-800"
                }
              >
                {errorMessage}
              </span>

              {errorMessage.includes("check your email") && (
                <Button
                  onClick={() => {
                    window.open("https://mail.google.com/mail/", "_blank"); // Opens Gmail in a new tab
                  }}
                  className="mt-2 py-2 px-4 bg-[#c5e82e] text-black text-sm font-medium rounded-lg shadow-sm hover:bg-[#b8d52a] transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Open Gmail
                </Button>
              )}
            </motion.div>
          )}

          <motion.div className="space-y-8" variants={containerVariants}>
            <div className="min-h-[300px]">{renderStepContent()}</div>

            <motion.div className="space-y-6" variants={itemVariants}>
              <Button
                onClick={handleAuth}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-black text-white text-base font-medium rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c5e82e] transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : isLogin ? (
                  "Sign In"
                ) : signupStep < 4 ? (
                  "Continue"
                ) : (
                  "Complete Signup"
                )}
              </Button>

              {(isLogin || signupStep === 1) && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setSignupStep(1);
                      setErrorMessage("");
                    }}
                    className="text-[#a5c824] hover:text-[#c5e82e] font-medium transition-colors"
                  >
                    {isLogin
                      ? "Don't have an account? Sign Up"
                      : "Already have an account? Sign In"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="hidden md:flex w-1/2 bg-gray-50 items-center justify-center relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-[#f8f8f8] z-0">
          {/* Background pattern */}
          <motion.div
            className="absolute right-0 top-1/2 transform -translate-y-1/2 h-[140%] w-auto opacity-10 bg-[#c5e82e] rounded-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          ></motion.div>
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.div
            className="w-40 h-40 bg-black rounded-full flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <motion.img
              src="/wiperlogo.png"
              alt="Wiper Logo"
              className={`w-28 h-28 object-contain`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </motion.div>
          <motion.div
            className="mt-4 text-4xl font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            wiper
          </motion.div>
          <motion.p
            className="mt-2 text-xl text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            Car wash at your doorstep
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};
