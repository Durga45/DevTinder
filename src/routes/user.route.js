import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { z } from "zod";

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
  age: z.number().int().positive().min(18),
  gender: z.enum(["male", "female", "other"]),
});

userRouter.post("/user/signup", async (req, res) => {
  const { firstName, lastName, email, password, age, gender, photoUrl, about, skills } = req.body;

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
      age,
      gender,
      photoUrl,
      about,
      skills
    });

    await newUser.save();

    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default userRouter;
