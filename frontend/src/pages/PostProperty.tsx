import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Home, Building2, Store, Users, MapPin, IndianRupee,
    Bed, Bath, Maximize, Sofa, Calendar, ArrowLeft,
    Check, Loader2, ImagePlus, AlertCircle, UploadCloud, X
} from 'lucide-react';
import { uploadImages } from '@/services/uploadService';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createProperty } from '@/services/propertyService';
import { PropertyType, ListingType, Furnishing, TenantType, Availability, PropertyFormData } from '@/types/property';
import { LocationPicker } from '@/components/map/LocationPicker';
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

export default function PostProperty() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated, user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState<Partial<PropertyFormData>>({
        type: 'APARTMENT',
        listingType: 'RENT',
        furnishing: 'SEMI',
        tenantType: 'ANY',
        availability: 'IMMEDIATE',
        bhk: 2,
        bathrooms: 1,
        images: [],
        amenities: [],
        contactPhone: '',
    });

    const updateField = <K extends keyof PropertyFormData>(field: K, value: PropertyFormData[K]) => {
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

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            toast({
                title: 'Login Required',
                description: 'Please login to post a property',
                variant: 'destructive',
            });
            navigate('/login');
            return;
        }

        // Validation
        if (!formData.title || !formData.description || !formData.price || !formData.locality || !formData.city || !formData.builtUpArea || !formData.contactPhone) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        // Phone validation for India
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.contactPhone)) {
            toast({
                title: 'Invalid Mobile Number',
                description: 'Please enter a valid 10-digit Indian mobile number starting with 6-9',
                variant: 'destructive',
            });
            return;
        }

        const propertyData: PropertyFormData = {
            ...formData as PropertyFormData,
            images: formData.images || [],
        };

        if (propertyData.images.length === 0) {
            toast({
                title: 'No Images',
                description: 'Please upload at least one image of your property',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const property = await createProperty(propertyData);
            toast({
                title: 'Property Listed!',
                description: 'Your property has been successfully listed.',
            });
            navigate(`/property/${property.id}`);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to list property. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep1 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
        >
            {/* Property Type */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold">Property Type *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {propertyTypes.map(({ value, label, icon: Icon }) => (
                        <motion.button
                            key={value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
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
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Listing Type */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold">You want to *</Label>
                <div className="flex gap-4">
                    {(['RENT', 'SELL'] as ListingType[]).map((type) => (
                        <motion.button
                            key={type}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateField('listingType', type)}
                            className={cn(
                                'flex-1 py-4 rounded-xl border-2 font-semibold transition-all',
                                formData.listingType === type
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border hover:border-primary/50'
                            )}
                        >
                            {type === 'RENT' ? 'Rent Out' : 'Sell'}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* BHK Selection */}
            {formData.type !== 'PLOT' && formData.type !== 'SHOP' && (
                <div className="space-y-4">
                    <Label className="text-lg font-semibold">BHK *</Label>
                    <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 4, 5].map((bhk) => (
                            <motion.button
                                key={bhk}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateField('bhk', bhk)}
                                className={cn(
                                    'w-14 h-14 rounded-full border-2 font-semibold transition-all',
                                    formData.bhk === bhk
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border hover:border-primary/50'
                                )}
                            >
                                {bhk}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Bathrooms */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold">Bathrooms *</Label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                        <motion.button
                            key={num}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateField('bathrooms', num)}
                            className={cn(
                                'w-14 h-14 rounded-full border-2 font-semibold transition-all',
                                formData.bathrooms === num
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border hover:border-primary/50'
                            )}
                        >
                            {num}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Furnishing */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold">Furnishing Status *</Label>
                <div className="grid grid-cols-3 gap-3">
                    {([
                        { value: 'FULLY', label: 'Fully Furnished' },
                        { value: 'SEMI', label: 'Semi Furnished' },
                        { value: 'NONE', label: 'Unfurnished' },
                    ] as { value: Furnishing; label: string }[]).map(({ value, label }) => (
                        <motion.button
                            key={value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateField('furnishing', value)}
                            className={cn(
                                'py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all',
                                formData.furnishing === value
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border hover:border-primary/50'
                            )}
                        >
                            {label}
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    const handleLocationSelect = (location: {
        lat: number;
        lng: number;
        address_components?: any;
        formatted_address?: string;
    }) => {
        // Extract address components
        let city = '';
        let state = '';
        let pincode = '';
        let locality = '';
        let route = '';
        let streetNumber = '';

        if (location.address_components) {
            location.address_components.forEach((component: any) => {
                const types = component.types;

                // In India, 'locality' is usually the city/town name
                if (types.includes('locality')) {
                    city = component.long_name;
                }

                // Neighborhood and Sublocality for 'Area'
                if (types.includes('sublocality_level_1') || types.includes('sublocality') || types.includes('neighborhood')) {
                    locality = component.long_name;
                }

                // If locality is still missing or we want more detail, check lower sublocalities
                if (!locality && (types.includes('sublocality_level_2') || types.includes('sublocality_level_3'))) {
                    locality = component.long_name;
                }

                // If city is still not found, try administrative levels but clean them
                if (!city && types.includes('administrative_area_level_2')) {
                    city = component.long_name.replace(/ Division$/i, '').replace(/ District$/i, '');
                }

                if (types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                }
                if (types.includes('postal_code')) {
                    pincode = component.long_name;
                }
                if (types.includes('route')) {
                    route = component.long_name;
                }
                if (types.includes('street_number')) {
                    streetNumber = component.long_name;
                }
            });
        }

        // Final fallback: if locality was found but city wasn't
        if (!city && locality) city = locality;

        // If city and locality are same, try to find ANY sublocality that is different
        if (locality === city || !locality) {
            const betterLocality = location.address_components?.find((c: any) =>
                c.types.includes('sublocality_level_1') ||
                c.types.includes('sublocality_level_2') ||
                c.types.includes('neighborhood')
            );
            if (betterLocality) locality = betterLocality.long_name;
        }

        // Construct a better address string
        const builtAddress = location.formatted_address || `${streetNumber} ${route}, ${locality}, ${city}, ${state} ${pincode}`;

        setFormData(prev => ({
            ...prev,
            city: city || prev.city,
            state: state || prev.state,
            pincode: pincode || prev.pincode,
            locality: locality || prev.locality,
            address: builtAddress || prev.address,
            latitude: location.lat,
            longitude: location.lng
        }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploadingImages(true);
        try {
            const urls = await uploadImages(files);
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), ...urls]
            }));
            toast({
                title: 'Success',
                description: `${urls.length} images uploaded`,
            });
        } catch (error: any) {
            toast({
                title: 'Upload Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsUploadingImages(false);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index)
        }));
    };

    const renderStep2 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid lg:grid-cols-5 gap-8 h-full"
        >
            {/* Left Column: Map (Takes more space on large screens) */}
            <div className="lg:col-span-3 order-2 lg:order-1 h-[400px] lg:h-auto min-h-[500px] rounded-2xl overflow-hidden shadow-card border border-border/50 relative">
                <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLat={20.5937} // Default to India center or user's last known
                    initialLng={78.9629}
                />
            </div>

            {/* Right Column: Form Details */}
            <div className="lg:col-span-2 order-1 lg:order-2 space-y-6 overflow-y-auto lg:pr-2 custom-scrollbar">

                {/* Location Details Section */}
                <div className="space-y-4">
                    <Label className="text-xl font-heading font-bold flex items-center gap-2 text-primary">
                        <MapPin className="w-6 h-6" />
                        Where is it located?
                    </Label>
                    <p className="text-sm text-muted-foreground -mt-2">
                        Drop a pin on the map or enter details manually.
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label>City *</Label>
                            <Input
                                placeholder="City"
                                value={formData.city || ''}
                                onChange={(e) => updateField('city', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Locality / Area *</Label>
                            <Input
                                placeholder="e.g. Andheri West"
                                value={formData.locality || ''}
                                onChange={(e) => updateField('locality', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Pincode</Label>
                                <Input
                                    placeholder="e.g. 400058"
                                    maxLength={6}
                                    value={formData.pincode || ''}
                                    onChange={(e) => updateField('pincode', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Input
                                    placeholder="State"
                                    value={formData.state || ''}
                                    onChange={(e) => updateField('state', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Full Address</Label>
                            <Textarea
                                placeholder="Enter complete address..."
                                value={formData.address || ''}
                                onChange={(e) => updateField('address', e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-border/50 my-6" />

                {/* Pricing Details Section */}
                <div className="space-y-4">
                    <Label className="text-xl font-heading font-bold flex items-center gap-2 text-primary">
                        <IndianRupee className="w-6 h-6" />
                        Pricing & Specs
                    </Label>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{formData.listingType === 'RENT' ? 'Monthly Rent' : 'Expected Price'} *</Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    placeholder={formData.listingType === 'RENT' ? '25000' : '5000000'}
                                    className="pl-9"
                                    value={formData.price || ''}
                                    onChange={(e) => updateField('price', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {formData.listingType === 'RENT' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Deposit</Label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="50000"
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
                                            placeholder="2000"
                                            className="pl-9"
                                            value={formData.maintenance || ''}
                                            onChange={(e) => updateField('maintenance', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Built-up Area (sq ft) *</Label>
                                <div className="relative">
                                    <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        placeholder="1200"
                                        className="pl-9"
                                        value={formData.builtUpArea || ''}
                                        onChange={(e) => updateField('builtUpArea', Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            {formData.listingType === 'RENT' && (
                                <div className="space-y-2">
                                    <Label>Availability</Label>
                                    <Select value={formData.availability} onValueChange={(value) => updateField('availability', value as Availability)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="When?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                                            <SelectItem value="WITHIN15">15 Days</SelectItem>
                                            <SelectItem value="WITHIN30">30 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            {/* Title & Description */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-lg font-semibold">Property Title *</Label>
                    <Input
                        placeholder="e.g. Spacious 2BHK with Balcony in Andheri West"
                        value={formData.title || ''}
                        onChange={(e) => updateField('title', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Make it descriptive and attractive</p>
                </div>

                <div className="space-y-2">
                    <Label className="text-lg font-semibold">Description *</Label>
                    <Textarea
                        placeholder="Describe your property in detail - include nearby landmarks, special features, reason for listing, etc."
                        value={formData.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        rows={5}
                    />
                    <p className="text-xs text-muted-foreground">Minimum 20 characters</p>
                </div>

                <div className="space-y-2">
                    <Label className="text-lg font-semibold flex items-center gap-2">
                        Mobile Number (WhatsApp) *
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">+91</span>
                        <Input
                            type="tel"
                            placeholder="9876543210"
                            className="pl-12"
                            maxLength={10}
                            value={formData.contactPhone || ''}
                            onChange={(e) => updateField('contactPhone', e.target.value.replace(/\D/g, ''))}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Tenants will contact you on this number. WhatsApp preferred.</p>
                </div>
            </div>

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

            {/* Images Section */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold flex items-center gap-2">
                    <ImagePlus className="w-5 h-5 text-primary" />
                    Property Images *
                </Label>

                {/* Upload Area */}
                <div className="relative border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/30 hover:bg-muted/50 transition-all group cursor-pointer overflow-hidden">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isUploadingImages}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-3">
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                            isUploadingImages ? "bg-primary/20" : "bg-primary/10 group-hover:scale-110"
                        )}>
                            {isUploadingImages ? (
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            ) : (
                                <UploadCloud className="w-8 h-8 text-primary" />
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">
                                {isUploadingImages ? 'Uploading Assets...' : 'Click or Drag to Upload Images'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                JPG, PNG or WebP (Max 5MB each)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preview Grid */}
                {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                        {formData.images.map((url, index) => (
                            <motion.div
                                key={url}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group relative aspect-square rounded-xl overflow-hidden border border-border shadow-sm bg-muted"
                            >
                                <img src={url} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white transform translate-y-2 group-hover:translate-y-0"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                                        COVER
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4 max-w-2xl text-center py-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                <Home className="w-10 h-10 text-primary" />
                            </div>
                            <h1 className="font-heading text-3xl font-bold">Post Your Property for Free</h1>
                            <p className="text-muted-foreground">
                                Login to list your property and connect with genuine buyers/tenants directly.
                            </p>
                            <Button className="btn-cherry" size="lg" onClick={() => navigate('/login')}>
                                Login to Continue
                            </Button>
                        </motion.div>
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
                <div className={cn(
                    "container mx-auto px-4",
                    step === 2 ? "max-w-7xl" : "max-w-3xl"
                )}>
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Button
                            variant="ghost"
                            className="mb-4"
                            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {step > 1 ? 'Back' : 'Go Back'}
                        </Button>

                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-px bg-primary" />
                            <span className="text-primary text-sm font-medium uppercase tracking-wider">Step {step} of 3</span>
                        </div>
                        <h1 className="font-heading text-3xl font-bold">Post Your Property</h1>
                        <p className="text-muted-foreground">Fill in the details to list your property for free</p>
                    </motion.div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {['Property Info', 'Location & Price', 'Details & Photos'].map((label, i) => (
                                <span
                                    key={label}
                                    className={cn(
                                        'text-xs font-medium',
                                        i + 1 <= step ? 'text-primary' : 'text-muted-foreground'
                                    )}
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-card rounded-2xl shadow-card border border-border p-6 md:p-8">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-border">
                            {step > 1 && (
                                <Button variant="outline" onClick={() => setStep(step - 1)}>
                                    Previous
                                </Button>
                            )}
                            <div className="ml-auto">
                                {step < 3 ? (
                                    <Button className="btn-cherry" onClick={() => setStep(step + 1)}>
                                        Next Step
                                    </Button>
                                ) : (
                                    <Button
                                        className="btn-cherry"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Listing Property...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                List Property (Free)
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div >
            </main >

            <Footer />
        </div >
    );
}
