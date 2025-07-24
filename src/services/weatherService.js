// Mock weather service - replace with actual API calls
export const fetchWeatherData = async (route) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock weather data
  const mockWeatherData = {
    origin: {
      temperature: 72,
      condition: 'partly cloudy',
      windSpeed: 8,
      windGusts: 12,
      humidity: 65,
      visibility: 10,
      feelsLike: 75,
      precipitation: 20
    },
    destination: {
      temperature: 68,
      condition: 'sunny',
      windSpeed: 5,
      windGusts: null,
      humidity: 45,
      visibility: 15,
      feelsLike: 70,
      precipitation: 0
    },
    waypoints: [
      {
        location: 'Chicago, IL',
        weather: {
          temperature: 55,
          condition: 'cloudy',
          windSpeed: 15,
          windGusts: 22,
          humidity: 78,
          visibility: 8,
          feelsLike: 52,
          precipitation: 45
        }
      }
    ],
    forecast: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      temperature: 70 + Math.random() * 20 - 10,
      precipitation: Math.random() * 100,
      windSpeed: 5 + Math.random() * 20,
      condition: ['sunny', 'partly cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)]
    }))
  };
  
  return mockWeatherData;
};

export const fetchHourlyForecast = async (location) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    temperature: 65 + Math.random() * 15,
    precipitation: Math.random() * 30,
    windSpeed: 5 + Math.random() * 15,
    condition: ['clear', 'partly cloudy', 'cloudy'][Math.floor(Math.random() * 3)]
  }));
};