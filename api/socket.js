import io from "socket.io-client";
import { REALTIME_SERVER, REALTIME_SERVER_DEVELOPMENT } from "../util/constants";

const SOCKET_CONNECTION =
    process.env.NODE_ENV === "production"
        ? REALTIME_SERVER
        : REALTIME_SERVER_DEVELOPMENT;

var socket = io(SOCKET_CONNECTION, {
    secure: process.env.NODE_ENV === "production" ? true : false,
    autoConnect: false,
    transports: ['websocket']
});

export default socket;
