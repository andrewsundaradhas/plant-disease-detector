import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let model: mobilenet.MobileNet | null = null;

// Load the model when the server starts
export async function loadModel() {
  if (!model) {
    console.log('Loading MobileNet model...');
    // @ts-ignore
    model = await mobilenet.load();
    console.log('Model loaded successfully');
  }
  return model;
}

// Predict function
export async function predictDisease(imageElement: HTMLImageElement) {
  try {
    const model = await loadModel();
    const predictions = await model.classify(imageElement);
    
    // Map predictions to our expected format
    return {
      success: true,
      predictions: predictions.map(pred => ({
        className: pred.className,
        probability: pred.probability,
      })),
      metadata: {
        model: 'MobileNet',
        version: '2.1.0',
      }
    };
  } catch (error) {
    console.error('Prediction error:', error);
    return {
      success: false,
      error: 'Failed to process image',
    };
  }
}
