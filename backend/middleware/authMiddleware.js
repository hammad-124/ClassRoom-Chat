import { User } from "../models/user.model";
import asyncWrapper from "../utils/asyncWrapper";
import ErrorHandler from "../utils/errorHandler";


export const authenticateUser = asyncWrapper(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer token"

    if (!token) {
        return next(new ErrorHandler("Unauthorized: No token provided", 401));
    }

    const user = await User.findOne({ token }).select("-password"); // Find user by token, exclude password

    if (!user) {
        return next(new ErrorHandler("Invalid or expired token", 401));
    }

    req.user = user;
    next();
});
