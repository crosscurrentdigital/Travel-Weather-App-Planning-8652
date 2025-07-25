import axios from 'axios';
import supabase from '../lib/supabase';
import { saveWeatherData, getWeatherData } from './dbService';
import { getMockCoordinates } from './routingService';

const OPENWEATHER_API_KEY = 'f07be03cbf9421a85f813aa537e034ce';
const WEATHER_API_KEY = '8f569463f75b9153748975543a517d2e';

// Fetch weather data from database or API
export const fetchWeatherData = async (route) => {
  try {
    // First try to get from database
    const savedData = await getWeatherData(route.id);
    if (savedData && isDataFresh(savedData.created_at)) {
      return {
        origin: savedData.origin_weather,
        destination: savedData.destination_weather,
        waypoints: savedData.waypoints_weather,
        forecast: savedData.forecast
      };
    }

    // Get coordinates for weather lookup
    const originCoords = getMockCoordinates(route.origin);
    const destCoords = getMockCoordinates(route.destination);

    // Fetch real weather data from APIs
    const weatherData = await getRealWeatherData(route, originCoords, destCoords);

    // Save the weather data to database
    try {
      await saveWeatherData({
        routeId: route.id,
        origin: weatherData.origin,
        destination: weatherData.destination,
        waypoints: weatherData.waypoints,
        forecast: weatherData.forecast
      });
    } catch (err) {
      console.error('Error saving weather data:', err);
    }

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Get coordinates for fallback weather
    const originCoords = getMockCoordinates(route.origin);
    const destCoords = getMockCoordinates(route.destination);
    // Fallback to mock data if API fails
    return getRealisticWeatherData(route, originCoords, destCoords);
  }
};

// Check if data is fresh (less than 30 minutes old)
const isDataFresh = (timestamp) => {
  const now = new Date();
  const dataTime = new Date(timestamp);
  const diffMinutes = (now - dataTime) / (1000 * 60);
  return diffMinutes < 30;
};

// Get real weather data from APIs
const getRealWeatherData = async (route, originCoords, destCoords) => {
  try {
    // Fetch current weather for origin and destination
    const [originWeather, destWeather] = await Promise.all([
      fetchCurrentWeather(originCoords.lat, originCoords.lng),
      fetchCurrentWeather(destCoords.lat, destCoords.lng)
    ]);

    // Get weather for waypoints if any
    let waypointWeather = [];
    if (route.waypoints && route.waypoints.length > 0) {
      const waypointPromises = route.waypoints
        .filter(w => w.trim() !== '')
        .map(async (waypoint) => {
          const coords = getMockCoordinates(waypoint);
          const weather = await fetchCurrentWeather(coords.lat, coords.lng);
          return {
            location: waypoint,
            weather: weather
          };
        });
      
      waypointWeather = await Promise.all(waypointPromises);
    }

    // Fetch 7-day forecast for the route
    const forecast = await fetchWeatherForecast(originCoords.lat, originCoords.lng);

    return {
      origin: originWeather,
      destination: destWeather,
      waypoints: waypointWeather,
      forecast: forecast
    };
  } catch (error) {
    console.error('Error fetching real weather data:', error);
    // Fallback to mock data
    return getRealisticWeatherData(route, originCoords, destCoords);
  }
};

// Fetch current weather from OpenWeatherMap API
const fetchCurrentWeather = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );

    const data = response.data;
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      windSpeed: Math.round(data.wind.speed),
      windGusts: data.wind.gust ? Math.round(data.wind.gust) : null,
      humidity: data.main.humidity,
      visibility: data.visibility ? Math.round(data.visibility / 1609.34) : 10, // Convert meters to miles
      feelsLike: Math.round(data.main.feels_like),
      precipitation: 0 // Current weather doesn't include precipitation chance
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

