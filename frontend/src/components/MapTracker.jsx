import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for leaflet icons in Vite/React. We'll use L.divIcon to render custom SVG markers.
const pickupIcon = L.divIcon({
  className: 'custom-leaflet-pickup',
  html: `<div style="
    background-color: #10b981;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const dropoffIcon = L.divIcon({
  className: 'custom-leaflet-dropoff',
  html: `<div style="
    background-color: #f43f5e;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(244, 63, 94, 0.6);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const vehicleIcon = L.divIcon({
  className: 'custom-leaflet-vehicle',
  html: `<div style="
    background-color: #0ea5e9;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 15px rgba(14, 165, 233, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 10px;
    animation: pulse 1.5s infinite;
  ">🚚</div>
  <style>
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(14, 165, 233, 0); }
      100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
    }
  </style>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Helper component to adjust map bounds
const ChangeMapView = ({ pickup, dropoff, current }) => {
  const map = useMap();

  useEffect(() => {
    if (pickup && dropoff) {
      const points = [
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng]
      ];
      if (current) {
        points.push([current.lat, current.lng]);
      }
      
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [pickup, dropoff, current, map]);

  return null;
};

const MapTracker = ({ pickup, dropoff, current, routePath, height = '400px' }) => {
  // Center map in Nairobi by default
  const defaultCenter = [-1.2921, 36.8219];
  const defaultZoom = 12;

  // Compile polyline coordinates
  const polylineCoords = routePath 
    ? routePath.map(p => [p.lat, p.lng])
    : (pickup && dropoff ? [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]] : []);

  return (
    <div style={{ position: 'relative', height: height, width: '100%' }}>
      <MapContainer 
        center={pickup ? [pickup.lat, pickup.lng] : defaultCenter} 
        zoom={defaultZoom} 
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Premium dark map tiles
        />
        
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>
              <div style={{ color: '#000' }}>
                <strong>Pickup Point</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
            <Popup>
              <div style={{ color: '#000' }}>
                <strong>Dropoff Point</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {current && (
          <Marker position={[current.lat, current.lng]} icon={vehicleIcon}>
            <Popup>
              <div style={{ color: '#000' }}>
                <strong>Vehicle Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {polylineCoords.length > 0 && (
          <Polyline 
            positions={polylineCoords} 
            color="#10b981" 
            weight={4} 
            opacity={0.8}
            dashArray={routePath ? "0" : "5, 10"} // dashed if straight line, solid if optimized path
          />
        )}

        {pickup && dropoff && (
          <ChangeMapView pickup={pickup} dropoff={dropoff} current={current} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapTracker;
