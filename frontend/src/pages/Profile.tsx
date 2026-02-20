import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Calendar, Shield,
    Edit, Save, Loader2, CheckCircle2, Building2,
    Eye, ArrowRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProperties, getContactHistory } from '@/services/propertyService';
import { authService } from '@/services/authService';
import { Property, ContactHistoryItem } from '@/types/property';

export default function Profile() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });
    const [properties, setProperties] = useState<Property[]>([]);
    const [contactHistory, setContactHistory] = useState<ContactHistoryItem[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
            });
            loadUserData();
        }
    }, [user, isAuthenticated, authLoading]);

    const loadUserData = async () => {
        try {
            setIsLoadingData(true);
            const [propertiesData, historyData] = await Promise.all([
                getMyProperties().catch(() => []),
                getContactHistory().catch(() => []),
            ]);
            setProperties(propertiesData);
            setContactHistory(historyData);
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await authService.updateProfile(formData);
            await refreshUser();
            setIsEditing(false);
            toast({
                title: 'Profile Updated',
                description: 'Your profile has been updated successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update profile',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Skeleton className="h-48 w-full rounded-xl mb-6" />
                        <Skeleton className="h-64 w-full rounded-xl" />
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
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-8 h-px bg-primary" />
                            <span className="text-primary text-sm font-medium uppercase tracking-wider">Account</span>
                        </div>
                        <h1 className="font-heading text-3xl font-bold">My Profile</h1>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2"
                        >
                            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                                {/* Profile Header */}
                                <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6">
                                    <div className="flex items-center gap-4">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center border-4 border-white shadow-lg">
                                                <User className="w-10 h-10 text-white" />
                                            </div>
                                        )}
                                        <div>
                                            <h2 className="font-heading text-2xl font-bold">{user?.name || 'User'}</h2>
                                            <p className="text-muted-foreground">{user?.email}</p>
                                            {user?.isVerified && (
                                                <Badge className="mt-2 bg-green-500">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Verified User
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Details */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-semibold text-lg">Profile Information</h3>
                                        {!isEditing ? (
                                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                                    Cancel
                                                </Button>
                                                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                                    {isSaving ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Save className="w-4 h-4 mr-2" />
                                                    )}
                                                    Save
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Full Name</Label>
                                                {isEditing ? (
                                                    <Input
                                                        value={formData.name}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                        placeholder="Enter your name"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        <span>{user?.name || 'Not set'}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                {isEditing ? (
                                                    <Input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                        placeholder="Enter your email"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                                        <span>{user?.email || 'Not set'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Account Type</Label>
                                                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                                    <span className="capitalize">{user?.role?.toLowerCase() || 'Buyer'}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Member Since</Label>
                                                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <span>January 2026</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-4"
                        >
                            <div className="bg-card rounded-xl p-5 border border-border">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{isLoadingData ? '-' : properties.length}</p>
                                        <p className="text-sm text-muted-foreground">My Properties</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate('/my-properties')}
                                >
                                    View All
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                            <div className="bg-card rounded-xl p-5 border border-border">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{isLoadingData ? '-' : contactHistory.length}</p>
                                        <p className="text-sm text-muted-foreground">Contacts Viewed</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate('/contact-history')}
                                >
                                    View History
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                            <div className="bg-card rounded-xl p-5 border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {isLoadingData ? '-' : properties.reduce((sum, p) => sum + p.views, 0)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Total Property Views</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Contact History */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8"
                    >
                        <div className="bg-card rounded-2xl border border-border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-heading text-lg font-semibold">Recent Contact History</h3>
                                {contactHistory.length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={() => navigate('/contact-history')}>
                                        View All
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </div>

                            {isLoadingData ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} className="h-16 rounded-lg" />
                                    ))}
                                </div>
                            ) : contactHistory.length === 0 ? (
                                <div className="text-center py-8">
                                    <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground">No contact history yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        Contact property owners to see history here
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {contactHistory.slice(0, 5).map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                            onClick={() => navigate(`/property/${item.property.id}`)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium line-clamp-1">{item.property.title}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {item.property.locality}, {item.property.city}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{item.owner.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
