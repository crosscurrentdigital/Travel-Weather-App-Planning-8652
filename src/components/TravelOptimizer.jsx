import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { optimizeRoute } from '../services/optimizationService';

const { FiTarget, FiClock, FiMapPin, FiTrendingUp, FiShield, FiMoon } = FiIcons;

function TravelOptimizer({ route, preferences }) {
  const { data: optimization, isLoading } = useQuery(
    ['optimization', route.id, preferences],
    () => optimizeRoute(route, preferences),
    {
      enabled: !!route,
    }
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!optimization) {
    return null;
  }

  const getRouteScore = (score) => {
    if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-100', label: 'Excellent' };
    if (score >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Good' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'Poor' };
  };

  const scoreStyle = getRouteScore(optimization.routeScore);

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Optimization</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`${scoreStyle.bg} rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-2">
            <SafeIcon icon={FiTarget} className={`text-2xl ${scoreStyle.color}`} />
            <span className={`text-2xl font-bold ${scoreStyle.color}`}>
              {optimization.routeScore}
            </span>
          </div>
          <h3 className="font-medium text-gray-900">Route Score</h3>
          <p className={`text-sm ${scoreStyle.color} font-medium`}>{scoreStyle.label}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <SafeIcon icon={FiClock} className="text-2xl text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">
              {optimization.optimalDeparture}
            </span>
          </div>
          <h3 className="font-medium text-gray-900">Optimal Departure</h3>
          <p className="text-sm text-blue-600 font-medium">Best weather window</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <SafeIcon icon={FiTrendingUp} className="text-2xl text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">
              {optimization.estimatedDuration}
            </span>
          </div>
          <h3 className="font-medium text-gray-900">Total Duration</h3>
          <p className="text-sm text-purple-600 font-medium">Including stops</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiMapPin} className="mr-2 text-blue-600" />
            Recommended Stops
          </h3>
          <div className="space-y-3">
            {optimization.recommendedStops.map((stop, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{stop.location}</span>
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiMoon} className="text-gray-500" />
                    <span className="text-sm text-gray-600">{stop.type}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{stop.reason}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>ETA: {stop.eta}</span>
                  <span>Weather: {stop.weather}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiShield} className="mr-2 text-green-600" />
            Safety Recommendations
          </h3>
          <div className="space-y-3">
            {optimization.safetyRecommendations.map((rec, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <SafeIcon icon={FiShield} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">{rec.title}</p>
                    <p className="text-sm text-green-700">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Route Analysis Summary</h3>
        <p className="text-gray-700 mb-3">{optimization.summary}</p>
        <div className="flex flex-wrap gap-2">
          {optimization.tags.map((tag, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default TravelOptimizer;