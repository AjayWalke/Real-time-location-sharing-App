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
        <section className="flex">
            {locationStatus && <div className={`${locationStatus==='accessed' ? "inline-flex text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" : "flex text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"}`}>
                <p className="inline-flex pt-1 pr-1">{locationStatus==='accessed' ? <MdLocationOn/> : <MdLocationOff/>}</p><p>{locationStatus}</p>
            </div>}
            {socketStatus && <div className={`${socketStatus==='connected' ? "inline-flex text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" : "flex text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"}`}>
                <p className="inline-flex pt-1 pr-1">{socketStatus === 'connected' ? <TbPlugConnected/> : <TbPlugConnectedX/>}</p><p>{socketStatus}</p>
            </div>}
        </section>
    );
};

export default Status;
