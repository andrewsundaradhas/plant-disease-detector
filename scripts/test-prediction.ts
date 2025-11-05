import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDiseaseAnalysis } from '../lib/gemini';

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test image path (update this to a test image in your project)
const TEST_IMAGE_PATH = path.join(__dirname, '../../test-image.jpg');

// Mock PlantNet API response for testing
const MOCK_PLANTNET_RESPONSE = {
  predictions: [
    {
      label: 'Tomato Early Blight',
      confidence: 0.92,
      symptoms: [
        'Dark brown spots on lower leaves',
        'Yellow halos around spots',
        'Concentric rings in spots'
      ]
    }
  ]
};

async function testPrediction() {
  try {
    console.log('🚀 Starting prediction test...');
    
    // 1. Simulate PlantNet API call
    console.log('\n1. Calling PlantNet API...');
    const plantNetResult = MOCK_PLANTNET_RESPONSE;
    const mainPrediction = plantNetResult.predictions[0];
    
    console.log('✅ PlantNet API response:');
    console.log(`   - Disease: ${mainPrediction.label}`);
    console.log(`   - Confidence: ${(mainPrediction.confidence * 100).toFixed(1)}%`);
    
    // 2. Call Gemini API for detailed analysis
    console.log('\n2. Calling Gemini API for detailed analysis...');
    const geminiAnalysis = await getDiseaseAnalysis(
      mainPrediction.label,
      mainPrediction.confidence
    );
    
    console.log('✅ Gemini API response:');
    console.log(`   - Disease: ${geminiAnalysis.disease_name}`);
    console.log(`   - Scientific Name: ${geminiAnalysis.scientific_name || 'N/A'}`);
    console.log(`   - Severity: ${geminiAnalysis.severity}`);
    console.log(`   - Contagious: ${geminiAnalysis.is_contagious ? 'Yes' : 'No'}`);
    
    // 3. Display combined results
    console.log('\n📊 Combined Analysis:');
    console.log('-------------------');
    console.log(`🌱 Disease: ${geminiAnalysis.disease_name}`);
    console.log(`🔍 Confidence: ${(mainPrediction.confidence * 100).toFixed(1)}%`);
    console.log(`⚠️  Severity: ${geminiAnalysis.severity.toUpperCase()}`);
    console.log(`📝 Description: ${geminiAnalysis.description}`);
    
    console.log('\n🛡️  Prevention:');
    geminiAnalysis.prevention.forEach((item, i) => console.log(`   ${i + 1}. ${item}`));
    
    console.log('\n💊 Treatment:');
    geminiAnalysis.treatment.forEach((item, i) => console.log(`   ${i + 1}. ${item}`));
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the test
testPrediction();