// Fetch 7-day weather forecast
const fetchWeatherForecast = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );

    const forecasts = response.data.list;
    const dailyForecasts = [];

    // Group forecasts by day (API returns 3-hour intervals)
    const days = {};
    forecasts.forEach(forecast => {
      const date = new Date(forecast.dt * 1000).toDateString();
      if (!days[date]) {
        days[date] = [];
      }
      days[date].push(forecast);
    });

    // Process daily forecasts (up to 7 days)
    Object.keys(days).slice(0, 7).forEach(date => {
      const dayForecasts = days[date];
      const temps = dayForecasts.map(f => f.main.temp);
      const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
      const maxPrecip = Math.max(...dayForecasts.map(f => (f.rain?.['3h'] || 0) + (f.snow?.['3h'] || 0)));
      const avgWind = dayForecasts.reduce((sum, f) => sum + f.wind.speed, 0) / dayForecasts.length;
      
      dailyForecasts.push({
        date: new Date(date).toLocaleDateString(),
        temperature: Math.round(avgTemp),
        precipitation: Math.round((maxPrecip / 3) * 100), // Convert to percentage chance
        windSpeed: Math.round(avgWind),
        condition: dayForecasts[Math.floor(dayForecasts.length / 2)].weather[0].description
      });
    });

    return dailyForecasts;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    // Return fallback forecast
    return generateRealisticForecast('spring', new Date());
  }
};

// Fallback weather data generation (original function)
const getRealisticWeatherData = async (route, originCoords, destCoords) => {
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const season = getSeason(month);
  
  // Get weather for specific route: Rapid City, SD to Miami, FL
  if (route.origin.toLowerCase().includes('rapid city') && route.destination.toLowerCase().includes('miami')) {
    return getRapidCityToMiamiWeather(season, currentDate);
  }
  
  // Default weather based on coordinates and season
  return getWeatherByCoordinates(originCoords, destCoords, season, currentDate);
};

// Specific weather for Rapid City to Miami route (fallback)
const getRapidCityToMiamiWeather = (season, currentDate) => {
  const isWinter = season === 'winter';
  const isSummer = season === 'summer';
  
  return {
    origin: {
      temperature: isWinter ? 28 : isSummer ? 82 : 65,
      condition: isWinter ? 'snow' : 'partly cloudy',
      windSpeed: isWinter ? 18 : 12,
      windGusts: isWinter ? 25 : null,
      humidity: isWinter ? 45 : 55,
      visibility: isWinter ? 6 : 15,
      feelsLike: isWinter ? 18 : isSummer ? 88 : 68,
      precipitation: isWinter ? 75 : 20
    },
    destination: {
      temperature: isWinter ? 75 : isSummer ? 89 : 78,
      condition: isSummer ? 'partly cloudy' : 'sunny',
      windSpeed: 8,
      windGusts: isSummer ? 15 : null,
      humidity: isSummer ? 78 : 65,
      visibility: 12,
      feelsLike: isWinter ? 75 : isSummer ? 95 : 82,
      precipitation: isSummer ? 40 : 10
    },
    waypoints: [
      {
        location: 'Kansas City, MO',
        weather: {
          temperature: isWinter ? 35 : isSummer ? 85 : 70,
          condition: isWinter ? 'cloudy' : 'partly cloudy',
          windSpeed: 15,
          windGusts: isWinter ? 22 : null,
          humidity: 65,
          visibility: 10,
          feelsLike: isWinter ? 28 : isSummer ? 92 : 72,
          precipitation: isWinter ? 45 : 25
        }
      },
      {
        location: 'Memphis, TN',
        weather: {
          temperature: isWinter ? 45 : isSummer ? 88 : 72,
          condition: 'partly cloudy',
          windSpeed: 10,
          windGusts: null,
          humidity: 70,
          visibility: 12,
          feelsLike: isWinter ? 45 : isSummer ? 95 : 75,
          precipitation: 30
        }
      },
      {
        location: 'Atlanta, GA',
        weather: {
          temperature: isWinter ? 55 : isSummer ? 86 : 75,
          condition: isSummer ? 'thunderstorms' : 'sunny',
          windSpeed: 8,
          windGusts: isSummer ? 20 : null,
          humidity: isSummer ? 80 : 60,
          visibility: isSummer ? 8 : 15,
          feelsLike: isWinter ? 55 : isSummer ? 93 : 78,
          precipitation: isSummer ? 65 : 15
        }
      }
    ],
    forecast: generateRealisticForecast(season, currentDate)
  };
};

