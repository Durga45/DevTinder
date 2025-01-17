import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken"
import middlewareAuth from "../middleware/middleware.js";

const userRouter = express.Router();

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

userRouter.post("/user/signup", async (req, res) => {
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
userRouter.post('/user/login', async (req, res) => {
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

//profile
userRouter.get("/user/profile",middlewareAuth,async(req,res)=>{
    const userid=req.userid
    try {
      const user = await User.findById(userid).select('-password');; 
      
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({ message: 'User profile', user });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
  }
})

userRouter.patch("/user/update/:id", middlewareAuth, async (req, res) => {
  const userid = req.userid;
  const userId = req.params.id;
  const fieldsToUpdate = req.body;  

  if (userid !== userId) {
    return res.status(403).json({ message: "You can only update your own profile" });
  }

  const validFields = ["skills", "password", "about", "photoUrl"];

  const filteredFields = Object.keys(fieldsToUpdate)
    .filter(field => validFields.includes(field))
    .reduce((obj, key) => {
      obj[key] = fieldsToUpdate[key];
      return obj;
    }, {});

  if (Object.keys(filteredFields).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  if (filteredFields.password) {
    try {
      const hashedPassword = await bcrypt.hash(filteredFields.password, 10);
      filteredFields.password = hashedPassword;
    } catch (error) {
      return res.status(500).json({ message: "Error hashing password" });
    }
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    Object.keys(filteredFields).forEach((key) => {
      user[key] = filteredFields[key];  
    });

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});



export default userRouter;
