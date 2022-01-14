import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { User } from '../models';

// ON-REMOVE-FROM-FRIENDS - (кастомное событие) - событие удаление пользователя из друзей
const onRemoveFromFriendsSocket = (io: Server, socket: Socket) => {
  socket.on('on-remove-from-friends', async (userId: string) => {
    try {
      const user = await User.findById(userId); // Пользователь которого удаляют из друзей

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      socket.emit('on-remove-from-friends'); // Отправка пользователю который удаляет из друзей
      socket.to(user.socketId).emit('on-remove-from-friends'); // Отправка пользователю которого удаляют из друзей
    } catch (error) {
      console.log(error);
    }
  });
};

export { onRemoveFromFriendsSocket };
