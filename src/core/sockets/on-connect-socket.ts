import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { userModel } from 'modules/user/models/user-model';
import { pool } from 'core/utils';

// ON-CONNECT - (кастомное событие) - событие подключения клиента к сокету
const onConnectSocket = (io: Server, socket: Socket) => {
  socket.on('on-connect', async (userId: string) => {
    try {
      // const user = await userModel.findById(userId);
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['online', userId]);
      await pool.query('UPDATE users SET socket_id = $1 WHERE id = $2', [socket.id, userId]);
      // user.status = 'online';
      // user.socket_id = socket.id;

      // await user.save();

      // socket.emit('on-connect'); // Отправка только себе
      // socket.broadcast.emit('on-connect'); // Отправка всем подключенным клиентам кроме себя

      io.emit('on-connect'); // Отправка всем подключенным клиентам
    } catch (error) {
      console.log(error);
    }
  });
};

export { onConnectSocket };
