const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validaton");
const bcrypt = require("bcrypt");

profileRouter.get("/profileview", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error("Invalid Edit Request");
        }

        const loggedInUser = req.user;

        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });

        await loggedInUser.save();

        res.json({message: `${loggedInUser.firstName}, your profile updated successfully!`
          ,data: loggedInUser,
    });

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

profileRouter.patch('/profile/password', userAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const loggedInUser = req.user;

        if (!currentPassword || !newPassword) {
            throw new Error("Current password and new password are required");
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            throw new Error(
                "New password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            );
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, loggedInUser.password);
        if (!isCurrentPasswordValid) {
            throw new Error("Current password is incorrect");
        }

        const isSamePassword = await bcrypt.compare(newPassword, loggedInUser.password);
        if (isSamePassword) {
            throw new Error("New password must be different from the current password");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        loggedInUser.password = hashedNewPassword;
        await loggedInUser.save();

        res.json({ message: `${loggedInUser.firstName}, your password updated successfully!` });

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

module.exports = profileRouter;