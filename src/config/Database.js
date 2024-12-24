import mongoose from "mongoose"
import dotenv from 'dotenv';


dotenv.config();

export default async function ConnectDB(){
   try{
    await mongoose.connect(process.env.MONGOURI || "mongodb://127.0.0.1:27017/devtinder")
    console.log("connected to Database")
   }catch(err){
    console.log(`${err}`)
    console.log(err.stack)
   }
}