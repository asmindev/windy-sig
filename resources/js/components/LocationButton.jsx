import { useGeolocation } from '@/hooks/use-geolocation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function LocationButton({ onLocationFound }) {
    const [isLocating, setIsLocating] = useState(false);
    const { getCurrentPosition, hasPosition, position } = useGeolocation();

    const handleLocateMe = async () => {
        setIsLocating(true);

        try {
            // Show loading notification
            toast.loading('Mendeteksi lokasi Anda...', {
                id: 'location-loading',
            });

            // Get user's current location
            let userPosition = position;

            if (!hasPosition) {
                userPosition = await getCurrentPosition();
            }

            if (!userPosition) {
                throw new Error(
                    'Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi telah diberikan.',
                );
            }

            // Success notification
            toast.success('Lokasi berhasil ditemukan', {
                id: 'location-loading',
                duration: 2000,
            });

            // Call callback with user position
            if (onLocationFound && typeof onLocationFound === 'function') {
                onLocationFound(userPosition);
            }
        } catch (err) {
            console.error('Error getting location:', err);

            // Show error notification
            toast.error('Gagal mendeteksi lokasi', {
                id: 'location-loading',
                description: err.message || 'Silakan coba lagi nanti.',
                duration: 4000,
            });
        } finally {
            setIsLocating(false);
        }
    };

    return (
        <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="fixed right-4 bottom-4 z-[1000] flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            title="Cari lokasi saya"
        >
            {isLocating ? (
                // Loading spinner
                <svg
                    className="h-6 w-6 animate-spin text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            ) : (
                // Location icon
                <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            )}
        </button>
    );
}
