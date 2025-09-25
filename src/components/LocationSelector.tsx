
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Sun, Droplets, Wind, Thermometer, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  sunrise: string;
  sunset: string;
  uvIndex: number;
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  weather?: WeatherData;
}

interface LocationSelectorProps {
  onLocationSelect: (location: LocationData) => void;
  selectedLocation?: LocationData;
}

export const LocationSelector = ({ onLocationSelect, selectedLocation }: LocationSelectorProps) => {
  const [location, setLocation] = useState<LocationData | null>(selectedLocation || null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState('');

  // Simple map placeholder - in a real implementation, you'd use a proper map library
  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 360;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -180;
    
    const newLocation: LocationData = {
      lat: y,
      lng: x,
      address: `${y.toFixed(2)}, ${x.toFixed(2)}`
    };
    
    setLocation(newLocation);
    setIsLoading(true);
    
    // Simulate weather data fetching
    setTimeout(() => {
      const mockWeather: WeatherData = {
        temperature: Math.floor(Math.random() * 35) + 5,
        humidity: Math.floor(Math.random() * 60) + 30,
        windSpeed: Math.floor(Math.random() * 20) + 2,
        description: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
        sunrise: '06:30',
        sunset: '18:45',
        uvIndex: Math.floor(Math.random() * 10) + 1
      };
      
      const locationWithWeather = { ...newLocation, weather: mockWeather };
      setWeather(mockWeather);
      setLocation(locationWithWeather);
      onLocationSelect(locationWithWeather);
      setIsLoading(false);
    }, 1000);
  };

  const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    
    setIsLoading(true);
    
    // Simulate geocoding
    setTimeout(() => {
      const mockLocation: LocationData = {
        lat: Math.random() * 180 - 90,
        lng: Math.random() * 360 - 180,
        address: manualLocation
      };
      
      const mockWeather: WeatherData = {
        temperature: Math.floor(Math.random() * 35) + 5,
        humidity: Math.floor(Math.random() * 60) + 30,
        windSpeed: Math.floor(Math.random() * 20) + 2,
        description: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
        sunrise: '06:30',
        sunset: '18:45',
        uvIndex: Math.floor(Math.random() * 10) + 1
      };
      
      const locationWithWeather = { ...mockLocation, weather: mockWeather };
      setWeather(mockWeather);
      setLocation(locationWithWeather);
      onLocationSelect(locationWithWeather);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      {/* Map Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <MapPin className="h-5 w-5 text-garden-green" />
            <span>Select Location</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Click on the map to select your location or enter it manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Simplified Map */}
          <div 
            className="w-full h-48 sm:h-56 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border-2 border-dashed border-garden-green/30 cursor-crosshair relative overflow-hidden"
            onClick={handleMapClick}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNjYWZkZjgiLz4KPC9zdmc+')] opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                <p className="text-xs sm:text-sm">Click anywhere to select location</p>
              </div>
            </div>
            {location && (
              <div 
                className="absolute bg-red-500 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-lg transform -translate-x-1.5 -translate-y-1.5 sm:-translate-x-2 sm:-translate-y-2"
                style={{
                  left: `${((location.lng / 360) + 0.5) * 100}%`,
                  top: `${((-location.lat / 180) + 0.5) * 100}%`
                }}
              />
            )}
          </div>
          
          {/* Manual Input */}
          <form onSubmit={handleManualLocationSubmit} className="space-y-3">
            <Label htmlFor="manual-location" className="text-sm sm:text-base">Or enter location manually:</Label>
            <div className="flex space-x-2">
              <Input
                id="manual-location"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="e.g., New York, NY or Kanga, Himachal Pradesh"
                className="flex-1 text-sm sm:text-base"
              />
              <Button type="submit" disabled={isLoading} className="shrink-0">
                {isLoading ? 'Loading...' : 'Set'}
              </Button>
            </div>
          </form>
          
          {location && (
            <div className="p-3 bg-garden-light dark:bg-garden-green/10 rounded-lg">
              <p className="text-sm font-medium text-garden-green mb-1">Selected Location:</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{location.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Weather Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Sun className="h-5 w-5 text-yellow-500" />
            <span>Live Weather Preview</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Current conditions for your selected location
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48 sm:h-56">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-garden-green"></div>
            </div>
          ) : weather && location ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-garden-green">{weather.temperature}°C</div>
                <p className="text-muted-foreground text-sm sm:text-base">{weather.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Humidity</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{weather.humidity}%</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Wind</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{weather.windSpeed} km/h</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm">UV Index</span>
                  <Badge variant={weather.uvIndex > 7 ? 'destructive' : weather.uvIndex > 4 ? 'secondary' : 'default'}>
                    {weather.uvIndex}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm">Sunrise</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{weather.sunrise}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm">Sunset</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{weather.sunset}</span>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1 text-sm">Gardening Conditions</h4>
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                  {weather.temperature > 25 ? 'Great for warm-season crops' : 
                   weather.temperature > 15 ? 'Perfect for cool-season vegetables' : 
                   'Consider greenhouse or indoor gardening'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 sm:h-56 text-center">
              <div>
                <Thermometer className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-sm">Select a location to view weather</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
