import { RequestHandler } from 'express';
import { getUserService, getUsersService, updateUserService } from 'modules/user/services/user-services';

/**
 * Controller для получения данных пользователя.
 */
export const getUserController: RequestHandler = async (req, res, next) => {
  try {
    const user = await getUserService({ userId: (req as any).user.id });

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller для обновления данных пользователя.
 */
export const updateUserController: RequestHandler = async (req, res, next) => {
  try {
    const user = await updateUserService({ userId: (req as any).user.id, userData: req.body });

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller для получения списка пользователей.
 */
export const getUsersController: RequestHandler = async (req, res, next) => {
  try {
    const users = await getUsersService();

    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
