const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const kycRoutes = require('./routes/kycRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const planRoutes = require('./routes/planRoutes');
const otpRoutes = require('./routes/otpRoutes');  // 👈 OTP route import
const userRoutes = require('./routes/kycRoutes');
const invoiceRoutes = require("./routes/invoiceRoutes");
const digioRoute = require('./routes/digioRoute');
dotenv.config();


const app = express();
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/otp', otpRoutes);//  👈 Mount OTP route
app.use("/api/invoices", invoiceRoutes);
app.use('/api/digio', digioRoute);
app.use("/api", require("./routes/invite.route"));
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4010;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
