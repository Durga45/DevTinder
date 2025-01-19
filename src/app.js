import express from "express";
import dotenv from "dotenv";
import ConnectDB from "./config/Database.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import profileRouter from "./routes/profile.route.js";
import requestRouter from "./routes/request.router.js";

dotenv.config();


const app = express();


app.use(express.json());


app.use('/api/v1', authRouter);
app.use('/api/v1/',profileRouter)
app.use('/api/v1',requestRouter)


const startServer = async () => {
  try {
    await ConnectDB();
    app.listen(process.env.PORT || 3000, () => {
      console.log(`App is running on port ${process.env.PORT || 3000}`);
    });
  } catch (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1); // Exit the process if DB connection fails
  }
};


startServer();
