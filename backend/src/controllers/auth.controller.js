import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields are required !" });
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      //generate user token
      generateToken(newUser._id, res);
      await newUser.save(); //so that we just save the user to our database

      res.status(201).json({
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilepic: newUser.profilePic,
      });
    } else {
      res.status(400).json({
        message: "Invalid user data",
      });
    }
  } catch (e) {
    console.log("error in signup controller", e.message);
    res.status(500).json({ message: "Internal Server Error" }); //toast.error(error.response.data.message) grab it like this in frontend
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid Credentials|user not found sign up first" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password); //this will return a boolean type
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (e) {
    console.log("error in login controller", e.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const logout = (req, res) => {
  //logout means we need to clear the cookies so  put the cookie name and empty string
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (e) {
    console.log("Error in login controller", e.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id; //because in protection route we have passed req.user=user

    if (!profilePic) {
      return res.status(400).json({ message: "profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ); // new:true will return the newly updated db doc than returning old one

    res.status(200).json(updatedUser);
  } catch (e) {
    console.log("error in update profile:", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  //this need not to be async
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" }); //extra code added +
    }
    res.status(200).json(req.user); //sending the user back to the client
  } catch (e) {
    console.log("error in checkAuth controller ", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
