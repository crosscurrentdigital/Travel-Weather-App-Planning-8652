import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { motion } from 'framer-motion';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import RouteForm from './components/RouteForm';
import WeatherDashboard from './components/WeatherDashboard';
import TravelOptimizer from './components/TravelOptimizer';
import WeatherMap from './components/WeatherMap';
import AlertsPanel from './components/AlertsPanel';
import AuthForm from './components/AuthForm';
import UserProfile from './components/UserProfile';
import { getCurrentUser } from './services/dbService';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const [route, setRoute] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [travelPreferences, setTravelPreferences] = useState({
    hoursPerDay: 8,
    maxDrivingTime: 12,
    preferredDepartureTime: '08:00',
    avoidSevereWeather: true,
    prioritizeSpeed: false
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Error checking auth state:", err);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const handleRouteSubmit = (newRoute) => {
    // Add user ID to route if user is logged in
    if (user) {
      newRoute.userId = user.id;
    }
    setRoute(newRoute);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse text-blue-600 text-xl">Loading RouteCaster...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Header user={user} />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {/* Hero Section */}
                  <HeroSection />
                  
                  {!user && !route && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-1">
                        <AuthForm onSuccess={setUser} />
                      </div>
                      <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to RouteCaster</h2>
                          <p className="text-gray-700 mb-4">
                            Plan your journey with confidence using our advanced weather forecasting and route optimization powered by real-time data.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h3 className="font-semibold text-blue-900 mb-2">Smart Weather Integration</h3>
                              <p className="text-sm text-blue-700">Get real-time weather updates and forecasts along your entire route.</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                              <h3 className="font-semibold text-green-900 mb-2">Cost Estimation</h3>
                              <p className="text-sm text-green-700">Calculate trip costs including gas, hotels, and food for your group.</p>
                            </div>
                          </div>
                          <p className="text-gray-700 mt-4">
                            Sign in to save your routes and preferences, or continue as a guest to get started right away.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user && !route && (
                    <UserProfile 
                      user={user} 
                      onSignOut={() => setUser(null)}
                    />
                  )}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                      <RouteForm 
                        onRouteSubmit={handleRouteSubmit} 
                        preferences={travelPreferences}
                        onPreferencesChange={setTravelPreferences}
                        user={user}
                      />
                    </div>
                    <div className="lg:col-span-2">
                      {route && (
                        <WeatherDashboard route={route} preferences={travelPreferences} />
                      )}
                    </div>
                  </div>
                  
                  {route && (
                    <>
                      <TravelOptimizer route={route} preferences={travelPreferences} />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <WeatherMap route={route} />
                        <AlertsPanel route={route} />
                      </div>
                    </>
                  )}
                </motion.div>
              } />
              
              <Route path="/profile" element={
                user ? (
                  <UserProfile 
                    user={user} 
                    onSignOut={() => setUser(null)}
                  />
                ) : (
                  <AuthForm onSuccess={setUser} />
                )
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;