import React from 'react';
import { motion } from 'framer-motion';
import heroImage from '../assets/hero-image.svg';

function HeroSection() {
  return (
    <motion.div 
      className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden shadow-lg mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative h-64 md:h-80 lg:h-96">
        <img 
          src={heroImage} 
          alt="RouteCaster - Smart Weather-Powered Journey Planning"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            RouteCaster
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl opacity-90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Smart Weather-Powered Journey Planning
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

export default HeroSection;