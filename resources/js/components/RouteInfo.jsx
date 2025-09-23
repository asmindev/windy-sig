import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Navigation, X } from 'lucide-react';

const RouteInfo = ({ routeData, onClose }) => {
    console.log('RouteInfo received data:', routeData); // Debug log

    const formatDuration = (value) => {
        // Handle both seconds and minutes
        let seconds;
        if (typeof value === 'number') {
            // If it's already in seconds or if it's a small number, treat as minutes
            seconds = value > 100 ? value : value * 60;
        } else {
            seconds = parseFloat(value) * 60; // Assume minutes if string
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours} jam ${minutes} menit`;
        }
        return `${minutes} menit`;
    };

    const formatDistance = (value) => {
        // Handle both meters and kilometers
        let meters;
        if (typeof value === 'number') {
            // If it's a small number, likely kilometers; if large, likely meters
            meters = value > 100 ? value : value * 1000;
        } else {
            meters = parseFloat(value) * 1000; // Assume kilometers if string
        }

        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} km`;
        }
        return `${Math.round(meters)} m`;
    };

    if (!routeData) {
        console.log('RouteInfo: No route data provided');
        return null;
    }

    // Extract distance and duration from various possible locations
    const distance = routeData.distance || routeData.properties?.distance || 0;
    const duration = routeData.duration || routeData.properties?.duration || 0;

    console.log('RouteInfo: distance =', distance, 'duration =', duration); // Debug log

    return (
        <div className="absolute top-20 left-4 z-[1000] w-80 max-w-[calc(100vw-2rem)]">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg">Informasi Rute</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">
                                <strong>Jarak:</strong>{' '}
                                {formatDistance(distance)}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="text-sm">
                                <strong>Estimasi Waktu:</strong>{' '}
                                {formatDuration(duration)}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Navigation className="h-4 w-4 text-purple-600" />
                            <span className="text-sm">
                                <strong>Metode:</strong> Berkendara
                            </span>
                        </div>

                        {routeData.shopPath &&
                            routeData.shopPath.length > 1 && (
                                <div className="mt-4">
                                    <p className="mb-2 text-sm font-medium">
                                        Rute melalui toko:
                                    </p>
                                    <div className="space-y-1">
                                        {routeData.shopPath.map(
                                            (shop, index) => (
                                                <div
                                                    key={shop.id}
                                                    className="flex items-center text-xs text-gray-600"
                                                >
                                                    <div
                                                        className={`mr-2 h-2 w-2 rounded-full ${
                                                            index === 0
                                                                ? 'bg-green-500'
                                                                : index ===
                                                                    routeData
                                                                        .shopPath
                                                                        .length -
                                                                        1
                                                                  ? 'bg-red-500'
                                                                  : 'bg-blue-500'
                                                        }`}
                                                    />
                                                    {shop.name}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RouteInfo;
