import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState("Authenticating...");

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Check for error in URL params
                const errorParam = searchParams.get('error');
                const errorDesc = searchParams.get('error_description');

                if (errorParam) {
                    setError(errorDesc || errorParam);
                    setTimeout(() => navigate("/login?error=" + encodeURIComponent(errorDesc || errorParam)), 2000);
                    return;
                }

                // Get the code from URL (PKCE flow)
                const code = searchParams.get('code');

                if (code) {
                    setStatus("Verifying authentication...");

                    // Exchange code for session
                    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

                    if (exchangeError) {
                        console.error("Code exchange error:", exchangeError);
                        setError(exchangeError.message);
                        setTimeout(() => navigate("/login?error=" + encodeURIComponent(exchangeError.message)), 2000);
                        return;
                    }

                    if (data.session) {
                        setStatus("Welcome back! Redirecting...");
                        console.log("Session established:", data.session.user.email);

                        // Small delay to show success message
                        setTimeout(() => {
                            navigate("/", { replace: true });
                        }, 500);
                        return;
                    }
                }

                // Fallback: Check if session already exists (hash fragment flow)
                setStatus("Checking session...");
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error("Session error:", sessionError);
                    setError(sessionError.message);
                    setTimeout(() => navigate("/login?error=" + encodeURIComponent(sessionError.message)), 2000);
                    return;
                }

                if (session) {
                    setStatus("Welcome back! Redirecting...");
                    console.log("Session found:", session.user.email);
                    setTimeout(() => navigate("/", { replace: true }), 500);
                    return;
                }

                // No session found
                setError("Authentication failed. Please try again.");
                setTimeout(() => navigate("/login?error=no_session"), 2000);

            } catch (err) {
                console.error("Auth callback error:", err);
                setError("An unexpected error occurred");
                setTimeout(() => navigate("/login?error=unexpected"), 2000);
            }
        };

        handleAuthCallback();
    }, [navigate, searchParams]);

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
