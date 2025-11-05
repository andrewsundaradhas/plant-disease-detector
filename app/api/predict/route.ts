import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define the Prediction interface
interface Prediction {
  className: string;
  probability: number;
  diseaseInfo?: {
    name: string;
    description: string;
    solution: string[];
  };
}

// This is a simple API route that just returns a success response
// The actual model inference will happen on the client side

// Configure the API route
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum execution time in seconds

// Simple response type
type UploadResponse = {
  success: boolean;
  message: string;
  fileId?: string;
  error?: string;
};

// Helper function to parse multipart form data
async function parseFormData(request: Request): Promise<FormData> {
  const formData = await request.formData();
  return formData;
}

export async function POST(request: Request) {
  // Check content type
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('multipart/form-data')) {
    return NextResponse.json(
      { success: false, message: 'Content type must be multipart/form-data' } as UploadResponse,
      { status: 400 }
    );
  }

  try {
    // Parse form data
    const formData = await parseFormData(request);
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image file provided' } as UploadResponse,
        { status: 400 }
      );
    }

    // Generate a unique file ID
    const fileId = uuidv4();
    const fileName = `${fileId}.${file.name.split('.').pop()}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save the file temporarily (in a real app, you'd want to store this in a proper storage solution)
    const path = join(process.cwd(), 'public', 'uploads', fileName);
    await writeFile(path, buffer);
    
    // Return success response with file ID
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileId: fileName
    } as UploadResponse);
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error processing your request',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as UploadResponse,
      { status: 500 }
    );
  }
}

// This function would be moved to the client side in a real implementation
function calculateHealthScore(predictions: Prediction[]): number {
  if (!predictions || predictions.length === 0) return 0;
  
  // Calculate average confidence of predictions
  const totalConfidence = predictions.reduce((sum, pred) => sum + pred.probability, 0);
  const avgConfidence = totalConfidence / predictions.length;
  
  // Map confidence to health score (0-100)
  return Math.round(avgConfidence * 100);
}

function generateRecommendations(predictions: Prediction[]): string[] {
  const recommendations: string[] = [];
  
  if (!predictions || predictions.length === 0) {
    return [
      'No predictions available.',
      'Try taking a clearer photo with better lighting.',
      'Make sure the plant is the main subject of the photo.'
    ];
  }

  const topPrediction = predictions[0];
  const confidence = topPrediction.probability;
  const label = topPrediction.className.toLowerCase();
  
  // Basic recommendations based on confidence
  if (confidence < 0.3) {
    recommendations.push('The image quality might be too low for accurate analysis.');
    recommendations.push('Try taking a clearer photo with better lighting.');
  } else if (confidence < 0.6) {
    recommendations.push('The prediction has moderate confidence. Consider taking additional photos from different angles.');
  } else {
    recommendations.push('High confidence prediction. Consider consulting with a local expert for confirmation.');
  }
  
  // Add specific recommendations based on common plant issues
  if (label.includes('spot') || label.includes('blight')) {
    recommendations.push('Remove and destroy affected leaves to prevent spread.');
    recommendations.push('Avoid overhead watering to reduce leaf wetness.');
    recommendations.push('Apply appropriate fungicide if problem persists.');
  } else if (label.includes('mildew') || label.includes('powdery')) {
    recommendations.push('Improve air circulation around plants.');
    recommendations.push('Water at the base of plants, not on leaves.');
    recommendations.push('Apply appropriate fungicide if problem persists.');
  } else if (label.includes('aphid') || label.includes('mite')) {
    recommendations.push('Use a strong spray of water to dislodge pests.');
    recommendations.push('Introduce beneficial insects like ladybugs.');
    recommendations.push('Consider insecticidal soap or neem oil for heavy infestations.');
  } else if (label.includes('healthy')) {
    recommendations.push('Your plant appears healthy! Continue with current care routine.');
    recommendations.push('Regularly inspect for early signs of pests or diseases.');
  } else {
    // General plant care recommendations
    recommendations.push('Ensure proper watering - most plants prefer soil that is moist but not waterlogged.');
    recommendations.push('Provide adequate sunlight based on the plant species requirements.');
    recommendations.push('Use well-draining soil to prevent root rot.');
  }

  return recommendations;
}
