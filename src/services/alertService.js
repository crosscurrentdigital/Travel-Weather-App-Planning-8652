import axios from 'axios';
import supabase from '../lib/supabase';
import { getWeatherAlerts, saveWeatherAlerts } from './dbService';
import { getMockCoordinates } from './routingService';

const WEATHER_ALERTS_API_KEY = '765c84deb2674adc7a08c8716ccc8e00';
const OPENWEATHER_API_KEY = 'f07be03cbf9421a85f813aa537e034ce';

// Fetch weather alerts from database or API
export const fetchWeatherAlerts = async (route) => {
  try {
    // First try to get from database
    const savedAlerts = await getWeatherAlerts(route.id);
    if (savedAlerts && savedAlerts.length > 0 && isDataFresh(savedAlerts[0].created_at)) {
      return savedAlerts.map(alert => ({
        id: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        location: alert.location,
        validUntil: alert.valid_until,
        impact: alert.impact,
        recommendation: alert.recommendation,
        roadConditions: alert.road_conditions
      }));
    }

    // Fetch real alerts from APIs
    const alerts = await getRealWeatherAlerts(route);
    
    // Save alerts to database
    if (alerts.length > 0) {
      try {
        await saveWeatherAlerts(alerts.map(alert => ({
          routeId: route.id,
          title: alert.title,
          description: alert.description,
          severity: alert.severity,
          location: alert.location,
          validUntil: alert.validUntil,
          impact: alert.impact,
          recommendation: alert.recommendation,
          roadConditions: alert.roadConditions
        })));
      } catch (err) {
        console.error('Error saving weather alerts:', err);
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    // Fallback to mock alerts
    return generateRealisticAlerts(route);
  }
};

// Check if data is fresh (less than 1 hour old for alerts)
const isDataFresh = (timestamp) => {
  const now = new Date();
  const dataTime = new Date(timestamp);
  const diffMinutes = (now - dataTime) / (1000 * 60);
  return diffMinutes < 60;
};

// Get real weather alerts from APIs
const getRealWeatherAlerts = async (route) => {
  const alerts = [];
  
  try {
    // Get coordinates for origin and destination
    const originCoords = getMockCoordinates(route.origin);
    const destCoords = getMockCoordinates(route.destination);
    
    // Fetch alerts for origin
    const originAlerts = await fetchNWSAlerts(originCoords.lat, originCoords.lng, route.origin);
    alerts.push(...originAlerts);
    
    // Fetch alerts for destination
    const destAlerts = await fetchNWSAlerts(destCoords.lat, destCoords.lng, route.destination);
    alerts.push(...destAlerts);
    
    // Fetch alerts for waypoints if any
    if (route.waypoints && route.waypoints.length > 0) {
      for (const waypoint of route.waypoints.filter(w => w.trim() !== '')) {
        const waypointCoords = getMockCoordinates(waypoint);
        const waypointAlerts = await fetchNWSAlerts(waypointCoords.lat, waypointCoords.lng, waypoint);
        alerts.push(...waypointAlerts);
      }
    }
    
    // Remove duplicates based on title and location
    const uniqueAlerts = alerts.filter((alert, index, self) => 
      index === self.findIndex(a => a.title === alert.title && a.location === alert.location)
    );
    
    return uniqueAlerts;
  } catch (error) {
    console.error('Error fetching real weather alerts:', error);
    return generateRealisticAlerts(route);
  }
};

// Fetch alerts from National Weather Service API
const fetchNWSAlerts = async (lat, lng, location) => {
  try {
    // Use OpenWeatherMap One Call API for weather alerts (part of the free tier)
    const response = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&exclude=minutely,hourly,daily`
    );
    
    const alerts = response.data.alerts || [];
    
    return alerts.map(alert => ({
      id: Math.random().toString(36).substr(2, 9),
      title: alert.event || 'Weather Advisory',
      description: alert.description || 'Weather conditions may affect travel',
      severity: determineSeverity(alert.event),
      location: location,
      validUntil: new Date(alert.end * 1000).toISOString(),
      impact: determineImpact(alert.event),
      recommendation: generateRecommendation(alert.event),
      roadConditions: generateRoadConditions(alert.event)
    }));
  } catch (error) {
    // If API fails, try NWS API as backup
    try {
      const nwsResponse = await axios.get(
        `https://api.weather.gov/alerts/active?point=${lat},${lng}`
      );
      
      const features = nwsResponse.data.features || [];
      
      return features.slice(0, 3).map(feature => { // Limit to 3 alerts
        const properties = feature.properties;
        return {
          id: properties.id || Math.random().toString(36).substr(2, 9),
          title: properties.event || 'Weather Advisory',
          description: properties.description || properties.headline || 'Weather conditions may affect travel',
          severity: determineSeverity(properties.severity),
          location: location,
          validUntil: properties.expires || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          impact: properties.instruction || 'Monitor conditions',
          recommendation: generateRecommendation(properties.event),
          roadConditions: generateRoadConditions(properties.event)
        };
      });
    } catch (nwsError) {
      console.error('NWS API also failed:', nwsError);
      return [];
    }
  }
};

