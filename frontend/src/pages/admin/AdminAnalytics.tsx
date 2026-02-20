import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Building2, Calendar, RefreshCw } from 'lucide-react';
import { getAnalyticsData } from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function AdminAnalytics() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [refreshing, setRefreshing] = useState(false);
    const { toast } = useToast();

    const loadAnalytics = async () => {
        try {
            setRefreshing(true);
            const response = await getAnalyticsData(days);
            // adminService now returns data directly
            setAnalytics(response);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load analytics',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, [days]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Prepare chart data
    const userGrowthData = analytics?.userGrowth || [];
    const listingTrendData = analytics?.listingTrend || [];
    const contactTrendData = analytics?.contactTrend || [];
    const propertiesByCity = analytics?.propertiesByCity || [];
    const propertiesByType = analytics?.propertiesByType || [];
    const usersByRole = analytics?.usersByRole || [];

    // Calculate max values for charts
    const maxUserGrowth = Math.max(...userGrowthData.map((d: any) => Number(d.count)), 1);
    const maxListingTrend = Math.max(...listingTrendData.map((d: any) => Number(d.count)), 1);
    const maxContactTrend = Math.max(...contactTrendData.map((d: any) => Number(d.count)), 1);

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600 mt-1">Detailed insights and trends</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={days.toString()} onValueChange={(value) => setDays(Number(value))}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={loadAnalytics}
                        disabled={refreshing}
                        variant="outline"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* User Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">User Growth</h3>
                    </div>
                    <div className="h-64 flex items-end gap-1">
                        {userGrowthData.map((data: any, index: number) => {
                            const height = (Number(data.count) / maxUserGrowth) * 100;
                            return (
                                <div
                                    key={index}
                                    className="flex-1 flex flex-col items-center gap-2 group"
                                >
                                    <div className="relative w-full flex items-end justify-center">
                                        <div
                                            className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        />
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {data.count}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 text-sm text-gray-600 text-center">
                        New users over {days} days
                    </div>
                </motion.div>

                {/* Listing Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Building2 className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold">Listing Trend</h3>
                    </div>
                    <div className="h-64 flex items-end gap-1">
                        {listingTrendData.map((data: any, index: number) => {
                            const height = (Number(data.count) / maxListingTrend) * 100;
                            return (
                                <div
                                    key={index}
                                    className="flex-1 flex flex-col items-center gap-2 group"
                                >
                                    <div className="relative w-full flex items-end justify-center">
                                        <div
                                            className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        />
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {data.count}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 text-sm text-gray-600 text-center">
                        New listings over {days} days
                    </div>
                </motion.div>

                {/* Contact Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Contact Activity</h3>
                    </div>
                    <div className="h-64 flex items-end gap-1">
                        {contactTrendData.map((data: any, index: number) => {
                            const height = (Number(data.count) / maxContactTrend) * 100;
                            return (
                                <div
                                    key={index}
                                    className="flex-1 flex flex-col items-center gap-2 group"
                                >
                                    <div className="relative w-full flex items-end justify-center">
                                        <div
                                            className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        />
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {data.count}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 text-sm text-gray-600 text-center">
                        Contact requests over {days} days
                    </div>
                </motion.div>

                {/* Properties by City */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Building2 className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-semibold">Top Cities</h3>
                    </div>
                    <div className="space-y-3">
                        {propertiesByCity.slice(0, 8).map((cityData: any, index: number) => {
                            const maxCount = Math.max(...propertiesByCity.map((c: any) => Number(c._count.id)));
                            const percentage = (Number(cityData._count.id) / maxCount) * 100;
                            return (
                                <div key={index} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-900">{cityData.city}</span>
                                        <span className="text-gray-600">{cityData._count.id} properties</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-orange-500 h-2 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Properties by Type */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <h3 className="text-lg font-semibold mb-6">Properties by Type</h3>
                    <div className="space-y-4">
                        {propertiesByType.map((typeData: any, index: number) => {
                            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
                            const color = colors[index % colors.length];
                            return (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded ${color}`} />
                                        <span className="text-gray-900">{typeData.type}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                        {typeData._count.id}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Users by Role */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <h3 className="text-lg font-semibold mb-6">Users by Role</h3>
                    <div className="space-y-4">
                        {usersByRole.map((roleData: any, index: number) => {
                            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
                            const color = colors[index % colors.length];
                            return (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded ${color}`} />
                                        <span className="text-gray-900">{roleData.role}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                        {roleData._count.id}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
