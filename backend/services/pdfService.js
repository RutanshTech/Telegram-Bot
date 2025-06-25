const fs = require("fs");
const PDFDocument = require("pdfkit");
const cloudinary = require("../configs/cloudinary");
const { Readable } = require('stream');
const Invoice = require("../models/Invoice");

const generatePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      // Add error handler for PDF generation
      doc.on('error', (error) => {
        console.error("PDF Generation Error:", error);
        reject(error);
      });

      // Add timeout protection
      const timeout = setTimeout(() => {
        reject(new Error('PDF generation timeout'));
      }, 30000); // 30 second timeout

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', async () => {
        clearTimeout(timeout);
        try {
          const pdfBuffer = Buffer.concat(chunks);
          
          // Prepare context data with proper string conversion
          const contextData = {
            customer_id: String(invoice.userid || ''),
            invoice_no: String(invoice.invoiceNo || ''),
            created_at: new Date().toISOString()
          };

          // Upload to Cloudinary using buffer upload with enhanced options
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "invoices",
                resource_type: "raw",
                public_id: `invoice_${invoice._id}`,
                type: "private",
                overwrite: true,
                tags: ["invoice", invoice.invoiceNo].filter(Boolean),
                context: contextData
              },
              (error, result) => {
                console.log('Cloudinary upload callback:', { error, result }); // Debug log
                if (error) {
                  const errMsg = `Cloudinary Upload Error: ${error.message || error}`;
                  console.error(errMsg);
                  reject(new Error(errMsg));
                } else {
                  // Use the full public_id with folder for signed URL
                  const fullPublicId = result.public_id;
                  // Log the full public_id and result
                  console.log('Cloudinary upload success. public_id:', fullPublicId);
                  // Generate a signed URL that expires in 1 hour
                  const signedUrl = cloudinary.utils.private_download_url(
                    fullPublicId,
                    'pdf', // extension
                    {
                      resource_type: 'raw',
                      type: 'private',
                      expires_at: Math.floor(Date.now() / 1000) + 3600
                    }
                  );
                  console.log('Generated signedUrl:', signedUrl);
                  resolve(signedUrl);
                }
              }
            );
            uploadStream.end(pdfBuffer);
          });

          resolve(result);
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error);
          reject(error);
        }
      });

      // Generate PDF content
      const primaryColor = "#145C7D";
      const greyLine = "#CCCCCC";

      // Header background
      doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);

      // Header text
      doc.fillColor("white").fontSize(26).font("Helvetica-Bold").text("INVOICE", 50, 30);

      // Company Info (right aligned)
      const company = invoice.creator || {};
      doc.fontSize(10).font("Helvetica").fillColor("white");
      const companyInfo = [
        company.name,
        company.address,
        `GSTIN: ${company.gstin}`,
        `PAN: ${company.pan}`
      ].filter(Boolean);
      companyInfo.forEach((line, i) => {
        doc.text(line, 400, 25 + i * 12, { align: "right" });
      });

      doc.moveDown(3);
      doc.fillColor("black").fontSize(11);

      // Invoice Details (left column)
      let infoY = doc.y;
      doc.font("Helvetica-Bold").text("Invoice No:", 50, infoY);
      doc.font("Helvetica").text(invoice.invoiceNo || "", 130, infoY);

      infoY += 15;
      doc.font("Helvetica-Bold").text("Date of Issue:", 50, infoY);
      doc.font("Helvetica").text(invoice.billDate?.toDateString() || "", 130, infoY);

      infoY += 15;
      doc.font("Helvetica-Bold").text("Transaction ID:", 50, infoY);
      doc.font("Helvetica").text(invoice.transactionId || "", 130, infoY);

      // Bill To Section (right column)
      const billedTo = invoice.billedTo || {};
      const billToX = 350;
      let billToY = doc.y - 45;

      doc.font("Helvetica-Bold").fontSize(12).fillColor("black")
        .text("Bill To", billToX, billToY, { underline: true });

      doc.font("Helvetica").fontSize(10).fillColor("black");
      billToY += 15;
      doc.text(`Name: ${billedTo.name || ""}`, billToX, billToY);
      billToY += 12;
      doc.text(`Phone: ${billedTo.phone || ""}`, billToX, billToY);
      billToY += 12;
      doc.text(`Email: ${billedTo.email || ""}`, billToX, billToY);
      billToY += 12;
      doc.text(`Address: ${billedTo.address || ""}`, billToX, billToY);

      doc.moveDown(2);

      // Table Header
      const tableTop = doc.y;
      doc.fontSize(11).font("Helvetica-Bold").fillColor(primaryColor);
      doc.text("Item", 50, tableTop);
      doc.text("Description", 90, tableTop);
      doc.text("Price", 300, tableTop, { width: 50 });
      doc.text("IGST %", 370, tableTop, { width: 50 });
      doc.text("IGST Amt", 450, tableTop, { width: 70 });

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor(greyLine).stroke();

      // Table Row
      const rowY = tableTop + 25;
      doc.font("Helvetica").fillColor("black").fontSize(10);
      doc.text("1", 50, rowY);
      doc.text(invoice.description || "", 90, rowY);
      doc.text(`₹${(invoice.price || 0).toFixed(2)}`, 300, rowY, { width: 50 });
      doc.text(`${invoice.igst || 0}%`, 370, rowY, { width: 50 });
      doc.text(`₹${(invoice.igstAmt || 0).toFixed(2)}`, 450, rowY, { width: 70 });

      // Total Amount
      doc.font("Helvetica-Bold").fontSize(12).fillColor(primaryColor)
        .text(`Total Amount: ₹${(invoice.total || 0).toFixed(2)}`, 50, rowY + 50, { align: "right" });

      // Footer
      doc.fillColor("white")
        .rect(0, doc.page.height - 60, doc.page.width, 40)
        .fill(primaryColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Thank you for your business!", 0, doc.page.height - 50, {
          align: "center"
        });

      doc.end();
    } catch (error) {
      console.error("PDF Service Error:", error);
      reject(error);
    }
  });
};

// Add cleanup function for old invoices
const cleanupOldInvoices = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldInvoices = await Invoice.find({
      createdAt: { $lt: thirtyDaysAgo },
      pdfUrl: { $exists: true }
    });

    for (const invoice of oldInvoices) {
      const publicId = `invoices/invoice_${invoice._id}`;
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      invoice.pdfUrl = null;
      await invoice.save();
    }
  } catch (error) {
    console.error("Cleanup Error:", error);
  }
};

// Run cleanup daily
setInterval(cleanupOldInvoices, 24 * 60 * 60 * 1000);

module.exports = { generatePDF };