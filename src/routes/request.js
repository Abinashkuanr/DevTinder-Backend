const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../Models/connectionRequest");
const User = require("../Models/user");


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

      // Allowed statuses
      const allowedStatus = ["ignored", "interested"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type: " + status,
        });
      }

      // Cannot send request to yourself
      if (fromUserId.toString() === toUserId.toString()) {
        return res.status(400).json({
          message: "Cannot send connection request to yourself!",
        });
      }

      // Check if receiver exists
      const toUser = await User.findById(toUserId);

      if (!toUser) {
        return res.status(404).json({
          message: "User not found!",
        });
      }

      // Check existing request in either direction
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
          message: "Connection Request Exists!!",
        });
      }

      // Create request
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      return res.status(201).json({
        message:
          req.user.firstName +
          " is " +
          status +
          " in " +
          toUser.firstName,

        data,
      });
    } catch (err) {
      console.error("Send request error:", err);

      return res.status(500).json({
        message: "Something went wrong",
        error: err.message,
      });
    }
  }
);


// ======================================================
// GET RECEIVED CONNECTION REQUESTS
// GET /user/requests/received
// ======================================================

requestRouter.get(
  "/user/requests/received",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUserId = req.user._id;

      const requests = await ConnectionRequest.find({
        toUserId: loggedInUserId,
        status: "interested",
      })
        .populate(
          "fromUserId",
          "firstName lastName photoUrl age gender about skills"
        )
        .sort({ createdAt: -1 });

      return res.status(200).json({
        message: "Received requests fetched successfully",
        data: requests,
      });
    } catch (err) {
      console.error("Received requests error:", err);

      return res.status(500).json({
        message: "Something went wrong",
        error: err.message,
      });
    }
  }
);


// ======================================================
// GET SENT CONNECTION REQUESTS
// GET /user/requests/sent
// ======================================================

requestRouter.get(
  "/user/requests/sent",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUserId = req.user._id;

      const requests = await ConnectionRequest.find({
        fromUserId: loggedInUserId,
      })
        .populate(
          "toUserId",
          "firstName lastName photoUrl age gender about skills"
        )
        .sort({ createdAt: -1 });

      return res.status(200).json({
        message: "Sent requests fetched successfully",
        data: requests,
      });
    } catch (err) {
      console.error("Sent requests error:", err);

      return res.status(500).json({
        message: "Something went wrong",
        error: err.message,
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
      const loggedInUserId = req.user._id;

      const status = req.params.status;
      const requestId = req.params.requestId;

      // Only accepted or rejected
      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type: " + status,
        });
      }

      // Find request
      const connectionRequest =
        await ConnectionRequest.findOne({
          _id: requestId,
          toUserId: loggedInUserId,
          status: "interested",
        });

      if (!connectionRequest) {
        return res.status(404).json({
          message: "Connection request not found!",
        });
      }

      // Update status
      connectionRequest.status = status;

      const data = await connectionRequest.save();

      return res.status(200).json({
        message: `Connection request ${status} successfully`,
        data,
      });
    } catch (err) {
      console.error("Review request error:", err);

      return res.status(500).json({
        message: "Something went wrong",
        error: err.message,
      });
    }
  }
);


module.exports = requestRouter;