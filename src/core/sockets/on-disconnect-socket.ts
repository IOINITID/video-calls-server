import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { userModel } from '../../modules/user/models/user-model';

// ON-DISCONNECT - (кастомное событие) - событие отключения клиента от сокета
const onDisconnectSocket = (io: Server, socket: Socket) => {
  socket.on('on-disconnect', async (userId: string) => {
    try {
      const user = await userModel.findById(userId);

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

export { onDisconnectSocket };
