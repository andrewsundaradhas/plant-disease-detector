'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

interface ImageUploadProps {
  onAnalysisComplete: (result: any) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function ImageUpload({ onAnalysisComplete, onLoadingChange }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPEG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || isLoading) return;

    setIsLoading(true);
    setProgress(10);
    if (onLoadingChange) onLoadingChange(true);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      console.log('Sending request to /api/analyze...');
      
      // Show progress
      setProgress(30);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let the browser set it with the correct boundary
      });

      console.log('Response status:', response.status);
      setProgress(70);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');
      
      if (!response.ok) {
        let errorMessage = `Server responded with ${response.status} ${response.statusText}`;
        let errorDetails = '';
        let errorCode = 'SERVER_ERROR';
        
        try {
          if (isJson) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            errorMessage = errorData.error?.message || errorData.message || errorMessage;
            errorDetails = errorData.error?.details || '';
            errorCode = errorData.error?.code || errorCode;
          } else {
            const text = await response.text();
            console.error('Non-JSON error response:', text);
            errorDetails = text.length > 200 ? text.substring(0, 200) + '...' : text;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        
        throw new Error(
          errorDetails 
            ? `${errorMessage}: ${errorDetails}` 
            : errorMessage
        );
      }

      if (!isJson) {
        throw new Error('Server returned an invalid response format');
      }

      const result = await response.json();
      console.log('Analysis result:', result);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Analysis failed');
      }
      
      // Update progress before redirecting
      setProgress(90);
      
      // Use the onAnalysisComplete callback if provided, otherwise redirect
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      } else {
        // Redirect to the analysis page with the result
        window.location.href = `/analysis?result=${encodeURIComponent(JSON.stringify(result))}`;
      }
      
      setProgress(100);
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      // Format error message for user
      let userMessage = 'Failed to analyze image';
      if (error instanceof Error) {
        userMessage = error.message;
        // Clean up common error messages
        if (userMessage.includes('Failed to fetch')) {
          userMessage = 'Could not connect to the server. Please check your internet connection.';
        } else if (userMessage.includes('NetworkError')) {
          userMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      toast({
        title: 'Analysis failed',
        description: userMessage,
        variant: 'destructive',
        duration: 5000, // Show for 5 seconds
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        if (onLoadingChange) onLoadingChange(false);
        setProgress(0);
      }, 500);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Plant Image</CardTitle>
        <CardDescription>
          Upload an image of a plant to analyze for diseases and get recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isLoading}
        />

        {previewUrl ? (
          <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                onClick={triggerFileInput}
                disabled={isLoading}
              >
                Change Image
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="relative aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={triggerFileInput}
          >
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG up to 5MB
              </p>
            </div>
          </div>
        )}

        {progress > 0 && progress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex justify-end gap-2">
          {previewUrl && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl('');
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Analyze Image
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
