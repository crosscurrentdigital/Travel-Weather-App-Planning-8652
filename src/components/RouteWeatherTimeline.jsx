import React from 'react';
import { motion } from 'framer-motion';
import { format, addHours } from 'date-fns';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiMapPin, FiWind, FiAlertTriangle, FiSun, FiCloud, FiCloudRain } = FiIcons;

function RouteWeatherTimeline({ route, weatherData, preferences }) {
  const generateTimelineSegments = () => {
    if (!weatherData || !route) return [];

    const segments = [];
    const startTime = new Date(route.departureDate);
    const hoursPerDay = preferences.hoursPerDay;
    
    // Simulate route segments based on driving hours
    for (let i = 0; i < 7; i++) {
      const segmentTime = addHours(startTime, i * hoursPerDay);
      const weather = weatherData.forecast?.[i] || {
        temperature: 72,
        condition: 'partly cloudy',
        windSpeed: 8,
        precipitation: 10
      };

      segments.push({
        time: segmentTime,
        location: i === 0 ? route.origin : i === 6 ? route.destination : `Mile ${i * 100}`,
        weather,
        isOvernight: i > 0 && i % Math.ceil(24 / hoursPerDay) === 0,
        riskLevel: weather.precipitation > 70 ? 'high' : weather.windSpeed > 25 ? 'medium' : 'low'
      });
    }

    return segments;
  };

  const segments = generateTimelineSegments();

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return FiSun;
      case 'rainy':
      case 'rain':
        return FiCloudRain;
      default:
        return FiCloud;
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      default:
        return 'bg-green-100 border-green-200 text-green-800';
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Route Weather Timeline</h2>
      
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <motion.div
            key={index}
            className={`border rounded-lg p-4 ${getRiskColor(segment.riskLevel)}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiClock} className="text-gray-600" />
                <span className="font-medium">
                  {format(segment.time, 'MMM d, h:mm a')}
                </span>
                {segment.isOvernight && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Overnight Stop
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon 
                  icon={getWeatherIcon(segment.weather.condition)} 
                  className="text-xl"
                />
                <span className="font-bold text-lg">{segment.weather.temperature}°</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiMapPin} className="text-gray-500" />
              <span className="text-gray-700">{segment.location}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiWind} className="text-gray-500" />
                <span>{segment.weather.windSpeed} mph</span>
              </div>
              <div>
                <span className="text-gray-500">Precipitation: </span>
                <span>{segment.weather.precipitation}%</span>
              </div>
              <div>
                <span className="text-gray-500">Condition: </span>
                <span className="capitalize">{segment.weather.condition}</span>
              </div>
              <div>
                <span className="text-gray-500">Risk: </span>
                <span className="capitalize font-medium">{segment.riskLevel}</span>
              </div>
            </div>

            {segment.riskLevel === 'high' && (
              <div className="mt-3 flex items-center space-x-2 text-red-700">
                <SafeIcon icon={FiAlertTriangle} />
                <span className="text-sm font-medium">
                  High precipitation expected - Consider delaying departure
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default RouteWeatherTimeline;