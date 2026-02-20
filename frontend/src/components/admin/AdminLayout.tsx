import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building2,
    Phone,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const sidebarItems = [
    {
        title: 'Dashboard',
        path: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        path: '/admin/users',
        icon: Users,
    },
    {
        title: 'Properties',
        path: '/admin/properties',
        icon: Building2,
    },
    {
        title: 'Contacts',
        path: '/admin/contacts',
        icon: Phone,
    },
    {
        title: 'Analytics',
        path: '/admin/analytics',
        icon: BarChart3,
    },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check admin password authentication
    useEffect(() => {
        const isAuth = sessionStorage.getItem('adminAuthenticated');
        const authTime = sessionStorage.getItem('adminAuthTime');

        // Check if user is logged in via Supabase AND admin session is valid
        if (user && isAuth === 'true' && authTime) {
            // Check if auth is less than 24 hours old
            const authAge = Date.now() - parseInt(authTime);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (authAge < maxAge) {
                setIsAdminAuthenticated(true);
            } else {
                // Auth expired
                sessionStorage.removeItem('adminAuthenticated');
                sessionStorage.removeItem('adminAuthTime');
                setIsAdminAuthenticated(false);
            }
        } else {
            // Not logged in or invalid admin session
            setIsAdminAuthenticated(false);
            if (!user && (isAuth || authTime)) {
                // Clear admin session if Google auth is gone
                sessionStorage.removeItem('adminAuthenticated');
                sessionStorage.removeItem('adminAuthTime');
            }
        }
        setIsLoading(false);
    }, [user]);

    const handleLogout = () => {
        logout();
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminAuthTime');
        navigate('/login');
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Redirect to login if not authenticated with admin password
    if (!isAdminAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div>
                        <h1 className="text-xl font-bold">Admin Panel</h1>
                        <p className="text-sm text-gray-400">FlatWithoutBrokerage</p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg
                                    transition-colors duration-200
                                    ${isActive
                                        ? 'bg-primary text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }
                                `}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-primary" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-600 hover:text-gray-900"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4 ml-auto">
                            <Link
                                to="/"
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                View Site
                            </Link>
                            <div className="w-px h-6 bg-gray-300" />
                            <span className="text-sm text-gray-600">
                                Admin Mode
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
