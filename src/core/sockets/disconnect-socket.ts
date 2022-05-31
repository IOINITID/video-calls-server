import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { userModel } from 'modules/user/models/user-model';
import { pool } from 'core/utils';

// DISCONNECT - событие отключение одного из пользователей
const disconnectSocket = (io: Server, socket: Socket) => {
  socket.on('disconnect', async () => {
    try {
      // const user = await userModel.findOne({ socket_id: socket.id });
      const user = await pool.query('SELECT * FROM users WHERE socket_id = $1', [socket.id]);

      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      await pool.query('UPDATE users SET status = $1 WHERE socket_id = $2', ['offline', socket.id]);
      await pool.query('UPDATE users SET socket_id = $1 WHERE socket_id = $2', ['', socket.id]);

      // user.status = 'offline';
      // user.socket_id = '';

      // await user.save();

      // socket.emit('on-disconnect'); // Отправка только себе
      // socket.broadcast.emit('on-disconnect'); // Отправка всем подключенным клиентам кроме себя

      io.emit('on-disconnect'); // Отправка всем подключенным клиентам
    } catch (error) {
      console.error(error);
    }
  });
};

export { disconnectSocket };
