const twilio = require('twilio');
require('dotenv').config();

// Validate environment variables on startup
const validateConfig = () => {
    const requiredVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_SERVICE_SID'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};

validateConfig();

const TWILIO_CONFIG = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    serviceSid: process.env.TWILIO_SERVICE_SID,
    phoneNumber: process.env.TWILIO_CONTACT_NO,
    channel: process.env.TWILIO_OTP_CHANNEL || 'sms' // or 'whatsapp'
};

// console.log('TWILIO_CONFIG: ', TWILIO_CONFIG);
const client = twilio(TWILIO_CONFIG.accountSid, TWILIO_CONFIG.authToken);

/**
 * Formats phone number to E.164 format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number in E.164 format
 * @throws {Error} If phone number is invalid
 */
const formatPhoneNumber = (phone) => {
    if (!phone) {
        throw new Error('Phone number is required');
    }

    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length === 10) {
        return `+91${digitsOnly}`;
    }

    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
        return `+${digitsOnly}`;
    }

    if (phone.startsWith('+') && digitsOnly.length > 10) {
        return phone;
    }

    throw new Error('Invalid phone number format. Please provide a valid phone number with country code.');
};

/**
 * Sends OTP via Twilio Verify service
 * @param {string} phone - Recipient phone number
 * @returns {Promise<{sid: string, phone: string, status: string, timestamp: string}>} 
 * @throws {Error} If OTP sending fails
 */
const sendOtp = async (phone) => {
    try {
        if (!phone) throw new Error('Phone number is required');

        const formattedPhone = formatPhoneNumber(phone);

        if (!TWILIO_CONFIG.serviceSid) {
            throw new Error('Twilio Verify Service SID not configured');
        }

        const response = await client.verify.v2.services(TWILIO_CONFIG.serviceSid)
            .verifications
            .create({
                to: formattedPhone,
                channel: TWILIO_CONFIG.channel
            });

        console.log('Twilio response:', {
            status: response.status,
            sid: response.sid,
            channel: response.channel
        });

        return {
            sid: response.sid,
            phone: formattedPhone,
            status: response.status,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('[Twilio Detailed Error]', {
            code: error.code,
            status: error.status,
            moreInfo: error.moreInfo,
            stack: error.stack
        });

        const errorMap = {
            20404: 'Verify Service SID not found',
            60200: 'Invalid phone number format',
            60203: 'Max verification attempts reached',
            60212: 'Phone number not reachable'
        };

        throw new Error(
            errorMap[error.code] ||
            error.message ||
            'Failed to send OTP. Please try again later.'
        );
    }
};

/**
 * Verifies OTP via Twilio Verify service
 * @param {string} phone - Phone number to verify
 * @param {string} otp - OTP code to verify
 * @returns {Promise<{success: boolean, status: string, phone: string}>} 
 * @throws {Error} If verification fails
 */
const verifyOtp = async (phone, otp) => {
    if (!otp || otp.length < 4 || otp.length > 8) {
        throw new Error('OTP code must be between 4-8 digits');
    }

    try {
        const formattedPhone = formatPhoneNumber(phone);

        const response = await client.verify.v2.services(TWILIO_CONFIG.serviceSid)
            .verificationChecks
            .create({
                to: formattedPhone,
                code: otp
            });

        return {
            success: response.status === 'approved',
            status: response.status,
            phone: formattedPhone
        };
    } catch (error) {
        console.error('[Twilio Verification Error]', {
            code: error.code,
            message: error.message,
            phone: phone,
            timestamp: new Date().toISOString()
        });

        let userMessage = 'Invalid OTP or expired. Please try again.';
        if (error.code === 60202) {
            userMessage = 'Invalid OTP code. Please check and try again.';
        } else if (error.code === 20404) {
            userMessage = 'OTP expired. Please request a new one.';
        }

        throw new Error(userMessage);
    }
};

/**
 * Sends a simple SMS using Twilio Messaging API
 * @param {string} body - Message body
 * @param {string} receiverNo - Recipient phone number
 * @returns {Promise<boolean>} - True if sent, false if error
 */
const sendSMS = (body, receiverNo) => {
    const sendSMSTo = receiverNo?.startsWith("+") ? receiverNo : `+${receiverNo}`;

    if (!body || !receiverNo) {
        return Promise.reject(new Error('Message body and recipient number are required'));
    }
    return client.messages
        .create({ body, from: TWILIO_CONFIG.phoneNumber, to: sendSMSTo })
        .then(() => {
            return {
                success: true,
                message: `SMS sent to ${sendSMSTo}`
            };
        })
        .catch((err) => {
            console.error("Error sending message:", err);
            return {
                success: false,
                message: 'Failed to send SMS'
            };
        });
};

module.exports = {
    sendOtp,
    verifyOtp,
    sendSMS,
    formatPhoneNumber
};