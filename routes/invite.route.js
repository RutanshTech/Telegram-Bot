const express = require("express");
const router = express.Router();
const InviteLink = require("../models/InviteLink");  // Model to interact with the database
const { generateAndStoreInviteLink } = require("../services/generateOneTimeInviteLink");  // Function to generate the link
const inviteController = require("../controllers/invoiceController");  // Controller to mark link as used

// Route to generate a one-time invite link
router.get("/invite-link", async (req, res) => {
  try {
    // Generate and store the invite link
    const link = await generateAndStoreInviteLink();

    // Return the generated invite link as JSON
    res.json({ link: link.link });
  } catch (error) {
    // Handle error if something goes wrong
    console.error("Error generating invite link:", error.message);
    res.status(500).json({ message: "Error generating invite link", error: error.message });
  }
});

// Route to mark the invite link as used
router.patch("/invite-link/use", inviteController.createInvoice);

module.exports = router;
