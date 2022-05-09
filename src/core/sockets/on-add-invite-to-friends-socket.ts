import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { userModel } from '../../modules/user/models/user-model';

// ON-ADD-INVITE-TO-FRIENDS - (кастомное событие) - событие отправки приглашения в друзья пользователю
const onAddInviteToFriendsSocket = (io: Server, socket: Socket) => {
  socket.on('on-add-invite-to-friends', async (userId: string) => {
    try {
      const user = await userModel.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      socket.emit('on-add-invite-to-friends'); // Отправка пользователю который добавляет в друзья
      socket.to(user.socket_id).emit('on-add-invite-to-friends'); // Отправка пользователю которого добавляют в друзья
    } catch (error) {
      console.log(error);
    }
  });
};

export { onAddInviteToFriendsSocket };
