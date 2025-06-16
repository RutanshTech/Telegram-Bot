const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

router.post('/upload-pdf', async (req, res) => {
  try {
    // ✅ 1. Get absolute path
    const pdfPath = path.resolve(__dirname, '../_ Draft Agreement Vyom Research.pdf');

    // ✅ 2. Validate file
    if (!fs.existsSync(pdfPath)) {
      console.log('❌ File not found at:', pdfPath);
      return res.status(404).json({ status: 'error', error: 'PDF file not found' });
    }

    // ✅ 3. Create readable stream
    const fileStream = fs.createReadStream(pdfPath);

    // ✅ 4. Prepare multipart form
    const form = new FormData();
    form.append('signers', JSON.stringify([
      {
        identifier: '8140241212',
        name: 'Test User',
        reason: 'Agreement Aadhaar Sign',
        sign_type: 'aadhaar',
        signature_mode: 'otp'
      }
    ]));
    form.append('expire_in_days', '10'); // send all values as strings
    form.append('display_on_page', 'All');
    form.append('include_authentication_url', 'true');
    form.append('file_name', 'surendea.pdf');
    form.append('file_data', fileStream); // ✅ ✅ ✅ this is correct
    form.append('send_sign_link', 'true');
    form.append('notify_signers', 'true');

    // ✅ 5. Send to Digio
    const response = await axios.post(
      'https://api.digio.in/v2/client/document/uploadpdf',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: 'Basic ' + Buffer.from('YOUR_DIGIO_USERNAME:YOUR_DIGIO_PASSWORD').toString('base64')
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    return res.status(200).json({ status: 'success', data: response.data });

  } catch (error) {
    console.error('❌ Upload Failed:', error.response?.data || error.message);
    return res.status(500).json({ status: 'error', error: error.response?.data || error.message });
  }
});

module.exports = router;
