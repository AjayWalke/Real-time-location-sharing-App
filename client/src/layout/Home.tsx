import React from "react";
import Intro from "../components/Intro";
import {
    LocationStatus,
    GeoPositionStatus,
    SocketStatus,
} from "../components/Types";
import { useState, useEffect } from "react";
import Map from "../components/Map";
import StatusPanel from "../components/StatusPanel";
import { useSocket } from "../socket/socket";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; 
import Status from "../components/Status";
import {MdOutlineCopyAll} from 'react-icons/md'
import {BsFillSendFill} from 'react-icons/bs'
import { send } from "process";

type RoomInfo = {
    roomId: string;
    position: GeoPositionStatus;
    totalUsers: string[];
};
type chatt = {
    userId:string,
    sendText:string
}

const Home = () => {
    const [sendText, setSendText] = useState<string>('')
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [roomLink, setRoomLink] = useState<string>("");
    const [position, setPosition] = useState<GeoPositionStatus | null>(null);
    const [LocationStatus, setLocationStatus] = useState<LocationStatus>("unknown");
    const [socketStatus, setSocketStatus] = useState<SocketStatus>("disconnect");
    const { socket, connectSocket } = useSocket();
    const [chatData, setChatData] = useState<chatt[]>([]);

    // handle cases

    // -----> 1 : handle the location , take access, set Geoposition
    useEffect(() => {
        let watchId: number | null = null;
        if ("geolocation" in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setPosition({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLocationStatus("accessed");
                },
                (error) => {
                    if (error.PERMISSION_DENIED) {
                        setLocationStatus("denied");
                    } else if (error.TIMEOUT) {
                        setLocationStatus("error");
                    } else if (error.POSITION_UNAVAILABLE) {
                        setLocationStatus("unknown");
                    } else {
                        setLocationStatus("error");
                    }
                }
            );
            // console.log(position, watchId);
            return () => {
                if (watchId) {
                    navigator.geolocation.clearWatch(watchId);
                }
            };
        }
    }, []);

    // -----> 2 : create the socket, create a room, create aleave
    useEffect(() => {
        // console.log("create-socket -> ", socket, roomInfo);
        if(socket) {
            socket.on('connect', () => {
                // console.log(1);
                setSocketStatus('connected')
                // console.log(position);
                socket.emit('createRoom', position)
                // console.log(position);
            })
            socket.on('roomCreated', (data:RoomInfo) => {
                toast.success('You are live', {autoClose:1000});
                setRoomInfo(data);
            })
            socket.on("newUserJoined", (data: {userId: string, totalUsers: string[]}) => {
                // console.log(3);
                // console.log(data);
                setRoomInfo((pre) => {
                    if(!pre) {return null}
                    return {
                        ...pre,
                        totalUsers:data.totalUsers
                    }
                })
                toast.info(`${data.userId} joined the room`, {autoClose:2000});
                position && socket.emit('updateLocation', {position});
            })
            socket.on('userDisconnected', (data: {userId:string, totalUsers:string[]}) => {
                // console.log(4);
                // console.log(data);
                setRoomInfo((pre) => {
                    if(!pre) {return null}
                    return {
                        ...pre,
                        totalUsers: data.totalUsers
                    }
                })
                toast.info(`${data.userId} left the room`, {autoClose:2000})

            })
            socket.on('disconnect', () => {
                // console.log(5);
                setSocketStatus('disconnect')
            })
            socket.on('receive message', (data: {chats: chatt[]}) => {
                setChatData(data.chats);
                console.log(data.chats);
            })
        }
        // console.log("this is roominto", roomInfo)
    }, [socket]); // why [socket] => whenever the values in the socket change effect will be triggered

    // -----> 3 : update the location
    useEffect(() => {
        socket?.emit('updateLocation', {position});
    }, [position]);

    // -----> 4 : stop sharing => disconnect the socket, destroy the room
    const handleStopSharing = () => {
        // console.log('socket', socket);
        socket?.disconnect()
        setSocketStatus('disconnect')
        setRoomInfo(null)
        toast.success('No longer live.....', {autoClose:2000});
    };

    const handleSocketConnection = () => {
        setSocketStatus("connecting");
        connectSocket();
    };

    const handleShareLocation = () => {
        if(LocationStatus==='accessed') {
            // console.log('check...1-sharelocation');
            handleSocketConnection();
        }
        else {
            toast.error('Location Access Required', {autoClose:2000});
        }
    } 

    const handleJoinRoom = () => {
        // console.log(roomLink)
        if(roomLink) {
            window.open(roomLink, '_self')
            // window.open(roomLink)
        }
        else {
            toast.error('Enter the valid Link', {autoClose:2000})
        }
    }

    const handleCopyLink = async () => {
        const url = `${window.location.href}location/${roomInfo?.roomId}`
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Copied to Clipboard', {autoClose:2000})
        }).catch(() => {
            toast.error('Failed to copy', {autoClose:2000});
        })
    }

    const handleSendtext = () => {
        // console.log(sendText);
        socket?.emit('send message', {sendText});
    }

    return (
        <div>
            <Intro />
            <section>
                {/* this will showing location coordinates */}
                <article className="m-4">
                  <Status locationStatus={LocationStatus} socketStatus={socketStatus}/>
                  {
                    position && 
                    <div className="flex">
                      <p className="font-bold">latitude: </p><span>{position.lat}</span>&nbsp;|&nbsp;
                      <p className="font-bold">longitude: </p><span>{position.lng}</span>
                    </div>
                  }
                </article>
            </section>
            <div className="flex flex-col lg:flex-row w-full h-auto">
            <section className="flex">
                {/* this will be showing the socket details */}
                <article className="ml-8 mr-8 pt-[250px] pl-10 pr-10 bg-gray-600 rounded-md h-full">
                { // if connected then show the {sharing link, stop sharing, total users etc.} 
                    socketStatus === 'connected' && (
                    <div>
                        <p className="flex mb-10"><span className="font-bold">Room Id : </span>&nbsp;{roomInfo?.roomId}</p>
                            <div className="flex mb-10">
                                <p className="pl-2 bg-gray-300 block w-80">{window.location.href}location/{roomInfo?.roomId}</p>
                                    <span className="pt-1 bg-gray-400" onClick={handleCopyLink}><MdOutlineCopyAll/></span>
                            </div>
                        <p className="pl-2 mb-10 bg-gray-300 block w-80 rounded-md font-bold"><span>Total Users Connected : {roomInfo?.totalUsers.length!==undefined?roomInfo?.totalUsers.length-1:0}</span></p>
                    </div>
                    )
                }
                {
                    socketStatus === 'connected' && (
                        <div>
                            <button className="ml-20 text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" onClick={handleStopSharing}>Stop&nbsp;Sharing</button>
                        </div>
                    )
                }
                { // if disconnected the show the {connect, connect through the connect}
                    socketStatus === 'disconnect' && (
                        LocationStatus === 'accessed' && (
                            <div>
                                <button className="ml-40 mb-20 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" onClick={handleShareLocation}>
                                    Share&nbsp;Location
                                </button>
                                <span>
                                    <input type="text" placeholder='room link' value={roomLink} onChange={(e) => setRoomLink(e.target.value)} className="ml-6 mr-8 mt-4 mb-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-96 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                    <button className="ml-40 mt-4 mr-8 mb-3 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" onClick={handleJoinRoom}>Join&nbsp;Room</button>
                                </span>
                            </div>
                        )
                    )
                }
                { // show the status -> show the toast -> then connect the
                    socketStatus === 'connecting' && (
                        <StatusPanel status='connecting to the server....'/>
                    )
                }
                </article>
                {
                    socketStatus === 'connected' && (
                        <article className='rounded-lg'>
                            <div className='bg-gray-500 overflow-y-auto overflow-hidden h-96'>
                                {/* <p>This will show you the real time chats</p> */}
                                <div className="flex flex-col mb-2">
                                {
                                    chatData?.map((temp) => {
                                        return (
                                        <div className="flex justify-between">
                                            {
                                                socket?.id === temp.userId && (
                                                    <p className="flex flex-col mt-2 mr-2 ml-auto bg-blue-200 text-white-700 rounded-bl-lg rounded-tl-lg rounded-br-lg py-2 px-4 w-auto">
                                                    <span className="ml-auto text-[50%]">
                                                    {temp.userId}</span>{temp.sendText}</p>
                                                )
                                            }
                                            {
                                                socket?.id !== temp.userId && (
                                                    <p className="flex flex-col mt-2 mr-auto ml-2 bg-gray-200 text-gray-700 rounded-bl-lg rounded-tr-lg rounded-br-lg py-2 px-4 w-auto">
                                                    <span className="mr-auto text-[50%]">
                                                    {temp.userId}</span>{temp.sendText}</p>
                                                )
                                            }
                                        </div>
                                    )})
                                }
                                </div>
                            </div>
                            <div className='flex bg-gray-800'>
                                <input type="text" placeholder='Type message .......' value={sendText} onChange={(e) => setSendText(e.target.value)} className="ml-6 mr-8 mt-4 mb-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-96 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                <button onClick={handleSendtext} type="button" className="inline-flex text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg block mt-4 h-10 text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Send
                                <span className="inline-flex items-center justify-center w-4 h-4 ml-2 pt-1"> <BsFillSendFill/>
                                </span>            
                                </button>
                            </div>
                        </article>
                    )
                }
            </section>
            {/* <section> */}
                {/* this will be showing map of current location */}
            {position && (
                <article className='flex flex-col ml-10 mr-10 bg-gray-200 rounded-md overflow-hidden w-full'>
                    <h1 className="ml-[50%] text-xl font-bold">View&nbsp;Map</h1>
                    <Map location={position}/>
                </article>
            )}
            {/* </section> */}
            </div>
        </div>
    );
};

export default Home;

// whenever user open the website access the location latitude and lagitutde
// then take care of room id
// then go to room
