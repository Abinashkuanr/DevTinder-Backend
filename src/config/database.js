const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://abinash:Noy7jwtv9FEMizIh@coderak.xo6cx77.mongodb.net/devTinder?retryWrites=true&w=majority"
    );
};

module.exports = connectDB;