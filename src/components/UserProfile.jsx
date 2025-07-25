import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getUserRoutes, signOutUser, getUserPreferences, saveUserPreferences } from '../services/dbService';

const { FiUser, FiSettings, FiLogOut, FiMapPin, FiList, FiSave } = FiIcons;

function UserProfile({ user, onSignOut }) {
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    hoursPerDay: 8,
    preferredDepartureTime: '08:00',
    avoidSevereWeather: true,
    prioritizeSpeed: false
  });
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const routes = await getUserRoutes(user.id);
        setSavedRoutes(routes);
        
        const userPrefs = await getUserPreferences(user.id);
        if (userPrefs) {
          setPreferences(userPrefs);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [user]);
  
  const handleSignOut = async () => {
    try {
      await signOutUser();
      onSignOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };
  
  const handleSavePreferences = async () => {
    try {
      await saveUserPreferences(user.id, preferences);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving preferences:", err);
    }
  };
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full">
            <SafeIcon icon={FiUser} className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.email}</h2>
            <p className="text-gray-600">Account Settings</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
        >
          <SafeIcon icon={FiLogOut} />
          <span>Sign Out</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center">
              <SafeIcon icon={FiSettings} className="mr-2 text-blue-600" />
              Travel Preferences
            </h3>
            <button 
              onClick={() => isEditing ? handleSavePreferences() : setIsEditing(true)}
              className={`${isEditing ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'} px-3 py-1 rounded-full flex items-center space-x-1`}
            >
              <SafeIcon icon={isEditing ? FiSave : FiSettings} className="text-sm" />
              <span className="text-sm">{isEditing ? 'Save' : 'Edit'}</span>
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hours per day
              </label>
              <input 
                type="number" 
                min="1" 
                max="16" 
                value={preferences.hoursPerDay} 
                onChange={(e) => setPreferences(prev => ({...prev, hoursPerDay: parseInt(e.target.value)}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred departure time
              </label>
              <input 
                type="time" 
                value={preferences.preferredDepartureTime} 
                onChange={(e) => setPreferences(prev => ({...prev, preferredDepartureTime: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={!isEditing}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="avoidSevereWeather" 
                checked={preferences.avoidSevereWeather} 
                onChange={(e) => setPreferences(prev => ({...prev, avoidSevereWeather: e.target.checked}))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={!isEditing}
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
                onChange={(e) => setPreferences(prev => ({...prev, prioritizeSpeed: e.target.checked}))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={!isEditing}
              />
              <label htmlFor="prioritizeSpeed" className="text-sm text-gray-700">
                Prioritize speed over weather
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg text-gray-900 flex items-center mb-4">
            <SafeIcon icon={FiList} className="mr-2 text-blue-600" />
            Saved Routes
          </h3>
          
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : savedRoutes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No saved routes yet</p>
              <p className="text-sm text-gray-500 mt-2">Plan a trip to save routes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedRoutes.map((route) => (
                <motion.div 
                  key={route.id}
                  className="bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                        <SafeIcon icon={FiMapPin} className="text-blue-500" />
                        <span>{new Date(route.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="font-medium text-gray-900">{route.origin} to {route.destination}</div>
                      <div className="text-sm text-gray-600">
                        Departure: {new Date(route.departure_date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default UserProfile;