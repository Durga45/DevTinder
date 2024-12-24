import express from "express";
import dotenv from "dotenv";
import ConnectDB from "./config/Database.js";
import userRouter from "./routes/user.route.js";

dotenv.config();


const app = express();


app.use(express.json());


app.use('/api/v1', userRouter);


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
