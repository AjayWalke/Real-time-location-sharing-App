import React, { useState, useContext, createContext, JSX } from "react";
import { Socket_URL } from "../services/soketURL";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
    socket: Socket | null;
    connectSocket: () => void;
};

type SocketProviderProps = {
    children: JSX.Element;
};

export const SocketContext = createContext<SocketContextType | null>(null);

const SocketProvider = ({ children }: SocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const connectSocket = () => {
        if(socket) {
            socket.connect();
        }
        else {
            const newSocket: Socket = io(Socket_URL);
            setSocket(newSocket);
        }
    };
    return <SocketContext.Provider value={{socket, connectSocket}}>{children}</SocketContext.Provider>;
};

const useSocket = () => {
  const context = useContext(SocketContext);
//   console.log(context)
  if(!context) {
    throw new Error('Error.....')
  }
  return context
};

export { SocketProvider, useSocket };
