"use client"

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { 
  Upload, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Info,
  Leaf,
  Thermometer,
  Droplets,
  Sun,
  Bug,
  Shield
} from 'lucide-react';
import Image from 'next/image';

// Type definitions
export interface DiseaseDetails {
  disease_name: string;
  scientific_name?: string;
  description: string;
  causes: string[];
  symptoms: string[];
  prevention: string[];
  treatment: string[];
  is_contagious: boolean;
  affected_plants: string[];
}

export interface Prediction {
  label: string;
  confidence: number;
  disease: string;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  details?: DiseaseDetails;
}

export interface AnalysisResult {
  health: number;
  diseases: string[];
  recommendations: string[];
  timestamp: string;
  confidence: number;
  predictions: Prediction[];
  imageUrl?: string;
  status?: 'success' | 'error';
  analysisId?: string;
  image?: {
    name: string;
    type: string;
    size: number;
  };
  metadata?: {
    model: string;
    version: string;
    analysis_provider: string;
    analysis_timestamp: string;
  };
  message?: string;
}

// Helper component for severity badges
const SeverityBadge = ({ severity }: { severity: 'low' | 'medium' | 'high' }) => {
  const severityMap = {
    low: {
      label: 'Low',
      className: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
      icon: <CheckCircle className="h-4 w-4" aria-hidden="true" />
    },
    medium: {
      label: 'Medium',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200',
      icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />
    },
    high: {
      label: 'High',
      className: 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200',
      icon: <AlertCircle className="h-4 w-4" aria-hidden="true" />
    }
  };

  const { label, className, icon } = severityMap[severity] || severityMap.medium;

  return (
    <Badge 
      className={`gap-1 ${className}`} 
      variant="outline"
      aria-label={`Severity: ${label}`}
    >
      {icon}
      {label} Severity
    </Badge>
  );
};

// Helper component for info sections
const InfoSection = ({ 
  title, 
  items, 
  icon: Icon = Info,
  className = "",
  defaultOpen = true
}: { 
  title: string; 
  items: string[]; 
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  if (!items || items.length === 0) return null;

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      className={`space-y-2 ${className}`}
    >
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full flex items-center justify-between px-0 hover:bg-transparent"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
            <h4 className="text-sm font-medium text-left">{title}</h4>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-1 space-y-2 pl-6 text-sm text-muted-foreground list-disc">
          {items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              <span className="text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Helper component for the analysis card
const AnalysisCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  className = ''
}: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  className?: string;
}) => (
  <Card className={className}>
    <CardHeader className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </div>
      {description && (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      )}
    </CardHeader>
  </Card>
);


