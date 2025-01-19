import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken"
import middlewareAuth from "../middleware/middleware.js";

const userRouter = express.Router();







export default userRouter;
