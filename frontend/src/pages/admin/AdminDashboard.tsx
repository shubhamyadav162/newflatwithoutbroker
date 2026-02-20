import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Building2,
    Eye,
    Phone,
    TrendingUp,
    Calendar,
    Activity,
    RefreshCw,
    Database,
} from 'lucide-react';
import { getDashboardStats, getActivityLogs } from '@/services/adminService';
import { Link } from 'react-router-dom';

interface DashboardStats {
    totalUsers: number;
    totalProperties: number;
    activeProperties: number;
    totalContacts: number;
}

interface ActivityLog {
    id: string;
    action: string;
    user: string;
    details: string;
    timestamp: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const loadData = async () => {
        try {
            setRefreshing(true);

            // Fetch data from Supabase via adminService
            const [statsData, activitiesData] = await Promise.all([
                getDashboardStats(),
                getActivityLogs(10),
            ]);

            setStats(statsData);
            setActivities(activitiesData || []);
            setLastUpdated(new Date());

        } catch (error: any) {
            console.error('Error loading dashboard:', error);
            // Set default values on error
            setStats({
                totalUsers: 0,
                totalProperties: 0,
                activeProperties: 0,
                totalContacts: 0,
            });
            setActivities([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'blue',
            link: '/admin/users',
            description: 'Registered users on platform',
        },
        {
            title: 'Total Properties',
            value: stats?.totalProperties || 0,
            icon: Building2,
            color: 'green',
            link: '/admin/properties',
            description: 'All property listings',
        },
        {
            title: 'Active Listings',
            value: stats?.activeProperties || 0,
            icon: Activity,
            color: 'purple',
            link: '/admin/properties?status=ACTIVE',
            description: 'Currently active listings',
        },
        {
            title: 'Contacts Revealed',
            value: stats?.totalContacts || 0,
            icon: Phone,
            color: 'pink',
            link: '/admin/contacts',
            description: 'Owner contacts viewed',
        },
    ];

    const colorClasses: Record<string, any> = {
        blue: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
        green: { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
        purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
        pink: { bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Database className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Connected to Supabase</span>
                        {lastUpdated && (
                            <span className="text-sm text-gray-500">
                                • Last updated: {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={loadData}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const colors = colorClasses[stat.color];

                    return (
                        <Link
                            key={index}
                            to={stat.link}
                            className={`
                                relative overflow-hidden rounded-xl border ${colors.border}
                                bg-white p-6 shadow-sm transition-all
                                hover:shadow-lg hover:scale-[1.02]
                            `}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${colors.light}`}>
                                    <Icon className={`w-6 h-6 ${colors.text}`} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm"
            >
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                    <span className="text-sm text-gray-500">Auto-refreshes every 30s</span>
                </div>
                <div className="p-6">
                    {!activities || activities.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No recent activity</p>
                            <p className="text-sm text-gray-400 mt-1">Activities will appear here when users interact with the platform</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activities.map((activity, index) => (
                                <div
                                    key={activity.id || index}
                                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-primary" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                                        <p className="text-sm text-gray-600 mt-0.5">{activity.details}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(activity.timestamp).toLocaleString('en-IN', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    to="/admin/users"
                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
                >
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">Manage Users</span>
                </Link>
                <Link
                    to="/admin/properties"
                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-3"
                >
                    <Building2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">Manage Properties</span>
                </Link>
                <Link
                    to="/admin/contacts"
                    className="p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors flex items-center gap-3"
                >
                    <Phone className="w-5 h-5 text-pink-600" />
                    <span className="font-medium text-pink-700">View Contact History</span>
                </Link>
            </div>
        </div>
    );
}
