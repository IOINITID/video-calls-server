import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { userModel } from '../../modules/user/models/user-model';

// ON-CALL-END - (кастомное событие) - событие окончание вызова от пользователя
const onCallEndSocket = (io: Server, socket: Socket) => {
  socket.on('on-call-end', async (userId) => {
    try {
      const user = await userModel.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      socket.emit('on-call-end'); // Отправка события окончания вызова пользователю который звонил
      socket.to(user.socketId).emit('on-call-end'); // Отправка события окончания вызова пользователю который принимал вызов
    } catch (error) {
      console.log(error);
    }
  });
};

export { onCallEndSocket };
