import axios from "axios";
import { REALTIME_SERVER, REALTIME_SERVER_DEVELOPMENT } from "./constants";

let api = axios.create({
    baseURL: process.env.NODE_ENV === "production" ? REALTIME_SERVER : REALTIME_SERVER_DEVELOPMENT,
});

export default api;
