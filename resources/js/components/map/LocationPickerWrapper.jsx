import { MapPin } from 'lucide-react';
import { lazy, Suspense } from 'react';

// Dynamically import the LocationPicker to avoid SSR issues
const LocationPicker = lazy(() => import('./LocationPicker'));

export default function LocationPickerWrapper(props) {
    return (
        <Suspense
            fallback={
                <div
                    className={
                        props.className ||
                        'flex h-96 w-full items-center justify-center rounded-lg bg-gray-100'
                    }
                >
                    <div className="text-center">
                        <MapPin className="mx-auto mb-2 h-8 w-8 animate-pulse text-gray-400" />
                        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                        <p className="text-gray-600">Memuat peta...</p>
                        <p className="text-sm text-gray-500">
                            Silakan tunggu sebentar
                        </p>
                    </div>
                </div>
            }
        >
            <LocationPicker {...props} />
        </Suspense>
    );
}
