
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 7,
       
    },  
    lastName: {
        type:String
    },
    emailId: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,

    },
    password: {
        type: String
    },
    age: {
        type: Number,
        min: 18,
        max:50,
    },
    gender: {
        type: String,
        validate(value) {
            if(!["male", "female", 'others'].includes(value)) {
              throw new Error("Gender data is not valid");
            }
        }
    },
    photoUrl: {
        type: String,
        default: "https://geographyandyou.com/images/user-profile.png",
    },
    skills: {
        type: [String],
    }

},{
    timestamps: true,
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
