import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { pool } from 'core/utils';
import { Event } from './constants';

// CONNECT - (кастомное событие) - событие подключения клиента к сокету
const connectSocket = (io: Server, socket: Socket) => {
  socket.on(Event.Client.Connect, async (userId: string) => {
    try {
      // NOTE: Пользователь который подключился
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

      // NOTE: Проверка на то, что пользователь который подключился зарегестрирован
      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь который подключился не найден.');
      }

      // NOTE: Обновление статуса пользователя, который подключился
      await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['online', userId]);

      // NOTE: Обновление ID сокета пользователя, который подключился
      await pool.query('UPDATE users SET socket_id = $1 WHERE id = $2', [socket.id, userId]);

      // NOTE: Отправка только себе
      // socket.emit(Event.Server.Connect);

      // NOTE: Отправка всем подключенным клиентам кроме себя
      // socket.broadcast.emit(Event.Server.Connect);

      // NOTE: Отправка всем подключенным клиентам
      io.emit(Event.Server.Connect);
    } catch (error) {
      console.error(error);
    }
  });
};

export { connectSocket };
