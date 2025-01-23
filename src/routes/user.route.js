import express from "express";
import User from "../models/user.model.js";
import connectionRequestModel from "../models/connection.model.js";
import middlewareAuth from "../middleware/middleware.js";

const userRouter = express.Router();


userRouter.get("/user/requests/received",middlewareAuth,async(req,res)=>{
 try{
  const logedinuser=req.userid
  const connectionRequest=await connectionRequestModel.find({
    toUserId:logedinuser,
    status:"interested"
  }).populate("fromUserId",["firstName","lastName","photoUrl"])

  res.send(200).send({message:"all the request fetched succesfuly",data:connectionRequest})

 }catch(err){
  res.send(400).send({message:err.message})
 }

})

userRouter.get("/user/connections", middlewareAuth, async (req, res) => {
  try {
    const loggedinuser = req.userid;  // Durga's user ID
    
    // Query for connection requests where the logged-in user (Durga) is either the sender or receiver with accepted status
    const connectionRequests = await connectionRequestModel.find({
      $or: [
        { fromUserId: loggedinuser, status: "accepted" },  // Durga sent the request and it's accepted
        { toUserId: loggedinuser, status: "accepted" }     // Durga received the request and it's accepted
      ]
    })
    .populate("fromUserId", "firstName lastName photoUrl")  // Populate 'fromUserId' fields
    .populate("toUserId", "firstName lastName photoUrl");   // Populate 'toUserId' fields

    if (!connectionRequests || connectionRequests.length === 0) {
      return res.status(404).send({ message: "No connections found." });
    }

    // Prepare connection data to include both fromUser and toUser details
    const connections = connectionRequests.map((request) => {
      const user = request.fromUserId._id.toString() === loggedinuser.toString() ? request.toUserId : request.fromUserId;
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
      };
    });

    // Send the response with connection details
    res.status(200).send({ message: "Connections fetched successfully", data: connections });
  } catch (err) {
    console.error("Error fetching connections:", err);
    res.status(400).send({ message: err.message });
  }
});

userRouter.get("/feed", middlewareAuth, async (req, res) => {
  try {
    const loggedInUser = req.userid;
    
    // Get the page and limit from query parameters (default to page 1 and 10 results per page if not provided)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const connectionRequest = await connectionRequestModel.find({
      $or: [
        { fromUserId: loggedInUser },
        { toUserId: loggedInUser }
      ]
    }).select("fromUserId toUserId");

    const hideUserFromFeed = new Set();
    connectionRequest.forEach(req => {
      hideUserFromFeed.add(req.fromUserId.toString());
      hideUserFromFeed.add(req.toUserId.toString());
    });

    // Use pagination with skip and limit
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser } }
      ]
    })
    .select("firstName lastName photoUrl age gender about skills")
    .skip((page - 1) * limit)  // Skip the records for the current page
    .limit(limit);  // Limit the number of records to the specified page size

    res.status(200).send(users);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

export default userRouter;