interface AnalysisContentProps {
  analysisResult: AnalysisResult | null;
  onNewAnalysis: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function AnalysisContent({
  analysisResult,
  onNewAnalysis,
  isLoading = false,
  error = null,
}: AnalysisContentProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    symptoms: true,
    causes: true,
    treatment: true,
    prevention: true
  });

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">No Analysis Data</h2>
        <p className="text-muted-foreground mt-2">
          Upload an image to analyze plant health
        </p>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 
              className="h-10 w-10 animate-spin text-primary" 
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Analyzing your plant...</h2>
          <p className="text-muted-foreground">
            Processing your image to detect any plant health issues
          </p>
        </div>
        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Processing</span>
            <span>0%</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription className="mt-2">
            {error || 'An error occurred while analyzing the image. Please try again.'}
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={onNewAnalysis}
            className="gap-2"
            aria-label="Try analysis again"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Get health status based on score
  const getHealthStatus = (score: number) => {
    if (score >= 75) return { label: 'Healthy', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 50) return { label: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const healthStatus = getHealthStatus(analysisResult.health);

  // Handle export functionality
  const handleExport = () => {
    if (!analysisResult) return;
    
    const blob = new Blob([JSON.stringify(analysisResult, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plant-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Analysis Overview */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Plant Health Analysis</CardTitle>
              <CardDescription className="mt-1">
                Analyzed on {formatDate(analysisResult.timestamp)}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="w-full sm:w-auto"
              aria-label="Export analysis report"
            >
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Health Score Card */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <AnalysisCard
              title="Health Score"
              value={`${analysisResult.health}%`}
              icon={Leaf}
              description={healthStatus.label}
              className={healthStatus.color}
            />
            
            <AnalysisCard
              title="Diseases Detected"
              value={analysisResult.diseases.length}
              icon={Bug}
              description={analysisResult.diseases.length > 0 ? 'Issues found' : 'No issues detected'}
            />
            
            <AnalysisCard
              title="Confidence"
              value={`${analysisResult.confidence}%`}
              icon={Thermometer}
              description="Analysis confidence level"
            />
            
            <AnalysisCard
              title="Recommendations"
              value={analysisResult.recommendations.length}
              icon={Shield}
              description="Actionable insights"
            />
          </div>
          
          {/* Image Preview */}
          {analysisResult.imageUrl && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Image Preview</h3>
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                <Image
                  src={analysisResult.imageUrl}
                  alt="Analyzed plant image"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          )}
          
          {/* General Recommendations */}
          {analysisResult.recommendations.length > 0 && (
            <div className="mt-6">
              <InfoSection 
                title="General Recommendations"
                items={analysisResult.recommendations}
                icon={Shield}
                defaultOpen={true}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      {analysisResult.predictions.map((prediction: Prediction, index: number) => (
        <Card key={`prediction-${index}`} className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-lg">
                  {prediction.details?.disease_name || prediction.disease}
                </CardTitle>
                {prediction.details?.scientific_name && (
                  <p className="text-sm text-muted-foreground">
                    {prediction.details.scientific_name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <SeverityBadge severity={prediction.severity} />
                <Badge variant="outline" className="gap-1">
                  <span>Confidence: </span>
                  <span className="font-semibold">{Math.round(prediction.confidence * 100)}%</span>
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Description */}
            {prediction.details?.description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  {prediction.details.description}
                </p>
              </div>
            )}
            
            {/* Symptoms */}
            <InfoSection 
              title="Symptoms"
              items={prediction.details?.symptoms || []}
              icon={AlertTriangle}
            />
            
            {/* Causes */}
            <InfoSection 
              title="Causes"
              items={prediction.details?.causes || []}
              icon={Bug}
            />
            
            {/* Treatment & Prevention */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Treatment Section */}
              {((prediction.details?.treatment && prediction.details.treatment.length > 0) || 
                (prediction.recommendations && prediction.recommendations.length > 0)) && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800">Treatment</h4>
                  <ul className="mt-1 list-disc pl-5 text-sm text-green-700">
                    {prediction.details?.treatment && prediction.details.treatment.length > 0 
                      ? prediction.details.treatment.map((treat: string, i: number) => (
                          <li key={`treat-${i}`}>{treat}</li>
                        ))
                      : prediction.recommendations?.map((rec: string, i: number) => (
                          <li key={`rec-${i}`}>{rec}</li>
                        ))
                    }
                  </ul>
                </div>
              )}
              
              {/* Prevention Section */}
              {prediction.details?.prevention && prediction.details.prevention.length > 0 && (
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-amber-800">Prevention</h4>
                  <ul className="mt-1 list-disc pl-5 text-sm text-amber-700">
                    {prediction.details.prevention.map((prev: string, i: number) => (
                      <li key={`prev-${i}`}>{prev}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Affected Plants */}
            {prediction.details?.affected_plants && prediction.details.affected_plants.length > 0 && (
              <InfoSection 
                title="Commonly Affected Plants"
                items={prediction.details.affected_plants}
                icon={Leaf}
              />
            )}
            
            {/* Contagion Warning */}
            {prediction.details?.is_contagious && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Contagious Disease</AlertTitle>
                <AlertDescription className="text-red-700">
                  This disease is contagious. Isolate affected plants and take preventive measures to avoid spreading.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <Button 
          variant="outline" 
          onClick={onNewAnalysis}
          className="w-full sm:w-auto"
          aria-label="Start a new analysis"
        >
          <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
          New Analysis
        </Button>
        <Button 
          onClick={handleExport}
          className="w-full sm:w-auto"
          aria-label="Export analysis report"
        >
          <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
          Export Report
        </Button>
      </div>
    </div>
  );
}
