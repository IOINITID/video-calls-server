import { ApiError } from 'core/exeptions';
import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { authorizationService, logoutService, refreshService, registrationService } from '../services';

/**
 * Controller for user registration.
 */
export const registrationController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: Время истечения refresh токена 30 дней
    const MAX_AGE = 30 * 24 * 60 * 60 * 1000;

    // NOTE: Результат валидации данных которые ввел пользователь при регистрации
    const errors = validationResult(req);

    // NOTE: Проверка на наличие ошибок валидации
    if (!errors.isEmpty()) {
      return next(ApiError.BadRequest('Ошибка при валидации.', errors.array()));
    }

    // NOTE: Данные которые ввел пользователь при регистрации
    const { email, name, password } = req.body;

    // NOTE: Данные для авторизации, access и refresh токены.
    const registrationData = await registrationService({ email, name, password });

    // TODO: Разобраться с Same-Site='NONE' заголовками для установку cookie в ответе из heroku
    res.cookie('refresh_token', registrationData.refreshToken, {
      maxAge: MAX_AGE,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.status(200).json({ access_token: registrationData.accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for user authorization.
 */
export const authorizationController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: Время истечения refresh токена 30 дней
    const MAX_AGE = 30 * 24 * 60 * 60 * 1000;

    const authorizationData = await authorizationService({ email: req.body.email, password: req.body.password });

    res.cookie('refresh_token', authorizationData.refreshToken, {
      maxAge: MAX_AGE,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.status(200).json({ access_token: authorizationData.accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for user authorization refresh.
 */
export const refreshController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: Время истечения refresh токена 30 дней
    const MAX_AGE = 30 * 24 * 60 * 60 * 1000;

    const authorizationData = await refreshService({ refreshToken: req.cookies.refresh_token });

    res.cookie('refresh_token', authorizationData.refreshToken, {
      maxAge: MAX_AGE,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.status(200).json({ access_token: authorizationData.accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for user logout.
 */
export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    await logoutService({ refreshToken: req.cookies.refresh_token });

    res.clearCookie('refresh_token');

    return res.status(200).end();
  } catch (error) {
    next(error);
  }
};
