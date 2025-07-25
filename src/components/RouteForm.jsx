import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getUserRoutes, saveRoute } from '../services/dbService';

const { FiMapPin, FiLock, FiUnlock, FiClock, FiCalendar, FiNavigation, FiList, FiDollarSign, FiUsers, FiRotateCcw, FiMap, FiCast } = FiIcons;

function RouteForm({ onRouteSubmit, preferences, onPreferencesChange, user }) {
  const [activeTab, setActiveTab] = useState('plan');
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [preferencesLocked, setPreferencesLocked] = useState(false);
  const [formData, setFormData] = useState({
    origin: '',
    useCurrentLocation: false,
    destination: '',
    departureDate: '',
    departureTime: '',
    waypoints: [''],
    roundTrip: false,
    returnOption: 'retrace', // 'retrace' or 'explore'
    calculateCosts: false,
    numberOfPeople: 1
  });

  useEffect(() => {
    if (user && activeTab === 'saved') {
      loadSavedRoutes();
    }
  }, [user, activeTab]);

  const loadSavedRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const routes = await getUserRoutes(user.id);
      setSavedRoutes(routes);
    } catch (err) {
      console.error("Error loading saved routes:", err);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const route = {
      ...formData,
      waypoints: formData.waypoints.filter(w => w.trim() !== ''),
      id: Date.now(),
      preferences: preferencesLocked ? preferences : null,
      userId: user?.id
    };

    // Save route to database if user is logged in
    if (user) {
      try {
        await saveRoute(route);
        console.log("Route saved successfully");
      } catch (err) {
        console.error("Error saving route:", err);
      }
    }

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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            origin: `Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
            useCurrentLocation: true
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enter manually.");
          setFormData(prev => ({
            ...prev,
            useCurrentLocation: false
          }));
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setFormData(prev => ({
        ...prev,
        useCurrentLocation: false
      }));
    }
  };

  const loadSavedRoute = (route) => {
    setFormData({
      origin: route.origin,
      useCurrentLocation: false,
      destination: route.destination,
      departureDate: route.departure_date ? new Date(route.departure_date).toISOString().slice(0, 10) : '',
      departureTime: route.departure_date ? new Date(route.departure_date).toTimeString().slice(0, 5) : '',
      waypoints: route.waypoints || [''],
      roundTrip: false,
      returnOption: 'retrace',
      calculateCosts: false,
      numberOfPeople: 1
    });
    setActiveTab('plan');
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Tab Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'plan' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Plan Your Route
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'saved' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            disabled={!user}
          >
            <SafeIcon icon={FiList} className="inline mr-1" />
            Saved Routes
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'plan' && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Origin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiMapPin} className="inline mr-2" />
                  Origin
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={formData.origin} 
                    onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter starting location"
                    required 
                    disabled={formData.useCurrentLocation}
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className={`px-4 py-3 rounded-lg border transition-colors ${
                      formData.useCurrentLocation 
                        ? 'bg-blue-100 border-blue-300 text-blue-700' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Use current location"
                  >
                    <SafeIcon icon={FiNavigation} />
                  </button>
                </div>
                <div className="mt-2">
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={formData.useCurrentLocation}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, useCurrentLocation: e.target.checked }));
                        if (e.target.checked) getCurrentLocation();
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Use current location</span>
                  </label>
                </div>
              </div>

              {/* Destination */}
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

              {/* Departure Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiCalendar} className="inline mr-2" />
                    Departure Date
                  </label>
                  <input 
                    type="date" 
                    value={formData.departureDate} 
                    onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiClock} className="inline mr-2" />
                    Departure Time (Optional)
                  </label>
                  <input 
                    type="time" 
                    value={formData.departureTime} 
                    onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Waypoints */}
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

              {/* Round Trip Options */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="roundTrip"
                    checked={formData.roundTrip}
                    onChange={(e) => setFormData(prev => ({ ...prev, roundTrip: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="roundTrip" className="text-sm font-medium text-gray-700">
                    <SafeIcon icon={FiRotateCcw} className="inline mr-1" />
                    Round Trip
                  </label>
                </div>
                
                {formData.roundTrip && (
                  <div className="ml-6 space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="returnOption"
                        value="retrace"
                        checked={formData.returnOption === 'retrace'}
                        onChange={(e) => setFormData(prev => ({ ...prev, returnOption: e.target.value }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Retrace My Route</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="returnOption"
                        value="explore"
                        checked={formData.returnOption === 'explore'}
                        onChange={(e) => setFormData(prev => ({ ...prev, returnOption: e.target.value }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        <SafeIcon icon={FiMap} className="inline mr-1" />
                        Explore New Route
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Cost Calculator */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="calculateCosts"
                    checked={formData.calculateCosts}
                    onChange={(e) => setFormData(prev => ({ ...prev, calculateCosts: e.target.checked }))}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="calculateCosts" className="text-sm font-medium text-gray-700">
                    <SafeIcon icon={FiDollarSign} className="inline mr-1" />
                    Calculate Trip Costs
                  </label>
                </div>
                
                {formData.calculateCosts && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <SafeIcon icon={FiUsers} className="inline mr-1" />
                      Number of People
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.numberOfPeople}
                      onChange={(e) => setFormData(prev => ({ ...prev, numberOfPeople: parseInt(e.target.value) }))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Estimates gas, hotel, and food costs
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg flex flex-col items-center justify-center"
              >
                <span className="text-lg font-bold flex items-center">
                  <SafeIcon icon={FiCast} className="mr-2" />
                  RouteCast Me!
                </span>
                <span className="text-sm italic opacity-90">Get Weather Forecast and Route Directions</span>
              </button>
            </form>

            {/* Travel Preferences Section */}
            <motion.div 
              className="mt-8 bg-gray-50 rounded-lg p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Travel Preferences</h3>
                <button 
                  onClick={() => setPreferencesLocked(!preferencesLocked)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                    preferencesLocked 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <SafeIcon icon={preferencesLocked ? FiLock : FiUnlock} className="text-sm" />
                  <span className="text-sm">{preferencesLocked ? 'Locked' : 'Unlocked'}</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours per day: {preferences.hoursPerDay}h
                  </label>
                  <input 
                    type="range"
                    min="2"
                    max="14"
                    value={preferences.hoursPerDay}
                    onChange={(e) => onPreferencesChange(prev => ({ ...prev, hoursPerDay: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    disabled={preferencesLocked}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>2h</span>
                    <span>8h</span>
                    <span>14h</span>
                  </div>
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
                    disabled={preferencesLocked}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="avoidSevereWeather" 
                    checked={preferences.avoidSevereWeather} 
                    onChange={(e) => onPreferencesChange(prev => ({ ...prev, avoidSevereWeather: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={preferencesLocked}
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
                    disabled={preferencesLocked}
                  />
                  <label htmlFor="prioritizeSpeed" className="text-sm text-gray-700">
                    Prioritize speed over weather
                  </label>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {!user ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Sign in to view your saved routes</p>
              </div>
            ) : loadingRoutes ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : savedRoutes.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <SafeIcon icon={FiList} className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No saved routes yet</p>
                <p className="text-sm text-gray-500 mt-2">Plan a trip to save routes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedRoutes.map((route) => (
                  <motion.div 
                    key={route.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors cursor-pointer border border-gray-200"
                    whileHover={{ scale: 1.01 }}
                    onClick={() => loadSavedRoute(route)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                          <SafeIcon icon={FiMapPin} className="text-blue-500" />
                          <span>{new Date(route.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="font-medium text-gray-900 mb-1">
                          {route.origin} → {route.destination}
                        </div>
                        <div className="text-sm text-gray-600">
                          Departure: {new Date(route.departure_date).toLocaleString()}
                        </div>
                        {route.waypoints && route.waypoints.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Waypoints: {route.waypoints.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="text-blue-600 hover:text-blue-800">
                        <SafeIcon icon={FiNavigation} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default RouteForm;