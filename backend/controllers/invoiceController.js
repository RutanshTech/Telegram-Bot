const Invoice = require("../models/Invoice");
const { generatePDF } = require("../services/pdfService");
const { sendInvoiceEmail } = require("../services/emailService");
const User = require("../models/user.model");
const PaymentLink = require("../models/paymentLinkModel");
const axios = require("axios");
const cloudinary = require("cloudinary");

exports.createInvoice = async (req, res) => {
  try {
    const {
      invoiceNo,
      billDate,
      userid,
      description
    } = req.body;

    // Fetch user with required fields
    const user = await User.findOne({ _id: userid }, 'firstName middleName lastName phone email City stateCode amount transactionId');

    if (!user) return res.status(404).json({ error: "User not found" });
    const payment = await PaymentLink.findOne({ userid: userid });

    const basePrice = parseFloat(payment.amount);
    if (isNaN(basePrice)) {
      return res.status(400).json({ error: "Invalid amount in user data" });
    }

    const transactionId = payment?.link_id || payment?.transactionId || "";
    const taxPercent = 18;
    let total = basePrice;

    // Build invoice data
    const invoiceData = {
      invoiceNo,
      billDate,
      userid,
      billedTo: {
        name: `${user.firstName} ${user.middleName || ""} ${user.lastName}`.trim(),
        phone: user.phone || "",
        email: user.email,
        address: user.City,
        stateCode: user.stateCode || ""
      },
      creator: {
        name: "VYOM RESEARCH LLP",
        pan: "AAYFV4090K",
        gstin: "24AAYFV4090K1ZE",
        address: "Shop no. 238 Services, Gujarat",
        stateCode: "24"
      },
      description,
      price: basePrice,
      transactionId
    };

    // GST logic (Always IGST)
    const igst = taxPercent;
    const igstAmt = parseFloat(((basePrice * igst) / 100).toFixed(2));
    invoiceData.igst = igst;
    invoiceData.igstAmt = igstAmt;
    total += igstAmt;

    invoiceData.total = parseFloat(total.toFixed(2));

    // Save to MongoDB
    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Update PaymentLink with invoiceId
    if (payment) {
      payment.invoiceId = invoice._id;
      await payment.save();
    }

    // Generate PDF and get Cloudinary URL
    const pdfUrl = await generatePDF(invoice);
    invoice.pdfUrl = pdfUrl;
    await invoice.save();

    // Send email with invoice
    await sendInvoiceEmail(
      invoice.billedTo.email,
      "Your Invoice",
      `Dear ${invoice.billedTo.name},\n\nPlease find attached your invoice.\n\nBest regards,\nYour Company`,
      pdfUrl
    );

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice
    });
  } catch (err) {
    console.error("Invoice creation error:", err);
    let errorMsg = "Invoice creation failed";
    if (err.message && err.message.includes('Cloudinary')) {
      errorMsg = "Cloudinary upload failed. Please check your Cloudinary configuration or try again later.";
    } else if (err.message && err.message.includes('PDF')) {
      errorMsg = "PDF generation failed. Please try again later.";
    } else if (err.message) {
      errorMsg = err.message;
    }
    res.status(500).json({ error: errorMsg });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    if (!invoiceId || invoiceId === 'null' || invoiceId === 'undefined') {
      return res.status(400).json({ error: "Invalid or missing invoiceId" });
    }
    const invoice = await Invoice.findById(invoiceId);
    
    if (!invoice || !invoice.pdfUrl) {
      return res.status(404).json({ error: "Invoice or PDF not found" });
    }

    // Add caching headers
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    res.setHeader('ETag', `"${invoice._id}"`);
    
    // Check if client has cached version
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch === `"${invoice._id}"`) {
      return res.status(304).end();
    }

    // Download the PDF from Cloudinary with timeout and retries
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const signedUrl = cloudinary.utils.private_download_url(
          invoice.pdfUrl,
          'pdf', // extension
          {
            resource_type: 'raw',
            type: 'private',
            expires_at: Math.floor(Date.now() / 1000) + 3600
          }
        );

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.invoiceNo}.pdf`);
        
        // Send the PDF
        return res.send(Buffer.from(signedUrl));
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        lastError = error;
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }

    // If all retries failed
    console.error("All download attempts failed:", lastError);
    res.status(500).json({ 
      error: "Error downloading invoice",
      details: lastError.message
    });
  } catch (err) {
    console.error("Error downloading invoice:", err);
    res.status(500).json({ 
      error: "Error downloading invoice",
      details: err.message
    });
  }
};


