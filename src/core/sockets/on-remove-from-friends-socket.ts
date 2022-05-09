import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { userModel } from '../../modules/user/models/user-model';

// ON-REMOVE-FROM-FRIENDS - (кастомное событие) - событие удаление пользователя из друзей
const onRemoveFromFriendsSocket = (io: Server, socket: Socket) => {
  socket.on('on-remove-from-friends', async (userId: string) => {
    try {
      const user = await userModel.findById(userId); // Пользователь которого удаляют из друзей

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      socket.emit('on-remove-from-friends'); // Отправка пользователю который удаляет из друзей
      socket.to(user.socket_id).emit('on-remove-from-friends'); // Отправка пользователю которого удаляют из друзей
    } catch (error) {
      console.log(error);
    }
  });
};

export { onRemoveFromFriendsSocket };
