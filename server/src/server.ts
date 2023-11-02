import express, { Express, Request, Response } from "express";
const cors = require("cors");
const morgan = require("morgan");
const colors = require("colors");
const dotenv = require("dotenv");
import { Socket, Server } from "socket.io";
dotenv.config({path: '../src/.env'});

const app: Express = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const PORT = 8080 || process.env.PORT;

app.get("/", (req: Request, res: Response) => {
    console.log("Welcome to Location Sharing App");
    return res.status(200).send({
        message: "Welcome to Location Sharing App",
        success: true,
    });
});

const server = app.listen(PORT, () => {
    console.log(`App is listening ${PORT}`);
});

const io: Server = new Server(server, {
    cors: {
        origin: "*",
    },
});
// create a map to store all the rooms
const roomMap = new Map<string, string>();

// this will store all the records of the chat
type chatt = {
    userId:string,
    sendText:string
}
const chatMap = new Map<string, chatt[]>()

// let's create a interface for our websocket
interface socket extends Socket {
    roomId?: string;
}

io.on("connection", (socket: socket) => {
    // console.log(`Connected to room : ${socket.roomId}`);
    // let's create a events -> create, join, leave, update

    // ----> 1
    socket.on("createRoom", (data) => {
        console.log('create room : ', data);
        const roomId = Math.random().toString(36).substring(2, 7);
        socket.join(roomId);
        const total = io.sockets.adapter.rooms.get(roomId);
        console.log(roomId, data, Array.from(total || []))
        socket.emit("roomCreated", {
            roomId,
            position: data,
            totalUsers: Array.from(total || []),
        });
        roomMap.set(roomId, socket.id);
        socket.roomId = roomId;
    });



    // ----> 2
    socket.on("joinRoom", (data: { roomId: string }) => {
        console.log('join room : ',  data);
        // check if the given roomId exists or not
        const check = io.sockets.adapter.rooms.has(data.roomId);
        if (!check) {
            io.to(`${socket.id}`).emit("joinSuccess", {
                status: "failed",
            });
        } else {

            socket.join(data.roomId)
            socket.roomId = data.roomId

            // notify the room Owner
            const owner = roomMap.get(data.roomId)
            if(owner) {
                const temp = io.sockets.sockets.get(owner);
                if(temp) {
                    const total = io.sockets.adapter.rooms.get(data.roomId);
                    temp.emit('newUserJoined', {
                        userId: socket.id,
                        totalUsers: Array.from(total || [])
                    })
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
        console.log('disconnect : ', socket.id);
        const roomId = socket.roomId;
        if(!roomId) {return}
        console.log(roomMap.get(roomId));
        if(roomMap.get(roomId) !== socket.id) {
            // in case of other user
            socket.leave(roomId) // this will remove the user from room
            const owner = roomMap.get(roomId);
            if(owner) {
                const temp = io.sockets.sockets.get(owner);
                temp?.emit('userDisconnected', {
                    userId: socket.id,
                    totalUsers: Array.from(io.sockets.adapter.rooms.get(roomId) || [])
                })
            }
        }
        else {
            // disconnected user is creater of the room then end room for all
            const temp = io.sockets.adapter.rooms.get(roomId);
            if(temp) {
                for(const socketId of temp) {
                    io.to(`${socketId}`).emit('roomDestroyed', {
                        status: 'ok'
                    })
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


    // ------> 5 : real time message system
    socket.on('send message', (data: {sendText:string}) => {
        // emit the message to all the users
        const roomId = socket.roomId;
        // console.log(roomId, socket.id, data.sendText)
        if(roomId!==undefined) {
            if(chatMap.has(roomId)) {
                chatMap.get(roomId)?.push({userId:socket.id, sendText:data.sendText})
            }
            else {
                chatMap.set(roomId, [{userId:socket.id, sendText:data.sendText}]);
            }
            console.log(chatMap.get(roomId))
            io.emit('receive message', {
                chats: chatMap.get(roomId)
            })
        }
    })
});
