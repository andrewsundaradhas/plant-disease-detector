'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleUploadSuccess = (fileData: any) => {
    console.log('File uploaded successfully:', fileData);
    setUploadedFiles(prev => [fileData, ...prev]);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Files to S3</h1>
        <div className="bg-card p-6 rounded-lg shadow mb-8">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recently Uploaded Files</h2>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <p className="font-medium">{file.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(file.uploadedAt).toLocaleString()}
                  </p>
                  <a 
                    href={file.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View File
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
