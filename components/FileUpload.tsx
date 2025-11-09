'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess?: (fileData: {
    fileKey: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
  }) => void;
  className?: string;
}

export default function FileUpload({ onUploadSuccess, className = '' }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Starting file upload...', {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({
        error: 'Invalid response from server',
        details: 'The server returned an invalid JSON response',
      }));
      
      console.log('Upload response:', {
        status: response.status,
        ok: response.ok,
        data,
      });
      
      if (!response.ok) {
        console.error('Upload failed with status:', response.status, 'Data:', data);
        
        let errorMessage = data?.error || 'Upload failed';
        let errorDetails = data?.details;
        
        // Handle specific S3 errors
        if (data?.details?.name === 'InvalidAccessKeyId') {
          errorMessage = 'Invalid AWS Access Key ID';
          errorDetails = 'Please check your AWS_ACCESS_KEY_ID in the .env.local file';
        } else if (data?.details?.name === 'SignatureDoesNotMatch') {
          errorMessage = 'Invalid AWS Secret Access Key';
          errorDetails = 'Please check your AWS_SECRET_ACCESS_KEY in the .env.local file';
        } else if (data?.details?.name === 'NoSuchBucket') {
          errorMessage = 'S3 Bucket Not Found';
          errorDetails = `The bucket "${data?.details?.bucket || 'unknown'}" doesn't exist or you don't have permission to access it`;
        } else if (data?.details?.name === 'AccessDenied') {
          errorMessage = 'Access Denied to S3';
          errorDetails = 'Check your IAM user permissions and bucket policy';
        }
        
        throw new Error(
          errorDetails 
            ? `${errorMessage}: ${JSON.stringify(errorDetails, null, 2)}`
            : errorMessage
        );
      }
      
      if (!data.success) {
        console.error('Upload failed with data:', data);
        throw new Error(data.error || 'Upload failed');
      }
      
      console.log('Upload successful:', data);
      
      toast({
        title: 'Success',
        description: 'File uploaded successfully!',
      });
      
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Failed to upload file';
      let errorDetails = '';
      
      if (error instanceof Error) {
        if (error.message.includes('NetworkError')) {
          errorMessage = 'Network error';
          errorDetails = 'Please check your internet connection and try again.';
        } else if (error.message.includes('credentials') || error.message.includes('Access Denied')) {
          errorMessage = 'AWS Authentication Error';
          errorDetails = 'Please verify your AWS credentials in the .env.local file';
        } else if (error.message.includes('bucket') || error.message.includes('S3')) {
          errorMessage = 'S3 Configuration Error';
          errorDetails = error.message;
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      toast({
        title: errorMessage,
        description: errorDetails || 'Please try again or contact support if the problem persists.',
        variant: 'destructive',
        duration: 10000,
      });
    } finally {
      setIsUploading(false);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer font-medium text-primary hover:text-primary/90"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
            <span className="pl-1">or drag and drop</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {file ? file.name : 'PNG, JPG, GIF up to 10MB'}
          </p>
        </div>
      </div>

      {file && (
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 flex items-center justify-center bg-muted rounded">
                <span className="text-xs font-medium">
                  {file.name.split('.').pop()?.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null);
              const fileInput = document.getElementById('file-upload') as HTMLInputElement;
              if (fileInput) fileInput.value = '';
            }}
            disabled={isUploading}
          >
            Remove
          </Button>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          'Upload to S3'
        )}
      </Button>
    </div>
  );
}
