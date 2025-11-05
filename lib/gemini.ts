import { GoogleGenerativeAI } from '@google/generative-ai';

// Types
export interface GeminiDiseaseAnalysis {
  disease_name: string;
  scientific_name?: string;
  description: string;
  causes: string[];
  symptoms: string[];
  prevention: string[];
  treatment: string[];
  severity: 'low' | 'medium' | 'high';
  is_contagious: boolean;
  affected_plants: string[];
  _cached?: boolean; // Internal flag to indicate if response came from cache
}

// Initialize Gemini API
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not configured');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple in-memory cache
const cache = new Map<string, { data: GeminiDiseaseAnalysis; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Generate a cache key for disease analysis
 */
function getCacheKey(diseaseName: string): string {
  return `gemini:analysis:${diseaseName.toLowerCase().replace(/\s+/g, '-')}`;
}

/**
 * Get disease analysis from cache or generate a new one
 */
export async function getDiseaseAnalysis(diseaseName: string, confidence: number): Promise<GeminiDiseaseAnalysis> {
  const cacheKey = getCacheKey(diseaseName);
  
  // Check in-memory cache first
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log(`Cache hit for disease: ${diseaseName}`);
    return {
      ...cached.data,
      _cached: true,
    };
  }

  // Generate analysis using Gemini API
  console.log(`Generating analysis for disease: ${diseaseName}`);
  const analysis = await generateAnalysis(diseaseName, confidence);
  
  try {
    // Cache the result in memory
    cache.set(cacheKey, {
      data: analysis,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Cache write error:', error);
    // Continue without caching if there's an error
  }
  
  return analysis;
}

/**
 * Generate disease analysis using Gemini API
 */
async function generateAnalysis(diseaseName: string, confidence: number): Promise<GeminiDiseaseAnalysis> {
  const prompt = `You are a plant pathologist. Analyze the plant disease: "${diseaseName}" (Confidence: ${(confidence * 100).toFixed(1)}%).

Provide a detailed analysis in the following JSON format. Be specific and include practical information for farmers and gardeners.

{
  "disease_name": "Common name of the disease",
  "scientific_name": "Scientific name (genus and species if known)",
  "description": "A 2-3 sentence overview of the disease, its impact, and common characteristics.",
  "causes": [
    "Primary cause 1",
    "Contributing factor 2",
    "Environmental condition 3"
  ],
  "symptoms": [
    "Early symptom 1 (e.g., small yellow spots on leaves)",
    "Progressive symptom 2 (e.g., spots enlarge and turn brown)",
    "Advanced symptom 3 (e.g., leaf wilting and defoliation)"
  ],
  "prevention": [
    "Cultural practice 1 (e.g., crop rotation)",
    "Environmental control 2 (e.g., proper spacing)",
    "Preventive treatment 3 (e.g., resistant varieties)"
  ],
  "treatment": [
    "Immediate action 1 (e.g., remove infected leaves)",
    "Organic treatment 2 (e.g., neem oil application)",
    "Chemical treatment 3 (if necessary, with safety precautions)"
  ],
  "severity": "low/medium/high",
  "is_contagious": true/false,
  "affected_plants": [
    "Common plant 1",
    "Common plant 2",
    "Common plant 3"
  ]
}

Additional guidelines:
- Keep descriptions concise but informative
- List 3-5 items for each array
- Use bullet points for better readability
- Include both organic and conventional treatment options
- Consider environmental impact in recommendations`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2000,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    const analysis = JSON.parse(jsonString) as GeminiDiseaseAnalysis;

    // Validate the response
    if (!analysis.disease_name || !analysis.description) {
      throw new Error('Incomplete response from Gemini API');
    }

    return analysis;
  } catch (error) {
    console.error('Gemini API error:', error);
    // Return a fallback response
    return {
      disease_name: diseaseName,
      description: 'Could not retrieve detailed analysis. Please try again later.',
      causes: [],
      symptoms: [],
      prevention: [],
      treatment: [],
      severity: confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low',
      is_contagious: false,
      affected_plants: []
    };
  }
}

// Export types for use in other files
export type { GeminiDiseaseAnalysis as DiseaseAnalysis };
