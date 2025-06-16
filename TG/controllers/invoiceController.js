
// const Invoice = require("../models/Invoice");
// const { generatePDF } = require("../services/pdfService");
// const { sendInvoiceEmail } = require("../services/emailService");
// const path = require("path");
// const User = require("../models/user.model");

// // GST State Code Map

// exports.createInvoice = async (req, res) => {
//   try {
//     const {
//       invoiceNo,
//       billDate,
//       userid,
//       creator,
//       description,
//       price,
//       transactionId
//     } = req.body;

//     // Fetch user info
//     const user = await User.findById(userid);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const stateToCode = {
//       "Andhra Pradesh": "37", "Arunachal Pradesh": "12", "Assam": "18",
//       "Bihar": "10", "Chhattisgarh": "22", "Goa": "30", "Gujarat": "24",
//       "Haryana": "06", "Himachal Pradesh": "02", "Jharkhand": "20",
//       "Karnataka": "29", "Kerala": "32", "Madhya Pradesh": "23",
//       "Maharashtra": "27", "Manipur": "14", "Meghalaya": "17", "Mizoram": "15",
//       "Nagaland": "13", "Odisha": "21", "Punjab": "03", "Rajasthan": "08",
//       "Sikkim": "11", "Tamil Nadu": "33", "Telangana": "36", "Tripura": "16",
//       "Uttar Pradesh": "09", "Uttarakhand": "05", "West Bengal": "19",
//       "Delhi": "07", "Jammu and Kashmir": "01", "Ladakh": "38"
//     };

//     const basePrice = parseFloat(price);
//     const taxPercent = 18;
//     let total = basePrice;

//     // Build base invoice data
//     const invoiceData = {
//       invoiceNo,
//       billDate,
//       userid,
//       billedTo: {
//         name: `${user.firstName} ${user.middleName || ""} ${user.lastName}`.trim(),
//         phone: user.phone || "",
//         email: user.email,
//         address: user.City,
//         stateCode: user.stateCode
//       },
//       creator: {
//         name: "VYOM RESEARCH LLP",
//         pan: "AAYFV4090K",
//         gstin: "24AAYFV4090K1ZE",
//         address: "Shop no. 238 Services, Gujarat",
//         stateCode: "24"
//       },
//       description,
//       price: basePrice,
//       transactionId
//     };
//     console.log(invoiceData);

//     // GST logic
//     if (user.stateCode) {
//       const cgst = taxPercent / 2;
//       const sgst = taxPercent / 2;
//       const cgstAmt = (basePrice * cgst) / 100;
//       const sgstAmt = (basePrice * sgst) / 100;

//       invoiceData.cgst = cgst;
//       invoiceData.cgstAmt = cgstAmt;
//       invoiceData.sgst = sgst;
//       invoiceData.sgstAmt = sgstAmt;

//       total += cgstAmt + sgstAmt;
//     } else {
//       const igst = taxPercent;
//       const igstAmt = (basePrice * igst) / 100;

//       invoiceData.igst = igst;
//       invoiceData.igstAmt = igstAmt;

//       total += igstAmt;
//     }

//     invoiceData.total = total;

//     // Save invoice
//     const invoice = new Invoice(invoiceData);
//     await invoice.save();
//     console.log(invoice);

//     // Generate PDF
//     const pdfPath = path.join(__dirname, `../invoices/invoice_${invoice._id}.pdf`);
//     await generatePDF(invoice, pdfPath);

//     invoice.pdfPath = pdfPath;
//     await invoice.save();

//     // Send invoice email
//     await sendInvoiceEmail(user.email, pdfPath);

//     res.status(201).json({ message: "Invoice created and emailed", invoice });
//   } catch (err) {
//     console.error("Invoice creation error:", err);
//     res.status(500).json({ error: "Invoice creation failed" });
//   }
// };
// // 


// const Invoice = require("../models/Invoice");
// const { generatePDF } = require("../services/pdfService");
// const { sendInvoiceEmail } = require("../services/emailService");
// const path = require("path");
// const User = require("../models/user.model");

// exports.createInvoice = async (req, res) => {
//   try {
//     const {
//       invoiceNo,
//       billDate,
//       userid,
//       description
//     } = req.body;

//     // Fetch user with required fields
//     const user = await User.findOne({ _id: userid }, 'firstName middleName lastName phone email City stateCode amount transactionId');
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const basePrice = parseFloat(user.amount);
//     const transactionId = user.transactionId;
//     const taxPercent = 18;
//     let total = basePrice;

//     // Build invoice data
//     const invoiceData = {
//       invoiceNo,
//       billDate,
//       userid,
//       billedTo: {
//         name: `${user.firstName} ${user.middleName || ""} ${user.lastName}`.trim(),
//         phone: user.phone || "",
//         email: user.email,
//         address: user.City,
//         stateCode: user.stateCode
//       },
//       creator: {
//         name: "VYOM RESEARCH LLP",
//         pan: "AAYFV4090K",
//         gstin: "24AAYFV4090K1ZE",
//         address: "Shop no. 238 Services, Gujarat",
//         stateCode: "24"
//       },
//       description,
//       price: basePrice,
//       transactionId
//     };

