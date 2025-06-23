const axios = require("axios");
const InviteLink = require("../models/InviteLink");
const { model } = require("mongoose");

// const BOT_TOKEN = "7380247933:AAEdU571W0FlRt4NwsGHAmHrZ4DIYk5Sewc"; // Use actual bot token
const BOT_TOKEN = "7380247933:AAEdU571W0FlRt4NwsGHAmHrZ4DIYk5Sewc"; // Use actual bot token
// const CHANNEL_ID = "-1002633484562"; // Use actual channel username
const CHANNEL_ID = "-1002633484562"; // Use actual channel username
// Function to generate and store the invite link
async function generateAndStoreInviteLink(telegramUserId) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/createChatInviteLink`;

  try {
    // Make API request to Telegram to create the invite link
    const response = await axios.post(url, {
      chat_id: CHANNEL_ID,
      member_limit: 1,
      expire_date: Math.floor(Date.now() / 1000) + 86400,
    }).catch(error => {
      console.error('Telegram API Error:', error.response?.data || error.message);
      throw error;
    });

    console.log('Sending data to Telegram API:', {
      chat_id: CHANNEL_ID,
      member_limit: 1,
      expire_date: Math.floor(Date.now() / 1000) + 86400,
    });

    // Extract invite link and link ID from the response
    const { invite_link, invite_link_id } = response.data.result;

    console.log("Invite link generated successfully:", invite_link);

    // Create a new InviteLink document to store in the database
    const newLink = new InviteLink({
      link: invite_link,
      link_id: invite_link_id,
      telegramUserId: telegramUserId || undefined,
      is_used: false, // Initially, the link is not used
    });

    // Save the invite link to the database
    await newLink.save();

    // Return the saved link object
    return newLink;
  } catch (error) {
    // Handle any errors that occur during the request or database operations
    console.error("Error generating invite link:", error.response?.data || error.message);
    throw new Error((error || error));
  }
}

module.exports = { generateAndStoreInviteLink };