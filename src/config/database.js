const mongoose = require('mongoose');
require('dotenv').config()

const connectDB = async () => {
    await mongoose.connect(
       process.env.DB_CONNECTION_SECRET
    );
};

module.exports = connectDB;