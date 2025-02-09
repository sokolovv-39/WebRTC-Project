import { io } from "socket.io-client";

const SERVER_URI =
  process.env.NODE_ENV === "development" ? "http://localhost:4000" : "";

const socket = io(SERVER_URI);

export default socket;
