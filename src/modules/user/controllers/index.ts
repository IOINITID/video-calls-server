import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from 'core/exeptions';
import {
  userUsersService,
  getUserService,
  getUsersService,
  updateUserService,
} from 'modules/user/services/user-services';

/**
 * Controller для получения данных пользователя.
 */
export const getUserController: RequestHandler = async (req, res, next) => {
  try {
    const user = await getUserService((req as any).user.id);

    return res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller для обновления данных пользователя.
 */
export const updateUserController: RequestHandler = async (req, res, next) => {
  try {
    const user = await updateUserService((req as any).user.id, req.body);

    return res.json(user);
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

    return res.json(users);
  } catch (error) {
    next(error);
  }
};
