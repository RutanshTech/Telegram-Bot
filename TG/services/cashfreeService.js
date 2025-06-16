const axios = require('axios');
const { v4: uuidv4 } = require('uuid');


const createPaymentLink = async ({ customer_id, phone, amount, plan_id, plan_name }) => {
  const linkId = `TG-${uuidv4()}`;

  const response = await axios.post(
    `${process.env.CASHFREE_BASE_URL}/links`,
    {
      link_id: linkId,
      customer_details: {
        customer_id,
        customer_phone: phone
      },
      link_notify: {
        send_sms: true,
        send_email: false
      },
      link_meta: {
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?status=success&order_id=${linkId}`,
        notify_url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/payment/webhook`,
        plan_id: plan_id || '',
        customer_id: customer_id,
        plan_name: plan_name || 'Plan Purchase'
      },
      link_amount: amount,
      link_currency: 'INR',
      link_purpose: plan_name || 'Telegram Subscription',
      link_expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      link_minimum_partial_amount: amount
    },
    {
      headers: {
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    ...response.data,
    link_id: linkId
  };
};

const checkPaymentStatus = async (linkId) => {
  try {
    const response = await axios.get(
      `${process.env.CASHFREE_BASE_URL}/links/${linkId}`,
      {
        headers: {
          'x-client-id': process.env.CASHFREE_CLIENT_ID,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Payment status check error:', error.response?.data || error.message);
    throw error;
  }
};

const handlePaymentWebhook = (webhookData) => {
  try {
    console.log('Payment webhook received:', webhookData);
    
    const { type, data } = webhookData;
    
    switch (type) {
      case 'PAYMENT_SUCCESS_WEBHOOK':
        console.log('Payment successful for order:', data.order?.order_id);
        break;
        
      case 'PAYMENT_FAILED_WEBHOOK':
        console.log('Payment failed for order:', data.order?.order_id);
        break;
        
      default:
        console.log('Unknown webhook type:', type);
    }
    
    return { status: 'processed' };
  } catch (error) {
    console.error('Webhook processing error:', error);
    throw error;
  }
};

const createPaymentLinkWithRetry = async (paymentData, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await createPaymentLink(paymentData);
    } catch (error) {
      console.error(`Payment link creation attempt ${i + 1} failed:`, error.response?.data || error.message);
      
      if (i === retries - 1) {
        throw new Error(`Failed to create payment link after ${retries} attempts: ${error.response?.data?.message || error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

module.exports = {
  createPaymentLink,
  createPaymentLinkWithRetry,
  checkPaymentStatus,
  handlePaymentWebhook
};