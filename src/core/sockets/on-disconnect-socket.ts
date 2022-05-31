import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { userModel } from 'modules/user/models/user-model';
import { pool } from 'core/utils';

// ON-DISCONNECT - (кастомное событие) - событие отключения клиента от сокета
const onDisconnectSocket = (io: Server, socket: Socket) => {
  socket.on('on-disconnect', async (userId: string) => {
    try {
      // const user = await userModel.findById(userId);
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['offline', userId]);
      await pool.query('UPDATE users SET socket_id = $1 WHERE id = $2', ['', userId]);

      // user.status = 'offline';
      // user.socket_id = '';

      // await user.save();

      // socket.emit('on-disconnect'); // Отправка только себе
      // socket.broadcast.emit('on-disconnect'); // Отправка всем подключенным клиентам кроме себя

      io.emit('on-disconnect'); // Отправка всем подключенным клиентам
    } catch (error) {
      console.log(error);
    }
  });
};

export { onDisconnectSocket };
