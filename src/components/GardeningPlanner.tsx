
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, MapPin, Thermometer, Ruler, Beaker, Leaf, Calendar, Droplets, Sun, Scissors, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LocationSelector } from './LocationSelector';

interface PlantRecommendation {
  name: string;
  scientificName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  careSchedule: {
    watering: string;
    fertilizing: string;
    pruning: string;
    sunlight: string;
  };
  benefits: string[];
  plantingTips: string[];
  expectedYield: string;
  companionPlants: string[];
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  weather?: any;
}

export const GardeningPlanner = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [formData, setFormData] = useState({
    season: '',
    climate: '',
    spaceSize: '',
    soilType: '',
    preferredPlants: '',
    experience: ''
  });
  const [recommendations, setRecommendations] = useState<PlantRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Helper function to get weather description from code
  const getWeatherDescription = (weatherCode: number): string => {
    const weatherCodes: { [key: number]: string } = {
      0: 'Unknown',
      1000: 'Clear',
      1001: 'Cloudy',
      1100: 'Mostly Clear',
      1101: 'Partly Cloudy',
      1102: 'Mostly Cloudy',
      2000: 'Fog',
      4000: 'Drizzle',
      4001: 'Rain',
      4200: 'Light Rain',
      4201: 'Heavy Rain',
      5000: 'Snow',
      5100: 'Light Snow',
      5101: 'Heavy Snow',
      8000: 'Thunderstorm'
    };
    return weatherCodes[weatherCode] || 'Clear';
  };

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      toast({
        title: "Location Required",
        description: "Please select a location using the map or manual input.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Fetch real-time weather data from Tomorrow.io for more accurate recommendations
      let weatherData = null;
      try {
        const weatherResponse = await fetch(
          `https://api.tomorrow.io/v4/weather/realtime?location=${selectedLocation.lat},${selectedLocation.lng}&apikey=X26Cc3rO6ZIHB3nQhdQwc980J0XwPdgH`
        );
        if (weatherResponse.ok) {
          const weather = await weatherResponse.json();
          const values = weather.data.values;
          weatherData = {
            temperature: Math.round(values.temperature),
            humidity: Math.round(values.humidity),
            description: getWeatherDescription(values.weatherCode || 0),
            windSpeed: Math.round(values.windSpeed * 3.6), // Convert m/s to km/h
            uvIndex: Math.round(values.uvIndex || 0),
            visibility: Math.round(values.visibility || 10),
            pressure: Math.round(values.pressureSeaLevel || values.pressure || 1013)
          };
        }
      } catch (error) {
        console.log('Weather data not available, proceeding with location-based recommendations');
      }

      const prompt = `Based on the following gardening information, provide 3-5 personalized plant recommendations with detailed care schedules:

Location: ${selectedLocation.address}
Coordinates: ${selectedLocation.lat}, ${selectedLocation.lng}
${weatherData ? `REAL-TIME WEATHER DATA (from Tomorrow.io):
- Temperature: ${weatherData.temperature}°C
- Humidity: ${weatherData.humidity}%
- Conditions: ${weatherData.description}
- Wind Speed: ${weatherData.windSpeed} km/h
- UV Index: ${weatherData.uvIndex}
- Visibility: ${weatherData.visibility} km
- Pressure: ${weatherData.pressure} hPa` : 'Weather data not available - use location-based assumptions'}

GARDEN SPECIFICATIONS:
- Season: ${formData.season}
- Climate Type: ${formData.climate}
- Available Space: ${formData.spaceSize}
- Soil Type: ${formData.soilType}
- Preferred Plants: ${formData.preferredPlants || 'Any suitable plants'}
- Experience Level: ${formData.experience}

IMPORTANT: Consider the selected season "${formData.season}" for seasonal planting recommendations. Suggest plants that are ideal for planting during this season and will thrive in the given climate and location conditions.

Please format the response as a JSON array with the following structure for each plant:
{
  "name": "Common plant name",
  "scientificName": "Scientific name",
  "difficulty": "Easy/Medium/Hard",
  "careSchedule": {
    "watering": "Specific watering schedule",
    "fertilizing": "Fertilizing schedule",
    "pruning": "Pruning schedule",
    "sunlight": "Sunlight requirements"
  },
  "benefits": ["benefit1", "benefit2", "benefit3"],
  "plantingTips": ["tip1", "tip2", "tip3"],
  "expectedYield": "Description of expected harvest",
  "companionPlants": ["plant1", "plant2", "plant3"]
}`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA3Vm4fLcDD9etw95dbYbdOFusadiAXQ1E', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiResponse) {
        try {
          // Extract JSON from the response
          const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedRecommendations = JSON.parse(jsonMatch[0]);
            setRecommendations(parsedRecommendations);
          } else {
            throw new Error('No valid JSON found in response');
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          // Enhanced fallback recommendations
          setRecommendations([
            {
              name: "Tomatoes",
              scientificName: "Solanum lycopersicum",
              difficulty: "Medium",
              careSchedule: {
                watering: "Water deeply 2-3 times per week, early morning preferred",
                fertilizing: "Feed every 2 weeks with balanced fertilizer during growing season",
                pruning: "Remove suckers weekly, prune lower leaves touching ground",
                sunlight: "6-8 hours of direct sunlight daily"
              },
              benefits: ["High yield", "Rich in vitamins C and K", "Versatile cooking ingredient"],
              plantingTips: ["Start from seedlings", "Provide support stakes", "Mulch around plants"],
              expectedYield: "4-6 kg per plant over season",
              companionPlants: ["Basil", "Marigolds", "Peppers"]
            },
            {
              name: "Lettuce",
              scientificName: "Lactuca sativa",
              difficulty: "Easy",
              careSchedule: {
                watering: "Keep soil consistently moist, water daily in hot weather",
                fertilizing: "Light nitrogen feeding every 2 weeks",
                pruning: "Harvest outer leaves regularly to encourage growth",
                sunlight: "4-6 hours, prefers partial shade in hot climates"
              },
              benefits: ["Quick growing", "Continuous harvest", "High in folate"],
              plantingTips: ["Succession plant every 2 weeks", "Choose heat-resistant varieties", "Provide afternoon shade"],
              expectedYield: "Multiple harvests over 8-10 weeks",
              companionPlants: ["Carrots", "Radishes", "Chives"]
            }
          ]);
        }
      }

      toast({
        title: "Recommendations Generated!",
        description: "Your personalized gardening plan is ready.",
      });

    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadRecommendations = () => {
    if (!selectedLocation || recommendations.length === 0) return;

    const content = `Smart Gardening Assistant - AI Plant Recommendations

Generated: ${new Date().toLocaleString()}
Location: ${selectedLocation.address}
Coordinates: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}
${selectedLocation.weather ? `Weather: ${selectedLocation.weather.temperature}°C, ${selectedLocation.weather.description}` : ''}

INPUT PARAMETERS:
================
Season: ${formData.season}
Climate Type: ${formData.climate}
Available Space: ${formData.spaceSize}
Soil Type: ${formData.soilType}
Preferred Plants: ${formData.preferredPlants || 'Any suitable plants'}
Experience Level: ${formData.experience}

PLANT RECOMMENDATIONS:
=====================
${recommendations.map((plant, index) => `
${index + 1}. ${plant.name} (${plant.scientificName})
   Difficulty: ${plant.difficulty}
   
   CARE SCHEDULE:
   - Watering: ${plant.careSchedule.watering}
   - Fertilizing: ${plant.careSchedule.fertilizing}
   - Pruning: ${plant.careSchedule.pruning}
   - Sunlight: ${plant.careSchedule.sunlight}
   
   BENEFITS: ${plant.benefits.join(', ')}
   
   PLANTING TIPS: ${plant.plantingTips?.join(', ') || 'Follow standard planting guidelines'}
   
   EXPECTED YIELD: ${plant.expectedYield || 'Varies based on care and conditions'}
   
   COMPANION PLANTS: ${plant.companionPlants?.join(', ') || 'Research compatible plants'}
   
   ---`).join('\n')}

DISCLAIMER:
===========
This assistant is for informational purposes only. Always consult with a local horticulture expert for critical gardening decisions. Weather and soil conditions may vary, affecting plant performance.

Generated by Smart Gardening Assistant (AI-Powered)
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gardening-plan-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Plan Downloaded!",
      description: "Your comprehensive gardening plan has been saved.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Location Selector */}
      <div>
        <h2 className="text-2xl font-bold text-garden-green mb-4">Select Your Location</h2>
        <LocationSelector 
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
        />
      </div>

      {/* Garden Information Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-garden-green" />
            <span>Garden Details</span>
          </CardTitle>
          <CardDescription>
            Tell us about your garden space and preferences for personalized recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="season" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Current Season</span>
                </Label>
                <Select value={formData.season} onValueChange={(value) => setFormData({...formData, season: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select current season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spring">Spring (March - May)</SelectItem>
                    <SelectItem value="summer">Summer (June - August)</SelectItem>
                    <SelectItem value="monsoon">Monsoon (July - September)</SelectItem>
                    <SelectItem value="autumn">Autumn (October - November)</SelectItem>
                    <SelectItem value="winter">Winter (December - February)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="climate" className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4" />
                  <span>Climate Type</span>
                </Label>
                <Select value={formData.climate} onValueChange={(value) => setFormData({...formData, climate: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select climate type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tropical">Tropical</SelectItem>
                    <SelectItem value="subtropical">Subtropical</SelectItem>
                    <SelectItem value="temperate">Temperate</SelectItem>
                    <SelectItem value="continental">Continental</SelectItem>
                    <SelectItem value="arid">Arid/Desert</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="spaceSize" className="flex items-center space-x-2">
                  <Ruler className="h-4 w-4" />
                  <span>Available Space</span>
                </Label>
                <Select value={formData.spaceSize} onValueChange={(value) => setFormData({...formData, spaceSize: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select space size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balcony">Balcony/Small containers</SelectItem>
                    <SelectItem value="small-yard">Small yard ({'<'} 100 sq ft)</SelectItem>
                    <SelectItem value="medium-yard">Medium yard (100-500 sq ft)</SelectItem>
                    <SelectItem value="large-yard">Large yard ({'>'} 500 sq ft)</SelectItem>
                    <SelectItem value="indoor">Indoor only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="soilType" className="flex items-center space-x-2">
                  <Beaker className="h-4 w-4" />
                  <span>Soil Type</span>
                </Label>
                <Select value={formData.soilType} onValueChange={(value) => setFormData({...formData, soilType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="loamy">Loamy</SelectItem>
                    <SelectItem value="silty">Silty</SelectItem>
                    <SelectItem value="unknown">Not sure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={formData.experience} onValueChange={(value) => setFormData({...formData, experience: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredPlants">Preferred Plants (Optional)</Label>
              <Textarea
                id="preferredPlants"
                value={formData.preferredPlants}
                onChange={(e) => setFormData({...formData, preferredPlants: e.target.value})}
                placeholder="e.g., herbs, vegetables, flowers, fruit trees..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !selectedLocation}
              className="w-full bg-garden-green hover:bg-garden-green/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating AI Recommendations...
                </>
              ) : (
                'Get Personalized Plant Recommendations'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Personalized Plant Recommendations</CardTitle>
                <CardDescription>
                  AI-generated suggestions based on your location and garden conditions
                </CardDescription>
              </div>
              <Button onClick={downloadRecommendations} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recommendations.map((plant, index) => (
                <Card key={index} className="border-l-4 border-l-garden-green">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{plant.name}</CardTitle>
                        <CardDescription className="italic">{plant.scientificName}</CardDescription>
                      </div>
                      <Badge variant={plant.difficulty === 'Easy' ? 'default' : plant.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                        {plant.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Care Schedule
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <Droplets className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span><strong>Watering:</strong> {plant.careSchedule.watering}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Leaf className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span><strong>Fertilizing:</strong> {plant.careSchedule.fertilizing}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Scissors className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span><strong>Pruning:</strong> {plant.careSchedule.pruning}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Sun className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span><strong>Sunlight:</strong> {plant.careSchedule.sunlight}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Benefits</h4>
                          <div className="flex flex-wrap gap-2">
                            {plant.benefits.map((benefit, benefitIndex) => (
                              <Badge key={benefitIndex} variant="outline" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {plant.plantingTips && (
                          <div>
                            <h4 className="font-semibold mb-2">Planting Tips</h4>
                            <ul className="text-sm space-y-1">
                              {plant.plantingTips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start space-x-2">
                                  <div className="w-1.5 h-1.5 bg-garden-green rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {plant.expectedYield && (
                          <div>
                            <h4 className="font-semibold mb-2">Expected Yield</h4>
                            <p className="text-sm text-muted-foreground">{plant.expectedYield}</p>
                          </div>
                        )}
                        
                        {plant.companionPlants && plant.companionPlants.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Companion Plants</h4>
                            <div className="flex flex-wrap gap-2">
                              {plant.companionPlants.map((companion, companionIndex) => (
                                <Badge key={companionIndex} variant="secondary" className="text-xs">
                                  {companion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
