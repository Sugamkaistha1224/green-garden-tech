import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Loader2, Download, AlertTriangle, CheckCircle, Video, History, Zap, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DiseaseResult {
  disease: string;
  confidence: string;
  description: string;
  symptoms: string[];
  treatment: string;
  prevention: string[];
  severity: 'low' | 'medium' | 'high';
  isValidPlant: boolean;
  // Enhanced plant intelligence
  plantType?: string;
  scientificName?: string;
  estimatedAge?: string;
  timeToMaturity?: string;
  waterRequirements?: string;
  soilRequirements?: string;
  sunlightNeeds?: string;
  co2Absorption?: string;
  oxygenRelease?: string;
}

interface DetectionHistory {
  id: string;
  timestamp: Date;
  result: DiseaseResult;
  imageName: string;
  imageBlob?: string; // Store image for history
}

interface PlantReminder {
  id: string;
  plantType: string;
  lastScanDate: Date;
  nextReminderDate: Date;
  message: string;
}

export const EnhancedDiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState<DetectionHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [plantReminders, setPlantReminders] = useState<PlantReminder[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      setIsCameraMode(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Error",
        description: "Unable to access camera. Please check permissions or use file upload instead.",
        variant: "destructive",
      });
      setIsCameraMode(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraMode(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `plant-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setSelectedImage(file);
            setImagePreview(canvas.toDataURL());
            stopCamera();
            setResult(null);
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please select or capture an image to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64Image = base64Data.split(',')[1];

        const enhancedPrompt = `Analyze this image for plant diseases with ENHANCED PLANT INTELLIGENCE. Follow these steps:

1. VALIDATION: First, determine if this is a valid plant leaf/plant part image
2. PLANT IDENTIFICATION: Identify plant species and characteristics
3. DISEASE DETECTION: Analyze for diseases, pests, or health issues
4. PLANT INTELLIGENCE: Provide comprehensive plant data
5. SEVERITY ASSESSMENT: Rate severity as low, medium, or high

Response format (JSON):
{
  "isValidPlant": true/false,
  "disease": "Disease name or 'Healthy' or 'Invalid Image'",
  "confidence": "High/Medium/Low",
  "severity": "low/medium/high",
  "description": "Detailed description",
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "treatment": "Comprehensive treatment plan",
  "prevention": ["prevention1", "prevention2", "prevention3"],
  
  // ENHANCED PLANT INTELLIGENCE (only if isValidPlant is true):
  "plantType": "Common plant name (e.g., 'Tomato', 'Rose', 'Mango')",
  "scientificName": "Scientific name if identifiable",
  "estimatedAge": "Plant age estimation (e.g., '2-3 months old', 'Young seedling')",
  "timeToMaturity": "Time needed for full growth (e.g., '3-4 months', '2-3 years')",
  "waterRequirements": "Daily/weekly water needs (e.g., '2-3 times per week', '200ml daily')",
  "soilRequirements": "Soil type and pH preferences",
  "sunlightNeeds": "Sunlight requirements (e.g., '6-8 hours direct sunlight')",
  "co2Absorption": "CO2 absorption capacity per day (estimate)",
  "oxygenRelease": "Oxygen release capacity per day (estimate)"
}

If the image is NOT a plant/leaf:
- Set isValidPlant to false
- Set disease to "Invalid Image"
- Omit plant intelligence fields

If the image is unclear:
- Mention this in description
- Provide general plant intelligence if species is identifiable`;

        try {
          const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA3Vm4fLcDD9etw95dbYbdOFusadiAXQ1E', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: enhancedPrompt },
                  {
                    inline_data: {
                      mime_type: selectedImage.type,
                      data: base64Image
                    }
                  }
                ]
              }]
            })
          });

          const data = await response.json();
          const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (aiResponse) {
            try {
              const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const analysisResult: DiseaseResult = JSON.parse(jsonMatch[0]);
                
                // Validate if it's a real plant image
                if (!analysisResult.isValidPlant) {
                  toast({
                    title: "Invalid Plant Image",
                    description: "This doesn't appear to be a valid plant leaf. Please upload a real plant image.",
                    variant: "destructive",
                  });
                  return;
                }
                
                setResult(analysisResult);
                
                // Save to history with image
                const reader2 = new FileReader();
                reader2.onload = (e2) => {
                  const historyEntry: DetectionHistory = {
                    id: Date.now().toString(),
                    timestamp: new Date(),
                    result: analysisResult,
                    imageName: selectedImage.name,
                    imageBlob: e2.target?.result as string
                  };
                  
                  setDetectionHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
                  
                  // Set up plant reminder if plant type is identified
                  if (analysisResult.plantType) {
                    const reminder: PlantReminder = {
                      id: Date.now().toString(),
                      plantType: analysisResult.plantType,
                      lastScanDate: new Date(),
                      nextReminderDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
                      message: `🌱 Time to check your ${analysisResult.plantType} plant! Upload a new photo to track growth & health.`
                    };
                    setPlantReminders(prev => [reminder, ...prev.slice(0, 4)]); // Keep last 5
                  }
                };
                reader2.readAsDataURL(selectedImage);
                
                toast({
                  title: "Analysis Complete!",
                  description: `Disease detection finished with ${analysisResult.confidence.toLowerCase()} confidence.`,
                });
              } else {
                throw new Error('No valid JSON found in response');
              }
            } catch (parseError) {
              console.error('Error parsing AI response:', parseError);
              const fallbackResult: DiseaseResult = {
                disease: "Analysis Incomplete",
                confidence: "Low",
                description: "Unable to provide detailed analysis. Please try with a clearer image of plant leaves.",
                symptoms: ["Image quality may be insufficient for analysis"],
                treatment: "Please consult with a local gardening expert for accurate diagnosis.",
                prevention: ["Ensure good air circulation", "Avoid overwatering", "Maintain proper plant spacing"],
                severity: "low",
                isValidPlant: true
              };
              setResult(fallbackResult);
            }
          }
        } catch (apiError) {
          console.error('Error calling Gemini API:', apiError);
          toast({
            title: "Analysis Failed",
            description: "Unable to analyze the image. Please check your internet connection and try again.",
            variant: "destructive",
          });
        }
      };

      reader.readAsDataURL(selectedImage);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Error",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;

    const content = `🌿 PLANT DISEASE ANALYSIS REPORT 🌿

Generated: ${new Date().toLocaleString()}
Image: ${selectedImage?.name || 'Camera Capture'}

═══════════════════════════════════════

📊 ANALYSIS RESULTS:
Disease/Condition: ${result.disease}
Confidence Level: ${result.confidence}
Severity: ${result.severity.toUpperCase()}

📝 DESCRIPTION:
${result.description}

🔍 SYMPTOMS OBSERVED:
${result.symptoms.map(symptom => `• ${symptom}`).join('\n')}

💊 TREATMENT RECOMMENDATIONS:
${result.treatment}

🛡️ PREVENTION MEASURES:
${result.prevention.map(prevention => `• ${prevention}`).join('\n')}

═══════════════════════════════════════

⚠️ IMPORTANT DISCLAIMER:
This AI analysis is for informational purposes only. For critical plant health issues, always consult with a certified horticulture expert or plant pathologist for accurate diagnosis and treatment.

Generated by Smart Gardening Assistant
Powered by Sugam Kaistha & KaisthaGroups
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plant-disease-analysis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded!",
      description: "Your detailed disease analysis report has been saved.",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <div className="bg-green-500 rounded-full p-2">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span>AI Plant Disease Detection</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Zap className="h-3 w-3 mr-1" />
              Enhanced AI
            </Badge>
          </CardTitle>
          <CardDescription className="text-base">
            Advanced AI-powered disease detection with real-time camera support and validation
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="flex-1 h-12 border-garden-green/20 hover:bg-garden-green/10"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload Image
        </Button>
        <Button
          onClick={startCamera}
          variant="outline"
          className="flex-1 h-12 border-garden-green/20 hover:bg-garden-green/10"
        >
          <Video className="h-5 w-5 mr-2" />
          Use Camera
        </Button>
        <Button
          onClick={() => setShowHistory(!showHistory)}
          variant="outline"
          className="flex-1 h-12 border-garden-green/20 hover:bg-garden-green/10"
        >
          <History className="h-5 w-5 mr-2" />
          History ({detectionHistory.length})
        </Button>
      </div>

      {/* History Panel */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5 text-garden-green" />
              <span>Detection History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {detectionHistory.length > 0 ? (
                <div className="space-y-3">
                  {detectionHistory.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{entry.result.disease}</h4>
                          <p className="text-sm text-muted-foreground">{entry.imageName}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getSeverityColor(entry.result.severity)}>
                            {entry.result.severity}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {entry.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No detection history yet</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Camera Mode */}
      {isCameraMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Live Camera</span>
              <Button onClick={stopCamera} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Close Camera
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg shadow-md"
                style={{ maxHeight: '400px' }}
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="bg-garden-green hover:bg-garden-green/90 rounded-full h-16 w-16"
                >
                  <Camera className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      )}

      {/* Image Upload/Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-garden-green" />
            <span>Plant Image Analysis</span>
          </CardTitle>
          <CardDescription>
            Upload a clear photo of plant leaves for AI-powered disease detection and health assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Image Preview/Upload Area */}
            <div className="border-2 border-dashed border-garden-green/30 rounded-lg p-8 text-center bg-garden-light/20">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Selected plant"
                    className="max-h-80 mx-auto rounded-lg shadow-md border border-garden-green/20"
                  />
                  <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Different Image
                    </Button>
                    <Button
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="bg-garden-green hover:bg-garden-green/90"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Analyze with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Camera className="h-16 w-16 mx-auto text-garden-green/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-garden-green">Upload Plant Image</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop an image or click to browse
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-garden-green/20 hover:bg-garden-green/10"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Enhanced Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📸 Photography Tips:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Use natural lighting, avoid flash</li>
                  <li>• Focus on affected leaves/areas</li>
                  <li>• Include multiple leaves if possible</li>
                  <li>• Avoid blurry or distant photos</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">🤖 AI Enhancement:</h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• Advanced validation system</li>
                  <li>• Rejects non-plant images</li>
                  <li>• Severity assessment included</li>
                  <li>• Comprehensive treatment plans</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Results Section */}
      {result && (
        <Card className="border-garden-green/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {result.disease.toLowerCase().includes('healthy') ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <CardTitle>AI Disease Analysis Results</CardTitle>
                <Badge className={getSeverityColor(result.severity)}>
                  {result.severity} severity
                </Badge>
              </div>
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Main Result */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-garden-light/50 to-sky-blue/30 rounded-lg border border-garden-green/20">
                <div>
                  <h3 className="text-2xl font-bold text-garden-green">{result.disease}</h3>
                  <p className="text-muted-foreground mt-1">{result.description}</p>
                </div>
                <Badge 
                  variant={result.confidence === 'High' ? 'default' : result.confidence === 'Medium' ? 'secondary' : 'outline'}
                  className="text-lg py-2 px-4"
                >
                  {result.confidence} Confidence
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Symptoms */}
                <Card className="border-orange-200 dark:border-orange-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-700 dark:text-orange-400">
                      🔍 Observed Symptoms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.symptoms.map((symptom, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-sm">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Prevention */}
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-700 dark:text-blue-400">
                      🛡️ Prevention Measures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.prevention.map((prevention, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-sm">{prevention}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Treatment */}
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-lg text-green-700 dark:text-green-400">
                    💊 Treatment Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                    <p className="text-sm leading-relaxed">{result.treatment}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Plant Intelligence */}
              {(result.plantType || result.scientificName || result.estimatedAge) && (
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-700 dark:text-purple-400">
                      🧠 AI Plant Intelligence
                    </CardTitle>
                    <CardDescription>
                      Comprehensive plant analysis and growth insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {result.plantType && (
                          <div>
                            <h5 className="font-semibold text-sm text-purple-700 dark:text-purple-400 mb-1">Plant Type</h5>
                            <p className="text-sm">{result.plantType}</p>
                          </div>
                        )}
                        {result.scientificName && (
                          <div>
                            <h5 className="font-semibold text-sm text-purple-700 dark:text-purple-400 mb-1">Scientific Name</h5>
                            <p className="text-sm italic">{result.scientificName}</p>
                          </div>
                        )}
                        {result.estimatedAge && (
                          <div>
                            <h5 className="font-semibold text-sm text-purple-700 dark:text-purple-400 mb-1">Estimated Age</h5>
                            <p className="text-sm">{result.estimatedAge}</p>
                          </div>
                        )}
                        {result.timeToMaturity && (
                          <div>
                            <h5 className="font-semibold text-sm text-purple-700 dark:text-purple-400 mb-1">Time to Maturity</h5>
                            <p className="text-sm">{result.timeToMaturity}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {result.waterRequirements && (
                          <div>
                            <h5 className="font-semibold text-sm text-purple-700 dark:text-purple-400 mb-1">Water Requirements</h5>
                            <p className="text-sm">{result.waterRequirements}</p>
                          </div>
                        )}
                        {result.soilRequirements && (
                          <div>
                            <h5 className="font-semibold text-sm text-purple-700 dark:text-purple-400 mb-1">Soil Requirements</h5>
                            <p className="text-sm">{result.soilRequirements}</p>
                          </div>
                        )}
                        {result.sunlightNeeds && (
                          <div>
                            <h5 className="font-semibold text-sm text-purple-700 dark:text-purple-400 mb-1">Sunlight Needs</h5>
                            <p className="text-sm">{result.sunlightNeeds}</p>
                          </div>
                        )}
                        {(result.co2Absorption || result.oxygenRelease) && (
                          <div>
                            <h5 className="font-semibold text-sm text-purple-700 dark:text-purple-400 mb-1">Environmental Impact</h5>
                            <div className="text-sm space-y-1">
                              {result.co2Absorption && <p>CO₂ Absorption: {result.co2Absorption}</p>}
                              {result.oxygenRelease && <p>O₂ Release: {result.oxygenRelease}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Plant Reminders */}
              {plantReminders.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-amber-700 dark:text-amber-400">
                      🔔 Smart Plant Reminders
                    </CardTitle>
                    <CardDescription>
                      AI-generated reminders based on your plant analysis history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {plantReminders.map((reminder) => (
                        <div key={reminder.id} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                                {reminder.plantType}
                              </h5>
                              <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                                {reminder.message}
                              </p>
                              <p className="text-xs text-amber-600 dark:text-amber-400">
                                Last scan: {reminder.lastScanDate.toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="ml-4 border-amber-300 hover:bg-amber-100 text-amber-700"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Upload New Photo
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Disclaimer */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>AI Disclaimer:</strong> This enhanced AI analysis uses advanced validation and assessment. 
                      However, for critical plant health issues or when in doubt, always consult with a certified 
                      horticulture expert or plant pathologist for professional diagnosis and treatment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};