import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState("Authenticating...");

    const { isAuthenticated, isLoading, user } = useAuth();

    useEffect(() => {
        const errorParam = searchParams.get('error');
        const errorDesc = searchParams.get('error_description');

        if (errorParam) {
            setError(errorDesc || errorParam);
            setTimeout(() => navigate("/login?error=" + encodeURIComponent(errorDesc || errorParam)), 2000);
            return;
        }

        if (!isLoading) {
            if (isAuthenticated && user) {
                setStatus("Welcome back! Redirecting...");
                setTimeout(() => navigate("/", { replace: true }), 500);
            } else {
                setError("Authentication failed. Please try again.");
                setTimeout(() => navigate("/login?error=no_session"), 2000);
            }
        } else {
            setStatus("Verifying authentication...");
        }
    }, [isAuthenticated, isLoading, user, navigate, searchParams]);

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-4">
                {error ? (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-red-600 font-medium">{error}</p>
                        <p className="text-neutral-500 text-sm mt-2">Redirecting to login...</p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-neutral-600 font-medium">{status}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
