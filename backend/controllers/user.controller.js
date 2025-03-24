import { User } from "../models/user.model.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/errorHandler.js";
import httpStatus from "http-status";
import { randomBytes } from "crypto";



export const registerUser = asyncWrapper(async (req, res,next) => {
    const { name, username, password } = req.body;
    if(!name || !username || !password){
        return next(new ErrorHandler('Please fill in all fields', 400))
    }
    const existingUser = await User.findOne({username});
    if(existingUser){
        return next(new ErrorHandler('Username already in use',httpStatus.FOUND))
    }
    const user = await User.create({name, username, password});
    await user.save();
    res.status(httpStatus.CREATED).json({success: true, message:"User regiser successfully!"});
});

export const loginUser = asyncWrapper(async(req,res,next)=>{
    const {username,password}=req.body;
    if(!username || !password){
        return next(new ErrorHandler('Please fill in all fields', 400))
    }
    const user = await User.findOne({username});
    if(!user){
        return next(new ErrorHandler(`User not found with username : ${username}`,httpStatus.NOT_FOUND))
    }
    const isMatch = await user.comparePassword(password);
    if(!isMatch){
        return next(new ErrorHandler('Invalid username or password',httpStatus.NOT_FOUND))
    }
    let token = randomBytes(20).toString("hex");
    user.token = token;
    await user.save();
    res.status(httpStatus.OK).json({success: true, token:token ,message:"Logged in successfully...!"});
});