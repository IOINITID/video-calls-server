import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from 'core/exeptions';
import { userUsersService, patchUserService, getUserService } from 'modules/user/services/user-services';

/**
 * Controller for getting user data.
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
 * Controller for updating user data.
 */
export const updateUserController: RequestHandler = async (req, res, next) => {
  try {
    const user = await patchUserService((req as any).user.id, req.body);

    return res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for getting users by name.
 */
export const getUsersController: RequestHandler = async (req, res, next) => {
  try {
    const users = await userUsersService(req.body.searchValue);

    return res.json(users);
  } catch (error) {
    next(error);
  }
};
