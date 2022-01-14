import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { User } from '../models';

// ON-CONNECT - (кастомное событие) - событие подключения клиента к сокету
const onConnectSocket = (io: Server, socket: Socket) => {
  socket.on('on-connect', async (userId: string) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      user.status = 'online';
      user.socketId = socket.id;

      await user.save();

      // socket.emit('on-connect'); // Отправка только себе
      // socket.broadcast.emit('on-connect'); // Отправка всем подключенным клиентам кроме себя

      io.emit('on-connect'); // Отправка всем подключенным клиентам
    } catch (error) {
      console.log(error);
    }
  });
};

export { onConnectSocket };
