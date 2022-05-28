import { Router } from 'express';
import { body } from 'express-validator';
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
 * Route для регистрации пользователя.
 */
authorizationRouter.post(
  '/registration',
  body('email')
    .not()
    .isEmpty()
    .withMessage('Электронный адрес должен быть заполнен.')
    .bail() // NOTE: Не проверяет дальше, если проверка этого не пройдена
    .isEmail()
    .withMessage('Электронный адрес заполнен некорректно.'),
  body('name').not().isEmpty().withMessage('Имя должно быть заполнено.'),
  body('password').isLength({ min: 8 }).withMessage('Пароль должен состоять минимум из 8 символов.'),
  registrationController
);

/**
 * Route для авторизации пользователя.
 */
authorizationRouter.post('/authorization', authorizationController);

/**
 * Route для обновления токенов.
 */
authorizationRouter.post('/refresh', refreshController);

/**
 * Route для выхода из аккаунта.
 */
authorizationRouter.get('/logout', logoutController);

export { authorizationRouter };
