import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

// Generate a fresh signed URL for an existing S3 object
const generateSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    // Generate a signed URL with specified expiration (default 1 hour)
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    throw error;
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

    // Generate a signed URL for the uploaded file (1 hour expiration)
    const url = await generateSignedUrl(uniqueFileName, 3600);

    return {
      url,
      key: uniqueFileName
    };
  } catch (error) {
    logger.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Delete a file from S3
const deleteFileFromS3 = async (key) => {
  try {
    if (!key) {
      throw new Error('File key is required to delete from S3');
    }

    // Set up the delete parameters
    const params = {
      Bucket: bucketName,
      Key: key
    };

    // Delete the file
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);

    logger.info(`File deleted successfully from S3: ${key}`);
    return true;
  } catch (error) {
    logger.error('Error deleting file from S3:', error);
    throw error;
  }
};

export { s3Client, uploadFileToS3, deleteFileFromS3, testS3Config, generateSignedUrl };
