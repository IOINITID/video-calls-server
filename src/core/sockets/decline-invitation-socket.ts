import { Server, Socket } from 'socket.io';
import { pool } from 'core/utils';
import { ApiError } from '../exeptions';
import { Event } from './constants';

// DECLINE-INVITATION-SOCKET - (кастомное событие) - событие отклонения приглашения в друзья
const declineInvitationSocket = (io: Server, socket: Socket) => {
  socket.on(Event.Client.DeclineInvitation, async (userId: string) => {
    try {
      // NOTE: Пользователь которому отклонили приглашение в друзья
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

      // NOTE: Проверка на то, что пользователь которому отклонили приглашение в друзья зарегистрирован
      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь которому отклонили приглашение в друзья не найден.');
      }

      // NOTE: Отправка пользователю который отклонил приглашение в друзья
      socket.emit(Event.Server.DeclineInvitation);

      // NOTE: Отправка пользователю которому отклонили приглашение в друзья
      socket.to(user.rows[0].socket_id).emit(Event.Server.DeclineInvitation);
    } catch (error) {
      console.error(error);
    }
  });
};

export { declineInvitationSocket };
