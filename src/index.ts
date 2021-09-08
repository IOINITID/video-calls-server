import express from "express";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { APPLICATION_URL } from "./constants";
import { ServerStatus, SocketEvent } from "./enums";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 8080;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: APPLICATION_URL,
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
});

io.on(SocketEvent.Connection, (socket) => {
  socket.emit(SocketEvent.Me, socket.id);

  socket.on(SocketEvent.Disconnect, () => {
    socket.broadcast.emit(SocketEvent.CallEnded);
  });

  socket.on(SocketEvent.CallUser, (data: any) => {
    io.to(data.userToCall).emit(SocketEvent.CallUser, {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on(SocketEvent.AnswerCall, (data: any) => {
    io.to(data.to).emit(SocketEvent.CallAccepted, data.signal);
  });
});

app.get("/", (req, res) =>
  res.status(200).json({ status: ServerStatus.Ready })
);

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}...`);
});
