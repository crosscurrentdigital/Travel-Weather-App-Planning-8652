import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import WeatherCard from './WeatherCard';
import ForecastChart from './ForecastChart';
import RouteWeatherTimeline from './RouteWeatherTimeline';
import { fetchWeatherData } from '../services/weatherService';

function WeatherDashboard({ route, preferences }) {
  const { data: weatherData, isLoading, error } = useQuery(
    ['weather', route.id],
    () => fetchWeatherData(route),
    {
      enabled: !!route,
      refetchInterval: 300000, // Refresh every 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-red-600">
          <p>Error loading weather data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Weather Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <WeatherCard
            title="Origin"
            location={route.origin}
            weather={weatherData?.origin}
          />
          <WeatherCard
            title="Destination"
            location={route.destination}
            weather={weatherData?.destination}
          />
          {weatherData?.waypoints?.length > 0 && (
            <WeatherCard
              title="Next Waypoint"
              location={weatherData.waypoints[0].location}
              weather={weatherData.waypoints[0].weather}
            />
          )}
        </div>

        <ForecastChart data={weatherData?.forecast} />
      </div>

      <RouteWeatherTimeline 
        route={route}
        weatherData={weatherData}
        preferences={preferences}
      />
    </motion.div>
  );
}

export default WeatherDashboard;