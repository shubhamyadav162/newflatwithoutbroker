import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Database,
    RefreshCw,
} from 'lucide-react';
import { getAllUsers, updateUser, deleteUser } from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState({
        search: '',
        role: 'all',
        isVerified: 'all',
        startDate: '',
        endDate: '',
    });
    const [searchInput, setSearchInput] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: '',
        credits: '',
        isVerified: false,
    });
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers({
                search: filters.search || undefined,
                page: pagination.page,
                limit: pagination.limit,
            });

            // adminService now returns data directly from Supabase
            setUsers(response?.users || []);
            setPagination({
                page: response?.page || pagination.page,
                limit: response?.limit || pagination.limit,
                total: response?.total || 0,
                totalPages: Math.ceil((response?.total || 0) / pagination.limit),
            });
        } catch (error: any) {
            console.error('Error loading users:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to load users',
                variant: 'destructive',
            });
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [pagination.page]);

    const handleSearch = () => {
        setFilters({ ...filters, search: searchInput });
        setPagination({ ...pagination, page: 1 });
        loadUsers();
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
        setPagination({ ...pagination, page: 1 });
        loadUsers();
    };

    const openEditDialog = (user: any) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            role: user.role,
            credits: user.credits?.toString() || '9999',
            isVerified: user.isVerified,
        });
        setEditDialogOpen(true);
    };

    const handleUpdateUser = async () => {
        try {
            setSubmitting(true);
            await updateUser(selectedUser.id, editForm);
            toast({
                title: 'Success',
                description: 'User updated successfully',
            });
            setEditDialogOpen(false);
            loadUsers();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update user',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const openDeleteDialog = (user: any) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteUser = async () => {
        try {
            setSubmitting(true);
            await deleteUser(selectedUser.id);
            toast({
                title: 'Success',
                description: 'User deleted successfully',
            });
            setDeleteDialogOpen(false);
            loadUsers();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete user',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-purple-100 text-purple-700';
            case 'OWNER':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">Manage all users and their accounts</p>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <Label>Search</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                placeholder="Name, email, or phone..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} size="icon">
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div>
                        <Label>Role</Label>
                        <Select
                            value={filters.role}
                            onValueChange={(value) => handleFilterChange('role', value)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="BUYER">Buyer</SelectItem>
                                <SelectItem value="OWNER">Owner</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Verification Filter */}
                    <div>
                        <Label>Verification</Label>
                        <Select
                            value={filters.isVerified}
                            onValueChange={(value) => handleFilterChange('isVerified', value)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="true">Verified</SelectItem>
                                <SelectItem value="false">Not Verified</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                setFilters({
                                    search: '',
                                    role: 'all',
                                    isVerified: 'all',
                                    startDate: '',
                                    endDate: '',
                                });
                                setSearchInput('');
                                setPagination({ ...pagination, page: 1 });
                                loadUsers();
                            }}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Users Table */}
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
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Properties
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-primary" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name || 'N/A'}</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email || 'N/A'}
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Phone className="w-3 h-3" />
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isVerified ? (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <XCircle className="w-4 h-4" />
                                                    Not Verified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {user._count.properties}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditDialog(user)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => openDeleteDialog(user)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
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
                            {pagination.total} users
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    setPagination({ ...pagination, page: pagination.page - 1 })
                                }
                                disabled={pagination.page === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    setPagination({ ...pagination, page: pagination.page + 1 })
                                }
                                disabled={pagination.page === pagination.totalPages}
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information and settings
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, name: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, email: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={editForm.role}
                                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BUYER">Buyer</SelectItem>
                                    <SelectItem value="OWNER">Owner</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="credits">Credits</Label>
                            <Input
                                id="credits"
                                type="number"
                                value={editForm.credits}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, credits: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateUser} disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                            All their properties and contact history will also be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={submitting}
                        >
                            {submitting ? 'Deleting...' : 'Delete User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
