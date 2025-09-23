import { lazy, Suspense } from 'react';

// Dynamically import the LeafletMap to avoid SSR issues
const LeafletMap = lazy(() => import('./LeafletMap'));

export default function MapWrapper(props) {
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
                        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                        <p className="text-gray-600">Memuat peta...</p>
                    </div>
                </div>
            }
        >
            <LeafletMap {...props} />
        </Suspense>
    );
}
