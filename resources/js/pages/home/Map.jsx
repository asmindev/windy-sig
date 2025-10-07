import { customIcon } from '@/components/icon';
import MapControls from '@/components/MapControls';
import RouteControl from '@/components/RouteControl';
import { MapController } from '@/hooks/use-map-control';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import {
    MapContainer,
    Marker,
    TileLayer,
    Tooltip,
    useMapEvents,
} from 'react-leaflet';
import { toast } from 'sonner';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_ZOOM } from './constants';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

/**
 * Component untuk menangani klik pada peta
 */
function MapClickHandler({ onMapClick, isLocationPickerMode }) {
    useMapEvents({
        click: (e) => {
            if (onMapClick) {
                const { lat, lng } = e.latlng;
                onMapClick(lat, lng);

                // Show toast only in location picker mode
                if (isLocationPickerMode) {
                    toast.success('Lokasi dipilih', {
                        description: `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                        duration: 3000,
                    });
                }
            }
        },
    });

    return null;
}

/**
 * Komponen Map untuk menampilkan peta dengan markers dan routes
 */
export default function Map({
    shops,
    routeData,
    onMarkerClick,
    onRouteFound,
    onMapClick,
    manualLocation,
    alternativeRoutes = [],
    selectedRouteId = null,
}) {
    const [userLocation, setUserLocation] = useState(null);
    const [shouldFlyTo, setShouldFlyTo] = useState(false);
    const [isLocationPickerMode, setIsLocationPickerMode] = useState(false);

    const handleLocationFound = (position) => {
        setUserLocation(position);
        setShouldFlyTo(true);

        // Reset shouldFlyTo setelah beberapa saat
        setTimeout(() => {
            setShouldFlyTo(false);
        }, 2000);
    };

    const handleRequestLocation = () => {
        // Request user location using geolocation API
        if ('geolocation' in navigator) {
            toast.loading('Mendapatkan lokasi...', { id: 'geolocation' });

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    handleLocationFound(newPosition);
                    toast.success('Lokasi ditemukan', { id: 'geolocation' });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast.error('Gagal mendapatkan lokasi', {
                        id: 'geolocation',
                        description:
                            'Pastikan Anda memberikan izin akses lokasi',
                    });
                },
            );
        } else {
            toast.error('Geolocation tidak didukung di browser Anda');
        }
    };

    const handleToggleLocationPicker = (enabled) => {
        setIsLocationPickerMode(enabled);

        if (enabled) {
            toast.info('Mode Pilih Lokasi Aktif', {
                description: 'Klik pada peta untuk memilih lokasi awal rute',
                duration: 4000,
            });
        } else {
            toast.success('Mode Pilih Lokasi Dinonaktifkan');
        }
    };

    return (
        <>
            <MapContainer
                center={[DEFAULT_LATITUDE, DEFAULT_LONGITUDE]}
                zoom={DEFAULT_ZOOM}
                className="absolute inset-0 h-full w-full"
                zoomControl={false}
                scrollWheelZoom={true}
                style={{
                    zIndex: 1,
                    cursor: isLocationPickerMode ? 'crosshair' : 'grab',
                }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Map Click Handler */}
                <MapClickHandler
                    onMapClick={onMapClick}
                    isLocationPickerMode={isLocationPickerMode}
                />

                {/* Map Controller untuk mengatur pergerakan peta */}
                <MapController
                    userLocation={userLocation}
                    shouldFlyTo={shouldFlyTo}
                />

                {/* Map Controls - Zoom, Location, Location Picker */}
                <MapControls
                    onLocationClick={handleRequestLocation}
                    isLocationPickerMode={isLocationPickerMode}
                    onToggleLocationPicker={handleToggleLocationPicker}
                />

                {/* Route Control for displaying route */}
                {routeData && (
                    <RouteControl
                        routeData={routeData}
                        onRouteFound={onRouteFound}
                        alternativeRoutes={alternativeRoutes}
                        selectedRouteId={selectedRouteId}
                    />
                )}

                {/* User location marker */}
                {userLocation && (
                    <Marker
                        position={[
                            userLocation.latitude,
                            userLocation.longitude,
                        ]}
                        icon={L.divIcon({
                            className: 'user-location-marker',
                            html: `
                                <div class="relative">
                                    <div class="absolute -inset-2 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
                                    <div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
                                </div>
                            `,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                        })}
                    >
                        <Tooltip
                            direction="top"
                            offset={[0, -20]}
                            permanent={false}
                            className="custom-tooltip"
                        >
                            Lokasi Anda
                        </Tooltip>
                    </Marker>
                )}

                {/* Manual location marker */}
                {manualLocation && (
                    <Marker
                        position={[
                            manualLocation.latitude,
                            manualLocation.longitude,
                        ]}
                        icon={L.divIcon({
                            className: 'manual-location-marker',
                            html: `
                                <div class="relative">
                                    <div class="absolute -inset-3 bg-green-500 rounded-full opacity-20 animate-pulse"></div>
                                    <div class="w-6 h-6 bg-green-600 border-3 border-white rounded-full shadow-lg flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                            <circle cx="12" cy="10" r="3"/>
                                        </svg>
                                    </div>
                                </div>
                            `,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12],
                        })}
                    >
                        <Tooltip
                            direction="top"
                            offset={[0, -20]}
                            permanent={true}
                            className="custom-tooltip"
                        >
                            Lokasi Manual
                        </Tooltip>
                    </Marker>
                )}

                {/* Markers untuk setiap toko dengan label nama */}
                {shops &&
                    shops.map((shop) => (
                        <Marker
                            key={shop.id}
                            position={[
                                parseFloat(shop.latitude),
                                parseFloat(shop.longitude),
                            ]}
                            eventHandlers={{
                                click: () => onMarkerClick(shop),
                            }}
                            icon={customIcon}
                        >
                            <Tooltip
                                direction="top"
                                offset={[0, -40]}
                                permanent={true}
                                className="custom-tooltip"
                            >
                                {shop.name}
                            </Tooltip>
                        </Marker>
                    ))}
            </MapContainer>
        </>
    );
}
