import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { fetchWeatherAlerts } from '../services/alertService';

const { FiAlertTriangle, FiAlertCircle, FiInfo, FiX } = FiIcons;

function AlertsPanel({ route }) {
  const { data: alerts, isLoading } = useQuery(
    ['alerts', route.id],
    () => fetchWeatherAlerts(route),
    {
      enabled: !!route,
      refetchInterval: 60000, // Refresh every minute
    }
  );

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'severe':
        return FiAlertTriangle;
      case 'moderate':
        return FiAlertCircle;
      default:
        return FiInfo;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'severe':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getAlertIconColor = (severity) => {
    switch (severity) {
      case 'severe':
        return 'text-red-600';
      case 'moderate':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Weather Alerts & Conditions</h2>
      
      {!alerts || alerts.length === 0 ? (
        <div className="text-center py-8">
          <SafeIcon icon={FiInfo} className="text-4xl text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">No active weather alerts for your route</p>
          <p className="text-sm text-gray-500 mt-2">Conditions look good for travel</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <motion.div
              key={index}
              className={`border rounded-lg p-4 ${getAlertColor(alert.severity)}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <SafeIcon 
                    icon={getAlertIcon(alert.severity)} 
                    className={`text-xl ${getAlertIconColor(alert.severity)}`}
                  />
                  <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getAlertColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3">{alert.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Affected Area: </span>
                  <span>{alert.location}</span>
                </div>
                <div>
                  <span className="font-medium">Valid Until: </span>
                  <span>{alert.validUntil}</span>
                </div>
                <div>
                  <span className="font-medium">Impact: </span>
                  <span>{alert.impact}</span>
                </div>
                <div>
                  <span className="font-medium">Recommendation: </span>
                  <span>{alert.recommendation}</span>
                </div>
              </div>
              
              {alert.roadConditions && (
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Road Conditions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Surface: </span>
                      <span>{alert.roadConditions.surface}</span>
                    </div>
                    <div>
                      <span className="font-medium">Visibility: </span>
                      <span>{alert.roadConditions.visibility}</span>
                    </div>
                    <div>
                      <span className="font-medium">Traffic: </span>
                      <span>{alert.roadConditions.traffic}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Traffic & Road Conditions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Current Status</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• I-95 North: Normal traffic flow</li>
              <li>• I-80 West: Light snow, reduced visibility</li>
              <li>• I-10 West: Clear conditions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Construction Zones</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• I-70 Colorado: Lane closures</li>
              <li>• I-40 Oklahoma: Bridge work</li>
              <li>• I-5 California: Shoulder work</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AlertsPanel;