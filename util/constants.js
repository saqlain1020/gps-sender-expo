export const REALTIME_SERVER = "https://gps-sender-backend.herokuapp.com";
export const REALTIME_SERVER_DEVELOPMENT = "http://localhost:8000";

export const SocketEvent = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  MESSAGE: "message",
  LOCATION: "location",
  DEVICE_INFO: "device-info",
};
Object.freeze(SocketEvent);
