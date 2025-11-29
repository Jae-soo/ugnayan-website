'use client'

import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
type LeafletIconPrototype = {
  _getIconUrl?: () => string
}

delete (L.Icon.Default.prototype as LeafletIconPrototype)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Location {
  id: number
  name: string
  lat: number
  lng: number
  type: 'transportation' | 'streetlight' | 'hazard' | 'business'
  description: string
  status?: string
}

const locations: Location[] = [
  // Transportation
  { id: 1, name: 'Jeepney Terminal - Main Route', lat: 16.4023, lng: 120.5960, type: 'transportation', description: 'Routes: Irisan-City Center, Operating Hours: 5:00 AM - 9:00 PM' },
  { id: 2, name: 'Tricycle Station Alpha', lat: 16.4030, lng: 120.5965, type: 'transportation', description: '24-hour service, Local routes within Irisan' },
  { id: 3, name: 'Bus Stop - City Link', lat: 16.4010, lng: 120.5955, type: 'transportation', description: 'City bus routes, Schedule: Every 30 minutes' },
  
  // Streetlights
  { id: 4, name: 'Streetlight Post #45', lat: 16.4025, lng: 120.5970, type: 'streetlight', description: 'Main Road', status: 'Functional' },
  { id: 5, name: 'Streetlight Post #46', lat: 16.4015, lng: 120.5950, type: 'streetlight', description: 'Corner Spot', status: 'Needs Repair' },
  { id: 6, name: 'Streetlight Post #47', lat: 16.4035, lng: 120.5975, type: 'streetlight', description: 'Near School', status: 'Functional' },
  
  // Hazard Zones
  { id: 7, name: 'Landslide-Prone Area', lat: 16.4040, lng: 120.5980, type: 'hazard', description: 'High Risk - Steep slope, monitoring required', status: 'High Risk' },
  { id: 8, name: 'Flood Zone - Low Area', lat: 16.4005, lng: 120.5945, type: 'hazard', description: 'Medium Risk - Poor drainage during heavy rain', status: 'Medium Risk' },
  
  // Businesses
  { id: 9, name: 'Irisan Public Market', lat: 16.4020, lng: 120.5958, type: 'business', description: 'Fresh produce, groceries. Open: 6:00 AM - 6:00 PM' },
  { id: 10, name: 'Sari-Sari Store - Aling Maria', lat: 16.4028, lng: 120.5963, type: 'business', description: 'Neighborhood store. Open: 7:00 AM - 8:00 PM' },
  { id: 11, name: 'Carinderia - Lola\'s Kitchen', lat: 16.4012, lng: 120.5952, type: 'business', description: 'Local food. Open: 6:00 AM - 3:00 PM' },
  { id: 12, name: 'Mercury Drug Store', lat: 16.4018, lng: 120.5957, type: 'business', description: 'Pharmacy. Open: 8:00 AM - 8:00 PM' },
]

const getMarkerIcon = (type: string): L.Icon => {
  const iconColors: { [key: string]: string } = {
    transportation: 'blue',
    streetlight: 'yellow',
    hazard: 'red',
    business: 'green',
  }

  const color = iconColors[type] || 'gray'
  
  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

export default function CommunityMap(): React.JSX.Element {
  const center: [number, number] = [16.4023, 120.5960]
  const [isMounted, setIsMounted] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-4">📍 Community Map</h2>
        <p className="text-gray-600 mb-4">
          Explore transportation hubs, streetlights, hazard zones, and local businesses in Barangay Irisan.
        </p>

        {/* Main Map */}
        <div className="h-[600px] rounded-lg overflow-hidden border-2 border-green-200 mb-6">
          {isMounted && (
            <MapContainer
              key="community-map"
              center={center}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {locations.map((location) => (
              <Marker
                key={location.id}
                position={[location.lat, location.lng]}
                icon={getMarkerIcon(location.type)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-sm">{location.name}</h3>
                    <p className="text-xs text-gray-600">{location.description}</p>
                    {location.status && (
                      <p className="text-xs font-semibold mt-1 text-green-600">
                        Status: {location.status}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            </MapContainer>
          )}
        </div>

        {/* Legend */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-700 mb-2">Map Legend:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Transportation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span>Streetlights</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Hazard Zones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Businesses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transportation List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
            🚌 Transportation Hubs
          </h3>
          <ul className="space-y-3">
            {locations.filter(loc => loc.type === 'transportation').map((location) => (
              <li key={location.id} className="border-l-4 border-blue-500 pl-3 py-2">
                <h4 className="font-semibold text-gray-800">{location.name}</h4>
                <p className="text-sm text-gray-600">{location.description}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Streetlights List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-yellow-600 mb-4 flex items-center gap-2">
            💡 Streetlight Locations
          </h3>
          <ul className="space-y-3">
            {locations.filter(loc => loc.type === 'streetlight').map((location) => (
              <li key={location.id} className="border-l-4 border-yellow-500 pl-3 py-2">
                <h4 className="font-semibold text-gray-800">{location.name}</h4>
                <p className="text-sm text-gray-600">{location.description}</p>
                <p className={`text-xs font-semibold mt-1 ${location.status === 'Functional' ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {location.status}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Hazard Zones List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
            ⚠️ Hazard Zones
          </h3>
          <ul className="space-y-3">
            {locations.filter(loc => loc.type === 'hazard').map((location) => (
              <li key={location.id} className="border-l-4 border-red-500 pl-3 py-2">
                <h4 className="font-semibold text-gray-800">{location.name}</h4>
                <p className="text-sm text-gray-600">{location.description}</p>
                <p className="text-xs font-semibold text-red-600 mt-1">
                  Risk Level: {location.status}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Businesses List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
            🏪 Local Businesses
          </h3>
          <ul className="space-y-3">
            {locations.filter(loc => loc.type === 'business').map((location) => (
              <li key={location.id} className="border-l-4 border-green-500 pl-3 py-2">
                <h4 className="font-semibold text-gray-800">{location.name}</h4>
                <p className="text-sm text-gray-600">{location.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
