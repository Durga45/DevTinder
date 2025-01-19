import express from "express"
import middlewareAuth from "../middleware/middleware.js";
import User from "../models/user.model.js";

const profileRouter=express.Router()


//profile
profileRouter.get("/profile",middlewareAuth,async(req,res)=>{
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

profileRouter.patch("/profile/update/:id", middlewareAuth, async (req, res) => {
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



export default profileRouter;