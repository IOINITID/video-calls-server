import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { CORS_ORIGIN, PORT } from 'core/constants';
import { isErrorMiddleware } from 'core/middlewares';
import { Server } from 'socket.io';
import http from 'http';
import { connectionSocket } from 'core/sockets';
import { userRouter } from 'modules/user/router';
import { authorizationRouter } from 'modules/authorization/router';
import { invitationsRouter } from 'modules/invitations/router';
import { friendsRouter } from 'modules/friends/router';
import { Event } from 'core/sockets/constants';

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
app.use('/api', authorizationRouter);
app.use('/api', userRouter);
app.use('/api', invitationsRouter);
app.use('/api', friendsRouter);
app.use(isErrorMiddleware);

app.get('/', (req, res, next) => {
  return res.status(200).json({ status: 'online' });
});

// NOTE: CONNECTION - событие подключения к сокету
io.on(Event.Default.Connection, (socket) => {
  connectionSocket(io, socket);
});

const startServer = async () => {
  try {
    // await pool.connect();

    server.listen(PORT, () => {
      console.log(`Server start on port ${PORT}...`);
    });
  } catch (error) {
    console.log('Some error...');
    console.log(error);
  }
};

startServer();
