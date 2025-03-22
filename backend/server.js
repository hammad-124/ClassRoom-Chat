import express from "express";
import {createServer} from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}))
app.set("port",(process.env.PORT || 8000));


app.use("/api/v1/users",userRoutes);

const start =async()=>{
    const connectiondb = await mongoose.connect("mongodb://localhost:27017/classRoomChat");
    console.log(`connected to database ${connectiondb.connection.host}`);
    server.listen(app.get("port"),(req,res)=>{
        console.log(`listing to ${8000}`);
    })
}
start();