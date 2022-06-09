import { RequestHandler } from 'express';
import {
  addToFriendsService,
  getFriendsService,
  getFriendsUsersService,
  removeFromFriendsService,
} from 'modules/friends/services';
import { getInvitationsService } from 'modules/invitations/services';

/**
 * Controller для добавления в друзья.
 */
export const addToFriendsController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: ID пользователя который отправил приглашение в друзья
    const { friend_id } = req.body;

    // NOTE: Список друзей пользователя
    const { friends } = await addToFriendsService({ user_id: (req as any).user.id, friend_id });

    // NOTE: Отправка списка друзей
    return res.status(200).json({ friends });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller для удаления из друзей.
 */
export const removeFromFriendsController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: ID пользователя который отправил приглашение в друзья
    const { friend_id } = req.body;

    // NOTE: Список друзей пользователя
    const { friends } = await removeFromFriendsService({ user_id: (req as any).user.id, friend_id });

    // NOTE: Отправка списка друзей
    return res.status(200).json({ friends });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller для получения списка друзей.
 */
export const getFriendsController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: Список друзей пользователя
    const { friends } = await getFriendsService({ user_id: (req as any).user.id });

    // NOTE: Отправка списка друзей
    return res.status(200).json({ friends });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller для получения списка пользователей, которых можно добавить в друзья.
 */
export const getFriendsUsersController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: Список пользователей, которых можно добавить в друзья
    const { friends_users } = await getFriendsUsersService({ user_id: (req as any).user.id });

    // NOTE: Отправка списка пользователей
    return res.status(200).json({ friends_users });
  } catch (error) {
    next(error);
  }
};
