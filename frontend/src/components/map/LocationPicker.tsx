import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, MarkerF, useLoadScript, Autocomplete } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Search, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const libraries: ("places")[] = ["places"];

// Using a fallback for development if key is missing, 
// though for maps to work properly a valid key is needed.
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem',
};

const center = {
    lat: 20.5937, // India center
    lng: 78.9629,
};

const options = {
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
};

interface LocationPickerProps {
    onLocationSelect: (location: {
        lat: number;
        lng: number;
        address_components?: any;
        formatted_address?: string;
    }) => void;
    initialLat?: number;
    initialLng?: number;
}

export function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const { toast } = useToast();
    const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );
    const [searchValue, setSearchValue] = useState("");
    const mapRef = useRef<google.maps.Map | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const panTo = useCallback(({ lat, lng }: { lat: number; lng: number }) => {
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(16);
    }, []);

    const handleMarkerDragEnd = useCallback(async (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setSelected({ lat, lng });

        // Reverse Geocoding
        try {
            const results = await getGeocode({ location: { lat, lng } });
            if (results && results[0]) {
                onLocationSelect({
                    lat,
                    lng,
                    address_components: results[0].address_components,
                    formatted_address: results[0].formatted_address
                });
                setSearchValue(results[0].formatted_address);
            }
        } catch (error) {
            console.error("Error fetching address", error);
        }
    }, [onLocationSelect]);

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setSelected({ lat, lng });
                    panTo({ lat, lng });

                    try {
                        const results = await getGeocode({ location: { lat, lng } });
                        if (results && results[0]) {
                            onLocationSelect({
                                lat,
                                lng,
                                address_components: results[0].address_components,
                                formatted_address: results[0].formatted_address
                            });
                            setSearchValue(results[0].formatted_address);
                        }
                    } catch (error) {
                        console.error("Error fetching address", error);
                    }
                },
                () => {
                    toast({
                        title: "Error",
                        description: "Could not get your location.",
                        variant: "destructive"
                    });
                }
            );
        }
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setSelected({ lat, lng });
                panTo({ lat, lng });
                onLocationSelect({
                    lat,
                    lng,
                    address_components: place.address_components,
                    formatted_address: place.formatted_address
                });
                setSearchValue(place.formatted_address || "");
            }
        } else {
            console.log('Autocomplete is not loaded yet!');
        }
    }

    const onLoadAutocomplete = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    if (loadError) return <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-xl text-destructive">Error loading maps</div>;
    if (!isLoaded) return <div className="w-full h-[400px] bg-muted/20 animate-pulse rounded-xl flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

    return (
        <div className="relative w-full h-full min-h-[400px] lg:min-h-[600px] flex flex-col gap-4">
            {/* Search Bar Overlay */}
            <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
                <div className="flex-1 relative shadow-lg">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-20">
                        <Search className="w-4 h-4" />
                    </div>
                    <Autocomplete
                        onLoad={onLoadAutocomplete}
                        onPlaceChanged={onPlaceChanged}
                    >
                        <Input
                            placeholder="Search for a location..."
                            className="pl-10 bg-background/95 backdrop-blur border-0 h-12 rounded-xl text-base shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </Autocomplete>
                </div>
                <Button
                    size="icon"
                    className="h-12 w-12 rounded-xl shadow-lg bg-background/95 backdrop-blur text-primary hover:bg-background border-0"
                    onClick={handleCurrentLocation}
                    title="Use Current Location"
                >
                    <Crosshair className="w-5 h-5" />
                </Button>
            </div>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={selected ? 16 : 5}
                center={selected || center}
                options={options}
                onLoad={onMapLoad}
            >
                {selected && (
                    <MarkerF
                        position={selected}
                        draggable={true}
                        onDragEnd={handleMarkerDragEnd}
                    />
                )}
            </GoogleMap>

            {!selected && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-bounce z-10">
                    Click current location or search to drop a pin
                </div>
            )}
        </div>
    );
}
