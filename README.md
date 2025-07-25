# RouteCaster - Smart Weather-Powered Journey Planning

RouteCaster is an intelligent travel planning application that combines real-time weather data with route optimization to help you plan the perfect journey.

## Features

### 🗺️ Smart Route Planning
- **Real Route Calculation**: Generates actual driving routes between cities
- **Geographic Accuracy**: Uses correct coordinates for major US cities
- **Realistic Travel Times**: Calculates accurate driving times and distances
- **Logical Waypoints**: Suggests stops that make geographic sense

### 🌤️ Weather Intelligence  
- **Route-Specific Weather**: Weather data tailored to your actual route
- **Seasonal Accuracy**: Realistic weather based on time of year and location
- **7-Day Forecasts**: Extended weather outlook for your journey
- **Weather Alerts**: Real-time alerts for severe weather along your route

### 🎯 Route Optimization
- **Smart Departure Times**: Optimal timing based on weather patterns
- **Strategic Stop Planning**: Recommended rest stops based on actual geography
- **Safety Recommendations**: Personalized safety advice for your specific route
- **Cost Estimation**: Realistic estimates for gas, hotels, and food

### 🔧 Advanced Features
- **Current Location**: Use GPS to set your starting point
- **Round Trip Options**: Choose to retrace your route or explore alternatives
- **Trip Cost Calculator**: Estimate expenses for your group size
- **Saved Routes**: Store and reload your favorite trips (requires account)
- **Travel Preferences**: Customize driving hours, departure times, and safety settings

## Example Route: Rapid City, SD to Miami, FL

When planning a trip from Rapid City, SD to Miami, FL, RouteCaster provides:

- **Realistic Route**: Via Kansas City, Memphis, and Atlanta (not Denver!)
- **Accurate Distance**: 1,547 miles, 23 hours 15 minutes driving time
- **Logical Stops**: 
  - Kansas City, MO (major highway junction)
  - Memphis, TN (halfway overnight stop)
  - Atlanta, GA (final rest before Florida)
- **Seasonal Weather**: 
  - Winter: Snow concerns in SD, mild conditions in FL
  - Summer: Heat advisories in southern states, afternoon storms in FL
- **Highway Information**: I-90 E → I-35 S → I-44 S → I-40 E → I-75 S → I-95 S

## Technology Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **Maps**: React Leaflet with OpenStreetMap
- **Routing**: Custom routing engine with realistic geographic calculations
- **Weather**: Seasonal weather modeling based on location and time
- **State Management**: React Query for data fetching and caching

## API Integration Ready

The application is structured to easily integrate with real services:

- **Mapbox Directions API**: For precise routing
- **OpenWeatherMap API**: For real-time weather data
- **Google Maps Geocoding**: For location lookup

## Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd routecaster-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a Supabase project
   - Run the database migrations from `supabase/migrations/`
   - Update `src/lib/supabase.js` with your project credentials

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Environment Variables

For production use with real APIs, add these to your `.env` file:

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
VITE_OPENWEATHER_API_KEY=your_openweather_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The application uses the following main tables:
- `travel_routes_x7c9f2`: Store user routes and preferences
- `weather_data_x7c9f2`: Cache weather information
- `weather_alerts_x7c9f2`: Store weather alerts and warnings
- `route_optimizations_x7c9f2`: Save optimization results
- `user_preferences_x7c9f2`: User travel preferences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with realistic routes
5. Submit a pull request

## License

This project is licensed under the MIT License.