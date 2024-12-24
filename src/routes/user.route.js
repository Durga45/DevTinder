import express from "express";
import User from "../models/user.model.js"; 
import bcrypt from "bcrypt"; 

const userRouter = express.Router();

userRouter.post("/user/signup", async (req, res) => {
  const { firstName, lastName, email, password, age, gender } = req.body;

  try {
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
      age,
      gender,
    });

    await newUser.save();

    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default userRouter;
