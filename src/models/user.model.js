import mongoose from "mongoose";
const {Schema}=mongoose

const userSchema=new Schema({
      firstName:{
        type:String,
        required:true,
      },
      lastName:{
        type:String,
        required:true,
      },
      email:{
        type:String,
        required:true,
      },
      password:{
        type:String,
        required:true,
      },
      age:{
        type:Number,
        required:true,
      },
      gender:{
        type:String,
        required:true,
      }
})

const User = mongoose.model('User', userSchema);
export default User;