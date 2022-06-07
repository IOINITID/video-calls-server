import { Server, Socket } from 'socket.io';
import { pool } from 'core/utils';
import { ApiError } from '../exeptions';
import { getInvitationsService } from 'modules/invitations/services';
import { Event } from './constants';

// SENT-INVITATION - (кастомное событие) - событие отправки приглашения в друзья
const sentInvitationSocket = (io: Server, socket: Socket) => {
  // TODO: Добавить в константы список событий
  socket.on(Event.Client.SentInvitation, async (userId: string, friendId: string) => {
    try {
      // NOTE: Пользователь который отправил приглашение в друзья
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

      // NOTE: Проверка на то, что пользователь который отправил приглашение в друзья зарегистрирован
      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь который отправил приглашение в друзья не найден.');
      }

      // NOTE: Пользователь которому отправили приглашение в друзья
      const friend = await pool.query('SELECT * FROM users WHERE id = $1', [friendId]);

      // NOTE: Проверка на то, что пользователь которому отправили приглашение в друзья зарегистрирован
      if (!friend.rows[0]) {
        throw ApiError.BadRequest('Пользователь которому отправили приглашение в друзья не найден.');
      }

      // TODO: Исправить это на клиенте, отправлять событие когда получен успешный ответ от сервера

      // NOTE: Ожидание когда данные будут обновлены
      await getInvitationsService({ user_id: userId });
      // NOTE: Ожидание когда данные будут обновлены
      await getInvitationsService({ user_id: friendId });

      // NOTE: Отправка пользователю который отправил приглашение в друзья
      socket.emit(Event.Server.SentInvitation);

      // NOTE: Отправка пользователю которому отправили приглашение в друзья
      socket.to(friend.rows[0].socket_id).emit(Event.Server.SentInvitation);
    } catch (error) {
      console.error(error);
    }
  });
};

export { sentInvitationSocket };
