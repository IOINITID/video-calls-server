import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { CORS_ORIGIN, MONGO_URL, PORT } from './constants';
import { defaultRouter } from './router';
import { isError } from './middlewares';
import { Server } from 'socket.io';
import http from 'http';
import { connectSocket } from './sockets';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
  },
});

app.use(json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true, // Разрешает cookies
    origin: CORS_ORIGIN,
  })
);
app.use('/api', defaultRouter);
app.use(isError);

io.on('connection', (socket) => connectSocket(io, socket)); // CONNECT - событие подключения к сокету

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URL);

    server.listen(PORT, () => {
      console.log(`Server start on port ${PORT}...`);
    });
  } catch (error) {
    console.log('Some error...');
    console.log(error);
  }
};

startServer();
