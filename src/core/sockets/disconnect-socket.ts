import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { userModel } from 'modules/user/models/user-model';

// DISCONNECT - событие отключение одного из пользователей
const disconnectSocket = (io: Server, socket: Socket) => {
  socket.on('disconnect', async () => {
    try {
      const user = await userModel.findOne({ socket_id: socket.id });

      if (!user) {
        // throw ApiError.BadRequest('Пользователь не найден.');
        return;
      }

      user.status = 'offline';
      user.socket_id = '';

      await user.save();

      // socket.emit('on-disconnect'); // Отправка только себе
      // socket.broadcast.emit('on-disconnect'); // Отправка всем подключенным клиентам кроме себя

      io.emit('on-disconnect'); // Отправка всем подключенным клиентам
    } catch (error) {
      console.error(error);
    }
  });
};

export { disconnectSocket };
