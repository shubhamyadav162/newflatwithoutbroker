import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Bed, Bath, Maximize, Calendar, User, Phone,
    ChevronLeft, ChevronRight, Share2, Heart, BadgeCheck,
    Building2, Sofa, Users, Clock, IndianRupee, Shield,
    ArrowLeft, Loader2, X, CheckCircle2
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getPropertyById, revealContact } from '@/services/propertyService';
import { Property, ContactInfo } from '@/types/property';
import { cn } from '@/lib/utils';
import { PropertyMap } from '@/components/map/PropertyMap';

export default function PropertyDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated } = useAuth();

    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(0);
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [isRevealing, setIsRevealing] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        if (id) {
            loadProperty();
        }
    }, [id]);

    const loadProperty = async () => {
        try {
            setIsLoading(true);
            const data = await getPropertyById(id!);
            setProperty(data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to load property details',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevealContact = async () => {
        if (!isAuthenticated) {
            toast({
                title: 'Login Required',
                description: 'Please login to view owner contact details',
                variant: 'destructive',
            });
            navigate('/login');
            return;
        }

        setIsRevealing(true);
        try {
            const contact = await revealContact(id!);
            setContactInfo(contact);
            setShowContactModal(true);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to reveal contact',
                variant: 'destructive',
            });
        } finally {
            setIsRevealing(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: property?.title,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: 'Link Copied!',
                description: 'Property link copied to clipboard',
            });
        }
    };

    const formatPrice = (price: number, listingType: string) => {
        if (listingType === 'SELL') {
            if (price >= 10000000) {
                return `₹${(price / 10000000).toFixed(2)} Cr`;
            }
            return `₹${(price / 100000).toFixed(2)} L`;
        }
        return `₹${price.toLocaleString('en-IN')}/month`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getFurnishingLabel = (furnishing: string) => {
        switch (furnishing) {
            case 'FULLY': return 'Fully Furnished';
            case 'SEMI': return 'Semi Furnished';
            case 'NONE': return 'Unfurnished';
            default: return furnishing;
        }
    };

    const getAvailabilityLabel = (availability: string) => {
        switch (availability) {
            case 'IMMEDIATE': return 'Immediate';
            case 'WITHIN15': return 'Within 15 Days';
            case 'WITHIN30': return 'Within 30 Days';
            default: return availability;
        }
    };

    const getTenantLabel = (tenant: string) => {
        switch (tenant) {
            case 'FAMILY': return 'Family Only';
            case 'BACHELOR': return 'Bachelors';
            case 'COMPANY': return 'Company Lease';
            case 'ANY': return 'Anyone';
            default: return tenant;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4">
                        <Skeleton className="h-[400px] w-full rounded-2xl mb-8" />
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                            <div>
                                <Skeleton className="h-64 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4 text-center py-20">
                        <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
                        <p className="text-muted-foreground mb-6">The property you're looking for doesn't exist or has been removed.</p>
                        <Button onClick={() => navigate('/listings')}>Browse Properties</Button>
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
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        className="mb-4"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Listings
                    </Button>

                    {/* Professional Amazon-style Image Gallery */}
                    <div className="grid lg:grid-cols-12 gap-6 mb-8">
                        {/* Main Large Image (8 cols) */}
                        <div className="lg:col-span-8 relative aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden shadow-elevated bg-muted">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImage}
                                    src={property.images[currentImage] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'}
                                    alt={property.title}
                                    className="w-full h-full object-cover select-none"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </AnimatePresence>

                            {/* Badges on Top */}
                            <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                                {property.owner.isVerified && (
                                    <Badge className="bg-green-500/90 backdrop-blur-md shadow-lg border-none">
                                        <BadgeCheck className="w-3.5 h-3.5 mr-1" />
                                        Verified Owner
                                    </Badge>
                                )}
                                <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-secondary shadow-lg border-none font-bold">
                                    {property.listingType === 'RENT' ? 'FOR RENT' : 'FOR SALE'}
                                </Badge>
                                <Badge className="bg-primary/90 backdrop-blur-md shadow-lg border-none">
                                    {property.type}
                                </Badge>
                            </div>

                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsFavorited(!isFavorited)}
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/90 backdrop-blur-md shadow-soft',
                                        isFavorited ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                                    )}
                                >
                                    <Heart className={cn('w-5 h-5', isFavorited && 'fill-current')} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleShare}
                                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-gray-600 flex items-center justify-center hover:bg-white shadow-soft transition-all"
                                >
                                    <Share2 className="w-5 h-5" />
                                </motion.button>
                            </div>

                            {/* Arrow Navigation */}
                            {property.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImage(prev => (prev - 1 + property.images.length) % property.images.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImage(prev => (prev + 1) % property.images.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}

                            {/* Image Indicator */}
                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                                {currentImage + 1} / {property.images.length || 1}
                            </div>
                        </div>

                        {/* Side Thumbnails Strip (4 cols) - Desktop Side, Mobile Below */}
                        <div className="lg:col-span-4 h-full flex flex-col">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3 hidden lg:block">Property Gallery</h3>
                            <div className="flex lg:grid lg:grid-cols-2 gap-3 overflow-x-auto pb-4 lg:pb-0 lg:overflow-y-auto max-h-[500px] scrollbar-hide">
                                {property.images.length > 0 ? (
                                    property.images.map((img, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setCurrentImage(i)}
                                            className={cn(
                                                'flex-shrink-0 w-24 h-24 md:w-full md:h-32 lg:h-40 rounded-xl overflow-hidden border-2 transition-all relative group',
                                                currentImage === i ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'
                                            )}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            {currentImage === i && (
                                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                                    <div className="bg-primary text-white p-1 rounded-full">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.button>
                                    ))
                                ) : (
                                    <div className="col-span-2 aspect-square rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-border">
                                        <Building2 className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title & Price */}
                            <div>
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <h1 className="font-heading text-2xl md:text-3xl font-bold">{property.title}</h1>
                                    <div className="text-right">
                                        <p className="font-heading text-2xl md:text-3xl font-bold text-primary">
                                            {formatPrice(property.price, property.listingType)}
                                        </p>
                                        {property.listingType === 'RENT' && property.deposit && (
                                            <p className="text-sm text-muted-foreground">
                                                Deposit: ₹{property.deposit.toLocaleString('en-IN')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {property.locality}, {property.city}, {property.state}
                                </p>
                            </div>

                            {/* Key Features */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {property.bhk > 0 && (
                                    <div className="bg-card rounded-xl p-4 text-center border border-border">
                                        <Bed className="w-6 h-6 text-primary mx-auto mb-2" />
                                        <p className="font-semibold">{property.bhk} BHK</p>
                                        <p className="text-xs text-muted-foreground">Bedrooms</p>
                                    </div>
                                )}
                                <div className="bg-card rounded-xl p-4 text-center border border-border">
                                    <Bath className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="font-semibold">{property.bathrooms}</p>
                                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                                </div>
                                <div className="bg-card rounded-xl p-4 text-center border border-border">
                                    <Maximize className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="font-semibold">{property.builtUpArea}</p>
                                    <p className="text-xs text-muted-foreground">Sq. Ft.</p>
                                </div>
                                <div className="bg-card rounded-xl p-4 text-center border border-border">
                                    <Sofa className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="font-semibold text-sm">{getFurnishingLabel(property.furnishing)}</p>
                                    <p className="text-xs text-muted-foreground">Furnishing</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-card rounded-xl p-6 border border-border">
                                <h2 className="font-heading text-lg font-semibold mb-4">About this Property</h2>
                                <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
                            </div>

                            {/* Property Details */}
                            <div className="bg-card rounded-xl p-6 border border-border">
                                <h2 className="font-heading text-lg font-semibold mb-4">Property Details</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Type</p>
                                            <p className="font-medium">{property.type}</p>
                                        </div>
                                    </div>
                                    {property.listingType === 'RENT' && (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <Users className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Preferred Tenant</p>
                                                    <p className="font-medium">{getTenantLabel(property.tenantType)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Available</p>
                                                    <p className="font-medium">{getAvailabilityLabel(property.availability)}</p>
                                                </div>
                                            </div>
                                            {property.maintenance && (
                                                <div className="flex items-center gap-3">
                                                    <IndianRupee className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Maintenance</p>
                                                        <p className="font-medium">₹{property.maintenance.toLocaleString('en-IN')}/mo</p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Posted On</p>
                                            <p className="font-medium">{formatDate(property.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Amenities */}
                            {property.amenities && property.amenities.length > 0 && (
                                <div className="bg-card rounded-xl p-6 border border-border">
                                    <h2 className="font-heading text-lg font-semibold mb-4">Amenities</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {property.amenities.map((amenity) => (
                                            <div key={amenity} className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                <span>{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Contact Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-card rounded-xl p-6 border border-border shadow-card sticky top-24"
                            >
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                        {property.owner.avatar ? (
                                            <img src={property.owner.avatar} alt={property.owner.name || 'Owner'} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{property.owner.name || 'Property Owner'}</p>
                                        {property.owner.isVerified && (
                                            <span className="text-xs text-green-600 flex items-center gap-1">
                                                <BadgeCheck className="w-3 h-3" />
                                                Verified Owner
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        className="btn-cherry w-full"
                                        size="lg"
                                        onClick={handleRevealContact}
                                        disabled={isRevealing}
                                    >
                                        {isRevealing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <Phone className="w-4 h-4 mr-2" />
                                                Get Owner Contact (Free)
                                            </>
                                        )}
                                    </Button>
                                </motion.div>

                                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <Shield className="w-4 h-4" />
                                    <span>100% Free • No Brokerage</span>
                                </div>
                            </motion.div>

                            {/* Location Map in Sidebar */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-card rounded-xl p-4 border border-border shadow-sm overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-3 px-2">
                                    <h3 className="font-heading font-semibold flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        Location
                                    </h3>
                                    <Badge variant="outline" className="text-[10px] uppercase">Exact Location</Badge>
                                </div>
                                <div className="w-full h-[250px] rounded-lg overflow-hidden border border-border/50 relative group">
                                    <PropertyMap
                                        lat={property.latitude}
                                        lng={property.longitude}
                                        title={property.title}
                                    />
                                    {(!property.latitude || !property.longitude) && (
                                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                                            <MapPin className="w-8 h-8 text-muted-foreground mb-2 animate-bounce" />
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Detailed map coming soon for {property.locality}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 px-2">
                                    <p className="text-sm font-medium text-foreground line-clamp-1">
                                        {property.locality}, {property.city}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        {property.address || `${property.locality}, ${property.city}, ${property.state}`}
                                    </p>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 mt-2 text-xs text-primary"
                                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.title} ${property.locality} ${property.city}`)}`, '_blank')}
                                    >
                                        View on Google Maps
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-card rounded-xl p-4 border border-border"
                            >
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Property Views
                                    </span>
                                    <span className="font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">
                                        {property.views} views
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Contact Reveal Modal */}
            <AnimatePresence>
                {showContactModal && contactInfo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowContactModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card rounded-2xl p-6 max-w-md w-full shadow-elevated"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-heading text-xl font-semibold">Owner Contact Details</h3>
                                <button
                                    onClick={() => setShowContactModal(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                        {property.owner.avatar ? (
                                            <img src={property.owner.avatar} alt={property.owner.name || 'Owner'} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-7 h-7 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">{contactInfo.ownerName}</p>
                                        {contactInfo.isVerified && (
                                            <span className="text-xs text-green-600 flex items-center gap-1">
                                                <BadgeCheck className="w-3 h-3" />
                                                Verified Owner
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <a
                                        href={`tel:${contactInfo.ownerPhone}`}
                                        className="flex items-center justify-center gap-3 p-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Call: {contactInfo.ownerPhone}
                                    </a>

                                    <a
                                        href={`https://wa.me/91${contactInfo.ownerPhone.replace(/\D/g, '')}?text=Hi, I am interested in your property: ${contactInfo.propertyTitle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 p-4 bg-[#25D366] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                        WhatsApp Chat
                                    </a>
                                </div>

                                <p className="text-center text-sm text-muted-foreground">
                                    Contact the owner directly - No brokerage fees!
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
