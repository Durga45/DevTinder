import express from "express"
import User from "../models/user.model.js";
import middlewareAuth from "../middleware/middleware.js";

const requestRouter=express.Router();


requestRouter.post('/request',middlewareAuth,async(req,res)=>{

})



export default requestRouter;