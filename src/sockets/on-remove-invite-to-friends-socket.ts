import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { User } from '../models';

// ON-REMOVE-INVITE-TO-FRIENDS - (кастомное событие) - событие отклонение приглашения в друзья
const onRemoveInviteToFriendsSocket = (io: Server, socket: Socket) => {
  socket.on('on-remove-invite-to-friends', async (userId: string) => {
    try {
      const user = await User.findById(userId); // Пользователь который отклоняет приглашение в друзья

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      socket.emit('on-remove-invite-to-friends'); // Отправка пользователю который удаляет из друзей
      socket.to(user.socketId).emit('on-remove-invite-to-friends'); // Отправка пользователю которого удаляют из друзей
    } catch (error) {
      console.log(error);
    }
  });
};

export { onRemoveInviteToFriendsSocket };
