import { Server, Socket } from 'socket.io';
import { UserDto } from '../dtos';
import { ApiError } from '../exeptions';
import { Channel, Message, User } from '../models';

// ON-MESSAGE - (кастомное событие) - событие отправки сообщения в канал
const onMessageSocket = (io: Server, socket: Socket) => {
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

      channel.messages.push(message._id); // Добавляет id модели сообщения в канал

      await channel.save();

      socket.emit('on-message', channelId); //  Отправка пользователю который отправил сообщение
      socket.to(channelId).emit('on-message', channelId); // Отправка пользователям которые находятся в канале
    } catch (error) {
      console.log(error);
    }
  });
};

export { onMessageSocket };
