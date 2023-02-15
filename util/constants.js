const REALTIME_SERVER = "http://gps-sender.saqlain1020.com";
const REALTIME_SERVER_DEVELOPMENT = "https://gps-sender-backend-production.up.railway.app"

export const SERVER_URL = process.env.NODE_ENV === "production" ? REALTIME_SERVER : REALTIME_SERVER_DEVELOPMENT;

export const SocketEvent = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  MESSAGE: "message",
  LOCATION: "location",
  DEVICE_INFO: "device-info",
  BUS_LOCATION: "busLocation",
};

Object.freeze(SocketEvent);
