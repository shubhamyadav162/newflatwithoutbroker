import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Phone, Shield, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
    const [searchParams] = useSearchParams();
    const { loginWithGoogle } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const error = searchParams.get('error');

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            await loginWithGoogle();
        } catch (err) {
            console.error('Google login error:', err);
            toast.error('Failed to sign in with Google. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            <div className="pt-32 pb-20 flex items-center justify-center">
                <div className="w-full max-w-md mx-4">
                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-white">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                            <p className="text-white/80 text-sm">
                                Sign in to access your property listings and saved searches
                            </p>
                        </div>

                        {/* Login Options */}
                        <div className="p-8 space-y-6">
                            {/* Error message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {decodeURIComponent(error)}
                                </div>
                            )}

                            {/* Google Login Button */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-neutral-200 rounded-xl font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                )}
                                Continue with Google
                            </button>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-neutral-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-neutral-400">or continue with</span>
                                </div>
                            </div>

                            {/* Phone Login */}
                            <Link to="/login/phone">
                                <Button variant="outline" className="w-full h-14 text-base font-medium border-2 rounded-xl">
                                    <Phone className="w-5 h-5 mr-3" />
                                    Phone Number (OTP)
                                </Button>
                            </Link>

                            {/* Features */}
                            <div className="pt-6 border-t border-neutral-100 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-neutral-600">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span>100% Free - No brokerage, ever!</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-neutral-600">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span>Verified property owners only</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-4 bg-neutral-50 border-t border-neutral-100 text-center">
                            <p className="text-xs text-neutral-500">
                                By continuing, you agree to our{" "}
                                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                                {" "}and{" "}
                                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                            </p>
                        </div>
                    </div>

                    {/* Back to home */}
                    <div className="text-center mt-6">
                        <Link to="/" className="text-sm text-neutral-500 hover:text-primary transition-colors inline-flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Login;
