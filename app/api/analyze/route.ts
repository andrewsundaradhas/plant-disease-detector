// Force this route to use Node.js runtime instead of Edge Runtime
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

// Plant.id configuration
const PLANT_ID_API_KEY = process.env.PLANT_ID_API_KEY;
const PLANT_ID_URL = 'https://api.plant.id/v2/identify';

if (!PLANT_ID_API_KEY) {
  console.error('PLANT_ID_API_KEY is not set in environment variables');
  throw new Error('Server configuration error: PLANT_ID_API_KEY is not configured');
}

// Helper function to handle errors
function handleError(message: string, status: number = 500, details: any = {}) {
  console.error(`[${status}] ${message}`, details);
  return NextResponse.json(
    { 
      success: false, 
      error: {
        message,
        details: status === 500 ? 'Internal server error' : details,
        code: status === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR'
      }
    },
    { status }
  );
}

export async function POST(request: Request) {
  try {
    console.log('Starting analysis request...');
    
    // Check if this is a form data request
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      console.error('Invalid content type:', contentType);
      return NextResponse.json(
        { 
          success: false, 
          error: {
            message: 'Invalid content type',
            details: 'Content type must be multipart/form-data',
            code: 'INVALID_CONTENT_TYPE'
          }
        },
        { status: 400 }
      );
    }
    
    // Parse form data and get the image file
    let file: File | null = null;
    let base64Data = '';
    
    try {
      const formData = await request.formData();
      const imageData = formData.get('image');
      
      if (!(imageData instanceof File)) {
        return handleError('Invalid file format', 400, { code: 'INVALID_FILE' });
      }
      
      file = imageData;
      
      // Read the file as base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Data = buffer.toString('base64');
      
      if (!file) {
        return handleError('No image file provided', 400, { code: 'NO_IMAGE' });
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return handleError('Invalid file type. Please upload an image file.', 400, { 
          code: 'INVALID_FILE_TYPE',
          receivedType: file.type
        });
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return handleError('File is too large. Maximum size is 10MB.', 400, {
          code: 'FILE_TOO_LARGE',
          maxSize: '10MB',
          receivedSize: file.size
        });
      }
      
    } catch (error) {
      console.error('Error parsing form data:', error);
      return handleError('Invalid form data', 400, { 
        code: 'INVALID_FORM_DATA',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Build data URI for Plant.id
    const dataUri = `data:${file.type || 'image/jpeg'};base64,${base64Data}`;

    // Call Plant.id API
    let plantIdData: any = null;
    try {
      const response = await fetch(PLANT_ID_URL, {
        method: 'POST',
        headers: {
          'Api-Key': PLANT_ID_API_KEY as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: [dataUri],
          plant_details: ['common_names', 'url', 'wiki_description', 'taxonomy', 'synonyms', 'edible_parts', 'watering'],
          disease_details: ['description', 'treatment', 'classification', 'common_names'],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Plant.id error response:', text);
        return handleError('Plant identification failed', 502, { provider: 'plant.id', status: response.status, details: text });
      }

      plantIdData = await response.json();
    } catch (error) {
      console.error('Error calling Plant.id API:', error);
      return handleError('Failed to contact identification service', 502, { provider: 'plant.id' });
    }

    // Extract suggestions safely
    const suggestions: any[] = Array.isArray(plantIdData?.suggestions) ? plantIdData.suggestions : [];
    if (suggestions.length === 0) {
      return handleError('Could not identify plant from the image', 400, { code: 'NO_SUGGESTIONS' });
    }

    const top = suggestions[0] || {};
    const diseases: any[] = Array.isArray(top?.diseases) ? top.diseases : [];
    const diseaseNames: string[] = diseases.map(d => String(d?.name || d?.disease?.name || 'Unknown')).filter(Boolean);

    // Build predictions
    const predictions = (diseases.length > 0 ? diseases : [null]).map((d: any) => {
      const name = d ? (d.name || d?.disease?.name || 'Unknown disease') : (top?.plant_name ? `${top.plant_name} (no disease detected)` : 'Unknown');
      const description = d?.description?.value || d?.description || '';
      const treatment = Array.isArray(d?.treatment) ? d.treatment : (Array.isArray(d?.treatments) ? d.treatments : []);
      const severity: 'low' | 'medium' | 'high' = (d?.severity && ['low','medium','high'].includes(String(d.severity).toLowerCase()))
        ? String(d.severity).toLowerCase() as 'low' | 'medium' | 'high'
        : 'medium';
      const confidence = typeof top?.probability === 'number' ? Math.max(0, Math.min(1, top.probability)) : 0.6;

      return {
        label: name,
        confidence,
        disease: name,
        severity,
        recommendations: (treatment && treatment.length > 0) ? treatment : generateRecommendations(name),
        details: {
          disease_name: name,
          description,
          causes: [],
          symptoms: [],
          prevention: [],
          treatment: Array.isArray(treatment) ? treatment : [],
          is_contagious: false,
          affected_plants: Array.isArray(top?.common_names) ? top.common_names : [],
        }
      };
    });

    const health = diseases.length === 0 ? 90 : Math.max(20, 100 - Math.round(((top?.probability || 0.6) * 100) / 2));
    const analysis = {
      health,
      diseases: diseaseNames,
      recommendations: predictions[0]?.recommendations || [],
      timestamp: new Date().toISOString(),
      confidence: Math.round(((top?.probability || 0) * 100)),
      predictions,
      imageUrl: undefined,
      metadata: {
        model: 'plant.id',
        version: 'v2',
        analysis_provider: 'Plant.id API',
        analysis_timestamp: new Date().toISOString(),
      },
    };

    const result = {
      success: true,
      analysis,
      plantInfo: {
        bestMatch: {
          commonNames: Array.isArray(top?.common_names) ? top.common_names : [],
          scientificName: String(top?.plant_name || ''),
          score: typeof top?.probability === 'number' ? top.probability : undefined,
        }
      },
      timestamp: analysis.timestamp,
    };

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorResponse = {
      success: false,
      error: {
        message: 'Failed to analyze image',
        details: errorMessage,
        code: 'ANALYSIS_ERROR',
        timestamp: new Date().toISOString()
      }
    };

    console.error('Error in analyze route:', error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Fallback recommendations when provider doesn't include treatment guidance
function generateRecommendations(diseaseName: string): string[] {
  const name = (diseaseName || '').toLowerCase();
  const recs: string[] = [];

  if (!name || name.includes('healthy') || name.includes('no disease')) {
    return [
      'Plant appears healthy. Maintain current care routine.',
      'Water when the top inch of soil is dry and ensure proper drainage.',
      'Provide adequate sunlight and monitor regularly.'
    ];
  }

  if (name.includes('mildew') || name.includes('powdery')) {
    recs.push(
      'Improve air circulation and avoid overhead watering.',
      'Prune crowded foliage; apply neem oil or potassium bicarbonate spray.',
      'Remove heavily infected leaves.'
    );
  } else if (name.includes('leaf spot') || name.includes('spot') || name.includes('blight')) {
    recs.push(
      'Remove and dispose of infected leaves to reduce spread.',
      'Water at the base; avoid wetting foliage.',
      'Consider a copper-based fungicide if symptoms persist.'
    );
  } else if (name.includes('rust')) {
    recs.push(
      'Remove infected leaves and increase spacing for airflow.',
      'Apply sulfur or copper-based fungicide as directed.'
    );
  } else if (name.includes('mosaic') || name.includes('virus')) {
    recs.push(
      'Isolate the plant; disinfect tools.',
      'Control insect vectors (e.g., aphids).',
      'Remove severely affected plants if spread is likely.'
    );
  } else {
    recs.push(
      'Isolate affected plant to prevent spread.',
      'Remove visibly affected parts and improve growing conditions.',
      'Monitor progression and apply targeted treatment if identified.'
    );
  }

  // General tips
  recs.push(
    'Ensure proper sunlight for species; avoid waterlogging.',
    'Sanitize tools and remove plant debris around the base.'
  );

  return recs;
}
