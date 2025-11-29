'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression, DivIcon as LeafletDivIcon } from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaBus, FaTaxi, FaStore, FaUtensils, FaHospital, FaShoppingCart } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

interface Location {
  id: number;
  name: string;
  type: 'jeepney' | 'tricycle' | 'bus' | 'store' | 'restaurant' | 'pharmacy' | 'market';
  coordinates: [number, number];
  description: string;
  hours?: string;
}

// Sample locations for Barangay Sumbungan (centered around a fictional Philippine location)
const publicTransportation: Location[] = [
  {
    id: 1,
    name: 'Main Jeepney Terminal',
    type: 'jeepney',
    coordinates: [14.5995, 120.9842],
    description: 'Routes to Manila City Hall, Divisoria, and Quiapo',
    hours: '5:00 AM - 10:00 PM'
  },
  {
    id: 2,
    name: 'Tricycle Station - North',
    type: 'tricycle',
    coordinates: [14.6015, 120.9852],
    description: 'Tricycle routes within barangay and nearby areas',
    hours: '24 hours'
  },
  {
    id: 3,
    name: 'Bus Stop - Commonwealth Ave',
    type: 'bus',
    coordinates: [14.5985, 120.9822],
    description: 'City buses to Quezon City and Manila',
    hours: '5:00 AM - 11:00 PM'
  },
  {
    id: 4,
    name: 'Tricycle Station - South',
    type: 'tricycle',
    coordinates: [14.5975, 120.9862],
    description: 'Routes to Market and Church',
    hours: '24 hours'
  }
];

const localBusinesses: Location[] = [
  {
    id: 5,
    name: 'Sumbungan Public Market',
    type: 'market',
    coordinates: [14.6005, 120.9835],
    description: 'Fresh produce, meat, fish, and dry goods',
    hours: '5:00 AM - 7:00 PM'
  },
  {
    id: 6,
    name: 'Mang Juan\'s Sari-Sari Store',
    type: 'store',
    coordinates: [14.5992, 120.9845],
    description: 'Groceries, snacks, and household items',
    hours: '6:00 AM - 9:00 PM'
  },
  {
    id: 7,
    name: 'Carinderia Ate Nena',
    type: 'restaurant',
    coordinates: [14.6008, 120.9828],
    description: 'Filipino home-cooked meals',
    hours: '7:00 AM - 3:00 PM'
  },
  {
    id: 8,
    name: 'Mercury Drug Store',
    type: 'pharmacy',
    coordinates: [14.5998, 120.9848],
    description: 'Pharmacy and health products',
    hours: '8:00 AM - 9:00 PM'
  },
  {
    id: 9,
    name: 'Tindahan ni Aling Rosa',
    type: 'store',
    coordinates: [14.6012, 120.9842],
    description: 'General merchandise and school supplies',
    hours: '7:00 AM - 8:00 PM'
  },
  {
    id: 10,
    name: 'BBQ Corner',
    type: 'restaurant',
    coordinates: [14.5988, 120.9838],
    description: 'Grilled BBQ, isaw, and street food',
    hours: '4:00 PM - 11:00 PM'
  }
];

