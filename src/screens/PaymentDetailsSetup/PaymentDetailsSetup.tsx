import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BanknoteIcon, 
  IndianRupee, 
  Check, 
  AlertCircle, 
  ArrowLeft,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { toast } from "../../components/CustomToast";

interface PaymentDetails {
  preference: 'bank' | 'upi' | '';
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  accountHolder: string;
}

export const PaymentDetailsSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validateAttempt, setValidateAttempt] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    preference: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    accountHolder: ''
  });

  // Load existing data if available
  useEffect(() => {
    try {
      const wiperSession = JSON.parse(localStorage.getItem('wiperSession') || '{}');
      if (wiperSession?.user?.paymentDetails?.preference) {
        const { preference, bankName, accountNumber, ifscCode, upiId, accountHolder } = wiperSession.user.paymentDetails;
        setPaymentDetails({
          preference: preference || '',
          bankName: bankName || '',
          accountNumber: accountNumber || '',
          ifscCode: ifscCode || '',
          upiId: upiId || '',
          accountHolder: accountHolder || ''
        });
      }
    } catch (error) {
      console.error("Error loading payment data:", error);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setValidateAttempt(true);
    
    // Validate based on preference
    if (paymentDetails.preference === 'bank') {
      if (!paymentDetails.bankName || !paymentDetails.accountNumber || !paymentDetails.ifscCode || !paymentDetails.accountHolder) {
        toast("Please fill all bank account details");
        return;
      }
      
      // Validate account number (numbers only, appropriate length)
      if (!/^\d{9,18}$/.test(paymentDetails.accountNumber)) {
        toast("Please enter a valid account number");
        return;
      }
      
      // Validate IFSC (IFSC format)
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(paymentDetails.ifscCode)) {
        toast("Please enter a valid IFSC code (e.g., SBIN0000123)");
        return;
      }
    } else if (paymentDetails.preference === 'upi') {
      if (!paymentDetails.upiId) {
        toast("Please enter your UPI ID");
        return;
      }
      
      // Validate UPI ID format
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(paymentDetails.upiId)) {
        toast("Please enter a valid UPI ID (e.g., username@bankname)");
        return;
      }
    } else {
      toast("Please select a payment method");
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to localStorage
      const wiperSession = JSON.parse(localStorage.getItem('wiperSession') || '{}');
      if (!wiperSession.user) wiperSession.user = {};
      
      wiperSession.user.paymentDetails = {
        preference: paymentDetails.preference,
        bankName: paymentDetails.bankName,
        accountNumber: paymentDetails.accountNumber,
        ifscCode: paymentDetails.ifscCode,
        upiId: paymentDetails.upiId,
        accountHolder: paymentDetails.accountHolder
      };
      
      localStorage.setItem('wiperSession', JSON.stringify(wiperSession));
      
      // Update the success message
      const isEditing = Boolean(paymentDetails.bankName || paymentDetails.upiId);
      toast(isEditing ? "Payment details updated successfully" : "Payment details saved successfully");
      navigate('/wiper-profile');
    } catch (error) {
      console.error("Error saving payment details:", error);
      toast("Failed to save payment details");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 flex flex-col"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate('/wiper-profile')}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Payment Details</h1>
            {paymentDetails.preference && (
              <p className="text-xs text-gray-500">Editing {paymentDetails.preference === 'bank' ? 'bank account' : 'UPI'} details</p>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-5">
        <motion.div
          className="space-y-5" 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="space-y-2 mb-2">
            <h2 className="text-lg font-bold">Select Payment Method</h2>
            <p className="text-gray-600 text-sm">Choose how you'd like to receive your payments</p>
          </div>

          {/* Payment Method Options */}
          <div className="mt-3 space-y-4">
            {/* Bank Account Option */}
            <div 
              onClick={() => setPaymentDetails(prev => ({ ...prev, preference: 'bank' }))}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer ${
                paymentDetails.preference === 'bank'
                  ? 'bg-gradient-to-br from-[#f1fbd5] to-[#e8f7ac] border-2 border-[#c5e82e] shadow-lg'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center p-4 flex-wrap sm:flex-nowrap">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  paymentDetails.preference === 'bank' ? 'bg-[#c5e82e]/30' : 'bg-gray-100'
                } flex-shrink-0 mr-3`}>
                  <BanknoteIcon className={`w-6 h-6 ${paymentDetails.preference === 'bank' ? 'text-[#95aa23]' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 my-1 min-w-0">
                  <h3 className={`font-medium ${paymentDetails.preference === 'bank' ? 'text-black' : 'text-gray-700'} text-base truncate`}>Bank Account</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">Secure direct transfers to your bank account</p>
                </div>
                <div className={`w-6 h-6 rounded-full border ml-2 flex-shrink-0 ${
                  paymentDetails.preference === 'bank' 
                    ? 'bg-[#c5e82e] border-[#c5e82e]' 
                    : 'border-gray-300 bg-white'
                } flex items-center justify-center`}>
                  {paymentDetails.preference === 'bank' && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              
              {/* Bank Account Details Form */}
              <AnimatePresence>
                {paymentDetails.preference === 'bank' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 pt-0"
                  >
                    <div className="h-px bg-gray-200 my-3"></div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Account Holder Name
                        </label>
                        <Input
                          type="text"
                          name="accountHolder"
                          value={paymentDetails.accountHolder}
                          onChange={handleInputChange}
                          placeholder="Enter account holder name"
                          className={`py-5 rounded-xl bg-white/80 border-gray-200 focus:border-[#c5e82e] focus:ring-[#c5e82e]/20 ${
                            validateAttempt && !paymentDetails.accountHolder ? 'border-red-300 ring-red-100' : ''
                          }`}
                        />
                        {validateAttempt && !paymentDetails.accountHolder && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Account holder name is required
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Bank Name
                        </label>
                        <Input
                          type="text"
                          name="bankName"
                          value={paymentDetails.bankName}
                          onChange={handleInputChange}
                          placeholder="Enter your bank name"
                          className={`py-5 rounded-xl bg-white/80 border-gray-200 focus:border-[#c5e82e] focus:ring-[#c5e82e]/20 ${
                            validateAttempt && !paymentDetails.bankName ? 'border-red-300 ring-red-100' : ''
                          }`}
                        />
                        {validateAttempt && !paymentDetails.bankName && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Bank name is required
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Account Number
                        </label>
                        <Input
                          type="text"
                          name="accountNumber"
                          value={paymentDetails.accountNumber}
                          onChange={handleInputChange}
                          placeholder="Enter your account number"
                          className={`py-5 rounded-xl bg-white/80 border-gray-200 focus:border-[#c5e82e] focus:ring-[#c5e82e]/20 ${
                            validateAttempt && (!paymentDetails.accountNumber || !/^\d{9,18}$/.test(paymentDetails.accountNumber)) 
                              ? 'border-red-300 ring-red-100' : ''
                          }`}
                        />
                        {validateAttempt && !paymentDetails.accountNumber && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Account number is required
                          </p>
                        )}
                        {validateAttempt && paymentDetails.accountNumber && !/^\d{9,18}$/.test(paymentDetails.accountNumber) && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Please enter a valid account number
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          IFSC Code
                        </label>
                        <Input
                          type="text"
                          name="ifscCode"
                          value={paymentDetails.ifscCode}
                          onChange={handleInputChange}
                          placeholder="Enter IFSC code (e.g., SBIN0000123)"
                          className={`py-5 rounded-xl bg-white/80 border-gray-200 focus:border-[#c5e82e] focus:ring-[#c5e82e]/20 ${
                            validateAttempt && (!paymentDetails.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(paymentDetails.ifscCode)) 
                              ? 'border-red-300 ring-red-100' : ''
                          }`}
                        />
                        {validateAttempt && !paymentDetails.ifscCode && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            IFSC code is required
                          </p>
                        )}
                        {validateAttempt && paymentDetails.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(paymentDetails.ifscCode) && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Please enter a valid IFSC code
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1.5">
                          Your IFSC code is usually available on your cheque book or bank statement
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* UPI Option */}
            <div 
              onClick={() => setPaymentDetails(prev => ({ ...prev, preference: 'upi' }))}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer ${
                paymentDetails.preference === 'upi'
                  ? 'bg-gradient-to-br from-[#f1fbd5] to-[#e8f7ac] border-2 border-[#c5e82e] shadow-lg'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center p-4 flex-wrap sm:flex-nowrap">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  paymentDetails.preference === 'upi' ? 'bg-[#c5e82e]/30' : 'bg-gray-100'
                } flex-shrink-0 mr-3`}>
                  <IndianRupee className={`w-6 h-6 ${paymentDetails.preference === 'upi' ? 'text-[#95aa23]' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 my-1 min-w-0">
                  <h3 className={`font-medium ${paymentDetails.preference === 'upi' ? 'text-black' : 'text-gray-700'} text-base truncate`}>UPI</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">Fast and secure payments via UPI</p>
                </div>
                <div className={`w-6 h-6 rounded-full border ml-2 flex-shrink-0 ${
                  paymentDetails.preference === 'upi' 
                    ? 'bg-[#c5e82e] border-[#c5e82e]' 
                    : 'border-gray-300 bg-white'
                } flex items-center justify-center`}>
                  {paymentDetails.preference === 'upi' && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              
              {/* UPI Details Form */}
              <AnimatePresence>
                {paymentDetails.preference === 'upi' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 pt-0"
                  >
                    <div className="h-px bg-gray-200 my-3"></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        UPI ID
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          name="upiId"
                          value={paymentDetails.upiId}
                          onChange={handleInputChange}
                          placeholder="username@upi"
                          className={`py-5 pl-10 rounded-xl bg-white/80 border-gray-200 focus:border-[#c5e82e] focus:ring-[#c5e82e]/20 ${
                            validateAttempt && (!paymentDetails.upiId || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(paymentDetails.upiId)) 
                              ? 'border-red-300 ring-red-100' : ''
                          }`}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <IndianRupee className="w-5 h-5" />
                        </div>
                      </div>
                      {validateAttempt && !paymentDetails.upiId && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          UPI ID is required
                        </p>
                      )}
                      {validateAttempt && paymentDetails.upiId && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(paymentDetails.upiId) && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Please enter a valid UPI ID
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1.5">
                        Popular UPI apps: Google Pay, PhonePe, Paytm, BHIM
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Security Information */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4"
          >
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1.5 mr-3 mt-0.5 flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium">Secure Payment Processing</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Your financial details are encrypted and securely stored. We use industry-standard security protocols and never share your information with unauthorized parties.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Save Button - Fixed to bottom */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-4 md:px-0 z-10"
          >
            <div className="max-w-3xl mx-auto w-full">
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-6 rounded-xl bg-[#c5e82e] hover:bg-[#b5d61e] text-black font-medium transition-all shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    {paymentDetails.bankName || paymentDetails.upiId ? 'Update Payment Details' : 'Save Payment Details'}
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Add padding div to prevent content from being hidden behind fixed button */}
          <div className="h-28"></div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PaymentDetailsSetup;