'use client';

import { useState } from 'react';
import { AnalysisContent } from "@/components/analysis-content";
import { ImageUpload } from "@/components/image-upload";

export default function TestAnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plant Disease Analysis</h1>
        <p className="text-muted-foreground">
          Upload an image of your plant to detect diseases and get recommendations
        </p>
      </div>
      
      {!analysisResult ? (
        <ImageUpload 
          onAnalysisComplete={handleAnalysisComplete}
          onLoadingChange={setIsLoading}
        />
      ) : (
        <div className="space-y-8">
          <div className="flex justify-end">
            <button
              onClick={handleNewAnalysis}
              className="text-sm text-primary hover:underline flex items-center gap-1"
              disabled={isLoading}
            >
              ← Upload another image
            </button>
          </div>
          
          <AnalysisContent 
            analysisResult={analysisResult}
            onNewAnalysis={handleNewAnalysis}
          />
        </div>
      )}
      
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg border flex flex-col items-center gap-4 max-w-sm w-full mx-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-lg font-medium">Analyzing your plant</h3>
            <p className="text-sm text-muted-foreground text-center">
              This may take a few moments. Please don't close this page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
