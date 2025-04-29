import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Bucket name from environment variables
const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Test the S3 configuration
const testS3Config = async () => {
  try {
    // Try to list buckets to test the connection
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: 'test-connection.txt'
    });
    
    // Generate a signed URL (this will fail if credentials are invalid)
    await getSignedUrl(s3Client, command, { expiresIn: 60 });
    
    logger.info('AWS S3 configuration is valid');
    return true;
  } catch (error) {
    logger.error('AWS S3 configuration error:', error);
    return false;
  }
};

// Upload a file to S3
const uploadFileToS3 = async (fileBuffer, fileName, mimeType) => {
  try {
    // Create a unique file name to prevent overwriting
    const uniqueFileName = `${Date.now()}-${fileName}`;
    
    // Set up the upload parameters
    const params = {
      Bucket: bucketName,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType
    };
    
    // Upload the file
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    // Generate a signed URL for the uploaded file
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: uniqueFileName
    });
    
    // Create a URL that expires in 1 week (604800 seconds)
    const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 });
    
    return {
      url,
      key: uniqueFileName
    };
  } catch (error) {
    logger.error('Error uploading file to S3:', error);
    throw error;
  }
};

export { s3Client, uploadFileToS3, testS3Config };
