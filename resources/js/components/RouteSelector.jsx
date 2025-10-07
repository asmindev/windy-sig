import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, Navigation, X } from 'lucide-react';
import { useState } from 'react';

export function RouteSelector({
    routes = [],
    selectedRouteId,
    onSelectRoute,
    onClose,
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!routes || routes.length === 0) {
        return null;
    }

    return (
        <div className="absolute bottom-10 left-4 z-[100] w-56">
            <Card className="overflow-hidden shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-background px-2 py-1.5">
                    <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        <h3 className="text-xs font-semibold">Rute</h3>
                        <Badge
                            variant="secondary"
                            className="h-3.5 px-1 text-[9px]"
                        >
                            {routes.length}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                            ) : (
                                <ChevronDown className="h-3 w-3" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={onClose}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {/* Routes List */}
                {isExpanded && (
                    <ScrollArea className="max-h-64">
                        <div className="space-y-1 p-1.5">
                            {routes.map((route, index) => {
                                const isSelected = selectedRouteId === route.id;
                                const isRecommended = route.rank === 1;

                                return (
                                    <button
                                        type="button"
                                        key={route.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log(
                                                'Route clicked:',
                                                route,
                                            );
                                            onSelectRoute(route);
                                        }}
                                        className={`w-full rounded border p-1.5 text-left transition-all ${
                                            isSelected
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-1">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-0.5 flex items-center gap-1">
                                                    <span className="text-xs font-medium">
                                                        #{route.rank}
                                                    </span>
                                                    {isRecommended && (
                                                        <Badge
                                                            variant="default"
                                                            className="h-3 px-1 text-[8px]"
                                                        >
                                                            Top
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                    <span>
                                                        📍
                                                        {route.data?.distance ||
                                                            route.osrm_distance}{' '}
                                                        km
                                                    </span>
                                                    <span>
                                                        ⏱️
                                                        {Math.round(
                                                            route.data
                                                                ?.duration || 0,
                                                        )}
                                                        '
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Rank indicator */}
                                            {isSelected && (
                                                <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </Card>
        </div>
    );
}
