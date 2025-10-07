import { Button } from '@/components/ui/button';
import { Locate, MapPin, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Komponen untuk kontrol peta (zoom, lokasi, pilih lokasi manual)
 */
export default function MapControls({
    onLocationClick,
    isLocationPickerMode = false,
    onToggleLocationPicker,
}) {
    const map = useMap();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleZoomIn = () => {
        map.setZoom(map.getZoom() + 1);
    };

    const handleZoomOut = () => {
        map.setZoom(map.getZoom() - 1);
    };

    const handleMyLocation = () => {
        if (onLocationClick) {
            onLocationClick();
        }
    };

    const handleTogglePicker = () => {
        if (onToggleLocationPicker) {
            onToggleLocationPicker(!isLocationPickerMode);
        }
    };

    return (
        <div className="absolute right-4 bottom-4 z-[1000] flex flex-col gap-2">
            {/* Toggle Button */}

            {/* Expanded Controls */}

            <div className="flex flex-col gap-y-2 rounded-lg bg-white p-1 shadow-lg">
                {/* Zoom In */}
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10"
                    onClick={handleZoomIn}
                    title="Zoom In"
                >
                    <Plus className="h-5 w-5" />
                </Button>

                {/* Zoom Out */}
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                >
                    <Minus className="h-5 w-5" />
                </Button>

                {/* Divider */}
                <div className="h-px bg-gray-200" />

                {/* My Location */}
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10"
                    onClick={handleMyLocation}
                    title="Lokasi Saya"
                >
                    <Locate className="h-5 w-5 text-primary" />
                </Button>

                {/* Toggle Location Picker */}
                <Button
                    size="icon"
                    variant={isLocationPickerMode ? 'default' : 'ghost'}
                    className={`h-10 w-10 ${
                        isLocationPickerMode
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : ''
                    }`}
                    onClick={handleTogglePicker}
                    title={
                        isLocationPickerMode
                            ? 'Batalkan Pilih Lokasi'
                            : 'Pilih Lokasi Manual'
                    }
                >
                    <MapPin
                        className={`h-5 w-5 ${
                            isLocationPickerMode ? 'animate-bounce' : ''
                        }`}
                    />
                </Button>
            </div>
        </div>
    );
}
