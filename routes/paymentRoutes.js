// const express = require('express');
// const { createPaymentLink, createPaymentLinkWithRetry, checkPaymentStatus, handlePaymentWebhook } = require('../services/cashfreeService');
// const PaymentLink = require('../models/paymentLinkModel');

// const router = express.Router();

// // Create payment link endpoint
// // router.post('/create-payment-link', async (req, res) => {
// //   try {
// //     const { customer_id, phone, amount, plan_id, plan_name } = req.body;
// //     console.log(req.body);
    

// //     // Validation
// //     if (!customer_id || !phone || !amount) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Missing required fields: customer_id, phone, amount'
// //       });
// //     }

// //     if (amount <= 0) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Amount must be greater than 0'
// //       });
// //     }

// //     // Create payment link
// //     const paymentResponse = await createPaymentLinkWithRetry({
// //       customer_id,
// //       phone,
// //       amount,
// //       plan_id,
// //       plan_name
// //     });

// //     res.json({
// //       success: true,
// //       paymentLink: paymentResponse.link_url,
// //       orderId: paymentResponse.link_id,
// //       message: 'Payment link created successfully'
// //     });

// //   } catch (error) {
// //     console.error('Payment link creation error:', error.message);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to create payment link',
// //       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
// //     });
// //   }
// // });
// router.post('/create-payment-link', async (req, res) => {
//   try {
//     const { customer_id, phone, amount, plan_id, plan_name, userid } = req.body;

//     // Validation
//     if (!customer_id || !phone || !amount || !userid) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: customer_id, phone, amount, userid'
//       });
//     }

//     if (amount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Amount must be greater than 0'
//       });
//     }

//     // Create payment link using Cashfree
//     const paymentResponse = await createPaymentLinkWithRetry({
//       customer_id,
//       phone,
//       amount,
//       plan_id,
//       plan_name
//     });

//     // Save in MongoDB
//     const newPayment = new PaymentLink({
//       userid,
//       link_id: paymentResponse.link_id,
//       link_url: paymentResponse.link_url,
//       customer_id,
//       phone,
//       amount,
//       plan_id,
//       plan_name,
//       status: 'PENDING'
//     });

//     await newPayment.save();

//     // Response
//     res.json({
//       success: true,
//       paymentLink: paymentResponse.link_url,
//       orderId: paymentResponse.link_id,
//       message: 'Payment link created and saved successfully'
//     });

//   } catch (error) {
//     console.error('Payment link creation error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create payment link',
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//     });
//   }
// });


// // Check payment status endpoint
// router.get('/status/:linkId', async (req, res) => {
//   try {
//     const { linkId } = req.params;

//     if (!linkId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Link ID is required'
//       });
//     }

//     const paymentStatus = await checkPaymentStatus(linkId);

//     res.json({
//       success: true,
//       data: paymentStatus
//     });

//   } catch (error) {
//     console.error('Payment status check error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to check payment status',
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//     });
//   }
// });

// // Webhook endpoint
// router.post('/webhook', async (req, res) => {
//   try {
//     const webhookData = req.body;
//     const result = await handlePaymentWebhook(webhookData); // <-- now async

//     res.status(200).json({
//       success: true,
//       message: 'Webhook processed successfully',
//       ...result
//     });
//   } catch (error) {
//     console.error('Webhook processing error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Webhook processing failed'
//     });
//   }
// });

// module.exports = router;


// routes/paymentRoutes.js
const express = require('express');
const { createPaymentLinkWithRetry, checkPaymentStatus, handlePaymentWebhook } = require('../services/cashfreeService');
const PaymentLink = require('../models/paymentLinkModel'); // ✅ IMPORTANT

const router = express.Router();

router.post('/create-payment-link', async (req, res) => {
  try {
    const { customer_id, phone, amount, plan_id, plan_name, userid } = req.body;

    if (!customer_id || !phone || !amount || !userid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customer_id, phone, amount, userid'
      });
    }

    const paymentResponse = await createPaymentLinkWithRetry({
      customer_id,
      phone,
      amount,
      plan_id,
      plan_name
    });

    const newPayment = new PaymentLink({
      userid,
      link_id: paymentResponse.link_id,
      link_url: paymentResponse.link_url,
      customer_id,
      phone,
      amount,
      plan_id,
      plan_name,
      status: 'PENDING'
    });

    const savedPayment = await newPayment.save(); // ✅ Save data
    console.log('Saved payment:', savedPayment);

    res.json({
      success: true,
      paymentLink: paymentResponse.link_url,
      orderId: paymentResponse.link_id,
      message: 'Payment link created and saved'
    });

  } catch (error) {
    console.error('Payment link save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save payment link',
      error: error.message
    });
  }
});



// Check payment status
router.get('/status/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;

    if (!linkId) {
      return res.status(400).json({
        success: false,
        message: 'Link ID is required'
      });
    }

    const paymentStatus = await checkPaymentStatus(linkId);

    res.json({
      success: true,
      data: paymentStatus
    });

  } catch (error) {
    console.error('Status check error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
});

// Webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    const result = await handlePaymentWebhook(webhookData);

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      ...result
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

module.exports = router;
