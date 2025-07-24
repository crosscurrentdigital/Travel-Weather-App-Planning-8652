import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

const { FiMap, FiWind, FiCloud, FiDroplet } = FiIcons;

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function WeatherMap({ route }) {
  const mapRef = useRef();

  // Mock route coordinates for demonstration
  const routeCoordinates = [
    [40.7128, -74.0060], // New York (origin)
    [41.8781, -87.6298], // Chicago (waypoint)
    [39.7392, -104.9903], // Denver (waypoint)
    [34.0522, -118.2437], // Los Angeles (destination)
  ];

  const weatherOverlays = [
    { position: [40.7128, -74.0060], type: 'rain', intensity: 'light' },
    { position: [41.8781, -87.6298], type: 'clear', intensity: 'none' },
    { position: [39.7392, -104.9903], type: 'snow', intensity: 'moderate' },
    { position: [34.0522, -118.2437], type: 'clear', intensity: 'none' },
  ];

  const getWeatherColor = (type, intensity) => {
    switch (type) {
      case 'rain':
        return intensity === 'heavy' ? '#1e40af' : '#3b82f6';
      case 'snow':
        return intensity === 'heavy' ? '#6b7280' : '#9ca3af';
      case 'wind':
        return '#10b981';
      default:
        return '#fbbf24';
    }
  };

  const getWeatherIcon = (type) => {
    switch (type) {
      case 'rain':
        return FiDroplet;
      case 'snow':
        return FiCloud;
      case 'wind':
        return FiWind;
      default:
        return FiCloud;
    }
  };

  const createWeatherIcon = (type, intensity) => {
    return L.divIcon({
      html: `<div style="background-color: ${getWeatherColor(type, intensity)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
      iconSize: [20, 20],
      className: 'weather-marker'
    });
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <SafeIcon icon={FiMap} className="mr-2 text-blue-600" />
          Weather Radar
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            Rain
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            Snow
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Wind
          </div>
        </div>
      </div>

      <div className="h-96 rounded-lg overflow-hidden border">
        <MapContainer
          center={[39.8283, -98.5795]} // Center of US
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Route line */}
          <Polyline
            positions={routeCoordinates}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />

          {/* Weather markers */}
          {weatherOverlays.map((overlay, index) => (
            <Marker
              key={index}
              position={overlay.position}
              icon={createWeatherIcon(overlay.type, overlay.intensity)}
            >
              <Popup>
                <div className="text-center">
                  <SafeIcon 
                    icon={getWeatherIcon(overlay.type)} 
                    className="text-2xl mb-2 mx-auto"
                  />
                  <p className="font-medium capitalize">{overlay.type}</p>
                  <p className="text-sm text-gray-600 capitalize">{overlay.intensity}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 mb-2">Current Conditions</h4>
          <p className="text-sm text-blue-700">
            Light rain expected in the Northeast. Clear skies in the Midwest and West Coast.
          </p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <h4 className="font-medium text-amber-900 mb-2">24-Hour Outlook</h4>
          <p className="text-sm text-amber-700">
            Snow developing in the Rockies. Winds picking up in the Plains states.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default WeatherMap;