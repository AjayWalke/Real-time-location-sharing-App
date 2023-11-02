import React from 'react'
import {useEffect, useState} from 'react'
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; 
import {LocationStatus, GeoPositionStatus, SocketStatus} from "../components/Types";
import Map from "../components/Map";
import StatusPanel from "../components/StatusPanel";
import Status from "../components/Status";
import { useSocket } from "../socket/socket";
import { useParams } from 'react-router-dom';
import {BsFillSendFill} from 'react-icons/bs'
type RoomStatus = 'joined' | 'not-exist' | 'error'
type chatt = {
  userId:string,
  sendText:string
}

const Location = () => {
  const {socket, connectSocket} = useSocket();
  const [socketStatus, setSocketStatus] = useState<SocketStatus|null>('disconnect')
  const [position, setPosition] = useState<GeoPositionStatus|null>(null)
  const {roomId} = useParams();
  const [roomStatus, setRoomStatus] = useState<RoomStatus|null>(null);
  const [sendText, setSendText] = useState<string>('');
  const [chatData, setChatData] = useState<chatt[]>([]);

  useEffect(() => {
    connectSocket();
    setSocketStatus('connecting')
    return () => {
      socket?.disconnect()
      setSocketStatus('disconnect')
    }
  }, []) // run only once

  useEffect(() => {
    socket?.on('connect', ()=>{
      setSocketStatus('connected')
      socket.emit('joinRoom', {roomId});
    })
    socket?.on('joinSuccess', ({status}:{status:string})=>{
      console.log(status);
      if(status==='Success') {
        setRoomStatus('joined')
      }
      else if(status==='failed') {
        setRoomStatus('not-exist')
      }
      else {
        setRoomStatus('error')
      }
    })
    socket?.on('Location Updated', ({position}:{position:GeoPositionStatus})=>{
      // console.log(position)
      setPosition(position)
    })
    socket?.on('roomDestroyed', ()=>{
      setRoomStatus('not-exist')
      socket.disconnect()
    })
    socket?.on('disconnect', ()=>{
      setSocketStatus('disconnect')
    })
    socket?.on('receive message', (data: {chats: chatt[]}) => {
      setChatData(data.chats);
      console.log(data.chats);
  })
  }, [socket])

  const handleMainPageReturn = () => {
    window.open('/', '_self');
  }
  
  const handleSendText = () => {
    // console.log(sendText);
    socket?.emit('send message', {sendText});
  }

  return (
    <div>
      <article className='m-4'>
        <button onClick={handleMainPageReturn} className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Return&nbsp;To&nbsp;Main&nbsp;Page
          </span>
        </button>
      </article>
      <article className='m-4'>
      {
       roomStatus === 'joined' && socketStatus === 'connected' && position && (
          <>
            <Status locationStatus={null} socketStatus={socketStatus}/>
            <div className="flex">
              <p className="font-bold">latitude: </p><span>{position?.lat}</span>&nbsp;|&nbsp;<p className="font-bold">longitude: </p><span>{position?.lng}</span>
            </div>
          </>
      )}
      </article>
      <section className='m-4 flex flex-col lg:flex-row w-full h-auto'>
        {/* these is for the real time chat */}
        <article>
          { socketStatus === 'connected' && roomStatus === 'joined' && (<>
          <div className='bg-gray-500 mt-20 h-96 overflow-y-auto'>
            {/* <p>This will show you the real time chats</p> */}
            <div className="flex flex-col mb-2">
            {
                chatData?.map((temp) => {
                  console.log(socket?.id, temp)
                    return (
                    <div className="flex flex-col justify-between">
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
            <button onClick={handleSendText} type="button" className="inline-flex text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg block mt-4 h-10 text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Send
              <span className="inline-flex items-center justify-center w-4 h-4 ml-2 pt-1"> <BsFillSendFill/>
              </span>            
            </button>
          </div>
          </>)}
        </article>
        {/* <section> */}
          {
            roomStatus === 'not-exist' && (
              <StatusPanel status='Room not exist'/>
            )
          }
          {
            (roomStatus === 'error' || socketStatus === 'error') && (
              <StatusPanel status='Error' />
              )
            }
          {
            socketStatus === 'connecting' && (
              <StatusPanel status='Connecting to the server.....' />
              )
            }
          {
            
          }
          {socketStatus === 'connected' && roomStatus === 'joined' && position && (
            <article className='flex flex-col ml-40 mr-10 bg-gray-200 rounded-md overflow-hidden w-full'>
                <h1 className='ml-[50%] text-xl font-bold'>View&nbsp;Map</h1>
                <Map location={position as GeoPositionStatus}/>
            </article>
          )}
        {/* </section> */}
      </section>
    </div>
  )
}

export default Location
