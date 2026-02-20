import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Home, Building2, Store, Users, MapPin, IndianRupee,
    Maximize, ArrowLeft, Save, Loader2, AlertCircle, ImagePlus
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getPropertyById, updateProperty } from '@/services/propertyService';
import { Property, PropertyType, Furnishing, TenantType, Availability } from '@/types/property';
import { cn } from '@/lib/utils';

const propertyTypes: { value: PropertyType; label: string; icon: typeof Home }[] = [
    { value: 'APARTMENT', label: 'Apartment', icon: Building2 },
    { value: 'VILLA', label: 'Villa/House', icon: Home },
    { value: 'PG', label: 'PG/Hostel', icon: Users },
    { value: 'SHOP', label: 'Shop', icon: Store },
    { value: 'OFFICE', label: 'Office', icon: Building2 },
    { value: 'PLOT', label: 'Plot/Land', icon: MapPin },
];

const amenitiesList = [
    'Parking', 'Lift', 'Power Backup', 'Security', 'Gym',
    'Swimming Pool', 'Garden', 'Club House', 'Kids Play Area',
    'AC', 'WiFi', 'Gas Pipeline', 'Water Purifier', 'Intercom',
    'Visitor Parking', 'Fire Safety', 'Rainwater Harvesting'
];

const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad',
    'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Chandigarh', 'Noida', 'Gurgaon', 'Indore', 'Bhopal'
];

