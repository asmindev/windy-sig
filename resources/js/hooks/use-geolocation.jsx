import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook for handling geolocation with real-time position tracking
 *
 * @param {Object} options - Geolocation options
 * @param {boolean} options.enableHighAccuracy - Enable high accuracy positioning
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {number} options.maximumAge - Maximum age of cached position in milliseconds
 * @param {boolean} options.watch - Enable position watching for real-time updates
 * @returns {Object} Geolocation state and methods
 */
export const useGeolocation = (options = {}) => {
    const {
        enableHighAccuracy = true,
        timeout = 10000,
        maximumAge = 60000,
        watch = false,
    } = options;

    const [position, setPosition] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'

    const watchIdRef = useRef(null);
    const isWatchingRef = useRef(false);

    // Check if geolocation is supported
    const isSupported = 'geolocation' in navigator;

    // Geolocation options
    const geoOptions = {
        enableHighAccuracy,
        timeout,
        maximumAge,
    };

    /**
     * Success callback for geolocation
     */
    const handleSuccess = useCallback((pos) => {
        const { latitude, longitude, accuracy, heading, speed } = pos.coords;

        setPosition({
            latitude,
            longitude,
            accuracy,
            heading,
            speed,
            timestamp: pos.timestamp,
        });
        setError(null);
        setLoading(false);
        setPermission('granted');
    }, []);

    /**
     * Error callback for geolocation
     */
    const handleError = useCallback(
        (err) => {
            let errorMessage = 'An unknown error occurred';
            let permissionStatus = permission;

            switch (err.code) {
                case err.PERMISSION_DENIED:
                    errorMessage = 'Location access denied by user';
                    permissionStatus = 'denied';
                    break;
                case err.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable';
                    break;
                case err.TIMEOUT:
                    errorMessage = 'Location request timed out';
                    break;
                default:
                    errorMessage = err.message || 'Failed to get location';
                    break;
            }

            setError({
                code: err.code,
                message: errorMessage,
            });
            setLoading(false);
            setPermission(permissionStatus);
        },
        [permission],
    );

    /**
     * Get current position once
     */
    const getCurrentPosition = useCallback(async () => {
        if (!isSupported) {
            setError({
                code: 0,
                message: 'Geolocation is not supported by this browser',
            });
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        handleSuccess(pos);
                        resolve({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            accuracy: pos.coords.accuracy,
                        });
                    },
                    (err) => {
                        handleError(err);
                        reject(err);
                    },
                    geoOptions,
                );
            });
        } catch (err) {
            handleError(err);
            return null;
        }
    }, [isSupported, handleSuccess, handleError, geoOptions]);

    /**
     * Start watching position changes
     */
    const startWatching = useCallback(() => {
        if (!isSupported || isWatchingRef.current) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            watchIdRef.current = navigator.geolocation.watchPosition(
                handleSuccess,
                handleError,
                geoOptions,
            );
            isWatchingRef.current = true;
        } catch (err) {
            handleError(err);
        }
    }, [isSupported, handleSuccess, handleError, geoOptions]);

    /**
     * Stop watching position changes
     */
    const stopWatching = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
            isWatchingRef.current = false;
            setLoading(false);
        }
    }, []);

    /**
     * Clear current position and error state
     */
    const clearPosition = useCallback(() => {
        setPosition(null);
        setError(null);
        setLoading(false);
    }, []);

    /**
     * Check permission status
     */
    const checkPermission = useCallback(async () => {
        if ('permissions' in navigator) {
            try {
                const result = await navigator.permissions.query({
                    name: 'geolocation',
                });
                setPermission(result.state);
                return result.state;
            } catch (err) {
                console.warn('Could not check geolocation permission:', err);
            }
        }
        return permission;
    }, [permission]);

    // Auto-start watching if enabled
    useEffect(() => {
        if (watch && isSupported) {
            startWatching();
        }

        return () => {
            if (watch) {
                stopWatching();
            }
        };
    }, [watch, isSupported, startWatching, stopWatching]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopWatching();
        };
    }, [stopWatching]);

    return {
        // State
        position,
        error,
        loading,
        permission,
        isSupported,
        isWatching: isWatchingRef.current,

        // Methods
        getCurrentPosition,
        startWatching,
        stopWatching,
        clearPosition,
        checkPermission,

        // Utilities
        hasPosition: position !== null,
        hasError: error !== null,
        isPermissionGranted: permission === 'granted',
        isPermissionDenied: permission === 'denied',
    };
};
