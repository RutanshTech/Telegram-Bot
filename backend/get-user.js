require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

async function getUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne();
    console.log('Sample User ID:', user?._id);
  } catch(e) {
    console.error(e);
  } finally {
    await mongoose.connection.close();
  }
}

getUser(); 