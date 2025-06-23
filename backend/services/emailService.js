const nodemailer = require("nodemailer");

exports.sendInvoiceEmail = async (recipient, pdfPath) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: "Invoice",
    text: "Please find attached your invoice.",
    attachments: [{ filename: "invoice.pdf", path: pdfPath }]
  });
};
