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
import { error } from "console";
import Status from "../components/Status";

type RoomInfo = {
    roomId: string;
    position: GeoPositionStatus;
    totalUsers: string[];
};

const Home = () => {
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [roomLink, setRoomLink] = useState<string>("");
    const [position, setPosition] = useState<GeoPositionStatus | null>(null);
    const [LocationStatus, setLocationStatus] = useState<LocationStatus>("unknown");
    const [socketStatus, setSocketStatus] = useState<SocketStatus>("disconnect");
    const { socket, connectSocket } = useSocket();

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
            console.log(position, watchId);
            return () => {
                if (watchId) {
                    navigator.geolocation.clearWatch(watchId);
                }
            };
        }
    }, []);

    // -----> 2 : create the socket, create a room, create aleave
    useEffect(() => {}, []);

    // -----> 3 : update the location
    useEffect(() => {}, []);

    // -----> 4 : stop sharing => disconnect the socket, destroy the room
    const handleStopSharing = () => {};

    const handleSocketConnection = () => {
        connectSocket();
        setSocketStatus("connecting");
    };

    return (
        <>
            <Intro />
            <section>
                {/* this will showing location coordinates */}
                <article>
                  <Status locationStatus={LocationStatus} socketStatus={socketStatus}/>
                  {
                    position && 
                    <div>
                      <p>
                        latitude: <span>{position.lat}</span>&nbsp;
                        longitude: <span>{position.lng}</span>
                      </p>
                    </div>
                  }
                </article>
            </section>
            <section>
                {/* this will be showing the socket details */}
            </section>
            <section>
                {/* this will be showing map of current location */}
                {position && (
                    <article className='bg-gray-200 rounded-md overflow-hidden w-full' style={{height:'100px', width:'750px'}}>
                        <h1>View&nbsp;Map</h1>
                        <Map location={position}/>
                    </article>
                )}
            </section>
        </>
    );
};

export default Home;

// whenever user open the website access the location latitude and lagitutde
// then take care of room id
// then go to room
