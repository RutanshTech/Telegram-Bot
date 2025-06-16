const { createPaymentLink, checkPaymentStatus } = require('../services/cashfreeService');

// const createLink = async (req, res) => {
//   try {
//     const { customer_id, phone, amount } = req.body;
//     const data = await createPaymentLink({ customer_id, phone, amount });
//     res.status(200).json({ paymentLink: data.link_url, linkId: data.link_id });
//   } catch (error) {
//     console.error('Payment Link Error:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Payment link creation failed' });
//   }
// };
const createLink = async (req, res) => {
  try {
    const { customer_id, phone, amount, plan_id, plan_name } = req.body;
    const userid = req.user?.id || req.body.userid; // Get from JWT or request body

    if (!userid || !customer_id || !phone || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const data = await createPaymentLink({ customer_id, phone, amount, plan_id, plan_name });

    // Save to MongoDB
    const newPayment = new PaymentLink({
      userid,
      link_id: data.link_id,
      link_url: data.link_url,
      customer_id,
      phone,
      amount,
      plan_id,
      plan_name,
      status: 'PENDING'
    });

    await newPayment.save();

    res.status(200).json({
      success: true,
      paymentLink: data.link_url,
      linkId: data.link_id,
      message: 'Payment link created and saved'
    });

  } catch (error) {
    console.error('Payment Link Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Payment link creation failed' });
  }
};
const getStatus = async (req, res) => {
  try {
    const { linkId } = req.params;
    const data = await checkPaymentStatus(linkId);
    res.status(200).json({ status: data.link_status, data });
  } catch (error) {
    console.error('Status Check Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
};

module.exports = {
  createLink,
  getStatus
};
