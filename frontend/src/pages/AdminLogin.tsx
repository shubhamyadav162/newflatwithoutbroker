import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// 🔐 SECURE ADMIN PASSWORD - Only you know this!
// Change this to something only you remember
const ADMIN_PASSWORD = 'Shubham@Admin#2026$Secure!';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Step 1: Verify password
            if (password !== ADMIN_PASSWORD) {
                setError('Incorrect password. Access denied.');
                setIsLoading(false);
                return;
            }

            // Step 2: Check if user is logged in via Google
            if (!isAuthenticated || !user) {
                setError('Please login with Google first before accessing admin panel.');
                setIsLoading(false);
                return;
            }

            // Step 3: Verify/Update admin role in database
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error('Profile fetch error:', profileError);
                setError('Failed to verify admin status. Please try again.');
                setIsLoading(false);
                return;
            }

            // If not admin, make them admin (first time setup)
            if (profile?.role !== 'ADMIN') {
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ role: 'ADMIN' })
                    .eq('id', user.id);

                if (updateError) {
                    console.error('Role update error:', updateError);
                    setError('Failed to grant admin access. Please try again.');
                    setIsLoading(false);
                    return;
                }
            }

            // Step 4: Store admin session
            sessionStorage.setItem('adminAuthenticated', 'true');
            sessionStorage.setItem('adminAuthTime', Date.now().toString());
            sessionStorage.setItem('adminUserId', user.id);

            // Step 5: Redirect to admin dashboard
            navigate('/admin');

        } catch (err) {
            console.error('Admin login error:', err);
            setError('Something went wrong. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-4 shadow-lg">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
                    <p className="text-gray-400">Secure control panel for FlatWithoutBrokerage</p>
                </div>

                {/* Login Card */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-8">
                    {/* Auth Status */}
                    {isAuthenticated && user ? (
                        <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name || ''} className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                        <span className="text-white font-bold">{user.name?.[0] || 'U'}</span>
                                    </div>
                                )}
                                <div>
                                    <p className="text-green-400 font-medium">{user.name}</p>
                                    <p className="text-green-400/70 text-sm">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                                <p className="text-yellow-400 text-sm">
                                    Please <a href="/login" className="underline">login with Google</a> first
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Admin Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                                    placeholder="Enter admin password"
                                    autoFocus
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                                <p className="text-sm text-red-400 text-center">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !isAuthenticated}
                            className="w-full bg-gradient-to-r from-primary to-primary/80 text-white py-3 px-4 rounded-lg font-medium hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Access Admin Panel
                                </>
                            )}
                        </button>

                        {/* Security Note */}
                        <div className="pt-4 border-t border-gray-700">
                            <p className="text-xs text-gray-500 text-center">
                                🔒 All admin actions are logged. Supabase connected.
                            </p>
                        </div>
                    </form>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
