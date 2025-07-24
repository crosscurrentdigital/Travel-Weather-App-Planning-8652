// Mock alert service - replace with actual API calls
export const fetchWeatherAlerts = async (route) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock alerts data
  const mockAlerts = [
    {
      id: 1,
      title: 'Winter Storm Warning',
      description: 'Heavy snow expected with accumulations of 6-12 inches. Winds gusting up to 40 mph creating blizzard conditions.',
      severity: 'severe',
      location: 'Denver, CO to Cheyenne, WY',
      validUntil: '2024-01-15 18:00',
      impact: 'Travel extremely dangerous',
      recommendation: 'Avoid travel if possible',
      roadConditions: {
        surface: 'Snow covered',
        visibility: 'Less than 1/4 mile',
        traffic: 'Severely impacted'
      }
    },
    {
      id: 2,
      title: 'High Wind Advisory',
      description: 'Sustained winds of 25-35 mph with gusts up to 50 mph expected.',
      severity: 'moderate',
      location: 'Kansas plains',
      validUntil: '2024-01-15 12:00',
      impact: 'Difficult driving for high profile vehicles',
      recommendation: 'Use caution, especially with trailers',
      roadConditions: {
        surface: 'Dry',
        visibility: 'Good',
        traffic: 'Normal'
      }
    },
    {
      id: 3,
      title: 'Fog Advisory',
      description: 'Dense fog reducing visibility to less than 1/4 mile in some areas.',
      severity: 'minor',
      location: 'Central Valley, CA',
      validUntil: '2024-01-15 10:00',
      impact: 'Reduced visibility',
      recommendation: 'Reduce speed and use low beam headlights',
      roadConditions: {
        surface: 'Wet',
        visibility: 'Poor',
        traffic: 'Slow'
      }
    }
  ];
  
  return mockAlerts;
};

export const fetchRoadConditions = async (route) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    construction: [
      {
        location: 'I-70 Colorado',
        type: 'Lane closure',
        impact: 'Delays up to 30 minutes',
        duration: 'Through March 2024'
      }
    ],
    closures: [],
    incidents: [
      {
        location: 'I-80 Nebraska',
        type: 'Vehicle accident',
        impact: 'Right lane blocked',
        eta: '2 hours'
      }
    ]
  };
};