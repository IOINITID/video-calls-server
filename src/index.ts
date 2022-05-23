import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { CORS_ORIGIN, MONGO_URL, PORT } from 'core/constants';
import { isErrorMiddleware } from 'core/middlewares';
import { Server } from 'socket.io';
import http from 'http';
import { connectionSocket } from 'core/sockets';
import { userRouter } from 'modules/user/router';
import { authorizationRouter } from 'modules/authorization/router';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
  },
});

app.use(json({ limit: '10mb' }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true, // Разрешает cookies
    origin: CORS_ORIGIN,
  })
);
app.use('/api/authorization', authorizationRouter);
app.use('/api/users', userRouter);
app.use(isErrorMiddleware);

app.get('/', (req, res, next) => {
  return res.json({ status: 'online' });
});

io.on('connection', (socket) => connectionSocket(io, socket)); // CONNECTION - событие подключения к сокету

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
