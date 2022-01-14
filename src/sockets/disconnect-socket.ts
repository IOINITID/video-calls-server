import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { User } from '../models';

// DISCONNECT - событие отключение одного из пользователей
const disconnectSocket = (io: Server, socket: Socket) => {
  socket.on('disconnect', async () => {
    try {
      const user = await User.findOne({ socketId: socket.id });

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      user.status = 'offline';
      user.socketId = '';

      await user.save();

      // socket.emit('on-disconnect'); // Отправка только себе
      // socket.broadcast.emit('on-disconnect'); // Отправка всем подключенным клиентам кроме себя

      io.emit('on-disconnect'); // Отправка всем подключенным клиентам
    } catch (error) {
      console.log(error);
    }
  });
};

export { disconnectSocket };
