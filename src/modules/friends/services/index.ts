import { pool } from 'core/utils';
import { ApiError } from 'core/exeptions';

/**
 * Service для добавления в друзья.
 */
export const addToFriendsService = async (payload: { user_id: string; friend_id: string }) => {
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

    // NOTE: Удаление пользователя который отправил приглашение в друзья у пользователя которому отправлено приглашение в друзья
    await pool.query('DELETE FROM invitations WHERE user_id = $1 AND received_invitation_id = $2', [
      user_id,
      friend_id,
    ]);

    // NOTE: Добавление пользователя который отправил приглашение в друзья, в друзья к пользователю, которому отправлено приглашение в друзья
    await pool.query('INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)', [user_id, friend_id]);

    // NOTE: Добавление пользователя которому отправлено приглашение в друзья, в друзья к пользователю, который отправил приглашение в друзья
    await pool.query('INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)', [friend_id, user_id]);

    // NOTE: Список друзей пользователя
    const { friends } = await getFriendsService({ user_id });

    // NOTE: Список пользователей
    return { friends };
  } catch (error) {
    throw error;
  }
};

/**
 * Service для удаления из друзей.
 */
export const removeFromFriendsService = async (payload: { user_id: string; friend_id: string }) => {
  try {
    // NOTE: ID пользователя который хочет удалить из друзей и ID пользователя которого хотят удалить из друзей
    const { user_id, friend_id } = payload;

    // NOTE: Пользователь который хочет удалить из друзей
    const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);

    // NOTE: Проверка на то, что пользователь который хочет удалить из друзей зарегистрирован
    if (!existingUser.rows[0]) {
      throw ApiError.BadRequest('Пользователь который хочет удалить из друзей не найден.');
    }

    // NOTE: Пользователь которого хотят удалить из друзей
    const existingFriend = await pool.query('SELECT * FROM users WHERE id = $1', [friend_id]);

    // NOTE: Проверка на то, что пользователь которого хотят удалить из друзей зарегистрирован
    if (!existingFriend.rows[0]) {
      throw ApiError.BadRequest('Пользователь которого хотят удалить из друзей не найден.');
    }

    // NOTE: Проверка на то, что пользователь который хочет удалить из друзей, находится в друзьях
    const existingUserInFriends = await pool.query('SELECT * FROM friends WHERE user_id = $1 AND friend_id = $2', [
      user_id,
      friend_id,
    ]);

    // NOTE: Проверка на то, что пользователь который хочет удалить из друзей, находится в друзьях
    if (!existingUserInFriends.rows[0]) {
      throw ApiError.BadRequest('Пользователь не находится у вас в друзьях.');
    }

    // NOTE: Проверка на то, что пользователь которого хотят удалить из друзей, находится в друзьях
    const existingFriendInFriends = await pool.query('SELECT * FROM friends WHERE user_id = $1 AND friend_id = $2', [
      friend_id,
      user_id,
    ]);

    // NOTE: Проверка на то, что пользователь которого хотят удалить из друзей, находится в друзьях
    if (!existingFriendInFriends.rows[0]) {
      throw ApiError.BadRequest('Пользователь не находится у вас в друзьях.');
    }

    // NOTE: Удаление пользователя который хочет удалить из друзей у пользователя которого хотят удалить из друзей
    await pool.query('DELETE FROM friends WHERE user_id = $1 AND friend_id = $2', [friend_id, user_id]);

    // NOTE: Удаление пользователя которого хотят удалить из друзей у пользователя который хочет удалить из друзей
    await pool.query('DELETE FROM friends WHERE user_id = $1 AND friend_id = $2', [user_id, friend_id]);

    // NOTE: Список друзей пользователя
    const { friends } = await getFriendsService({ user_id });

    // NOTE: Список друзей
    return { friends };
  } catch (error) {
    throw error;
  }
};

/**
 * Service для получения списка друзья.
 */
