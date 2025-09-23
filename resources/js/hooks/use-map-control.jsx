import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Hook untuk mengontrol peta agar bisa pindah ke koordinat tertentu dengan smooth animation
 */
export function useMapControl() {
    const map = useMap();

    const flyToLocation = (latitude, longitude, zoom = 16) => {
        if (map) {
            map.flyTo([latitude, longitude], zoom, {
                animate: true,
                duration: 1.5, // durasi animasi dalam detik
            });
        }
    };

    const setView = (latitude, longitude, zoom = 16) => {
        if (map) {
            map.setView([latitude, longitude], zoom);
        }
    };

    const fitBounds = (bounds, options = {}) => {
        if (map) {
            map.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 16,
                ...options,
            });
        }
    };

    return {
        map,
        flyToLocation,
        setView,
        fitBounds,
    };
}

/**
 * Komponen untuk mengontrol peta dari luar menggunakan ref
 */
export function MapController({ userLocation, shouldFlyTo }) {
    const { flyToLocation } = useMapControl();

    useEffect(() => {
        if (
            shouldFlyTo &&
            userLocation &&
            userLocation.latitude &&
            userLocation.longitude
        ) {
            flyToLocation(userLocation.latitude, userLocation.longitude);
        }
    }, [userLocation, shouldFlyTo, flyToLocation]);

    return null;
}
