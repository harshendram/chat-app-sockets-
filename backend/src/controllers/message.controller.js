import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password"); //we don't want to send password back to the client

    res.status(200).json(filteredUsers);
  } catch (e) {
    console.error("error in getUsersForSidebar ", e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id; //myId or senderId

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (e) {
    console.log("error in gettingMessage controller ", e.message);
    res.status(500).json({ message: "Internal server error " });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    //realtime functionality using socket.io

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      //checks if the user is onlineeee
      io.to(receiverSocketId).emit("newMessage", newMessage); //only to that particular user send it
    }

    res.status(201).json(newMessage);
  } catch (e) {
    console.log("error in sendMessage Controller", e.message);
    res.status(500).json({ message: "Internal server error " });
  }
};
