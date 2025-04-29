import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test the Cloudinary configuration
const testCloudinaryConfig = async () => {
  try {
    const result = await cloudinary.api.ping();
    if (result.status === 'ok') {
      logger.info('Cloudinary configuration is valid');
      return true;
    } else {
      logger.error('Cloudinary configuration test failed');
      return false;
    }
  } catch (error) {
    logger.error('Cloudinary configuration error:', error);
    return false;
  }
};

export { cloudinary, testCloudinaryConfig };
