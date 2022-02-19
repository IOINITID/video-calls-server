import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from 'core/exeptions';
import {
  userAuthorizationService,
  userRefreshService,
  userRegistrationService,
  userLogoutService,
  userUsersService,
  userUserService,
} from 'modules/user/services/user-services';

/**
 * Controller for user authorization.
 */
export const userAuthorizationController: RequestHandler = async (req, res, next) => {
  try {
    const userData = await userAuthorizationService(req.body.email, req.body.password);

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.json({ accessToken: userData.accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for user authorization refresh.
 */
export const userRefreshController: RequestHandler = async (req, res, next) => {
  try {
    const userData = await userRefreshService(req.cookies.refreshToken);

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.json({ accessToken: userData.accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for user registration.
 */
export const userRegistrationController: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(ApiError.BadRequest('Ошибка при валидации.', errors.array()));
    }

    const userData = await userRegistrationService(req.body.email, req.body.name, req.body.password);

    // TODO: Разобраться с Same-Site='NONE' заголовками для установку cookie в ответе из heroku
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.json(userData);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for user logout.
 */
export const userLogoutController: RequestHandler = async (req, res, next) => {
  try {
    await userLogoutService(req.cookies.refreshToken);

    res.clearCookie('refreshToken');

    return res.end();
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for getting user data.
 */
export const userUserController: RequestHandler = async (req, res, next) => {
  try {
    const user = await userUserService((req as any).user.id);

    return res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for getting users by name.
 */
export const userUsersController: RequestHandler = async (req, res, next) => {
  try {
    const users = await userUsersService(req.body.searchValue);

    return res.json(users);
  } catch (error) {
    next(error);
  }
};
