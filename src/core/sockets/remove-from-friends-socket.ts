import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { Event } from './constants';
import { pool } from 'core/utils';

// REMOVE-FROM-FRIENDS - (кастомное событие) - событие удаление пользователя из друзей
const removeFromFriendsSocket = (io: Server, socket: Socket) => {
  socket.on(Event.Client.RemoveFromFriends, async (userId: string) => {
    try {
      // NOTE: Пользователь который удаляет из друзей
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

      // NOTE: Проверка на то, что пользователь который удаляет из друзей зарегестрирован
      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь который удаляет из друзей не найден.');
      }

      // NOTE: Отправка пользователю который удаляет из друзей
      socket.emit(Event.Server.RemoveFromFriends);

      // NOTE: Отправка пользователю которого удаляют из друзей
      socket.to(user.rows[0].socket_id).emit(Event.Server.RemoveFromFriends);
    } catch (error) {
      console.error(error);
    }
  });
};

export { removeFromFriendsSocket };
