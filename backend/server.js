const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const kycRoutes = require('./routes/kycRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const planRoutes = require('./routes/planRoutes');
const otpRoutes = require('./routes/otpRoutes');  // 👈 OTP route import
const invoiceRoutes = require("./routes/invoiceRoutes");
const digioRoute = require('./routes/digio.routes');
const digioErrorRoutes = require('./routes/digioRoutes');
require('./jobs/expireUsersJob');
require('./cron/updateSubscriptions'); // Import subscription update cron job
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "https://telegram-bot-puce-phi.vercel.app", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

app.use(cors({
  origin: [
    "https://localhost:5173",
    "https://telegram-bot-tau-teal.vercel.app/"
  ],
  credentials: true
}));
// Middleware to parse JSON bodies
app.use(express.json());

// Mount routes
app.use('/api/users', kycRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/otp', otpRoutes);//  👈 Mount OTP route
app.use("/api/invoices", invoiceRoutes);
app.use('/api', digioRoute);
app.use('/api/digio', digioErrorRoutes);
app.use("/api", require("./routes/invite.route"));
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