// Generate realistic 7-day forecast (fallback)
const generateRealisticForecast = (season, startDate) => {
  const forecast = [];
  const isWinter = season === 'winter';
  const isSummer = season === 'summer';
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Add some realistic weather variation
    const tempVariation = (Math.random() - 0.5) * 10;
    const baseTemp = isWinter ? 45 : isSummer ? 85 : 68;
    
    forecast.push({
      date: date.toLocaleDateString(),
      temperature: Math.round(baseTemp + tempVariation),
      precipitation: Math.round(Math.random() * (isSummer ? 60 : isWinter ? 40 : 30)),
      windSpeed: Math.round(8 + Math.random() * 15),
      condition: getRealisticCondition(season, Math.random())
    });
  }
  
  return forecast;
};

// Get realistic weather condition based on season
const getRealisticCondition = (season, random) => {
  switch (season) {
    case 'winter':
      if (random < 0.3) return 'snow';
      if (random < 0.6) return 'cloudy';
      return 'partly cloudy';
    case 'summer':
      if (random < 0.2) return 'thunderstorms';
      if (random < 0.4) return 'partly cloudy';
      return 'sunny';
    case 'spring':
    case 'fall':
      if (random < 0.3) return 'rainy';
      if (random < 0.6) return 'cloudy';
      return 'partly cloudy';
    default:
      return 'partly cloudy';
  }
};

// Get season from month
const getSeason = (month) => {
  if (month >= 11 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'fall';
};

// Fallback weather based on coordinates
const getWeatherByCoordinates = (originCoords, destCoords, season, currentDate) => {
  // Simple weather based on latitude (northern = colder)
  const originTemp = 75 - (originCoords.lat - 25) * 1.5;
  const destTemp = 75 - (destCoords.lat - 25) * 1.5;
  
  return {
    origin: {
      temperature: Math.round(originTemp),
      condition: 'partly cloudy',
      windSpeed: 10,
      humidity: 60,
      visibility: 12,
      feelsLike: Math.round(originTemp + 3),
      precipitation: 25
    },
    destination: {
      temperature: Math.round(destTemp),
      condition: 'sunny',
      windSpeed: 8,
      humidity: 55,
      visibility: 15,
      feelsLike: Math.round(destTemp + 2),
      precipitation: 15
    },
    waypoints: [],
    forecast: generateRealisticForecast(season, currentDate)
  };
};

export const fetchHourlyForecast = async (location) => {
  try {
    const coords = getMockCoordinates(location);
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lng}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );

    // Convert 3-hour forecasts to hourly (interpolate if needed)
    const forecasts = response.data.list.slice(0, 8); // Next 24 hours (8 * 3-hour periods)
    
    return forecasts.map((forecast, index) => ({
      hour: index * 3,
      temperature: Math.round(forecast.main.temp),
      precipitation: Math.round(((forecast.rain?.['3h'] || 0) + (forecast.snow?.['3h'] || 0)) * 10),
      windSpeed: Math.round(forecast.wind.speed),
      condition: forecast.weather[0].description
    }));
  } catch (error) {
    console.error('Error fetching hourly forecast:', error);
    // Fallback to mock data
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      temperature: 65 + Math.random() * 15,
      precipitation: Math.random() * 30,
      windSpeed: 5 + Math.random() * 15,
      condition: ['clear', 'partly cloudy', 'cloudy'][Math.floor(Math.random() * 3)]
    }));
  }
};