import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const RouteControl = ({
    routeData,
    onRouteFound,
    alternativeRoutes = [],
    selectedRouteId = null,
}) => {
    const map = useMap();

    useEffect(() => {
        console.log('RouteControl - routeData:', routeData);
        console.log('RouteControl - alternativeRoutes:', alternativeRoutes);
        console.log('RouteControl - selectedRouteId:', selectedRouteId);

        if (!routeData || !routeData.geometry) {
            console.log('No route data or geometry available');
            return;
        }

        // Remove existing route layers
        map.eachLayer((layer) => {
            if (layer.options && layer.options.routeLayer) {
                map.removeLayer(layer);
            }
        });

        try {
            // Draw all alternative routes first (faded)
            if (alternativeRoutes && alternativeRoutes.length > 0) {
                alternativeRoutes.forEach((route) => {
                    const isSelected = selectedRouteId === route.id;

                    // Skip if this is the selected route (will be drawn later)
                    if (isSelected) return;

                    const coordinates = route.data.geometry.coordinates.map(
                        (coord) => [coord[1], coord[0]],
                    );

                    // Draw alternative route with faded appearance
                    L.polyline(coordinates, {
                        color: '#60a5fa', // Light blue (faded version of main route)
                        weight: 5,
                        opacity: 0.7, // Semi-transparent
                        routeLayer: true,
                        interactive: false,
                        // dashArray: '10, 10', // Dashed line to differentiate
                    }).addTo(map);
                });
            }

            // Draw the main/selected route on top
            const coordinates = routeData.geometry.coordinates.map((coord) => [
                coord[1],
                coord[0],
            ]);

            const routePolyline = L.polyline(coordinates, {
                color: '#2563eb', // Blue color for selected route
                weight: 5,
                opacity: 0.9,
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
            map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });

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
    }, [map, routeData, onRouteFound, alternativeRoutes, selectedRouteId]);

    return null;
};

export default RouteControl;