//     // GST logic
//     if (user.stateCode && user.stateCode !== "24") {
//       // IGST (Interstate)
//       const igst = taxPercent;
//       const igstAmt = (basePrice * igst) / 100;
//       invoiceData.igst = igst;
//       invoiceData.igstAmt = igstAmt;
//       total += igstAmt;
//     } else {
//       // CGST + SGST (Intrastate)
//       const cgst = taxPercent / 2;
//       const sgst = taxPercent / 2;
//       const cgstAmt = (basePrice * cgst) / 100;
//       const sgstAmt = (basePrice * sgst) / 100;
//       invoiceData.cgst = cgst;
//       invoiceData.cgstAmt = cgstAmt;
//       invoiceData.sgst = sgst;
//       invoiceData.sgstAmt = sgstAmt;
//       total += cgstAmt + sgstAmt;
//     }

//     invoiceData.total = total;

//     // Save to MongoDB
//     const invoice = new Invoice(invoiceData);
//     await invoice.save();

//     // Generate PDF
//     const pdfPath = path.join(__dirname, `../invoices/invoice_${invoice._id}.pdf`);
//     await generatePDF(invoice, pdfPath);
//     invoice.pdfPath = pdfPath;
//     await invoice.save();

//     // Email invoice
//     await sendInvoiceEmail(user.email, pdfPath);

//     res.status(201).json({ message: "Invoice created and emailed", invoice });
//   } catch (err) {
//     console.error("Invoice creation error:", err);
//     res.status(500).json({ error: "Invoice creation failed" });
//   }
// };

// const Invoice = require("../models/Invoice");
// const { generatePDF } = require("../services/pdfService");
// const { sendInvoiceEmail } = require("../services/emailService");
// const path = require("path");
// const User = require("../models/user.model");

// exports.createInvoice = async (req, res) => {
//   try {
//     const {
//       invoiceNo,
//       billDate,
//       userid,
//       description
//     } = req.body;

//     // Fetch user with required fields
//     const user = await User.findOne({ _id: userid }, 'firstName middleName lastName phone email City stateCode amount transactionId');
//    console.log(user)
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const basePrice = parseFloat(user.amount);
//     const transactionId = user.transactionId;
//     const taxPercent = 18;
//     let total = basePrice;

//     // Build invoice data
//     const invoiceData = {
//       invoiceNo,
//       billDate,
//       userid,
//       billedTo: {
//         name: `${user.firstName} ${user.middleName || ""} ${user.lastName}`.trim(),
//         phone: user.phone || "",
//         email: user.email,
//         address: user.City,
//         stateCode: user.stateCode
//       },
//       creator: {
//         name: "VYOM RESEARCH LLP",
//         pan: "AAYFV4090K",
//         gstin: "24AAYFV4090K1ZE",
//         address: "Shop no. 238 Services, Gujarat",
//         stateCode: "24"
//       },
//       description,
//       price: basePrice,
//       transactionId
//     };

//     // GST logic
//     if (user.stateCode && user.stateCode !== "24") {
//       // IGST (Interstate)
//       const igst = taxPercent;
//       const igstAmt = (basePrice * igst) / 100;
//       invoiceData.igst = igst;
//       invoiceData.igstAmt = igstAmt;
//       total += igstAmt;
//     } else {
//       // CGST + SGST (Intrastate)
//       const cgst = taxPercent / 2;
//       const sgst = taxPercent / 2;
//       const cgstAmt = (basePrice * cgst) / 100;
//       const sgstAmt = (basePrice * sgst) / 100;
//       invoiceData.cgst = cgst;
//       invoiceData.cgstAmt = cgstAmt;
//       invoiceData.sgst = sgst;
//       invoiceData.sgstAmt = sgstAmt;
//       total += cgstAmt + sgstAmt;
//     }

//     invoiceData.total = total;

//     // Save to MongoDB
//     const invoice = new Invoice(invoiceData);
//     await invoice.save();

//     // Generate PDF
//     const pdfPath = path.join(__dirname, `../invoices/invoice_${invoice._id}.pdf`);
//     await generatePDF(invoice, pdfPath);
//     invoice.pdfPath = pdfPath;
//     await invoice.save();

//     // Email invoice
//     await sendInvoiceEmail(user.email, pdfPath);

//     res.status(201).json({ message: "Invoice created and emailed", invoice });
//   } catch (err) {
//     console.error("Invoice creation error:", err);
//     res.status(500).json({ error: "Invoice creation failed" });
//   }
// };
const Invoice = require("../models/Invoice");
const { generatePDF } = require("../services/pdfService");
const { sendInvoiceEmail } = require("../services/emailService");
const path = require("path");
const User = require("../models/user.model");
const PaymentLink = require("../models/paymentLinkModel")
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

    const transactionId = user.transactionId;
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

    // GST logic
    if (user.stateCode && user.stateCode !== "24") {
      // IGST (Interstate)
      const igst = taxPercent;
      const igstAmt = parseFloat(((basePrice * igst) / 100).toFixed(2));
      invoiceData.igst = igst;
      invoiceData.igstAmt = igstAmt;
      total += igstAmt;
    } else {
      // CGST + SGST (Intrastate)
      const cgst = taxPercent / 2;
      const sgst = taxPercent / 2;
      const cgstAmt = parseFloat(((basePrice * cgst) / 100).toFixed(2));
      const sgstAmt = parseFloat(((basePrice * sgst) / 100).toFixed(2));
      invoiceData.cgst = cgst;
      invoiceData.cgstAmt = cgstAmt;
      invoiceData.sgst = sgst;
      invoiceData.sgstAmt = sgstAmt;
      total += cgstAmt + sgstAmt;
    }

    invoiceData.total = parseFloat(total.toFixed(2));

    // Save to MongoDB
    const invoice = new Invoice(invoiceData);
    await invoice.save();

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

