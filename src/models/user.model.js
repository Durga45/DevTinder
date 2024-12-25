import mongoose from "mongoose";
const { Schema } = mongoose;

// Define allowed gender values for better readability
const GENDER_VALUES = ["male", "female", "other"];

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 3,
    trim: true  // Automatically removes leading/trailing spaces
  },
  lastName: {
    type: String,
    trim: true  // Automatically removes leading/trailing spaces
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,  // Ensures no duplicate emails
    match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please fill a valid email address']  // Email format validation
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 18
  },
  gender: {
    type: String,
    required: true,
    validate(value) {
      if (!GENDER_VALUES.includes(value)) {
        throw new Error("Not a valid gender");
      }
    }
  },
  photoUrl: {
    type: String,
    default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpCKq1XnPYYDaUIlwlsvmLPZ-9-rdK28RToA&s"
  },
  about: {
    type: String,
    default: "This is a default about user",
    trim: true  // Automatically removes leading/trailing spaces
  },
  skills: {
    type: [String],
    default: []  // Ensures that it’s an empty array if no skills are provided
  }
},
{
  timestamps:true
}
);

const User = mongoose.model('User', userSchema);

export default User;
