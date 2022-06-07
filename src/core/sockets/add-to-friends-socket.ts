import { Server, Socket } from 'socket.io';
import { pool } from 'core/utils';
import { ApiError } from '../exeptions';

// ADD-TO-FRIENDS - (кастомное событие) - событие добавления в друзья
const addToFriendsSocket = (io: Server, socket: Socket) => {
  socket.on('client:add_to_friends', async (userId: string) => {
    try {
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

      if (!user.rows[0]) {
        throw ApiError.BadRequest('Пользователь которого хотят добавить в друзья не найден.');
      }

      socket.emit('server:add_to_friends'); // Отправка пользователю который принял приглашение в друзья
      socket.to(user.rows[0].socket_id).emit('server:add_to_friends'); // Отправка пользователю который отправлял приглашение в друзья
    } catch (error) {
      console.error(error);
    }
  });
};

export { addToFriendsSocket };
