const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const validateCloudinaryConfig = () => {
  const required = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  console.log('\nCloudinary Configuration Check:');
  const envVars = {};
  required.forEach(key => {
    envVars[key] = process.env[key];
    console.log(`${key}: ${process.env[key] ? '✓ Present' : '✗ Missing'}`);
  });

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const msg = '\nMissing Cloudinary Configuration:\n' + missing.map(key => `- ${key} is not set in environment variables`).join('\n') + '\nPlease ensure these variables are set in your .env file.';
    console.error(msg);
    // Throw a more user-friendly error
    throw new Error('Cloudinary configuration error: ' + msg);
  }

  return envVars;
};

// Validate and get configuration
const config = validateCloudinaryConfig();

try {
  // Configure Cloudinary with validated config
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
  });

  // Test the configuration
  cloudinary.api.ping((error, result) => {
    if (error) {
      console.error('Cloudinary Connection Test Failed:', error.message);
    } else {
      console.log('Cloudinary Connection Test: Success ✓');
    }
  });
} catch (error) {
  console.error('Cloudinary Configuration Error:', error.message);
  throw error;
}

module.exports = cloudinary; 