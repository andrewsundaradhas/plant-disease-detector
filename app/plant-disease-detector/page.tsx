import { Metadata } from 'next';
import { PlantDiseaseDetector } from '@/components/plant-disease-detector';

export const metadata: Metadata = {
  title: 'Plant Disease Detector',
  description: 'Upload an image of a plant leaf to detect potential diseases and get recommendations.',
};

export default function PlantDiseaseDetectorPage() {
  return (
    <div className="py-8">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Plant Disease Detector
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Upload an image of a plant leaf to detect potential diseases and get expert recommendations for treatment.
          </p>
        </div>
        
        <PlantDiseaseDetector />
        
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="font-medium">Upload Image</h3>
              <p className="text-sm text-muted-foreground">Take a clear photo of the affected plant leaf and upload it.</p>
            </div>
            <div className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="font-medium">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">Our AI analyzes the image to identify potential diseases.</p>
            </div>
            <div className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="font-medium">Get Results</h3>
              <p className="text-sm text-muted-foreground">Receive detailed diagnosis and treatment recommendations.</p>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-3">Tips for Best Results</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Use a plain, light-colored background</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Ensure good lighting when taking the photo</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Focus on the most affected leaves</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Include multiple angles if possible</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
