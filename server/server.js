import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import http from 'http'
import connectDB from './config/db.js'
import userRouter from './Routes/userRoutes.js'
import messageRouter from './Routes/messageRoutes.js'
import { Server } from 'socket.io'

const app = express();
const server = http.createServer(app);
const port=process.env.PORT || 8080;

//initialize socket.io
export const io = new Server(server, {
    cors: {origin: "*"}
})

//store online users
export const userSocketMap = {} //{userId: socket}

// socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId
    console.log("user connected", userId)
    if(userId) userSocketMap[userId] = socket.id

    //emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", ()=>{
        console.log("user disconnected", userId)
        delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
    
})

//Middlewares
app.use(express.json({limit: "4mb"}));
app.use(cors());
dotenv.config();
await connectDB();

//Routes
app.use('/api/status', (req,res)=>{
    res.send("Server is live")
})
app.use('/api/auth', userRouter)
app.use('/api/messages', messageRouter)



server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})