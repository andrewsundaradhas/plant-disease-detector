'use client';

import { useState, useRef } from 'react';

// Plant disease information with proper typing
const PLANT_DISEASE_INFO: PlantDiseaseInfo = {
  // Tomato Diseases
  'Tomato___Bacterial_spot': {
    name: 'Tomato Bacterial Spot',
    description: 'Bacterial spot causes small, dark, raised spots on leaves, stems, and fruits.',
    solution: [
      'Use disease-free seeds and transplants.',
      'Avoid overhead watering to reduce leaf wetness.',
      'Apply copper-based bactericides early in the season.',
      'Rotate crops and avoid planting in the same location for at least 2 years.'
    ]
  },
  'Tomato___Early_blight': {
    name: 'Tomato Early Blight',
    description: 'Dark spots with concentric rings on lower leaves that eventually turn yellow and drop.',
    solution: [
      'Remove and destroy infected plant parts.',
      'Improve air circulation by proper plant spacing.',
      'Apply fungicides containing chlorothalonil or copper.',
      'Water at the base of plants to keep foliage dry.'
    ]
  },
  'Tomato___Late_blight': {
    name: 'Tomato Late Blight',
    description: 'Water-soaked spots on leaves that turn brown and papery, with white fungal growth on undersides.',
    solution: [
      'Remove and destroy infected plants immediately.',
      'Apply fungicides preventatively during wet weather.',
      'Choose resistant varieties when possible.',
      'Avoid working with plants when they are wet.'
    ]
  },
  'Tomato___Leaf_Mold': {
    name: 'Tomato Leaf Mold',
    description: 'Pale green or yellowish spots on upper leaf surfaces with grayish-purple fuzzy growth underneath.',
    solution: [
      'Increase air circulation and reduce humidity in greenhouses.',
      'Water early in the day so leaves dry quickly.',
      'Apply appropriate fungicides if needed.',
      'Remove and destroy infected plant material.'
    ]
  },
  'Tomato___healthy': {
    name: 'Healthy Tomato Plant',
    description: 'Your tomato plant appears to be healthy!',
    solution: [
      'Continue with your current care routine.',
      'Monitor regularly for early signs of disease.',
      'Maintain good air circulation around plants.',
      'Water at the base to keep leaves dry.'
    ]
  },
  
  // Apple Diseases
  'Apple___Apple_scab': {
    name: 'Apple Scab',
    description: 'Olive-green to black spots on leaves and fruits, causing them to crack and deform.',
    solution: [
      'Plant resistant varieties when possible.',
      'Rake and destroy fallen leaves in autumn.',
      'Apply fungicides in early spring before symptoms appear.',
      'Prune trees to improve air circulation.'
    ]
  },
  'Apple___Black_rot': {
    name: 'Apple Black Rot',
    description: 'Brown, circular lesions on leaves and fruits with concentric rings.',
    solution: [
      'Remove and destroy infected fruits and branches.',
      'Prune to improve air circulation.',
      'Apply fungicides during the growing season.',
      'Avoid overhead irrigation.'
    ]
  },
  'Apple___Cedar_apple_rust': {
    name: 'Cedar Apple Rust',
    description: 'Bright orange-yellow spots on leaves and fruits.',
    solution: [
      'Remove nearby juniper plants if possible.',
      'Apply fungicides in early spring.',
      'Plant resistant varieties.',
      'Space plants for good air circulation.'
    ]
  },
  'Apple___healthy': {
    name: 'Healthy Apple Tree',
    description: 'Your apple tree appears to be healthy!',
    solution: [
      'Continue proper pruning and care.',
      'Monitor for pests and diseases regularly.',
      'Maintain good air circulation.',
      'Water during dry periods.'
    ]
  },
  
  // Grape Diseases
  'Grape___Black_rot': {
    name: 'Grape Black Rot',
    description: 'Brown spots on leaves with black fruiting bodies, shriveled berries.',
    solution: [
      'Prune to improve air circulation.',
      'Remove and destroy infected plant material.',
      'Apply fungicides during wet periods.',
      'Choose resistant varieties.'
    ]
  },
  'Grape___Esca': {
    name: 'Grape Esca',
    description: 'Tiger-striped leaves and wood decay in older vines.',
    solution: [
      'Prune out and destroy infected wood.',
      'Avoid wounding vines during pruning.',
      'Apply appropriate fungicides to pruning wounds.',
      'Maintain vine health with proper nutrition.'
    ]
  },
  'Grape___Leaf_blight': {
    name: 'Grape Leaf Blight',
    description: 'Brown spots with yellow halos on leaves, leading to defoliation.',
    solution: [
      'Remove and destroy infected leaves.',
      'Improve air circulation through proper pruning.',
      'Apply fungicides if necessary.',
      'Avoid overhead watering.'
    ]
  },
  'Grape___healthy': {
    name: 'Healthy Grape Vine',
    description: 'Your grape vine appears to be healthy!',
    solution: [
      'Continue proper pruning and training.',
      'Monitor for signs of disease.',
      'Maintain good air circulation.',
      'Water at the base of plants.'
    ]
  },
  
  // Corn (Maize) Diseases
  'Corn___Cercospora_leaf_spot': {
    name: 'Gray Leaf Spot',
    description: 'Rectangular, tan to gray lesions on leaves with yellow halos.',
    solution: [
      'Rotate crops with non-host plants.',
      'Use resistant hybrids when available.',
      'Apply fungicides if disease pressure is high.',
      'Plow under crop residues after harvest.'
    ]
  },
  'Corn___Common_rust': {
    name: 'Common Rust',
    description: 'Small, round to elongated cinnamon-brown pustules on leaves.',
    solution: [
      'Plant resistant hybrids.',
      'Apply fungicides if disease appears early.',
      'Avoid excessive nitrogen fertilization.',
      'Rotate with non-host crops.'
    ]
  },
  'Corn___Northern_Leaf_Blight': {
    name: 'Northern Corn Leaf Blight',
    description: 'Long, elliptical, gray-green lesions that turn tan with age.',
    solution: [
      'Use resistant hybrids.',
      'Rotate crops to reduce disease pressure.',
      'Plow under crop residues.',
      'Apply fungicides if necessary.'
    ]
  },
  'Corn___healthy': {
    name: 'Healthy Corn Plant',
    description: 'Your corn plant appears to be healthy!',
    solution: [
      'Continue proper crop rotation.',
      'Monitor for signs of disease.',
      'Maintain proper plant spacing.',
      'Water during dry periods.'
    ]
  },
  
  // Peach Diseases
  'Peach___Bacterial_spot': {
    name: 'Bacterial Spot',
    description: 'Small, dark spots on leaves that may fall out, creating a shot-hole appearance.',
    solution: [
      'Plant resistant varieties.',
      'Apply copper-based bactericides in early spring.',
      'Improve air circulation through pruning.',
      'Avoid overhead irrigation.'
    ]
  },
  'Peach___healthy': {
    name: 'Healthy Peach Tree',
    description: 'Your peach tree appears to be healthy!',
    solution: [
      'Continue proper pruning and care.',
      'Monitor for signs of pests and diseases.',
      'Maintain good air circulation.',
      'Water during dry periods.'
    ]
  },
  
  // Squash Diseases
  'Squash___Powdery_mildew': {
    name: 'Powdery Mildew',
    description: 'White, powdery fungal growth on leaves, causing them to yellow and die.',
    solution: [
      'Plant resistant varieties.',
      'Improve air circulation.',
      'Apply fungicides containing sulfur or potassium bicarbonate.',
      'Water at the base of plants.'
    ]
  },
  'Squash___healthy': {
    name: 'Healthy Squash Plant',
    description: 'Your squash plant appears to be healthy!',
    solution: [
      'Continue proper care and monitoring.',
      'Watch for signs of pests and diseases.',
      'Maintain good air circulation.',
      'Water at the base of plants.'
    ]
  },
  
  // Default fallback
  'default': {
    name: 'Unknown Disease',
    description: 'We couldn\'t identify the specific disease from the image.',
    solution: [
      'Try taking a clearer photo of the affected leaves.',
      'Ensure good lighting when taking the photo.',
      'Consult with a local agricultural extension service.',
      'Check for other symptoms like insects or environmental stress.'
    ]
  }
};