// Component to set map view when it loads
function SetMapView({ center }: { center: LatLngExpression }): null {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export function BarangayMap(): React.JSX.Element {
  const center: LatLngExpression = [14.6000, 120.9842];
  const isClient = typeof window !== 'undefined';
  const customIcons = useMemo<Record<string, LeafletDivIcon> | null>(() => {
    if (!isClient) {
      return null;
    }

    const createIcon = (color: string): LeafletDivIcon =>
      L.divIcon({
        className: 'custom-icon',
        html: `
          <div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            transform: rotate(-45deg);
          ">
            <div style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              transform: rotate(45deg);
              color: white;
              font-size: 14px;
              font-weight: bold;
            "></div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      }) as LeafletDivIcon;

    return {
      jeepney: createIcon('#3b82f6'),
      tricycle: createIcon('#10b981'),
      bus: createIcon('#6366f1'),
      store: createIcon('#f59e0b'),
      restaurant: createIcon('#ef4444'),
      pharmacy: createIcon('#ec4899'),
      market: createIcon('#8b5cf6'),
    };
  }, [isClient]);

  const getIcon = (type: string): React.JSX.Element => {
    const iconMap: Record<string, React.JSX.Element> = {
      jeepney: <FaBus className="text-blue-500" />,
      tricycle: <FaTaxi className="text-green-500" />,
      bus: <FaBus className="text-indigo-500" />,
      store: <FaStore className="text-amber-500" />,
      restaurant: <FaUtensils className="text-red-500" />,
      pharmacy: <FaHospital className="text-pink-500" />,
      market: <FaShoppingCart className="text-purple-500" />
    };
    return iconMap[type] || <FaStore className="text-gray-500" />;
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      jeepney: 'Jeepney',
      tricycle: 'Tricycle',
      bus: 'Bus Stop',
      store: 'Store',
      restaurant: 'Restaurant',
      pharmacy: 'Pharmacy',
      market: 'Market'
    };
    return labels[type] || type;
  };

  const getTypeBadgeColor = (type: string): string => {
    const colors: Record<string, string> = {
      jeepney: 'bg-blue-100 text-blue-700',
      tricycle: 'bg-green-100 text-green-700',
      bus: 'bg-indigo-100 text-indigo-700',
      store: 'bg-amber-100 text-amber-700',
      restaurant: 'bg-red-100 text-red-700',
      pharmacy: 'bg-pink-100 text-pink-700',
      market: 'bg-purple-100 text-purple-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Barangay Map</CardTitle>
          <CardDescription>Loading map...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Barangay Sumbungan Map</CardTitle>
          <CardDescription>
            Find public transportation routes and local businesses in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 md:h-[500px] rounded-lg overflow-hidden border-2 border-gray-200">
            <MapContainer
              center={center}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <SetMapView center={center} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Public Transportation Markers */}
              {publicTransportation.map((location: Location) => (
                <Marker
                  key={location.id}
                  position={location.coordinates}
              icon={customIcons?.[location.type]}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-lg mb-1">{location.name}</h3>
                      <Badge className={getTypeBadgeColor(location.type)}>
                        {getTypeLabel(location.type)}
                      </Badge>
                      <p className="text-sm mt-2 text-gray-700">{location.description}</p>
                      {location.hours && (
                        <p className="text-xs mt-1 text-gray-500">Hours: {location.hours}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Local Business Markers */}
              {localBusinesses.map((location: Location) => (
                <Marker
                  key={location.id}
                  position={location.coordinates}
              icon={customIcons?.[location.type]}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-lg mb-1">{location.name}</h3>
                      <Badge className={getTypeBadgeColor(location.type)}>
                        {getTypeLabel(location.type)}
                      </Badge>
                      <p className="text-sm mt-2 text-gray-700">{location.description}</p>
                      {location.hours && (
                        <p className="text-xs mt-1 text-gray-500">Hours: {location.hours}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaBus className="text-blue-500" />
              Public Transportation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {publicTransportation.map((location: Location) => (
                <div key={location.id} className="border-l-4 border-blue-500 pl-3 py-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{location.name}</h4>
                      <p className="text-sm text-gray-600">{location.description}</p>
                      {location.hours && (
                        <p className="text-xs text-gray-500 mt-1">Hours: {location.hours}</p>
                      )}
                    </div>
                    {getIcon(location.type)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaStore className="text-amber-500" />
              Local Businesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {localBusinesses.map((location: Location) => (
                <div key={location.id} className="border-l-4 border-amber-500 pl-3 py-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{location.name}</h4>
                      <p className="text-sm text-gray-600">{location.description}</p>
                      {location.hours && (
                        <p className="text-xs text-gray-500 mt-1">Hours: {location.hours}</p>
                      )}
                    </div>
                    {getIcon(location.type)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-700">
            <strong>Map Legend:</strong> Click on any marker to view more details about the location. 
            The map shows the approximate locations of public transportation stations and local businesses 
            within Barangay Sumbungan. For exact directions or updated information, please contact the 
            barangay office.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
