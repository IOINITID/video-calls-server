import express from "express";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";

dotenv.config();

const PORT = Number(process.env.PORT) || 8080;
const INDEX = "/index.html";

const app = express();

app.use((req, res) => res.sendFile(INDEX, { root: __dirname }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://ioinitid.github.io/video-calls/",
    // origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  transports: ["polling"],
  //   pingInterval: 10,
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

app.get("/", (req, res) =>
  res.status(200).json({ status: "ready", port: `${PORT}` })
);

server.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
