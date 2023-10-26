"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors = require("cors");
const morgan = require("morgan");
const colors = require("colors");
const dotenv = require("dotenv");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
app.use(cors());
app.use(morgan("dev"));
app.use(express_1.default.json());
const PORT = 8080 || process.env.PORT;
app.get("/", (req, res) => {
    console.log("Welcome to Location Sharing App");
    return res.status(200).send({
        message: "Welcome to Location Sharing App",
        success: true,
    });
});
const server = app.listen(PORT, () => {
    console.log(`App is listening ${PORT}`);
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
// create a map to store all the rooms
const roomMap = new Map();
io.on("onConnection", (socket) => {
    console.log(`Connected to room : ${socket.roomId}`);
    // let's create a events -> create, join, leave, update
    // ----> 1
    socket.on("createRoom", (data) => {
        const roomId = Math.random().toString(36).substring(1, 7);
        socket.join(roomId);
        const total = io.sockets.adapter.rooms.get(roomId);
        socket.emit("roomCreated", {
            roomId,
            position: data.position,
            totalUsers: Array.from(total || []),
        });
        roomMap.set(roomId, socket.id);
        socket.roomId = roomId;
    });
    // ----> 2
    socket.on("joinRoom", (data) => {
        // check if the given roomId exists or not
        const check = io.sockets.adapter.rooms.has(data.roomId);
        if (!check) {
            io.to(`${socket.id}`).emit("joinFailed", {
                status: "Failed No Room Exists",
            });
        }
        else {
            socket.join(data.roomId);
            socket.roomId = data.roomId;
            // notify the room Owner
            const owner = roomMap.get(data.roomId);
            if (owner) {
                const temp = io.sockets.sockets.get(owner);
                if (temp) {
                    const total = io.sockets.adapter.rooms.get(data.roomId);
                    temp.emit('newUserJoined', {
                        userId: socket.id,
                        totalUsers: Array.from(total || [])
                    });
                }
            }
            // alert of joining the room
            io.to(`${socket.id}`).emit("joinSuccess", {
                status: "Success",
            });
        }
    });
    // -----> 3
    socket.on("disconnect", () => {
        const roomId = socket.id;
        if (!roomId) {
            return;
        }
        if (roomMap.get(roomId) !== socket.id) {
            // in case of other user
            socket.leave(roomId); // this will remove the user from room
            const owner = roomMap.get(roomId);
            if (owner) {
                const temp = io.sockets.sockets.get(owner);
                temp === null || temp === void 0 ? void 0 : temp.emit('userDisconnected', {
                    userId: roomId,
                    totalUsers: Array.from(io.sockets.adapter.rooms.get(roomId) || [])
                });
            }
        }
        else {
            // disconnected user is creater of the room then end room for all
            const temp = io.sockets.adapter.rooms.get(roomId);
            if (temp) {
                for (const socketId of temp) {
                    io.to(`${socketId}`).emit('roomDestroyed', {
                        status: 'ok'
                    });
                }
            }
            io.sockets.adapter.rooms.delete(roomId);
            roomMap.delete(roomId);
        }
    });
    // -----> 4
    socket.on("updateLocation", (data) => {
        io.emit('Location Updated', data);
    });
});
