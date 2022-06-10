import { pool } from 'core/utils';
import { ApiError } from 'core/exeptions';

/**
 * Service для отправки приглашения в друзья пользователю.
 */
export const sentInvitationService = async (payload: { user_id: string; friend_id: string }) => {
  try {
    // NOTE: ID пользователя который отправиляет приглашение в друзья и ID пользователя которому отправлено приглашение в друзья
    const { user_id, friend_id } = payload;

    // NOTE: Пользователь который отправляет приглашение в друзья
    const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);

    // NOTE: Проверка на то, что пользователь который отправляет приглашение в друзья зарегистрирован
    if (!existingUser.rows[0]) {
      throw ApiError.BadRequest('Пользователь не найден.');
    }

    // NOTE: Пользователь которому отправляют приглашение в друзья
    const existingFriend = await pool.query('SELECT * FROM users WHERE id = $1', [friend_id]);

    // NOTE: Проверка на то, что пользователь которому отправляют приглашение в друзья зарегистрирован
    if (!existingFriend.rows[0]) {
      throw ApiError.BadRequest('Пользователь которого хотят добавить в друзья не найден.');
    }

    // NOTE: Пользователь который уже отправил приглашение в друзья
    const existingUserInvitation = await pool.query(
      'SELECT * FROM invitations WHERE user_id = $1 AND sent_invitation_id = $2',
      [user_id, friend_id]
    );

    // NOTE: Проверка на то, что пользователь уже отправил приглашение в друзья
    if (existingUserInvitation.rows[0]) {
      throw ApiError.BadRequest('Пользователь уже отправил приглашение в друзья.');
    }

    // NOTE: Пользователь который уже получил приглашение в друзья
    const existingFriendInvitation = await pool.query(
      'SELECT * FROM invitations WHERE user_id = $1 AND sent_invitation_id = $2',
      [friend_id, user_id]
    );

    // NOTE: Проверка на то, что пользователь уже получил приглашение в друзья
    if (existingFriendInvitation.rows[0]) {
      throw ApiError.BadRequest('Пользователю уже отправлено приглашение в друзья.');
    }

    // NOTE: Добавление ID пользователя которому отправили приглашение в друзья в ID отправленных приглашений
    await pool.query('INSERT INTO invitations (user_id, sent_invitation_id) VALUES ($1, $2)', [user_id, friend_id]);

    // NOTE: Добавление ID пользователя от которого получено приглашение в друзья в ID полученных приглашений
    await pool.query('INSERT INTO invitations (user_id, received_invitation_id) VALUES ($1, $2)', [friend_id, user_id]);

    // NOTE: Список пользователей которым отправленны и от которых полученны приглашение в друзья
    const { invitations } = await getInvitationsService({ user_id });

    // NOTE: Список пользователей
    return { invitations };
  } catch (error) {
    throw error;
  }
};

/**
 * Service для отклонения приглашения в друзья.
 */
