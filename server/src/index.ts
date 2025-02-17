import express from "express";
import { createServer } from "http";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { config } from "dotenv";
import { initSocket } from "./utils/initSocket.js";

config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);

app.use(express.static(join(__dirname, "../client/dist")));
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN,
  },
  serveClient: false,
});
io.on("connection", initSocket);

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server ready on port ${port}`);
});
