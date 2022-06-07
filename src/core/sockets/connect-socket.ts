import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { pool } from 'core/utils';

// CONNECT - (кастомное событие) - событие подключения клиента к сокету
const connectSocket = (io: Server, socket: Socket) => {
  socket.on('client:connect', async (userId: string) => {
    try {
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['online', userId]);
      await pool.query('UPDATE users SET socket_id = $1 WHERE id = $2', [socket.id, userId]);

      // socket.emit('on-connect'); // Отправка только себе
      // socket.broadcast.emit('on-connect'); // Отправка всем подключенным клиентам кроме себя

      io.emit('server:connect'); // Отправка всем подключенным клиентам
    } catch (error) {
      console.log(error);
    }
  });
};

export { connectSocket };
