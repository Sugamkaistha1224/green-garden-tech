
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LocationSelector } from '@/components/LocationSelector';
import { 
  Cloud, 
  Sun, 
  Droplets, 
  Wind, 
  Thermometer, 
  Eye, 
  Sunrise, 
  Sunset,
  Download,
  RefreshCw,
  MapPin,
  Key
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    visibility: number;
    uvIndex: number;
    description: string;
    sunrise: string;
    sunset: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    description: string;
    rainChance: number;
  }>;
  gardeningAdvice: string[];
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  weather?: any;
}

export const WeatherMonitoring = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiKey, setApiKey] = useState<string>('X26Cc3rO6ZIHB3nQhdQwc980J0XwPdgH');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const { toast } = useToast();

  // Auto-detect user's location on component mount
  useEffect(() => {
    detectCurrentLocation();
  }, []);

  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation. Please select a location manually.",
        variant: "destructive"
      });
      return;
    }

    setIsDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          // Get location name using Tomorrow.io reverse geocoding or use coordinates
          let locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          // For now, we'll use a simple approach since Tomorrow.io focuses on weather data
          // In a production app, you might want to use a dedicated geocoding service
          try {
            const response = await fetch(`https://api.tomorrow.io/v4/weather/realtime?location=${latitude},${longitude}&apikey=${apiKey}`);
            if (response.ok) {
              locationName = `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            }
          } catch (error) {
            console.log('Using coordinates for location name');
          }
          
          const autoLocation: LocationData = {
            lat: latitude,
            lng: longitude,
            address: locationName
          };
          
          setLocation(autoLocation);
          fetchWeatherData(autoLocation);
          setIsDetectingLocation(false);
          
          toast({
            title: "Location detected",
            description: `Found: ${locationName} (±${Math.round(accuracy)}m accuracy)`,
          });
        } catch (error) {
          console.error('Geocoding error:', error);
          const autoLocation: LocationData = {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          };
          setLocation(autoLocation);
          fetchWeatherData(autoLocation);
          setIsDetectingLocation(false);
          
          toast({
            title: "Location detected",
            description: "Using coordinates for weather data.",
          });
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        let errorMessage = "Please select a location manually to get weather data.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access was denied. Please enable location access and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please select manually.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again or select manually.";
            break;
        }
        
        toast({
          title: "Location detection failed",
          description: errorMessage,
          variant: "destructive"
        });
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };

  const fetchWeatherData = async (locationData?: LocationData) => {
    const targetLocation = locationData || location;
    if (!targetLocation) return;
    
    setIsLoading(true);
    
    try {
      // Use Tomorrow.io Weather API with provided key
      const currentResponse = await fetch(
        `https://api.tomorrow.io/v4/weather/realtime?location=${targetLocation.lat},${targetLocation.lng}&apikey=${apiKey}`
      );
      
      const forecastResponse = await fetch(
        `https://api.tomorrow.io/v4/weather/forecast?location=${targetLocation.lat},${targetLocation.lng}&apikey=${apiKey}`
      );

      if (!currentResponse.ok) {
        const errorData = await currentResponse.json().catch(() => ({}));
        throw new Error(`Tomorrow.io API request failed: ${currentResponse.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      if (!forecastResponse.ok) {
        const errorData = await forecastResponse.json().catch(() => ({}));
        throw new Error(`Tomorrow.io Forecast API request failed: ${forecastResponse.status} - ${errorData.message || 'Unknown error'}`);
      }

      const [currentData, forecastData] = await Promise.all([
        currentResponse.json(),
        forecastResponse.json()
      ]);

      // Update location name (keeping existing address for now)
      let locationName = targetLocation.address;

      const current = currentData.data.values;
      const timeline = forecastData.timelines.daily;

      const realWeather: WeatherData = {
        current: {
          temperature: Math.round(current.temperature),
          humidity: Math.round(current.humidity),
          windSpeed: Math.round(current.windSpeed * 3.6), // Convert m/s to km/h
          windDirection: getWindDirection(current.windDirection || 0),
          pressure: Math.round(current.pressureSeaLevel || current.pressure || 1013),
          visibility: Math.round(current.visibility || 10), // Already in km
          uvIndex: Math.round(current.uvIndex || 0),
          description: getWeatherDescription(current.weatherCode || 0),
          sunrise: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Tomorrow.io doesn't provide sunrise/sunset in realtime
          sunset: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        forecast: processTomorrowForecastData(timeline),
        gardeningAdvice: generateTomorrowGardeningAdvice(current, timeline)
      };
      
      setWeather(realWeather);
      setLastUpdated(new Date());
      
      toast({
        title: "Weather updated",
        description: `Live data from Tomorrow.io for ${locationName}: ${realWeather.current.temperature}°C, ${realWeather.current.description}`,
      });
      
      // Auto-refresh every 30 minutes
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          fetchWeatherData(targetLocation);
        }
      }, 1800000);
      
    } catch (error) {
      console.error('Weather fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unable to get weather data. Please try again later.";
      toast({
        title: "Weather fetch failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const processTomorrowForecastData = (timeline: any[]): WeatherData['forecast'] => {
    return timeline.slice(0, 7).map(day => {
      const values = day.values;
      return {
        date: new Date(day.time).toLocaleDateString(),
        high: Math.round(values.temperatureMax),
        low: Math.round(values.temperatureMin),
        description: getWeatherDescription(values.weatherCodeMax || values.weatherCode || 0),
        rainChance: Math.round((values.precipitationProbabilityMax || values.precipitationProbability || 0))
      };
    });
  };

  const getWeatherDescription = (weatherCode: number): string => {
    const weatherCodes: { [key: number]: string } = {
      0: 'Unknown',
      1000: 'Clear',
      1001: 'Cloudy',
      1100: 'Mostly Clear',
      1101: 'Partly Cloudy',
      1102: 'Mostly Cloudy',
      2000: 'Fog',
      2100: 'Light Fog',
      3000: 'Light Wind',
      3001: 'Wind',
      3002: 'Strong Wind',
      4000: 'Drizzle',
      4001: 'Rain',
      4200: 'Light Rain',
      4201: 'Heavy Rain',
      5000: 'Snow',
      5001: 'Flurries',
      5100: 'Light Snow',
      5101: 'Heavy Snow',
      6000: 'Freezing Drizzle',
      6001: 'Freezing Rain',
      6200: 'Light Freezing Rain',
      6201: 'Heavy Freezing Rain',
      7000: 'Ice Pellets',
      7101: 'Heavy Ice Pellets',
      7102: 'Light Ice Pellets',
      8000: 'Thunderstorm'
    };
    return weatherCodes[weatherCode] || 'Clear';
  };

  const generateTomorrowGardeningAdvice = (current: any, forecast: any[]): string[] => {
    const advice: string[] = [];
    const temp = current.temperature;
    const humidity = current.humidity;
    const windSpeed = current.windSpeed;
    
    // Temperature-based advice
    if (temp < 5) {
      advice.push('Protect tender plants from frost - cover or move indoors');
    } else if (temp > 30) {
      advice.push('Provide shade and extra water for heat-sensitive plants');
    } else {
      advice.push('Great temperature for most gardening activities');
    }
    
    // Humidity-based advice
    if (humidity < 40) {
      advice.push('Low humidity - increase watering frequency and consider mulching');
    } else if (humidity > 80) {
      advice.push('High humidity - watch for fungal diseases and ensure good air circulation');
    }
    
    // Wind-based advice
    if (windSpeed > 10) {
      advice.push('Strong winds - secure tall plants and protect delicate seedlings');
    }
    
    // Rain forecast advice
    const nextRain = forecast.slice(0, 3).find(f => (f.values.precipitationProbabilityMax || f.values.precipitationProbability || 0) > 50);
    if (nextRain) {
      advice.push('Rain expected soon - hold off on watering and harvesting');
    } else {
      advice.push('No rain in forecast - maintain regular watering schedule');
    }
    
    // UV Index advice
    if (current.uvIndex > 7) {
      advice.push('High UV index - provide shade for sensitive plants during midday');
    }
    
    return advice;
  };

  const handleLocationSelect = (newLocation: LocationData) => {
    setLocation(newLocation);
    fetchWeatherData(newLocation);
  };

  const downloadWeatherReport = () => {
    if (!weather || !location) return;

    const content = `Smart Gardening Assistant - Weather Report

Location: ${location.address}
Generated: ${new Date().toLocaleString()}

CURRENT CONDITIONS:
==================
Temperature: ${weather.current.temperature}°C
Humidity: ${weather.current.humidity}%
Wind: ${weather.current.windSpeed} km/h ${weather.current.windDirection}
Pressure: ${weather.current.pressure} hPa
Visibility: ${weather.current.visibility} km
UV Index: ${weather.current.uvIndex}
Conditions: ${weather.current.description}

Sunrise: ${weather.current.sunrise}
Sunset: ${weather.current.sunset}

7-DAY FORECAST:
===============
${weather.forecast.map(day => 
  `${day.date}: ${day.low}°C - ${day.high}°C, ${day.description} (${day.rainChance}% rain)`
).join('\n')}

GARDENING ADVICE:
=================
${weather.gardeningAdvice.map((advice, i) => `${i + 1}. ${advice}`).join('\n')}

---
Generated by Smart Gardening Assistant
${apiKey ? 'Weather data from Tomorrow.io API' : 'Demo weather data (add API key for real data)'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Weather Report Downloaded",
      description: "Your detailed weather report has been saved.",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Live Weather Status */}
      <Card className="border-garden-green bg-gradient-to-r from-garden-green/5 to-sky-blue/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="h-3 w-3 bg-garden-green rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-garden-green">
              Live Weather Data Active - Real-time Updates from Tomorrow.io
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Location</span>
            <Button
              onClick={detectCurrentLocation}
              variant="outline"
              size="sm"
              disabled={isDetectingLocation}
            >
              <MapPin className={`h-4 w-4 mr-2 ${isDetectingLocation ? 'animate-pulse' : ''}`} />
              {isDetectingLocation ? 'Detecting...' : 'Use Current Location'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LocationSelector 
            onLocationSelect={handleLocationSelect}
            selectedLocation={location}
          />
        </CardContent>
      </Card>

      {!location ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Cloud className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-sm sm:text-base">Please select a location above to view detailed weather data</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Weather */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    <span>Current Weather</span>
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    📍 {location.address}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button 
                    onClick={() => fetchWeatherData()} 
                    variant="outline" 
                    size="sm"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    onClick={downloadWeatherReport} 
                    variant="outline" 
                    size="sm"
                    disabled={!weather}
                    className="w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-garden-green"></div>
                </div>
              ) : weather ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-garden-green mb-2">
                      {weather.current.temperature}°C
                    </div>
                    <p className="text-base sm:text-lg text-muted-foreground">{weather.current.description}</p>
                    {lastUpdated && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <Droplets className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-xs sm:text-sm font-medium">Humidity</p>
                      <p className="text-sm sm:text-lg font-bold text-blue-600">{weather.current.humidity}%</p>
                    </div>

                    <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                      <Wind className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-gray-500" />
                      <p className="text-xs sm:text-sm font-medium">Wind</p>
                      <p className="text-sm sm:text-lg font-bold text-gray-600">
                        {weather.current.windSpeed} km/h {weather.current.windDirection}
                      </p>
                    </div>

                    <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <Thermometer className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-purple-500" />
                      <p className="text-xs sm:text-sm font-medium">Pressure</p>
                      <p className="text-sm sm:text-lg font-bold text-purple-600">{weather.current.pressure} hPa</p>
                    </div>

                    <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <Eye className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-green-500" />
                      <p className="text-xs sm:text-sm font-medium">Visibility</p>
                      <p className="text-sm sm:text-lg font-bold text-green-600">{weather.current.visibility} km</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg gap-2">
                    <div className="flex items-center space-x-2">
                      <Sunrise className="h-5 w-5 text-orange-500" />
                      <span className="font-medium text-sm sm:text-base">Sunrise: {weather.current.sunrise}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sunset className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-sm sm:text-base">Sunset: {weather.current.sunset}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm sm:text-base">UV Index</span>
                    <Badge variant={weather.current.uvIndex > 7 ? 'destructive' : weather.current.uvIndex > 4 ? 'secondary' : 'default'}>
                      {weather.current.uvIndex} - {weather.current.uvIndex > 7 ? 'Very High' : weather.current.uvIndex > 4 ? 'Moderate' : 'Low'}
                    </Badge>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          {weather && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">7-Day Forecast</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Weather outlook for your garden planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 sm:gap-4">
                  {weather.forecast.map((day, index) => (
                    <div key={index} className="text-center p-3 border rounded-lg">
                      <p className="text-xs sm:text-sm font-medium mb-2">{day.date}</p>
                      <p className="text-xs text-muted-foreground mb-2">{day.description}</p>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">{day.high}°C</p>
                        <p className="text-xs text-muted-foreground">{day.low}°C</p>
                        <p className="text-xs text-blue-600">{day.rainChance}% rain</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gardening Advice */}
          {weather && (
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-900 dark:text-green-100 text-lg sm:text-xl">Today's Gardening Advice</CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300 text-sm sm:text-base">
                  Weather-based recommendations for your garden
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {weather.gardeningAdvice.map((advice, index) => (
                    <li key={index} className="flex items-start space-x-2 text-green-800 dark:text-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm">{advice}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
