# Fitur Rute Alternatif

## Overview

Fitur rute alternatif memungkinkan pengguna untuk melihat dan memilih dari beberapa opsi rute ke toko yang dituju, dengan kombinasi OSRM API dan algoritma Floyd-Warshall untuk optimasi rute.

## Cara Kerja

### Alur Sistem (Updated)

1. **Mendapatkan 3 Rute dari OSRM**
    - Request ke OSRM API dengan parameter `alternatives=true`
    - Mendapatkan minimal 3 rute berbeda dari OSRM
    - Parameter `number_of_alternatives=3` untuk memastikan 3 rute

2. **Kalkulasi Floyd-Warshall untuk Setiap Rute**
    - Untuk setiap rute OSRM yang didapat:
    - Hitung jarak menggunakan Floyd-Warshall graph
    - Temukan node entry/exit terbaik dalam graph
    - Kalkulasi total distance: `user→entry + graph_distance + exit→shop`
    - Hasilkan Floyd-Warshall score untuk setiap rute

3. **Sorting Berdasarkan Floyd-Warshall Score**
    - Urutkan semua rute berdasarkan score Floyd-Warshall (terpendek dulu)
    - Rute dengan score terkecil = rute terbaik
    - Score memperhitungkan jarak actual pada road network

4. **Kembalikan Top 3 Rute**
    - Ambil 3 rute terbaik setelah sorting
    - Tambahkan ranking (1, 2, 3)
    - Mark rute pertama sebagai "Direkomendasikan"

### 1. Backend (RouteService)

#### Method `getAlternativeRoutes()`

Strategi baru:

```php
public function getAlternativeRoutes(
    float $userLatitude,
    float $userLongitude,
    float $shopLatitude,
    float $shopLongitude
): array
```

**Flow:**

1. Get OSRM alternatives (min 3 routes)
2. Calculate Floyd-Warshall distance for each route
3. Sort by Floyd-Warshall score
4. Return top 3 routes

**Return Format:**

```php
[
    [
        'id' => 'route_0',
        'name' => 'Rute Terbaik (Rekomendasi)',
        'type' => 'osrm',
        'rank' => 1,
        'recommended' => true,
        'data' => [...],
        'floyd_distance' => 5.2,  // km dari Floyd-Warshall
        'score' => 5.2             // Score untuk sorting
    ],
    // ... 2 more routes
]
```

#### Method `calculateFloydWarshallDistance()`

Menghitung jarak menggunakan Floyd-Warshall graph:

```php
private function calculateFloydWarshallDistance(
    float $userLat,
    float $userLng,
    float $shopLat,
    float $shopLng
): ?float
```

**Logic:**

1. Find best entry node (closest to user)
2. Find best exit node (closest to shop)
3. Get graph distance using Floyd-Warshall matrix
4. Calculate: `user_to_entry + graph_distance + exit_to_shop`

#### Method `getOSRMAlternatives()`

Request OSRM dengan parameter alternatif:

```php
$response = Http::timeout(10)->get($url, [
    'overview' => 'full',
    'geometries' => 'geojson',
    'steps' => 'false',
    'alternatives' => 'true',
    'number_of_alternatives' => 3,
    'continue_straight' => 'false',
]);
```

### 2. API Endpoint

**POST** `/api/routes/alternative-routes`

Request body:

```json
{
    "user_latitude": -6.2,
    "user_longitude": 106.816666,
    "shop_latitude": -6.17511,
    "shop_longitude": 106.865036
}
```

Response:

```json
{
    "success": true,
    "data": [
        {
            "id": "osrm_0",
            "name": "Rute Tercepat",
            "type": "direct",
            "rank": 1,
            "recommended": true,
            "data": {...}
        }
    ],
    "meta": {
        "total_routes": 3,
        "recommended_route_id": "osrm_0"
    }
}
```

### 3. Frontend Integration

#### Hook: `useAlternativeRoutes()`

```javascript
import { useAlternativeRoutes } from './hooks';

const {
    alternativeRoutes, // Array of routes
    selectedRouteId, // Currently selected route ID
    isLoadingAlternatives, // Loading state
    fetchAlternativeRoutes, // Fetch function
    selectRoute, // Select route function
    clearAlternativeRoutes, // Clear routes
} = useAlternativeRoutes({
    setRouteData,
    setShowRouteInfo,
});

// Fetch alternatives
await fetchAlternativeRoutes({
    userLat: -6.2,
    userLng: 106.816666,
    shopLat: -6.17511,
    shopLng: 106.865036,
});

// Select a route
selectRoute(route, userLat, userLng, shopLat, shopLng);
```

#### Component: `<RouteAlternatives />`

```jsx
import RouteAlternatives from '@/components/RouteAlternatives';

<RouteAlternatives
    routes={alternativeRoutes}
    selectedRouteId={selectedRouteId}
    onSelectRoute={(route) => handleSelectRoute(route)}
/>;
```

## User Flow

1. **Dapatkan Rute** - User klik "Rute dari Lokasi Saya"
2. **Lihat Alternatif** - Klik "Lihat Rute Alternatif"
3. **Pilih Rute** - User memilih dari 1-3 rute yang tersedia
4. **Peta Update** - Peta menampilkan rute yang dipilih

## Fitur Utama

### Automatic Recommendations

- Rute pertama selalu direkomendasikan (tercepat/terpendek)
- Badge "Direkomendasikan" untuk rute terbaik

### Smart Filtering

- Menghilangkan rute duplikat/terlalu mirip
- Maksimal 3 rute untuk menghindari pilihan berlebihan

### Route Types

- **Direct (osrm\_\*)** - Rute langsung dari OSRM
- **Optimized (floyd_optimal)** - Rute melalui toko lain dengan Floyd-Warshall

### Visual Indicators

- Rank badge (#1, #2, #3)
- Recommended badge
- Distance & duration display
- Selected route highlight

## Caching Strategy

- Alternative routes di-cache selama 1 jam
- Cache key based on coordinates hash
- Reduces OSRM API calls

## Performance

- Parallel route calculation where possible
- Maximum 3 routes to keep UI clean
- Debounced user interactions
- Toast notifications for feedback

## Error Handling

- Fallback ke single route jika alternatives gagal
- Validasi koordinat
- User-friendly error messages
- Automatic retry mechanism

## Future Enhancements

- [ ] Preferensi rute (avoid tolls, scenic route)
- [ ] Saved favorite routes
- [ ] Real-time traffic integration
- [ ] Multi-destination routing
- [ ] Route history
