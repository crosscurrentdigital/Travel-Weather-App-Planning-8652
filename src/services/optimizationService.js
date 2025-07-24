// Mock optimization service - replace with actual algorithms
export const optimizeRoute = async (route, preferences) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Mock optimization results
  const mockOptimization = {
    routeScore: 75,
    optimalDeparture: '6:00 AM',
    estimatedDuration: '2d 14h',
    recommendedStops: [
      {
        location: 'Kansas City, MO',
        type: 'Overnight',
        reason: 'Avoid overnight driving in severe weather zone',
        eta: '6:00 PM Day 1',
        weather: 'Clear, 45°F'
      },
      {
        location: 'Denver, CO',
        type: 'Extended Rest',
        reason: 'Wait for storm system to pass',
        eta: '2:00 PM Day 2',
        weather: 'Snow ending, 38°F'
      },
      {
        location: 'Salt Lake City, UT',
        type: 'Overnight',
        reason: 'Mountain pass conditions improve by morning',
        eta: '8:00 PM Day 2',
        weather: 'Partly cloudy, 42°F'
      }
    ],
    safetyRecommendations: [
      {
        title: 'Carry Winter Emergency Kit',
        description: 'Pack blankets, food, water, and emergency supplies for mountain driving.'
      },
      {
        title: 'Check Tire Conditions',
        description: 'Ensure tires have adequate tread for snow/ice conditions.'
      },
      {
        title: 'Monitor Weather Updates',
        description: 'Check conditions hourly during the mountain crossing segments.'
      },
      {
        title: 'Fuel Strategy',
        description: 'Keep tank above half full in case of unexpected delays.'
      }
    ],
    summary: 'Your route includes challenging weather conditions in the mountain regions. The recommended departure time and stops will help you avoid the worst conditions while maintaining reasonable travel times. Consider the alternate southern route if flexibility allows.',
    tags: ['Winter Weather', 'Mountain Driving', 'Extended Journey', 'Weather Dependent']
  };
  
  return mockOptimization;
};

export const findAlternateRoutes = async (route, preferences) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: 'alt1',
      name: 'Southern Route',
      distance: '2,180 miles',
      duration: '32 hours',
      weatherScore: 85,
      description: 'Avoids mountain weather but adds 200 miles'
    },
    {
      id: 'alt2',
      name: 'Northern Route',
      distance: '2,050 miles',
      duration: '30 hours',
      weatherScore: 60,
      description: 'Shorter but higher severe weather risk'
    }
  ];
};