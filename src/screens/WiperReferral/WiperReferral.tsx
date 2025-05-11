import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Copy, 
  Share2, 
  Gift, 
  Coins, 
  Check, 
  Users, 
  History, 
  ChevronRight,
  Award
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "../../components/CustomToast";
import WiperNavigation from "../../components/WiperNavigation";

export const WiperReferral = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referralHistory, setReferralHistory] = useState<any[]>([]);
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  // Check for clipboard support
  useEffect(() => {
    setClipboardSupported(!!navigator.clipboard);
  }, []);

  // Load referral data
  useEffect(() => {
    const loadReferralData = async () => {
      try {
        setLoading(true);
        
        // Get user data from localStorage
        const wiperSession = JSON.parse(localStorage.getItem('wiperSession') || '{}');
        let code = wiperSession?.user?.referralCode;
        
        if (!code) {
          code = 'WIPER' + Math.random().toString(36).substring(2, 8).toUpperCase();
          
          // Save to localStorage
          if (wiperSession.user) {
            wiperSession.user.referralCode = code;
            localStorage.setItem('wiperSession', JSON.stringify(wiperSession));
          }
        }
        
        setReferralCode(code);
        
        // Get all users who used this referral code
        // In a real app this would be an API call
        // Using localStorage for demo purposes
        const allUsers = getAllUsersFromLocalStorage();
        const myReferrals = allUsers.filter(user => user.referredBy === code);
        
        // Transform user data into referral history format
        const referralHistoryData = myReferrals.map((user, index) => ({
          id: index + 1,
          name: user.fullName || user.name || "User " + (index + 1),
          type: user.userType || "wiper", // Assuming user type is stored
          date: user.referralDate || new Date().toISOString(),
          status: user.referralPaid ? "completed" : "pending",
          reward: user.userType === "customer" ? 100 : 200
        }));
        
        setReferralHistory(referralHistoryData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading referral data:", error);
        toast("Failed to load referral data");
        setLoading(false);
      }
    };
    
    loadReferralData();
  }, []);

  // Copy referral code to clipboard
  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(referralCode);
        setCopied(true);
        toast("Referral code copied to clipboard!");
        
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast("Failed to copy. Please try manually selecting the code.");
    }
  };

  // Share referral code
  const shareReferralCode = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join Wiper with my referral code',
          text: `Use my referral code ${referralCode} to sign up for Wiper and get ₹100 off on your first service!`,
          url: 'https://wipercars.com/refer'
        });
      } else {
        // Fallback for devices without Web Share API
        copyToClipboard();
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast("Couldn't share. Please try copying the code instead.");
    }
  };

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const getAllUsersFromLocalStorage = () => {
    try {
      // Get all user-related items from localStorage
      const allUserItems = [];
      
      // Check for wiper sessions
      const wiperSession = JSON.parse(localStorage.getItem('wiperSession') || '{}');
      if (wiperSession?.user) {
        allUserItems.push({
          ...wiperSession.user,
          userType: 'wiper'
        });
      }
      
      // Check for customer sessions
      const customerSession = JSON.parse(localStorage.getItem('customerSession') || '{}');
      if (customerSession?.user) {
        allUserItems.push({
          ...customerSession.user,
          userType: 'customer'
        });
      }
      
      // Check for referral tracking in a dedicated storage item
      const referralTracking = JSON.parse(localStorage.getItem('referralTracking') || '[]');
      if (Array.isArray(referralTracking)) {
        allUserItems.push(...referralTracking);
      }
      
      return allUserItems;
    } catch (error) {
      console.error('Error getting users from localStorage:', error);
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4 flex items-center">
          <button 
            onClick={() => navigate('/wiper-profile')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center mr-2 sm:mr-3"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold">Refer & Earn</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-[#c5e82e] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">Loading referral details...</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {/* Referral Hero Card */}
            <motion.div 
              variants={itemVariants}
              className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl overflow-hidden p-4 sm:p-6 text-white shadow-xl border border-gray-800"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-[#c5e82e]/20 to-transparent rounded-full blur-2xl -mt-10 -mr-10 opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#c5e82e]/20 to-transparent rounded-full blur-xl -mb-12 -ml-12 opacity-50"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#c5e82e]/20 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-[#c5e82e]" />
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold mb-1.5">Invite & Earn Rewards</h2>
                <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">Share your code and earn ₹200 for every new wiper and ₹100 for every new customer you refer!</p>
                
                {/* Referral Code Display */}
                <div className="mt-4 sm:mt-5 mb-2">
                  <p className="text-xs font-medium text-gray-400 mb-1 sm:mb-2">YOUR REFERRAL CODE</p>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 flex items-center justify-between">
                    <span className="text-lg sm:text-2xl font-bold tracking-wider text-white">{referralCode}</span>
                    <button 
                      onClick={copyToClipboard}
                      className="p-1.5 sm:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5e82e]" />
                      ) : (
                        <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-5">
                  <Button
                    onClick={copyToClipboard}
                    className="flex-1 py-3 sm:py-5 text-sm sm:text-base bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-xl"
                  >
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Copy Code
                  </Button>
                  
                  <Button
                    ref={shareButtonRef}
                    onClick={shareReferralCode}
                    className="flex-1 py-3 sm:py-5 text-sm sm:text-base bg-[#c5e82e] hover:bg-[#b5d61e] text-black font-medium rounded-xl"
                  >
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Share Now
                  </Button>
                </div>
              </div>
            </motion.div>
            
            {/* Tabs for referral info */}
            <motion.div variants={itemVariants}>
              <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-gray-100 p-1 rounded-xl mb-3 sm:mb-4 grid grid-cols-3">
                  <TabsTrigger 
                    value="about" 
                    className="rounded-lg text-xs sm:text-sm py-1.5 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                  >
                    About
                  </TabsTrigger>
                  <TabsTrigger 
                    value="howto" 
                    className="rounded-lg text-xs sm:text-sm py-1.5 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                  >
                    How It Works
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="rounded-lg text-xs sm:text-sm py-1.5 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                  >
                    History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="mt-1">
                  <Card>
                    <CardContent className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold flex items-center">
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-[#c5e82e]" />
                        Referral Benefits
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                              <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Refer a Wiper</p>
                              <p className="text-sm text-gray-500">Help someone join our team</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 flex items-center">
                            <Coins className="w-5 h-5 text-yellow-500 mr-2" />
                            <span className="text-lg font-bold">₹200 reward</span>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border border-green-100">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                              <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Refer a Customer</p>
                              <p className="text-sm text-gray-500">Invite people to use our service</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 flex items-center">
                            <Coins className="w-5 h-5 text-yellow-500 mr-2" />
                            <span className="text-lg font-bold">₹100 reward</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <p>
                          Your referral rewards will be added to your earnings once the referred person completes onboarding (for wipers) or their first service (for customers).
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="howto" className="mt-1">
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="text-lg font-semibold mb-4">How to Refer</h3>
                      
                      <div className="space-y-4">
                        <div className="flex">
                          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#c5e82e]/20 flex items-center justify-center mr-2 sm:mr-3 mt-0.5">
                            <span className="text-sm sm:text-base font-bold text-[#c5e82e]">1</span>
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-medium">Share your referral code</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                              Copy your unique code or use the share button to share it with friends and family.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex">
                          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#c5e82e]/20 flex items-center justify-center mr-2 sm:mr-3 mt-0.5">
                            <span className="text-sm sm:text-base font-bold text-[#c5e82e]">2</span>
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-medium">They sign up using your code</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                              Your referral enters your code during registration as a wiper or customer.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex">
                          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#c5e82e]/20 flex items-center justify-center mr-2 sm:mr-3 mt-0.5">
                            <span className="text-sm sm:text-base font-bold text-[#c5e82e]">3</span>
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-medium">Both of you get rewarded</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                              You earn ₹200 for each new wiper and ₹100 for each new customer. They also get ₹100 off their first service!
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex">
                          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#c5e82e]/20 flex items-center justify-center mr-2 sm:mr-3 mt-0.5">
                            <span className="text-sm sm:text-base font-bold text-[#c5e82e]">4</span>
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-medium">Track your referrals</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                              Monitor your referral status and earnings in the History tab.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history" className="mt-1">
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <History className="w-5 h-5 mr-2 text-[#c5e82e]" />
                          Referral History
                        </h3>
                        
                        <p className="text-sm font-medium text-gray-500">
                          Total Earned: <span className="text-black">₹0</span>
                        </p>
                      </div>
                      
                      {referralHistory.length > 0 ? (
                        <div className="space-y-3">
                          {referralHistory.map((referral) => (
                            <div 
                              key={referral.id}
                              className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 ${
                                  referral.type === 'wiper' 
                                    ? 'bg-purple-100 text-purple-600' 
                                    : 'bg-green-100 text-green-600'
                                }`}>
                                  <span className="text-sm font-medium">{referral.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{referral.name}</p>
                                  <div className="flex items-center mt-0.5">
                                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                                      referral.type === 'wiper' 
                                        ? 'bg-purple-100 text-purple-600' 
                                        : 'bg-green-100 text-green-600'
                                    }`}>
                                      {referral.type === 'wiper' ? 'Wiper' : 'Customer'}
                                    </span>
                                    <span className="text-[10px] sm:text-xs text-gray-500 ml-1.5 sm:ml-2">{formatDate(referral.date)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm sm:text-base font-bold">₹{referral.reward}</p>
                                <p className={`text-[10px] sm:text-xs ${
                                  referral.status === 'completed' 
                                    ? 'text-green-600' 
                                    : 'text-amber-600'
                                }`}>
                                  {referral.status === 'completed' ? 'Paid' : 'Pending'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-gray-500">You haven't made any referrals yet</p>
                          <Button 
                            onClick={() => setActiveTab("about")}
                            variant="outline" 
                            className="mt-3"
                          >
                            Learn how to refer
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
            
            {/* Referral Quick Links */}
            <motion.div variants={itemVariants}>
              <div className="mt-2">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Quick Links</h3>
                
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      <a 
                        href="#" 
                        className="flex items-center justify-between w-full p-3 sm:p-4 hover:bg-gray-50 text-left"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/refer-faq');
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                          </div>
                          <span className="text-sm sm:text-base font-medium">Referral FAQs</span>
                        </div>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </a>
                      
                      <a 
                        href="#" 
                        className="flex items-center justify-between w-full p-3 sm:p-4 hover:bg-gray-50 text-left"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/referral-terms');
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                          </div>
                          <span className="text-sm sm:text-base font-medium">Terms & Conditions</span>
                        </div>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <WiperNavigation />
    </div>
  );
};