export default function EditProperty() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();

    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Property>>({});

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }
        if (id && isAuthenticated) {
            loadProperty();
        }
    }, [id, isAuthenticated, authLoading]);

    const loadProperty = async () => {
        try {
            setIsLoading(true);
            const data = await getPropertyById(id!);

            // Check ownership
            if (data.ownerId !== user?.id) {
                toast({
                    title: 'Access Denied',
                    description: 'You can only edit your own properties',
                    variant: 'destructive',
                });
                navigate('/my-properties');
                return;
            }

            setProperty(data);
            setFormData(data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to load property',
                variant: 'destructive',
            });
            navigate('/my-properties');
        } finally {
            setIsLoading(false);
        }
    };

    const updateField = <K extends keyof Property>(field: K, value: Property[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities?.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...(prev.amenities || []), amenity]
        }));
    };

    const handleSave = async () => {
        if (!formData.title || !formData.description || !formData.price || !formData.locality || !formData.city || !formData.builtUpArea) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        try {
            await updateProperty(id!, {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                listingType: formData.listingType,
                price: formData.price,
                deposit: formData.deposit,
                maintenance: formData.maintenance,
                bhk: formData.bhk,
                bathrooms: formData.bathrooms,
                builtUpArea: formData.builtUpArea,
                furnishing: formData.furnishing,
                tenantType: formData.tenantType,
                availability: formData.availability,
                locality: formData.locality,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                address: formData.address,
                images: formData.images,
                amenities: formData.amenities,
            });

            toast({
                title: 'Property Updated',
                description: 'Your changes have been saved successfully',
            });
            navigate('/my-properties');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update property',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <Skeleton className="h-10 w-48 mb-8" />
                        <Skeleton className="h-[600px] w-full rounded-xl" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!property) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Button
                            variant="ghost"
                            className="mb-4"
                            onClick={() => navigate('/my-properties')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to My Properties
                        </Button>

                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-px bg-primary" />
                            <span className="text-primary text-sm font-medium uppercase tracking-wider">Edit</span>
                        </div>
                        <h1 className="font-heading text-3xl font-bold">Edit Property</h1>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-2xl shadow-card border border-border p-6 md:p-8 space-y-8"
                    >
                        {/* Property Type */}
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">Property Type</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {propertyTypes.map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => updateField('type', value)}
                                        className={cn(
                                            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                                            formData.type === value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="text-sm font-medium">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Property Title *</Label>
                                <Input
                                    value={formData.title || ''}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="Enter property title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description *</Label>
                                <Textarea
                                    value={formData.description || ''}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Describe your property"
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">Property Details</Label>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {formData.type !== 'PLOT' && formData.type !== 'SHOP' && (
                                    <div className="space-y-2">
                                        <Label>BHK</Label>
                                        <Select value={String(formData.bhk)} onValueChange={(v) => updateField('bhk', Number(v))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <SelectItem key={n} value={String(n)}>{n} BHK</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Bathrooms</Label>
                                    <Select value={String(formData.bathrooms)} onValueChange={(v) => updateField('bathrooms', Number(v))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4].map(n => (
                                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Built-up Area (sq ft)</Label>
                                    <Input
                                        type="number"
                                        value={formData.builtUpArea || ''}
                                        onChange={(e) => updateField('builtUpArea', Number(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Furnishing</Label>
                                    <Select value={formData.furnishing} onValueChange={(v) => updateField('furnishing', v as Furnishing)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FULLY">Fully Furnished</SelectItem>
                                            <SelectItem value="SEMI">Semi Furnished</SelectItem>
                                            <SelectItem value="NONE">Unfurnished</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">Location</Label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>City *</Label>
                                    <Select value={formData.city} onValueChange={(v) => updateField('city', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city) => (
                                                <SelectItem key={city} value={city}>{city}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Locality *</Label>
                                    <Input
                                        value={formData.locality || ''}
                                        onChange={(e) => updateField('locality', e.target.value)}
                                        placeholder="e.g. Andheri West"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Pincode</Label>
                                    <Input
                                        value={formData.pincode || ''}
                                        onChange={(e) => updateField('pincode', e.target.value)}
                                        placeholder="e.g. 400058"
                                        maxLength={6}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input
                                        value={formData.state || ''}
                                        onChange={(e) => updateField('state', e.target.value)}
                                        placeholder="e.g. Maharashtra"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Full Address</Label>
                                <Textarea
                                    value={formData.address || ''}
                                    onChange={(e) => updateField('address', e.target.value)}
                                    placeholder="Complete address with landmarks"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">Pricing</Label>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>{formData.listingType === 'RENT' ? 'Monthly Rent' : 'Price'} *</Label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            className="pl-9"
                                            value={formData.price || ''}
                                            onChange={(e) => updateField('price', Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                {formData.listingType === 'RENT' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Security Deposit</Label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    type="number"
                                                    className="pl-9"
                                                    value={formData.deposit || ''}
                                                    onChange={(e) => updateField('deposit', Number(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Maintenance</Label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    type="number"
                                                    className="pl-9"
                                                    value={formData.maintenance || ''}
                                                    onChange={(e) => updateField('maintenance', Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Rental Preferences */}
                        {formData.listingType === 'RENT' && (
                            <div className="space-y-4">
                                <Label className="text-lg font-semibold">Rental Preferences</Label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Preferred Tenant</Label>
                                        <Select value={formData.tenantType} onValueChange={(v) => updateField('tenantType', v as TenantType)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ANY">Anyone</SelectItem>
                                                <SelectItem value="FAMILY">Family</SelectItem>
                                                <SelectItem value="BACHELOR">Bachelor</SelectItem>
                                                <SelectItem value="COMPANY">Company</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Availability</Label>
                                        <Select value={formData.availability} onValueChange={(v) => updateField('availability', v as Availability)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                                                <SelectItem value="WITHIN15">Within 15 Days</SelectItem>
                                                <SelectItem value="WITHIN30">Within 30 Days</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Amenities */}
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">Amenities</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {amenitiesList.map((amenity) => (
                                    <div
                                        key={amenity}
                                        onClick={() => toggleAmenity(amenity)}
                                        className={cn(
                                            'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                                            formData.amenities?.includes(amenity)
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        <Checkbox checked={formData.amenities?.includes(amenity)} />
                                        <span className="text-sm">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Images Placeholder */}
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold flex items-center gap-2">
                                <ImagePlus className="w-5 h-5 text-primary" />
                                Property Images
                            </Label>
                            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30">
                                <div className="flex flex-col items-center gap-2">
                                    <ImagePlus className="w-10 h-10 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Image management coming soon (AWS S3)</p>
                                    {formData.images && formData.images.length > 0 && (
                                        <p className="text-xs text-primary">{formData.images.length} image(s) currently attached</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6 border-t border-border">
                            <Button variant="outline" onClick={() => navigate('/my-properties')}>
                                Cancel
                            </Button>
                            <Button
                                className="btn-cherry flex-1"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
