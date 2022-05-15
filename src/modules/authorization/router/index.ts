import { Router } from 'express';
import { body } from 'express-validator';
import { isAuthorizatedMiddleware } from 'core/middlewares';
import { getUsersController, getUserController, updateUserController } from 'modules/user/controllers';
import {
  authorizationController,
  logoutController,
  refreshController,
  registrationController,
} from 'modules/authorization/controllers';

/**
 * Router для модуля авторизация.
 */
const authorizationRouter = Router();

/**
 * Validation для регистрации пользователя.
 */
const registrationValidation = () => {
  body('email').isEmail();
  body('name').not().isEmpty();
  body('password').isLength({ min: 8 });
};

/**
 * Route для регистрации пользователя.
 */
authorizationRouter.post('/registration', registrationValidation, registrationController);

/**
 * Route для авторизации пользователя.
 */
authorizationRouter.post('/authorization', authorizationController);

/**
 * Route для обновления токенов.
 */
authorizationRouter.get('/refresh', refreshController);

/**
 * Route для выхода из аккаунта.
 */
authorizationRouter.get('/logout', logoutController);

export { authorizationRouter };