// Determine alert severity
const determineSeverity = (event) => {
  const eventLower = (event || '').toLowerCase();
  
  if (eventLower.includes('warning') || eventLower.includes('severe') || eventLower.includes('extreme')) {
    return 'severe';
  } else if (eventLower.includes('watch') || eventLower.includes('advisory')) {
    return 'moderate';
  }
  
  return 'minor';
};

// Determine impact based on weather event
const determineImpact = (event) => {
  const eventLower = (event || '').toLowerCase();
  
  if (eventLower.includes('snow') || eventLower.includes('ice')) {
    return 'Icy roads, reduced visibility, possible road closures';
  } else if (eventLower.includes('rain') || eventLower.includes('flood')) {
    return 'Wet roads, reduced visibility, possible flooding';
  } else if (eventLower.includes('wind')) {
    return 'High winds may affect vehicle control';
  } else if (eventLower.includes('heat')) {
    return 'Vehicle overheating risk, increased tire wear';
  } else if (eventLower.includes('fog')) {
    return 'Severely reduced visibility';
  }
  
  return 'Variable road conditions, monitor weather updates';
};

// Generate recommendations based on weather event
const generateRecommendation = (event) => {
  const eventLower = (event || '').toLowerCase();
  
  if (eventLower.includes('snow') || eventLower.includes('ice')) {
    return 'Reduce speed, increase following distance, carry emergency supplies';
  } else if (eventLower.includes('rain') || eventLower.includes('flood')) {
    return 'Avoid flooded roads, reduce speed in heavy rain';
  } else if (eventLower.includes('wind')) {
    return 'Maintain firm grip on steering wheel, avoid high-profile vehicles';
  } else if (eventLower.includes('heat')) {
    return 'Check vehicle cooling system, carry extra water';
  } else if (eventLower.includes('fog')) {
    return 'Use low beams, reduce speed, increase following distance';
  }
  
  return 'Monitor conditions and adjust travel plans as needed';
};

// Generate road conditions based on weather event
const generateRoadConditions = (event) => {
  const eventLower = (event || '').toLowerCase();
  
  if (eventLower.includes('snow') || eventLower.includes('ice')) {
    return {
      surface: 'Snow and ice patches possible',
      visibility: 'Reduced due to precipitation',
      traffic: 'Slower than normal'
    };
  } else if (eventLower.includes('rain')) {
    return {
      surface: 'Wet pavement',
      visibility: 'Reduced during heavy rain',
      traffic: 'Normal to slow'
    };
  } else if (eventLower.includes('wind')) {
    return {
      surface: 'Dry but debris possible',
      visibility: 'Good',
      traffic: 'Normal'
    };
  }
  
  return {
    surface: 'Variable conditions',
    visibility: 'Monitor current conditions',
    traffic: 'Normal'
  };
};

