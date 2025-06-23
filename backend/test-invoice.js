require('dotenv').config();
const mongoose = require('mongoose');
const { createInvoice } = require('./controllers/invoiceController');

// Check environment variables
console.log('Checking environment variables...');
const requiredEnvVars = [
  'MONGO_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

console.log('Environment variables loaded successfully');
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: '***' // Don't log the actual secret
});

async function testInvoiceGeneration() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Find a test user
    console.log('Finding a test user...');
    const User = require('./models/user.model');
    const testUser = await User.findOne();
    if (!testUser) {
      throw new Error('No test user found in database');
    }
    console.log('Found test user:', testUser._id);

    // Mock request and response objects
    const mockReq = {
      body: {
        invoiceNo: "TEST-" + Date.now(),
        billDate: new Date(),
        userid: testUser._id.toString(),
        description: "Test Invoice Generation"
      }
    };

    const mockRes = {
      status: function(code) {
        console.log('Response Status:', code);
        return this;
      },
      json: function(data) {
        console.log('Response Data:', JSON.stringify(data, null, 2));
        return this;
      }
    };

    // Test invoice creation
    console.log('\nTesting invoice creation...');
    console.log('Request Data:', JSON.stringify(mockReq.body, null, 2));
    
    await createInvoice(mockReq, mockRes);
    console.log('Test completed successfully');

  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
console.log('Starting invoice generation test...');
testInvoiceGeneration(); 