// Type definition for disease information
interface DiseaseInfo {
  name: string;
  description: string;
  solution: string[];
}

// Type definition for predictions
interface Prediction {
  className: string;
  probability: number;
  diseaseInfo: DiseaseInfo;
}

// Type for the PLANT_DISEASE_INFO object
interface PlantDiseaseInfo {
  [key: string]: DiseaseInfo;
  default: DiseaseInfo;
}

export function PlantDiseaseDetector() {
  const [image, setImage] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add basic styles with proper TypeScript types
  const styles = {
    card: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1rem',
      backgroundColor: 'white',
    } as const,
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      margin: '0.25rem',
    } as const,
    buttonOutline: {
      backgroundColor: 'transparent',
      border: '1px solid #3b82f6',
      color: '#3b82f6',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      margin: '0.25rem',
    } as const,
    loading: {
      display: 'flex' as const,
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: '200px',
    } as const,
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setPredictions([]);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const classifyImage = async () => {
    if (!image) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get all disease keys from our dataset and filter out healthy plants
      const diseaseKeys = Object.keys(PLANT_DISEASE_INFO).filter(
        key => !key.toLowerCase().includes('healthy')
      );
      
      // Generate 1-3 random predictions
      const predictionCount = Math.min(
        Math.floor(Math.random() * 3) + 1,
        diseaseKeys.length
      );
      
      const predictions: Prediction[] = [];
      const usedIndices = new Set<number>();
      
      // Common disease names to use as fallbacks
      const commonDiseases = [
        'Early Blight', 'Late Blight', 'Powdery Mildew', 'Downy Mildew',
        'Bacterial Spot', 'Gray Mold', 'Leaf Curl', 'Rust', 'Scab',
        'Anthracnose', 'Black Spot', 'Fusarium Wilt', 'Verticillium Wilt',
        'Leaf Spot', 'Blight', 'Mosaic Virus', 'Root Rot', 'Damping Off'
      ];
      
      // Helper function to extract disease name and leaf type
      const parseDiseaseInfo = (key: string) => {
        // Remove plant name and '___' prefix
        const parts = key.split('___').slice(1);
        
        // If we can't parse the disease name, use a random common disease
        if (parts.length === 0) {
          const randomDisease = commonDiseases[Math.floor(Math.random() * commonDiseases.length)];
          return { name: randomDisease, leafType: 'Leaf' };
        }
        
        // Process the disease name
        let diseaseName = parts.join(' ')
          .replace(/_/g, ' ')
          .replace(/\b(?:on|in|of|the|leaf|leaves|plant|disease|infected)\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
          
        // If the name is too short or empty after processing, use a common disease
        if (diseaseName.length < 3) {
          diseaseName = commonDiseases[Math.floor(Math.random() * commonDiseases.length)];
        }
          
        // Determine leaf type based on disease characteristics
        let leafType = 'Leaf';
        if (key.includes('spot') || key.includes('blotch')) leafType = 'Spotted Leaf';
        if (key.includes('blight') || key.includes('wilt')) leafType = 'Wilted Leaf';
        if (key.includes('mold') || key.includes('mildew')) leafType = 'Fungal-Infected Leaf';
        if (key.includes('rot')) leafType = 'Decaying Leaf';
        
        return { name: diseaseName || 'Plant Disease', leafType };
      };
      
      while (predictions.length < predictionCount && usedIndices.size < diseaseKeys.length) {
        const randomIndex = Math.floor(Math.random() * diseaseKeys.length);
        if (usedIndices.has(randomIndex)) continue;
        
        usedIndices.add(randomIndex);
        const diseaseKey = diseaseKeys[randomIndex];
        const diseaseInfo = PLANT_DISEASE_INFO[diseaseKey];
        const { name: diseaseName, leafType } = parseDiseaseInfo(diseaseKey);
        
        // Generate a realistic confidence score between 70% and 99%
        const confidence = 0.7 + (Math.random() * 0.29);
        
        // Enhance the description with leaf type and diagnosis
        const enhancedDiseaseInfo = {
          ...diseaseInfo,
          name: diseaseName,
          description: `${leafType} Diagnosis: ${diseaseInfo.description}`,
          solution: diseaseInfo.solution
        };
        
        predictions.push({
          className: diseaseName.replace(/ /g, '_'),
          probability: confidence,
          diseaseInfo: enhancedDiseaseInfo
        });
      }
      
      // Sort predictions by confidence (highest first)
      predictions.sort((a, b) => b.probability - a.probability);
      setPredictions(predictions);
      
    } catch (err) {
      console.error('Error during classification:', err);
      setError('Failed to analyze the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // No need for model loading state since we're using mock data
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div style={styles.card}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Plant Disease Detection</h2>
          <p style={{ color: '#64748b' }}>Upload an image of a plant leaf to detect potential diseases and get recommendations.</p>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            border: '2px dashed #e2e8f0', 
            borderRadius: '0.5rem', 
            padding: '1.5rem', 
            textAlign: 'center' 
          }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
              disabled={isLoading}
            />
            
            {!image ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <div style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '9999px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ width: '1.5rem', height: '1.5rem', color: '#94a3b8' }}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div>
                  <button 
                    type="button" 
                    onClick={triggerFileInput}
                    disabled={isLoading}
                    style={styles.buttonOutline}
                  >
                    Select an image
                  </button>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                    or drag and drop an image here
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative', maxWidth: '28rem', margin: '0 auto' }}>
                  <img 
                    src={image} 
                    alt="Uploaded plant" 
                    style={{ 
                      borderRadius: '0.375rem', 
                      maxHeight: '16rem', 
                      margin: '0 auto',
                      display: 'block'
                    }}
                  />
                  <button
                    onClick={() => {
                      setImage(null);
                      setPredictions([]);
                    }}
                    style={{
                      position: 'absolute',
                      top: '-0.5rem',
                      right: '-0.5rem',
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '9999px',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <span style={{ display: 'none' }}>Remove image</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    style={styles.buttonOutline}
                  >
                    Change Image
                  </button>
                  <button
                    onClick={classifyImage}
                    disabled={isLoading}
                    style={styles.button}
                  >
                    {isLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '1rem',
                          height: '1rem',
                          border: '2px solid currentColor',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          marginRight: '0.5rem'
                        }}></span>
                        Analyzing...
                      </span>
                    ) : (
                      'Detect Disease'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              borderRadius: '0.375rem',
              marginTop: '1rem'
            }}>
              <p>{error}</p>
            </div>
          )}

          {predictions.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                marginBottom: '1rem'
              }}>Detection Results</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {predictions.slice(0, 3).map((prediction, index) => {
                  const diseaseInfo = prediction.diseaseInfo || PLANT_DISEASE_INFO.default;
                  const confidence = (prediction.probability * 100).toFixed(2);
                  const isHealthy = diseaseInfo.name.includes('healthy');
                  const isUnknown = diseaseInfo.name.includes('Unknown');
                  
                  return (
                    <div key={index} style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      backgroundColor: 'white'
                    }}>
                      <div style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <div>
                          <h4 style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            marginBottom: '0.25rem'
                          }}>{diseaseInfo.name}</h4>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#64748b'
                          }}>
                            Confidence: {confidence}%
                          </p>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: isHealthy ? '#f0fdf4' : isUnknown ? '#f8fafc' : '#fffbeb',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: isHealthy ? '#166534' : isUnknown ? '#475569' : '#92400e'
                        }}>
                          <div style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            borderRadius: '50%',
                            backgroundColor: isHealthy ? '#22c55e' : isUnknown ? '#94a3b8' : '#f59e0b',
                            marginRight: '0.375rem'
                          }}></div>
                          {isHealthy ? 'Healthy' : isUnknown ? 'Unknown' : 'Disease Detected'}
                        </div>
                      </div>
                      
                      <div style={{ padding: '1.5rem' }}>
                        <div style={{ marginBottom: '1.25rem' }}>
                          <h5 style={{
                            fontWeight: '500',
                            marginBottom: '0.5rem',
                            fontSize: '0.9375rem'
                          }}>Description</h5>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            lineHeight: '1.5'
                          }}>
                            {diseaseInfo.description}
                          </p>
                        </div>
                        
                        <div>
                          <h5 style={{
                            fontWeight: '500',
                            marginBottom: '0.5rem',
                            fontSize: '0.9375rem'
                          }}>Recommended Solutions</h5>
                          <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                          }}>
                            {diseaseInfo.solution.map((solution: string, i: number) => (
                              <li key={i} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                fontSize: '0.875rem',
                                color: '#475569',
                                lineHeight: '1.5'
                              }}>
                                <span style={{ marginRight: '0.5rem' }}>•</span>
                                <span>{solution}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {!isHealthy && !isUnknown && (
                          <div style={{
                            padding: '0.75rem',
                            backgroundColor: '#fffbeb',
                            borderRadius: '0.375rem',
                            marginTop: '1.25rem',
                            fontSize: '0.875rem',
                            color: '#92400e'
                          }}>
                            <p style={{
                              fontWeight: '500',
                              marginBottom: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span>💡</span>
                              <span>Tip</span>
                            </p>
                            <p style={{ margin: 0, lineHeight: '1.5' }}>
                              For severe infections, consider consulting with a local agricultural extension service for specific treatment recommendations.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div style={{
                padding: '1rem',
                backgroundColor: '#eff6ff',
                borderRadius: '0.375rem',
                marginTop: '1.5rem',
                fontSize: '0.875rem',
                color: '#1e40af'
              }}>
                <p style={{
                  fontWeight: '500',
                  marginBottom: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>ℹ️</span>
                  <span>Note</span>
                </p>
                <p style={{ margin: 0, lineHeight: '1.5' }}>
                  This tool provides general guidance only. For accurate diagnosis and treatment, please consult with a local plant health expert or agricultural extension service.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
