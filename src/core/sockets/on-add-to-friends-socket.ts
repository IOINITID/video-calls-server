import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { userModel } from '../../modules/user/models/user-model';

// ON-ADD-TO-FRIENDS - (кастомное событие) - событие добавления в друзья пользователя
const onAddToFriendsSocket = (io: Server, socket: Socket) => {
  socket.on('on-add-to-friends', async (userId: string) => {
    try {
      const user = await userModel.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      socket.emit('on-add-to-friends'); // Отправка пользователю который принял приглашение в друзья
      socket.to(user.socketId).emit('on-add-to-friends'); // Отправка пользователю который отправлял приглашение в друзья
    } catch (error) {
      console.log(error);
    }
  });
};

export { onAddToFriendsSocket };
