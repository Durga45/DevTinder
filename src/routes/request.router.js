import express from "express";
import connectionRequestModel from "../models/connection.model.js";
import middlewareAuth from "../middleware/middleware.js";
import { Types } from 'mongoose';
import User from "../models/user.model.js";

const requestRouter = express.Router();

const validateStatus = (status) => {
  const validStatuses = ["interested", "ignored"];
  return validStatuses.includes(status);
};

requestRouter.post('/request/send/:status/:toUserId', middlewareAuth, async (req, res) => {
  try {
    const fromUserId = req.userid;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    if (!validateStatus(status)) {
      return res.status(400).send({ errorMessage: "Invalid status type. Must be 'interested' or 'ignored'." });
    }

    if (!toUserId || !Types.ObjectId.isValid(toUserId)) {
      return res.status(400).send({ errorMessage: "Invalid or missing 'toUserId'. It must be a valid userId." });
    }

    if (fromUserId.toString() === toUserId.toString()) {
      return res.status(400).send({ errorMessage: "A user cannot send a connection request to themselves." });
    }

    const userExists = await User.findById(toUserId);
    if (!userExists) {
      return res.status(400).send({ errorMessage: "User with the given 'toUserId' does not exist." });
    }

    const existingRequest = await connectionRequestModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    });

    if (existingRequest) {
      return res.status(400).send({ errorMessage: "Connection request already exists between these users." });
    }

    // Fetch user details for success message
    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId),
      User.findById(toUserId),
    ]);

    const connectionRequest = new connectionRequestModel({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequest.save();

    // Customize success message based on the status
    let successMessage = '';
    if (status === 'interested') {
      successMessage = `${fromUser.firstName} is interested in ${toUser.firstName}`;
    } else if (status === 'ignored') {
      successMessage = `${fromUser.firstName} ignored ${toUser.firstName}`;
    }

    res.status(200).send({ message: successMessage, data });

  } catch (err) {
    console.error(err);
    res.status(500).send({ errorMessage: err.message });
  }
});


requestRouter.post("/request/review/:status/:requestId", middlewareAuth, async (req, res) => {
  try {
    const loggedInUser = req.userid;
    const { status, requestId } = req.params;
    const allowedStatus = ["accepted", "ignored"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).send({ message: "Invalid status. Must be 'accepted' or 'ignored'." });
    }

    
    const connectionRequest = await connectionRequestModel.findOne({
      _id: requestId,
      toUserId: loggedInUser,  
      status: "interested"
    });

    if (!connectionRequest) {
      console.log('No request found or request is not in "interested" status.');
      return res.status(404).send({ message: "No 'interested' request found or request does not exist." });
    }


    connectionRequest.status = status;

    const updatedRequest = await connectionRequest.save();


    res.status(200).send({ message: `Request has been ${status}`, data: updatedRequest });

  } catch (err) {
    console.error('Error processing the request:', err);
    res.status(500).send({ message: err.message });
  }
});


export default requestRouter;
