import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import L from 'leaflet';
import { Crosshair, MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
    useMapEvents,
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

// Custom marker icon for selected location
const selectedLocationIcon = new L.Icon({
    iconUrl:
        'data:image/svg+xml;base64,' +
        btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="text-red-600">
            <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" fill="#DC2626"/>
        </svg>
    `),
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

// Component to handle map click events
function MapClickHandler({ onLocationSelect }) {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            onLocationSelect({ lat, lng });
        },
    });
    return null;
}

// Component to handle getting user's current location
function LocationControl({ onLocationFound, onLocationError }) {
    const map = useMap();

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            onLocationError?.('Geolocation tidak didukung oleh browser ini');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                onLocationFound?.({ lat: latitude, lng: longitude });
                map.setView([latitude, longitude], 16);
            },
            (error) => {
                let message = 'Gagal mendapatkan lokasi';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Akses lokasi ditolak';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Lokasi tidak tersedia';
                        break;
                    case error.TIMEOUT:
                        message = 'Waktu habis saat mendapatkan lokasi';
                        break;
                }
                onLocationError?.(message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            },
        );
    };

    return (
        <div className="leaflet-top leaflet-right">
            <div className="leaflet-control leaflet-bar">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={handleGetCurrentLocation}
                    title="Gunakan lokasi saat ini"
                >
                    <Crosshair className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// Component for reverse geocoding (getting address from coordinates)
function AddressDisplay({ position, onAddressFound }) {
    const [isLoading, setIsLoading] = useState(false);
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (!position) {
            setAddress('');
            return;
        }

        setIsLoading(true);

        // Use Nominatim API for reverse geocoding
        fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`,
        )
            .then((response) => response.json())
            .then((data) => {
                if (data.display_name) {
                    setAddress(data.display_name);
                    onAddressFound?.(data.display_name);
                } else {
                    setAddress('Alamat tidak ditemukan');
                    onAddressFound?.('');
                }
            })
            .catch(() => {
                setAddress('Gagal mendapatkan alamat');
                onAddressFound?.('');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [position, onAddressFound]);

    if (!position) return null;

    return (
        <div className="mt-2 rounded-lg bg-blue-50 p-3">
            <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-blue-900">
                        Lokasi Terpilih
                    </p>
                    <p className="text-xs text-blue-700">
                        {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                    </p>
                    {isLoading ? (
                        <p className="text-xs text-blue-600">
                            Mencari alamat...
                        </p>
                    ) : (
                        address && (
                            <p className="mt-1 text-xs text-blue-600">
                                {address}
                            </p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LocationPicker({
    selectedPosition = null,
    onLocationSelect,
    onAddressFound,
    center = [-3.977, 122.515], // Kendari center
    zoom = 13,
    className = 'h-96 w-full rounded-lg',
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const mapRef = useRef();

    const handleLocationSelect = useCallback(
        (position) => {
            onLocationSelect?.(position);
        },
        [onLocationSelect],
    );

    const handleAddressFound = useCallback(
        (address) => {
            onAddressFound?.(address);
        },
        [onAddressFound],
    );

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchQuery,
                )}&limit=1&countrycodes=id`,
            );
            const data = await response.json();

            if (data.length > 0) {
                const result = data[0];
                const position = {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon),
                };

                handleLocationSelect(position);

                // Move map to found location
                if (mapRef.current) {
                    mapRef.current.setView([position.lat, position.lng], 16);
                }
            } else {
                alert('Lokasi tidak ditemukan');
            }
        } catch (error) {
            console.error('Error searching location:', error);
            alert('Gagal mencari lokasi');
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        placeholder="Cari alamat atau nama tempat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                </div>
                <Button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    size="default"
                >
                    {isSearching ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Map */}
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

                    {/* Selected location marker */}
                    {selectedPosition && (
                        <Marker
                            position={[
                                selectedPosition.lat,
                                selectedPosition.lng,
                            ]}
                            icon={selectedLocationIcon}
                            draggable={true}
                            eventHandlers={{
                                dragend: (e) => {
                                    const marker = e.target;
                                    const position = marker.getLatLng();
                                    handleLocationSelect({
                                        lat: position.lat,
                                        lng: position.lng,
                                    });
                                },
                            }}
                        >
                            <Popup>
                                <div className="text-center">
                                    <strong>Lokasi Toko</strong>
                                    <br />
                                    <small>
                                        {selectedPosition.lat.toFixed(6)},{' '}
                                        {selectedPosition.lng.toFixed(6)}
                                    </small>
                                    <br />
                                    <small className="text-gray-500">
                                        Seret untuk mengubah posisi
                                    </small>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Map click handler */}
                    <MapClickHandler onLocationSelect={handleLocationSelect} />

                    {/* Location control */}
                    <LocationControl
                        onLocationFound={handleLocationSelect}
                        onLocationError={(error) => console.error(error)}
                    />
                </MapContainer>
            </div>

            {/* Instructions */}
            <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-600">
                    <strong>Cara memilih lokasi:</strong>
                </p>
                <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                    <li>Klik pada peta untuk memilih lokasi</li>
                    <li>Gunakan pencarian untuk mencari alamat</li>
                    <li>Klik tombol 🎯 untuk menggunakan lokasi saat ini</li>
                    <li>Seret marker merah untuk menyesuaikan posisi</li>
                </ul>
            </div>

            {/* Address Display */}
            <AddressDisplay
                position={selectedPosition}
                onAddressFound={handleAddressFound}
            />
        </div>
    );
}
