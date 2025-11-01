import cloudinary from "../config/cloudinary.js";
import { generateToken } from "../config/utils.js"
import User from "../models/User.js"
import bcrypt from 'bcrypt'


//signup new user
export const signup = async (req, res) => {
    const {email, fullName, password, bio} = req.body

    try {
        if(!email || !fullName || !password || !bio){
            return res.json({success: false, message: "Please fill all the fields"})
        }
        const user= await User.findOne({email})
        if(user){
            return res.json({success: false, message: "User already exists"})
        }
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const newUser = new User({email, fullName, password: hash, bio})
        await newUser.save()

        const token=generateToken(newUser._id)

        res.json({success: true, userData: newUser, token, message:"Account created successfully"})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//login existing user
export const login = async (req,res)=>{
    try {
         const {email, password} = req.body
         const userData = await User.findOne({email})

         if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

         const isPasswordCorrect = await bcrypt.compare(password, userData.password)

         if(!isPasswordCorrect){
          return res.json({success: false, message: 'Invalid Credentials'})
         }
         const token = generateToken(userData._id)

         res.json({success: true, userData, token , message: 'Login successful'})
    } catch (error) {
         console.log(error.message)
         res.json({success: false, message: error.message})
    }
}

// to check if user is authenticated
export const checkAuth = (req,res)=>{
    res.json({success: true, user: req.user})
}

// to update profile details
export const updateProfile= async (req, res)=>{
try {
    const {profilePic, bio, fullName}= req.body

    const userId= req.user._id
    let updatedUser;

    if(!profilePic){
        await User.findByIdAndUpdate(userId, {bio, fullName}, {new:true});
    } else {
        const upload = await cloudinary.uploader.upload(profilePic);

        updatedUser= await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true})
    }
    res.json({success: true, user: updatedUser})
} catch (error) {
    console.log(error.message)
    res.json({success: false, message: error.message})
}
}