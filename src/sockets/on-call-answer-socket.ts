import { Server, Socket } from 'socket.io';
import { ApiError } from '../exeptions';
import { User } from '../models';

// ON-CALL-ANSWER - (кастомное событие) - событие принятия звонока от пользователя
const onCallAnswerSocket = (io: Server, socket: Socket) => {
  socket.on('on-call-answer', async (signalData, userId) => {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден.');
      }

      socket.to(user.socketId).emit('on-call-answer', signalData);
    } catch (error) {
      console.log(error);
    }
  });
};

export { onCallAnswerSocket };
