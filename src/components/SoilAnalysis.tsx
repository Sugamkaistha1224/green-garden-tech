import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FlaskConical, 
  Upload, 
  Camera, 
  FileText, 
  Leaf, 
  Droplets, 
  Zap, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SoilData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  calcium?: number;
  magnesium?: number;
  sulfur?: number;
  iron?: number;
  zinc?: number;
  manganese?: number;
  boron?: number;
  heavyMetals: 'low' | 'moderate' | 'high';
  texture: 'clay' | 'sandy' | 'loamy' | 'silty';
  moisture?: number;
  temperature?: number;
  electricalConductivity?: number;
}

interface NutrientAnalysis {
  level: number;
  status: 'deficient' | 'low' | 'adequate' | 'high' | 'excessive';
  recommendation: string;
  impact: string;
}

interface LocationSuitability {
  score: number;
  climate: string;
  season: string;
  suitableForLocalCrops: boolean;
  climateRecommendations: string[];
}

interface PlantRecommendation {
  name: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  yieldTime: string;
  climateSuitability: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  specificReasons: string[];
  plantingTips: string[];
}

interface ImprovementPlan {
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  timeframe: string;
  expectedOutcome: string;
  cost: 'Low' | 'Medium' | 'High';
}

interface AnalysisResult {
  overallScore: number;
  soilHealth: 'excellent' | 'good' | 'fair' | 'poor';
  confidence: number;
  
  // Detailed nutrient analysis
  nutrients: {
    nitrogen: NutrientAnalysis;
    phosphorus: NutrientAnalysis;
    potassium: NutrientAnalysis;
    calcium?: NutrientAnalysis;
    magnesium?: NutrientAnalysis;
    micronutrients?: NutrientAnalysis[];
  };
  
  // pH analysis
  phAnalysis: {
    level: number;
    category: 'Very Acidic' | 'Acidic' | 'Slightly Acidic' | 'Neutral' | 'Slightly Alkaline' | 'Alkaline' | 'Very Alkaline';
    suitability: string;
    correctionNeeded: boolean;
    recommendation: string;
  };
  
  // Organic matter analysis
  organicMatterAnalysis: {
    percentage: number;
    rating: 'Very Low' | 'Low' | 'Moderate' | 'Good' | 'Excellent';
    benefits: string[];
    improvementSuggestions: string[];
  };
  
  // Pollutant analysis
  pollutantAnalysis: {
    heavyMetalsLevel: 'low' | 'moderate' | 'high';
    contaminants: string[];
    healthRisk: 'None' | 'Low' | 'Moderate' | 'High';
    remediation: string[];
  };
  
  // Location-based analysis
  locationSuitability: LocationSuitability;
  
  // Plant recommendations
  recommendedPlants: PlantRecommendation[];
  
  // Improvement plan
  improvementPlan: ImprovementPlan[];
  
  // Additional insights
  insights: string[];
  warnings: string[];
}

