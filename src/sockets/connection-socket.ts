import { Server, Socket } from 'socket.io';
import {
  disconnectSocket,
  onAddInviteToFriendsSocket,
  onAddToFriendsSocket,
  onCallAnswerSocket,
  onCallEndSocket,
  onCallSocket,
  onChannelJoinSocket,
  onConnectSocket,
  onDisconnectSocket,
  onMessageSocket,
  onRemoveFromFriendsSocket,
  onRemoveInviteToFriendsSocket,
} from '.';

// CONNECT - событие подключения к сокету
const connectSocket = (io: Server, socket: Socket) => {
  // ON-CONNECT - (кастомное событие) - событие подключения клиента к сокету
  onConnectSocket(io, socket);

  // ON-DISCONNECT - (кастомное событие) - событие отключения клиента от сокета
  onDisconnectSocket(io, socket);

  // DISCONNECT - событие отключение одного из пользователей
  disconnectSocket(io, socket);

  // ON-ADD-INVITE-TO-FRIENDS - (кастомное событие) - событие отправки приглашения в друзья пользователю
  onAddInviteToFriendsSocket(io, socket);

  // ON-ADD-TO-FRIENDS - (кастомное событие) - событие добавления в друзья пользователя
  onAddToFriendsSocket(io, socket);

  // ON-REMOVE-FROM-FRIENDS - (кастомное событие) - событие удаление пользователя из друзей
  onRemoveFromFriendsSocket(io, socket);

  // ON-REMOVE-INVITE-TO-FRIENDS - (кастомное событие) - событие отклонение приглашения в друзья
  onRemoveInviteToFriendsSocket(io, socket);

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

export { connectSocket };
