import supabase from '../lib/supabase';

// Routes
export async function saveRoute(route) {
  const { data, error } = await supabase
    .from('travel_routes_x7c9f2')
    .insert([
      { 
        user_id: route.userId || null,
        origin: route.origin,
        destination: route.destination,
        departure_date: route.departureDate,
        waypoints: route.waypoints,
        preferences: route.preferences
      }
    ])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function getUserRoutes(userId) {
  const { data, error } = await supabase
    .from('travel_routes_x7c9f2')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Weather Data
export async function saveWeatherData(weatherData) {
  const { data, error } = await supabase
    .from('weather_data_x7c9f2')
    .insert([
      { 
        route_id: weatherData.routeId,
        origin_weather: weatherData.origin,
        destination_weather: weatherData.destination,
        waypoints_weather: weatherData.waypoints,
        forecast: weatherData.forecast
      }
    ])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function getWeatherData(routeId) {
  const { data, error } = await supabase
    .from('weather_data_x7c9f2')
    .select('*')
    .eq('route_id', routeId)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) throw error;
  return data[0];
}

// Weather Alerts
export async function saveWeatherAlerts(alerts) {
  const { data, error } = await supabase
    .from('weather_alerts_x7c9f2')
    .insert(
      alerts.map(alert => ({
        route_id: alert.routeId,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        location: alert.location,
        valid_until: alert.validUntil,
        impact: alert.impact,
        recommendation: alert.recommendation,
        road_conditions: alert.roadConditions
      }))
    )
    .select();
  
  if (error) throw error;
  return data;
}

export async function getWeatherAlerts(routeId) {
  const { data, error } = await supabase
    .from('weather_alerts_x7c9f2')
    .select('*')
    .eq('route_id', routeId);
  
  if (error) throw error;
  return data;
}

// User Authentication
export async function signUpUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// User Preferences
export async function saveUserPreferences(userId, preferences) {
  const { data, error } = await supabase
    .from('user_preferences_x7c9f2')
    .upsert([
      { 
        user_id: userId,
        preferences
      }
    ])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function getUserPreferences(userId) {
  const { data, error } = await supabase
    .from('user_preferences_x7c9f2')
    .select('*')
    .eq('user_id', userId)
    .limit(1);
  
  if (error) throw error;
  return data?.[0]?.preferences;
}