export const SoilAnalysis = () => {
  const [activeTab, setActiveTab] = useState<'manual' | 'image' | 'report'>('manual');
  const [soilData, setSoilData] = useState<Partial<SoilData>>({});
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [reportText, setReportText] = useState('');
  const { toast } = useToast();

  const handleManualAnalysis = () => {
    if (!soilData.ph || !soilData.nitrogen || !soilData.phosphorus || !soilData.potassium) {
      toast({
        title: "Missing Data",
        description: "Please fill in all required fields for analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const result = generateAnalysisResult(soilData as SoilData);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: `Soil health: ${result.soilHealth.toUpperCase()} (${result.confidence}% accuracy)`,
      });
    }, 2000);
  };

  const handleImageAnalysis = () => {
    if (!uploadedImage) {
      toast({
        title: "No Image Selected",
        description: "Please upload an image of your soil for analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI image analysis
    setTimeout(() => {
      const estimatedData: SoilData = {
        ph: 6.2 + Math.random() * 1.6,
        nitrogen: 15 + Math.random() * 30,
        phosphorus: 10 + Math.random() * 25,
        potassium: 20 + Math.random() * 40,
        organicMatter: 2 + Math.random() * 6,
        heavyMetals: Math.random() > 0.7 ? 'moderate' : 'low',
        texture: ['clay', 'sandy', 'loamy', 'silty'][Math.floor(Math.random() * 4)] as any
      };
      
      const result = generateAnalysisResult(estimatedData);
      result.confidence = Math.floor(75 + Math.random() * 20); // Image analysis less accurate
      setAnalysisResult(result);
      setIsAnalyzing(false);
      
      toast({
        title: "Image Analysis Complete",
        description: `Analysis completed with ${result.confidence}% confidence`,
      });
    }, 3000);
  };

  const handleReportAnalysis = () => {
    if (!reportText.trim()) {
      toast({
        title: "No Report Data",
        description: "Please enter or upload your soil report data.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI report parsing
    setTimeout(() => {
      const parsedData: SoilData = {
        ph: 6.5 + Math.random() * 1.0,
        nitrogen: 20 + Math.random() * 25,
        phosphorus: 15 + Math.random() * 20,
        potassium: 25 + Math.random() * 35,
        organicMatter: 3 + Math.random() * 4,
        heavyMetals: 'low',
        texture: 'loamy'
      };
      
      const result = generateAnalysisResult(parsedData);
      result.confidence = 95 + Math.random() * 5; // Report analysis most accurate
      setAnalysisResult(result);
      setIsAnalyzing(false);
      
      toast({
        title: "Report Analysis Complete",
        description: `Professional report analyzed with ${result.confidence}% accuracy`,
      });
    }, 2500);
  };

  const generateAnalysisResult = (data: SoilData): AnalysisResult => {
    // Calculate overall score
    let overallScore = 0;
    
    // pH Analysis
    const getPhCategory = (ph: number) => {
      if (ph < 5.0) return 'Very Acidic';
      if (ph < 6.0) return 'Acidic';
      if (ph < 6.5) return 'Slightly Acidic';
      if (ph <= 7.5) return 'Neutral';
      if (ph <= 8.0) return 'Slightly Alkaline';
      if (ph <= 9.0) return 'Alkaline';
      return 'Very Alkaline';
    };

    const phAnalysis = {
      level: data.ph,
      category: getPhCategory(data.ph) as any,
      suitability: data.ph >= 6.0 && data.ph <= 7.0 ? 'Optimal for most crops' : 'May limit plant nutrient uptake',
      correctionNeeded: data.ph < 6.0 || data.ph > 7.5,
      recommendation: data.ph < 6.0 ? 'Apply lime to raise pH' : data.ph > 7.5 ? 'Add sulfur to lower pH' : 'pH is optimal'
    };

    // Nutrient Analysis
    const analyzeNutrient = (level: number, thresholds: {deficient: number, low: number, adequate: number, high: number}, name: string): NutrientAnalysis => {
      let status: NutrientAnalysis['status'];
      let recommendation: string;
      let impact: string;

      if (level < thresholds.deficient) {
        status = 'deficient';
        recommendation = `Add ${name.toLowerCase()}-rich fertilizer immediately`;
        impact = `Severe ${name.toLowerCase()} deficiency will limit plant growth`;
      } else if (level < thresholds.low) {
        status = 'low';
        recommendation = `Apply ${name.toLowerCase()} fertilizer`;
        impact = `Low ${name.toLowerCase()} may reduce yields`;
      } else if (level < thresholds.adequate) {
        status = 'adequate';
        recommendation = `Monitor and maintain current levels`;
        impact = `${name} levels support healthy growth`;
      } else if (level < thresholds.high) {
        status = 'high';
        recommendation = `Reduce ${name.toLowerCase()} inputs`;
        impact = `High ${name.toLowerCase()} may cause nutrient imbalances`;
      } else {
        status = 'excessive';
        recommendation = `Stop ${name.toLowerCase()} applications`;
        impact = `Excessive ${name.toLowerCase()} can harm plants and environment`;
      }

      return { level, status, recommendation, impact };
    };

    const nutrients = {
      nitrogen: analyzeNutrient(data.nitrogen, {deficient: 10, low: 15, adequate: 25, high: 40}, 'Nitrogen'),
      phosphorus: analyzeNutrient(data.phosphorus, {deficient: 5, low: 10, adequate: 20, high: 35}, 'Phosphorus'),
      potassium: analyzeNutrient(data.potassium, {deficient: 15, low: 20, adequate: 30, high: 50}, 'Potassium')
    };

    // Organic Matter Analysis
    const organicMatterPercentage = data.organicMatter || 0;
    const organicMatterAnalysis = {
      percentage: organicMatterPercentage,
      rating: organicMatterPercentage < 2 ? 'Very Low' :
              organicMatterPercentage < 3 ? 'Low' :
              organicMatterPercentage < 4 ? 'Moderate' :
              organicMatterPercentage < 6 ? 'Good' : 'Excellent' as any,
      benefits: organicMatterPercentage > 3 ? 
        ['Improves soil structure', 'Enhances water retention', 'Provides slow-release nutrients'] :
        ['Soil needs organic matter improvement'],
      improvementSuggestions: organicMatterPercentage < 4 ? 
        ['Add compost regularly', 'Use cover crops', 'Apply well-aged manure'] :
        ['Maintain current organic matter practices']
    };

    // Pollutant Analysis
    const pollutantAnalysis = {
      heavyMetalsLevel: data.heavyMetals,
      contaminants: data.heavyMetals === 'high' ? ['Lead', 'Cadmium', 'Mercury'] :
                   data.heavyMetals === 'moderate' ? ['Zinc', 'Copper'] : [],
      healthRisk: data.heavyMetals === 'high' ? 'High' :
                 data.heavyMetals === 'moderate' ? 'Moderate' : 'None' as any,
      remediation: data.heavyMetals !== 'low' ? 
        ['Consider soil replacement', 'Use phytoremediation plants', 'Avoid growing edible crops'] :
        ['No remediation needed']
    };

    // Location Suitability (mock data - would integrate with weather API)
    const locationSuitability: LocationSuitability = {
      score: 85,
      climate: 'Temperate',
      season: 'Spring',
      suitableForLocalCrops: true,
      climateRecommendations: ['Plant cool-season crops', 'Consider season extension methods']
    };

    // Plant Recommendations
    const recommendedPlants: PlantRecommendation[] = [
      {
        name: 'Tomatoes',
        difficulty: 'Moderate',
        yieldTime: '75-85 days',
        climateSuitability: phAnalysis.correctionNeeded ? 'Fair' : 'Excellent',
        specificReasons: ['Good nutrient levels', 'Adequate soil structure'],
        plantingTips: ['Start indoors 6-8 weeks before last frost', 'Provide support structures']
      },
      {
        name: 'Leafy Greens',
        difficulty: 'Easy',
        yieldTime: '30-45 days',
        climateSuitability: 'Good',
        specificReasons: ['Tolerates pH variations', 'Quick growing'],
        plantingTips: ['Direct seed in cool weather', 'Succession plant every 2 weeks']
      }
    ];

    // Improvement Plan
    const improvementPlan: ImprovementPlan[] = [
      {
        priority: phAnalysis.correctionNeeded ? 'High' : 'Medium',
        action: phAnalysis.recommendation,
        timeframe: '2-4 weeks',
        expectedOutcome: 'Improved nutrient availability',
        cost: 'Low'
      },
      {
        priority: organicMatterPercentage < 3 ? 'High' : 'Low',
        action: 'Add organic compost',
        timeframe: 'Ongoing',
        expectedOutcome: 'Better soil structure and fertility',
        cost: 'Medium'
      }
    ];

    // Calculate overall score
    overallScore = Math.round(
      (phAnalysis.correctionNeeded ? 60 : 90) * 0.3 +
      (nutrients.nitrogen.status === 'adequate' ? 85 : 60) * 0.25 +
      (nutrients.phosphorus.status === 'adequate' ? 85 : 60) * 0.25 +
      (organicMatterPercentage > 3 ? 80 : 50) * 0.2
    );

    const soilHealth: AnalysisResult['soilHealth'] = 
      overallScore >= 85 ? 'excellent' :
      overallScore >= 70 ? 'good' :
      overallScore >= 50 ? 'fair' : 'poor';

    return {
      overallScore,
      soilHealth,
      confidence: Math.floor(85 + Math.random() * 15),
      nutrients,
      phAnalysis,
      organicMatterAnalysis,
      pollutantAnalysis,
      locationSuitability,
      recommendedPlants,
      improvementPlan,
      insights: [
        `Your soil has an overall health score of ${overallScore}/100`,
        phAnalysis.correctionNeeded ? 'pH adjustment is the top priority' : 'pH levels are well-balanced',
        `Organic matter at ${organicMatterPercentage}% ${organicMatterPercentage > 4 ? 'is excellent' : 'needs improvement'}`
      ],
      warnings: pollutantAnalysis.healthRisk !== 'None' ? ['Heavy metal contamination detected'] : []
    };
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'manual', label: 'Manual Input', icon: FlaskConical },
    { id: 'image', label: 'Image Analysis', icon: Camera },
    { id: 'report', label: 'Report Upload', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-earth-brown/10 to-garden-green/10 border-garden-green/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <div className="bg-earth-brown rounded-full p-2">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            <span>AI-Powered Soil & Plant Health Analysis</span>
            <Badge variant="secondary" className="bg-garden-green/10 text-garden-green">
              <Leaf className="h-3 w-3 mr-1" />
              Smart Analysis
            </Badge>
          </CardTitle>
          <CardDescription className="text-base">
            Analyze your soil health through manual input, image scanning, or report upload for personalized plant recommendations
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center space-x-2"
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Manual Input Tab */}
      {activeTab === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FlaskConical className="h-5 w-5 text-garden-green" />
              <span>Manual Soil Data Input</span>
            </CardTitle>
            <CardDescription>
              Enter your soil test results for comprehensive analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ph">pH Level *</Label>
                <Input
                  id="ph"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  placeholder="6.5"
                  value={soilData.ph || ''}
                  onChange={(e) => setSoilData(prev => ({ ...prev, ph: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nitrogen">Nitrogen (ppm) *</Label>
                <Input
                  id="nitrogen"
                  type="number"
                  placeholder="25"
                  value={soilData.nitrogen || ''}
                  onChange={(e) => setSoilData(prev => ({ ...prev, nitrogen: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phosphorus">Phosphorus (ppm) *</Label>
                <Input
                  id="phosphorus"
                  type="number"
                  placeholder="15"
                  value={soilData.phosphorus || ''}
                  onChange={(e) => setSoilData(prev => ({ ...prev, phosphorus: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="potassium">Potassium (ppm) *</Label>
                <Input
                  id="potassium"
                  type="number"
                  placeholder="30"
                  value={soilData.potassium || ''}
                  onChange={(e) => setSoilData(prev => ({ ...prev, potassium: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organic">Organic Matter (%)</Label>
                <Input
                  id="organic"
                  type="number"
                  step="0.1"
                  placeholder="4.5"
                  value={soilData.organicMatter || ''}
                  onChange={(e) => setSoilData(prev => ({ ...prev, organicMatter: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="texture">Soil Texture</Label>
                <Select onValueChange={(value: any) => setSoilData(prev => ({ ...prev, texture: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil texture" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="loamy">Loamy</SelectItem>
                    <SelectItem value="silty">Silty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metals">Heavy Metals Level</Label>
                <Select onValueChange={(value: any) => setSoilData(prev => ({ ...prev, heavyMetals: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contamination level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleManualAnalysis} 
              disabled={isAnalyzing}
              className="w-full bg-garden-green hover:bg-garden-green/90"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Soil Data...
                </>
              ) : (
                <>
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Analyze Soil Health
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Image Analysis Tab */}
      {activeTab === 'image' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-garden-green" />
              <span>AI Image-Based Soil Analysis</span>
            </CardTitle>
            <CardDescription>
              Upload or capture soil/plant images for AI-powered analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Upload Soil or Plant Image</p>
              <p className="text-muted-foreground mb-4">
                AI will analyze soil texture, plant health, and growth conditions
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadedImage(e.target.files?.[0] || null)}
                className="max-w-xs mx-auto"
              />
            </div>
            
            {uploadedImage && (
              <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">Image uploaded: {uploadedImage.name}</span>
              </div>
            )}
            
            <Button 
              onClick={handleImageAnalysis} 
              disabled={isAnalyzing}
              className="w-full bg-garden-green hover:bg-garden-green/90"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Analyze Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Report Upload Tab */}
      {activeTab === 'report' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-garden-green" />
              <span>Soil Report Analysis</span>
            </CardTitle>
            <CardDescription>
              Upload or paste professional soil test reports for detailed analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="report">Soil Test Report Data</Label>
              <Textarea
                id="report"
                placeholder="Paste your soil test report data here, or describe your soil test results..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                rows={8}
              />
            </div>
            
            <div className="flex gap-4">
              <Input type="file" accept=".pdf,.txt,.doc,.docx" className="flex-1" />
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
            
            <Button 
              onClick={handleReportAnalysis} 
              disabled={isAnalyzing}
              className="w-full bg-garden-green hover:bg-garden-green/90"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Report...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Analyze Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Health Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-garden-green" />
                  <span>Soil Health Analysis</span>
                </div>
                <Badge className={getHealthColor(analysisResult.soilHealth)}>
                  {analysisResult.soilHealth.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Analysis Confidence</span>
                    <span className="text-sm text-muted-foreground">{analysisResult.confidence}%</span>
                  </div>
                  <Progress value={analysisResult.confidence} className="h-2" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Overall Score</span>
                  </div>
                  <p className="text-lg font-bold text-primary">{analysisResult.overallScore}/100</p>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">pH Level</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysisResult.phAnalysis.level.toFixed(1)} - {analysisResult.phAnalysis.category}
                  </p>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Location Score</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{analysisResult.locationSuitability.score}/100</p>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span>Improvement Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysisResult.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <div className="bg-orange-100 rounded-full p-1 mt-0.5">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                  {analysisResult.warnings.map((warning, idx) => (
                    <li key={`warning-${idx}`} className="flex items-start space-x-2">
                      <div className="bg-red-100 rounded-full p-1 mt-0.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-red-600">{warning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  <span>Recommended Plants</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.recommendedPlants.map((plant, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{plant.name}</h4>
                        <Badge variant={plant.difficulty === 'Easy' ? 'default' : plant.difficulty === 'Moderate' ? 'secondary' : 'destructive'}>
                          {plant.difficulty}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Yield Time:</strong> {plant.yieldTime}</p>
                        <p><strong>Climate Suitability:</strong> {plant.climateSuitability}</p>
                        <p><strong>Reasons:</strong> {plant.specificReasons.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  These plants are well-suited for your current soil conditions and climate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Step-by-Step Improvement Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.improvementPlan.map((plan, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className={`${plan.priority === 'High' ? 'bg-red-500' : plan.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'} text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{plan.action}</h4>
                        <Badge variant={plan.priority === 'High' ? 'destructive' : plan.priority === 'Medium' ? 'secondary' : 'default'}>
                          {plan.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Timeline:</strong> {plan.timeframe}</p>
                        <p><strong>Expected Outcome:</strong> {plan.expectedOutcome}</p>
                        <p><strong>Cost:</strong> {plan.cost}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};