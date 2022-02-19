import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { userModel } from '../../modules/user/models/user-model';

// ON-CALL - (кастомное событие) - событие звонока пользователю
const onCallSocket = (io: Server, socket: Socket) => {
  socket.on('on-call', async (userId, userIdToCall, signalData) => {
    try {
      const user = await userModel.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      const userToCall = await userModel.findById(userIdToCall);

      if (!userToCall) {
        throw ApiError.BadRequest('Пользователь которому вы звоните не найден.');
      }

      socket.to(userToCall.socketId).emit('on-call', signalData, user.id);
    } catch (error) {
      console.log(error);
    }
  });
};

export { onCallSocket };
