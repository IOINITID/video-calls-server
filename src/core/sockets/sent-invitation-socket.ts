import { Server, Socket } from 'socket.io';
import { pool } from 'core/utils';
import { ApiError } from '../exeptions';
import { getInvitationsService } from 'modules/invitations/services';

// SENT-INVITATION - (кастомное событие) - событие отправки приглашения в друзья
const sentInvitationSocket = (io: Server, socket: Socket) => {
  socket.on('client:sent_invitation', async (userId: string, friendId: string) => {
    try {
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь который отправил приглашение в друзья не найден.');
      }

      const friend = await pool.query('SELECT * FROM users WHERE id = $1', [friendId]);

      if (!friend.rows[0]) {
        throw ApiError.BadRequest('Пользователь которому отправили приглашение в друзья не найден.');
      }

      // TODO: Исправить это на клиенте, отправлять событие когда получен успешный ответ от сервера
      // NOTE: Ожидание когда данные будут обновлены
      await getInvitationsService({ user_id: userId });
      await getInvitationsService({ user_id: friendId });

      socket.emit('server:sent_invitation'); // Отправка пользователю который добавляет в друзья
      socket.to(friend.rows[0].socket_id).emit('server:sent_invitation'); // Отправка пользователю которого добавляют в друзья
    } catch (error) {
      console.log(error);
    }
  });
};

export { sentInvitationSocket };
