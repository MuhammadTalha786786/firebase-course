const mongoose = require('mongoose');

console.log(process.env.MONGODB_URI)

const connectDB = async () => {


  try {
    const conn = await mongoose.connect('mongodb+srv://mtalha25800:mtalha25800@cluster0.lhw2mar.mongodb.net/userdb');    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;