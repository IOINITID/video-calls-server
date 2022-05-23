import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { userModel } from 'modules/user/models/user-model';

// ON-CONNECT - (кастомное событие) - событие подключения клиента к сокету
const onConnectSocket = (io: Server, socket: Socket) => {
  socket.on('on-connect', async (userId: string) => {
    try {
      const user = await userModel.findById(userId);

      if (!user) {
        // throw ApiError.BadRequest('Пользователь не найден.');
        return;
      }

      user.status = 'online';
      user.socket_id = socket.id;

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
