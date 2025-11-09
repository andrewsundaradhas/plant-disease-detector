import { NextResponse } from 'next/server';
import { S3ServiceException } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';

// Convert ReadableStream to Buffer
async function streamToBuffer(readableStream: ReadableStream): Promise<Buffer> {
  const reader = readableStream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false, // Disable default body parser
  },
};

export async function POST(request: Request) {
  console.log('=== UPLOAD REQUEST RECEIVED ===');
  
  try {
    // Log request headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log('Request Headers:', headers);
    
    // Get the file from the request
    const formData = await request.formData().catch(error => {
      console.error('Error parsing form data:', error);
      throw new Error('Invalid form data');
    });
    
    const formFile = formData.get('file');
    
    if (!formFile) {
      console.error('No file found in form data');
      return NextResponse.json(
        { 
          success: false,
          error: 'No file provided',
          formKeys: Array.from(formData.keys())
        },
        { status: 400 }
      );
    }
    
    // Handle file from FormData
    let fileBuffer: Buffer;
    let fileName = 'upload';
    let fileType = 'application/octet-stream';
    
    // Type guard for File
    const isFile = (obj: any): obj is File => {
      return typeof obj === 'object' && obj !== null && 'arrayBuffer' in obj && 'name' in obj && 'type' in obj;
    };
    
    // Type guard for Blob
    const isBlob = (obj: any): obj is Blob => {
      return typeof obj === 'object' && obj !== null && 'arrayBuffer' in obj;
    };
    
    // Type guard for ReadableStream
    const isReadableStream = (obj: any): obj is ReadableStream => {
      return typeof obj === 'object' && obj !== null && 'getReader' in obj;
    };
    
    if (isFile(formFile)) {
      // Handle File object (browser)
      fileBuffer = Buffer.from(await formFile.arrayBuffer());
      fileName = formFile.name;
      fileType = formFile.type || fileType;
    } else if (isBlob(formFile)) {
      // Handle Blob object
      fileBuffer = Buffer.from(await formFile.arrayBuffer());
      if ('name' in formFile) {
        fileName = (formFile as any).name || fileName;
      }
      if ('type' in formFile) {
        fileType = (formFile as any).type || fileType;
      }
    } else if (isReadableStream(formFile as any)) {
      // Handle ReadableStream
      fileBuffer = await streamToBuffer(formFile as ReadableStream);
    } else {
      console.error('Unsupported file type:', { type: typeof formFile, formFile });
      throw new Error('Unsupported file type');
    }

    console.log('Processing file:', {
      name: fileName,
      type: fileType,
      size: fileBuffer.length,
    });
    
    // Create a File-like object
    const fileObj = {
      name: fileName,
      type: fileType,
      size: fileBuffer.length,
      arrayBuffer: () => Promise.resolve(fileBuffer.buffer),
      stream: () => {
        const readable = new Readable();
        readable.push(fileBuffer);
        readable.push(null);
        return readable;
      },
    } as unknown as File;

    try {
      // Import the S3 client dynamically to ensure environment variables are loaded
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      
      const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      
      const fileKey = `uploads/${Date.now().toString()}-${fileName.replace(/\s+/g, '-')}`;
      const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
      
      console.log('Starting S3 upload...', { fileKey, bucket: process.env.S3_BUCKET_NAME });
      
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: fileType,
        ContentLength: fileBuffer.length,
      });
      
      const result = await s3Client.send(command);
      console.log('File uploaded to S3 successfully:', { ...result, fileUrl });

      return NextResponse.json({
        success: true,
        fileKey,
        fileName,
        fileUrl,
        fileType,
        fileSize: fileBuffer.length,
        uploadedAt: new Date().toISOString(),
      });
    } catch (s3Error) {
      console.error('S3 Upload Error:', s3Error);
      
      let errorMessage = 'Failed to upload to S3';
      let statusCode = 500;
      let errorDetails: any = {};

      if (s3Error instanceof S3ServiceException) {
        errorDetails = {
          code: s3Error.$metadata.httpStatusCode,
          name: s3Error.name,
          message: s3Error.message,
          region: s3Error.$metadata.region,
          requestId: s3Error.$metadata.requestId,
          extendedRequestId: s3Error.$metadata.extendedRequestId,
        };
        
        if (s3Error.name === 'InvalidAccessKeyId') {
          errorMessage = 'Invalid AWS Access Key ID';
          statusCode = 403;
        } else if (s3Error.name === 'SignatureDoesNotMatch') {
          errorMessage = 'Invalid AWS Secret Access Key';
          statusCode = 403;
        } else if (s3Error.name === 'NoSuchBucket') {
          errorMessage = `S3 bucket does not exist: ${process.env.S3_BUCKET_NAME}`;
          statusCode = 404;
        } else if (s3Error.name === 'AccessDenied') {
          errorMessage = 'Access denied to S3 bucket. Check your IAM permissions.';
          statusCode = 403;
        }
      } else if (s3Error instanceof Error) {
        errorDetails = {
          name: s3Error.name,
          message: s3Error.message,
          stack: process.env.NODE_ENV === 'development' ? s3Error.stack : undefined,
        };
      }

      console.error('S3 Error Details:', errorDetails);
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          details: errorDetails,
          s3Config: {
            region: process.env.AWS_REGION,
            bucket: process.env.S3_BUCKET_NAME,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID ? 
              `...${process.env.AWS_ACCESS_KEY_ID.slice(-4)}` : 'not set',
          }
        },
        { status: statusCode }
      );
    }
  } catch (error) {
    console.error('Server Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        } : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
