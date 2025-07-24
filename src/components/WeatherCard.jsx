import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSun, FiCloud, FiCloudRain, FiCloudSnow, FiWind, FiDroplet, FiEye, FiThermometer } = FiIcons;

function WeatherCard({ title, location, weather }) {
  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return FiSun;
      case 'cloudy':
      case 'partly cloudy':
        return FiCloud;
      case 'rainy':
      case 'rain':
        return FiCloudRain;
      case 'snowy':
      case 'snow':
        return FiCloudSnow;
      default:
        return FiCloud;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return 'text-yellow-500';
      case 'cloudy':
      case 'partly cloudy':
        return 'text-gray-500';
      case 'rainy':
      case 'rain':
        return 'text-blue-500';
      case 'snowy':
      case 'snow':
        return 'text-blue-300';
      default:
        return 'text-gray-500';
    }
  };

  if (!weather) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-lg font-semibold text-gray-900 truncate">{location}</p>
        </div>
        <SafeIcon 
          icon={getWeatherIcon(weather.condition)} 
          className={`text-3xl ${getConditionColor(weather.condition)}`}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">{weather.temperature}°</span>
          <span className="text-sm text-gray-600 capitalize">{weather.condition}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center">
            <SafeIcon icon={FiWind} className="mr-1" />
            {weather.windSpeed} mph
          </div>
          <div className="flex items-center">
            <SafeIcon icon={FiDroplet} className="mr-1" />
            {weather.humidity}%
          </div>
          <div className="flex items-center">
            <SafeIcon icon={FiEye} className="mr-1" />
            {weather.visibility} mi
          </div>
          <div className="flex items-center">
            <SafeIcon icon={FiThermometer} className="mr-1" />
            {weather.feelsLike}°
          </div>
        </div>

        {weather.windGusts && (
          <div className="text-xs text-amber-600 font-medium">
            Gusts: {weather.windGusts} mph
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default WeatherCard;