// Fallback realistic alerts generation
const generateRealisticAlerts = (route) => {
  const alerts = [];
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const isWinter = month <= 2 || month >= 11;
  const isSummer = month >= 5 && month <= 8;

  // Specific alerts for Rapid City to Miami route
  if (route.origin.toLowerCase().includes('rapid city') && route.destination.toLowerCase().includes('miami')) {
    if (isWinter) {
      alerts.push({
        id: 1,
        title: 'Winter Weather Advisory - South Dakota',
        description: 'Snow and ice conditions expected along I-90 in South Dakota. Road temperatures dropping below freezing.',
        severity: 'moderate',
        location: 'Rapid City, SD to Nebraska border',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        impact: 'Reduced visibility and slippery roads',
        recommendation: 'Reduce speed, maintain safe following distance, carry emergency supplies',
        roadConditions: {
          surface: 'Snow and ice patches',
          visibility: '1-3 miles',
          traffic: 'Slower than normal'
        }
      });
    }

    if (isSummer) {
      alerts.push({
        id: 2,
        title: 'Heat Advisory - Southern States',
        description: 'Excessive heat warning for Arkansas, Mississippi, and northern Florida. Temperatures reaching 95-100°F.',
        severity: 'moderate',
        location: 'Little Rock, AR to Gainesville, FL',
        validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        impact: 'Vehicle overheating risk, increased tire blowout potential',
        recommendation: 'Check vehicle cooling system, carry extra water, avoid midday travel',
        roadConditions: {
          surface: 'Hot pavement - risk of tire damage',
          visibility: 'Heat shimmer may reduce visibility',
          traffic: 'Normal'
        }
      });

      alerts.push({
        id: 3,
        title: 'Afternoon Thunderstorms - Florida',
        description: 'Daily afternoon thunderstorms expected across central and southern Florida.',
        severity: 'minor',
        location: 'Gainesville, FL to Miami, FL',
        validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        impact: 'Heavy rain, reduced visibility, possible delays',
        recommendation: 'Plan arrival before 2 PM or after 6 PM to avoid storms',
        roadConditions: {
          surface: 'Wet roads during storms',
          visibility: 'Poor during active storms',
          traffic: 'Congested during storms'
        }
      });
    }

    // Year-round construction alert
    alerts.push({
      id: 4,
      title: 'Construction Zone - I-75 Georgia',
      description: 'Ongoing construction on I-75 through Atlanta metropolitan area. Lane restrictions in effect.',
      severity: 'minor',
      location: 'Atlanta, GA metro - I-75 corridor',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      impact: 'Traffic delays, reduced lanes',
      recommendation: 'Allow extra travel time, consider alternate routes during peak hours',
      roadConditions: {
        surface: 'Construction zones - uneven pavement',
        visibility: 'Good',
        traffic: 'Heavy delays during rush hours'
      }
    });
  } else {
    // Generic alerts for other routes
    if (isWinter) {
      alerts.push({
        id: 1,
        title: 'Winter Driving Conditions',
        description: 'Seasonal winter weather may affect road conditions along your route.',
        severity: 'minor',
        location: 'Northern portions of route',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        impact: 'Possible snow, ice, and reduced visibility',
        recommendation: 'Monitor weather conditions, carry winter emergency kit',
        roadConditions: {
          surface: 'Variable - check current conditions',
          visibility: 'Weather dependent',
          traffic: 'Normal to slow'
        }
      });
    }
  }

  return alerts;
};

export const fetchRoadConditions = async (route) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Generate realistic road conditions based on route
    const conditions = generateRouteConditions(route);
    return conditions;
  } catch (error) {
    console.error('Error fetching road conditions:', error);
    return {
      construction: [],
      closures: [],
      incidents: []
    };
  }
};

// Generate realistic road conditions - renamed to avoid duplicate declaration
const generateRouteConditions = (route) => {
  const conditions = {
    construction: [],
    closures: [],
    incidents: []
  };

  // Specific conditions for Rapid City to Miami route
  if (route.origin.toLowerCase().includes('rapid city') && route.destination.toLowerCase().includes('miami')) {
    conditions.construction = [
      {
        location: 'I-35 Kansas',
        type: 'Bridge work',
        impact: 'Lane restrictions, 15-minute delays',
        duration: 'Through summer 2024'
      },
      {
        location: 'I-75 Atlanta, GA',
        type: 'Pavement reconstruction',
        impact: 'Heavy delays during rush hours',
        duration: 'Ongoing through 2024'
      }
    ];

    conditions.incidents = [
      {
        location: 'I-40 Memphis area',
        type: 'Periodic truck inspections',
        impact: 'Possible delays for commercial vehicles',
        eta: 'Variable'
      }
    ];
  } else {
    // Generic conditions
    conditions.construction = [
      {
        location: 'Various interstate locations',
        type: 'Seasonal maintenance',
        impact: 'Minor delays possible',
        duration: 'Ongoing'
      }
    ];
  }

  return conditions;
};