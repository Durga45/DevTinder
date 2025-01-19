import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken"
import middlewareAuth from "../middleware/middleware.js";

const authRouter = express.Router();

const userSchema = z.object({
  firstName: z.string().min(3),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

const loginSchema=z.object({
  email: z.string().email(),
  password: z.string().min(8)
})
let blacklistedTokens = [];

//signup
authRouter.post("/user/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const parsedData = userSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({ message: parsedData.error.errors });
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//login
authRouter.post('/user/login', async (req, res) => {
  const { email, password } = req.body;
  try {
      const parsedData = loginSchema.safeParse(req.body);
      if (!parsedData.success) {
          return res.status(400).json({ message: parsedData.error.errors });
      }

      const userExist = await User.findOne({ email });

      if (!userExist) {
          return res.status(400).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, userExist.password);

      if (isValidPassword) {
        const token=jwt.sign({userid:userExist._id},process.env.JWTKEY,{expiresIn:"1h"})
        return  res.status(200).send({ message: "Login successful",token:token });
      } else {
          return res.status(400).json({ message: "Invalid credentials" });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post('/user/logout', middlewareAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    blacklistedTokens.push(token);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



export default authRouter;