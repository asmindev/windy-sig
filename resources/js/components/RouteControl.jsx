import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const RouteControl = ({ routeData, onRouteFound }) => {
    const map = useMap();

    useEffect(() => {
        console.log('RouteControl - routeData:', routeData);

        if (!routeData || !routeData.geometry) {
            console.log('No route data or geometry available');
            return;
        }

        console.log('RouteControl - geometry:', routeData.geometry);
        console.log('RouteControl - startCoords:', routeData.startCoords);
        console.log('RouteControl - endCoords:', routeData.endCoords);

        // Remove existing route layers
        map.eachLayer((layer) => {
            if (layer.options && layer.options.routeLayer) {
                map.removeLayer(layer);
            }
        });

        try {
            // Create polyline from OSRM geometry
            console.log(
                'Creating polyline from coordinates:',
                routeData.geometry.coordinates,
            );

            const coordinates = routeData.geometry.coordinates.map((coord) => [
                coord[1],
                coord[0],
            ]);

            console.log('Converted coordinates:', coordinates);

            const routePolyline = L.polyline(coordinates, {
                color: '#2563eb',
                weight: 5,
                opacity: 0.8,
                routeLayer: true,
            }).addTo(map);

            console.log('Route polyline created successfully');

            // Add markers for start and end points if coordinates are provided
            if (routeData.startCoords && routeData.endCoords) {
                // Start marker (user location)
                const startMarker = L.marker(
                    [routeData.startCoords.lat, routeData.startCoords.lng],
                    {
                        icon: L.divIcon({
                            className: 'custom-start-marker',
                            html: '<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10],
                        }),
                        routeLayer: true,
                    },
                ).addTo(map);

                // End marker (shop location)
                const endMarker = L.marker(
                    [routeData.endCoords.lat, routeData.endCoords.lng],
                    {
                        icon: L.divIcon({
                            className: 'custom-end-marker',
                            html: '<div style="background-color: #dc2626; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10],
                        }),
                        routeLayer: true,
                    },
                ).addTo(map);

                startMarker.bindPopup('Lokasi Anda');
                endMarker.bindPopup('Tujuan');
            }

            // Fit map to route bounds
            map.fitBounds(routePolyline.getBounds(), { padding: [20, 20] });

            // Call callback with route info
            if (onRouteFound) {
                onRouteFound({
                    distance: routeData.distance,
                    duration: routeData.duration,
                    polyline: routePolyline,
                });
            }
        } catch (error) {
            console.error('Error creating route:', error);
        }

        // Cleanup function
        return () => {
            map.eachLayer((layer) => {
                if (layer.options && layer.options.routeLayer) {
                    map.removeLayer(layer);
                }
            });
        };
    }, [map, routeData, onRouteFound]);

    return null;
};

export default RouteControl;
