import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Building2,
    MapPin,
    IndianRupee,
    Eye,
    Phone,
    Calendar,
    Trash2,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react';
import { getAllProperties, updatePropertyStatus, deleteProperty } from '@/services/adminService';
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

export default function AdminProperties() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        listingType: 'all',
        status: 'all',
        city: '',
        minPrice: '',
        maxPrice: '',
    });
    const [searchInput, setSearchInput] = useState('');
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    const loadProperties = async () => {
        try {
            setLoading(true);
            const response = await getAllProperties({
                ...filters,
                search: filters.search || undefined,
                type: (filters.type && filters.type !== 'all') ? filters.type : undefined,
                listingType: (filters.listingType && filters.listingType !== 'all') ? filters.listingType : undefined,
                status: (filters.status && filters.status !== 'all') ? filters.status : undefined,
                city: (filters.city && filters.city !== 'all') ? filters.city : undefined,
                minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
                maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
                page: pagination.page,
                limit: pagination.limit,
            });

            // adminService now returns data directly
            setProperties(response?.properties || []);
            setPagination({
                page: response?.page || pagination.page,
                limit: response?.limit || pagination.limit,
                total: response?.total || 0,
                totalPages: Math.ceil((response?.total || 0) / pagination.limit),
            });
        } catch (error: any) {
            console.error('Error loading properties:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to load properties',
                variant: 'destructive',
            });
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProperties();
    }, [pagination.page]);

    const handleSearch = () => {
        setFilters({ ...filters, search: searchInput });
        setPagination({ ...pagination, page: 1 });
        loadProperties();
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
        setPagination({ ...pagination, page: 1 });
        loadProperties();
    };

    const openStatusDialog = (property: any) => {
        setSelectedProperty(property);
        setNewStatus(property.status);
        setStatusDialogOpen(true);
    };

    const handleUpdateStatus = async () => {
        try {
            setSubmitting(true);
            await updatePropertyStatus(selectedProperty.id, newStatus);
            toast({
                title: 'Success',
                description: 'Property status updated successfully',
            });
            setStatusDialogOpen(false);
            loadProperties();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update status',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const openDeleteDialog = (property: any) => {
        setSelectedProperty(property);
        setDeleteDialogOpen(true);
    };

    const handleDeleteProperty = async () => {
        try {
            setSubmitting(true);
            await deleteProperty(selectedProperty.id);
            toast({
                title: 'Success',
                description: 'Property deleted successfully',
            });
            setDeleteDialogOpen(false);
            loadProperties();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete property',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        Active
                    </span>
                );
            case 'SOLD':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        <CheckCircle className="w-3 h-3" />
                        Sold
                    </span>
                );
            case 'RENTED':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        <CheckCircle className="w-3 h-3" />
                        Rented
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        <XCircle className="w-3 h-3" />
                        Inactive
                    </span>
                );
        }
    };

    const getListingTypeBadge = (type: string) => {
        return type === 'RENT' ? (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                For Rent
            </span>
        ) : (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                For Sale
            </span>
        );
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
                <p className="text-gray-600 mt-1">Manage all property listings</p>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <Label>Search</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                placeholder="Title, location, description..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} size="icon">
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <Label>Property Type</Label>
                        <Select
                            value={filters.type}
                            onValueChange={(value) => handleFilterChange('type', value)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="APARTMENT">Apartment</SelectItem>
                                <SelectItem value="VILLA">Villa</SelectItem>
                                <SelectItem value="PG">PG</SelectItem>
                                <SelectItem value="SHOP">Shop</SelectItem>
                                <SelectItem value="OFFICE">Office</SelectItem>
                                <SelectItem value="PLOT">Plot</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Listing Type Filter */}
                    <div>
                        <Label>Listing Type</Label>
                        <Select
                            value={filters.listingType}
                            onValueChange={(value) => handleFilterChange('listingType', value)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="RENT">For Rent</SelectItem>
                                <SelectItem value="SELL">For Sale</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <Label>Status</Label>
                        <Select
                            value={filters.status}
                            onValueChange={(value) => handleFilterChange('status', value)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="SOLD">Sold</SelectItem>
                                <SelectItem value="RENTED">Rented</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* City Filter */}
                    <div>
                        <Label>City</Label>
                        <Input
                            placeholder="Enter city..."
                            value={filters.city}
                            onChange={(e) => handleFilterChange('city', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    {/* Price Range */}
                    <div>
                        <Label>Price Range</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                placeholder="Min"
                                type="number"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            />
                            <Input
                                placeholder="Max"
                                type="number"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                setFilters({
                                    search: '',
                                    type: 'all',
                                    listingType: 'all',
                                    status: 'all',
                                    city: '',
                                    minPrice: '',
                                    maxPrice: '',
                                });
                                setSearchInput('');
                                setPagination({ ...pagination, page: 1 });
                                loadProperties();
                            }}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Properties Table */}
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
                                    Property
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Views
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Contacts
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Posted
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        Loading properties...
                                    </td>
                                </tr>
                            ) : properties.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No properties found
                                    </td>
                                </tr>
                            ) : (
                                properties.map((property) => (
                                    <tr key={property.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                {property.images?.[0] ? (
                                                    <img
                                                        src={property.images[0]}
                                                        alt={property.title || 'Property'}
                                                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                        <Building2 className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {property.title || 'Untitled Property'}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="truncate">
                                                            {property.locality || 'Unknown'}, {property.city || 'Unknown'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Owner: {property.owner?.name || 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {getListingTypeBadge(property.listingType)}
                                                <span className="text-xs text-gray-500">
                                                    {property.type || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-900 font-medium">
                                                <IndianRupee className="w-4 h-4" />
                                                {property.price ? property.price.toLocaleString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(property.status || 'INACTIVE')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Eye className="w-4 h-4" />
                                                {property.views ?? 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                {property._count?.contacts ?? 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openStatusDialog(property)}
                                                >
                                                    Status
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => openDeleteDialog(property)}
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
                            {pagination.total} properties
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

            {/* Status Update Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Property Status</DialogTitle>
                        <DialogDescription>
                            Change the status of "{selectedProperty?.title}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Current Status</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="SOLD">Sold</SelectItem>
                                <SelectItem value="RENTED">Rented</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setStatusDialogOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateStatus} disabled={submitting}>
                            {submitting ? 'Updating...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Property</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this property? This action cannot be
                            undone.
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
                            onClick={handleDeleteProperty}
                            disabled={submitting}
                        >
                            {submitting ? 'Deleting...' : 'Delete Property'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
