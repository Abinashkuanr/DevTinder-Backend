const mongoose = require("mongoose");

const ConnectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: {
        values: [
          "ignored",
          "interested",
          "accepted",
          "rejected",
        ],
        message: "{VALUE} is incorrect status type",
      },
    },
  },
  {
    timestamps: true,
  }
);

ConnectionRequestSchema.index({
  fromUserId: 1,
  toUserId: 1,
});

ConnectionRequestSchema.pre("save", function () {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error(
      "Cannot send connection request to yourself!"
    );
  }
});

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequest",
  ConnectionRequestSchema
);

module.exports = ConnectionRequestModel;