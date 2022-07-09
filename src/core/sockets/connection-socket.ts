import { ApiError } from 'core/exeptions';
import { pool } from 'core/utils';
import { UserModel } from 'modules/user/models/user-model';
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
  // user_id: string, friend_id: string
  socket.on('client:meet_start_call', async (payload: { userFromCall: string; userToCall: string }) => {
    const userFromCall = await pool.query('SELECT * FROM users WHERE id = $1', [payload.userFromCall]);

    if (!userFromCall) {
      throw ApiError.BadRequest('Пользователь который звонит не найден.');
    }

    const userToCall = await pool.query('SELECT * FROM users WHERE id = $1', [payload.userToCall]);

    if (!userToCall) {
      throw ApiError.BadRequest('Пользователь которому звонят не найден.');
    }

    // socket.emit('server:meet_start_call');
    socket.to(userToCall.rows[0].socket_id).emit('server:meet_start_call', { userFromCall: userFromCall.rows[0] });
    // io.emit('server:meet_start_call');
  });

  socket.on('client:meet_accept_call', async (payload: { userFromCall: string; userToCall: string }) => {
    const userFromCall = await pool.query('SELECT * FROM users WHERE id = $1', [payload.userFromCall]);

    if (!userFromCall) {
      throw ApiError.BadRequest('Пользователь который звонит не найден.');
    }

    const userToCall = await pool.query('SELECT * FROM users WHERE id = $1', [payload.userToCall]);

    if (!userToCall) {
      throw ApiError.BadRequest('Пользователь которому звонят не найден.');
    }

    socket.emit('server:meet_accept_call');
    socket.to(userToCall.rows[0].socket_id).emit('server:meet_accept_call');
  });

  socket.on('client:meet_end_call', async (friend_id: string) => {
    const friend = await pool.query('SELECT * FROM users WHERE id = $1', [friend_id]);

    if (!friend) {
      throw ApiError.BadRequest('Пользователь которому заканчивают вызов не найден.');
    }

    // socket.emit('server:meet_end_call');
    socket.to(friend.rows[0].socket_id).emit('server:meet_end_call');
    // io.emit('server:meet_end_call');
  });

  socket.on(
    'client:meet_offer',
    async (payload: { userFromCall: string; userToCall: string }, offer: RTCSessionDescriptionInit) => {
      const userToCall = await pool.query('SELECT * FROM users WHERE id = $1', [payload.userToCall]);

      if (!userToCall) {
        throw ApiError.BadRequest('Пользователь которому отправляют предложение для peer соединения не найден.');
      }

      // socket.emit('server:meet_offer', offer);
      socket
        .to(userToCall.rows[0].socket_id)
        .emit('server:meet_offer', { userFromCall: payload.userFromCall, userToCall: payload.userToCall }, offer);
      // io.emit('server:meet_offer', offer);
    }
  );

  socket.on('client:meet_answer', async (user_id: string, friend_id: string, answer: RTCSessionDescriptionInit) => {
    const friend = await pool.query('SELECT * FROM users WHERE id = $1', [friend_id]);

    if (!friend) {
      throw ApiError.BadRequest('Пользователь которому отправляют ответ для peer соединения не найден.');
    }

    // socket.emit('server:meet_answer', answer);
    socket.to(friend.rows[0].socket_id).emit('server:meet_answer', user_id, friend_id, answer);
    // io.emit('server:meet_answer', answer);
  });

  socket.on('client:meet_candidate', async (user_id: string, friend_id: string, candidate: RTCIceCandidate) => {
    const friend = await pool.query('SELECT * FROM users WHERE id = $1', [friend_id]);

    if (!friend) {
      throw ApiError.BadRequest('Пользователь которому отправляют кандидата для peer соединения не найден.');
    }

    // socket.emit('server:meet_candidate', candidate);
    socket.to(friend.rows[0].socket_id).emit('server:meet_candidate', user_id, friend_id, candidate);
    // io.emit('server:meet_candidate', candidate);
  });

  socket.on(
    'client:media_state_change',
    async (payload: { media: { audio: boolean; video: boolean }; userFromCall: UserModel; userToCall: UserModel }) => {
      const userToCall = await pool.query('SELECT * FROM users WHERE id = $1', [payload.userToCall.id]);

      if (!userToCall) {
        throw ApiError.BadRequest('Пользователь которому отправляют предложение для peer соединения не найден.');
      }

      // socket.emit('server:meet_offer', offer);
      socket.to(userToCall.rows[0].socket_id).emit('server:media_state_change', {
        media: payload.media,
        userFromCall: payload.userFromCall,
        userToCall: payload.userToCall,
      });
      // io.emit('server:meet_offer', offer);
    }
  );

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
