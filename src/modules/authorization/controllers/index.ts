import { ApiError } from 'core/exeptions';
import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  authorizationService,
  logoutService,
  refreshService,
  registrationService,
} from '../services/authorization-services';

/**
 * Controller для регистрации пользователя.
 */
export const registrationController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: Время истечения refresh токена 30 дней
    const MAX_AGE = 30 * 24 * 60 * 60 * 1000;

    // NOTE: Данные которые ввел пользователь при регистрации
    const { email, name, password } = req.body;

    // NOTE: Результат валидации данных которые ввел пользователь при регистрации
    const errors = validationResult(req);

    // NOTE: Проверка на наличие ошибок валидации
    if (!errors.isEmpty()) {
      return next(ApiError.BadRequest('Ошибка при валидации.', errors.array()));
    }

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
 * Controller для авторизации пользователя.
 */
export const authorizationController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: Время истечения refresh токена 30 дней
    const MAX_AGE = 30 * 24 * 60 * 60 * 1000;

    // NOTE: Данные которые ввел пользователь при авторизации
    const { email, password } = req.body;

    // NOTE: Данные для авторизации, access и refresh токены.
    const { accessToken, refreshToken } = await authorizationService({ email, password });

    // TODO: Разобраться с Same-Site='NONE' заголовками для установку cookie в ответе из heroku
    res.cookie('refresh_token', refreshToken, {
      maxAge: MAX_AGE,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.status(200).json({ access_token: accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller для обновления токена.
 */
export const refreshController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: Данные refresh токена из cookies
    const { refresh_token } = req.cookies;

    // NOTE: Время истечения refresh токена 30 дней
    const MAX_AGE = 30 * 24 * 60 * 60 * 1000;

    // NOTE: Данные для авторизации, access и refresh токены.
    const { accessToken, refreshToken } = await refreshService({ refreshToken: refresh_token });

    // TODO: Разобраться с Same-Site='NONE' заголовками для установку cookie в ответе из heroku
    res.cookie('refresh_token', refreshToken, {
      maxAge: MAX_AGE,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.status(200).json({ access_token: accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller для выхода из аккаунта.
 */
export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    // NOTE: Данные refresh токена из cookies
    const { refresh_token } = req.cookies;

    // NOTE: Удаление refresh токена из БД
    await logoutService({ refreshToken: refresh_token });

    // NOTE: Удаление refresh токена из cookies
    res.clearCookie('refresh_token');

    return res.status(200).end();
  } catch (error) {
    next(error);
  }
};
