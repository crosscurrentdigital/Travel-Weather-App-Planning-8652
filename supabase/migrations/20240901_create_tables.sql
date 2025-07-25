-- Create tables for Travel Weather Pro app

-- Travel Routes Table
CREATE TABLE IF NOT EXISTS travel_routes_x7c9f2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date TIMESTAMP NOT NULL,
  waypoints JSONB,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE travel_routes_x7c9f2 ENABLE ROW LEVEL SECURITY;

-- Allow users to read and write their own routes
CREATE POLICY "Users can manage their own routes" 
  ON travel_routes_x7c9f2 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow unauthenticated users to create routes
CREATE POLICY "Allow anonymous users to create routes" 
  ON travel_routes_x7c9f2 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- Weather Data Table
CREATE TABLE IF NOT EXISTS weather_data_x7c9f2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES travel_routes_x7c9f2(id) ON DELETE CASCADE,
  origin_weather JSONB,
  destination_weather JSONB,
  waypoints_weather JSONB,
  forecast JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE weather_data_x7c9f2 ENABLE ROW LEVEL SECURITY;

-- Allow users to read weather data for their routes
CREATE POLICY "Users can read weather data for their routes" 
  ON weather_data_x7c9f2 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM travel_routes_x7c9f2
    WHERE travel_routes_x7c9f2.id = weather_data_x7c9f2.route_id
    AND travel_routes_x7c9f2.user_id = auth.uid()
  ));

-- Allow service role to manage weather data
CREATE POLICY "Service can manage weather data" 
  ON weather_data_x7c9f2 
  FOR ALL 
  TO service_role 
  USING (true);

-- Allow all users to create weather data
CREATE POLICY "Allow all users to create weather data" 
  ON weather_data_x7c9f2 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- Weather Alerts Table
CREATE TABLE IF NOT EXISTS weather_alerts_x7c9f2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES travel_routes_x7c9f2(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL,
  location TEXT,
  valid_until TEXT,
  impact TEXT,
  recommendation TEXT,
  road_conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE weather_alerts_x7c9f2 ENABLE ROW LEVEL SECURITY;

-- Allow users to read alerts for their routes
CREATE POLICY "Users can read alerts for their routes" 
  ON weather_alerts_x7c9f2 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM travel_routes_x7c9f2
    WHERE travel_routes_x7c9f2.id = weather_alerts_x7c9f2.route_id
    AND travel_routes_x7c9f2.user_id = auth.uid()
  ));

-- Allow service role to manage alerts
CREATE POLICY "Service can manage alerts" 
  ON weather_alerts_x7c9f2 
  FOR ALL 
  TO service_role 
  USING (true);

-- Allow all users to create alerts
CREATE POLICY "Allow all users to create alerts" 
  ON weather_alerts_x7c9f2 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- Route Optimizations Table
CREATE TABLE IF NOT EXISTS route_optimizations_x7c9f2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES travel_routes_x7c9f2(id) ON DELETE CASCADE,
  optimal_departure TEXT,
  estimated_duration TEXT,
  route_score INTEGER,
  recommended_stops JSONB,
  safety_recommendations JSONB,
  summary TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE route_optimizations_x7c9f2 ENABLE ROW LEVEL SECURITY;

-- Allow users to read optimizations for their routes
CREATE POLICY "Users can read optimizations for their routes" 
  ON route_optimizations_x7c9f2 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM travel_routes_x7c9f2
    WHERE travel_routes_x7c9f2.id = route_optimizations_x7c9f2.route_id
    AND travel_routes_x7c9f2.user_id = auth.uid()
  ));

-- Allow service role to manage optimizations
CREATE POLICY "Service can manage optimizations" 
  ON route_optimizations_x7c9f2 
  FOR ALL 
  TO service_role 
  USING (true);

-- Allow all users to create optimizations
CREATE POLICY "Allow all users to create optimizations" 
  ON route_optimizations_x7c9f2 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences_x7c9f2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_preferences_x7c9f2 ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own preferences
CREATE POLICY "Users can manage their own preferences" 
  ON user_preferences_x7c9f2 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);