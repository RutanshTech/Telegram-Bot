const mongoose = require('mongoose');
const axios = require('axios');
const PaymentLink = require('../models/paymentLinkModel');
const User = require('../models/user.model');
const cron = require('node-cron');

// === Telegram Bot Details ===
const TELEGRAM_BOT_TOKEN = '7380247933:AAEdU571W0FlRt4NwsGHAmHrZ4DIYk5Sewc';
const CHAT_ID = '-1002633484562'; // group ID (not username!)
const REJOIN_LINK = 'https://t.me/YOUR_GROUP_LINK_OR_USERNAME';

const removeUserFromTelegram = async (userId) => {
  try {
    // Kick
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/kickChatMember`, {
      chat_id: CHAT_ID,
      user_id: userId
    });
    console.log(`Kicked user ${userId} from Telegram group`);

    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Unban
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/unbanChatMember`, {
      chat_id: CHAT_ID,
      user_id: userId,
      only_if_banned: true
    });
    console.log(`Unbanned user ${userId} from Telegram group`);

    // DM rejoin link
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: userId,
      text: `You're unbanned. Rejoin the group here: ${REJOIN_LINK}`
    });
  } catch (error) {
    console.error(`Telegram bot error for ${userId}:`, error.response?.data || error.message);
  }
};

const checkExpiredUsers = async () => {
  console.log('Running user cleanup + Telegram kick job');

  try {
    const now = new Date();

    const expiredPayments = await PaymentLink.find({
      expiry_date: { $lt: now },
    });

    for (const payment of expiredPayments) {
      const dbUserId = payment.userid;

      const deletedUser = await User.findByIdAndDelete(dbUserId);
      const telegramUserId = deletedUser?.telegramUserId || null;

      console.log(`Deleted DB user ${dbUserId} (${deletedUser?.email || 'no email'})`);
      await PaymentLink.findByIdAndDelete(payment._id);

      if (telegramUserId) {
        await removeUserFromTelegram(telegramUserId);
      } else {
        console.warn(`No Telegram ID found for user ${dbUserId}`);
      }
    }

    console.log(`Cleanup done at ${now.toISOString()}`);
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
};

// Initial run - only if MongoDB is connected
if (mongoose.connection.readyState === 1) {
  checkExpiredUsers();
} else {
  console.log('MongoDB not connected, skipping initial cleanup run');
}

// Run at 2 AM daily
cron.schedule('0 2 * * *', checkExpiredUsers);

module.exports = { checkExpiredUsers };