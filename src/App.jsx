import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { motion } from 'framer-motion';
import Header from './components/Header';
import RouteForm from './components/RouteForm';
import WeatherDashboard from './components/WeatherDashboard';
import TravelOptimizer from './components/TravelOptimizer';
import WeatherMap from './components/WeatherMap';
import AlertsPanel from './components/AlertsPanel';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const [route, setRoute] = useState(null);
  const [travelPreferences, setTravelPreferences] = useState({
    hoursPerDay: 8,
    maxDrivingTime: 12,
    preferredDepartureTime: '08:00',
    avoidSevereWeather: true,
    prioritizeSpeed: false
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                      <RouteForm 
                        onRouteSubmit={setRoute}
                        preferences={travelPreferences}
                        onPreferencesChange={setTravelPreferences}
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      {route && (
                        <WeatherDashboard 
                          route={route}
                          preferences={travelPreferences}
                        />
                      )}
                    </div>
                  </div>
                  
                  {route && (
                    <>
                      <TravelOptimizer 
                        route={route}
                        preferences={travelPreferences}
                      />
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <WeatherMap route={route} />
                        <AlertsPanel route={route} />
                      </div>
                    </>
                  )}
                </motion.div>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;