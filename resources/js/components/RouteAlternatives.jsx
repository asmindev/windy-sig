import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, CheckCircle2, Clock, Navigation } from 'lucide-react';

export default function RouteAlternatives({
    routes,
    selectedRouteId,
    onSelectRoute,
}) {
    if (!routes || routes.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Pilihan Rute</h3>
                <Badge variant="secondary">{routes.length} Rute</Badge>
            </div>

            <ScrollArea className="h-[300px] w-full">
                <div className="space-y-2 pr-4">
                    {routes.map((route) => (
                        <RouteCard
                            key={route.id}
                            route={route}
                            isSelected={selectedRouteId === route.id}
                            onSelect={() => onSelectRoute(route)}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

function RouteCard({ route, isSelected, onSelect }) {
    const { name, type, rank, recommended, data, floyd_distance, score } =
        route;
    const { distance, duration } = data.properties;

    return (
        <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'hover:border-primary/50'
            }`}
            onClick={onSelect}
        >
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-semibold">
                                {name}
                            </CardTitle>
                            {recommended && (
                                <Badge
                                    variant="default"
                                    className="h-5 text-xs"
                                >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Direkomendasikan
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="mt-1 text-xs">
                            {type === 'osrm'
                                ? 'Rute OSRM'
                                : type === 'direct'
                                  ? 'Rute langsung'
                                  : 'Rute optimal'}
                            {floyd_distance && (
                                <span className="ml-1 text-blue-600">
                                    • FW: {floyd_distance} km
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    <Badge
                        variant={isSelected ? 'default' : 'outline'}
                        className="h-6"
                    >
                        #{rank}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Navigation className="h-4 w-4" />
                            <span className="font-medium text-foreground">
                                {distance} km
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium text-foreground">
                                ~{Math.round(duration)} menit
                            </span>
                        </div>
                    </div>

                    {isSelected ? (
                        <Button size="sm" variant="default" className="h-7">
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Dipilih
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect();
                            }}
                        >
                            Pilih
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
