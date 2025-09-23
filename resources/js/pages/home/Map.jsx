import { customIcon } from '@/components/icon';
import LocationButton from '@/components/LocationButton';
import RouteControl from '@/components/RouteControl';
import { MapController } from '@/hooks/use-map-control';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_ZOOM } from './constants';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

/**
 * Komponen Map untuk menampilkan peta dengan markers dan routes
 */
export default function Map({ shops, routeData, onMarkerClick, onRouteFound }) {
    const [userLocation, setUserLocation] = useState(null);
    const [shouldFlyTo, setShouldFlyTo] = useState(false);

    // Debug logging

    const handleLocationFound = (position) => {
        setUserLocation(position);
        setShouldFlyTo(true);

        // Reset shouldFlyTo setelah beberapa saat
        setTimeout(() => {
            setShouldFlyTo(false);
        }, 2000);
    };

    return (
        <>
            <MapContainer
                center={[DEFAULT_LATITUDE, DEFAULT_LONGITUDE]}
                zoom={DEFAULT_ZOOM}
                className="absolute inset-0 h-full w-full"
                zoomControl={false}
                scrollWheelZoom={true}
                style={{ zIndex: 1 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Map Controller untuk mengatur pergerakan peta */}
                <MapController
                    userLocation={userLocation}
                    shouldFlyTo={shouldFlyTo}
                />

                {/* Route Control for displaying route */}
                {routeData && (
                    <RouteControl
                        routeData={routeData}
                        onRouteFound={onRouteFound}
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

            {/* Location Button - floating di pojok kanan bawah */}
            <LocationButton onLocationFound={handleLocationFound} />
        </>
    );
}
