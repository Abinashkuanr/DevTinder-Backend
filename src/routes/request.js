const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../Models/connectionRequest");
const User = require("../Models/user");


// ======================================================
// SEND CONNECTION REQUEST
// POST /request/send/interested/:toUserId
// POST /request/send/ignored/:toUserId
// ======================================================

requestRouter.post(
    "/request/send/:status/:toUserId",
    userAuth,
    async (req, res) => {
        try {
            const fromUserId = req.user._id;
            const toUserId = req.params.toUserId;
            const status = req.params.status;

            const allowedStatus = ["ignored", "interested"];

            if (!allowedStatus.includes(status)) {
                return res.status(400).json({
                    message: "Invalid status type: " + status
                });
            }

            // Find receiver
            const toUser = await User.findById(toUserId);

            if (!toUser) {
                return res.status(404).json({
                    message: "User not found!"
                });
            }

            // Check existing request in either direction
            const existingConnectionRequest =
                await ConnectionRequest.findOne({
                    $or: [
                        {
                            fromUserId,
                            toUserId
                        },
                        {
                            fromUserId: toUserId,
                            toUserId: fromUserId
                        }
                    ]
                });

            if (existingConnectionRequest) {
                return res.status(400).json({
                    message: "Connection Request Exists!!"
                });
            }

            // Create request
            const connectionRequest = new ConnectionRequest({
                fromUserId,
                toUserId,
                status
            });

            const data = await connectionRequest.save();

            res.status(201).json({
                message:
                    req.user.firstName +
                    " is " +
                    status +
                    " in " +
                    toUser.firstName,
                data
            });

        } catch (err) {
            console.error("Send request error:", err);

            res.status(400).json({
                message: "Error: " + err.message
            });
        }
    }
);


// ======================================================
// REVIEW CONNECTION REQUEST
// POST /request/review/accepted/:requestId
// POST /request/review/rejected/:requestId
// ======================================================

requestRouter.post(
    "/request/review/:status/:requestId",
    userAuth,
    async (req, res) => {
        try {
            const loggedInUserId = req.user._id;
            const { status, requestId } = req.params;

            const allowedStatus = ["accepted", "rejected"];

            if (!allowedStatus.includes(status)) {
                return res.status(400).json({
                    message: "Invalid status type: " + status
                });
            }

            // Find the connection request
            const connectionRequest =
                await ConnectionRequest.findOne({
                    _id: requestId,
                    toUserId: loggedInUserId,
                    status: "interested"
                });

            if (!connectionRequest) {
                return res.status(404).json({
                    message: "Connection request not found!"
                });
            }

            // Update request status
            connectionRequest.status = status;

            const data = await connectionRequest.save();

            res.json({
                message:
                    "Connection request " + status + " successfully",
                data
            });

        } catch (err) {
            console.error("Review request error:", err);

            res.status(400).json({
                message: "Error: " + err.message
            });
        }
    }
);


module.exports = requestRouter;