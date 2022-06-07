import { Server, Socket } from 'socket.io';
import { pool } from 'core/utils';
import { ApiError } from '../exeptions';
import { Event } from './constants';

// DISCONNECT - событие отключение одного из пользователей
const disconnectSocket = (io: Server, socket: Socket) => {
  socket.on(Event.Default.Disconnect, async () => {
    try {
      // NOTE: Пользователь, который отключился
      const user = await pool.query('SELECT * FROM users WHERE socket_id = $1', [socket.id]);

      // NOTE: Проверка на то, что пользователь который отключился зарегистрирован
      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь который отключился не найден.');
      }

      // NOTE: Обновление статуса пользователя, который отключился
      await pool.query('UPDATE users SET status = $1 WHERE socket_id = $2', ['offline', socket.id]);

      // NOTE: Обновление ID сокета пользователя, который отключился
      await pool.query('UPDATE users SET socket_id = $1 WHERE socket_id = $2', ['', socket.id]);

      // NOTE: Отправка только себе
      socket.emit(Event.Server.Disconnect);

      // NOTE: Отправка всем подключенным клиентам кроме себя
      socket.broadcast.emit(Event.Server.Disconnect);

      // NOTE: // Отправка всем подключенным клиентам
      io.emit(Event.Server.Disconnect);
    } catch (error) {
      console.error(error);
    }
  });
};

export { disconnectSocket };
