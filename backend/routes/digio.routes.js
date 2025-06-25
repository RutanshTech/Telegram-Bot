const express = require('express');
const router = express.Router();
const digioController = require('../controllers/digio.controller');

router.post('/digio/uploadPDF', digioController.uploadDigioPDF);
router.get('/digio/signed-link/:docId', digioController.getSignedDocumentLink);

module.exports = router;
