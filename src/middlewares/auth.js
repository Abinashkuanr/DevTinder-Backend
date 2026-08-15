const jwt = require("jsonwebtoken");
const User = require("../Models/user");

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
           return res.status(401).send("Please Login!");
        }

        const decodedObj = await jwt.verify(token, "DEV@Tinder$790");

        const { _id } = decodedObj;

        const user = await User.findById(_id);

        if (!user) {
            throw new Error("User not found");
        }

        req.user = user;
        next();

    } catch (err) {
        res.status(401).send("Error: " + err.message);
    }
};

module.exports = { userAuth };