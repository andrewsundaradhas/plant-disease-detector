'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnalysisContent } from "@/components/analysis-content";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for result in URL params
  useEffect(() => {
    const resultParam = searchParams.get('result');
    if (resultParam) {
      try {
        const result = JSON.parse(decodeURIComponent(resultParam));
        setAnalysisResult(result);
      } catch (e) {
        console.error('Error parsing result:', e);
        setError('Failed to load analysis results');
      }
    }
  }, [searchParams]);

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
    // Update URL without page reload
    window.history.pushState({}, '', `/analysis?result=${encodeURIComponent(JSON.stringify(result))}`);
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    // Clear the URL parameter
    window.history.pushState({}, '', '/analysis');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h2 className="text-2xl font-semibold">Analyzing your plant...</h2>
          <p className="text-muted-foreground">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={handleNewAnalysis} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plant Disease Analysis</h1>
        <p className="text-muted-foreground">
          {analysisResult ? 'Analysis Results' : 'Upload an image to analyze your plant'}
        </p>
      </div>
      
      {analysisResult ? (
        <div className="space-y-8">
          <div className="flex justify-end">
            <Button 
              onClick={handleNewAnalysis}
              variant="outline"
              className="gap-2"
            >
              Analyze Another Image
            </Button>
          </div>
          
          <AnalysisContent 
            analysisResult={analysisResult}
            onNewAnalysis={handleNewAnalysis}
          />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <ImageUpload 
            onAnalysisComplete={handleAnalysisComplete}
            onLoadingChange={setIsLoading}
          />
          
          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-medium mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Upload a clear photo of your plant's leaves or affected area</li>
              <li>Our AI will analyze the image for signs of disease</li>
              <li>Get detailed information about any detected issues</li>
              <li>Receive personalized treatment recommendations</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