export const getFriendsService = async (payload: { user_id: string }) => {
  try {
    // NOTE: ID пользователя который хочет получить список друзей
    const { user_id } = payload;

    // NOTE: Пользователь который хочет получить список друзей
    const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);

    // NOTE: Проверка на то что пользователь который хочет получить список друзей зарегистрирован
    if (!existingUser.rows[0]) {
      throw ApiError.BadRequest('Пользователь который хочет получить список друзей не найден.');
    }

    // NOTE: Список друзей пользователя
    const friends = await pool.query(
      "SELECT users.* FROM users INNER JOIN friends ON users.id = friends.friend_id WHERE friends.user_id = $1 ORDER BY CASE WHEN users.status = 'online' THEN 1 WHEN users.status = 'offline' THEN 2 END, users.created_at ASC",
      [user_id]
    );

    return { friends: friends.rows };
  } catch (error) {
    throw error;
  }
};

export const getFriendsUsersService = async (payload: { user_id: string }) => {
  try {
    // NOTE: ID пользователя который хочет получить список пользователей, которых можно добавить в друзья
    const { user_id } = payload;

    // NOTE: Пользователь который хочет получить список пользователей, которых можно добавить в друзья
    const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);

    // NOTE: Проверка на то что пользователь который хочет получить список пользователей, которых можно добавить в друзья
    if (!existingUser.rows[0]) {
      throw ApiError.BadRequest(
        'Пользователь который хочет получить список пользователей, которых можно добавить в друзья не найден.'
      );
    }

    // NOTE: Список пользователей, которых можно добавить в друзья
    const friendsUsers = await pool.query(
      `
SELECT users.*, sent_invitations.sent_invitation, received_invitations.received_invitation, friends.add_to_friends FROM users

LEFT JOIN (
  SELECT *, CASE 
  WHEN sent_invitation_id IS NOT NULL THEN true 
  ELSE false 
  END AS sent_invitation 
  FROM invitations
  WHERE user_id = $1
) AS sent_invitations 
ON users.id = sent_invitations.sent_invitation_id

LEFT JOIN (
  SELECT *, CASE 
  WHEN received_invitation_id IS NOT NULL THEN true 
  ELSE false 
  END AS received_invitation
  FROM invitations
  WHERE user_id = $1
) AS received_invitations 
ON users.id = received_invitations.received_invitation_id

LEFT JOIN (
  SELECT *, CASE
  WHEN friend_id IS NOT NULL THEN true
  ELSE false
  END AS add_to_friends FROM friends
  WHERE user_id = $1
) AS friends
ON users.id = friends.friend_id

WHERE users.id != $1

ORDER BY CASE
WHEN users.status = 'online' THEN 1
WHEN users.status = 'offline' THEN 2
END, users.created_at ASC;
`,
      [user_id]
    );

    return { friends_users: friendsUsers.rows };
  } catch (error) {
    throw error;
  }
};

// `
// -- Объединение двух таблиц
// SELECT users.*, invitations.sent_invitation FROM users LEFT JOIN (
//     SELECT *, CASE
//     WHEN sent_invitation_id IS NOT NULL THEN true
//     ELSE false
//     END AS sent_invitation FROM invitations
//     WHERE user_id = '7c9ad0a7-b9d9-46fb-9562-79b00891a8cb'
// ) AS invitations
// ON users.id = invitations.sent_invitation_id
// ORDER BY CASE
// WHEN users.status = 'online' THEN 1
// WHEN users.status = 'offline' THEN 2
// END, users.created_at ASC;
// `;

// `
// SELECT users.*, invitations.sent_invitation, friends.add_to_friends FROM users LEFT JOIN (
//   SELECT *, CASE
//   WHEN sent_invitation_id IS NOT NULL THEN true
//   ELSE false
//   END AS sent_invitation FROM invitations
//   WHERE user_id = $1
// ) AS invitations
// ON users.id = invitations.sent_invitation_id

// LEFT JOIN (
//   SELECT *, CASE
//   WHEN friend_id IS NOT NULL THEN true
//   ELSE false
//   END AS add_to_friends FROM friends
//   WHERE user_id = $1
// ) AS friends
// ON users.id = friends.friend_id

// WHERE users.id != $1

// ORDER BY CASE
// WHEN users.status = 'online' THEN 1
// WHEN users.status = 'offline' THEN 2
// END, users.created_at ASC;
// `;
