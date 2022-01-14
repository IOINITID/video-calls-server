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
import { Channel, Message, User } from './models';
import { ApiError } from './exeptions';
import { UserDto } from './dtos';
import {
  disconnectSocket,
  onAddInviteToFriendsSocket,
  onAddToFriendsSocket,
  onConnectSocket,
  onDisconnectSocket,
  onRemoveFromFriendsSocket,
} from './sockets';

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

io.on('connection', (socket) => {
  // ON-CONNECT - (кастомное событие) - событие подключения клиента к сокету
  onConnectSocket(io, socket);

  // ON-DISCONNECT - (кастомное событие) - событие отключения клиента от сокета
  onDisconnectSocket(io, socket);

  // DISCONNECT - событие отключение одного из пользователей
  disconnectSocket(io, socket);

  // ON-ADD-INVITE-TO-FRIENDS - (кастомное событие) - событие отправки приглашения в друзья пользователю
  onAddInviteToFriendsSocket(io, socket);

  // ON-ADD-TO-FRIENDS - (кастомное событие) - событие добавления в друзья пользователя
  onAddToFriendsSocket(io, socket);

  // ON-REMOVE-FROM-FRIENDS - (кастомное событие) - событие удаление пользователя из друзей
  onRemoveFromFriendsSocket(io, socket);

  // ON-REMOVE-INVITE-TO-FRIENDS - отклонение приглашения в друзья (кастомное событие)
  socket.on('on-remove-invite-to-friends', async (userId: string) => {
    try {
      // TODO: Доделать отклонение в друзья
      // TODO: Добавить разделение на remove-invite-to-friends и remove-waiting-for-approval
      // TODO: Отдельное API для удаления по общему признаку
      const user = await User.findById(userId); // Пользователь который отклоняет приглашение в друзья

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      socket.to(user.socketId).emit('on-remove-invite-to-friends'); // Отправка пользователю, который которого удаляют из друзей
      socket.emit('on-remove-invite-to-friends'); // Отправка пользователю, который удаляет из друзей
    } catch (error) {
      console.log(error);
    }
  });

  // ON-CHANNEL-JOIN - присоединение к комнате (кастомное событие)
  socket.on('on-channel-join', async (channelId: string, userId: string) => {
    try {
      const user = await User.findById(userId); // Пользователь который вошел в канал

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      socket.join(channelId); // Присоединение пользователя к каналу

      // TODO: Добавить имя пользователя в сообщение
      socket.to(channelId).emit('on-channel-join', `Пользователь ${user.name} присоединился к каналу.`); // Отправка пользователям, которые находятся в одном канале
      socket.emit('on-channel-join', `Пользователь ${user.name} присоединился к каналу.`); // Отправка пользователю, который вошел в канал
    } catch (error) {
      console.log(error);
    }
  });

  // ON-MESSAGE - отправка сообщения в канал (кастомное событие)
  socket.on('on-message', async (channelId: string, userMessage: string, userId: string) => {
    try {
      const channel = await Channel.findById(channelId);

      if (!channel) {
        throw ApiError.BadRequest('Такого канала нет.');
      }

      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Такого пользователя нет.');
      }

      const userDto = new UserDto(user);

      const message = await Message.create({ text: userMessage, author: userDto });

      // Добавляет id модели сообщения в канал
      channel.messages.push(message._id);

      await channel.save();

      socket.to(channelId).emit('on-message', channelId); // Отправка пользователям которые находятся в канале
      socket.emit('on-message', channelId); //  Отправка пользователю который отправил сообщение
    } catch (error) {
      console.log(error);
    }
  });

  // ON-CALL - звонок пользователю
  socket.on('on-call', async (userId, userIdToCall, signalData) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      const userToCall = await User.findById(userIdToCall);

      if (!userToCall) {
        throw ApiError.BadRequest('Пользователь которому вы звоните не найден.');
      }

      socket.to(userToCall.socketId).emit('on-call', signalData, user.id);
    } catch (error) {
      console.log(error);
    }
  });

  // ON-CALL-ANSWER - принятие звонока от пользователя
  socket.on('on-call-answer', async (signalData, userId) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      socket.to(user.socketId).emit('on-call-answer', signalData);
    } catch (error) {
      console.log(error);
    }
  });

  // ON-CALL-END - окончание вызова от пользователя
  socket.on('on-call-end', async (userId) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      socket.to(user.socketId).emit('on-call-end'); // Отправка события окончания вызова пользователю который принмал вызов
      socket.emit('on-call-end'); // Отправка события окончания вызова пользователю который звонил
    } catch (error) {
      console.log(error);
    }
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
