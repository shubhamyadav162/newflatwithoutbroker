import { GoogleMap, MarkerF, useLoadScript } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem',
};

const options = {
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    mapTypeControl: false,
    scrollwheel: false, // Prevent accidental scrolling
};

interface PropertyMapProps {
    lat?: number;
    lng?: number;
    title?: string;
}

export function PropertyMap({ lat, lng, title }: PropertyMapProps) {
    const center = useMemo(() => ({
        lat: lat || 20.5937,
        lng: lng || 78.9629
    }), [lat, lng]);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    });

    if (loadError) return <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-xl text-destructive text-sm text-center">Error loading map</div>;
    if (!isLoaded) return <div className="w-full h-full bg-muted/20 animate-pulse rounded-xl flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

    if (!lat || !lng) return <div className="w-full h-full bg-muted/30 rounded-xl flex items-center justify-center text-muted-foreground text-sm">Location not available</div>;

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={15}
            center={center}
            options={options}
        >
            <MarkerF
                position={center}
                title={title || "Property Location"}
            />
        </GoogleMap>
    );
}