export const declineInvitationService = async (payload: { user_id: string; friend_id: string }) => {
  try {
    // NOTE: ID пользователя которому отправлено приглашение в друзья и ID пользователя который отправил приглашение в друзья
    const { user_id, friend_id } = payload;

    // NOTE: Пользователь которому отправлено приглашение в друзья
    const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);

    // NOTE: Проверка на то, что пользователь которому отправлено приглашение в друзья зарегистрирован
    if (!existingUser.rows[0]) {
      throw ApiError.BadRequest('Пользователь которому отправлено приглашение в друзья не найден.');
    }

    // NOTE: Пользователь который отправил приглашение в друзья
    const existingFriend = await pool.query('SELECT * FROM users WHERE id = $1', [friend_id]);

    // NOTE: Проверка на то, что пользователь который отправил приглашение в друзья зарегистрирован
    if (!existingFriend.rows[0]) {
      throw ApiError.BadRequest('Пользователь который отправил приглашение в друзья не найден.');
    }

    // NOTE: Проверка на то, что пользователь которому отправлено приглашение в друзья, уже находится в друзьях
    const existingUserInFriends = await pool.query('SELECT * FROM friends WHERE user_id = $1 AND friend_id = $2', [
      user_id,
      friend_id,
    ]);

    // NOTE: Проверка на то, что пользователь которому отправлено приглашение в друзья уже находится в друзьях
    if (existingUserInFriends.rows[0]) {
      throw ApiError.BadRequest('Пользователь уже находится у вас в друзьях.');
    }

    // NOTE: Проверка на то, что пользователь который отправил приглашение в друзья, уже находится в друзьях
    const existingFriendInFriends = await pool.query('SELECT * FROM friends WHERE user_id = $1 AND friend_id = $2', [
      friend_id,
      user_id,
    ]);

    // NOTE: Проверка на то, что пользователь который отправил приглашение в друзья, уже находится в друзьях
    if (existingFriendInFriends.rows[0]) {
      throw ApiError.BadRequest('Пользователь уже находится у вас в друзьях.');
    }

    // NOTE: Удаление пользователя которому отправлено приглашение в друзья у пользователя который отправил приглашение в друзья
    await pool.query('DELETE FROM invitations WHERE user_id = $1 AND sent_invitation_id = $2', [friend_id, user_id]);

    // NOTE: Удаление пользователя которому отправлено приглашение в друзья у пользователя который отправил приглашение в друзья
    await pool.query('DELETE FROM invitations WHERE user_id = $1 AND received_invitation_id = $2', [
      friend_id,
      user_id,
    ]);

    // NOTE: Удаление пользователя который отправил приглашение в друзья у пользователя которому отправлено приглашение в друзья
    await pool.query('DELETE FROM invitations WHERE user_id = $1 AND sent_invitation_id = $2', [user_id, friend_id]);

    // NOTE: Удаление пользователя который отправил приглашение в друзья у пользователя которому отправлено приглашение в друзья
    await pool.query('DELETE FROM invitations WHERE user_id = $1 AND received_invitation_id = $2', [
      user_id,
      friend_id,
    ]);

    // NOTE: Список пользователей которым отправленны и от которых полученны приглашение в друзья
    const { invitations } = await getInvitationsService({ user_id });

    // NOTE: Список пользователей
    return { invitations };
  } catch (error) {
    throw error;
  }
};

/**
 * Service для получения отправленных и полученных приглашений в друзья.
 */
export const getInvitationsService = async (payload: { user_id: string }) => {
  try {
    // NOTE: ID пользователя который хочет получить список отправленных и полученных приглашений
    const { user_id } = payload;

    // NOTE: Пользователь который хочет получить список отправленных и полученных приглашений
    const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);

    // NOTE: Проверка на то что пользователь который хочет получить список отправленных и полученных приглашений зарегистрирован
    if (!existingUser.rows[0]) {
      throw ApiError.BadRequest(
        'Пользователь который хочет получить список отправленных и полученных приглашений не найден.'
      );
    }

    // NOTE: Список пользователей которым отправлены приглашения в друзья
    const sentInvitations = await pool.query(
      'SELECT users.* FROM users INNER JOIN invitations ON users.id = invitations.sent_invitation_id WHERE invitations.user_id = $1 ORDER BY users.created_at',
      [user_id]
    );

    // NOTE: Список пользователей от которых получены приглашения в друзья
    const receivedInvitations = await pool.query(
      'SELECT users.* FROM users INNER JOIN invitations ON users.id = invitations.received_invitation_id WHERE invitations.user_id = $1 ORDER BY users.created_at',
      [user_id]
    );

    // NOTE: Список пользователей которым отправленны и от которых полученны приглашение в друзья
    return { invitations: { sent: sentInvitations.rows, received: receivedInvitations.rows } };
  } catch (error) {
    throw error;
  }
};
