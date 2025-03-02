import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // here we are calling it as jwt as we sent it with name jwt
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided " });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY); //here the jwt token will contain userId as we sent this only
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid token provided" });
    }

    const user = await User.findById(decoded.userId).select("-password"); //we don't want to send password to the client backagain  for security reasons
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    } //this is just to make more robust //very rare use

    req.user = user;
    next();
  } catch (e) {
    console.log("Error in Protection Route", e.message);
    return res.status(500).json({
      message: "Internal server error ",
    });
  }
};
