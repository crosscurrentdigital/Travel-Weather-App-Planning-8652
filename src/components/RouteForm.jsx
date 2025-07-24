import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiSettings, FiClock, FiCalendar, FiNavigation } = FiIcons;

function RouteForm({ onRouteSubmit, preferences, onPreferencesChange }) {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    waypoints: ['']
  });
  const [showPreferences, setShowPreferences] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const route = {
      ...formData,
      waypoints: formData.waypoints.filter(w => w.trim() !== ''),
      id: Date.now()
    };
    onRouteSubmit(route);
  };

  const addWaypoint = () => {
    setFormData(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, '']
    }));
  };

  const removeWaypoint = (index) => {
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index)
    }));
  };

  const updateWaypoint = (index, value) => {
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.map((w, i) => i === index ? value : w)
    }));
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Plan Your Route</h2>
        <button
          onClick={() => setShowPreferences(!showPreferences)}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <SafeIcon icon={FiSettings} className="text-xl" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <SafeIcon icon={FiMapPin} className="inline mr-2" />
            Origin
          </label>
          <input
            type="text"
            value={formData.origin}
            onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter starting location"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <SafeIcon icon={FiNavigation} className="inline mr-2" />
            Destination
          </label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter destination"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <SafeIcon icon={FiCalendar} className="inline mr-2" />
            Departure Date
          </label>
          <input
            type="datetime-local"
            value={formData.departureDate}
            onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Waypoints (Optional)
            </label>
            <button
              type="button"
              onClick={addWaypoint}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Waypoint
            </button>
          </div>
          {formData.waypoints.map((waypoint, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={waypoint}
                onChange={(e) => updateWaypoint(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Waypoint ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeWaypoint(index)}
                className="text-red-600 hover:text-red-800 px-2 py-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {showPreferences && (
          <motion.div 
            className="bg-gray-50 rounded-lg p-4 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="font-medium text-gray-900 mb-3">Travel Preferences</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hours per day
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={preferences.hoursPerDay}
                onChange={(e) => onPreferencesChange(prev => ({ ...prev, hoursPerDay: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred departure time
              </label>
              <input
                type="time"
                value={preferences.preferredDepartureTime}
                onChange={(e) => onPreferencesChange(prev => ({ ...prev, preferredDepartureTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="avoidSevereWeather"
                checked={preferences.avoidSevereWeather}
                onChange={(e) => onPreferencesChange(prev => ({ ...prev, avoidSevereWeather: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="avoidSevereWeather" className="text-sm text-gray-700">
                Avoid severe weather
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="prioritizeSpeed"
                checked={preferences.prioritizeSpeed}
                onChange={(e) => onPreferencesChange(prev => ({ ...prev, prioritizeSpeed: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="prioritizeSpeed" className="text-sm text-gray-700">
                Prioritize speed over weather
              </label>
            </div>
          </motion.div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
        >
          <SafeIcon icon={FiNavigation} className="inline mr-2" />
          Get Weather Forecast
        </button>
      </form>
    </motion.div>
  );
}

export default RouteForm;