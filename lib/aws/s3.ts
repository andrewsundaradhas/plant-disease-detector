import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

// Validate environment variables
const requiredEnvVars = ['NEXT_PUBLIC_AWS_ACCESS_KEY_ID', 'NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY', 'NEXT_PUBLIC_AWS_REGION', 'NEXT_PUBLIC_S3_BUCKET_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

console.log('S3 Configuration:', {
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ? '***' + process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID.slice(-4) : 'not set',
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY ? '***' + process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY.slice(-4) : 'not set'
});

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

// Convert file to buffer (works in both browser and Node.js)
async function fileToBuffer(file: File | Blob | Buffer): Promise<Buffer> {
  // If it's already a Buffer, return it
  if (Buffer.isBuffer(file)) return file;
  
  // For Blob/File in browser
  if (typeof window !== 'undefined' && (file instanceof Blob || file instanceof File)) {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  
  // For Node.js environment with Readable stream
  if (file instanceof Readable) {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      file.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      file.on('error', reject);
      file.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
  
  throw new Error('Unsupported file type or environment');
}

export async function uploadToS3(file: File): Promise<{ fileKey: string; fileName: string; fileUrl: string }> {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileKey = `uploads/${Date.now().toString()}-${file.name.replace(/\s+/g, '-')}`;
  const fileUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`;

  console.log('Uploading to S3:', {
    bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    key: fileKey,
    size: file.size,
    type: file.type,
  });

  try {
    // Convert file to buffer
    const fileBuffer = await fileToBuffer(file);
    
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type,
      ContentLength: file.size,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    console.log('Upload successful:', fileUrl);
    return {
      fileKey,
      fileName: file.name,
      fileUrl,
    };
  } catch (error) {
    console.error('S3 Upload Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError',
      code: (error as any).code,
      region: process.env.AWS_REGION,
      bucket: process.env.S3_BUCKET_NAME,
    });
    
    if (error instanceof S3ServiceException) {
      const errorMessage = error.message;
      if (errorMessage.includes('The specified bucket does not exist')) {
        throw new Error(`S3 Bucket "${process.env.S3_BUCKET_NAME}" does not exist in region ${process.env.AWS_REGION}`);
      } else if (errorMessage.includes('The AWS Access Key Id you provided does not exist')) {
        throw new Error('Invalid AWS Access Key ID');
      } else if (errorMessage.includes('The request signature we calculated does not match')) {
        throw new Error('Invalid AWS Secret Access Key');
      } else if (errorMessage.includes('Access Denied')) {
        throw new Error(`Access denied to S3 bucket. Check IAM permissions for bucket: ${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}`);
      }
      throw new Error(`S3 Error: ${error.message} (Code: ${error.$metadata.httpStatusCode})`);
    }
    
    throw error;
  }
}

export function getS3Url(fileKey: string): string {
  if (!fileKey) {
    throw new Error('File key is required');
  }
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`;
}

export async function getSignedS3Url(fileKey: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: fileKey,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

export async function deleteFromS3(fileKey: string): Promise<void> {
  try {
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: fileKey,
    };
    await s3Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
}
