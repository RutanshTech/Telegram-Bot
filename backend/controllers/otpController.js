const { sendOtp, verifyOtp, sendSMS } = require('../services/twilioService'); // Just change this import
const OtpRequest = require('../models/otpModel'); // Import the OtpRequest model
const generateOTP = require('../db/generateOTP');
const User = require("../models/user.model")
const sendOtpController = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number is required' });

  try {
    /* SEND SMS */
    const otp = generateOTP(); // You might want to generate a real OTP here
    const body = `OTP is: ${otp}`;
    const data = await sendSMS(body, phone);

    // Save to DB
    await OtpRequest.create({ phone, otp });
    await User.create({ phone: phone })

    res.json({ message: 'OTP sent and saved successfully', smsData: data, phone });

    // const result = await sendOtp(phone);
  } catch (error) {
    res.status(500).json({ message: 'OTP sent error', error: error.message });
  }
};

const verifyOtpController = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required' });
  }

  try {
    // Find the most recent OTP entry for the phone
    const otpRecord = await OtpRequest.findOne({ phone }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(404).json({ message: 'OTP not found or expired' });
    }

    // Check if the OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    const user = await User.findOne({ phone: phone });
    // (Optional) Delete OTP after successful verification
    await OtpRequest.deleteOne({ _id: otpRecord._id });

    // OTP is correct
    return res.status(200).json({ message: 'OTP verified successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const RESET_COOLDOWN_SECONDS = 60

const resetOtpController = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const existingOtp = await OtpRequest.findOne({ phone });

    if (existingOtp) {
      const now = new Date();
      const timeDiff = (now - existingOtp.createdAt) / 1000;

      if (timeDiff < RESET_COOLDOWN_SECONDS) {
        const waitTime = Math.ceil(RESET_COOLDOWN_SECONDS - timeDiff);
        return res.status(429).json({
          message: `Please wait ${waitTime} second(s) before requesting a new OTP.`,
          cooldown: waitTime
        });
      }
    }

    // Generate and send new OTP
    const newOtp = generateOTP();
    const body = `Your new OTP is: ${newOtp}`;
    const smsResult = await sendSMS(body, phone);

    await OtpRequest.findOneAndUpdate(
      { phone },
      { otp: newOtp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'OTP reset successfully and sent to user',
      smsResult,
      phone
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error resetting OTP',
      error: error.message
    });
  }
};

module.exports = { sendOtpController, verifyOtpController, resetOtpController };
