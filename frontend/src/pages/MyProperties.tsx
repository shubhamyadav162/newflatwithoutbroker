import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Building2, Eye, Phone, Edit, Trash2,
    MoreVertical, MapPin, IndianRupee, Loader2,
    AlertCircle, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProperties, deleteProperty } from '@/services/propertyService';
import { Property } from '@/types/property';
import { cn } from '@/lib/utils';

export default function MyProperties() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }
        if (isAuthenticated) {
            loadProperties();
        }
    }, [isAuthenticated, authLoading]);

    const loadProperties = async () => {
        try {
            setIsLoading(true);
            const data = await getMyProperties();
            setProperties(data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to load your properties',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await deleteProperty(deleteId);
            setProperties(prev => prev.filter(p => p.id !== deleteId));
            toast({
                title: 'Property Deleted',
                description: 'Your property has been removed from listings',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete property',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const formatPrice = (price: number, listingType: string) => {
        if (listingType === 'SELL') {
            if (price >= 10000000) {
                return `₹${(price / 10000000).toFixed(2)} Cr`;
            }
            return `₹${(price / 100000).toFixed(2)} L`;
        }
        return `₹${price.toLocaleString('en-IN')}/mo`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
            case 'INACTIVE':
                return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
            case 'SOLD':
                return <Badge className="bg-blue-500 hover:bg-blue-600">Sold</Badge>;
            case 'RENTED':
                return <Badge className="bg-purple-500 hover:bg-purple-600">Rented</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (authLoading || (!isAuthenticated && !authLoading)) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4">
                        <Skeleton className="h-12 w-64 mb-8" />
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-64 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-8 h-px bg-primary" />
                                <span className="text-primary text-sm font-medium uppercase tracking-wider">Dashboard</span>
                            </div>
                            <h1 className="font-heading text-3xl font-bold">My Properties</h1>
                            <p className="text-muted-foreground">Manage your property listings</p>
                        </div>
                        <Link to="/post-property">
                            <Button className="btn-cherry">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Property
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    {!isLoading && properties.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                        >
                            <div className="bg-card rounded-xl p-4 border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{properties.length}</p>
                                        <p className="text-sm text-muted-foreground">Total Listings</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card rounded-xl p-4 border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{properties.filter(p => p.status === 'ACTIVE').length}</p>
                                        <p className="text-sm text-muted-foreground">Active</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card rounded-xl p-4 border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{properties.reduce((sum, p) => sum + p.views, 0)}</p>
                                        <p className="text-sm text-muted-foreground">Total Views</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card rounded-xl p-4 border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">0</p>
                                        <p className="text-sm text-muted-foreground">Inquiries</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Property List */}
                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} className="h-64 rounded-xl" />
                            ))}
                        </div>
                    ) : properties.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                                <Building2 className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h2 className="font-heading text-2xl font-bold mb-2">No Properties Yet</h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                You haven't listed any properties yet. Start by posting your first property for free!
                            </p>
                            <Link to="/post-property">
                                <Button className="btn-cherry">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Post Your First Property
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {properties.map((property, index) => (
                                    <motion.div
                                        key={property.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-card rounded-xl overflow-hidden border border-border shadow-card"
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-video">
                                            <img
                                                src={property.images[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'}
                                                alt={property.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-3 left-3">
                                                {getStatusBadge(property.status)}
                                            </div>
                                            <div className="absolute top-3 right-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => navigate(`/property/${property.id}`)}>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => navigate(`/edit-property/${property.id}`)}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => setDeleteId(property.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-semibold line-clamp-1 mb-2">{property.title}</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                                                <MapPin className="w-3 h-3" />
                                                {property.locality}, {property.city}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <p className="font-heading font-bold text-primary">
                                                    {formatPrice(property.price, property.listingType)}
                                                </p>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-4 h-4" />
                                                        {property.views}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Property?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The property will be removed from all listings.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Footer />
        </div>
    );
}
