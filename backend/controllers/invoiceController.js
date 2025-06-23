const Invoice = require("../models/Invoice");
const { generatePDF } = require("../services/pdfService");
const { sendInvoiceEmail } = require("../services/emailService");
const path = require("path");
const User = require("../models/user.model");
const PaymentLink = require("../models/paymentLinkModel")
const fs = require("fs");

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
    const payment = await PaymentLink.findOne({ userid: userid })

    
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

    // Debug log for GST/IGST
    console.log("Invoice Data Before Save:", invoiceData);

    // Save to MongoDB
    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Update PaymentLink with invoiceId
    if (payment) {
      payment.invoiceId = invoice._id;
      await payment.save();
    }

    // Generate PDF
    const pdfPath = path.join(__dirname, `../invoices/invoice_${invoice._id}.pdf`);
    await generatePDF(invoice, pdfPath);
    invoice.pdfPath = pdfPath;
    await invoice.save();

    // Email invoice
    await sendInvoiceEmail(user.email, pdfPath);

    res.status(201).json({ message: "Invoice created and emailed", invoice });
  } catch (err) {
    console.error("Invoice creation error:", err);
    res.status(500).json({ error: "Invoice creation failed" });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const Invoice = require("../models/Invoice");
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice || !invoice.pdfPath) {
      return res.status(404).json({ error: "Invoice or PDF not found" });
    }
    if (!fs.existsSync(invoice.pdfPath)) {
      return res.status(404).json({ error: "PDF file not found on server" });
    }
    res.download(invoice.pdfPath, `invoice_${invoice.invoiceNo || invoiceId}.pdf`);
  } catch (err) {
    res.status(500).json({ error: "Error downloading invoice" });
  }
};

