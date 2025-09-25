
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Loader2, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiseaseResult {
  disease: string;
  confidence: string;
  description: string;
  symptoms: string[];
  treatment: string;
  prevention: string[];
}

export const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
        description: "Please select an image to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64Image = base64Data.split(',')[1];

        const prompt = `Analyze this plant leaf image for diseases. Based on what you see, provide a detailed analysis in the following JSON format:
        {
          "disease": "Disease name or 'Healthy' if no disease detected",
          "confidence": "High/Medium/Low confidence level",
          "description": "Brief description of the condition",
          "symptoms": ["symptom1", "symptom2", "symptom3"],
          "treatment": "Detailed treatment recommendations",
          "prevention": ["prevention1", "prevention2", "prevention3"]
        }

        If the image is not clear or not a plant leaf, indicate that in the disease field.`;

        try {
          const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA3Vm4fLcDD9etw95dbYbdOFusadiAXQ1E', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
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
                const analysisResult = JSON.parse(jsonMatch[0]);
                setResult(analysisResult);
                toast({
                  title: "Analysis Complete!",
                  description: "Your plant image has been analyzed.",
                });
              } else {
                throw new Error('No valid JSON found in response');
              }
            } catch (parseError) {
              console.error('Error parsing AI response:', parseError);
              // Fallback result
              setResult({
                disease: "Analysis Incomplete",
                confidence: "Low",
                description: "Unable to provide detailed analysis. Please try with a clearer image.",
                symptoms: ["Image quality may be insufficient for analysis"],
                treatment: "Please consult with a local gardening expert for accurate diagnosis.",
                prevention: ["Ensure good air circulation", "Avoid overwatering", "Maintain proper plant spacing"]
              });
            }
          }
        } catch (apiError) {
          console.error('Error calling Gemini API:', apiError);
          toast({
            title: "Analysis Failed",
            description: "Unable to analyze the image. Please try again.",
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

    const content = `Plant Disease Analysis Report

Disease: ${result.disease}
Confidence Level: ${result.confidence}

Description:
${result.description}

Symptoms Observed:
${result.symptoms.map(symptom => `- ${symptom}`).join('\n')}

Treatment Recommendations:
${result.treatment}

Prevention Measures:
${result.prevention.map(prevention => `- ${prevention}`).join('\n')}

---
Generated by Smart Gardening Assistant
Disclaimer: This analysis is for informational purposes only. Always consult with a horticulture expert for critical issues.
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plant-disease-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded!",
      description: "Your disease analysis report has been saved.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-garden-green" />
            <span>Upload Plant Image</span>
          </CardTitle>
          <CardDescription>
            Take a clear photo of the affected plant leaves for AI-powered disease detection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Selected plant"
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <div className="flex justify-center space-x-4">
                    <label htmlFor="image-upload">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Different Image
                        </span>
                      </Button>
                    </label>
                    <Button
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="bg-garden-green hover:bg-garden-green/90"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Plant'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload Plant Image</h3>
                  <p className="text-gray-500 mb-4">
                    Drag and drop an image or click to browse
                  </p>
                  <label htmlFor="image-upload">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </span>
                    </Button>
                  </label>
                </div>
              )}
            </div>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Tips for Better Results:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use good lighting and avoid shadows</li>
                <li>• Focus on affected leaves or areas</li>
                <li>• Include multiple leaves if possible</li>
                <li>• Avoid blurry or distant photos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {result.disease.toLowerCase().includes('healthy') ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <CardTitle>Disease Analysis Results</CardTitle>
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
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-xl font-semibold">{result.disease}</h3>
                  <p className="text-gray-600">{result.description}</p>
                </div>
                <Badge 
                  variant={result.confidence === 'High' ? 'default' : result.confidence === 'Medium' ? 'secondary' : 'outline'}
                >
                  {result.confidence} Confidence
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Symptoms */}
                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-700">Symptoms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.symptoms.map((symptom, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-sm">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Prevention */}
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-700">Prevention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.prevention.map((prevention, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-sm">{prevention}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Treatment */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">Treatment Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{result.treatment}</p>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> This AI analysis is for informational purposes only. 
                  For critical plant health issues, always consult with a certified horticulture expert 
                  or plant pathologist for accurate diagnosis and treatment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
