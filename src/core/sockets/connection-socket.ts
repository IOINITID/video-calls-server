import { Server, Socket } from 'socket.io';
import {
  disconnectSocket,
  sentInvitationSocket,
  addToFriendsSocket,
  onCallAnswerSocket,
  onCallEndSocket,
  onCallSocket,
  onChannelJoinSocket,
  connectSocket,
  userDisconnectSocket,
  onMessageSocket,
  removeFromFriendsSocket,
  declineInvitationSocket,
} from './index';

// CONNECT - событие подключения к сокету
const connectionSocket = (io: Server, socket: Socket) => {
  // TODO: Доабавить отдельный сокет
  socket.on('client:ping', (timestamp: string) => {
    socket.emit('server:ping', timestamp);
  });

  // CONNECT - (кастомное событие) - событие подключения клиента к сокету
  connectSocket(io, socket);

  // USER-DISCONNECT - (кастомное событие) - событие отключения клиента от сокета
  userDisconnectSocket(io, socket);

  // DISCONNECT - событие отключение одного из пользователей
  disconnectSocket(io, socket);

  // SENT-INVITATION - (кастомное событие) - событие отправки приглашения в друзья
  sentInvitationSocket(io, socket);

  // ADD-TO-FRIENDS - (кастомное событие) - событие добавления в друзья
  addToFriendsSocket(io, socket);

  // REMOVE-FROM-FRIENDS - (кастомное событие) - событие удаление пользователя из друзей
  removeFromFriendsSocket(io, socket);

  // DECLINE-INVITATION-SOCKET - (кастомное событие) - событие отклонения приглашения в друзья
  declineInvitationSocket(io, socket);

  // ON-CHANNEL-JOIN - (кастомное событие) - событие присоединение пользователя к каналу
  onChannelJoinSocket(io, socket);

  // ON-MESSAGE - (кастомное событие) - событие отправки сообщения в канал
  onMessageSocket(io, socket);

  // ON-CALL - (кастомное событие) - событие звонока пользователю
  onCallSocket(io, socket);

  // ON-CALL-ANSWER - (кастомное событие) - событие принятия звонока от пользователя
  onCallAnswerSocket(io, socket);

  // ON-CALL-END - (кастомное событие) - событие окончание вызова от пользователя
  onCallEndSocket(io, socket);
};

export { connectionSocket };
