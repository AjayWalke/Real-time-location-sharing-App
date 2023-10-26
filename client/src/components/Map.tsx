import React from "react";
import { GeoPositionStatus } from "./Types";
import { useState, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    useMapEvents,
    Marker,
    Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import L from "leaflet";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
});

const LocationMarker = ({ location }: { location: GeoPositionStatus }) => {
    const map = useMapEvents({});
    // console.log("okay", location.lat, location.lng);
    const [position, setPosition] = useState({
        lat: location.lat,
        lng: location.lng,
    });

    useEffect(() => {
        setPosition({
            lat: location.lat,
            lng: location.lng,
        });
        map.flyTo([location.lat, location.lng]);
    }, [location]);

    return position === null ? null : (
        <Marker position={position} icon={DefaultIcon}>
            <Popup>User is here!</Popup>
        </Marker>
    );
};

const Map = ({ location }: { location: GeoPositionStatus }) => {
    // console.log(location.lat, location.lng);
    return (
        <MapContainer
            center={[location.lat, location.lng]}
            zoom={30}
            scrollWheelZoom={true}
            className="h-screen"
            style={{ width: "100%", height: "calc(100vh - 4rem)" }}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker location={location} />
        </MapContainer>
    );
};

export default Map;
