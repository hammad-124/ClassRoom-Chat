import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username :{
        type:String,
        required:true,
        unique:true,
    },
    password :{
        type:String,
        required:true,
    },
    token:{
        type:String,
    }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) { return next(); }
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        return next(error);
    }
});
const User = mongoose.model("User",userSchema);
export {User};