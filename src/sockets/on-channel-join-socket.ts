import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { User } from '../models';

// ON-CHANNEL-JOIN - (кастомное событие) - событие присоединение пользователя к каналу
const onChannelJoinSocket = (io: Server, socket: Socket) => {
  socket.on('on-channel-join', async (channelId: string, userId: string) => {
    try {
      const user = await User.findById(userId); // Пользователь который вошел в канал

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      socket.join(channelId); // Присоединение пользователя к каналу

      socket.emit('on-channel-join', `Пользователь ${user.name} присоединился к каналу.`, channelId); // Отправка пользователю который вошел в канал
      socket.to(channelId).emit('on-channel-join', `Пользователь ${user.name} присоединился к каналу.`, channelId); // Отправка пользователям которые находятся в одном канале
    } catch (error) {
      console.log(error);
    }
  });
};

export { onChannelJoinSocket };
