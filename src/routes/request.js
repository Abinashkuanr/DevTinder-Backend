const express = require("express");

const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

const ConnectionRequest = require("../Models/connectionRequest");
const User = require("../Models/user");

const sendEmail = require("../utils/sendEmail");


// ======================================================
// SEND CONNECTION REQUEST
// POST /request/send/:status/:toUserId
// ======================================================

requestRouter.post(
    "/request/send/:status/:toUserId",
    userAuth,
    async (req, res) => {

        try {

            const fromUserId = req.user._id;
            const toUserId = req.params.toUserId;
            const status = req.params.status;


            // ==================================================
            // CHECK STATUS
            // ==================================================

            const allowedStatus = [
                "ignored",
                "interested",
            ];

            if (!allowedStatus.includes(status)) {

                return res.status(400).json({
                    message:
                        "Invalid status type: " + status,
                });
            }


            // ==================================================
            // CANNOT SEND REQUEST TO YOURSELF
            // ==================================================

            if (
                fromUserId.toString() ===
                toUserId.toString()
            ) {

                return res.status(400).json({
                    message:
                        "Cannot send connection request to yourself!",
                });
            }


            // ==================================================
            // FIND RECEIVER
            // ==================================================

            const toUser =
                await User.findById(toUserId);

            if (!toUser) {

                return res.status(404).json({
                    message: "User not found!",
                });
            }


            // ==================================================
            // CHECK EXISTING REQUEST
            // ==================================================

            const existingConnectionRequest =
                await ConnectionRequest.findOne({

                    $or: [

                        {
                            fromUserId: fromUserId,
                            toUserId: toUserId,
                        },

                        {
                            fromUserId: toUserId,
                            toUserId: fromUserId,
                        },

                    ],
                });


            if (existingConnectionRequest) {

                return res.status(400).json({
                    message:
                        "Connection Request Exists!!",
                });
            }


            // ==================================================
            // CREATE REQUEST
            // ==================================================

            const connectionRequest =
                new ConnectionRequest({

                    fromUserId: fromUserId,
                    toUserId: toUserId,
                    status: status,

                });


            const data =
                await connectionRequest.save();


            console.log(
                "✅ Connection request saved"
            );


            // ==================================================
            // SEND EMAIL WHEN INTERESTED
            // ==================================================

            if (status === "interested") {

                try {

                    if (!toUser.email) {

                        console.log(
                            "⚠️ Receiver email not found"
                        );

                    } else {

                        console.log(
                            "📧 Sending email..."
                        );

                        console.log(
                            "FROM: no-reply@devtinder.art"
                        );

                        console.log(
                            "TO:",
                            toUser.email
                        );


                        const emailResponse =
                            await sendEmail.run(

                                toUser.email,

                                "no-reply@devtinder.art"
                            );


                        console.log(
                            "✅ Email sent successfully!"
                        );


                        if (emailResponse) {

                            console.log(
                                "SES Message ID:",
                                emailResponse.MessageId
                            );
                        }
                    }

                } catch (emailError) {

                    console.error(
                        "❌ Email sending failed:"
                    );

                    console.error(
                        emailError.message
                    );
                }
            }


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(201).json({

                message:
                    req.user.firstName +
                    " is " +
                    status +
                    " in " +
                    toUser.firstName,

                data: data,
            });


        } catch (err) {

            console.error(
                "❌ Send request error:",
                err
            );

            return res.status(500).json({

                message:
                    "Something went wrong",

                error:
                    err.message,
            });
        }
    }
);


// ======================================================
// GET RECEIVED REQUESTS
// GET /user/requests/received
// ======================================================

requestRouter.get(
    "/user/requests/received",
    userAuth,
    async (req, res) => {

        try {

            const loggedInUserId =
                req.user._id;


            const requests =
                await ConnectionRequest.find({

                    toUserId: loggedInUserId,
                    status: "interested",

                })
                .populate(
                    "fromUserId",
                    "firstName lastName email photoUrl age gender about skills"
                )
                .sort({
                    createdAt: -1,
                });


            return res.status(200).json({

                message:
                    "Received requests fetched successfully",

                data: requests,
            });


        } catch (err) {

            console.error(
                "❌ Received requests error:",
                err
            );

            return res.status(500).json({

                message:
                    "Something went wrong",

                error:
                    err.message,
            });
        }
    }
);


// ======================================================
// GET SENT REQUESTS
// GET /user/requests/sent
// ======================================================

requestRouter.get(
    "/user/requests/sent",
    userAuth,
    async (req, res) => {

        try {

            const loggedInUserId =
                req.user._id;


            const requests =
                await ConnectionRequest.find({

                    fromUserId: loggedInUserId,

                })
                .populate(
                    "toUserId",
                    "firstName lastName email photoUrl age gender about skills"
                )
                .sort({
                    createdAt: -1,
                });


            return res.status(200).json({

                message:
                    "Sent requests fetched successfully",

                data: requests,
            });


        } catch (err) {

            console.error(
                "❌ Sent requests error:",
                err
            );

            return res.status(500).json({

                message:
                    "Something went wrong",

                error:
                    err.message,
            });
        }
    }
);


// ======================================================
// REVIEW CONNECTION REQUEST
// POST /request/review/:status/:requestId
// ======================================================

requestRouter.post(
    "/request/review/:status/:requestId",
    userAuth,
    async (req, res) => {

        try {

            const loggedInUserId =
                req.user._id;

            const status =
                req.params.status;

            const requestId =
                req.params.requestId;


            // ==================================================
            // CHECK STATUS
            // ==================================================

            const allowedStatus = [
                "accepted",
                "rejected",
            ];

            if (!allowedStatus.includes(status)) {

                return res.status(400).json({

                    message:
                        "Invalid status type: " + status,

                });
            }


            // ==================================================
            // FIND REQUEST
            // ==================================================

            const connectionRequest =
                await ConnectionRequest.findOne({

                    _id: requestId,

                    toUserId: loggedInUserId,

                    status: "interested",

                });


            if (!connectionRequest) {

                return res.status(404).json({

                    message:
                        "Connection request not found!",

                });
            }


            // ==================================================
            // UPDATE REQUEST
            // ==================================================

            connectionRequest.status =
                status;


            const data =
                await connectionRequest.save();


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(200).json({

                message:
                    `Connection request ${status} successfully`,

                data: data,

            });


        } catch (err) {

            console.error(
                "❌ Review request error:",
                err
            );

            return res.status(500).json({

                message:
                    "Something went wrong",

                error:
                    err.message,

            });
        }
    }
);



module.exports = requestRouter;