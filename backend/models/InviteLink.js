  const mongoose = require("mongoose");

  const inviteLinkSchema = new mongoose.Schema({
    link: String,
    link_id: String,
    telegramUserId: { type: String },
    is_used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  });

  module.exports = mongoose.model("InviteLink", inviteLinkSchema);
  