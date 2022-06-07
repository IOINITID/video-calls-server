import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { pool } from 'core/utils';
import { Event } from './constants';

// USER-DISCONNECT - (кастомное событие) - событие отключения клиента от сокета
const userDisconnectSocket = (io: Server, socket: Socket) => {
  socket.on(Event.Client.Disconnect, async (userId: string) => {
    try {
      // NOTE: Пользователь, который отключился
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

      // NOTE: Проверка на то, что пользователь который отключился зарегистрирован
      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь который отключился не найден.');
      }

      // NOTE: Обновление статуса пользователя, который отключился
      await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['offline', userId]);

      // NOTE: Обновление ID сокета пользователя, который отключился
      await pool.query('UPDATE users SET socket_id = $1 WHERE id = $2', ['', userId]);

      // NOTE: Отправка только себе
      socket.emit(Event.Server.Disconnect);

      // NOTE: Отправка всем подключенным клиентам кроме себя
      socket.broadcast.emit(Event.Server.Disconnect);

      // NOTE: Отправка всем подключенным клиентам
      io.emit(Event.Server.Disconnect);
    } catch (error) {
      console.log(error);
    }
  });
};

export { userDisconnectSocket };
