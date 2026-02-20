import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Calendar, User, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { getContactHistory } from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';

export default function AdminContacts() {
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
    });
    const { toast } = useToast();

    const loadContacts = async () => {
        try {
            setLoading(true);
            const response = await getContactHistory({
                page: pagination.page,
                limit: pagination.limit,
            });

            // adminService now returns data directly
            setContacts(response?.contacts || []);
            setPagination({
                page: response?.page || pagination.page,
                limit: response?.limit || pagination.limit,
                total: response?.total || 0,
                totalPages: Math.ceil((response?.total || 0) / pagination.limit),
            });
        } catch (error: any) {
            console.error('Error loading contacts:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to load contacts',
                variant: 'destructive',
            });
            setContacts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, [pagination.page]);

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Contact History</h1>
                <p className="text-gray-600 mt-1">Track all contact exchanges between users</p>
            </div>

            {/* Contacts Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Viewer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Property
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Owner
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Contact Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        Loading contacts...
                                    </td>
                                </tr>
                            ) : contacts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No contacts found
                                    </td>
                                </tr>
                            ) : (
                                contacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {contact.viewer.name || 'N/A'}
                                                    </p>
                                                    {contact.viewer.phone && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                                            <Phone className="w-3 h-3" />
                                                            {contact.viewer.phone}
                                                        </div>
                                                    )}
                                                    {contact.viewer.email && (
                                                        <p className="text-sm text-gray-500">
                                                            {contact.viewer.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {contact.property.title}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="truncate">
                                                            {contact.property.locality}, {contact.property.city}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {contact.owner.name}
                                                </p>
                                                {contact.owner.phone && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Phone className="w-3 h-3" />
                                                        {contact.owner.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(contact.timestamp).toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                            {pagination.total} contacts
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setPagination({ ...pagination, page: pagination.page - 1 })
                                }
                                disabled={pagination.page === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                <ChevronLeft className="w-4 h-4 inline" />
                                Previous
                            </button>
                            <button
                                onClick={() =>
                                    setPagination({ ...pagination, page: pagination.page + 1 })
                                }
                                disabled={pagination.page === pagination.totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 inline" />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
