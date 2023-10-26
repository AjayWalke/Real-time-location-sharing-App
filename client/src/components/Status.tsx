import React from "react";
import { LocationStatus, SocketStatus } from "./Types"
import {MdLocationOn, MdLocationOff} from 'react-icons/md'
import {TbPlugConnected, TbPlugConnectedX} from 'react-icons/tb'

type props = {
    locationStatus: LocationStatus | null;
    socketStatus: SocketStatus | null;
};

const Status = ({ locationStatus, socketStatus }: props) => {
    return (
        <section>
            {locationStatus && <div>
                <p>{locationStatus==='accessed' ? <MdLocationOn/> : <MdLocationOff/>}{locationStatus}</p>
            </div>}
            {socketStatus && <div>
                <p>{socketStatus === 'connected' ? <TbPlugConnected/> : <TbPlugConnectedX/>}{socketStatus}</p>
            </div>}
        </section>
    );
};

export default Status;
