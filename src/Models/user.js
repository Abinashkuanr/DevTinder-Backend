
const mongoose = require('mongoose');
const validator = require("validator")

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
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Invalid email address: "+ value);
            }
        },

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
