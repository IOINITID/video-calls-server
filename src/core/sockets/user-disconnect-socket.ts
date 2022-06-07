import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { userModel } from 'modules/user/models/user-model';
import { pool } from 'core/utils';

// TODO: Переписать на disconnect, может убрать одно лишнее событие
// USER-DISCONNECT - (кастомное событие) - событие отключения клиента от сокета
const userDisconnectSocket = (io: Server, socket: Socket) => {
  socket.on('client:disconnect', async (userId: string) => {
    try {
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['offline', userId]);
      await pool.query('UPDATE users SET socket_id = $1 WHERE id = $2', ['', userId]);

      // socket.emit('on-disconnect'); // Отправка только себе
      // socket.broadcast.emit('on-disconnect'); // Отправка всем подключенным клиентам кроме себя

      io.emit('server:disconnect'); // Отправка всем подключенным клиентам
    } catch (error) {
      console.log(error);
    }
  });
};

export { userDisconnectSocket };
