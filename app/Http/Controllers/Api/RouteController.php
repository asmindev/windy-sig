<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RouteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RouteController extends Controller
{
    public function __construct(
        private RouteService $routeService
    ) {}

    /**
     * Get route from user coordinates to shop coordinates
     * Returns main route + alternatives (total 3 routes)
     */
    public function getRoute(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_latitude' => 'required|numeric|between:-90,90',
            'user_longitude' => 'required|numeric|between:-180,180',
            'shop_latitude' => 'required|numeric|between:-90,90',
            'shop_longitude' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid coordinates provided',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $routeData = $this->routeService->getRoute(
                $request->user_latitude,
                $request->user_longitude,
                $request->shop_latitude,
                $request->shop_longitude
            );

            if (! $routeData || ! isset($routeData['main'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to calculate route',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'main' => $routeData['main'],
                    'alternatives' => $routeData['alternatives'] ?? [],
                ],
                'meta' => [
                    'total_routes' => count($routeData['all'] ?? []),
                    'has_alternatives' => ! empty($routeData['alternatives']),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error calculating route: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Find nearest shops based on user coordinates
     */
    public function findNearestShops(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:0.1|max:100',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid parameters provided',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $shops = $this->routeService->findNearestShops(
                $request->latitude,
                $request->longitude,
                $request->radius ?? 10,
                $request->limit ?? 10
            );

            return response()->json([
                'success' => true,
                'data' => $shops,
                'meta' => [
                    'total' => count($shops),
                    'radius_km' => $request->radius ?? 10,
                    'user_coordinates' => [
                        'latitude' => $request->latitude,
                        'longitude' => $request->longitude,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error finding nearest shops: '.$e->getMessage(),
            ], 500);
        }
    }
}
