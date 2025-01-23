import mongoose from "mongoose";

const { Schema } = mongoose;

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:"User"
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:"User"
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for better query performance
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }); // Index for fast lookups between users
connectionRequestSchema.index({ status: 1 }); // Index for fast lookups based on status
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1, status: 1 }); // Compound index for common queries

const connectionRequestModel = mongoose.model("ConnectionRequest", connectionRequestSchema);

export default connectionRequestModel;
