import { RequestHandler } from 'express';
import { addToFriendsService, getFriendsService, removeFromFriendsService } from 'modules/friends/services';
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
