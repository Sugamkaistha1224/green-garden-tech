import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, Brain, Camera, Cloud, BarChart3, MessageCircle, Sparkles, Sun, Droplets, Bug, TreePine, Settings, History } from 'lucide-react';
import { EnhancedChatInterface } from '@/components/EnhancedChatInterface';
import { AISmartGrowAssistant } from '@/components/AISmartGrowAssistant';
import { GardeningPlanner } from '@/components/GardeningPlanner';
import { EnhancedDiseaseDetection } from '@/components/EnhancedDiseaseDetection';
import { EnhancedDashboard } from '@/components/EnhancedDashboard';
import { EnhancedWeatherMonitoring } from '@/components/EnhancedWeatherMonitoring';
import { EnhancedSettingsPanel } from '@/components/EnhancedSettingsPanel';
import { SoilAnalysis } from '@/components/SoilAnalysis';
import { TopNavigation } from '@/components/TopNavigation';

const Index = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'smartgrow',
      icon: Sparkles,
      title: 'AI Smart Grow Assistant',
      description: 'Interactive chat assistant with persistent conversations for step-by-step custom plant growing guidance tailored to your location and climate.',
      color: 'bg-emerald-500',
      component: AISmartGrowAssistant
    },
    {
      id: 'soil',
      icon: Droplets,
      title: 'AI Soil & Plant Health Analysis',
      description: 'Comprehensive soil analysis through manual input, image scanning, or report upload with personalized recommendations.',
      color: 'bg-amber-600',
      component: SoilAnalysis
    },
    {
      id: 'planner',
      icon: Brain,
      title: 'AI Gardening Planner',
      description: 'Get personalized seasonal plant recommendations with location-based insights, climate analysis, and detailed care schedules.',
      color: 'bg-green-500',
      component: GardeningPlanner
    },
    {
      id: 'disease',
      icon: Camera,
      title: 'Plant Disease Detection',
      description: 'Advanced AI-powered plant analysis with species identification, growth tracking, disease detection, and smart reminders for ongoing plant care.',
      color: 'bg-red-500',
      component: EnhancedDiseaseDetection
    },
    {
      id: 'weather',
      icon: Cloud,
      title: 'Live Weather Monitoring',
      description: 'Monitor real-time weather conditions and get gardening advice based on forecasts.',
      color: 'bg-blue-500',
      component: EnhancedWeatherMonitoring
    },
    {
      id: 'dashboard',
      icon: BarChart3,
      title: 'Activity Dashboard',
      description: 'Track your gardening progress, sessions, and feature usage with detailed analytics.',
      color: 'bg-purple-500',
      component: EnhancedDashboard
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Settings & Preferences',
      description: 'Customize your app experience, manage data, and configure personal preferences.',
      color: 'bg-gray-500',
      component: EnhancedSettingsPanel
    }
  ];

  const stats = [
    { icon: TreePine, label: 'Plant Species', value: '500+' },
    { icon: Bug, label: 'Disease Database', value: '100+' },
    { icon: Sun, label: 'Climate Zones', value: '15+' },
    { icon: Cloud, label: 'Weather Locations', value: 'Global' }
  ];

  if (activeFeature) {
    const feature = features.find(f => f.id === activeFeature);
    const Component = feature?.component;
    
    return (
      <div className="min-h-screen bg-garden-gradient font-inter">
        <TopNavigation />
        <div className="pt-4">
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-garden-green mb-2">{feature?.title}</h1>
                <p className="text-muted-foreground text-sm sm:text-base">{feature?.description}</p>
              </div>
              <Button 
                onClick={() => setActiveFeature(null)}
                variant="outline"
                className="self-start sm:self-auto shrink-0"
              >
                ← Back to Home
              </Button>
            </div>
            
            {Component && <Component />}
          </div>
          
          <EnhancedChatInterface />
          
          <footer className="bg-white/80 backdrop-blur-sm mt-16 py-8">
            <div className="container mx-auto px-4">
              <p className="text-center text-sm text-muted-foreground">
                Copyright © Sugam Kaistha • KaisthaGroups |{' '}
                <a href="https://sugam-portfolio-cv.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-garden-green transition-colors">
                  Sugam Kaistha
                </a>{' '}
                |{' '}
                <a href="https://kaisthagroups.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-garden-green transition-colors">
                  KaisthaGroups
                </a>
              </p>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-garden-gradient font-inter">
      <TopNavigation />
      <div className="pt-4">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-16">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-6 gap-4 sm:gap-0">
            <div className="bg-earth-gradient rounded-full p-4 sm:mr-4 animate-float">
              <Leaf className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-garden-green mb-2">
                Smart Gardening Assistant
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
                AI-Powered Garden Planning & Plant Care
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6 sm:mb-8">
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
              Live Weather
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs sm:text-sm">
              Interactive Maps
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs sm:text-sm">
              Disease Detection
            </Badge>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs sm:text-sm">
              Seasonal Planning
            </Badge>
          </div>
          
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Empower your home gardening journey with personalized AI recommendations, seasonal planting guides, 
            interactive location selection, live weather monitoring, and comprehensive plant care guidance with advanced disease detection.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 lg:mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-4 sm:pt-6">
                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-garden-green" />
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-garden-green">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Features Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          {features.map((feature) => (
            <Card 
              key={feature.id} 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 h-full flex flex-col"
              onClick={() => setActiveFeature(feature.id)}
            >
              <CardHeader className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`${feature.color} rounded-lg p-3 flex-shrink-0`}>
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg xl:text-xl leading-tight">{feature.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-garden-green hover:bg-garden-green/90 text-sm sm:text-base">
                  Launch Feature →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Features Highlight - Mobile Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 dark:from-green-900/20 dark:to-blue-900/20 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-green-500 rounded-full p-3 w-fit mx-auto mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 text-sm sm:text-base">Enhanced AI Engine</h3>
                <p className="text-green-800 dark:text-green-200 text-xs sm:text-sm leading-relaxed">
                  Powered by advanced Gemini AI with seasonal intelligence and plant disease detection capabilities
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-blue-500 rounded-full p-3 w-fit mx-auto mb-4">
                  <Cloud className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">Live Weather Integration</h3>
                <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm leading-relaxed">
                  Real-time weather data and seasonal forecasts integrated with all gardening recommendations
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-800 md:col-span-2 xl:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-purple-500 rounded-full p-3 w-fit mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 text-sm sm:text-base">Advanced Plant Intelligence</h3>
                <p className="text-purple-800 dark:text-purple-200 text-xs sm:text-sm leading-relaxed">
                  Species identification, growth tracking, and comprehensive plant health analytics with AI reminders
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Disclaimer - Mobile Responsive */}
        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-500 rounded-full p-2 mt-1 flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-100 mb-2 text-sm sm:text-base">Important Disclaimer</h3>
                <p className="text-yellow-700 dark:text-yellow-200 text-xs sm:text-sm leading-relaxed">
                  This assistant is for informational purposes only. Always consult with a horticulture expert for critical issues. 
                  Your data is stored securely and visible only to you. The platform now includes enhanced AI features for seasonal planning, 
                  plant intelligence analysis, and smart reminders.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced AI Assistant */}
      <EnhancedChatInterface />

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            Copyright © Sugam Kaistha • KaisthaGroups |{' '}
            <a href="https://sugam-portfolio-cv.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-garden-green transition-colors">
              Sugam Kaistha
            </a>{' '}
            |{' '}
            <a href="https://kaisthagroups.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-garden-green transition-colors">
              KaisthaGroups
            </a>
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Index;
