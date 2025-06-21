const fs = require("fs");
const PDFDocument = require("pdfkit");

const generatePDF = (invoice, filepath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    const primaryColor = "#145C7D";
    const greyLine = "#CCCCCC";

    // Header background
    doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);

    // Header text
    doc.fillColor("white").fontSize(26).font("Helvetica-Bold").text("INVOICE", 50, 30);

    // Company Info (right aligned)
    const company = invoice.company || {};
    doc.fontSize(10).font("Helvetica").fillColor("white");
    const companyInfo = [
      company.name,
      company.address,
      company.city,
      company.phone,
      company.email
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
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

module.exports = { generatePDF };

