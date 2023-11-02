type SocketStatus = 'connecting' | 'connected' | 'disconnect' | 'error'
type GeoPositionStatus = {
    lat: number,
    lng: number
}
type LocationStatus = 'accessed' | 'denied' | 'error' | 'unknown'
export type {
    SocketStatus,
    GeoPositionStatus,
    LocationStatus
}