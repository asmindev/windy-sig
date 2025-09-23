import L from 'leaflet';
import { useEffect, useRef } from 'react';
import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    useMap,
} from 'react-leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const shopIcon = new L.Icon({
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const selectedShopIcon = new L.Icon({
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -34],
    shadowSize: [49, 49],
});

const userIcon = new L.Icon({
    iconUrl:
        'data:image/svg+xml;base64,' +
        btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="text-blue-600">
            <circle cx="12" cy="12" r="8" fill="#3B82F6"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
    `),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});

// Component to fit map bounds to markers
function FitBounds({ bounds }) {
    const map = useMap();

    useEffect(() => {
        if (bounds && bounds.length > 0) {
            const leafletBounds = L.latLngBounds(bounds);
            map.fitBounds(leafletBounds, { padding: [20, 20] });
        }
    }, [bounds, map]);

    return null;
}

export default function LeafletMap({
    shops = [],
    userLocation = null,
    selectedShops = [],
    plannedRoute = null,
    center = [-3.977, 122.515], // Kendari center
    zoom = 13,
    className = 'h-96 w-full rounded-lg',
    onShopClick = null,
    routePlanningMode = false,
}) {
    const mapRef = useRef();

    // Calculate bounds for all markers
    const bounds = [];
    if (userLocation) {
        bounds.push([userLocation.lat, userLocation.lng]);
    }
    shops.forEach((shop) => {
        bounds.push([shop.latitude, shop.longitude]);
    });

    // Create route coordinates if planned route exists
    const routeCoordinates =
        plannedRoute && userLocation
            ? [
                  [userLocation.lat, userLocation.lng],
                  ...plannedRoute.tour.map((shop) => [
                      shop.latitude,
                      shop.longitude,
                  ]),
              ]
            : [];

    // Helper function to check if shop is selected
    const isShopSelected = (shopId) => {
        return selectedShops.some((shop) => shop.id === shopId);
    };

    return (
        <div className={className}>
            <MapContainer
                ref={mapRef}
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User location marker */}
                {userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={userIcon}
                    >
                        <Popup>
                            <div className="text-center">
                                <strong>Lokasi Anda</strong>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Shop markers */}
                {shops.map((shop) => {
                    const isSelected = isShopSelected(shop.id);
                    const icon = isSelected ? selectedShopIcon : shopIcon;

                    return (
                        <Marker
                            key={shop.id}
                            position={[shop.latitude, shop.longitude]}
                            icon={icon}
                            eventHandlers={{
                                click: () => onShopClick && onShopClick(shop),
                            }}
                        >
                            <Popup>
                                <div className="min-w-48">
                                    <h3 className="mb-2 text-base font-semibold">
                                        {shop.name}
                                        {isSelected && (
                                            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                Terpilih
                                            </span>
                                        )}
                                    </h3>
                                    <p className="mb-2 text-sm text-gray-600">
                                        {shop.address}
                                    </p>
                                    {shop.operating_hours && (
                                        <p className="mb-2 text-sm text-gray-600">
                                            <strong>Jam:</strong>{' '}
                                            {shop.operating_hours}
                                        </p>
                                    )}
                                    {shop.distanceFromUser && (
                                        <p className="mb-2 text-sm text-gray-600">
                                            <strong>Jarak:</strong>{' '}
                                            {shop.distanceFromUser.toFixed(1)}{' '}
                                            km
                                        </p>
                                    )}
                                    {shop.products &&
                                        shop.products.length > 0 && (
                                            <p className="mb-3 text-sm text-gray-600">
                                                {shop.products.length} produk
                                                tersedia
                                            </p>
                                        )}
                                    <div className="flex gap-2">
                                        <button
                                            className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700"
                                            onClick={() =>
                                                window.open(
                                                    `/shops/${shop.id}`,
                                                    '_blank',
                                                )
                                            }
                                        >
                                            Lihat Detail
                                        </button>
                                        {routePlanningMode && (
                                            <button
                                                className={`rounded px-3 py-1 text-sm transition-colors ${
                                                    isSelected
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                                onClick={() =>
                                                    onShopClick &&
                                                    onShopClick(shop)
                                                }
                                            >
                                                {isSelected
                                                    ? 'Hapus'
                                                    : 'Tambah'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Route polyline */}
                {routeCoordinates.length > 1 && (
                    <Polyline
                        positions={routeCoordinates}
                        color="#3B82F6"
                        weight={4}
                        opacity={0.8}
                        dashArray="10, 10"
                    />
                )}

                {/* Fit bounds to all markers */}
                <FitBounds bounds={bounds} />
            </MapContainer>
        </div>
    );
}
