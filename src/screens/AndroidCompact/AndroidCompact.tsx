import { ArrowLeftIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { supabase } from "../../lib/supabase";

export const AndroidCompact = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAuth = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (error) throw error;
        
        setErrorMessage("Please check your email for a confirmation link before signing in.");
        setIsLogin(true);
        return;
      }
    } catch (error) {
      if (error.message === "Email not confirmed") {
        setErrorMessage("Please check your email and confirm your address before signing in.");
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen">
          {/* Left side - Auth form */}
          <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <div className="flex items-center justify-center mb-8">
                <div className="w-[53px] h-[54px] bg-black rounded-full flex items-center justify-center">
                  <img
                    className="w-[39px] h-8"
                    alt="Logo"
                    src="/group-46-1.png"
                  />
                </div>
                <img
                  className="h-8 ml-4"
                  alt="Brand"
                  src="/group-47.png"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
                {isLogin ? "Welcome Back" : "Let's Set Up Your Profile"}
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Your car deserves a wipe everyday!
              </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <div className="space-y-6">
                {errorMessage && (
                  <div className="p-3 text-sm text-red-800 bg-red-50 rounded-lg">
                    {errorMessage}
                  </div>
                )}
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button
                  className="w-full h-12 bg-black text-white rounded-full hover:bg-gray-800"
                  onClick={handleAuth}
                  disabled={loading}
                >
                  {loading ? "Loading..." : (isLogin ? "Sign In" : "Sign Up")}
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrorMessage("");
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </div>

                <div className="flex items-center my-8">
                  <Separator className="flex-1" />
                  <span className="px-4 text-gray-500">Or Sign in using</span>
                  <Separator className="flex-1" />
                </div>

                <div className="flex justify-center space-x-4">
                  <Card className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <img
                      className="w-8 h-8"
                      alt="Google"
                      src="/-building-blocks.svg"
                    />
                  </Card>
                  <Card className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <img
                      className="w-8 h-8"
                      alt="Facebook"
                      src="/-building-blocks-1.svg"
                    />
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Image (visible only on desktop) */}
          <div className="hidden lg:flex lg:flex-1 bg-[url(/vector.svg)] bg-cover bg-center">
          </div>
        </div>
      </div>
    </div>
  );
};