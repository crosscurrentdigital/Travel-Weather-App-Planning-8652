import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCloud, FiNavigation, FiSun, FiUser, FiCast } = FiIcons;

function Header({ user }) {
  return (
    <motion.header 
      className="bg-white shadow-lg border-b border-gray-200"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-lg">
              <SafeIcon icon={FiCast} className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RouteCaster</h1>
              <p className="text-gray-600">Smart weather-powered journey planning</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
              <SafeIcon icon={FiNavigation} className="text-green-600" />
              <span className="text-green-800 font-medium">Live Data</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
              <SafeIcon icon={FiSun} className="text-yellow-600" />
              <span className="text-yellow-800 font-medium">Real-time</span>
            </div>
            
            {user ? (
              <Link 
                to="/profile" 
                className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full hover:bg-blue-200 transition-colors"
              >
                <SafeIcon icon={FiUser} className="text-blue-600" />
                <span className="text-blue-800 font-medium">My Profile</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;