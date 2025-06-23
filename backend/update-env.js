const fs = require('fs');
const path = require('path');

// Read the current .env file or create it if it doesn't exist
const envPath = path.join(__dirname, '.env');
let envContent = '';
try {
  envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
} catch (error) {
  console.log('Creating new .env file');
}

// Convert env content to key-value pairs
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('='); // Rejoin in case value contains =
    if (key) {
      envVars[key.trim()] = value.trim();
    }
  }
});

// Define all variables with their current or default values
const configuredVars = {
  // MongoDB
  'MONGO_URI': envVars['MONGO_URI'] || '"mongodb+srv://man:rL6LlQQ9QYjhQppV@cluster0.yxujymc.mongodb.net/tg"',
  'PORT': envVars['PORT'] || '4000',
  'JWT_SECRET': envVars['JWT_SECRET'] || 'your_jwt_secret_key',

  // Cashfree Configuration
  'CASHFREE_CLIENT_ID': envVars['CASHFREE_CLIENT_ID'] || 'TEST10360225413b255427560253f37b52206301',
  'CASHFREE_CLIENT_SECRET': envVars['CASHFREE_CLIENT_SECRET'] || 'cfsk_ma_test_676a34137ad0b6bcc88f11027052c253_2fb08a0e',
  'CASHFREE_BASE_URL': envVars['CASHFREE_BASE_URL'] || 'https://sandbox.cashfree.com',

  // Cloudinary Configuration
  'CLOUDINARY_CLOUD_NAME': envVars['CLOUDINARY_CLOUD_NAME'] || 'dpeborm0u',
  'CLOUDINARY_API_KEY': envVars['CLOUDINARY_API_KEY'] || '473174294279279',
  'CLOUDINARY_API_SECRET': envVars['CLOUDINARY_API_SECRET'] || 'PIbs93IyvGrwcaJEfNk6JKz0CcE',

  // Application Configuration
  'NODE_ENV': envVars['NODE_ENV'] || 'development',
  'FRONTEND_URL': envVars['FRONTEND_URL'] || 'https://telegram-bot-puce-phi.vercel.app/',
  'BACKEND_URL': envVars['BACKEND_URL'] || 'https://telegram-bot-1-f9v5.onrender.com',

  // Digio Configuration
  'DIGIO_CLIENT_ID': envVars['DIGIO_CLIENT_ID'] || 'ACK250603192727003LHQACX1Q32OZ8I',
  'DIGIO_CLIENT_SECRET': envVars['DIGIO_CLIENT_SECRET'] || 'SBASIXBZ5K8O1FJJJ9H8VFY45RSMOUNZ',

  // Email Configuration
  'EMAIL_USER': envVars['EMAIL_USER'] || 'mandavra12@gmail.com',
  'EMAIL_PASS': envVars['EMAIL_PASS'] || 'jfsa cdvy plwv onoy',

  // OTP Configuration
  'OTP_EXPIRY_MINUTES': envVars['OTP_EXPIRY_MINUTES'] || '5',

  // Twilio Configuration
  'TWILIO_ACCOUNT_SID': envVars['TWILIO_ACCOUNT_SID'] || 'AC68e848b570f99b1c9f3b3727508b619a',
  'TWILIO_AUTH_TOKEN': envVars['TWILIO_AUTH_TOKEN'] || 'd019c7abc8026aeef7cd6bde3d99c950',
  'TWILIO_CONTACT_NO': envVars['TWILIO_CONTACT_NO'] || '+17753494617',
  'TWILIO_SERVICE_SID': envVars['TWILIO_SERVICE_SID'] || 'VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
};

// Generate the new .env content with sections
const sections = {
  '# MongoDB and General': ['MONGO_URI', 'PORT', 'JWT_SECRET'],
  '# Cashfree Configuration': ['CASHFREE_CLIENT_ID', 'CASHFREE_CLIENT_SECRET', 'CASHFREE_BASE_URL'],
  '# Cloudinary Configuration': ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'],
  '# Application Configuration': ['NODE_ENV', 'FRONTEND_URL', 'BACKEND_URL'],
  '# Digio Configuration': ['DIGIO_CLIENT_ID', 'DIGIO_CLIENT_SECRET'],
  '# Email Configuration': ['EMAIL_USER', 'EMAIL_PASS'],
  '# OTP Configuration': ['OTP_EXPIRY_MINUTES'],
  '# Twilio Configuration': ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_CONTACT_NO', 'TWILIO_SERVICE_SID']
};

let newEnvContent = '';
Object.entries(sections).forEach(([section, vars]) => {
  newEnvContent += `\n${section}\n`;
  vars.forEach(key => {
    newEnvContent += `${key}=${configuredVars[key]}\n`;
  });
});

// Write the updated content back to the file
fs.writeFileSync(envPath, newEnvContent.trim() + '\n');

console.log('✅ Updated environment variables in .env file');
console.log('Environment variables have been cleaned up and organized.'); 
