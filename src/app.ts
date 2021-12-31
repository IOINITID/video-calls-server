import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { MONGO_URL, PORT } from './constants';
import { defaultRouter } from './router';
import { isError } from './middlewares';
import { Server } from 'socket.io';
import http from 'http';
import { User } from './models';
import { ApiError } from './exeptions';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true, // Разрешает cookies
    origin: 'http://localhost:3000',
  })
);
app.use('/api', defaultRouter);
app.use(isError);

io.on('connection', (socket) => {
  // ON-CONNECT - кастомное событие
  socket.on('on-connect', async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    user.status = 'online';
    user.socketId = socket.id;

    await user?.save();

    // socket.emit('on-connect'); // Отправка только себе
    // socket.broadcast.emit('on-connect'); // Отправка всем клиентам кроме себя

    io.emit('on-connect'); // Отправка всем клиентам в сети
  });

  // ON-DISCONNECT - кастомное событие
  socket.on('on-disconnect', async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    user.status = 'offline';
    user.socketId = '';

    await user?.save();

    // socket.emit('on-connect'); // Отправка только себе
    // socket.broadcast.emit('on-connect'); // Отправка всем клиентам кроме себя

    io.emit('on-disconnect'); // Отправка всем клиентам в сети
  });

  //  DISCONNECT - событие отключение одного из пользователей
  socket.on('disconnect', async () => {
    console.log('disconnect', socket);

    const user = await User.findOne({ socketId: socket.id });

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    user.status = 'offline';
    user.socketId = '';

    await user?.save();

    // socket.emit('on-connect'); // Отправка только себе
    // socket.broadcast.emit('on-connect'); // Отправка всем клиентам кроме себя

    io.emit('on-disconnect'); // Отправка всем клиентам в сети
  });

  // ON-ADD-INVITE-TO-FRIENDS
  socket.on('on-add-invite-to-friends', async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    socket.to(user.socketId).emit('on-add-invite-to-friends'); // Отправка пользователю, которого добавляют в друзья

    // TODO: Продолжить добавлять событие добавления в друзья
  });

  // ON-ADD-TO-FRIENDS
  socket.on('on-add-to-friends', async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    socket.to(user.socketId).emit('on-add-to-friends'); // Отправка пользователю, который отправлял приглашение в друзья
    socket.emit('on-add-to-friends'); // Отправка пользователю, который принял приглашение в друзья

    // TODO: Продолжить добавлять событие добавления в друзья
  });
});

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
