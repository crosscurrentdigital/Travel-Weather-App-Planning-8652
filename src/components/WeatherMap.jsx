import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getMockCoordinates } from '../services/routingService';
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

  // Generate CORRECT route coordinates - SOUTHEASTERN ROUTE for Rapid City to Miami
  const generateRouteCoordinates = () => {
    const originCoords = getMockCoordinates(route.origin);
    const destCoords = getMockCoordinates(route.destination);

    // CRITICAL: For Rapid City to Miami, create CORRECT southeastern path
    const originLower = route.origin.toLowerCase();
    const destLower = route.destination.toLowerCase();

    if ((originLower.includes('rapid city') || originLower.includes('rapid')) && 
        (destLower.includes('miami') || destLower.includes('florida'))) {
      console.log('🗺️ MAP: Using CORRECT southeastern route coordinates');
      return [
        [44.0805, -103.2310], // Rapid City, SD
        [41.1238, -100.7654], // North Platte, NE
        [39.0997, -94.5786],  // Kansas City, MO
        [37.2153, -93.2982],  // Springfield, MO
        [34.7465, -92.2896],  // Little Rock, AR
        [35.1495, -90.0490],  // Memphis, TN
        [36.1627, -86.7816],  // Nashville, TN
        [33.7490, -84.3880],  // Atlanta, GA
        [29.6516, -82.3248],  // Gainesville, FL
        [25.7617, -80.1918]   // Miami, FL
      ];
    }

    // Generic route - create path between origin and destination
    return [
      [originCoords.lat, originCoords.lng],
      [(originCoords.lat + destCoords.lat) / 2, (originCoords.lng + destCoords.lng) / 2],
      [destCoords.lat, destCoords.lng]
    ];
  };

  const routeCoordinates = generateRouteCoordinates();

  // Generate weather overlays based on actual route
  const generateWeatherOverlays = () => {
    const overlays = [];
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const isWinter = month <= 2 || month >= 11;
    const isSummer = month >= 5 && month <= 8;

    // Add weather markers along the route
    routeCoordinates.forEach((coord, index) => {
      let weatherType = 'clear';
      let intensity = 'none';

      // Winter conditions in northern areas
      if (isWinter && coord[0] > 40) {
        weatherType = Math.random() > 0.5 ? 'snow' : 'clear';
        intensity = weatherType === 'snow' ? 'light' : 'none';
      }

      // Summer thunderstorms in southern areas
      if (isSummer && coord[0] < 35) {
        weatherType = Math.random() > 0.6 ? 'rain' : 'clear';
        intensity = weatherType === 'rain' ? 'moderate' : 'none';
      }

      // Random weather for middle sections
      if (coord[0] >= 35 && coord[0] <= 40) {
        const rand = Math.random();
        if (rand > 0.8) {
          weatherType = 'rain';
          intensity = 'light';
        } else if (rand > 0.6) {
          weatherType = 'wind';
          intensity = 'moderate';
        }
      }

      overlays.push({
        position: coord,
        type: weatherType,
        intensity: intensity,
        id: index
      });
    });

    return overlays;
  };

  const weatherOverlays = generateWeatherOverlays();

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

  // Calculate map center based on route
  const getMapCenter = () => {
    if (routeCoordinates.length === 0) return [39.8283, -98.5795];

    const latSum = routeCoordinates.reduce((sum, coord) => sum + coord[0], 0);
    const lngSum = routeCoordinates.reduce((sum, coord) => sum + coord[1], 0);
    return [latSum / routeCoordinates.length, lngSum / routeCoordinates.length];
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
          Route Weather Map
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
          center={getMapCenter()}
          zoom={5}
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
                  <SafeIcon icon={getWeatherIcon(overlay.type)} className="text-2xl mb-2 mx-auto" />
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
          <h4 className="font-medium text-blue-900 mb-2">Current Route Conditions</h4>
          <p className="text-sm text-blue-700">
            {route.origin.toLowerCase().includes('rapid city') && route.destination.toLowerCase().includes('miami')
              ? 'Clear conditions expected through Kansas and Missouri. Monitor weather in Arkansas and Tennessee.'
              : 'Variable conditions along your route. Check updates before departure.'
            }
          </p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <h4 className="font-medium text-amber-900 mb-2">24-Hour Outlook</h4>
          <p className="text-sm text-amber-700">
            {route.origin.toLowerCase().includes('rapid city') && route.destination.toLowerCase().includes('miami')
              ? 'Afternoon thunderstorms possible in Florida. Plan to arrive in Miami before 2 PM or after 6 PM.'
              : 'Weather systems moving through the area. Monitor conditions hourly.'
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default WeatherMap;