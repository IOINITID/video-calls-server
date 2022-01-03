import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { APPLICATION_URL, MONGO_URL, PORT } from './constants';
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
    origin: APPLICATION_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true, // Разрешает cookies
    origin: APPLICATION_URL,
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
    socket.emit('on-add-invite-to-friends'); // Отправка пользователю, который добавляет в друзья
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

  // ON-REMOVE-FROM-FRIENDS - удаление из пользователей (кастомное событие)
  socket.on('on-remove-from-friends', async (userId: string) => {
    const user = await User.findById(userId); // Пользователь которого удаляют из друзей

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    socket.to(user.socketId).emit('on-remove-from-friends'); // Отправка пользователю, который которого удаляют из друзей
    socket.emit('on-remove-from-friends'); // Отправка пользователю, который удаляет из друзей
  });

  // ON-REMOVE-INVITE-TO-FRIENDS - отклонение приглашения в друзья (кастомное событие)
  socket.on('on-remove-invite-to-friends', async (userId: string) => {
    // TODO: Доделать отклонение в друзья
    // TODO: Добавить разделение на remove-invite-to-friends и remove-waiting-for-approval
    // TODO: Отдельное API для удаления по общему признаку
    const user = await User.findById(userId); // Пользователь который отклоняет приглашение в друзья

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    socket.to(user.socketId).emit('on-remove-invite-to-friends'); // Отправка пользователю, который которого удаляют из друзей
    socket.emit('on-remove-invite-to-friends'); // Отправка пользователю, который удаляет из друзей
  });

  // ON-CHANNEL-JOIN - присоединение к комнате (кастомное событие)
  socket.on('on-channel-join', async (channelId: string, userId: string) => {
    const user = await User.findById(userId); // Пользователь который вошел в канал

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    socket.join(channelId); // Присоединение пользователя к каналу

    // TODO: Добавить имя пользователя в сообщение
    socket.to(channelId).emit('on-channel-join', `${user.name} has joined.`); // Отправка пользователям, которые находятся в одном канале
    socket.emit('on-channel-join', `${user.name} has joined.`); // Отправка пользователю, который вошел в канал
  });

  // ON-CALL - звонок пользователю
  socket.on('on-call', async (userId, userIdToCall, signalData) => {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    const userToCall = await User.findById(userIdToCall);

    if (!userToCall) {
      throw ApiError.BadRequest('Пользователь которому вы звоните не найден.');
    }

    socket.to(userToCall.socketId).emit('on-call', signalData, user.id);
  });

  // ON-CALL-ANSWER - принятие звонока от пользователя
  socket.on('on-call-answer', async (signalData, userId) => {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    socket.to(user.socketId).emit('on-call-answer', signalData);
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
